# HTML-Formatierung in Regelwerken

## Unterstützte HTML-Tags

Das Regelwerk-System unterstützt vollständiges HTML mit automatischer Mobile-Optimierung.

### Überschriften

```html
<h1>Hauptüberschrift (Sehr groß)</h1>
<h2>Unterüberschrift (Groß)</h2>
<h3>Kleinere Überschrift</h3>
<h4>Noch kleiner</h4>
```

### Text-Formatierung

```html
<p>Normaler Absatz-Text</p>
<strong>Fetter Text</strong>
<em>Kursiver Text</em>
<u>Unterstrichener Text</u>
<mark>Hervorgehobener Text</mark>
<small>Kleinerer Text</small>
```

### Listen

**Unsortierte Liste:**
```html
<ul>
  <li>Punkt 1</li>
  <li>Punkt 2</li>
  <li>Punkt 3</li>
</ul>
```

**Sortierte Liste:**
```html
<ol>
  <li>Schritt 1</li>
  <li>Schritt 2</li>
  <li>Schritt 3</li>
</ol>
```

### Tabellen

```html
<table style="width: 100%; border-collapse: collapse;">
  <thead>
    <tr>
      <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Kategorie</th>
      <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Beschreibung</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border: 1px solid #ddd; padding: 8px;">Sicherheit</td>
      <td style="border: 1px solid #ddd; padding: 8px;">Wichtige Sicherheitsregeln</td>
    </tr>
    <tr>
      <td style="border: 1px solid #ddd; padding: 8px;">Training</td>
      <td style="border: 1px solid #ddd; padding: 8px;">Trainingsrichtlinien</td>
    </tr>
  </tbody>
</table>
```

### Zitate & Hinweise

```html
<blockquote style="border-left: 4px solid #8b5cf6; padding-left: 16px; margin: 16px 0; font-style: italic;">
  Wichtiger Hinweis oder Zitat
</blockquote>
```

### Farben & Highlights

```html
<div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 16px 0; border-radius: 8px;">
  <strong style="color: #92400e;">⚠️ Achtung:</strong> 
  <p style="color: #78350f; margin-top: 4px;">Wichtige Warnung oder Information</p>
</div>

<div style="background-color: #dcfce7; border-left: 4px solid #10b981; padding: 12px; margin: 16px 0; border-radius: 8px;">
  <strong style="color: #065f46;">✅ Tipp:</strong> 
  <p style="color: #064e3b; margin-top: 4px;">Hilfreicher Tipp oder Empfehlung</p>
</div>

<div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 12px; margin: 16px 0; border-radius: 8px;">
  <strong style="color: #991b1b;">🚫 Wichtig:</strong> 
  <p style="color: #7f1d1d; margin-top: 4px;">Kritische Information oder Verbot</p>
</div>
```

### Bilder (responsive)

```html
<img src="URL" alt="Beschreibung" style="max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0;" />
```

### Links

```html
<a href="https://example.com" style="color: #8b5cf6; text-decoration: underline;" target="_blank">
  Externer Link
</a>
```

### Trennlinien

```html
<hr style="border: none; border-top: 2px solid #e5e7eb; margin: 24px 0;" />
```

## Beispiel: Vollständiges Regelwerk

