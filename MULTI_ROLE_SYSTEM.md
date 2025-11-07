# Multi-Role-System Implementation

## Übersicht

Das ICA Dev System unterstützt jetzt **mehrere Rollen pro Benutzer**. Ein Benutzer kann gleichzeitig z.B. Coach UND Manager sein.

## Datenbank-Schema

```sql
-- users Tabelle
role VARCHAR(50)      -- Primäre Rolle (für Backwards Compatibility)
roles JSONB           -- Array aller Rollen: ['admin', 'coach', 'manager']
```

### Beispiel-Daten:
```json
{
  "id": 92,
  "username": "kai",
  "role": "manager",
  "roles": ["coach", "member", "manager"]
}
```

## Implementierte Komponenten

### 1. **Auth-System** (`lib/auth-utils.ts`)

Neue Hilfsfunktionen:
- `hasRole(session, role)` - Prüft ob Benutzer EINE spezifische Rolle hat
- `hasAnyRole(session, roles)` - Prüft ob Benutzer IRGENDEINE der Rollen hat  
- `hasAllRoles(session, roles)` - Prüft ob Benutzer ALLE Rollen hat

```typescript
// Beispiel-Verwendung
if (hasAnyRole(session, ["admin", "manager"])) {
  // Zugriff erlauben
}

if (hasRole(session, "coach")) {
  // Coach-spezifische Funktion
}
```

### 2. **Session-Typen** (`types/next-auth.d.ts`)

```typescript
interface Session {
  user: {
    id: string;
    role: string;       // Primäre Rolle
    roles: string[];    // Alle Rollen
    memberId: number | null;
  }
}
```

### 3. **Multi-Role Manager UI** (`app/components/UserRoleManagerMulti.tsx`)

Neue Komponente mit:
- ✅ Checkbox-Interface für jede Rolle
- ✅ Visuelles Feedback (Farben, Icons)
- ✅ Primäre Rolle wird prominent angezeigt
- ✅ Sekundäre Rollen als Tags
- ✅ Mindestens eine Rolle erforderlich
- ✅ Automatische Priorität: admin > manager > coach > parent > member

### 4. **API-Route** (`app/api/users/[id]/roles/route.ts`)

```typescript
PATCH /api/users/{userId}/roles
Body: { roles: ["coach", "manager"] }
```

- Nur Admins können Rollen ändern
- Validierung: mindestens 1 Rolle erforderlich
- Automatische Bestimmung der primären Rolle
- Update beider Felder: `role` und `roles`

### 5. **Profilseite** (`app/profil/page.tsx`)

- Zeigt primäre Rolle prominent
- Zeigt alle weiteren Rollen als kleine Tags
- Dynamische Anzeige: "Rolle" vs "Rollen"

## Verfügbare Rollen

| Rolle | Priorität | Beschreibung | Icon | Farbe |
|-------|-----------|--------------|------|-------|
| **admin** | 1 | Voller Systemzugriff, kann Rollen vergeben | 👑 Crown | Rot |
| **manager** | 2 | Fast voller Zugriff, KEINE System-Einstellungen | 🛡️ Shield | Orange |
| **coach** | 3 | Team- und Trainingsverwaltung | 🛡️ Shield | Blau |
| **parent** | 4 | Zugriff auf eigene Kinder | 👥 Users | Grün |
| **member** | 5 | Basis-Zugriff auf eigenes Profil | 👤 User | Lila |

## Rollenlogik

### Primäre Rolle
Die primäre Rolle wird nach Priorität bestimmt:
```typescript
if (roles.includes('admin')) return 'admin';
else if (roles.includes('manager')) return 'manager';
else if (roles.includes('coach')) return 'coach';
else if (roles.includes('parent')) return 'parent';
return 'member';
```

### Berechtigungsprüfung
Das System prüft immer ALLE Rollen eines Benutzers:
```typescript
// Benutzer hat ['coach', 'manager']
hasRole(session, 'manager')     // ✅ true
hasRole(session, 'coach')       // ✅ true
hasRole(session, 'admin')       // ❌ false
hasAnyRole(session, ['admin', 'manager'])  // ✅ true (hat manager)
```

## Migration von Single-Role zu Multi-Role

