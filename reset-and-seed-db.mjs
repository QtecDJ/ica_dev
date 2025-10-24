import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

console.log('🔄 Resetting database...\n');

try {
  // 1. Lösche alle Daten (in richtiger Reihenfolge wegen Foreign Keys)
  console.log('🗑️  Deleting old data...');
  
  await sql`DELETE FROM training_attendance`;
  console.log('   ✅ training_attendance cleared');
  
  await sql`DELETE FROM event_participants`;
  console.log('   ✅ event_participants cleared');
  
  await sql`DELETE FROM calendar_events`;
  console.log('   ✅ calendar_events cleared');
  
  await sql`DELETE FROM comments`;
  console.log('   ✅ comments cleared');
  
  await sql`DELETE FROM parent_children`;
  console.log('   ✅ parent_children cleared');
  
  await sql`DELETE FROM trainings`;
  console.log('   ✅ trainings cleared');
  
  await sql`DELETE FROM events`;
  console.log('   ✅ events cleared');
  
  await sql`DELETE FROM members`;
  console.log('   ✅ members cleared');
  
  await sql`DELETE FROM teams`;
  console.log('   ✅ teams cleared');
  
  await sql`DELETE FROM users`;
  console.log('   ✅ users cleared');

  console.log('\n✨ All old data deleted!\n');

  // 2. Erstelle Admin User (Qtec)
  console.log('👤 Creating admin user...');
  const hashedPassword = await bcrypt.hash('Kai.p0104331780', 10);
  
  const adminUser = await sql`
    INSERT INTO users (username, password_hash, role, name, email)
    VALUES ('qtec', ${hashedPassword}, 'admin', 'Kai Qtec', 'kai@ica.de')
    RETURNING id, username, role
  `;
  console.log('   ✅ Admin created:', adminUser[0].username);

  // 3. Erstelle Teams
  console.log('\n🏆 Creating teams...');
  const teams = await sql`
    INSERT INTO teams (name, level, coach)
    VALUES
      ('Mini Stars', 'Level 1', 'Coach Sarah'),
      ('Junior Flyers', 'Level 2', 'Coach Mike'),
      ('Youth Elite', 'Level 3', 'Coach Lisa'),
      ('Senior All Stars', 'Level 4', 'Coach Alex')
    RETURNING id, name, level
  `;
  console.log(`   ✅ ${teams.length} teams created`);
  teams.forEach(t => console.log(`      - ${t.name} (${t.level})`));

  // 4. Erstelle Coaches als User
  console.log('\n👥 Creating coach users...');
  const coachPassword = await bcrypt.hash('coach123', 10);
  
  const coaches = await sql`
    INSERT INTO users (username, password_hash, role, name, email)
    VALUES
      ('sarah', ${coachPassword}, 'coach', 'Sarah Klein', 'sarah@ica.de'),
      ('mike', ${coachPassword}, 'coach', 'Mike Weber', 'mike@ica.de'),
      ('lisa', ${coachPassword}, 'coach', 'Lisa Schneider', 'lisa@ica.de'),
      ('alex', ${coachPassword}, 'coach', 'Alex Müller', 'alex@ica.de')
    RETURNING id, username, name
  `;
  console.log(`   ✅ ${coaches.length} coaches created`);

  // 5. Erstelle Members
  console.log('\n👶 Creating members...');
  
  // Team 1: Mini Stars
  const miniStars = await sql`
    INSERT INTO members (first_name, last_name, email, phone, birth_date, team_id, avatar_url)
    VALUES
      ('Emma', 'Schmidt', 'emma.schmidt@email.de', '0151-1234567', '2017-03-15', ${teams[0].id}, NULL),
      ('Leon', 'Müller', 'leon.mueller@email.de', '0152-2345678', '2017-07-22', ${teams[0].id}, NULL),
      ('Mia', 'Weber', 'mia.weber@email.de', '0153-3456789', '2018-01-10', ${teams[0].id}, NULL),
      ('Noah', 'Fischer', 'noah.fischer@email.de', '0154-4567890', '2017-11-05', ${teams[0].id}, NULL)
    RETURNING id, first_name, last_name
  `;
  
  // Team 2: Junior Flyers
  const juniorFlyers = await sql`
    INSERT INTO members (first_name, last_name, email, phone, birth_date, team_id)
    VALUES
      ('Sophie', 'Becker', 'sophie.becker@email.de', '0155-5678901', '2014-05-12', ${teams[1].id}),
      ('Lukas', 'Hoffmann', 'lukas.hoffmann@email.de', '0156-6789012', '2014-09-18', ${teams[1].id}),
      ('Hannah', 'Schulz', 'hannah.schulz@email.de', '0157-7890123', '2015-02-25', ${teams[1].id}),
      ('Felix', 'Wagner', 'felix.wagner@email.de', '0158-8901234', '2014-12-03', ${teams[1].id}),
      ('Lena', 'Bauer', 'lena.bauer@email.de', '0159-9012345', '2015-06-20', ${teams[1].id})
    RETURNING id, first_name, last_name
  `;
  
  // Team 3: Youth Elite
  const youthElite = await sql`
    INSERT INTO members (first_name, last_name, email, phone, birth_date, team_id)
    VALUES
      ('Julia', 'Koch', 'julia.koch@email.de', '0160-0123456', '2011-04-08', ${teams[2].id}),
      ('Tim', 'Richter', 'tim.richter@email.de', '0161-1234567', '2011-10-15', ${teams[2].id}),
      ('Laura', 'Klein', 'laura.klein@email.de', '0162-2345678', '2012-01-30', ${teams[2].id}),
      ('Max', 'Wolf', 'max.wolf@email.de', '0163-3456789', '2011-08-22', ${teams[2].id}),
      ('Anna', 'Schröder', 'anna.schroeder@email.de', '0164-4567890', '2012-03-17', ${teams[2].id}),
      ('Ben', 'Neumann', 'ben.neumann@email.de', '0165-5678901', '2011-11-09', ${teams[2].id})
    RETURNING id, first_name, last_name
  `;
  
  // Team 4: Senior All Stars
  const seniorAllStars = await sql`
    INSERT INTO members (first_name, last_name, email, phone, birth_date, team_id)
    VALUES
      ('Sarah', 'Meyer', 'sarah.meyer@email.de', '0166-6789012', '2008-02-14', ${teams[3].id}),
      ('David', 'Zimmermann', 'david.zimmermann@email.de', '0167-7890123', '2007-06-25', ${teams[3].id}),
      ('Lisa', 'Braun', 'lisa.braun@email.de', '0168-8901234', '2008-09-03', ${teams[3].id}),
      ('Paul', 'Hartmann', 'paul.hartmann@email.de', '0169-9012345', '2007-12-19', ${teams[3].id}),
      ('Nina', 'Schmitt', 'nina.schmitt@email.de', '0170-0123456', '2008-04-27', ${teams[3].id})
    RETURNING id, first_name, last_name
  `;

  const allMembers = [...miniStars, ...juniorFlyers, ...youthElite, ...seniorAllStars];
  console.log(`   ✅ ${allMembers.length} members created`);
  console.log(`      - Team 1 (Mini Stars): ${miniStars.length} members`);
  console.log(`      - Team 2 (Junior Flyers): ${juniorFlyers.length} members`);
  console.log(`      - Team 3 (Youth Elite): ${youthElite.length} members`);
  console.log(`      - Team 4 (Senior All Stars): ${seniorAllStars.length} members`);

  // 6. Erstelle Events
  console.log('\n📅 Creating events...');
  const events = await sql`
    INSERT INTO events (
      title, description, event_date, location, event_type,
      start_time, end_time, max_participants, is_mandatory, notes
    ) VALUES
      (
        'Regionale Qualifikation München',
        'Erste Qualifikationsrunde für die Deutsche Meisterschaft',
        '2025-11-15',
        'Olympiahalle München',
        'competition',
        '09:00:00',
        '18:00:00',
        100,
        true,
        'Alle Teams müssen teilnehmen. Bitte bis 08:30 Uhr vor Ort sein!'
      ),
      (
        'Winter Showcase 2025',
        'Jahresabschluss-Show vor Eltern und Freunden',
        '2025-12-20',
        'ICA Trainingshalle',
        'showcase',
        '18:00:00',
        '21:00:00',
        NULL,
        false,
        'Einladungen für Familien werden verschickt'
      ),
      (
        'Tumbling Workshop',
        'Spezielles Tumbling-Training mit Gasttrainer',
        '2025-11-08',
        'ICA Trainingshalle',
        'workshop',
        '14:00:00',
        '17:00:00',
        20,
        false,
        'Für fortgeschrittene Athleten (Level 2+)'
      ),
      (
        'Team Building Tag',
        'Gemeinsamer Ausflug und Teambuilding-Aktivitäten',
        '2025-11-22',
        'Kletterpark Augsburg',
        'other',
        '10:00:00',
        '16:00:00',
        50,
        false,
        'Bitte wetterfeste Kleidung mitbringen'
      ),
      (
        'Deutsche Meisterschaft',
        'Nationale Meisterschaft - Finale',
        '2025-12-13',
        'SAP Arena Mannheim',
        'competition',
        '08:00:00',
        '19:00:00',
        80,
        true,
        'Nur qualifizierte Teams'
      )
    RETURNING id, title, event_date
  `;
  console.log(`   ✅ ${events.length} events created`);

  // 7. Füge Teilnehmer zu Events hinzu (nur für Pflicht-Events)
  console.log('\n👥 Adding event participants...');
  
  const mandatoryEvents = events.filter((e, idx) => [0, 4].includes(idx)); // Event 1 und 5 sind Pflicht
  
  for (const event of mandatoryEvents) {
    // Füge alle Members hinzu (außer Mini Stars für DM)
    const eligibleMembers = event.id === events[4].id 
      ? [...juniorFlyers, ...youthElite, ...seniorAllStars] 
      : allMembers;
    
    for (const member of eligibleMembers) {
      await sql`
        INSERT INTO event_participants (event_id, member_id, status)
        VALUES (${event.id}, ${member.id}, 'pending')
      `;
    }
  }
  console.log(`   ✅ Participants added to mandatory events`);

  // 8. Erstelle Trainings
  console.log('\n💪 Creating trainings...');
  const trainings = await sql`
    INSERT INTO trainings (team_id, training_date, start_time, end_time, location, notes)
    VALUES
      (${teams[0].id}, '2025-10-28', '16:00:00', '17:30:00', 'Halle A', 'Grundlagen Tumbling'),
      (${teams[0].id}, '2025-10-30', '16:00:00', '17:30:00', 'Halle A', 'Choreographie üben'),
      (${teams[1].id}, '2025-10-29', '17:00:00', '18:30:00', 'Halle B', 'Stunts und Pyramiden'),
      (${teams[1].id}, '2025-10-31', '17:00:00', '18:30:00', 'Halle B', 'Routine Durchlauf'),
      (${teams[2].id}, '2025-10-28', '18:00:00', '20:00:00', 'Halle C', 'Wettkampfvorbereitung'),
      (${teams[2].id}, '2025-10-30', '18:00:00', '20:00:00', 'Halle C', 'Partner Stunts'),
      (${teams[2].id}, '2025-11-01', '18:00:00', '20:00:00', 'Halle C', 'Full Routine'),
      (${teams[3].id}, '2025-10-29', '19:00:00', '21:00:00', 'Haupthalle', 'Advanced Tumbling'),
      (${teams[3].id}, '2025-10-31', '19:00:00', '21:00:00', 'Haupthalle', 'Choreographie'),
      (${teams[3].id}, '2025-11-02', '19:00:00', '21:00:00', 'Haupthalle', 'Routine Polish')
    RETURNING id, training_date, team_id
  `;
  console.log(`   ✅ ${trainings.length} trainings created`);

  // 9. Erstelle Calendar Events
  console.log('\n📆 Creating calendar events...');
  const calendarEvents = await sql`
    INSERT INTO calendar_events (
      title, description, event_date, event_type, location, 
      start_time, end_time, created_by
    ) VALUES
      (
        'Allerheiligen',
        'Feiertag - Keine Trainings',
        '2025-11-01',
        'holiday',
        NULL,
        NULL,
        NULL,
        ${adminUser[0].id}
      ),
      (
        'Trainer Meeting',
        'Monatliches Coaching Team Meeting',
        '2025-11-05',
        'meeting',
        'Büro ICA',
        '19:00:00',
        '21:00:00',
        ${adminUser[0].id}
      ),
      (
        'Kostüm Deadline',
        'Letzter Tag für Kostümbestellungen',
        '2025-11-10',
        'deadline',
        NULL,
        NULL,
        NULL,
        ${adminUser[0].id}
      ),
      (
        'Erste Hilfe Kurs',
        'Auffrischungskurs für alle Trainer',
        '2025-11-12',
        'other',
        'Rotes Kreuz München',
        '14:00:00',
        '18:00:00',
        ${adminUser[0].id}
      )
    RETURNING id, title, event_date
  `;
  console.log(`   ✅ ${calendarEvents.length} calendar events created`);

  // Zusammenfassung
  console.log('\n✨ Database reset complete!\n');
  console.log('📊 Summary:');
  console.log(`   - ${1} Admin user`);
  console.log(`   - ${coaches.length} Coach users`);
  console.log(`   - ${teams.length} Teams`);
  console.log(`   - ${allMembers.length} Members`);
  console.log(`   - ${events.length} Events`);
  console.log(`   - ${trainings.length} Trainings`);
  console.log(`   - ${calendarEvents.length} Calendar Events`);
  console.log('\n🔐 Login Credentials:');
  console.log('   Admin: qtec / Kai.p0104331780');
  console.log('   Coaches: sarah, mike, lisa, alex / coach123');
  console.log('\n🚀 Ready to use!');

} catch (error) {
  console.error('\n❌ Error:', error);
  process.exit(1);
}
