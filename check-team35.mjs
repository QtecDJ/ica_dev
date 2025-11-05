import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL);

async function checkTeam35() {
  console.log("🔍 Checking Team 35 data...\n");
  
  // Check upcoming trainings for team 35
  const trainings = await sql`
    SELECT id, training_date, start_time, team_id
    FROM trainings
    WHERE team_id = 35
      AND training_date >= CURRENT_DATE
    ORDER BY training_date ASC, start_time ASC
  `;
  
  console.log("📅 Upcoming trainings for Team 35:");
  console.table(trainings);
  
  if (trainings.length > 0) {
    const trainingIds = trainings.map(t => t.id);
    
    // Check attendance
    const attendance = await sql`
      SELECT 
        ta.id,
        ta.training_id,
        ta.status,
        ta.decline_reason,
        m.first_name,
        m.last_name,
        m.team_id,
        tm.name as team_name
      FROM training_attendance ta
      JOIN members m ON ta.member_id = m.id
      LEFT JOIN teams tm ON m.team_id = tm.id
      WHERE ta.training_id = ANY(${trainingIds})
        AND m.team_id = 35
      ORDER BY ta.status, m.last_name
    `;
    
    console.log(`\n👥 All attendance for Team 35:`);
    console.table(attendance);
    
    const declined = attendance.filter(a => a.status === 'declined');
    console.log(`\n❌ Declined (${declined.length}):`);
    console.table(declined);
  } else {
    console.log("\n⚠️  No upcoming trainings found for Team 35");
    
    // Check all trainings
    const allTrainings = await sql`
      SELECT id, training_date, start_time, team_id
      FROM trainings
      WHERE team_id = 35
      ORDER BY training_date DESC
      LIMIT 5
    `;
    
    console.log("\n📅 Last 5 trainings for Team 35:");
    console.table(allTrainings);
  }
}

checkTeam35().catch(console.error);
