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
    if (!session || session.user.role !== "admin") {
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
    if (!data.name || !data.username || !data.role) {
      return NextResponse.json(
        { error: "Name, Benutzername und Rolle sind erforderlich" },
        { status: 400 }
      );
    }

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
    
    if (data.newPassword) {
      // Mit neuem Passwort
      const hashedPassword = await bcrypt.hash(data.newPassword, 10);
      updateQuery = sql`
        UPDATE users
        SET 
          name = ${data.name},
          username = ${data.username},
          email = ${data.email || null},
          role = ${data.role},
          member_id = ${data.member_id || null},
          password_hash = ${hashedPassword},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${userId}
        RETURNING id, name, username, email, role, member_id
      `;
    } else {
      // Ohne Passwort-Änderung
      updateQuery = sql`
        UPDATE users
        SET 
          name = ${data.name},
          username = ${data.username},
          email = ${data.email || null},
          role = ${data.role},
          member_id = ${data.member_id || null},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${userId}
        RETURNING id, name, username, email, role, member_id
      `;
    }

    const result = await updateQuery;

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Benutzer nicht gefunden" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: result[0],
      message: "Benutzer erfolgreich aktualisiert",
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
    if (!session || session.user.role !== "admin") {
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
    const user = await sql`SELECT id, member_id FROM users WHERE id = ${userId}`;
    if (user.length === 0) {
      return NextResponse.json(
        { error: "Benutzer nicht gefunden" },
        { status: 404 }
      );
    }

    console.log(`Deleting user ${userId}...`);
    
    // Lösche alle abhängigen Daten systematisch
    try {
      // 1. Lösche Training Attendance falls der User ein verknüpftes Member hat
      if (user[0].member_id) {
        const deletedAttendance = await sql`DELETE FROM training_attendance WHERE member_id = ${user[0].member_id} RETURNING id`;
        console.log(`Deleted ${deletedAttendance.length} training attendance records`);
        
        // 2. Lösche Event Participants falls der User ein verknüpftes Member hat  
        const deletedParticipants = await sql`DELETE FROM event_participants WHERE member_id = ${user[0].member_id} RETURNING id`;
        console.log(`Deleted ${deletedParticipants.length} event participant records`);
      }
      
      // 3. Lösche Kommentare des Benutzers
      const deletedComments = await sql`DELETE FROM comments WHERE author_id = ${userId} RETURNING id`;
      console.log(`Deleted ${deletedComments.length} comments`);
      
      // 4. Lösche Calendar Events des Benutzers
      const deletedCalendarEvents = await sql`DELETE FROM calendar_events WHERE created_by = ${userId} RETURNING id`;
      console.log(`Deleted ${deletedCalendarEvents.length} calendar events`);
      
      // 5. Lösche Eltern-Kind-Beziehungen
      const deletedRelations = await sql`DELETE FROM parent_children WHERE parent_user_id = ${userId} RETURNING id`;
      console.log(`Deleted ${deletedRelations.length} parent_children relations`);
      
      // 6. Lösche das verknüpfte Member falls vorhanden (optional, je nach Business Logic)
      // VORSICHT: Das könnte ungewünscht sein wenn das Member unabhängig existieren soll
      // if (user[0].member_id) {
      //   const deletedMember = await sql`DELETE FROM members WHERE id = ${user[0].member_id} RETURNING id`;
      //   console.log(`Deleted ${deletedMember.length} linked member`);
      // }
      
      // 7. Lösche den Benutzer
      const deletedUser = await sql`DELETE FROM users WHERE id = ${userId} RETURNING id`;
      console.log(`Deleted ${deletedUser.length} user`);

      if (deletedUser.length === 0) {
        return NextResponse.json(
          { error: "Benutzer konnte nicht gelöscht werden" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Benutzer und alle verknüpften Daten erfolgreich gelöscht",
      });
      
    } catch (deleteError) {
      console.error("Error during cascading delete:", deleteError);
      throw new Error(`Fehler beim Löschen der verknüpften Daten: ${deleteError instanceof Error ? deleteError.message : 'Unbekannter Fehler'}`);
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
