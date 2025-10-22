import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: Request) {
  try {
    const { name, email, password, role } = await request.json();

    // Validate input
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Alle Felder sind erforderlich" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "E-Mail-Adresse wird bereits verwendet" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await sql`
      INSERT INTO users (email, password_hash, name, role)
      VALUES (${email}, ${hashedPassword}, ${name}, ${role})
      RETURNING id, email, name, role
    `;

    return NextResponse.json({
      message: "Benutzer erfolgreich erstellt",
      user: result[0],
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Fehler bei der Registrierung" },
      { status: 500 }
    );
  }
}
