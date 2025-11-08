# Navigation Update - Profilbild & Settings-Button

## Änderungen vom 08.11.2025

### ✅ Desktop-Navigation verbessert

#### 1. Profilbild statt Buchstabe
- **Profilbild wird angezeigt** wenn vorhanden (`avatar_url` aus members-Tabelle)
- Fallback auf NextAuth `image` wenn kein avatar_url vorhanden
- Fallback auf ersten Buchstaben des Namens wenn kein Bild vorhanden
- Profilbild wird in der Session gespeichert für schnelleren Zugriff

#### 2. Settings-Button hinzugefügt
- **Neuer Settings-Button** neben dem Abmelden-Button
- Icon dreht sich beim Hover (360°)
- Direkter Link zu `/settings`
- Schönes Gradient-Design passend zur App

#### 3. Layout-Verbesserungen
- Settings-Button und Abmelden-Button nebeneinander
- Settings-Button bekommt mehr Platz
- Bessere visuelle Hierarchie
- Konsistentes Design mit dem Rest der Navigation

### Technische Details

#### Auth-Änderungen (`auth.ts`)
```typescript
// Lädt jetzt auch avatar_url aus members-Tabelle
const result = await sql`
  SELECT u.id, u.username, u.password_hash, u.role, u.roles, u.member_id, u.name, m.avatar_url
  FROM users u
  LEFT JOIN members m ON u.member_id = m.id
  WHERE u.username = ${username}
`;

// Speichert avatar_url als image in Session
return {
  id: user.id.toString(),
  email: user.username,
  name: user.name,
  role: user.role,
  roles: user.roles || [],
  memberId: user.member_id,
  image: user.avatar_url || null, // ← NEU
};
```

#### Sidebar-Änderungen (`ResponsiveSidebar.tsx`)
```typescript
// Profilbild mit Fallbacks
{(session.user as any).avatar_url ? (
  <img src={(session.user as any).avatar_url} ... />
) : session.user.image ? (
  <img src={session.user.image} ... />
) : (
  <div>{session.user.name?.charAt(0)?.toUpperCase()}</div>
)}

// Settings-Button
<Link href="/settings" className="...">
  <IconSettings className="w-4 h-4 group-hover:rotate-90 ..." />
  <span>Einstellungen</span>
</Link>
```

### Visuelle Verbesserungen

#### Vorher:
- Nur Buchstabe als Avatar
- Kein direkter Settings-Zugriff
- Abmelden-Button allein

#### Nachher:
- ✅ Profilbild wenn vorhanden
- ✅ Settings-Button prominent
- ✅ Beide Buttons nebeneinander
- ✅ Animiertes Icon beim Hover
- ✅ Konsistentes Design

### Desktop-Navigation Struktur

```
┌─────────────────────────────────┐
│  🖼️ [Profilbild]  Name          │
│                   Rolle          │
├─────────────────────────────────┤
│  ⚙️ Einstellungen │ 🚪 Abmelden │
└─────────────────────────────────┘
```

### Profilbild-Quellen (Priorität):

1. **`avatar_url`** aus members-Tabelle (primär)
2. **`image`** aus NextAuth Session (sekundär)
3. **Erster Buchstabe** des Namens (Fallback)

### Getestete Szenarien:

- ✅ User mit Profilbild
- ✅ User ohne Profilbild
- ✅ User ohne member_id
- ✅ Settings-Button-Navigation
- ✅ Hover-Animationen
- ✅ Dark Mode Kompatibilität

### Betroffene Dateien:

1. `/app/components/ResponsiveSidebar.tsx`
   - Profilbild-Logik hinzugefügt
   - Settings-Button hinzugefügt
   - Layout optimiert

2. `/auth.ts`
   - avatar_url aus members-Tabelle laden
   - In Session als `image` speichern

### Nächste Schritte (Optional):

- [ ] Profilbild auch in Mobile-Navigation
- [ ] Profilbild-Upload-Funktion
- [ ] Profilbild-Cropper
- [ ] Gravatar-Fallback

---

**Status**: ✅ Implementiert und einsatzbereit
**Datum**: 08. November 2025
