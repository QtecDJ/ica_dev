import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { auth } from "@/auth";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user.role;
    
    // Only coaches and admins can access this
    if (userRole !== "coach" && userRole !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const teamIdsParam = searchParams.get("teamIds");

    if (!status || !teamIdsParam) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const teamIds = teamIdsParam.split(",");

    // Verify coach has access to these teams
    if (userRole === "coach") {
      const coachTeams = await sql`
        SELECT team_id 
        FROM team_coaches 
        WHERE coach_id = ${session.user.id}
      `;
      
      const coachTeamIds = coachTeams.map((t: any) => t.team_id);
      const hasAccess = teamIds.every(id => coachTeamIds.includes(id));
      
      if (!hasAccess) {
        return NextResponse.json({ error: "Forbidden - No access to these teams" }, { status: 403 });
      }
    }

    // Get the next upcoming trainings for these teams
    const nextTrainings = await sql`
      SELECT DISTINCT ON (team_id) id, team_id
      FROM trainings 
      WHERE team_id = ANY(${teamIds})
        AND training_date >= CURRENT_DATE
      ORDER BY team_id, training_date ASC, start_time ASC
    `;

    if (nextTrainings.length === 0) {
      return NextResponse.json({ members: [] });
    }

    const trainingIds = nextTrainings.map((t: any) => t.id);

    // Get members with the specified status for these trainings
    const members = await sql`
      SELECT 
        m.id as member_id,
        m.first_name,
        m.last_name,
        tm.name as team_name,
        ta.status,
        ta.decline_reason
      FROM training_attendance ta
      JOIN members m ON ta.member_id = m.id
      JOIN trainings t ON ta.training_id = t.id
      LEFT JOIN teams tm ON m.team_id = tm.id
      WHERE ta.training_id = ANY(${trainingIds})
        AND ta.status = ${status}
        AND m.team_id = ANY(${teamIds})
      ORDER BY tm.name ASC, m.last_name ASC, m.first_name ASC
    `;

    return NextResponse.json({ members });
  } catch (error) {
    console.error("Error fetching team attendance:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
