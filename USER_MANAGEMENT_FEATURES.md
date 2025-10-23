# Benutzerverwaltung - Feature-Dokumentation

## Übersicht

Die überarbeitete Benutzerverwaltung bietet umfassende Funktionen zum Suchen, Filtern, Erstellen, Bearbeiten und Löschen von Benutzern mit responsivem Design.

## Features

### 1. 🔍 Such- und Filterfunktionen

#### Suchfeld
- **Suchbereiche**: Name, Benutzername, E-Mail
- **Echtzeit-Suche**: Sofortige Filterung beim Tippen
- **Case-Insensitive**: Groß-/Kleinschreibung wird ignoriert

#### Rollenfilter
- **Alle Rollen**: Zeigt alle Benutzer
- **Administrator**: Nur Admins
- **Coach**: Nur Coaches
- **Mitglied**: Nur Mitglieder
- **Elternteil**: Nur Eltern

### 2. ✏️ Benutzer bearbeiten

#### Basis-Informationen
- **Name**: Vollständiger Name des Benutzers
- **Benutzername**: Login-Name (nur a-z, 0-9, _)
  - Pattern-Validierung im Frontend
  - Unique-Check in der Datenbank
- **E-Mail**: Optional, für Benachrichtigungen
- **Rolle**: Administrator, Coach, Mitglied, Elternteil
- **Verknüpftes Mitglied**: Optional, verbindet User mit Member

#### Passwort ändern
- **Optional**: Nur ändern wenn neues Passwort eingegeben
- **Validierung**: 
  - Mindestens 6 Zeichen
  - Passwort-Bestätigung muss übereinstimmen
- **Sicherheit**: Bcrypt-Hashing mit 10 Runden

#### Aktionen
- **Speichern**: Aktualisiert alle Änderungen
- **Löschen**: Entfernt Benutzer (mit Bestätigung)
  - Eigener Account kann nicht gelöscht werden
  - Alle verknüpften Daten werden per CASCADE gelöscht

### 3. ➕ Neuen Benutzer erstellen

#### Formular
- **Benutzername**: Eindeutig, nur Kleinbuchstaben/Zahlen/Unterstriche
- **Name**: Vollständiger Anzeigename
- **Passwort**: Mindestens 6 Zeichen
  - **Passwort-Generator**: 12 Zeichen mit Groß-/Kleinbuchstaben, Zahlen, Sonderzeichen
  - **Stärke-Anzeige**: 🔴 Schwach / 🟡 Mittel / 🟢 Stark
  - **Anzeige-Toggle**: Passwort ein-/ausblenden
- **Rolle**: Member (Standard), Parent, Coach, Admin

#### Auto-Close
- Formular schließt automatisch nach erfolgreicher Erstellung
- Erfolgs-Meldung wird 1,5 Sekunden angezeigt

### 4. 📱 Responsive Design

#### Mobile (< 640px)
- Single-Column Grid
- Touch-freundliche Buttons (min-height)
- Optimierte Schriftgrößen
- Scroll-optimierte Modals

#### Tablet (640px - 1024px)
- 2-Column Grid für Rollen-Infos
- Kompakte Darstellung
- Flexible Layouts

#### Desktop (> 1024px)
- Full-width Layout mit Padding
- 2-Column Grid für Such/Filter
- Modal in optimaler Größe (max-w-2xl)

### 5. 🎨 Sci-Fi Design

