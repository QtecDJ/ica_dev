import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";

// PATCH - Benutzer aktualisieren
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sql = neon(process.env.DATABASE_URL!);
    const userId = parseInt(params.id);
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
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sql = neon(process.env.DATABASE_URL!);
    const userId = parseInt(params.id);

    // Verhindere das Löschen des eigenen Accounts
    if (session.user.id === userId.toString()) {
      return NextResponse.json(
        { error: "Du kannst deinen eigenen Account nicht löschen" },
        { status: 400 }
      );
    }

    // Prüfe ob Benutzer existiert
    const user = await sql`SELECT id FROM users WHERE id = ${userId}`;
    if (user.length === 0) {
      return NextResponse.json(
        { error: "Benutzer nicht gefunden" },
        { status: 404 }
      );
    }

    // Lösche abhängige Einträge in der richtigen Reihenfolge
    // 1. Lösche Kommentare des Benutzers
    await sql`DELETE FROM comments WHERE author_id = ${userId}`;
    
    // 2. Lösche Eltern-Kind-Beziehungen
    await sql`DELETE FROM parent_children WHERE parent_user_id = ${userId}`;
    
    // 3. Lösche den Benutzer
    await sql`DELETE FROM users WHERE id = ${userId}`;

    return NextResponse.json({
      success: true,
      message: "Benutzer erfolgreich gelöscht",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Fehler beim Löschen des Benutzers" },
      { status: 500 }
    );
  }
}
