# Infinity Cheer Allstars - Backoffice System

Ein umfassendes Verwaltungssystem für den Cheerleading-Verein Infinity Cheer Allstars.

## 🚀 Features

### ✅ Vollständig implementiert:

#### 1. **Authentication & Authorization**
- NextAuth v5 Integration mit Credentials Provider
- Sichere Password-Hashing mit bcrypt
- Session-Management
- Rolle-basiertes Zugriffsystem:
  - **Admin**: Vollzugriff auf alle Funktionen
  - **Coach**: Zugriff auf Teams, Mitglieder, Kommentare
  - **Member**: Zugriff auf eigenes Profil und Training-Zusagen
  - **Parent**: Zugriff auf Kinder-Profile (in Entwicklung)

#### 2. **Mitgliederverwaltung**
- CRUD-Operationen für Mitglieder
- Avatar-Upload (bis 5MB)
- ID-Karten-Style Profil-Seiten
- Persönliche Daten, Kontaktinformationen
- Eltern/Erziehungsberechtigte-Informationen
- Team-Zuordnung

#### 3. **Team-Management**
- Teams erstellen, bearbeiten, löschen
- Level-Zuordnung (Tiny, Mini, Youth, Junior, Senior, etc.)
- Coach-Zuweisung
- Team-Übersicht

#### 4. **Training-System**
- Trainings planen und verwalten
- Team-spezifische Trainings
- Zeitplanung (Datum, Start-/Endzeit, Location)
- **Training Attendance** (NEU):
  - Mitglieder können Trainings zusagen/absagen
  - Status: Zugesagt, Abgesagt, Ausstehend
  - Kommentare zur Teilnahme
  - Übersicht der Trainingsteilnahme-Historie

#### 5. **Event-Management**
- Events erstellen und verwalten
- Event-Typen: Wettkampf, Show, Workshop, Training Camp
- Datum, Location, Beschreibung
- Event-Übersicht

#### 6. **Coach-Kommentare-System** (NEU)
- Kommentare an Mitglieder
- Öffentliche und private Kommentare
- Nur für Coaches und Admins
- Zeitstempel und Autor-Anzeige

#### 7. **Dashboard**
- Übersicht aller Statistiken (Teams, Mitglieder, Events, Trainings)
- Schnellzugriff auf alle Bereiche
- Modernes Design in Teamfarben (Schwarz, Rot, Weiß)

## 🎨 Design

