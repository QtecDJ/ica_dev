# Dashboard Content Management System (CMS)

Das Dashboard Content Management System ermöglicht es Admins, dynamische Inhalte für das Dashboard zu erstellen und zu verwalten. Dies umfasst Willkommensnachrichten, Ankündigungen, Livestreams und mehr.

## ✨ Features

### Content-Typen
- **Willkommen** - Begrüßungsnachrichten für neue User
- **Ankündigung** - Wichtige Informationen und Updates
- **Livestream** - Video-Einbettung für Meisterschaften (YouTube, Twitch, Vimeo)
- **Alert** - Dringende Meldungen
- **Information** - Allgemeine Infos

### Zielgruppen-Targeting
- **Eltern** - Nur für Parent-Rolle sichtbar
- **Mitglieder** - Nur für Member-Rolle sichtbar
- **Coaches** - Nur für Coach-Rolle sichtbar
- **Admins** - Nur für Admin-Rolle sichtbar
- **Alle** - Für jeden eingeloggten User sichtbar

### Erweiterte Funktionen
- **Priorität** - Sortierung der Inhalte (höhere Werte = weiter oben)
- **Zeitgesteuert** - Automatische Deaktivierung nach Ablaufdatum
- **Rich-Text** - HTML-Formatierung unterstützt
- **Livestream-Embedding** - YouTube/Twitch Videos direkt einbetten
- **Farb-Themes** - 6 verschiedene Hintergrundfarben
- **Icons** - Lucide Icons zur Visualisierung

## 🚀 Verwendung

### 1. Admin-Zugang
Navigiere zu: **Admin → Dashboard-Inhalte** (`/admin/dashboard-content`)

### 2. Neuen Inhalt erstellen
1. Klicke auf **"Neuen Inhalt erstellen"**
2. Fülle das Formular aus:
   - **Content-Typ**: Wähle den passenden Typ
   - **Titel**: Kurzer, prägnanter Titel
   - **Inhalt**: HTML-formatierter Text
   - **Zielgruppe**: Wähle die Rolle oder "Alle"
   - **Priorität**: Höhere Werte = weiter oben (Standard: 100)
   - **Hintergrundfarbe**: Wähle ein Theme
   - **Icon**: Lucide Icon-Name (z.B. Heart, Bell, Video)

### 3. Livestream einbetten

#### YouTube
```
Livestream-URL: https://www.youtube.com/embed/VIDEO_ID
Platform: YouTube
```

#### Twitch
```
Livestream-URL: https://player.twitch.tv/?channel=CHANNEL&parent=DEINE-DOMAIN.com
Platform: Twitch
```

**Beispiel:**
```
Titel: 🔴 LIVE: Deutsche Meisterschaft 2025
Content: <p>Verfolgt unsere Teams live bei der DM!</p>
Livestream-URL: https://www.youtube.com/embed/dQw4w9WgXcQ
Platform: youtube
Event-Datum: 2025-11-15 14:00
```

### 4. Zeitgesteuerte Inhalte

Nutze das **Ablaufdatum**, um Inhalte automatisch nach einem bestimmten Zeitpunkt zu deaktivieren:

**Beispiel: Weihnachtsgruß**
```
Titel: 🎄 Frohe Weihnachten!
Ablaufdatum: 2025-12-27 23:59
```
→ Wird am 27. Dezember automatisch ausgeblendet

### 5. HTML-Formatierung

Unterstützte HTML-Tags:
- `<p>` - Absätze
- `<ul>`, `<li>` - Listen
- `<strong>`, `<b>` - Fettdruck
- `<em>`, `<i>` - Kursiv
- `<br>` - Zeilenumbruch
- `<h4>` - Überschriften
- `<div>` - Container mit Klassen

**Beispiel:**
```html
<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div>
    <h4 class="font-medium mb-2">Wichtige Termine</h4>
    <ul class="space-y-1">
      <li>• <strong>15. Nov:</strong> Deutsche Meisterschaft</li>
      <li>• <strong>20. Dez:</strong> Winter Showcase</li>
    </ul>
  </div>
  <div>
    <h4 class="font-medium mb-2">Hinweise</h4>
    <p>Bitte meldet euch rechtzeitig ab!</p>
  </div>
</div>
```

## 📊 Datenbank-Schema

```sql
dashboard_content
├── id (SERIAL PRIMARY KEY)
├── content_type (VARCHAR) - welcome, announcement, livestream, alert, info
├── title (VARCHAR) - Titel des Inhalts
├── content (TEXT) - HTML-Content
├── is_active (BOOLEAN) - Aktiv/Inaktiv Status
├── target_role (VARCHAR) - parent, member, coach, admin, NULL
├── priority (INTEGER) - Sortierung (höher = oben)
├── livestream_url (VARCHAR) - Embed-URL für Videos
├── livestream_platform (VARCHAR) - youtube, twitch, vimeo
├── event_date (TIMESTAMP) - Event-Datum (optional)
├── expires_at (TIMESTAMP) - Auto-Deaktivierung
├── background_color (VARCHAR) - Theme-Farbe
├── icon (VARCHAR) - Lucide Icon Name
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
├── created_by (INTEGER FK → users)
└── updated_by (INTEGER FK → users)
```

