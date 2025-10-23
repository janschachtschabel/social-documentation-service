# Automatisches Datenbank-Setup

## 🚀 Schnellstart (1 Befehl)

```bash
npm run setup:db
```

Das Script:
- ✅ Prüft ob Tabellen existieren
- ✅ Erstellt Test-Benutzer automatisch
- ✅ Verifiziert das Setup

## Voraussetzungen

1. `.env.local` Datei mit Supabase Keys erstellen
2. Schema manuell ausführen (einmalig)

## Schritt-für-Schritt

### 1. Environment Variables setzen

Erstellen Sie `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://stjjipfihjqsvrjnkrfn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
OPENAI_API_KEY=sk-proj-...
```

### 2. Schema ausführen (einmalig)

Öffnen Sie: https://supabase.com/dashboard/project/stjjipfihjqsvrjnkrfn/sql/new

Kopieren Sie `supabase/schema.sql` und klicken Sie "Run"

### 3. Setup-Script ausführen

```bash
npm install
npm run setup:db
```

Das Script erstellt automatisch:
- 👑 Admin: admin@example.com / wlo2025!
- 👤 Sozialarbeiter: sozial1@example.com / wlo2025!

### 4. App starten

```bash
npm run dev
```

Öffnen Sie: http://localhost:3000

## ✨ Fertig!

Die Datenbank ist eingerichtet und Sie können sich einloggen.
