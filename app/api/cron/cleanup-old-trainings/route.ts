import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// This endpoint should be called by a cron job (e.g., Vercel Cron)
// It deletes trainings and their attendance records that are more than 1 day old
export async function GET(request: Request) {
  try {
    // Verify the request is coming from Vercel Cron or has the correct secret
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.warn("❌ Unauthorized cron job attempt");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const sql = neon(process.env.DATABASE_URL!);

    // Calculate the cutoff date (1 day ago from today)
    // For example: If today is Nov 8, delete trainings from Nov 6 and earlier
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 1);
    const cutoffDateString = cutoffDate.toISOString().split('T')[0]; // YYYY-MM-DD

    console.log(`🧹 Starting cleanup for trainings older than ${cutoffDateString}`);

    // Step 1: Get the IDs of trainings to be deleted (for logging)
    const trainingsToDelete = await sql`
      SELECT id, team_id, training_date, start_time
      FROM trainings
      WHERE training_date < ${cutoffDateString}
    `;

    if (trainingsToDelete.length === 0) {
      console.log("✅ No old trainings to delete");
      return NextResponse.json({
        success: true,
        message: "No old trainings to delete",
        deleted: {
          trainings: 0,
          attendance: 0
        }
      });
    }

    const trainingIds = trainingsToDelete.map(t => t.id);
    console.log(`📋 Found ${trainingsToDelete.length} trainings to delete:`, trainingsToDelete);

    // Step 2: Delete attendance records for these trainings
    const deletedAttendance = await sql`
      DELETE FROM training_attendance
      WHERE training_id = ANY(${trainingIds})
      RETURNING id
    `;

    console.log(`🗑️  Deleted ${deletedAttendance.length} attendance records`);

    // Step 3: Delete the trainings themselves
    const deletedTrainings = await sql`
      DELETE FROM trainings
      WHERE training_date < ${cutoffDateString}
      RETURNING id, training_date
    `;

    console.log(`🗑️  Deleted ${deletedTrainings.length} trainings`);

    const result = {
      success: true,
      message: `Cleanup completed successfully`,
      cutoffDate: cutoffDateString,
      deleted: {
        trainings: deletedTrainings.length,
        attendance: deletedAttendance.length
      },
      deletedTrainingDates: deletedTrainings.map(t => t.training_date)
    };

    console.log("✅ Cleanup completed:", result);

    return NextResponse.json(result);

  } catch (error) {
    console.error("❌ Error during cleanup:", error);
    return NextResponse.json(
      { 
        error: "Cleanup failed", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}

// Allow POST as well (for manual triggering)
export async function POST(request: Request) {
  return GET(request);
}
