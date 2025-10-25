import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

console.log('🔄 Resetting and seeding optimized database...\n');

async function resetAndSeed() {
  try {
    // ============================================
    // 1. DELETE OLD DATA (in correct order)
    // ============================================
    console.log('🗑️  Deleting old data...');
    
    // Notifications-Tabelle wird erst später erstellt, überspringe sie
    
    await sql`DELETE FROM comments`;
    console.log('   ✅ comments');
    
    await sql`DELETE FROM training_attendance`;
    console.log('   ✅ training_attendance');
    
    await sql`DELETE FROM event_participants`;
    console.log('   ✅ event_participants');
    
    await sql`DELETE FROM calendar_events`;
    console.log('   ✅ calendar_events');
    
    await sql`DELETE FROM trainings`;
    console.log('   ✅ trainings');
    
    await sql`DELETE FROM events`;
    console.log('   ✅ events');
    
    await sql`DELETE FROM parent_children`;
    console.log('   ✅ parent_children');
    
    await sql`DELETE FROM users WHERE role != 'admin'`; // Keep first admin
    console.log('   ✅ non-admin users');
    
    await sql`DELETE FROM members`;
    console.log('   ✅ members');
    
    await sql`DELETE FROM teams`;
    console.log('   ✅ teams');
    
    console.log('\n✨ All old data deleted!\n');
    
    // ============================================
    // 2. CREATE ADMIN USER
    // ============================================
    console.log('👤 Creating admin user...');
    const hashedPassword = await bcrypt.hash('Kai.p0104331780', 10);
    
    const [adminUser] = await sql`
      INSERT INTO users (username, password_hash, role, name, email, active, email_verified)
      VALUES ('qtec', ${hashedPassword}, 'admin', 'Kai Qtec', 'kai@ica.de', true, true)
      ON CONFLICT (username) DO UPDATE SET
        password_hash = ${hashedPassword},
        name = 'Kai Qtec',
        email = 'kai@ica.de'
      RETURNING id, username, role
    `;
    console.log(`   ✅ Admin: ${adminUser.username}`);
    
    // ============================================
    // 3. CREATE TEAMS
    // ============================================
    console.log('\n🏆 Creating teams...');
    
    const teams = await sql`
      INSERT INTO teams (name, level, description, active, color)
      VALUES
        ('Mini Stars', 'Level 1', 'Anfänger 6-9 Jahre', true, '#FF6B9D'),
        ('Junior Flyers', 'Level 2', 'Fortgeschrittene 10-12 Jahre', true, '#4A90E2'),
        ('Youth Elite', 'Level 3', 'Elite 13-15 Jahre', true, '#F5A623'),
        ('Senior All Stars', 'Level 4', 'Leistungssportler 16+ Jahre', true, '#8B5CF6'),
        ('Cheer Prep', 'Prep', 'Vorbereitung & Einsteiger', true, '#50E3C2')
      RETURNING id, name, level
    `;
    
    console.log(`   ✅ Created ${teams.length} teams`);
    teams.forEach(t => console.log(`      - ${t.name} (${t.level})`));
    
    // ============================================
    // 4. CREATE COACH USERS
    // ============================================
    console.log('\n👨‍🏫 Creating coaches...');
    
    const coachPassword = await bcrypt.hash('coach123', 10);
    const coaches = await sql`
      INSERT INTO users (username, password_hash, role, name, email, active, email_verified)
      VALUES
        ('sarah', ${coachPassword}, 'coach', 'Sarah Schmidt', 'sarah@ica.de', true, true),
        ('mike', ${coachPassword}, 'coach', 'Mike Johnson', 'mike@ica.de', true, true),
        ('lisa', ${coachPassword}, 'coach', 'Lisa Weber', 'lisa@ica.de', true, true),
        ('alex', ${coachPassword}, 'coach', 'Alex Müller', 'alex@ica.de', true, true)
      RETURNING id, name, role
    `;
    
    console.log(`   ✅ Created ${coaches.length} coaches`);
    coaches.forEach(c => console.log(`      - ${c.name}`));
    
    // Update teams with coach assignments
    await sql`UPDATE teams SET coach_user_id = ${coaches[0].id} WHERE name = 'Mini Stars'`;
    await sql`UPDATE teams SET coach_user_id = ${coaches[1].id} WHERE name = 'Junior Flyers'`;
    await sql`UPDATE teams SET coach_user_id = ${coaches[2].id} WHERE name = 'Youth Elite'`;
    await sql`UPDATE teams SET coach_user_id = ${coaches[3].id} WHERE name = 'Senior All Stars'`;
    await sql`UPDATE teams SET coach_user_id = ${adminUser.id} WHERE name = 'Cheer Prep'`;
    
    // ============================================
    // 5. CREATE MEMBERS
    // ============================================
    console.log('\n👥 Creating members...');
    
    const memberData = [
      // Mini Stars (6-9 Jahre)
      { first: 'Emma', last: 'Müller', birthDate: '2017-03-15', team: teams[0].id, parent: 'Sandra Müller', email: 'sandra.mueller@email.com', phone: '0151-1234567' },
      { first: 'Liam', last: 'Schmidt', birthDate: '2016-07-22', team: teams[0].id, parent: 'Thomas Schmidt', email: 'thomas.schmidt@email.com', phone: '0152-2345678' },
      { first: 'Mia', last: 'Weber', birthDate: '2017-11-08', team: teams[0].id, parent: 'Anna Weber', email: 'anna.weber@email.com', phone: '0153-3456789' },
      { first: 'Noah', last: 'Wagner', birthDate: '2018-02-14', team: teams[0].id, parent: 'Michael Wagner', email: 'michael.wagner@email.com', phone: '0154-4567890' },
      { first: 'Sophia', last: 'Becker', birthDate: '2017-09-30', team: teams[0].id, parent: 'Julia Becker', email: 'julia.becker@email.com', phone: '0155-5678901' },
      
      // Junior Flyers (10-12 Jahre)
      { first: 'Leon', last: 'Fischer', birthDate: '2014-05-18', team: teams[1].id, parent: 'Petra Fischer', email: 'petra.fischer@email.com', phone: '0156-6789012' },
      { first: 'Hannah', last: 'Hoffmann', birthDate: '2013-08-25', team: teams[1].id, parent: 'Klaus Hoffmann', email: 'klaus.hoffmann@email.com', phone: '0157-7890123' },
      { first: 'Felix', last: 'Klein', birthDate: '2014-12-03', team: teams[1].id, parent: 'Marion Klein', email: 'marion.klein@email.com', phone: '0158-8901234' },
      { first: 'Lea', last: 'Wolf', birthDate: '2013-04-17', team: teams[1].id, parent: 'Stefan Wolf', email: 'stefan.wolf@email.com', phone: '0159-9012345' },
      { first: 'Paul', last: 'Schröder', birthDate: '2014-10-09', team: teams[1].id, parent: 'Sabine Schröder', email: 'sabine.schroeder@email.com', phone: '0160-0123456' },
      { first: 'Laura', last: 'Neumann', birthDate: '2013-06-21', team: teams[1].id, parent: 'Frank Neumann', email: 'frank.neumann@email.com', phone: '0161-1234567' },
      
      // Youth Elite (13-15 Jahre)
      { first: 'Tim', last: 'Schwarz', birthDate: '2011-01-14', team: teams[2].id, parent: 'Monika Schwarz', email: 'monika.schwarz@email.com', phone: '0162-2345678' },
      { first: 'Anna', last: 'Zimmermann', birthDate: '2010-09-08', team: teams[2].id, parent: 'Robert Zimmermann', email: 'robert.zimmermann@email.com', phone: '0163-3456789' },
      { first: 'Max', last: 'Braun', birthDate: '2011-07-23', team: teams[2].id, parent: 'Claudia Braun', email: 'claudia.braun@email.com', phone: '0164-4567890' },
      { first: 'Julia', last: 'Hofmann', birthDate: '2010-03-30', team: teams[2].id, parent: 'Andreas Hofmann', email: 'andreas.hofmann@email.com', phone: '0165-5678901' },
      { first: 'David', last: 'Schulz', birthDate: '2011-11-15', team: teams[2].id, parent: 'Birgit Schulz', email: 'birgit.schulz@email.com', phone: '0166-6789012' },
      { first: 'Marie', last: 'Koch', birthDate: '2010-05-07', team: teams[2].id, parent: 'Uwe Koch', email: 'uwe.koch@email.com', phone: '0167-7890123' },
      
      // Senior All Stars (16+ Jahre)
      { first: 'Jonas', last: 'Bauer', birthDate: '2008-02-19', team: teams[3].id, parent: 'Martina Bauer', email: 'martina.bauer@email.com', phone: '0168-8901234' },
      { first: 'Sarah', last: 'Richter', birthDate: '2007-10-12', team: teams[3].id, parent: 'Peter Richter', email: 'peter.richter@email.com', phone: '0169-9012345' },
      { first: 'Tom', last: 'Lange', birthDate: '2008-06-28', team: teams[3].id, parent: 'Karin Lange', email: 'karin.lange@email.com', phone: '0170-0123456' },
      { first: 'Lisa', last: 'Krüger', birthDate: '2007-12-04', team: teams[3].id, parent: 'Wolfgang Krüger', email: 'wolfgang.krueger@email.com', phone: '0171-1234567' },
      { first: 'Finn', last: 'Meier', birthDate: '2008-08-16', team: teams[3].id, parent: 'Silke Meier', email: 'silke.meier@email.com', phone: '0172-2345678' },
      
      // Cheer Prep
      { first: 'Lena', last: 'Stein', birthDate: '2015-04-20', team: teams[4].id, parent: 'Daniela Stein', email: 'daniela.stein@email.com', phone: '0173-3456789' },
      { first: 'Ben', last: 'König', birthDate: '2016-01-11', team: teams[4].id, parent: 'Markus König', email: 'markus.koenig@email.com', phone: '0174-4567890' },
      { first: 'Amelie', last: 'Huber', birthDate: '2015-08-03', team: teams[4].id, parent: 'Nicole Huber', email: 'nicole.huber@email.com', phone: '0175-5678901' },
    ];
    
    const members = [];
    for (const m of memberData) {
      const [member] = await sql`
        INSERT INTO members (
          first_name, last_name, birth_date, team_id, 
          parent_name, parent_email, parent_phone, active
        )
        VALUES (
          ${m.first}, ${m.last}, ${m.birthDate}, ${m.team},
          ${m.parent}, ${m.email}, ${m.phone}, true
        )
        RETURNING id, first_name, last_name
      `;
      members.push(member);
    }
    
    console.log(`   ✅ Created ${members.length} members`);
    
    // ============================================
    // 6. CREATE PARENT USERS
    // ============================================
    console.log('\n👨‍👩‍👧‍👦 Creating parent users...');
    
    const parentPassword = await bcrypt.hash('parent123', 10);
    
    // Erstelle Parents basierend auf unique emails
    const uniqueParents = [...new Set(memberData.map(m => m.email))];
    const parentUsers = [];
    
    for (const parentEmail of uniqueParents) {
      const memberWithParent = memberData.find(m => m.email === parentEmail);
      if (!memberWithParent) continue;
      
      const username = memberWithParent.email.split('@')[0];
      
      const [parent] = await sql`
        INSERT INTO users (username, password_hash, role, name, email, active, email_verified)
        VALUES (
          ${username},
          ${parentPassword},
          'parent',
          ${memberWithParent.parent},
          ${parentEmail},
          true,
          true
        )
        RETURNING id, name, email
      `;
      parentUsers.push(parent);
    }
    
    console.log(`   ✅ Created ${parentUsers.length} parent users`);
    
    // ============================================
    // 7. CREATE PARENT-CHILD RELATIONSHIPS
    // ============================================
    console.log('\n👨‍👩‍👧 Creating parent-child relationships...');
    
    let relationshipCount = 0;
    for (const parent of parentUsers) {
      // Finde alle Members mit dieser parent_email
      const children = members.filter((_, idx) => memberData[idx].email === parent.email);
      
      for (const child of children) {
        await sql`
          INSERT INTO parent_children (parent_user_id, child_member_id, relationship_type, can_manage)
          VALUES (${parent.id}, ${child.id}, 'parent', true)
          ON CONFLICT (parent_user_id, child_member_id) DO NOTHING
        `;
        relationshipCount++;
      }
    }
    
    console.log(`   ✅ Created ${relationshipCount} parent-child relationships`);
    
    // ============================================
    // 8. CREATE EVENTS
    // ============================================
    console.log('\n🎉 Creating events...');
    
    const events = await sql`
      INSERT INTO events (
        title, description, event_date, start_time, end_time,
        location, address, event_type, is_mandatory, max_participants,
        registration_deadline, cost, requirements, status, created_by
      )
      VALUES
        (
          'Regional Qualifikation München',
          'Erste Qualifikation für die Deutsche Meisterschaft',
          '2025-11-15',
          '10:00',
          '18:00',
          'Olympiahalle München',
          'Spiridon-Louis-Ring 21, 80809 München',
          'competition',
          true,
          50,
          '2025-11-08',
          45.00,
          'Uniform, Sportschuhe, Verpflegung für den Tag',
          'scheduled',
          ${adminUser.id}
        ),
        (
          'Winter Showcase 2025',
          'Jahresabschluss-Show mit allen Teams',
          '2025-12-20',
          '18:00',
          '21:00',
          'ICA Trainingshalle',
          'Hauptstraße 123, 80331 München',
          'showcase',
          true,
          100,
          '2025-12-13',
          0,
          'Uniform, Showoutfit wird gestellt',
          'scheduled',
          ${adminUser.id}
        ),
        (
          'Stunt Workshop mit Profis',
          'Ganztägiger Workshop mit internationalen Trainern',
          '2025-11-30',
          '09:00',
          '17:00',
          'ICA Trainingshalle',
          'Hauptstraße 123, 80331 München',
          'workshop',
          false,
          30,
          '2025-11-23',
          35.00,
          'Sportkleidung, Verpflegung, Notizblock',
          'scheduled',
          ${coaches[0].id}
        ),
        (
          'Deutsche Meisterschaft Berlin',
          'Finale der deutschen Cheerleading Meisterschaft',
          '2026-01-25',
          '08:00',
          '20:00',
          'Max-Schmeling-Halle',
          'Am Falkplatz, 10437 Berlin',
          'competition',
          false,
          40,
          '2026-01-10',
          65.00,
          'Uniform, Reisekosten separat, Übernachtung organisiert',
          'scheduled',
          ${adminUser.id}
        ),
        (
          'Team Building Event',
          'Gemeinsamer Ausflug in den Hochseilgarten',
          '2025-11-08',
          '14:00',
          '18:00',
          'Hochseilgarten Garmisch',
          'Olympiastraße 27, 82467 Garmisch-Partenkirchen',
          'other',
          false,
          60,
          '2025-11-01',
          20.00,
          'Sportkleidung, feste Schuhe, Wetterkleidung',
          'scheduled',
          ${coaches[1].id}
        )
      RETURNING id, title, event_date
    `;
    
    console.log(`   ✅ Created ${events.length} events`);
    events.forEach(e => console.log(`      - ${e.title} (${e.event_date.toISOString().split('T')[0]})`));
    
    // ============================================
    // 9. CREATE EVENT PARTICIPANTS
    // ============================================
    console.log('\n✋ Creating event participants...');
    
    // Pflicht-Events: Alle Mitglieder als pending
    const mandatoryEvents = events.filter(e => e.title.includes('Qualifikation') || e.title.includes('Showcase'));
    let participantCount = 0;
    
    for (const event of mandatoryEvents) {
      for (const member of members) {
        await sql`
          INSERT INTO event_participants (event_id, member_id, status)
          VALUES (${event.id}, ${member.id}, 'pending')
        `;
        participantCount++;
      }
    }
    
    // Workshop: Nur einige Mitglieder als accepted/pending
    const workshopEvent = events.find(e => e.title.includes('Workshop'));
    if (workshopEvent) {
      for (let i = 0; i < Math.min(15, members.length); i++) {
        await sql`
          INSERT INTO event_participants (event_id, member_id, status, response_date)
          VALUES (
            ${workshopEvent.id},
            ${members[i].id},
            ${i < 10 ? 'accepted' : 'pending'},
            ${i < 10 ? new Date() : null}
          )
        `;
        participantCount++;
      }
    }
    
    console.log(`   ✅ Created ${participantCount} event participants`);
    
    // ============================================
    // 10. CREATE TRAININGS
    // ============================================
    console.log('\n💪 Creating trainings...');
    
    const today = new Date();
    const trainings = [];
    
    // Erstelle Trainings für die nächsten 4 Wochen
    for (let week = 0; week < 4; week++) {
      for (const team of teams) {
        // 2 Trainings pro Woche pro Team
        const training1Date = new Date(today);
        training1Date.setDate(today.getDate() + (week * 7) + 1); // Dienstag
        
        const training2Date = new Date(today);
        training2Date.setDate(today.getDate() + (week * 7) + 4); // Freitag
        
        const [t1] = await sql`
          INSERT INTO trainings (
            team_id, training_date, start_time, end_time,
            location, focus_areas, coach_id, status
          )
          VALUES (
            ${team.id},
            ${training1Date.toISOString().split('T')[0]},
            '17:00',
            '19:00',
            'ICA Trainingshalle',
            'Tumbling, Stunts, Choreographie',
            ${coaches[teams.indexOf(team) % coaches.length].id},
            'scheduled'
          )
          RETURNING id
        `;
        
        const [t2] = await sql`
          INSERT INTO trainings (
            team_id, training_date, start_time, end_time,
            location, focus_areas, coach_id, status
          )
          VALUES (
            ${team.id},
            ${training2Date.toISOString().split('T')[0]},
            '18:00',
            '20:00',
            'ICA Trainingshalle',
            'Pyramiden, Tosses, Routine',
            ${coaches[teams.indexOf(team) % coaches.length].id},
            'scheduled'
          )
          RETURNING id
        `;
        
        trainings.push(t1, t2);
      }
    }
    
    console.log(`   ✅ Created ${trainings.length} trainings`);
    
    // ============================================
    // 11. CREATE TRAINING ATTENDANCE
    // ============================================
    console.log('\n📝 Creating training attendance...');
    
    let attendanceCount = 0;
    
    // Für jedes Training: Füge Team-Mitglieder hinzu
    for (const training of trainings) {
      const trainingDetails = await sql`
        SELECT team_id FROM trainings WHERE id = ${training.id}
      `;
      
      const teamId = trainingDetails[0].team_id;
      const teamMembers = members.filter((_, idx) => memberData[idx].team === teamId);
      
      for (const member of teamMembers) {
        const statuses = ['accepted', 'accepted', 'accepted', 'pending', 'declined'];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        
        await sql`
          INSERT INTO training_attendance (training_id, member_id, status, response_date)
          VALUES (
            ${training.id},
            ${member.id},
            ${randomStatus},
            ${randomStatus !== 'pending' ? new Date() : null}
          )
        `;
        attendanceCount++;
      }
    }
    
    console.log(`   ✅ Created ${attendanceCount} training attendance records`);
    
    // ============================================
    // 12. CREATE CALENDAR EVENTS
    // ============================================
    console.log('\n📅 Creating calendar events...');
    
    const calendarEvents = await sql`
      INSERT INTO calendar_events (
        title, description, event_date, start_time, end_time,
        event_type, color, is_all_day, created_by
      )
      VALUES
        (
          'Halloween Party',
          'Gemeinsame Halloween-Feier für alle Teams',
          '2025-10-31',
          '18:00',
          '21:00',
          'other',
          '#FF6B9D',
          false,
          ${adminUser.id}
        ),
        (
          'Weihnachtsferien',
          'Trainingspause über die Feiertage',
          '2025-12-24',
          null,
          null,
          'holiday',
          '#50E3C2',
          true,
          ${adminUser.id}
        ),
        (
          'Coach Meeting',
          'Monatliches Trainer-Treffen',
          '2025-11-05',
          '19:00',
          '21:00',
          'meeting',
          '#4A90E2',
          false,
          ${adminUser.id}
        ),
        (
          'Uniform Bestellung Deadline',
          'Letzter Tag für Uniform-Bestellungen',
          '2025-11-10',
          null,
          null,
          'deadline',
          '#F5A623',
          true,
          ${adminUser.id}
        ),
        (
          'Elternabend',
          'Informationsveranstaltung für alle Eltern',
          '2025-11-12',
          '19:00',
          '20:30',
          'meeting',
          '#8B5CF6',
          false,
          ${adminUser.id}
        )
      RETURNING id, title
    `;
    
    console.log(`   ✅ Created ${calendarEvents.length} calendar events`);
    
    // ============================================
    // 13. CREATE COMMENTS
    // ============================================
    console.log('\n💬 Creating coach comments...');
    
    // Einige Beispiel-Kommentare
    const comments = await sql`
      INSERT INTO comments (
        author_id, member_id, content, comment_type, is_private, is_important
      )
      VALUES
        (
          ${coaches[0].id},
          ${members[0].id},
          'Emma zeigt großes Potential beim Tumbling! Sehr motiviert und konzentriert.',
          'praise',
          false,
          false
        ),
        (
          ${coaches[1].id},
          ${members[5].id},
          'Leon sollte mehr an seiner Körperspannung arbeiten. Zusätzliche Übungen empfohlen.',
          'feedback',
          false,
          false
        ),
        (
          ${coaches[2].id},
          ${members[12].id},
          'Anna hat sich enorm verbessert! Bereit für schwierigere Stunts.',
          'praise',
          false,
          true
        ),
        (
          ${coaches[3].id},
          ${members[17].id},
          'Jonas fehlt seit 2 Wochen. Bitte Kontakt zu Eltern aufnehmen.',
          'warning',
          true,
          true
        )
      RETURNING id
    `;
    
    console.log(`   ✅ Created ${comments.length} comments`);
    
    // ============================================
    // 14. STATISTICS
    // ============================================
    console.log('\n📊 Database Statistics:');
    
    const stats = await sql`
      SELECT
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM teams) as teams,
        (SELECT COUNT(*) FROM members) as members,
        (SELECT COUNT(*) FROM events) as events,
        (SELECT COUNT(*) FROM trainings) as trainings,
        (SELECT COUNT(*) FROM event_participants) as event_participants,
        (SELECT COUNT(*) FROM training_attendance) as training_attendance,
        (SELECT COUNT(*) FROM parent_children) as parent_relationships,
        (SELECT COUNT(*) FROM calendar_events) as calendar_events,
        (SELECT COUNT(*) FROM comments) as comments
    `;
    
    const s = stats[0];
    console.log(`   👤 Users: ${s.users}`);
    console.log(`   🏆 Teams: ${s.teams}`);
    console.log(`   👥 Members: ${s.members}`);
    console.log(`   🎉 Events: ${s.events}`);
    console.log(`   💪 Trainings: ${s.trainings}`);
    console.log(`   ✋ Event Participants: ${s.event_participants}`);
    console.log(`   📝 Training Attendance: ${s.training_attendance}`);
    console.log(`   👨‍👩‍👧 Parent Relationships: ${s.parent_relationships}`);
    console.log(`   📅 Calendar Events: ${s.calendar_events}`);
    console.log(`   💬 Comments: ${s.comments}`);
    
    console.log('\n🎉 Database seeding complete!\n');
    console.log('🔐 Login Credentials:');
    console.log('   Admin:  qtec / Kai.p0104331780');
    console.log('   Coach:  sarah / coach123  (or mike, lisa, alex)');
    console.log('   Parent: sandra.mueller / parent123  (or any parent email prefix)\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error);
    throw error;
  }
}

resetAndSeed().catch(console.error);
