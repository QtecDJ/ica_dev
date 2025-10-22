# Infinity Cheer Allstars - Backoffice

Ein modernes Verwaltungssystem für die Infinity Cheer Allstars, gebaut mit Next.js 14 und Neon Database.

## Features

- 📊 Dashboard mit Statistiken
- 👥 Mitgliederverwaltung mit Profilseiten
- 🖼️ Avatar-Upload für Mitglieder
- 🎫 ID-Card Style Profilseiten
- 🏆 Teamverwaltung
- 📅 Event- und Wettbewerbsplanung
- 💪 Trainingsplanung
- 🎨 Modernes UI mit Tailwind CSS

## Installation

1. Repository klonen:
```bash
git clone <repository-url>
cd backoffice
```

2. Dependencies installieren:
```bash
npm install
```

3. Umgebungsvariablen einrichten:
```bash
cp .env.example .env
```

4. In `.env` deine Neon Database URL eintragen:
```
DATABASE_URL=your_neon_database_url_here
```

5. Datenbank-Schema erstellen:
Führe das `schema.sql` in deiner Neon Database aus.

6. Development Server starten:
```bash
npm run dev
```

7. Öffne [http://localhost:3000](http://localhost:3000) im Browser.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Datenbank:** Neon (Serverless Postgres)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Sprache:** TypeScript

## Projektstruktur

```
backoffice/
├── app/
│   ├── actions.ts          # Server Actions für DB-Operationen
│   ├── layout.tsx          # Root Layout mit Sidebar
│   ├── page.tsx            # Dashboard
│   ├── components/         # Wiederverwendbare Komponenten
│   ├── teams/             # Team-Verwaltung
│   ├── members/           # Mitglieder-Verwaltung
│   ├── events/            # Event-Verwaltung
│   └── trainings/         # Trainings-Verwaltung
├── schema.sql             # Datenbank-Schema
└── package.json
```

## Deployment

Das Projekt kann auf Vercel deployed werden:

```bash
npm run build
```

Stelle sicher, dass die DATABASE_URL Umgebungsvariable in den Vercel Einstellungen gesetzt ist.

## Lizenz

MIT