#### Farb-Schema
- **Administrator**: Red (#DC2626)
- **Coach**: Blue (#2563EB)
- **Mitglied**: Green (#16A34A)
- **Elternteil**: Purple (#9333EA)

#### UI-Elemente
- **Cards**: Dark slate (bg-slate-900) mit Borders
- **Hover-Effects**: Border-color transition zu role-color
- **Badges**: Farbige Pill-Badges mit transparentem Background
- **Icons**: Lucide React Icons (consistent 16px/20px)

#### Animationen
- **Smooth Transitions**: 200ms für alle Hover-States
- **Modal**: Backdrop-blur mit Fade-in
- **Success/Error**: Toast-style Notifications

## API-Endpunkte

### PATCH `/api/users/[id]`
Aktualisiert einen Benutzer

**Request Body:**
```json
{
  "name": "string",
  "username": "string",
  "email": "string | null",
  "role": "admin | coach | member | parent",
  "member_id": "number | null",
  "newPassword": "string | undefined"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "Max Mustermann",
    "username": "max_mustermann",
    "email": "max@example.com",
    "role": "member",
    "member_id": 5
  },
  "message": "Benutzer erfolgreich aktualisiert"
}
```

**Errors:**
- `400`: Validierungsfehler (fehlende Felder, Benutzername existiert)
- `401`: Nicht autorisiert (kein Admin)
- `404`: Benutzer nicht gefunden
- `500`: Server-Fehler

### DELETE `/api/users/[id]`
Löscht einen Benutzer

**Response:**
```json
{
  "success": true,
  "message": "Benutzer erfolgreich gelöscht"
}
```

**Errors:**
- `400`: Eigener Account kann nicht gelöscht werden
- `401`: Nicht autorisiert
- `404`: Benutzer nicht gefunden
- `500`: Server-Fehler

## Komponenten-Struktur

```
app/
├── users/
│   └── page.tsx                    # Server Component (Data Fetching)
└── components/
    ├── UserManagementClient.tsx    # Main Client Component
    ├── EditUserModal.tsx            # Modal für Bearbeitung
    └── CreateUserForm.tsx           # Formular für neuen User
```

### UserManagementClient.tsx
- **Client Component** mit useState/useMemo
- **State**: searchTerm, roleFilter, showCreateForm, editingUser
- **Memoized Filtering**: Optimierte Performance
- **Responsive Layout**: Grid-basiert mit Breakpoints

### EditUserModal.tsx
- **Fixed Overlay**: z-50 mit backdrop-blur
- **Form State**: Lokales State-Management
- **Validation**: Frontend + Backend
- **Error Handling**: Toast-style Messages

### CreateUserForm.tsx
- **Password Generator**: Sichere Zufalls-Passwörter
- **Live Validation**: Password-Stärke-Anzeige
- **Success Callback**: onSuccess-Prop für Auto-Close

## Datenbank-Schema

### users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,  -- Login-Name
  email VARCHAR(255),                      -- Optional
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'coach', 'member', 'parent')),
  member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_member_id ON users(member_id);
```

## Sicherheit

### Authentifizierung
- **NextAuth v5**: Server-side Session Management
- **Role-Based Access**: Nur Admins dürfen Benutzerverwaltung nutzen
- **CSRF-Protection**: Automatisch durch Next.js

### Passwörter
- **Bcrypt**: 10 Runden für Hashing
- **Mindestlänge**: 6 Zeichen (Frontend + Backend)
- **No Plain-Text**: Passwörter werden nie im Klartext gespeichert

### Validierung
- **Frontend**: Pattern-Validation für Benutzernamen
- **Backend**: Unique-Checks, Role-Validation
- **SQL-Injection**: Geschützt durch Neon parametrisierte Queries

## Best Practices

### Performance
- **useMemo**: Für gefilterte Benutzerliste
- **Server Components**: Data Fetching auf Server
- **Code Splitting**: Lazy Loading von Modals

### UX
- **Loading States**: Disabled Buttons während Requests
- **Success Messages**: 1,5s Anzeige vor Auto-Close
- **Confirmation Dialogs**: Bei destruktiven Aktionen
- **Responsive Touch Targets**: Min. 44x44px auf Mobile

### Accessibility
- **Semantic HTML**: Proper form labels
- **Keyboard Navigation**: Tab-order, Enter-Submit
- **ARIA-Labels**: Für Icon-Buttons
- **Color Contrast**: WCAG AA-konform

## Zukünftige Erweiterungen

### Mögliche Features
- [ ] **Bulk-Aktionen**: Mehrere Benutzer gleichzeitig bearbeiten
- [ ] **Export**: CSV-Export der Benutzerliste
- [ ] **Rollen-Hierarchie**: Coaches können Members verwalten
- [ ] **Audit-Log**: Wer hat wann was geändert
- [ ] **2FA**: Two-Factor Authentication
- [ ] **Passwort-Reset**: E-Mail-basiert

### Performance-Optimierungen
- [ ] **Pagination**: Bei > 100 Benutzern
- [ ] **Virtual Scrolling**: Für sehr lange Listen
- [ ] **Debounced Search**: Reduzierte API-Calls

### Multi-Rollen Support
- [ ] **User-Roles Pivot Table**: Ein User kann mehrere Rollen haben
- [ ] **Permission System**: Granulare Berechtigungen
- [ ] **Role Templates**: Vordefinierte Permission-Sets

## Fehlersuche

### Häufige Probleme

**Build-Fehler: "Cannot find module UserManagementClient"**
```bash
# Lösung: TypeScript-Cache löschen
rm -rf .next
npm run build
```

**"Dieser Benutzername wird bereits verwendet"**
- Prüfe ob Username eindeutig ist
- Check `users` table für duplicates
- Username ist case-sensitive

**Modal öffnet sich nicht**
- Prüfe Z-Index (sollte 50 sein)
- Console auf JavaScript-Errors prüfen
- State `editingUser` prüfen

**Passwort-Änderung funktioniert nicht**
- Mindestens 6 Zeichen eingeben
- Beide Felder müssen übereinstimmen
- Backend-Logs prüfen für Bcrypt-Errors

## Testing

### Manuell testen
1. Als Admin einloggen
2. Navigiere zu `/users`
3. Teste Suche mit verschiedenen Begriffen
4. Filtere nach Rollen
5. Erstelle neuen Benutzer
6. Bearbeite existierenden Benutzer
7. Ändere Passwort
8. Versuche Löschung (mit Cancel/Confirm)
9. Teste auf Mobile/Tablet/Desktop

### Test-Checkliste
- [ ] Suche findet Username
- [ ] Suche findet Name
- [ ] Suche findet E-Mail
- [ ] Rollenfilter zeigt korrekte User
- [ ] Create-Form validiert Username-Pattern
- [ ] Passwort-Generator funktioniert
- [ ] Edit-Modal öffnet/schließt
- [ ] Passwort-Änderung funktioniert
- [ ] Löschung funktioniert (nicht eigener Account)
- [ ] Responsive Design auf allen Breakpoints

## Changelog

### Version 1.0.0 (23. Oktober 2025)
- ✅ Vollständige Neuentwicklung der Benutzerverwaltung
- ✅ Such- und Filterfunktionen
- ✅ Edit-Modal mit Passwort-Änderung
- ✅ Responsive Design (Mobile/Tablet/Desktop)
- ✅ Sci-Fi Theme integriert
- ✅ Username statt Email für Login
- ✅ API-Routen für PATCH und DELETE
- ✅ Sicherheits-Features (Bcrypt, Role-Check)
