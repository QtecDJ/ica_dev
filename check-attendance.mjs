import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function checkAttendance() {
  console.log("🔍 Checking attendance data...\n");
  
  // Check upcoming trainings
  const trainings = await sql`
    SELECT id, training_date, start_time, team_id
    FROM trainings
    WHERE training_date >= CURRENT_DATE
    ORDER BY training_date ASC, start_time ASC
    LIMIT 5
  `;
  
  console.log("📅 Upcoming trainings:");
  console.table(trainings);
  
  if (trainings.length > 0) {
    const trainingId = trainings[0].id;
    
    // Check attendance for first training
    const attendance = await sql`
      SELECT 
        ta.id,
        ta.status,
        ta.decline_reason,
        m.first_name,
        m.last_name,
        m.team_id,
        tm.name as team_name
      FROM training_attendance ta
      JOIN members m ON ta.member_id = m.id
      LEFT JOIN teams tm ON m.team_id = tm.id
      WHERE ta.training_id = ${trainingId}
      ORDER BY ta.status, m.last_name
    `;
    
    console.log(`\n👥 Attendance for training ${trainingId}:`);
    console.table(attendance);
    
    // Count by status
    const accepted = attendance.filter(a => a.status === 'accepted').length;
    const declined = attendance.filter(a => a.status === 'declined').length;
    const pending = attendance.filter(a => a.status === 'pending').length;
    
    console.log(`\n📊 Summary:`);
    console.log(`✅ Accepted: ${accepted}`);
    console.log(`❌ Declined: ${declined}`);
    console.log(`⏳ Pending: ${pending}`);
  }
}

checkAttendance().catch(console.error);
