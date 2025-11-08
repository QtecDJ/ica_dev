# Regelwerk-System Dokumentation

## Übersicht

Das Regelwerk-System ermöglicht es Administratoren, Regelwerke und Richtlinien zu erstellen und diese gezielt an Coaches zuzuweisen. Coaches können ihre zugewiesenen Regelwerke einsehen und als gelesen markieren.

## Features

### Für Administratoren

1. **Regelwerk-Verwaltung** (`/administration/regelwerke`)
   - Erstellen, Bearbeiten und Löschen von Regelwerken
   - Zuordnung zu Kategorien (Allgemeine Regeln, Trainingsregeln, Sicherheit, etc.)
   - Zuweisen von Regelwerken an spezifische Coaches und Teams
   - Versioning und Gültigkeitszeiträume

2. **Kategorien-System**
   - 6 vordefinierte Kategorien mit Farben und Icons:
     - Allgemeine Regeln (Blau)
     - Trainingsregeln (Lila)
     - Sicherheit (Rot)
     - Wettkampfregeln (Orange)
     - Technik & Stunts (Grün)
     - Verhalten & Ethik (Pink)

3. **Coach-Zuweisungen**
   - Direktes Zuweisen von Regelwerken an Coaches
   - Optional: Team-spezifische Zuweisungen
   - Übersicht über alle Zuweisungen

### Für Coaches

1. **Regelwerk-Übersicht** (`/regelwerke`)
   - Anzeige aller zugewiesenen Regelwerke
   - Filterung nach Kategorien
   - Suchfunktion
   - Ungelesene Regelwerke werden hervorgehoben
   - "Als gelesen" markieren-Funktion

2. **Dashboard-Integration**
   - Schnellzugriff-Card im Coach-Dashboard
   - Anzeige der Anzahl ungelesener Regelwerke

## Datenbank-Struktur

### Tabellen

```sql
-- Kategorien
regelwerk_kategorien (
  id, name, beschreibung, icon, color, reihenfolge
)

-- Regelwerke
regelwerke (
  id, titel, beschreibung, inhalt, kategorie_id, team_id,
  version, gueltig_ab, gueltig_bis, ist_aktiv,
  erstellt_von, aktualisiert_von
)

-- Zuweisungen
coach_regelwerk_zuweisungen (
  id, coach_id, regelwerk_id, team_id,
  zugewiesen_von, gelesen, gelesen_am
)
```

## API-Endpunkte

### Kategorien
- `GET /api/regelwerke/kategorien` - Alle Kategorien abrufen
- `POST /api/regelwerke/kategorien` - Neue Kategorie erstellen (Admin)
- `PUT /api/regelwerke/kategorien` - Kategorie aktualisieren (Admin)
- `DELETE /api/regelwerke/kategorien?id={id}` - Kategorie löschen (Admin)

### Regelwerke
- `GET /api/regelwerke` - Regelwerke abrufen (Admin: alle, Coach: zugewiesene)
- `GET /api/regelwerke?kategorie_id={id}` - Regelwerke nach Kategorie filtern
- `POST /api/regelwerke` - Neues Regelwerk erstellen (Admin)
- `PUT /api/regelwerke` - Regelwerk aktualisieren (Admin)
- `DELETE /api/regelwerke?id={id}` - Regelwerk löschen (Admin)

### Zuweisungen
- `GET /api/regelwerke/zuweisungen?regelwerk_id={id}` - Zuweisungen abrufen (Admin)
- `POST /api/regelwerke/zuweisungen` - Neue Zuweisung erstellen (Admin)
- `DELETE /api/regelwerke/zuweisungen?id={id}` - Zuweisung entfernen (Admin)

### Gelesen-Status
- `POST /api/regelwerke/gelesen` - Regelwerk als gelesen markieren (Coach)

## Migration durchführen

```bash
cd /home/kai/ica_dev/ica_dev
DATABASE_URL="postgresql://..." node migrate-regelwerke.mjs
```

## Verwendung

### Als Administrator

1. Gehe zu `/administration/regelwerke`
2. Klicke auf "Neues Regelwerk"
3. Fülle das Formular aus:
   - Titel
   - Beschreibung (optional)
   - Kategorie auswählen
   - Team auswählen (optional)
   - Version
   - Inhalt (Regeltext)
4. Klicke auf "Erstellen"
5. Klicke auf "Coaches zuweisen"
6. Wähle einen Coach und optional ein Team
7. Klicke auf "Zuweisen"

### Als Coach

1. Gehe zum Dashboard
2. Klicke auf die "Regelwerke" Card
3. Filtere nach Kategorien oder suche nach Begriffen
4. Klicke auf "Vollständig anzeigen" um das komplette Regelwerk zu lesen
5. Klicke auf "Als gelesen markieren" wenn du fertig bist

## Berechtigungen

- **Admin**: Vollzugriff - Erstellen, Bearbeiten, Löschen, Zuweisen
- **Coach**: Lesezugriff auf zugewiesene Regelwerke
- **Andere Rollen**: Kein Zugriff

## Best Practices

1. **Versioning**: Erhöhe die Versionsnummer bei wichtigen Änderungen
2. **Kategorisierung**: Nutze die passende Kategorie für bessere Übersicht
3. **Team-Zuweisungen**: Weise teamspezifische Regelwerke dem entsprechenden Team zu
4. **Gültigkeit**: Setze Gültigkeitszeiträume für zeitlich begrenzte Regeln
5. **Klarheit**: Schreibe Regelwerke klar und verständlich

## Troubleshooting

### Coaches sehen keine Regelwerke
- Prüfe ob dem Coach Regelwerke zugewiesen wurden
- Prüfe ob die Regelwerke als "aktiv" markiert sind
- Prüfe die Rolle des Users (muss "coach" enthalten)

### Zuweisungen funktionieren nicht
- Prüfe ob der User die Rolle "coach" hat
- Prüfe ob die `coach_regelwerk_zuweisungen` Tabelle existiert
- Prüfe die Foreign Key Constraints

## Erweiterungsmöglichkeiten

- PDF-Export von Regelwerken
- Email-Benachrichtigung bei neuen Zuweisungen
- Kommentarfunktion für Coaches
- Quiz/Test zur Überprüfung des Verständnisses
- Multi-Language Support
- Rich-Text Editor für Formatierung

## Support

Bei Problemen oder Fragen wende dich an den System-Administrator.
