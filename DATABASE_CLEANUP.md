# 🗄️ DATENBANK-BEREINIGUNG - 05.11.2025

## ⚠️ WICHTIG: NUR EINE DATENBANK VERWENDEN!

### ✅ AKTIVE DATENBANK (Die einzige, die verwendet wird):

```
DATABASE_URL=postgresql://neondb_owner:npg_d2x8QHsDLzFM@ep-icy-darkness-aga8aesc-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

**Host:** `ep-icy-darkness-aga8aesc-pooler.c-2.eu-central-1.aws.neon.tech`
**Database:** `neondb`
**User:** `neondb_owner`

---

## 📂 PROJEKT-STRUKTUR

### ✅ AKTIVES PROJEKT:
```
/Users/q-tec/back modern/ica_dev/
```
- **Status:** ✅ IN VERWENDUNG
- **Datenbank:** Siehe oben (einzige aktive DB)
- **Server:** http://localhost:3000
- **Letzte Änderungen:** 05.11.2025
  - Coach Dashboard Filter
  - Absage-Grund Funktion
  - Kalender Modernisierung

### ❌ ALTE PROJEKTE (NICHT MEHR VERWENDEN):

#### 1. `/Users/q-tec/ica_dev/`
- **Status:** ❌ VERALTET
- **Datenbank:** Hatte alte Neon-DB (ep-raspy-paper)
- **Aktion:** ⚠️ NICHT VERWENDEN! Nur zur Referenz behalten

#### 2. `/Users/q-tec/ica/`
- **Status:** ❌ SEHR ALT
- **Datenbank:** Unbekannt
- **Aktion:** ⚠️ NICHT VERWENDEN!

---

## 🔧 KONFIGURATION

### Aktuelle .env.local (KORREKT):

```bash
# ==========================================
# Neon Database Connection (DIE EINZIGE!)
# ==========================================
DATABASE_URL='postgresql://neondb_owner:npg_d2x8QHsDLzFM@ep-icy-darkness-aga8aesc-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require'

# ==========================================
# NextAuth Configuration
# ==========================================
NEXTAUTH_SECRET='rwNZcuMEd1DtPKLhG0f+rzWhSdM/C8LCITjn503UYlU='
NEXTAUTH_URL='http://localhost:3000'
```

**Andere Keys (optional):**
- Stack Auth Keys (falls verwendet)
- VAPID Keys für Push Notifications

---

## ✅ CHECKLISTE - KEINE VERWIRRUNG MEHR!

- [x] Nur ein Projekt verwenden: `/Users/q-tec/back modern/ica_dev/`
- [x] Nur eine Datenbank: `ep-icy-darkness-aga8aesc`
- [x] .env.local ist korrekt konfiguriert
- [x] Alte Projekte sind dokumentiert (NICHT LÖSCHEN, nur nicht verwenden)
- [x] Server läuft auf Port 3000
- [x] Alle Migrationen wurden ausgeführt

---

## 🚀 ARBEITSABLAUF

### Immer dieser Ordner:
```bash
cd "/Users/q-tec/back modern/ica_dev"
```

### Server starten:
```bash
npm run dev
# oder im Netzwerk:
npm run dev -- -H 0.0.0.0
```

### Datenbank-Zugriff (falls nötig):
```bash
node <script-name>.mjs
# Verwendet automatisch DATABASE_URL aus .env.local
```

---

## 📊 DATENBANK-INHALT (Stand 05.11.2025)

### Benutzer:
- **Admin:** qtec / kai@ica.de (ID: 8)
- **Coach:** kai / kai.puettmann@gmx.de (ID: 92)
- Weitere Coaches und Mitglieder vorhanden

### Teams:
- Mini Stars
- Junior Flyers  
- Youth Elite
- Senior All Stars
- Cheer Prep
- + weitere Teams

### Features:
- ✅ Training Attendance mit decline_reason
- ✅ Coach Dashboard mit Team-Filter
- ✅ Events & Calendar
- ✅ Messages System
- ✅ Comments System

---

## 🗑️ AUFRÄUM-EMPFEHLUNG (Optional)

### Später mal machen (wenn sicher):

```bash
# WARNUNG: Nur ausführen wenn 100% sicher!
# Alte Projekte löschen (nach Backup!):

# Erstmal nur umbenennen (sicherer):
mv "/Users/q-tec/ica_dev" "/Users/q-tec/ica_dev_OLD_BACKUP"
mv "/Users/q-tec/ica" "/Users/q-tec/ica_OLD_BACKUP"
```

**ABER:** Erstmal so lassen! Nur dokumentiert, nicht gelöscht.

---

## 🎯 ZUSAMMENFASSUNG

**Eine Datenbank. Ein Projekt. Kein Durcheinander.**

```
Aktiv:  /Users/q-tec/back modern/ica_dev/
DB:     ep-icy-darkness-aga8aesc-pooler
Port:   3000
Status: ✅ PRODUKTIV
```

**Alle anderen Ordner ignorieren!**

---

## 📝 ÄNDERUNGSHISTORIE

### 05.11.2025:
- ✅ Dokumentation erstellt
- ✅ Bestätigt: Nur eine DB wird verwendet
- ✅ Alte Projekte dokumentiert
- ✅ Projekt-Struktur geklärt

### 03.11.2025:
- Repository geklont und modernisiert
- Datenbank migriert
- Server aufgesetzt

---

## 🆘 WICHTIG BEI PROBLEMEN:

### Falls der Server die falsche DB verwendet:

1. **Prüfen:** `cd "/Users/q-tec/back modern/ica_dev"`
2. **Checken:** `cat .env.local | grep DATABASE_URL`
3. **Muss sein:** `ep-icy-darkness-aga8aesc-pooler`

### Falls in falschem Ordner:

```bash
# Immer zuerst:
cd "/Users/q-tec/back modern/ica_dev"

# Dann weiter arbeiten
```

---

**🎉 Jetzt ist alles klar und übersichtlich!**
