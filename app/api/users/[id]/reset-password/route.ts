import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-utils";
import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import bcrypt from "bcryptjs";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = (await getServerSession(authOptions)) as Session | null;

  // Check if user is authenticated and is an admin
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  if (session.user.role !== "admin") {
    return NextResponse.json(
      { error: "Nur Administratoren können Passwörter zurücksetzen" },
      { status: 403 }
    );
  }

  try {
    const sql = neon(process.env.DATABASE_URL!);
    const userId = parseInt(params.id);

    // Prüfe ob User existiert
    const existingUsers = await sql`
      SELECT id, username FROM users WHERE id = ${userId}
    `;

    if (existingUsers.length === 0) {
      return NextResponse.json(
        { error: "Benutzer nicht gefunden" },
        { status: 404 }
      );
    }

    // Generiere neues sicheres Passwort
    const generateSecurePassword = (): string => {
      const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const lowercase = 'abcdefghijklmnopqrstuvwxyz';
      const numbers = '0123456789';
      const symbols = '!@#$%^&*';
      
      const getRandomChar = (chars: string) => 
        chars.charAt(Math.floor(Math.random() * chars.length));
      
      // Mindestens 1 von jedem Typ
      let password = getRandomChar(uppercase) + 
                    getRandomChar(lowercase) + 
                    getRandomChar(numbers) + 
                    getRandomChar(symbols);
      
      // Fülle auf 12 Zeichen auf
      const allChars = uppercase + lowercase + numbers + symbols;
      for (let i = password.length; i < 12; i++) {
        password += getRandomChar(allChars);
      }
      
      // Mische das Passwort
      return password.split('').sort(() => Math.random() - 0.5).join('');
    };

    const newPassword = generateSecurePassword();
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password
    await sql`
      UPDATE users 
      SET password_hash = ${hashedPassword}, updated_at = NOW()
      WHERE id = ${userId}
    `;

    return NextResponse.json({
      message: "Passwort erfolgreich zurückgesetzt",
      newPassword: newPassword,
      userId: userId
    });

  } catch (error) {
    console.error("Fehler beim Passwort-Reset:", error);
    return NextResponse.json(
      { error: "Fehler beim Zurücksetzen des Passworts" },
      { status: 500 }
    );
  }
}