## 🎨 Verfügbare Farben

- **default** - Grau (Neutral)
- **blue** - Blau (Informationen)
- **red** - Rot (Wichtig, Willkommen)
- **green** - Grün (Erfolg, Positiv)
- **yellow** - Gelb (Warnung, Aufmerksamkeit)
- **purple** - Lila (Special, Livestreams)

## 🎯 Best Practices

### Willkommensnachrichten
- Nutze **red** als Farbe für herzliche Begrüßung
- Icon: `Heart` oder `Users`
- Zielgruppe: Spezifische Rolle (z.B. `parent`)
- Priorität: 100

### Ankündigungen
- Nutze **blue** für allgemeine Infos
- Icon: `Bell` oder `Info`
- Zielgruppe: `NULL` (Alle)
- Priorität: 150

### Livestreams
- Nutze **purple** für Events
- Icon: `Video`
- Füge Event-Datum hinzu
- Priorität: 200 (höchste)
- Deaktiviere nach Event (Ablaufdatum)

### Alerts
- Nutze **yellow** oder **red** für Warnungen
- Icon: `AlertTriangle`
- Zielgruppe: `NULL` (Alle)
- Priorität: 180

## 🔧 API-Endpunkte

### Für Admins
- `GET /api/admin/dashboard-content` - Alle Inhalte abrufen
- `POST /api/admin/dashboard-content` - Neuen Inhalt erstellen
- `PUT /api/admin/dashboard-content/[id]` - Inhalt bearbeiten
- `DELETE /api/admin/dashboard-content/[id]` - Inhalt löschen
- `PATCH /api/admin/dashboard-content/[id]/toggle` - Status umschalten

### Für User
- `GET /api/dashboard-content` - Aktive Inhalte für aktuelle Rolle

## 📱 Frontend-Integration

Die Inhalte werden automatisch auf dem Dashboard angezeigt:

```tsx
import DynamicDashboardContent from "./components/DynamicDashboardContent";

// Im Dashboard
<DynamicDashboardContent />
```

Die Component:
- Lädt automatisch die passenden Inhalte für die User-Rolle
- Zeigt nur aktive Inhalte
- Filtert abgelaufene Inhalte automatisch
- Rendert HTML sicher
- Embedded Livestreams automatisch

## 🚀 Migration

Die Datenbank-Migration wurde bereits ausgeführt und enthält Beispiel-Content:

```bash
node run-dashboard-content-migration.mjs
```

**Beispiel-Inhalte:**
1. ✓ Willkommensnachricht für Eltern (aktiv)
2. ○ Livestream-Beispiel für Deutsche Meisterschaft (inaktiv)

## 💡 Anwendungsfälle

### 1. Meisterschaften Live
```
Content-Typ: livestream
Titel: 🔴 LIVE: Deutsche Meisterschaft 2025
Livestream-URL: https://www.youtube.com/embed/LIVE_ID
Event-Datum: 2025-11-15 14:00
Zielgruppe: Alle
Ablaufdatum: 2025-11-16 00:00
```

### 2. Trainingsausfall
```
Content-Typ: alert
Titel: ⚠️ Training heute abgesagt!
Content: <p>Das Training heute um 16 Uhr fällt wegen Krankheit aus.</p>
Zielgruppe: Sparkles-Team (parent)
Hintergrundfarbe: yellow
Ablaufdatum: [Heute 23:59]
```

### 3. Neue Trainingszeiten
```
Content-Typ: announcement
Titel: 📣 Neue Trainingszeiten ab November
Content: <ul><li>Montag: 16-18 Uhr</li><li>Mittwoch: 17-19 Uhr</li></ul>
Zielgruppe: Alle
Hintergrundfarbe: blue
Ablaufdatum: 2025-11-30 23:59
```

### 4. Erfolge feiern
```
Content-Typ: info
Titel: 🏆 Herzlichen Glückwunsch!
Content: <p>Unsere Sparkles haben den 1. Platz belegt!</p>
Zielgruppe: Alle
Hintergrundfarbe: green
```

## 🔐 Sicherheit

- Nur Admins haben Zugriff auf `/admin/dashboard-content`
- API-Endpunkte sind geschützt (Session-Check)
- HTML-Content wird client-seitig mit `dangerouslySetInnerHTML` gerendert
- **Achtung:** Nur vertrauenswürdige HTML-Inhalte einfügen!

## 📈 Zukünftige Erweiterungen

Mögliche Features:
- [ ] WYSIWYG Rich-Text-Editor (TinyMCE, Quill)
- [ ] Bild-Upload für Inhalte
- [ ] Zeitgesteuerte Auto-Aktivierung
- [ ] Content-Vorlagen (Templates)
- [ ] Mehrsprachigkeit
- [ ] Analytics (View-Tracking)
- [ ] Content-Duplikation
- [ ] Bulk-Operationen

---

**Viel Erfolg mit dem Dashboard CMS! 🎉**
