import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-utils";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has admin or manager role (multi-role support)
    const userRoles = (session.user as any).roles || [(session.user as any).role];
    const hasAdminAccess = userRoles.includes("admin") || userRoles.includes("manager");
    
    if (!hasAdminAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    if (!status) {
      return NextResponse.json({ error: "Missing status parameter" }, { status: 400 });
    }

    // Get ALL upcoming trainings with attendance
    const attendanceData = await sql`
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
      LEFT JOIN teams tm ON t.team_id = tm.id
      WHERE ta.status = ${status}
        AND t.training_date >= CURRENT_DATE
      ORDER BY t.training_date ASC, t.start_time ASC, tm.name ASC, m.last_name ASC, m.first_name ASC
    `;

    return NextResponse.json({ attendance: attendanceData });
  } catch (error) {
    console.error("Error fetching training attendance:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
