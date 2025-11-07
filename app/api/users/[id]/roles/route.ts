import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-utils";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Only admins can change roles
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Keine Berechtigung" },
        { status: 403 }
      );
    }

    const { roles } = await request.json();
    const userId = parseInt(params.id);

    // Validate roles
    const validRoles = ['admin', 'manager', 'coach', 'parent', 'member'];
    if (!Array.isArray(roles) || roles.length === 0) {
      return NextResponse.json(
        { success: false, error: "Mindestens eine Rolle erforderlich" },
        { status: 400 }
      );
    }

    if (!roles.every(role => validRoles.includes(role))) {
      return NextResponse.json(
        { success: false, error: "Ungültige Rolle(n)" },
        { status: 400 }
      );
    }

    // Determine primary role (highest priority)
    let primaryRole = 'member';
    if (roles.includes('admin')) primaryRole = 'admin';
    else if (roles.includes('manager')) primaryRole = 'manager';
    else if (roles.includes('coach')) primaryRole = 'coach';
    else if (roles.includes('parent')) primaryRole = 'parent';

    // Update both role and roles fields
    await sql`
      UPDATE users
      SET 
        role = ${primaryRole},
        roles = ${JSON.stringify(roles)}::jsonb,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${userId}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating user roles:", error);
    return NextResponse.json(
      { success: false, error: "Serverfehler" },
      { status: 500 }
    );
  }
}
