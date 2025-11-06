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

export async function POST(request: Request) {
  const session = (await getServerSession(authOptions)) as Session | null;

  // Check if user is authenticated and is an admin or manager
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  if (session.user.role !== "admin" && session.user.role !== "manager") {
    return NextResponse.json(
      { error: "Nur Administratoren und Manager können Benutzer erstellen" },
      { status: 403 }
    );
  }

  try {
    const sql = neon(process.env.DATABASE_URL!);
    const { 
      username, 
      name, 
      email, 
      roles, 
      member_id, 
      team_id, 
      generatePassword, 
      customPassword,
      // Backwards compatibility
      password,
      role,
      createMemberProfile,
      teamId
    } = await request.json();

    // Support both old and new API format
    const userRoles = roles || (role ? [role] : []);
    const userPassword = generatePassword ? generateSecurePassword() : (customPassword || password);

    // Validate input
    if (!username || !name || !userPassword || userRoles.length === 0) {
      return NextResponse.json(
        { error: "Username, Name, Passwort und mindestens eine Rolle sind erforderlich" },
        { status: 400 }
      );
    }

    if (userPassword.length < 6) {
      return NextResponse.json(
        { error: "Passwort muss mindestens 6 Zeichen lang sein" },
        { status: 400 }
      );
    }

    // Validate roles
    const validRoles = ["admin", "manager", "coach", "member", "parent"];
    for (const userRole of userRoles) {
      if (!validRoles.includes(userRole)) {
        return NextResponse.json(
          { error: `Ungültige Rolle: ${userRole}` },
          { status: 400 }
        );
      }
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
    const hashedPassword = await bcrypt.hash(userPassword, 10);

    // Bestimme primäre Rolle (Admin hat Priorität, sonst erste Rolle)
    const primaryRole = userRoles.includes('admin') ? 'admin' : userRoles[0];

    // Bestimme member_id (aus Parameter oder falls Member-Profil erstellt werden soll)
    let finalMemberId = member_id || null;

    // Legacy: Wenn Member- oder Coach-Profil erstellt werden soll
    if (createMemberProfile && (userRoles.includes("member") || userRoles.includes("coach"))) {
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
      finalMemberId = memberResult[0].id;
    }

    // Create user mit Multi-Rollen Support
    const result = await sql`
      INSERT INTO users (username, name, password_hash, role, roles, email, member_id, created_at)
      VALUES (${username}, ${name}, ${hashedPassword}, ${primaryRole}, ${JSON.stringify(userRoles)}, ${email || null}, ${finalMemberId}, CURRENT_TIMESTAMP)
      RETURNING id, username, name, role, roles, email, member_id, created_at
    `;

    const userId = result[0].id;

    // Coach-Team-Zuweisung
    const finalTeamId = team_id || teamId;
    if (userRoles.includes("coach") && finalTeamId) {
      try {
        // Setze Coach für das Team (User ID als String, da coach Spalte VARCHAR ist)
        await sql`
          UPDATE teams
          SET coach = ${userId.toString()}
          WHERE id = ${parseInt(finalTeamId)}
        `;

        console.log(`Coach ${name} wurde Team ${finalTeamId} zugewiesen`);
      } catch (error) {
        console.error("Error assigning coach to team:", error);
      }
    }

    // Rückgabe mit Multi-Rollen Support
    const responseUser = {
      ...result[0],
      roles: userRoles, // Multi-Rollen für Frontend
      temporaryPassword: generatePassword ? userPassword : undefined
    };

    return NextResponse.json({
      success: true,
      message: "Benutzer erfolgreich erstellt",
      user: responseUser,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Fehler beim Erstellen des Benutzers" },
      { status: 500 }
    );
  }
}
