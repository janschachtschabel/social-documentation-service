# Sozialarbeit Dokumentationssystem

Eine KI-gestützte Web-Anwendung für Sozialarbeiter und Erzieher zur Verwaltung von Klienten, Dokumentation von Gesprächsterminen, Erstellung von Berichten und Visualisierung von Fortschrittsindikatoren.

## Features

### 📋 Kernfunktionen
- **Kundenverwaltung**: Erstellen und Verwalten von Klientenprofilen
- **KI-gestützte Spracheingabe**: Sprach-zu-Text für Protokolle und Formulare
- **Gesprächstermin-Protokollierung**: Strukturierte Dokumentation mit automatischer Feldaufteilung
- **Automatische Berichtserstellung**: KI generiert Anamnesen, Zwischen- und Endberichte
- **Statistiken & Visualisierungen**: Fortschrittsindikatoren über verschiedene Bereiche

### 🎯 Fortschrittsindikatoren
- Finanzen
- Gesundheit
- Bewerbungsmanagement
- Familiensituation
- Kinderfürsorge

### 🔐 Authentifizierung & Rollen
- **Administrator**: Vollzugriff inkl. Benutzerverwaltung
- **Sozialarbeiter**: Zugriff auf alle Dokumentationsfunktionen

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **UI**: Material-UI (MUI) mit Google Material Design
- **Backend**: Next.js API Routes
- **Datenbank**: Supabase (PostgreSQL)
- **KI**: OpenAI GPT-4 für Text-Parsing und Berichtserstellung
- **Deployment**: Vercel
- **Visualisierungen**: Recharts

## Voraussetzungen

- Node.js 18+ 
- npm oder yarn
- Supabase Account
- OpenAI API Key

## Installation & Setup

### 1. Repository klonen und Dependencies installieren

```bash
npm install
```

### 2. Supabase einrichten

