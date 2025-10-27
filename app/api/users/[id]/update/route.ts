import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-utils";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import type { Session } from "next-auth";

// Passwort-Generator
function generateSecurePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

interface RouteParams {
  params: {
    id: string;
  };
}

export async function PUT(request: Request, { params }: RouteParams) {
  const session = (await getServerSession(authOptions)) as Session | null;

  // Check if user is authenticated and is an admin
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  if (session.user.role !== "admin") {
    return NextResponse.json(
      { error: "Nur Administratoren können Benutzer bearbeiten" },
      { status: 403 }
    );
  }

  try {
    const sql = neon(process.env.DATABASE_URL!);
    const userId = parseInt(params.id);
    
    const { 
      name, 
      email, 
      roles, 
      member_id, 
      status,
      // accept both resetPassword and newPassword (frontend may send either)
      resetPassword,
      newPassword: newPasswordFlag
    } = await request.json();
    const shouldResetPassword = !!(resetPassword || newPasswordFlag);

    // Validate input
    if (!name || !roles || roles.length === 0) {
      return NextResponse.json(
        { error: "Name und mindestens eine Rolle sind erforderlich" },
        { status: 400 }
      );
    }

    // Validate roles
    const validRoles = ["admin", "coach", "member", "parent"];
    for (const role of roles) {
      if (!validRoles.includes(role)) {
        return NextResponse.json(
          { error: `Ungültige Rolle: ${role}` },
          { status: 400 }
        );
      }
    }

    // Check if user exists
    const existingUser = await sql`
      SELECT id, username FROM users WHERE id = ${userId}
    `;

    if (existingUser.length === 0) {
      return NextResponse.json(
        { error: "Benutzer nicht gefunden" },
        { status: 404 }
      );
    }

    // Bestimme primäre Rolle (Admin hat Priorität, sonst erste Rolle)
    const primaryRole = roles.includes('admin') ? 'admin' : roles[0];

    // Passwort zurücksetzen falls gewünscht
    let newPassword = null;
    let updateFields: any = {
      name,
      email: email || null,
      role: primaryRole,
      member_id: member_id || null,
      updated_at: new Date().toISOString()
    };

    if (shouldResetPassword) {
      newPassword = generateSecurePassword();
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateFields.password_hash = hashedPassword;
    }

    // Update user
    const result = await sql`
      UPDATE users 
      SET 
        name = ${updateFields.name},
        email = ${updateFields.email},
        role = ${updateFields.role},
        member_id = ${updateFields.member_id},
        updated_at = CURRENT_TIMESTAMP
        ${resetPassword ? sql`, password_hash = ${updateFields.password_hash}` : sql``}
      WHERE id = ${userId}
      RETURNING id, username, name, email, role, member_id, created_at, updated_at
    `;

    // Rückgabe mit Multi-Rollen Support
    const responseUser = {
      ...result[0],
      roles: roles, // Multi-Rollen für Frontend
      status: status || 'active',
      newPassword: resetPassword ? newPassword : undefined
    };

    return NextResponse.json({
      success: true,
      message: "Benutzer erfolgreich aktualisiert",
      user: responseUser,
    });

  } catch (error) {
    console.error("Fehler beim Aktualisieren des Benutzers:", error);
    return NextResponse.json(
      { error: "Fehler beim Aktualisieren des Benutzers" },
      { status: 500 }
    );
  }
}