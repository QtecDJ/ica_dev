#!/usr/bin/env node

/**
 * Cleanup Script für alte Trainings
 * 
 * Löscht Trainings die älter als 30 Tage sind
 * Kann als Cron-Job ausgeführt werden
 * 
 * Usage:
 *   node cleanup-old-trainings.mjs
 * 
 * Cron Example (täglich um 2 Uhr nachts):
 *   0 2 * * * cd /path/to/ica_dev && node cleanup-old-trainings.mjs
 */

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

console.log('🗑️  Starting cleanup of old trainings...\n');

try {
  // Zähle wie viele Trainings gelöscht werden
  const oldTrainings = await sql`
    SELECT COUNT(*) as count
    FROM trainings
    WHERE training_date < CURRENT_DATE - INTERVAL '30 days'
  `;

  const countBefore = parseInt(oldTrainings[0].count);
  console.log(`📊 Found ${countBefore} old trainings (older than 30 days)`);

  if (countBefore === 0) {
    console.log('✅ No old trainings to delete. Database is clean!');
    process.exit(0);
  }

  // Lösche alte Trainings und ihre Attendance Records
  // CASCADE sollte automatisch die training_attendance löschen
  const result = await sql`
    DELETE FROM trainings
    WHERE training_date < CURRENT_DATE - INTERVAL '30 days'
    RETURNING id, training_date, location
  `;

  console.log(`\n✅ Successfully deleted ${result.length} old trainings:`);
  
  if (result.length <= 10) {
    result.forEach((training, index) => {
      console.log(`   ${index + 1}. Training #${training.id} from ${training.training_date} at ${training.location}`);
    });
  } else {
    console.log(`   (Showing first 10 of ${result.length})`);
    result.slice(0, 10).forEach((training, index) => {
      console.log(`   ${index + 1}. Training #${training.id} from ${training.training_date} at ${training.location}`);
    });
  }

  // Statistiken
  console.log('\n📈 Cleanup Statistics:');
  console.log(`   - Trainings deleted: ${result.length}`);
  console.log(`   - Oldest deleted: ${result[result.length - 1]?.training_date || 'N/A'}`);
  console.log(`   - Newest deleted: ${result[0]?.training_date || 'N/A'}`);

  console.log('\n🎉 Cleanup completed successfully!');
  process.exit(0);

} catch (error) {
  console.error('❌ Error during cleanup:', error);
  process.exit(1);
}