Das System ist **vollständig rückwärtskompatibel**:

1. **Alte `role` Spalte** bleibt bestehen
2. **Neue `roles` Spalte** wird automatisch befüllt
3. Fallback wenn `roles` leer ist: `[role]`

```typescript
// Auth-System
const userRoles = user.roles && user.roles.length > 0 
  ? user.roles 
  : [user.role];
```

## Beispiel-Use-Cases

### Use Case 1: Coach wird zusätzlich Manager
```json
Vorher:
{
  "role": "coach",
  "roles": ["coach"]
}

Nachher:
{
  "role": "manager",        // Höhere Priorität
  "roles": ["coach", "manager"]
}
```

### Use Case 2: Manager kann auch coachen
```json
{
  "role": "manager",
  "roles": ["coach", "manager"]
}
```
- Hat Admin-Zugriff (manager)
- Hat Coach-Funktionen (coach)
- Kann Teams verwalten
- Kann Berichte sehen

### Use Case 3: Parent ist auch Member
```json
{
  "role": "parent",
  "roles": ["member", "parent"]
}
```
- Sieht eigene Kinder (parent)
- Hat eigenes Mitglieds-Profil (member)

## UI-Komponenten

### Settings Users Page
- Admin-only
- Multi-Select Checkboxes
- Live-Update der Rollen
- Visuelles Feedback

### Profil Page
- Zeigt primäre Rolle groß
- Zeigt weitere Rollen als Tags
- Responsive Design

### Navigation
- Rollen-basierte Links
- Prüft ALLE Rollen

## Wichtige Hinweise

### 1. Session-Update erforderlich
Nach Rollenänderung muss sich der Benutzer **neu anmelden**, damit die Session aktualisiert wird!

### 2. Mindestens eine Rolle
Jeder Benutzer muss mindestens eine Rolle haben. Das System verhindert das Entfernen der letzten Rolle.

### 3. Admin-Schutz
Nur Admins können Rollen ändern. Manager können KEINE Rollen vergeben (Sicherheit).

### 4. Rollen-Validierung
Nur diese 5 Rollen sind erlaubt:
- admin
- manager
- coach
- parent
- member

## Testing

### Datenbank-Check
```bash
node -e "
const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL);
(async () => {
  const users = await sql\`SELECT id, username, role, roles FROM users\`;
  console.table(users);
})();
"
```

### API-Test
```bash
curl -X PATCH http://localhost:3000/api/users/92/roles \
  -H "Content-Type: application/json" \
  -d '{"roles": ["coach", "manager"]}'
```

## Aktuelle Status

### Benutzer mit Multi-Roles:
1. **kai** (ID 92): `['coach', 'member', 'manager']` - Primär: Manager
2. **sandra_pohl** (ID 95): `['coach', 'manager']` - Primär: Manager (sollte sein)
3. **chantal_pohl** (ID 101): `['coach', 'member']` - Primär: Coach

### Migration Status:
- ✅ Alle Benutzer haben `roles` Feld
- ✅ Backwards Compatibility vorhanden
- ✅ Auth-System aktualisiert
- ✅ UI-Komponenten implementiert
- ✅ API-Routes erstellt
- ✅ TypeScript-Typen aktualisiert

## Nächste Schritte

1. ✅ Testen der neuen UI in `/settings/users`
2. ✅ Verifizieren dass nach Login alle Rollen aktiv sind
3. ✅ Überprüfen der Navigation (Admin/Manager-Links)
4. ⏳ Ggf. weitere Komponenten auf Multi-Role anpassen

## Technische Details

### Session Flow:
```
1. Login → authorize() lädt role + roles
2. JWT Token enthält beide
3. Session enthält beide
4. Komponenten nutzen session.user.roles
5. Logout → erneuter Login lädt neue Rollen
```

### Datenbank-Konsistenz:
```sql
-- Automatisches Update beider Felder
UPDATE users 
SET 
  role = 'manager',           -- Primäre
  roles = '["coach", "manager"]'::jsonb,  -- Alle
  updated_at = CURRENT_TIMESTAMP
WHERE id = 92;
```

---

**Erstellt:** 7. November 2025  
**Version:** 1.0  
**Status:** ✅ Produktionsbereit
