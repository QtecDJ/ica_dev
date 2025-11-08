import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-utils";

const sql = neon(process.env.DATABASE_URL!);

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has coach, admin, or manager role (multi-role support)
    const userRoles = (session.user as any).roles || [(session.user as any).role];
    const hasCoachAccess = userRoles.includes("coach") || userRoles.includes("admin") || userRoles.includes("manager");
    
    if (!hasCoachAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    const isCoach = userRoles.includes("coach");

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const teamIdsParam = searchParams.get("teamIds");

    if (!status || !teamIdsParam) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const teamIds = teamIdsParam.split(",");

    console.log("🔍 API Request:", { status, teamIds, userRoles, userId: session.user.id });

    // Verify coach has access to these teams (skip check for admin/manager)
    if (isCoach && !userRoles.includes("admin") && !userRoles.includes("manager")) {
      const coachTeams = await sql`
        SELECT team_id 
        FROM team_coaches 
        WHERE coach_id = ${session.user.id}
      `;
      
      console.log("👔 Coach teams:", coachTeams);
      
      const coachTeamIds = coachTeams.map((t: any) => String(t.team_id));
      const hasAccess = teamIds.every(id => coachTeamIds.includes(id));
      
      console.log("🔐 Access check:", { teamIds, coachTeamIds, hasAccess });
      
      if (!hasAccess) {
        return NextResponse.json({ error: "Forbidden - No access to these teams" }, { status: 403 });
      }
    }

    // Get ALL upcoming trainings for these teams (not just next one)
    const upcomingTrainings = await sql`
      SELECT id, team_id, training_date, start_time
      FROM trainings 
      WHERE team_id = ANY(${teamIds})
        AND training_date >= CURRENT_DATE
      ORDER BY training_date ASC, start_time ASC
    `;

    console.log("📅 Upcoming trainings:", upcomingTrainings);

    if (upcomingTrainings.length === 0) {
      console.log("⚠️ No upcoming trainings found");
      return NextResponse.json({ members: [] });
    }

    const trainingIds = upcomingTrainings.map((t: any) => t.id);

    // Get members with the specified status for these trainings
    const members = await sql`
      SELECT 
        m.id as member_id,
        m.first_name,
        m.last_name,
        tm.name as team_name,
        t.training_date,
        t.start_time,
        t.end_time,
        t.location,
        ta.status,
        ta.decline_reason,
        ta.updated_at
      FROM training_attendance ta
      JOIN members m ON ta.member_id = m.id
      JOIN trainings t ON ta.training_id = t.id
      LEFT JOIN teams tm ON m.team_id = tm.id
      WHERE ta.training_id = ANY(${trainingIds})
        AND ta.status = ${status}
        AND m.team_id = ANY(${teamIds})
      ORDER BY t.training_date ASC, t.start_time ASC, tm.name ASC, m.last_name ASC, m.first_name ASC
    `;

    console.log(`👥 Found ${members.length} members with status ${status}`);

    return NextResponse.json({ members });
  } catch (error) {
    console.error("Error fetching team attendance:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
