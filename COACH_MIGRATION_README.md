# Coach Foreign Key Migration

## Was wurde geändert?

Die `teams` Tabelle hat jetzt eine `coach_id` Spalte als Foreign Key zur `users` Tabelle, anstatt nur den Coach-Namen als VARCHAR zu speichern.

### Schema-Änderungen:
- ✅ Neue Spalte: `teams.coach_id` (INTEGER, Foreign Key zu `users.id`)
- ✅ Foreign Key Constraint: `fk_teams_coach`
- ✅ Index: `idx_teams_coach_id`
- ℹ️  Alte Spalte `teams.coach` (VARCHAR) bleibt erhalten für Referenz

### Auswirkungen:

**Nachrichten-System:**
- ✅ Eltern können nur ihrem **eigenen Team-Coach** schreiben
- ✅ Mitglieder können nur ihrem **eigenen Team-Coach** schreiben  
- ✅ Coaches sehen nur **Eltern aus ihren eigenen Teams**
- ✅ Übersichtliche, team-basierte Kommunikation

## Migration ausführen

### Lokal (bereits ausgeführt):
```bash
node run-coach-migration.mjs
```

### Auf Vercel/Production:

Das Deployment auf Vercel führt die Migration **automatisch NICHT** aus. 

Du hast 2 Optionen:

#### Option 1: Über Neon Dashboard (empfohlen)
1. Gehe zu: https://console.neon.tech/
2. Öffne dein Projekt
3. Gehe zu "SQL Editor"
4. Führe das SQL aus `migrations/add_coach_id_fk_to_teams.sql` aus

#### Option 2: Über lokales Script
```bash
# Mit Production DATABASE_URL
DATABASE_URL="postgresql://..." node run-coach-migration.mjs
```

## Aktuelle Coach-Zuweisungen:

| Team       | Coach          | User ID |
|------------|----------------|---------|
| Sparkles   | Adriana Wenzel | 91      |
| Princesses | Sarah Schmidt  | 67      |

## Coach-Zuweisung ändern:

```sql
-- Team einem anderen Coach zuweisen
UPDATE teams SET coach_id = <user_id> WHERE name = '<team_name>';

-- Beispiel: Princesses -> Adriana Wenzel
UPDATE teams SET coach_id = 91 WHERE name = 'Princesses';
```

## Neue Coaches/Teams:

```sql
-- Neues Team mit Coach erstellen
INSERT INTO teams (name, level, coach_id)
VALUES ('Junior All Stars', 'Level 1', 91);

-- Bestehenden Coach einem Team zuweisen
UPDATE teams 
SET coach_id = (SELECT id FROM users WHERE name = 'Coach Name' AND role IN ('coach', 'admin'))
WHERE name = 'Team Name';
```

## Rollback (falls nötig):

```sql
-- Entferne Foreign Key Constraint
ALTER TABLE teams DROP CONSTRAINT fk_teams_coach;

-- Entferne Index
DROP INDEX idx_teams_coach_id;

-- Entferne Spalte
ALTER TABLE teams DROP COLUMN coach_id;
```

## Status:
- ✅ Lokal getestet
- ✅ Migration-Script erstellt
- ✅ Code deployed auf Vercel
- ⏳ **Muss noch auf Production-DB ausgeführt werden**
