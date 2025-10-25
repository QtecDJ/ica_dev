import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in .env.local');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

console.log('🚀 Setting up optimized database schema...\n');

async function setupOptimizedDatabase() {
  try {
    // 1. Lese Schema-Datei
    console.log('📖 Reading optimized schema...');
    const schemaPath = join(process.cwd(), 'schema-optimized.sql');
    const schema = readFileSync(schemaPath, 'utf-8');
    
    // 2. Trenne SQL-Statements (an ;)
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements\n`);
    
    // 3. Führe Statements aus
    let successCount = 0;
    let skipCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip Comments-Only Statements
      if (statement.startsWith('COMMENT ON')) {
        try {
          await sql.unsafe(statement + ';');
          skipCount++;
        } catch (e) {
          // Ignore comment errors
          skipCount++;
        }
        continue;
      }
      
      try {
        // Bestimmte Statements können direkt ausgeführt werden
        await sql.unsafe(statement + ';');
        successCount++;
        
        // Zeige Fortschritt alle 10 Statements
        if ((i + 1) % 10 === 0) {
          console.log(`   ✅ Processed ${i + 1}/${statements.length} statements`);
        }
      } catch (error) {
        // Ignoriere "already exists" Fehler
        if (error.message.includes('already exists') || 
            error.message.includes('does not exist')) {
          skipCount++;
        } else {
          console.warn(`   ⚠️  Warning on statement ${i + 1}:`, error.message.substring(0, 100));
        }
      }
    }
    
    console.log(`\n✅ Schema setup complete!`);
    console.log(`   - Successfully executed: ${successCount} statements`);
    console.log(`   - Skipped: ${skipCount} statements`);
    
    // 4. Verifiziere Tabellen
    console.log('\n🔍 Verifying tables...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;
    
    console.log(`\n📊 Created ${tables.length} tables:`);
    tables.forEach(t => console.log(`   - ${t.table_name}`));
    
    // 5. Zeige Indexes
    const indexes = await sql`
      SELECT 
        schemaname,
        tablename,
        indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname
    `;
    
    console.log(`\n📈 Created ${indexes.length} indexes`);
    
    // 6. Zeige Views
    const views = await sql`
      SELECT table_name 
      FROM information_schema.views 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    console.log(`\n👁️  Created ${views.length} views:`);
    views.forEach(v => console.log(`   - ${v.table_name}`));
    
    console.log('\n🎉 Database setup complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Run: node reset-and-seed-optimized.mjs  (to add test data)');
    console.log('   2. Run: npm run dev');
    console.log('   3. Login with: qtec / Kai.p0104331780\n');
    
  } catch (error) {
    console.error('\n❌ Error during setup:', error);
    process.exit(1);
  }
}

setupOptimizedDatabase();
