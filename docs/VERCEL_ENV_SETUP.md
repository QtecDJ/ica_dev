# Vercel Environment Variables Setup

## CRON_SECRET einrichten

Das `CRON_SECRET` schützt den automatischen Cleanup-Endpunkt vor unbefugtem Zugriff.

### Schritt-für-Schritt Anleitung:

1. **Secret generieren**
   
   Öffne ein Terminal und führe aus:
   ```bash
   openssl rand -base64 32
   ```
   
   Oder verwende einen Online-Generator wie: https://www.random.org/strings/
   
   Beispiel-Output: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`

2. **In Vercel hinzufügen**
   
   a. Gehe zu: https://vercel.com/dashboard
   
   b. Wähle dein Projekt aus
   
   c. Klicke auf "Settings" (Zahnrad-Symbol)
   
   d. Wähle "Environment Variables" in der linken Sidebar
   
   e. Füge eine neue Variable hinzu:
      - **Name**: `CRON_SECRET`
      - **Value**: Dein generiertes Secret (z.B. `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`)
      - **Environment**: Wähle "Production", "Preview" und "Development" (alle)
   
   f. Klicke auf "Save"

3. **Neues Deployment auslösen**
   
   Nach dem Hinzufügen der Environment Variable muss ein neues Deployment erstellt werden:
   
   **Option A - Über Git:**
   ```bash
   git commit --allow-empty -m "Trigger deployment for env vars"
   git push
   ```
   
   **Option B - Über Vercel Dashboard:**
   - Gehe zu "Deployments"
   - Klicke auf die drei Punkte bei einem Deployment
   - Wähle "Redeploy"
   - Hake "Use existing Build Cache" ab
   - Klicke "Redeploy"

4. **Verifizieren**
   
   Überprüfe, ob das Secret richtig gesetzt ist:
   
   a. Gehe zu "Settings" → "Environment Variables"
   
   b. Du solltest `CRON_SECRET` in der Liste sehen (der Wert ist verborgen aus Sicherheitsgründen)
   
   c. Teste den Cron-Endpunkt:
   ```bash
   curl -X POST https://deine-domain.vercel.app/api/cron/cleanup-old-trainings
   ```
   
   Du solltest einen `401 Unauthorized` Fehler bekommen (das ist gut - bedeutet der Schutz funktioniert!)

## Weitere Environment Variables

Falls du weitere Environment Variables benötigst:

### DATABASE_URL
- Automatisch von Vercel Postgres gesetzt
- Sollte bereits vorhanden sein

### NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```
Füge wie oben beschrieben hinzu.

### NEXTAUTH_URL
- **Production**: `https://deine-domain.vercel.app`
- **Preview**: Lasse leer (Vercel setzt automatisch)
- **Development**: `http://localhost:3000`

## Lokales Testen

Um den Cron-Job lokal zu testen:

1. Erstelle/Bearbeite `.env.local`:
   ```env
   DATABASE_URL=dein-database-url
   CRON_SECRET=test-secret-für-lokal-123
   NEXTAUTH_SECRET=dein-nextauth-secret
   NEXTAUTH_URL=http://localhost:3000
   ```

2. Starte den Dev-Server:
   ```bash
   npm run dev
   ```

3. Teste den Endpunkt:
   ```bash
   curl -X POST http://localhost:3000/api/cron/cleanup-old-trainings \
     -H "Authorization: Bearer test-secret-für-lokal-123"
   ```

## Troubleshooting

### "Unauthorized" Fehler im Cron-Job
- Überprüfe, ob `CRON_SECRET` in allen Environments gesetzt ist
- Versuche ein Redeploy (mit Cache löschen)
- Prüfe die Function Logs in Vercel

### Environment Variable wird nicht erkannt
- Stelle sicher, dass du nach dem Setzen neu deployed hast
- Überprüfe, ob die Variable für das richtige Environment (Production/Preview/Development) gesetzt ist
- Verwende `console.log(process.env.CRON_SECRET ? 'Set' : 'Not set')` zum Debuggen

### Cron-Job läuft nicht automatisch
- Überprüfe, ob `vercel.json` committed und gepusht wurde
- Prüfe in Vercel Dashboard → Settings → Cron Jobs
- Vercel Cron ist nur in Pro und Enterprise Plänen verfügbar (Hobby-Plan: manueller Aufruf notwendig)

## Sicherheitshinweise

⚠️ **Wichtig:**
- Speichere Secrets NIEMALS in Git
- Verwende verschiedene Secrets für Production, Preview und Development
- Rotiere Secrets regelmäßig (alle 3-6 Monate)
- Teile Secrets nicht über unsichere Kanäle (E-Mail, Slack, etc.)

✅ **Best Practices:**
- Verwende starke, zufällig generierte Secrets (mindestens 32 Zeichen)
- Dokumentiere, welche Secrets wo verwendet werden
- Speichere Backup der Secrets sicher (z.B. in einem Password Manager)
- Beschränke Zugriff auf Vercel Project Settings auf vertrauenswürdige Personen
