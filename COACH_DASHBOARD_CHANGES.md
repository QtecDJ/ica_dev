# Coach Dashboard & Absage-Grund Feature

## Implementierte Änderungen (05.11.2025)

### 1. Coach Dashboard - Nur eigene Team-Statistiken

**Problem:** Coaches haben alle Zu- und Absagen aller Teams gesehen.

**Lösung:** 
- Coaches sehen jetzt nur noch Zu- und Absagen von ihren eigenen Teams
- Die Statistiken werden basierend auf der `team_coaches` Tabelle gefiltert
- Admin sieht weiterhin alle Statistiken

**Geänderte Datei:** `/app/page.tsx`

```typescript
// Coach Teams ermitteln
const coachTeamIds = userRole === "coach" 
  ? await sql`SELECT team_id FROM team_coaches WHERE coach_id = ${session?.user?.id}`
  : [];

// SQL-Query filtert nach Coach-Teams
WHERE t.team_id = ANY(${coachTeamIdList})
```

**Anzeige:**
- Admin: "Zusagen" / "Absagen"
- Coach: "Zusagen (Meine Teams)" / "Absagen (Meine Teams)"

---

### 2. Pflicht-Absage-Grund

**Problem:** Absagen konnten ohne Begründung erfolgen.

**Lösung:**
- Neue Datenbank-Spalte: `training_attendance.decline_reason` (TEXT)
- Dialog-Modal wird beim Absagen geöffnet
- Grund muss angegeben werden, bevor Absage gespeichert wird
- Validierung in der Backend-Funktion

**Migrations-Datei:** `/migrations/add_decline_reason.sql`
**Migrations-Script:** `/run-decline-reason-migration.mjs`

**Ausführen:**
```bash
node run-decline-reason-migration.mjs
```

✅ **Erfolgreich ausgeführt am 05.11.2025**

**Geänderte Dateien:**
1. `/app/actions.ts` - `updateAttendanceStatus()` Funktion
   - Neuer Parameter: `declineReason?: string`
   - Validierung: Grund muss bei Status "declined" vorhanden sein
   - Speichert decline_reason in der Datenbank

2. `/app/components/AttendanceButtons.tsx`
   - Neuer State: `showDeclineDialog`, `declineReason`, `error`
   - Dialog-Modal mit Textarea für Absage-Grund
   - Anzeige des Absage-Grundes wenn vorhanden
   - Validierung vor dem Speichern

---

## Features im Detail

### Coach-Dashboard Filterung

**Vorher:**
```sql
SELECT COUNT(CASE WHEN ta.status = 'accepted' THEN 1 END)
FROM trainings t
LEFT JOIN training_attendance ta ON t.id = ta.training_id
WHERE t.training_date >= CURRENT_DATE
```

**Nachher (für Coaches):**
```sql
SELECT COUNT(CASE WHEN ta.status = 'accepted' THEN 1 END)
FROM trainings t
LEFT JOIN training_attendance ta ON t.id = ta.training_id
WHERE t.training_date >= CURRENT_DATE
  AND t.team_id = ANY(${coachTeamIdList})
```

### Absage-Dialog UI

**Design:**
- Modal Overlay mit schwarzem Hintergrund (50% Opacity)
- Moderne Card mit abgerundeten Ecken (rounded-2xl)
- Warnsymbol (AlertCircle) in rotem Kreis
- Große Textarea (4 Zeilen)
- Auto-Focus auf Textarea
- Disabled-State für Button wenn kein Grund angegeben
- Error-Anzeige falls Validierung fehlschlägt

**Platzhalter-Text:**
```
z.B. Krankheit, Familiäre Verpflichtungen, Anderer Termin...
```

---

## Datenbank-Schema

### training_attendance Tabelle - Neue Spalte

```sql
ALTER TABLE training_attendance 
ADD COLUMN decline_reason TEXT;

COMMENT ON COLUMN training_attendance.decline_reason 
IS 'Reason provided when declining training attendance';
```

**Felder:**
- `id` (SERIAL PRIMARY KEY)
- `training_id` (INTEGER, FK)
- `member_id` (INTEGER, FK)
- `status` (VARCHAR(20): 'pending', 'accepted', 'declined', 'attended', 'absent')
- `decline_reason` (TEXT) ← **NEU**
- `response_date` (TIMESTAMP)
- `checked_in` (BOOLEAN)
- `check_in_time` (TIMESTAMP)
- `comment` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

---

## Testing

### Test als Coach:
1. Login als Coach-User
2. Dashboard öffnen
3. Prüfen: Nur Statistiken der eigenen Teams sichtbar
4. Zu einem Training navigieren
5. "Absagen" Button klicken
6. Dialog erscheint → Grund eingeben erforderlich
7. Ohne Grund → Button disabled
8. Mit Grund → Absage wird gespeichert
9. Absage-Grund wird angezeigt

### Test als Admin:
1. Login als Admin
2. Dashboard zeigt alle Team-Statistiken
3. Gleiche Absage-Funktionalität wie Coach

---

## API-Änderungen

### updateAttendanceStatus()

**Signature:**
```typescript
export async function updateAttendanceStatus(
  trainingId: number,
  memberId: number,
  status: "accepted" | "declined" | "pending",
  comment?: string,
  declineReason?: string // NEU
): Promise<{ success: boolean; error?: string }>
```

**Validierung:**
```typescript
if (status === "declined" && !declineReason) {
  return { 
    success: false, 
    error: "Ein Grund für die Absage muss angegeben werden" 
  };
}
```

**SQL Update:**
```sql
INSERT INTO training_attendance (training_id, member_id, status, comment, decline_reason)
VALUES ($1, $2, $3, $4, $5)
ON CONFLICT (training_id, member_id)
DO UPDATE SET
  status = $3,
  comment = $4,
  decline_reason = $5,
  response_date = CURRENT_TIMESTAMP,
  updated_at = CURRENT_TIMESTAMP
```

---

## Rollback (falls nötig)

```sql
-- Entferne decline_reason Spalte
ALTER TABLE training_attendance DROP COLUMN decline_reason;
```

**Code-Änderungen rückgängig machen:**
1. `git checkout HEAD -- app/page.tsx`
2. `git checkout HEAD -- app/actions.ts`
3. `git checkout HEAD -- app/components/AttendanceButtons.tsx`

---

## Weitere Verbesserungen (optional)

### Zukünftige Features:
- [ ] Export der Absage-Gründe als CSV für Analyse
- [ ] Statistiken: Häufigste Absage-Gründe
- [ ] Email-Benachrichtigung an Coach bei Absage mit Grund
- [ ] Historie der Absage-Gründe pro Mitglied
- [ ] Vordefinierte Absage-Gründe zur Auswahl (Dropdown)
- [ ] Dashboard: Anzeige der letzten 5 Absagen mit Gründen

---

## Zusammenfassung

✅ **Coaches sehen nur noch ihre eigenen Team-Statistiken**
✅ **Absagen benötigen einen Grund**
✅ **Moderner Dialog mit Validierung**
✅ **Datenbank-Migration erfolgreich**
✅ **Backwards-compatible (bestehende Absagen ohne Grund bleiben gültig)**

**Status:** Produktionsbereit
**Getestet:** ✅ Lokal erfolgreich
**Migration:** ✅ Ausgeführt
