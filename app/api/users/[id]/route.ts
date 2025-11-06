import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-utils";
import bcrypt from "bcryptjs";

// PATCH - Benutzer aktualisieren
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "admin" && session.user.role !== "manager")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.DATABASE_URL) {
      console.error("DATABASE_URL not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const sql = neon(process.env.DATABASE_URL);
    const userId = parseInt(params.id);

    if (!userId || isNaN(userId)) {
      return NextResponse.json(
        { error: "Ungültige Benutzer-ID" },
        { status: 400 }
      );
    }
    const data = await request.json();

    // Validierung
    if (!data.name || !data.username || (!data.role && (!data.roles || data.roles.length === 0))) {
      return NextResponse.json(
        { error: "Name, Benutzername und mindestens eine Rolle sind erforderlich" },
        { status: 400 }
      );
    }

    // Verarbeite Rollen - unterstütze sowohl einzelne Rolle als auch Multi-Rollen
    const roles = data.roles && Array.isArray(data.roles) ? data.roles : [data.role];
    const primaryRole = roles[0]; // Erste Rolle wird als Hauptrolle verwendet

    // Prüfe ob username bereits existiert (außer bei aktuellem Benutzer)
    const existingUser = await sql`
      SELECT id FROM users WHERE username = ${data.username} AND id != ${userId}
    `;
    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "Dieser Benutzername wird bereits verwendet" },
        { status: 400 }
      );
    }

    // Update Query vorbereiten
    let updateQuery;
    let newPassword = null;
    
    if (data.newPassword) {
      // Neues temporäres Passwort generieren
      newPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateQuery = sql`
        UPDATE users
        SET 
          name = ${data.name},
          username = ${data.username},
          email = ${data.email || null},
          role = ${primaryRole},
          roles = ${JSON.stringify(roles)},
          member_id = ${data.member_id || null},
          password_hash = ${hashedPassword},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${userId}
        RETURNING id, name, username, email, role, roles, member_id
      `;
    } else {
      // Ohne Passwort-Änderung
      updateQuery = sql`
        UPDATE users
        SET 
          name = ${data.name},
          username = ${data.username},
          email = ${data.email || null},
          role = ${primaryRole},
          roles = ${JSON.stringify(roles)},
          member_id = ${data.member_id || null},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${userId}
        RETURNING id, name, username, email, role, roles, member_id
      `;
    }

    const result = await updateQuery;

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Benutzer nicht gefunden" },
        { status: 404 }
      );
    }

    // Coach-Team-Zuweisung aktualisieren
    if (roles.includes("coach") && data.teamId) {
      try {
        const teamId = parseInt(data.teamId);
        
        // Entferne alte Coach-Zuweisung von diesem Team (coach Spalte ist VARCHAR, also String)
        await sql`
          UPDATE teams 
          SET coach = NULL 
          WHERE coach = ${userId.toString()}
        `;
        
        // Setze neuen Coach (User ID als String)
        await sql`
          UPDATE teams
          SET coach = ${userId.toString()}
          WHERE id = ${teamId}
        `;
      } catch (error) {
        console.error("Error updating coach team assignment:", error);
      }
    }

    return NextResponse.json({
      success: true,
      user: result[0],
      newPassword: newPassword, // Neues Passwort falls generiert
      message: newPassword 
        ? "Benutzer erfolgreich aktualisiert. Neues Passwort wurde generiert."
        : "Benutzer erfolgreich aktualisiert",
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Fehler beim Aktualisieren des Benutzers" },
      { status: 500 }
    );
  }
}

