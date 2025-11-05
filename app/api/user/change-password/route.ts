import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Nicht authentifiziert" },
        { status: 401 }
      );
    }

    const { userId, currentPassword, newPassword } = await request.json();

    // Verify user can only change their own password (unless admin)
    if (session.user.id !== userId && session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Keine Berechtigung" },
        { status: 403 }
      );
    }

    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Alle Felder müssen ausgefüllt sein" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Das neue Passwort muss mindestens 8 Zeichen lang sein" },
        { status: 400 }
      );
    }

    // Get current password hash
    const user = await sql`
      SELECT password_hash 
      FROM users 
      WHERE id = ${userId}
    `;

    if (user.length === 0) {
      return NextResponse.json(
        { error: "Benutzer nicht gefunden" },
        { status: 404 }
      );
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user[0].password_hash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Das aktuelle Passwort ist falsch" },
        { status: 400 }
      );
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await sql`
      UPDATE users 
      SET password_hash = ${newPasswordHash},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${userId}
    `;

    return NextResponse.json(
      { success: true, message: "Passwort erfolgreich geändert" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Password change error:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}
