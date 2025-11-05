#!/bin/bash

# Farben für Ausgabe
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 Überprüfe Datenbank-Konfiguration..."
echo ""

# Prüfe ob .env.local existiert
if [ ! -f ".env.local" ]; then
    echo -e "${RED}❌ FEHLER: .env.local nicht gefunden!${NC}"
    exit 1
fi

# Lese DATABASE_URL
DB_URL=$(grep "DATABASE_URL" .env.local | cut -d'=' -f2- | tr -d "'\"")

echo "📊 Aktuelle DATABASE_URL:"
echo "$DB_URL"
echo ""

# Prüfe ob die korrekte Datenbank verwendet wird
if [[ $DB_URL == *"ep-icy-darkness-aga8aesc-pooler"* ]]; then
    echo -e "${GREEN}✅ KORREKT: Verwende die richtige Datenbank!${NC}"
    echo ""
    echo "Host: ep-icy-darkness-aga8aesc-pooler.c-2.eu-central-1.aws.neon.tech"
    echo "Database: neondb"
    echo ""
else
    echo -e "${RED}❌ WARNUNG: Falsche Datenbank!${NC}"
    echo ""
    echo "Erwartet: ep-icy-darkness-aga8aesc-pooler"
    echo ""
    echo "Bitte korrigiere .env.local mit:"
    echo "DATABASE_URL='postgresql://neondb_owner:npg_d2x8QHsDLzFM@ep-icy-darkness-aga8aesc-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require'"
    echo ""
    exit 1
fi

# Prüfe Verzeichnis
CURRENT_DIR=$(pwd)
if [[ $CURRENT_DIR == *"back modern/ica_dev"* ]]; then
    echo -e "${GREEN}✅ KORREKT: Im richtigen Projekt-Verzeichnis!${NC}"
    echo "Pfad: $CURRENT_DIR"
else
    echo -e "${YELLOW}⚠️  WARNUNG: Möglicherweise im falschen Verzeichnis!${NC}"
    echo "Aktuell: $CURRENT_DIR"
    echo "Erwartet: /Users/q-tec/back modern/ica_dev"
fi

echo ""
echo -e "${GREEN}🎉 Alles in Ordnung! Du kannst loslegen.${NC}"