- **Teamfarben**: Schwarz (#000000), Rot (#DC2626), Weiß (#FFFFFF)
- Modernes, responsive UI mit Tailwind CSS
- Gradient-Backgrounds und Hover-Effekte
- Lucide React Icons
- Mobile-First Ansatz

## 🗄️ Datenbank

PostgreSQL auf Neon (Serverless):
- **teams**: Team-Informationen
- **members**: Mitglieder mit Avatar-URL
- **events**: Veranstaltungen
- **trainings**: Trainingseinheiten
- **users**: Benutzer mit Rollen und Authentifizierung
- **training_attendance**: Training-Teilnahme-Tracking
- **comments**: Kommentare von Coaches
- **parent_children**: Eltern-Kind-Beziehungen

## 📦 Installation

```bash
# Repository klonen
git clone <repository-url>
cd backoffice

# Dependencies installieren
npm install

# Umgebungsvariablen einrichten
cp .env.example .env
# Füge deine Neon DATABASE_URL in .env hinzu

# Datenbank-Schema erstellen
node setup-db.mjs

# Avatar-Spalte hinzufügen (falls nicht vorhanden)
node migrate-avatar.mjs

# Authentication-System migrieren
node migrate-auth.mjs

# Dev-Server starten
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000) im Browser.

## 🔐 Standard-Login

Nach der Migration wird automatisch ein Admin-Account erstellt:

```
E-Mail: admin@infinitycheer.com
Passwort: admin123
```

**⚠️ WICHTIG**: Bitte ändere das Passwort nach dem ersten Login!

## 🛠️ Technologie-Stack

- **Framework**: Next.js 14 (App Router)
- **Sprache**: TypeScript
- **Datenbank**: Neon PostgreSQL (Serverless)
- **ORM**: @neondatabase/serverless (direkte SQL-Queries)
- **Authentication**: NextAuth v5
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **File Upload**: Next.js API Routes
- **Password Hashing**: bcryptjs

## 📁 Projektstruktur

```
backoffice/
├── app/
│   ├── actions.ts                 # Server Actions für DB-Operationen
│   ├── layout.tsx                 # Root Layout mit Sidebar
│   ├── page.tsx                   # Dashboard
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/     # NextAuth API Routes
│   │   │   └── register/          # Registrierungs-Endpoint
│   │   └── upload-avatar/         # Avatar-Upload
│   ├── components/
│   │   ├── Sidebar.tsx            # Navigation mit Logout
│   │   ├── AuthProvider.tsx       # Session Provider
│   │   ├── AvatarUpload.tsx       # Avatar-Upload Component
│   │   ├── AttendanceButtons.tsx  # Training Zu-/Absage UI
│   │   ├── CommentsSection.tsx    # Kommentar-System
│   │   └── ...Form Components
│   ├── members/                   # Mitglieder-Seiten
│   │   ├── [id]/
│   │   │   ├── page.tsx          # Profil mit Attendance & Comments
│   │   │   └── edit/
│   │   └── new/
│   ├── teams/                     # Team-Management
│   ├── events/                    # Event-Management
│   ├── trainings/                 # Training-Management
│   ├── login/                     # Login-Seite
│   └── register/                  # Registrierungs-Seite
├── auth.config.ts                 # NextAuth Konfiguration
├── auth.ts                        # NextAuth Setup mit Credentials
├── middleware.ts                  # Route Protection
├── lib/
│   └── auth-utils.ts             # Auth Helper Functions
├── migrations/                    # SQL Migrations
├── public/avatars/               # Uploaded Avatars
└── types/
    └── next-auth.d.ts            # NextAuth Type Extensions
```

## 🔜 Geplante Features

### In Entwicklung:
- [ ] **Parent View Restrictions**: Eltern sehen nur ihre eigenen Kinder
- [ ] **Enhanced Team Overview**: 
  - Mitgliederliste pro Team
  - Team-Statistiken
  - Team-spezifischer Trainingsplan
- [ ] **Training Detail Pages** mit Attendance-Übersicht für Coaches
- [ ] **Member Dashboard** mit personalisierten Infos
- [ ] **Notification System** für neue Trainings/Events
- [ ] **Calendar View** für alle Termine

### Zukünftig:
- [ ] Email-Benachrichtigungen
- [ ] PDF-Export von Mitgliederlisten
- [ ] Anwesenheits-Statistiken
- [ ] Performance-Tracking
- [ ] Dokument-Upload pro Mitglied
- [ ] Mobile App

## 🔒 Sicherheit

- Alle Passwörter werden mit bcrypt gehasht (10 Rounds)
- Session-basierte Authentifizierung
- Protected API Routes
- Input-Validierung auf Client und Server
- SQL-Injection-Schutz durch parametrisierte Queries
- XSS-Schutz durch React/Next.js
- CSRF-Schutz durch NextAuth

## 📝 Umgebungsvariablen

Erstelle eine `.env` oder `.env.local` Datei:

```env
DATABASE_URL='your_neon_database_url'
AUTH_SECRET='generated_secret_key'
NEXTAUTH_URL='http://localhost:3000'
```

Generiere einen sicheren AUTH_SECRET mit:
```bash
openssl rand -base64 32
```

## Deployment

Das Projekt kann auf Vercel deployed werden:

```bash
npm run build
```

Stelle sicher, dass alle Umgebungsvariablen (DATABASE_URL, AUTH_SECRET, NEXTAUTH_URL) in den Vercel Einstellungen gesetzt sind.

## 🐛 Bekannte Issues

- Avatar-Uploads größer als 5MB werden abgelehnt
- Parent-View ist noch nicht vollständig implementiert
- Keine Email-Verifikation bei Registrierung

## 📧 Support

Bei Fragen oder Problemen, bitte ein Issue erstellen oder kontaktiere den Admin.

## 📄 Lizenz

Proprietary - Infinity Cheer Allstars © 2025

---

**Made with ❤️ for Infinity Cheer Allstars**