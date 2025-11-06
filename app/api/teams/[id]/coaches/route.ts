import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { requireRole } from "@/lib/auth-utils";

const sql = neon(process.env.DATABASE_URL!);

// GET /api/teams/[id]/coaches - Get all coaches for a team
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireRole(["admin", "coach"]);
    const teamId = parseInt(params.id);

    if (isNaN(teamId)) {
      return NextResponse.json(
        { error: "Invalid team ID" },
        { status: 400 }
      );
    }

    // Get team with coaches
    const teamCoaches = await sql`
      SELECT 
        t.id as team_id,
        t.name as team_name,
        t.level as team_level,
        tc.coach_id,
        tc.role as coach_role,
        tc.is_primary,
        u.name as coach_name,
        u.email as coach_email
      FROM teams t
      LEFT JOIN team_coaches tc ON t.id = tc.team_id
      LEFT JOIN users u ON tc.coach_id = u.id AND u.role IN ('coach', 'admin')
      WHERE t.id = ${teamId}
      ORDER BY tc.is_primary DESC, u.name
    `;

    if (teamCoaches.length === 0) {
      return NextResponse.json(
        { error: "Team not found" },
        { status: 404 }
      );
    }

    // Structure the response
    const team = {
      id: teamCoaches[0].team_id,
      name: teamCoaches[0].team_name,
      level: teamCoaches[0].team_level,
      coaches: teamCoaches
        .filter(tc => tc.coach_id !== null)
        .map(tc => ({
          coach_id: tc.coach_id,
          coach_name: tc.coach_name,
          coach_email: tc.coach_email,
          coach_role: tc.coach_role,
          is_primary: tc.is_primary,
        })),
    };

    return NextResponse.json({ team });
  } catch (error) {
    console.error("Error fetching team coaches:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/teams/[id]/coaches - Update coaches for a team
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireRole(["admin"]);
    const teamId = parseInt(params.id);
    const { coaches } = await request.json();

    if (isNaN(teamId)) {
      return NextResponse.json(
        { error: "Invalid team ID" },
        { status: 400 }
      );
    }

    if (!Array.isArray(coaches)) {
      return NextResponse.json(
        { error: "Coaches must be an array" },
        { status: 400 }
      );
    }

    // Validate that at most one coach is primary
    const primaryCoaches = coaches.filter(c => c.is_primary);
    if (primaryCoaches.length > 1) {
      return NextResponse.json(
        { error: "Only one primary coach is allowed" },
        { status: 400 }
      );
    }

    // Validate that all coach IDs exist and are actually coaches
    const coachIds = coaches.map(c => c.coach_id);
    if (coachIds.length > 0) {
      const validCoaches = await sql`
        SELECT id FROM users 
        WHERE id = ANY(${coachIds}) 
        AND role IN ('coach', 'admin')
        AND active = true
      `;

      if (validCoaches.length !== coachIds.length) {
        return NextResponse.json(
          { error: "One or more invalid coach IDs" },
          { status: 400 }
        );
      }
    }

    // Update coaches using sequential operations (Neon doesn't support complex transactions)
    try {
      // Remove all existing coach assignments for this team
      await sql`DELETE FROM team_coaches WHERE team_id = ${teamId}`;

      // Add new coach assignments
      if (coaches.length > 0) {
        for (const coach of coaches) {
          await sql`
            INSERT INTO team_coaches (team_id, coach_id, role, is_primary)
            VALUES (${teamId}, ${coach.coach_id}, ${coach.coach_role}, ${coach.is_primary})
          `;
        }
      }

      // Update teams.coach for backwards compatibility (set to primary coach as string)
      const primaryCoach = coaches.find(c => c.is_primary);
      if (primaryCoach) {
        await sql`
          UPDATE teams 
          SET coach = ${primaryCoach.coach_id.toString()}
          WHERE id = ${teamId}
        `;
      } else {
        await sql`
          UPDATE teams 
          SET coach = NULL
          WHERE id = ${teamId}
        `;
      }
    } catch (error) {
      console.error("Error updating team coaches:", error);
      throw new Error("Failed to update team coaches");
    }

    // Return updated team data
    const updatedTeamCoaches = await sql`
      SELECT 
        t.id as team_id,
        t.name as team_name,
        t.level as team_level,
        tc.coach_id,
        tc.role as coach_role,
        tc.is_primary,
        u.name as coach_name,
        u.email as coach_email
      FROM teams t
      LEFT JOIN team_coaches tc ON t.id = tc.team_id
      LEFT JOIN users u ON tc.coach_id = u.id AND u.role IN ('coach', 'admin')
      WHERE t.id = ${teamId}
      ORDER BY tc.is_primary DESC, u.name
    `;

    const updatedTeam = {
      id: updatedTeamCoaches[0].team_id,
      name: updatedTeamCoaches[0].team_name,
      level: updatedTeamCoaches[0].team_level,
      coaches: updatedTeamCoaches
        .filter(tc => tc.coach_id !== null)
        .map(tc => ({
          coach_id: tc.coach_id,
          coach_name: tc.coach_name,
          coach_email: tc.coach_email,
          coach_role: tc.coach_role,
          is_primary: tc.is_primary,
        })),
    };

    return NextResponse.json({
      success: true,
      message: "Coach-Zuweisungen wurden aktualisiert",
      team: updatedTeam,
    });
  } catch (error) {
    console.error("Error updating team coaches:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/teams/[id]/coaches - Add a single coach to a team
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireRole(["admin"]);
    const teamId = parseInt(params.id);
    const { coach_id, role = 'coach', is_primary = false } = await request.json();

    if (isNaN(teamId)) {
      return NextResponse.json(
        { error: "Invalid team ID" },
        { status: 400 }
      );
    }

    if (!coach_id) {
      return NextResponse.json(
        { error: "Coach ID is required" },
        { status: 400 }
      );
    }

    // Validate coach exists and is a coach/admin
    const coach = await sql`
      SELECT id, name, email FROM users 
      WHERE id = ${coach_id} 
      AND role IN ('coach', 'admin')
      AND active = true
    `;

    if (coach.length === 0) {
      return NextResponse.json(
        { error: "Invalid coach ID" },
        { status: 400 }
      );
    }

    // Check if coach is already assigned to this team
    const existingAssignment = await sql`
      SELECT id FROM team_coaches 
      WHERE team_id = ${teamId} AND coach_id = ${coach_id}
    `;

    if (existingAssignment.length > 0) {
      return NextResponse.json(
        { error: "Coach is already assigned to this team" },
        { status: 400 }
      );
    }

    // If setting as primary, unset other primary coaches
    if (is_primary) {
      await sql`
        UPDATE team_coaches 
        SET is_primary = false 
        WHERE team_id = ${teamId} AND is_primary = true
      `;
    }

    // Add the coach assignment
    await sql`
      INSERT INTO team_coaches (team_id, coach_id, role, is_primary)
      VALUES (${teamId}, ${coach_id}, ${role}, ${is_primary})
    `;

    // Update teams.coach if this is the primary coach (coach column is VARCHAR)
    if (is_primary) {
      await sql`
        UPDATE teams 
        SET coach = ${coach_id.toString()}
        WHERE id = ${teamId}
      `;
    }

    return NextResponse.json({
      success: true,
      message: `${coach[0].name} wurde als Coach hinzugefügt`,
    });
  } catch (error) {
    console.error("Error adding coach to team:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}