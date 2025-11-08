# Regelwerk-System: Manager-Zugriff Update

## Änderungen vom 08.11.2025

### ✅ Manager haben jetzt vollen Zugriff auf Regelwerke

#### 1. Dashboard-Integration
- **Regelwerk-Card** wird jetzt auch für Manager angezeigt (neben Coaches)
- Manager sehen den Hinweis: "Hier findest du alle wichtigen Regelwerke und Richtlinien"
- Schnellzugriff über die Card im Dashboard

#### 2. Regelwerk-Übersicht (`/regelwerke`)
- Manager sehen **alle Regelwerke** (wie Admins)
- Keine "Gelesen/Ungelesen"-Funktionalität für Manager (nur für Coaches)
- Volle Lese- und Suchrechte

#### 3. API-Berechtigungen
- Alle Regelwerk-API-Endpunkte akzeptieren jetzt auch die "manager" Rolle
- Manager können Kategorien und Regelwerke abrufen
- Nur Admins können Regelwerke erstellen, bearbeiten und löschen

#### 4. Berechtigungsmatrix

| Feature | Admin | Manager | Coach |
|---------|-------|---------|-------|
| Regelwerke ansehen | ✅ Alle | ✅ Alle | ✅ Zugewiesene |
| Regelwerke erstellen | ✅ | ❌ | ❌ |
| Regelwerke bearbeiten | ✅ | ❌ | ❌ |
| Regelwerke löschen | ✅ | ❌ | ❌ |
| Coaches zuweisen | ✅ | ❌ | ❌ |
| "Gelesen" markieren | ❌ | ❌ | ✅ |
| Dashboard-Card | ✅ | ✅ | ✅ |

### Geänderte Dateien

1. `/app/page.tsx`
   - Regelwerk-Card jetzt für Manager sichtbar
   - Angepasster Text für Manager

2. `/app/regelwerke/page.tsx`
   - Manager-Rolle hinzugefügt
   - Manager sehen alle Regelwerke

3. `/app/regelwerke/RegelwerkeView.tsx`
   - Manager-Hinweis in der Überschrift

4. `/app/api/regelwerke/route.ts`
   - Manager-Rolle zu GET-Endpunkt hinzugefügt

5. `/app/api/regelwerke/kategorien/route.ts`
   - Manager-Rolle zu requireRole hinzugefügt

### Verwendung

**Als Manager:**
1. Gehe zum Dashboard
2. Klicke auf die "Regelwerke"-Card
3. Sieh alle Regelwerke ein
4. Filtere nach Kategorien
5. Suche nach Begriffen
6. Lese die vollständigen Regelwerke

**Wichtig:** 
- Manager können Regelwerke **nur lesen**, nicht bearbeiten
- Für Verwaltung (Erstellen/Bearbeiten) weiterhin Admin-Zugriff erforderlich
- Manager haben Zugriff über `/regelwerke`, nicht über `/administration/regelwerke`

### Technische Details

```typescript
// Berechtigungsprüfung
const isManager = hasAnyRole(session, ["manager"]);

// Manager sehen alle Regelwerke wie Admins
if (isAdmin || isManager) {
  regelwerke = await sql`SELECT ...`;
}
```

### Nächste Schritte (Optional)

- [ ] Manager-spezifische Statistiken zu Regelwerken
- [ ] Export-Funktion für Manager
- [ ] Regelwerk-Archiv für Manager
- [ ] Filterung nach Teams für Manager

---

**Status**: ✅ Implementiert und getestet
**Datum**: 08. November 2025
