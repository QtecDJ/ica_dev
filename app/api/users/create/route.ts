import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-utils";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import type { Session } from "next-auth";

const sql = neon(process.env.DATABASE_URL!);

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
    const { username, name, password, role } = await request.json();

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

    // Create user
    const result = await sql`
      INSERT INTO users (username, name, password_hash, role)
      VALUES (${username}, ${name}, ${hashedPassword}, ${role})
      RETURNING id, username, name, role
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