```html
<h2 style="color: #8b5cf6; margin-bottom: 16px;">🏃 Trainingsregeln</h2>

<p style="margin-bottom: 16px;">
  Diese Regeln gelten für alle Trainings und sind von allen Teilnehmern einzuhalten.
</p>

<div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 16px 0; border-radius: 8px;">
  <strong style="color: #92400e;">⚠️ Wichtig:</strong> 
  <p style="color: #78350f; margin-top: 4px; margin-bottom: 0;">
    Bitte lies diese Regeln sorgfältig durch und bestätige sie.
  </p>
</div>

<h3 style="margin-top: 24px; margin-bottom: 12px; color: #374151;">Allgemeine Regeln</h3>

<ul style="margin-left: 20px; margin-bottom: 16px;">
  <li style="margin-bottom: 8px;">
    <strong>Pünktlichkeit:</strong> Erscheine 10 Minuten vor Trainingsbeginn
  </li>
  <li style="margin-bottom: 8px;">
    <strong>Sportkleidung:</strong> Angemessene Kleidung ist Pflicht
  </li>
  <li style="margin-bottom: 8px;">
    <strong>Respekt:</strong> Respektvoller Umgang mit Trainern und Teammitgliedern
  </li>
  <li style="margin-bottom: 8px;">
    <strong>Handy:</strong> Während des Trainings auf lautlos stellen
  </li>
</ul>

<h3 style="margin-top: 24px; margin-bottom: 12px; color: #374151;">Sicherheit</h3>

<div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 12px; margin: 16px 0; border-radius: 8px;">
  <strong style="color: #991b1b;">🚫 Verboten:</strong>
  <ul style="color: #7f1d1d; margin-top: 8px; margin-bottom: 0; margin-left: 20px;">
    <li>Training bei Verletzungen ohne Absprache</li>
    <li>Eigenmächtige Übungen ohne Aufsicht</li>
    <li>Störung anderer Trainingsteilnehmer</li>
  </ul>
</div>

<hr style="border: none; border-top: 2px solid #e5e7eb; margin: 24px 0;" />

<div style="background-color: #dcfce7; border-left: 4px solid #10b981; padding: 12px; margin: 16px 0; border-radius: 8px;">
  <strong style="color: #065f46;">✅ Bei Fragen:</strong> 
  <p style="color: #064e3b; margin-top: 4px; margin-bottom: 0;">
    Wende dich jederzeit an deinen Coach!
  </p>
</div>

<p style="margin-top: 24px; text-align: center; color: #6b7280; font-size: 14px;">
  <em>Version 1.0 • Gültig ab 01.01.2025</em>
</p>
```

## Mobile-Optimierung

Das System wendet automatisch folgende Optimierungen an:

### Automatische Anpassungen:
- ✅ **Responsive Bilder**: `max-width: 100%; height: auto;`
- ✅ **Textumbruch**: Lange Wörter werden automatisch umgebrochen
- ✅ **Touch-optimiert**: Größere Klickflächen für Links
- ✅ **Lesbare Schriftgrößen**: Mindestens 14px auf Mobile
- ✅ **Angepasste Abstände**: Padding und Margins werden optimiert
- ✅ **Horizontales Scrollen verhindert**: `overflow-wrap: anywhere`

### Best Practices für Mobile:

1. **Kurze Absätze**: Max. 3-4 Zeilen pro Absatz
2. **Listen verwenden**: Besser lesbar als lange Texte
3. **Kontrastreiche Farben**: Gut lesbar auch bei Sonnenlicht
4. **Große Buttons**: Min. 44x44px Touch-Ziele
5. **Keine feste Breiten**: Nur relative Einheiten (%, rem)

## Tipps für gute Formatierung

### ✅ Empfohlen:
- Überschriften für Struktur verwenden
- Listen für Aufzählungen
- Farbige Boxen für wichtige Hinweise
- Kurze, prägnante Absätze
- Emojis für visuelle Akzente 🎉

### ❌ Vermeiden:
- Zu kleine Schriftgrößen (< 14px)
- Zu viele verschiedene Farben
- Feste Pixel-Breiten
- Zu breite Tabellen (> 100%)
- Zu lange Textblöcke ohne Absätze

## Schnell-Referenz: Vorlagen

### Info-Box (Blau)
```html
<div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 12px; margin: 16px 0; border-radius: 8px;">
  <strong style="color: #1e40af;">ℹ️ Information:</strong> 
  <p style="color: #1e3a8a; margin-top: 4px; margin-bottom: 0;">Dein Text hier</p>
</div>
```

### Erfolgs-Box (Grün)
```html
<div style="background-color: #dcfce7; border-left: 4px solid #10b981; padding: 12px; margin: 16px 0; border-radius: 8px;">
  <strong style="color: #065f46;">✅ Erfolg:</strong> 
  <p style="color: #064e3b; margin-top: 4px; margin-bottom: 0;">Dein Text hier</p>
</div>
```

### Warn-Box (Gelb)
```html
<div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 16px 0; border-radius: 8px;">
  <strong style="color: #92400e;">⚠️ Warnung:</strong> 
  <p style="color: #78350f; margin-top: 4px; margin-bottom: 0;">Dein Text hier</p>
</div>
```

### Fehler-Box (Rot)
```html
<div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 12px; margin: 16px 0; border-radius: 8px;">
  <strong style="color: #991b1b;">❌ Fehler:</strong> 
  <p style="color: #7f1d1d; margin-top: 4px; margin-bottom: 0;">Dein Text hier</p>
</div>
```

---

**Viel Erfolg beim Erstellen deiner Regelwerke! 🎉**
