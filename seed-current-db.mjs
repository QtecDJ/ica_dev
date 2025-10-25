import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

console.log('🔄 Seeding current database...\n');

async function seedDatabase() {
  try {
    // ============================================
    // 1. DELETE OLD DATA (außer Admin)
    // ============================================
    console.log('🗑️  Clearing old data...');
    
    await sql`DELETE FROM comments`;
    await sql`DELETE FROM training_attendance`;
    await sql`DELETE FROM event_participants`;
    await sql`DELETE FROM calendar_events`;
    await sql`DELETE FROM trainings`;
    await sql`DELETE FROM events`;
    await sql`DELETE FROM parent_children`;
    await sql`DELETE FROM users WHERE role != 'admin'`;
    await sql`DELETE FROM members`;
    await sql`DELETE FROM teams`;
    
    console.log('   ✅ Old data cleared\n');
    
    // ============================================
    // 2. ADMIN USER (qtec)
    // ============================================
    console.log('👤 Creating admin user...');
    const hashedPassword = await bcrypt.hash('Kai.p0104331780', 10);
    
    const [adminUser] = await sql`
      INSERT INTO users (username, email, password_hash, role, name)
      VALUES ('qtec', 'kai@ica.de', ${hashedPassword}, 'admin', 'Kai Qtec')
      ON CONFLICT (username) DO UPDATE SET
        password_hash = ${hashedPassword},
        email = 'kai@ica.de',
        name = 'Kai Qtec'
      RETURNING id, username
    `;
    console.log(`   ✅ Admin: ${adminUser.username}\n`);
    
    // ============================================
    // 3. TEAMS
    // ============================================
    console.log('🏆 Creating teams...');
    
    const teams = await sql`
      INSERT INTO teams (name, level, coach)
      VALUES
        ('Mini Stars', 'Level 1', 'Sarah Schmidt'),
        ('Junior Flyers', 'Level 2', 'Mike Johnson'),
        ('Youth Elite', 'Level 3', 'Lisa Weber'),
        ('Senior All Stars', 'Level 4', 'Alex Müller'),
        ('Cheer Prep', 'Prep', 'Kai Qtec')
      RETURNING id, name
    `;
    
    console.log(`   ✅ Created ${teams.length} teams\n`);
    
    // ============================================
    // 4. COACHES
    // ============================================
    console.log('👨‍🏫 Creating coaches...');
    
    const coachPassword = await bcrypt.hash('coach123', 10);
    const coaches = await sql`
      INSERT INTO users (username, email, password_hash, role, name)
      VALUES
        ('sarah', 'sarah@ica.de', ${coachPassword}, 'coach', 'Sarah Schmidt'),
        ('mike', 'mike@ica.de', ${coachPassword}, 'coach', 'Mike Johnson'),
        ('lisa', 'lisa@ica.de', ${coachPassword}, 'coach', 'Lisa Weber'),
        ('alex', 'alex@ica.de', ${coachPassword}, 'coach', 'Alex Müller')
      RETURNING id, name
    `;
    
    console.log(`   ✅ Created ${coaches.length} coaches\n`);
    
    // ============================================
    // 5. MEMBERS
    // ============================================
    console.log('👥 Creating members...');
    
    const memberData = [
      // Mini Stars (Team 1)
      { first: 'Emma', last: 'Müller', birth: '2017-03-15', team: 0, parent: 'Sandra Müller', email: 'sandra.mueller@email.com', phone: '0151-1234567' },
      { first: 'Liam', last: 'Schmidt', birth: '2016-07-22', team: 0, parent: 'Thomas Schmidt', email: 'thomas.schmidt@email.com', phone: '0152-2345678' },
      { first: 'Mia', last: 'Weber', birth: '2017-11-08', team: 0, parent: 'Anna Weber', email: 'anna.weber@email.com', phone: '0153-3456789' },
      { first: 'Noah', last: 'Wagner', birth: '2018-02-14', team: 0, parent: 'Michael Wagner', email: 'michael.wagner@email.com', phone: '0154-4567890' },
      { first: 'Sophia', last: 'Becker', birth: '2017-09-30', team: 0, parent: 'Julia Becker', email: 'julia.becker@email.com', phone: '0155-5678901' },
      
      // Junior Flyers (Team 2)
      { first: 'Leon', last: 'Fischer', birth: '2014-05-18', team: 1, parent: 'Petra Fischer', email: 'petra.fischer@email.com', phone: '0156-6789012' },
      { first: 'Hannah', last: 'Hoffmann', birth: '2013-08-25', team: 1, parent: 'Klaus Hoffmann', email: 'klaus.hoffmann@email.com', phone: '0157-7890123' },
      { first: 'Felix', last: 'Klein', birth: '2014-12-03', team: 1, parent: 'Marion Klein', email: 'marion.klein@email.com', phone: '0158-8901234' },
      { first: 'Lea', last: 'Wolf', birth: '2013-04-17', team: 1, parent: 'Stefan Wolf', email: 'stefan.wolf@email.com', phone: '0159-9012345' },
      { first: 'Paul', last: 'Schröder', birth: '2014-10-09', team: 1, parent: 'Sabine Schröder', email: 'sabine.schroeder@email.com', phone: '0160-0123456' },
      
      // Youth Elite (Team 3)
      { first: 'Tim', last: 'Schwarz', birth: '2011-01-14', team: 2, parent: 'Monika Schwarz', email: 'monika.schwarz@email.com', phone: '0162-2345678' },
      { first: 'Anna', last: 'Zimmermann', birth: '2010-09-08', team: 2, parent: 'Robert Zimmermann', email: 'robert.zimmermann@email.com', phone: '0163-3456789' },
      { first: 'Max', last: 'Braun', birth: '2011-07-23', team: 2, parent: 'Claudia Braun', email: 'claudia.braun@email.com', phone: '0164-4567890' },
      { first: 'Julia', last: 'Hofmann', birth: '2010-03-30', team: 2, parent: 'Andreas Hofmann', email: 'andreas.hofmann@email.com', phone: '0165-5678901' },
      
      // Senior All Stars (Team 4)
      { first: 'Jonas', last: 'Bauer', birth: '2008-02-19', team: 3, parent: 'Martina Bauer', email: 'martina.bauer@email.com', phone: '0168-8901234' },
      { first: 'Sarah', last: 'Richter', birth: '2007-10-12', team: 3, parent: 'Peter Richter', email: 'peter.richter@email.com', phone: '0169-9012345' },
      { first: 'Tom', last: 'Lange', birth: '2008-06-28', team: 3, parent: 'Karin Lange', email: 'karin.lange@email.com', phone: '0170-0123456' },
      
      // Cheer Prep (Team 5)
      { first: 'Lena', last: 'Stein', birth: '2015-04-20', team: 4, parent: 'Daniela Stein', email: 'daniela.stein@email.com', phone: '0173-3456789' },
      { first: 'Ben', last: 'König', birth: '2016-01-11', team: 4, parent: 'Markus König', email: 'markus.koenig@email.com', phone: '0174-4567890' },
      { first: 'Amelie', last: 'Huber', birth: '2015-08-03', team: 4, parent: 'Nicole Huber', email: 'nicole.huber@email.com', phone: '0175-5678901' },
    ];
    
    const members = [];
    for (const m of memberData) {
      const [member] = await sql`
        INSERT INTO members (
          first_name, last_name, birth_date, team_id,
          parent_name, parent_email, parent_phone
        )
        VALUES (
          ${m.first}, ${m.last}, ${m.birth}, ${teams[m.team].id},
          ${m.parent}, ${m.email}, ${m.phone}
        )
        RETURNING id, first_name, last_name
      `;
      members.push({ ...member, parentEmail: m.email, parentName: m.parent });
    }
    
    console.log(`   ✅ Created ${members.length} members\n`);
    
    // ============================================
    // 6. PARENT USERS
    // ============================================
    console.log('👨‍👩‍👧‍👦 Creating parent users...');
    
    const parentPassword = await bcrypt.hash('parent123', 10);
    const uniqueParents = [...new Set(memberData.map(m => m.email))];
    const parentUsers = [];
    
    for (const parentEmail of uniqueParents) {
      const memberWithParent = memberData.find(m => m.email === parentEmail);
      const username = parentEmail.split('@')[0].replace('.', '_');
      
      const [parent] = await sql`
        INSERT INTO users (username, email, password_hash, role, name)
        VALUES (
          ${username},
          ${parentEmail},
          ${parentPassword},
          'parent',
          ${memberWithParent.parent}
        )
        RETURNING id, name, email
      `;
      parentUsers.push(parent);
    }
    
    console.log(`   ✅ Created ${parentUsers.length} parent users\n`);
    
    // ============================================
    // 7. PARENT-CHILD RELATIONSHIPS
    // ============================================
    console.log('👨‍👩‍👧 Creating parent-child relationships...');
    
    let relationshipCount = 0;
    for (const parent of parentUsers) {
      const children = members.filter(m => m.parentEmail === parent.email);
      
      for (const child of children) {
        await sql`
          INSERT INTO parent_children (parent_user_id, child_member_id)
          VALUES (${parent.id}, ${child.id})
          ON CONFLICT (parent_user_id, child_member_id) DO NOTHING
        `;
        relationshipCount++;
      }
    }
    
    console.log(`   ✅ Created ${relationshipCount} relationships\n`);
    
    // ============================================
    // 8. EVENTS
    // ============================================
    console.log('🎉 Creating events...');
    
    const events = await sql`
      INSERT INTO events (
        title, description, event_date, start_time, end_time,
        location, event_type, is_mandatory, max_participants, notes
      )
      VALUES
        (
          'Regional Qualifikation München',
          'Erste Qualifikation für die Deutsche Meisterschaft',
          '2025-11-15', '10:00', '18:00',
          'Olympiahalle München',
          'competition', true, 50,
          'Uniform, Sportschuhe, Verpflegung mitbringen'
        ),
        (
          'Winter Showcase 2025',
          'Jahresabschluss-Show mit allen Teams',
          '2025-12-20', '18:00', '21:00',
          'ICA Trainingshalle',
          'showcase', true, 100,
          'Uniform erforderlich, Showoutfit wird gestellt'
        ),
        (
          'Stunt Workshop mit Profis',
          'Ganztägiger Workshop mit internationalen Trainern',
          '2025-11-30', '09:00', '17:00',
          'ICA Trainingshalle',
          'workshop', false, 30,
          'Sportkleidung, eigene Verpflegung, Notizblock'
        )
      RETURNING id, title
    `;
    
    console.log(`   ✅ Created ${events.length} events\n`);
    
    // ============================================
    // 9. TRAININGS (nächste 2 Wochen)
    // ============================================
    console.log('💪 Creating trainings...');
    
    const today = new Date('2025-10-25');
    const trainings = [];
    
    for (let week = 0; week < 2; week++) {
      for (const team of teams) {
        // 2 Trainings pro Woche
        const training1Date = new Date(today);
        training1Date.setDate(today.getDate() + (week * 7) + 1); // Dienstag
        
        const training2Date = new Date(today);
        training2Date.setDate(today.getDate() + (week * 7) + 4); // Freitag
        
        const [t1] = await sql`
          INSERT INTO trainings (
            team_id, training_date, start_time, end_time,
            location, notes
          )
          VALUES (
            ${team.id},
            ${training1Date.toISOString().split('T')[0]},
            '17:00', '19:00',
            'ICA Trainingshalle',
            'Tumbling, Stunts, Choreographie'
          )
          RETURNING id
        `;
        
        const [t2] = await sql`
          INSERT INTO trainings (
            team_id, training_date, start_time, end_time,
            location, notes
          )
          VALUES (
            ${team.id},
            ${training2Date.toISOString().split('T')[0]},
            '18:00', '20:00',
            'ICA Trainingshalle',
            'Pyramiden, Tosses, Routine'
          )
          RETURNING id
        `;
        
        trainings.push(t1, t2);
      }
    }
    
    console.log(`   ✅ Created ${trainings.length} trainings\n`);
    
    // ============================================
    // 10. CALENDAR EVENTS
    // ============================================
    console.log('📅 Creating calendar events...');
    
    const calendarEvents = await sql`
      INSERT INTO calendar_events (
        title, description, event_date, start_time, end_time,
        event_type, location, created_by
      )
      VALUES
        ('Halloween Party', 'Gemeinsame Halloween-Feier', '2025-10-31', '18:00', '21:00', 'other', 'ICA Halle', ${adminUser.id}),
        ('Weihnachtsferien', 'Trainingspause', '2025-12-24', null, null, 'holiday', null, ${adminUser.id}),
        ('Coach Meeting', 'Monatliches Trainer-Treffen', '2025-11-05', '19:00', '21:00', 'meeting', 'ICA Halle', ${adminUser.id}),
        ('Elternabend', 'Info für alle Eltern', '2025-11-12', '19:00', '20:30', 'meeting', 'ICA Halle', ${adminUser.id})
      RETURNING id, title
    `;
    
    console.log(`   ✅ Created ${calendarEvents.length} calendar events\n`);
    
    // ============================================
    // STATISTICS
    // ============================================
    console.log('📊 Database Statistics:');
    
    const stats = await sql`
      SELECT
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM teams) as teams,
        (SELECT COUNT(*) FROM members) as members,
        (SELECT COUNT(*) FROM events) as events,
        (SELECT COUNT(*) FROM trainings) as trainings,
        (SELECT COUNT(*) FROM calendar_events) as calendar_events,
        (SELECT COUNT(*) FROM parent_children) as parent_relationships
    `;
    
    const s = stats[0];
    console.log(`   👤 Users: ${s.users}`);
    console.log(`   🏆 Teams: ${s.teams}`);
    console.log(`   👥 Members: ${s.members}`);
    console.log(`   🎉 Events: ${s.events}`);
    console.log(`   💪 Trainings: ${s.trainings}`);
    console.log(`   📅 Calendar Events: ${s.calendar_events}`);
    console.log(`   👨‍👩‍👧 Parent Relationships: ${s.parent_relationships}`);
    
    console.log('\n🎉 Database seeding complete!\n');
    console.log('🔐 Login Credentials:');
    console.log('   Admin:  qtec / Kai.p0104331780');
    console.log('   Coach:  sarah / coach123');
    console.log('   Parent: sandra_mueller / parent123\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error);
    throw error;
  }
}

seedDatabase().catch(console.error);
