# Automatisches Löschen alter Trainings

Dieses System löscht automatisch Trainings und deren Attendance-Einträge (Zusagen/Absagen/Gründe), die älter als 1 Tag sind.

## Wie es funktioniert

### 1. Vercel Cron Job
Die Datei `vercel.json` enthält eine Cron-Konfiguration:
```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-old-trainings",
      "schedule": "0 3 * * *"
    }
  ]
}
```

**Schedule**: `0 3 * * *` = Täglich um 3:00 Uhr morgens (UTC)

### 2. Cleanup API (`/api/cron/cleanup-old-trainings`)
Der API-Endpunkt:
- Berechnet das Cutoff-Datum (1 Tag vor heute)
- Löscht alle `training_attendance` Einträge für alte Trainings
- Löscht alle `trainings` Einträge, die älter als das Cutoff-Datum sind
- Gibt detaillierte Logs und Statistiken zurück

### 3. Sicherheit
Der Endpunkt ist durch ein `CRON_SECRET` geschützt:
- In Vercel: Environment Variable `CRON_SECRET` setzen
- Der Cron-Job sendet dieses Secret automatisch im Authorization-Header
- Verhindert unautorisierten Zugriff auf den Cleanup-Endpunkt

## Setup

### Vercel Environment Variables
Füge in den Vercel Project Settings → Environment Variables hinzu:

```
CRON_SECRET=your-random-secret-here-use-a-strong-password
```

**Tipp**: Generiere ein starkes Secret mit:
```bash
openssl rand -base64 32
```

### Lokales Testen
Um den Cleanup lokal zu testen:

```bash
# .env.local
CRON_SECRET=test-secret-123

# Terminal
curl -X POST http://localhost:3000/api/cron/cleanup-old-trainings \
  -H "Authorization: Bearer test-secret-123"
```

## Was wird gelöscht?

**Beispiel**: Heute ist der 8. November 2025

- ✅ **Wird gelöscht**: Trainings vom 6. November und älter (älter als 1 Tag)
- ❌ **Bleibt**: Trainings vom 7. November (gestern - genau 1 Tag alt)
- ❌ **Bleibt**: Trainings vom 8. November und neuer (heute und zukünftig)

### Gelöscht werden:
1. **Trainings** aus der `trainings` Tabelle
2. **Attendance Records** aus der `training_attendance` Tabelle:
   - Zusagen (status = 'accepted')
   - Absagen (status = 'declined')
   - Decline Reasons (decline_reason Feld)
   - Timestamps (created_at, updated_at)

## Logs überwachen

### In Vercel Dashboard
1. Gehe zu deinem Projekt
2. Klicke auf "Functions" → "Logs"
3. Filtere nach `/api/cron/cleanup-old-trainings`

### Log-Beispiele

**Erfolgreicher Cleanup:**
```
🧹 Starting cleanup for trainings older than 2025-11-06
📋 Found 3 trainings to delete
🗑️  Deleted 15 attendance records
🗑️  Deleted 3 trainings
✅ Cleanup completed: { deleted: { trainings: 3, attendance: 15 } }
```

**Keine alten Trainings:**
```
🧹 Starting cleanup for trainings older than 2025-11-06
✅ No old trainings to delete
```

**Fehler:**
```
❌ Error during cleanup: [Error details]
```

## Manueller Cleanup

Falls du den Cleanup manuell auslösen möchtest:

### Mit Vercel CLI:
```bash
vercel env pull .env.local
# Get the CRON_SECRET from .env.local
curl -X POST https://your-domain.vercel.app/api/cron/cleanup-old-trainings \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Über Vercel Dashboard:
1. Gehe zu "Deployments" → "Functions"
2. Finde den Cron Job
3. Klicke "Run Now"

## Zeitplan anpassen

Bearbeite `vercel.json` um den Zeitplan zu ändern:

```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-old-trainings",
      "schedule": "0 4 * * *"  // 4:00 Uhr morgens UTC
    }
  ]
}
```

### Cron Schedule Format:
```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Wochentag (0-6, Sonntag = 0)
│ │ │ └───── Monat (1-12)
│ │ └─────── Tag (1-31)
│ └───────── Stunde (0-23)
└─────────── Minute (0-59)
```

**Beispiele:**
- `0 3 * * *` - Täglich um 3:00 Uhr UTC
- `0 */6 * * *` - Alle 6 Stunden
- `0 2 * * 1` - Jeden Montag um 2:00 Uhr UTC
- `30 4 * * *` - Täglich um 4:30 Uhr UTC

## Wichtige Hinweise

⚠️ **Daten sind unwiederbringlich gelöscht** - Es gibt keine Möglichkeit, gelöschte Trainings wiederherzustellen.

💡 **Tipp**: Falls du die Daten archivieren möchtest statt zu löschen, erstelle eine `trainings_archive` Tabelle und verschiebe die Daten dorthin.

🔒 **Sicherheit**: Der CRON_SECRET sollte:
- Mindestens 32 Zeichen lang sein
- Zufällig generiert sein
- Nicht in Git committed werden
- Nur in Vercel Environment Variables gespeichert sein

## Fehlerbehebung

### Cron Job läuft nicht
1. Überprüfe Vercel Dashboard → Settings → Cron Jobs
2. Stelle sicher, dass das Feature für deinen Plan verfügbar ist
3. Prüfe die Function Logs auf Fehler

### "Unauthorized" Fehler
1. Überprüfe, ob `CRON_SECRET` in Vercel gesetzt ist
2. Stelle sicher, dass das Secret übereinstimmt
3. Re-deploye nach dem Setzen neuer Environment Variables

### Trainings werden nicht gelöscht
1. Prüfe die Logs - was sagt der Output?
2. Überprüfe das Cutoff-Datum im Log
3. Teste den Endpunkt manuell mit curl
4. Überprüfe die Datenbankverbindung (DATABASE_URL)

## Support

Bei Fragen oder Problemen:
1. Überprüfe die Function Logs in Vercel
2. Teste den Endpunkt lokal
3. Prüfe die Datenbank-Permissions
