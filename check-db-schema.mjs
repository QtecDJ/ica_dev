import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

console.log('🔍 Checking database schema...\n');

try {
  // Check training_attendance table structure
  console.log('📋 training_attendance columns:');
  const attendanceColumns = await sql`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'training_attendance'
    ORDER BY ordinal_position
  `;
  attendanceColumns.forEach(col => {
    console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(nullable)'}`);
  });

  console.log('\n📋 trainings columns:');
  const trainingsColumns = await sql`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'trainings'
    ORDER BY ordinal_position
  `;
  trainingsColumns.forEach(col => {
    console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(nullable)'}`);
  });

  console.log('\n📋 events columns:');
  const eventsColumns = await sql`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'events'
    ORDER BY ordinal_position
  `;
  eventsColumns.forEach(col => {
    console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(nullable)'}`);
  });

  console.log('\n✅ Schema check complete!');
  process.exit(0);
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