1. Erstellen Sie ein Projekt auf [Supabase](https://supabase.com)
2. Führen Sie das SQL-Schema aus:
   - Öffnen Sie den SQL Editor in Supabase
   - Kopieren Sie den Inhalt von `supabase/schema.sql`
   - Führen Sie das SQL aus

3. Notieren Sie sich:
   - Project URL
   - Anon Key
   - Service Role Key

### 3. OpenAI API Key erhalten

1. Besuchen Sie [OpenAI Platform](https://platform.openai.com)
2. Erstellen Sie einen API Key
3. Stellen Sie sicher, dass Sie Zugriff auf GPT-4 haben

### 4. Umgebungsvariablen konfigurieren

Erstellen Sie eine `.env.local` Datei im Root-Verzeichnis:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=ihre_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=ihr_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=ihr_supabase_service_role_key

# OpenAI
OPENAI_API_KEY=ihr_openai_api_key
```

### 5. Erste Benutzer anlegen

Da die Benutzerverwaltung über die App nur durch Admins erfolgt, müssen Sie die ersten Benutzer manuell in Supabase anlegen:

#### Option A: Über Supabase Dashboard

1. Gehen Sie zu Authentication > Users
2. Klicken Sie auf "Add User"
3. Erstellen Sie die Benutzer:

**Administrator:**
- Email: `admin@example.com`
- Passwort: `wlo2025!`

**Sozialarbeiter:**
- Email: `sozial1@example.com`
- Passwort: `wlo2025!`

4. Gehen Sie zum SQL Editor und fügen Sie die Profile ein:

```sql
-- Admin Profile
INSERT INTO profiles (id, email, role, full_name)
VALUES (
  'die_user_id_vom_admin',
  'admin@example.com',
  'admin',
  'Administrator'
);

-- Sozialarbeiter Profile
INSERT INTO profiles (id, email, role, full_name)
VALUES (
  'die_user_id_vom_sozialarbeiter',
  'sozial1@example.com',
  'social_worker',
  'Sozialarbeiter 1'
);
```

#### Option B: Über SQL (Empfohlen)

Führen Sie im Supabase SQL Editor aus:

```sql
-- Dies erstellt Benutzer mit den gewünschten Credentials
-- Passen Sie die IDs und Passwörter bei Bedarf an
```

### 6. Entwicklungsserver starten

```bash
npm run dev
```

Die App läuft nun auf [http://localhost:3000](http://localhost:3000)

## Deployment auf Vercel

### 1. Vercel Account erstellen

Besuchen Sie [Vercel](https://vercel.com) und erstellen Sie einen Account

### 2. Repository mit Vercel verbinden

```bash
# Installieren Sie die Vercel CLI (optional)
npm i -g vercel

# Deployment durchführen
vercel
```

Alternativ:
1. Gehen Sie zu vercel.com
2. Klicken Sie auf "New Project"
3. Importieren Sie Ihr Git Repository
4. Konfigurieren Sie die Umgebungsvariablen
5. Deployen Sie

### 3. Umgebungsvariablen in Vercel setzen

Fügen Sie in den Vercel Project Settings > Environment Variables die gleichen Variablen aus `.env.local` hinzu.

## Verwendung

### Login

1. Öffnen Sie die App
2. Melden Sie sich mit einem der Testkonten an:
   - **Admin**: admin@example.com / wlo2025!
   - **Sozialarbeiter**: sozial1@example.com / wlo2025!

### Neuen Klienten anlegen

1. Navigieren Sie zu "Klienten"
2. Klicken Sie auf "Neuer Klient"
3. Optional: Nutzen Sie die Spracheingabe (Mikrofon-Button)
4. Geben Sie die Klientendaten ein (Name ist Pflicht)
5. Die KI extrahiert automatisch strukturierte Informationen

### Gesprächstermin protokollieren

1. Wählen Sie einen Klienten aus
2. Klicken Sie auf "Neuer Termin"
3. Optional: Nutzen Sie die Spracheingabe
4. Beschreiben Sie das Gespräch frei
5. Die KI ordnet die Informationen automatisch in die Felder:
   - Aktueller Stand
   - Vorgenommene Aktionen
   - Nächste Schritte
   - Netzwerkeinbezug
6. Fortschrittsindikatoren werden automatisch bewertet

### Berichte erstellen

1. Öffnen Sie einen Klienten
2. Klicken Sie auf:
   - "Anamnese erstellen" (zu Beginn)
   - "Zwischenbericht erstellen" (während der Betreuung)
   - "Abschlussbericht erstellen" (am Ende)
3. Die KI generiert automatisch einen strukturierten Bericht aus allen Protokollen

### Statistiken ansehen

1. Navigieren Sie zu "Statistiken"
2. Wählen Sie einen Klienten aus
3. Sehen Sie die Entwicklung der Fortschrittsindikatoren über Zeit
4. Analysieren Sie Durchschnittswerte

### Benutzer verwalten (nur Admin)

1. Navigieren Sie zu "Benutzer verwalten"
2. Klicken Sie auf "Neuer Benutzer"
3. Geben Sie E-Mail, Passwort und Rolle ein
4. Der Benutzer kann sich sofort anmelden

## Datenbankschema

### Tables

- **profiles**: Benutzerprofile mit Rollen
- **clients**: Klientenstammdaten
- **sessions**: Gesprächstermin-Protokolle
- **reports**: Generierte Berichte
- **progress_indicators**: Fortschrittswerte pro Termin

## API Endpoints

- `POST /api/parse-client`: Extrahiert Klientendaten aus Text
- `POST /api/parse-session`: Analysiert Gesprächsprotokoll
- `POST /api/generate-report`: Generiert strukturierte Berichte

## Sicherheit

- Row Level Security (RLS) in Supabase aktiviert
- Authentifizierung über Supabase Auth
- API Keys über Umgebungsvariablen
- Rollenbasierte Zugriffskontrollen

## Anpassungen

### Material Design Theme anpassen

Bearbeiten Sie `components/ThemeRegistry.tsx`:

```typescript
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Ihre Farbe
    },
    // ...
  },
});
```

### Fortschrittsindikatoren erweitern

1. Aktualisieren Sie das Datenbankschema in `supabase/schema.sql`
2. Passen Sie die Types in `lib/supabase.ts` an
3. Erweitern Sie die OpenAI-Prompts in `lib/openai.ts`
4. Aktualisieren Sie die Visualisierungen in `app/dashboard/statistics/page.tsx`

## Troubleshooting

### Problem: "Failed to fetch" bei API-Aufrufen

- Überprüfen Sie die Umgebungsvariablen
- Stellen Sie sicher, dass OpenAI API Key gültig ist
- Prüfen Sie Supabase Connection

### Problem: Benutzer kann sich nicht anmelden

- Überprüfen Sie, ob das Profil in der `profiles` Tabelle existiert
- Stellen Sie sicher, dass RLS Policies korrekt sind
- Prüfen Sie Supabase Auth Settings

### Problem: Spracheingabe funktioniert nicht

- Stellen Sie sicher, dass die App über HTTPS läuft (in Production)
- Überprüfen Sie Browser-Berechtigungen für Mikrofon
- In Development: localhost wird als secure context behandelt

## Lizenz

Proprietary - Alle Rechte vorbehalten

## Support

Bei Fragen oder Problemen öffnen Sie ein Issue im Repository.

---

Erstellt mit ❤️ für Sozialarbeiter und Erzieher
