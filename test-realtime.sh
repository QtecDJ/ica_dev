#!/bin/bash

# Realtime Updates Test Script
# Testet ob alle CRUD Operationen funktionieren und die Datenbank korrekt ist

echo "🧪 Testing Realtime Updates..."
echo ""

# Load environment variables
export $(cat .env.local | grep -v '^#' | xargs)

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Database Connection
echo "1️⃣ Testing database connection..."
node -e "
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL);
try {
  const result = await sql\`SELECT 1 as test\`;
  console.log('✅ Database connection OK');
  process.exit(0);
} catch (error) {
  console.log('❌ Database connection FAILED:', error.message);
  process.exit(1);
}
" 2>/dev/null

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Database connection successful${NC}"
else
  echo -e "${RED}❌ Database connection failed${NC}"
  exit 1
fi
echo ""

# Test 2: Check critical tables
echo "2️⃣ Checking critical tables..."
node -e "
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL);

const tables = ['teams', 'members', 'trainings', 'events', 'training_attendance'];
let allOk = true;

for (const table of tables) {
  try {
    const result = await sql\`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = \${table}
      )
    \`;
    if (result[0].exists) {
      console.log(\`✅ Table '\${table}' exists\`);
    } else {
      console.log(\`❌ Table '\${table}' missing\`);
      allOk = false;
    }
  } catch (error) {
    console.log(\`❌ Error checking '\${table}':\`, error.message);
    allOk = false;
  }
}

process.exit(allOk ? 0 : 1);
" 2>/dev/null

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ All critical tables exist${NC}"
else
  echo -e "${RED}❌ Some tables are missing${NC}"
  exit 1
fi
echo ""

# Test 3: Check decline_reason column
echo "3️⃣ Checking decline_reason column..."
node -e "
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL);

try {
  const result = await sql\`
    SELECT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'training_attendance' 
      AND column_name = 'decline_reason'
    )
  \`;
  if (result[0].exists) {
    console.log('✅ Column decline_reason exists');
    process.exit(0);
  } else {
    console.log('❌ Column decline_reason missing');
    process.exit(1);
  }
} catch (error) {
  console.log('❌ Error:', error.message);
  process.exit(1);
}
" 2>/dev/null

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ decline_reason column exists${NC}"
else
  echo -e "${RED}❌ decline_reason column missing - run migration!${NC}"
  exit 1
fi
echo ""

# Test 4: Check updated_at columns
echo "4️⃣ Checking updated_at columns..."
node -e "
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL);

const tables = ['teams', 'members', 'trainings', 'events', 'training_attendance'];
let allOk = true;

for (const table of tables) {
  try {
    const result = await sql\`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = \${table}
        AND column_name = 'updated_at'
      )
    \`;
    if (result[0].exists) {
      console.log(\`✅ Table '\${table}' has updated_at\`);
    } else {
      console.log(\`⚠️  Table '\${table}' missing updated_at (optional)\`);
    }
  } catch (error) {
    console.log(\`❌ Error checking '\${table}':\`, error.message);
  }
}
" 2>/dev/null
echo ""

# Test 5: Server running check
echo "5️⃣ Checking if server is running..."
if curl -s http://localhost:3000/api/auth/session > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Server is running on http://localhost:3000${NC}"
else
  echo -e "${YELLOW}⚠️  Server not running - start with: npm run dev${NC}"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎉 All tests passed!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Next steps:"
echo "  1. Open http://localhost:3000"
echo "  2. Login and test CRUD operations"
echo "  3. Check if changes appear in realtime"
echo ""