// DELETE - Benutzer löschen
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "admin" && session.user.role !== "manager")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.DATABASE_URL) {
      console.error("DATABASE_URL not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const sql = neon(process.env.DATABASE_URL);
    const userId = parseInt(params.id);

    if (!userId || isNaN(userId)) {
      return NextResponse.json(
        { error: "Ungültige Benutzer-ID" },
        { status: 400 }
      );
    }

    // Verhindere das Löschen des eigenen Accounts
    const currentUserId = session.user?.id ? parseInt(session.user.id) : null;
    if (currentUserId && currentUserId === userId) {
      return NextResponse.json(
        { error: "Du kannst deinen eigenen Account nicht löschen" },
        { status: 400 }
      );
    }

    // Prüfe ob Benutzer existiert
    const user = await sql`SELECT id, username, role, member_id FROM users WHERE id = ${userId}`;
    if (user.length === 0) {
      return NextResponse.json(
        { error: "Benutzer nicht gefunden" },
        { status: 404 }
      );
    }

    const userToDelete = user[0];
    console.log(`Attempting to delete user: ${userToDelete.username} (ID: ${userId})`);

    // Verhindere das Löschen des letzten Admins
    if (userToDelete.role === 'admin') {
      const adminCount = await sql`SELECT COUNT(*) as count FROM users WHERE role = 'admin'`;
      if (adminCount[0].count <= 1) {
        return NextResponse.json(
          { error: "Der letzte Administrator kann nicht gelöscht werden" },
          { status: 400 }
        );
      }
    }

    // Vereinfachtes Löschen - nur der Benutzer selbst
    try {
      console.log("Starting deletion process...");

      // 1. Lösche parent_children Beziehungen wo dieser User Parent ist
      try {
        const deletedParentRelations = await sql`
          DELETE FROM parent_children WHERE parent_user_id = ${userId}
        `;
        console.log(`Deleted ${deletedParentRelations.length} parent-child relations`);
      } catch (err) {
        console.log("No parent_children table or no relations found:", err);
      }

      // 2. Lösche Kommentare des Benutzers (falls Tabelle existiert)
      try {
        const deletedComments = await sql`
          DELETE FROM comments WHERE author_id = ${userId}
        `;
        console.log(`Deleted ${deletedComments.length} comments`);
      } catch (err) {
        console.log("No comments table or no comments found:", err);
      }

      // 3. Lösche training_attendance falls member_id verknüpft ist
      if (userToDelete.member_id) {
        try {
          const deletedAttendance = await sql`
            DELETE FROM training_attendance WHERE member_id = ${userToDelete.member_id}
          `;
          console.log(`Deleted ${deletedAttendance.length} training attendance records`);
        } catch (err) {
          console.log("No training_attendance table or no records found:", err);
        }
      }

      // 4. Lösche team_coaches Zuweisungen
      try {
        const deletedCoachAssignments = await sql`
          DELETE FROM team_coaches WHERE coach_id = ${userId}
        `;
        console.log(`Deleted ${deletedCoachAssignments.length} coach assignments`);
      } catch (err) {
        console.log("No team_coaches table or no assignments found:", err);
      }

      // 5. Update teams coach to NULL if this user is a coach (coach column is VARCHAR)
      try {
        const updatedTeams = await sql`
          UPDATE teams SET coach = NULL WHERE coach = ${userId.toString()}
        `;
        console.log(`Updated ${updatedTeams.length} teams to remove coach reference`);
      } catch (err) {
        console.log("No teams table or no coach assignments found:", err);
      }

      // 6. Lösche den Benutzer selbst
      console.log(`Attempting to delete user ${userId}...`);
      const deletedUser = await sql`
        DELETE FROM users WHERE id = ${userId} RETURNING id, username
      `;
      
      if (deletedUser.length === 0) {
        throw new Error("User deletion failed - no rows affected");
      }

      console.log(`Successfully deleted user: ${deletedUser[0]?.username}`);

      return NextResponse.json({
        success: true,
        message: `Benutzer ${userToDelete.username} wurde erfolgreich gelöscht`,
        deletedUserId: userId,
        deletedUsername: deletedUser[0]?.username
      });

    } catch (deleteError) {
      console.error("Error during deletion:", deleteError);
      
      // Detaillierte Fehleranalyse
      if (deleteError instanceof Error) {
        if (deleteError.message.includes('foreign key')) {
          return NextResponse.json(
            { error: "Benutzer kann nicht gelöscht werden - es existieren noch verknüpfte Daten. Bitte kontaktieren Sie den Administrator." },
            { status: 400 }
          );
        }
        if (deleteError.message.includes('constraint')) {
          return NextResponse.json(
            { error: "Datenbank-Constraint verhindert das Löschen. Überprüfen Sie verknüpfte Daten." },
            { status: 400 }
          );
        }
      }
      
      throw deleteError;
    }
    
  } catch (error) {
    console.error("Error deleting user:", error);
    const errorMessage = error instanceof Error ? error.message : "Unbekannter Fehler";
    return NextResponse.json(
      { error: `Fehler beim Löschen des Benutzers: ${errorMessage}` },
      { status: 500 }
    );
  }
}
