// Test Script für die korrigierte Parent-Child API
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3000';

// Test verschiedene API Funktionen
async function testAPI() {
  console.log('🧪 Testing korrigierte Parent-Child API...\n');

  try {
    // Test 1: Database Status prüfen
    console.log('1. Database Status Check...');
    const dbResponse = await fetch(`${API_BASE}/api/parent-children/relationships`);
    if (dbResponse.ok) {
      const dbData = await dbResponse.json();
      console.log('✅ Database Status:', dbData);
    } else {
      console.log('❌ Database Status failed:', await dbResponse.text());
    }

    // Test 2: Parent Users laden
    console.log('\n2. Parent Users laden...');
    const parentsResponse = await fetch(`${API_BASE}/api/users?role=parent`);
    if (parentsResponse.ok) {
      const parents = await parentsResponse.json();
      console.log(`✅ Found ${parents.length} parent users`);
      
      if (parents.length > 0) {
        const firstParent = parents[0];
        console.log(`   Testing with parent: ${firstParent.name} (ID: ${firstParent.id})`);
        
        // Test 3: Children für einen Parent laden
        console.log('\n3. Children für Parent laden...');
        const childrenResponse = await fetch(`${API_BASE}/api/parent-children?parentId=${firstParent.id}`);
        if (childrenResponse.ok) {
          const childrenData = await childrenResponse.json();
          console.log(`✅ Found ${childrenData.children?.length || 0} children for parent ${firstParent.id}`);
          
          if (childrenData.children && childrenData.children.length > 0) {
            console.log('   Children details:');
            childrenData.children.forEach(child => {
              console.log(`     - ${child.first_name} ${child.last_name} (ID: ${child.id}, Age: ${child.age})`);
            });
          }
        } else {
          console.log('❌ Loading children failed:', await childrenResponse.text());
        }
      }
    } else {
      console.log('❌ Loading parents failed:', await parentsResponse.text());
    }

    // Test 4: Members laden (für potentielle neue Verknüpfungen)
    console.log('\n4. Members laden...');
    const membersResponse = await fetch(`${API_BASE}/api/members`);
    if (membersResponse.ok) {
      const members = await membersResponse.json();
      console.log(`✅ Found ${members.length} total members`);
      
      // Finde orphaned children (ohne parent_email)
      const orphaned = members.filter(m => !m.parent_email || m.parent_email.trim() === '');
      console.log(`   - ${orphaned.length} orphaned children (ohne parent_email)`);
      
      // Finde children mit parent_email
      const withParentEmail = members.filter(m => m.parent_email && m.parent_email.trim() !== '');
      console.log(`   - ${withParentEmail.length} children mit parent_email`);
      
      if (withParentEmail.length > 0) {
        console.log('   Unique parent emails:');
        const uniqueEmails = [...new Set(withParentEmail.map(m => m.parent_email))];
        uniqueEmails.slice(0, 3).forEach(email => {
          const count = withParentEmail.filter(m => m.parent_email === email).length;
          console.log(`     - ${email} (${count} children)`);
        });
      }
    } else {
      console.log('❌ Loading members failed:', await membersResponse.text());
    }

    console.log('\n🎉 API Test completed!');
    console.log('✨ Die korrigierte API sollte jetzt funktionieren ohne relationship_type Fehler.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Warte kurz und starte dann den Test
setTimeout(testAPI, 2000);