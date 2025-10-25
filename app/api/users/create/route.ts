import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-utils";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import type { Session } from "next-auth";

export async function POST(request: Request) {
  const session = (await getServerSession(authOptions)) as Session | null;

  // Check if user is authenticated and is an admin
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  if (session.user.role !== "admin") {
    return NextResponse.json(
      { error: "Nur Administratoren können Benutzer erstellen" },
      { status: 403 }
    );
  }

  try {
    const sql = neon(process.env.DATABASE_URL!);
    const { username, name, password, role, email, createMemberProfile } = await request.json();

    // Validate input
    if (!username || !name || !password || !role) {
      return NextResponse.json(
        { error: "Alle Felder sind erforderlich" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Passwort muss mindestens 6 Zeichen lang sein" },
        { status: 400 }
      );
    }

    // Validate role
    if (!["admin", "coach", "member", "parent"].includes(role)) {
      return NextResponse.json(
        { error: "Ungültige Rolle" },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE username = ${username}
    `;

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "Benutzername existiert bereits" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    let memberId = null;

    // Wenn Member- oder Coach-Profil erstellt werden soll
    if (createMemberProfile && (role === "member" || role === "coach")) {
      // Extrahiere Vor- und Nachname aus dem vollständigen Namen
      const nameParts = name.trim().split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ") || firstName;

      // Erstelle Member-Profil
      const memberResult = await sql`
        INSERT INTO members (first_name, last_name, email, birth_date)
        VALUES (${firstName}, ${lastName}, ${email || null}, CURRENT_DATE)
        RETURNING id
      `;
      memberId = memberResult[0].id;
    }

    // Create user
    const result = await sql`
      INSERT INTO users (username, name, password_hash, role, email, member_id)
      VALUES (${username}, ${name}, ${hashedPassword}, ${role}, ${email || null}, ${memberId})
      RETURNING id, username, name, role, member_id
    `;

    return NextResponse.json({
      message: "Benutzer erfolgreich erstellt",
      user: result[0],
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Fehler beim Erstellen des Benutzers" },
      { status: 500 }
    );
  }
}
