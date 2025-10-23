# Supabase Keys Anleitung

## Ihre Supabase URL

```
https://stjjipfihjqsvrjnkrfn.supabase.co
```

## Keys finden

### 1. Anon (Public) Key

1. Gehen Sie zu Ihrem Supabase Projekt: https://supabase.com/dashboard/project/stjjipfihjqsvrjnkrfn
2. Klicken Sie auf **Settings** (Zahnrad-Symbol)
3. Klicken Sie auf **API**
4. Unter **Project API keys** finden Sie:
   - **anon** **public** - Dies ist Ihr `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Service Role Key

1. Im gleichen Bereich unter **Project API keys**
2. Finden Sie **service_role** **secret**
3. ⚠️ **WICHTIG:** Dieser Key hat VOLLE Rechte - niemals client-seitig verwenden!
4. Dies ist Ihr `SUPABASE_SERVICE_ROLE_KEY`

## .env.local Datei erstellen

Erstellen Sie eine Datei `.env.local` im Projekt-Root mit folgendem Inhalt:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://stjjipfihjqsvrjnkrfn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0amppcGZpaGpxc3ZyankuLi4
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0amppcGZpaGpxc3ZyankuLi4

# OpenAI
OPENAI_API_KEY=sk-proj-...
```

**Ersetzen Sie die Platzhalter** mit Ihren echten Keys aus dem Supabase Dashboard!

## Key-Typen erklärt

### NEXT_PUBLIC_SUPABASE_ANON_KEY (Anon Key)
- ✅ Im Browser sichtbar (durch `NEXT_PUBLIC_` Prefix)
- ✅ Sicher, weil durch Row Level Security (RLS) geschützt
- ✅ Kann nur auf Daten zugreifen, die RLS erlaubt
- Verwendung: Client-seitige Supabase-Aufrufe

### SUPABASE_SERVICE_ROLE_KEY (Service Role Key)
- ⚠️ Nur serverseitig verfügbar (kein `NEXT_PUBLIC_` Prefix)
- ⚠️ Umgeht alle RLS-Regeln
- ⚠️ Volle Datenbank-Rechte
- Verwendung: Admin-Operationen (z.B. Benutzer erstellen)

## Vercel Environment Variables

Für Vercel Deployment setzen Sie die gleichen Variablen:

```
Settings > Environment Variables

Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://stjjipfihjqsvrjnkrfn.supabase.co
Environments: Production, Preview, Development

Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbG... (Ihr Anon Key)
Environments: Production, Preview, Development

Name: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbG... (Ihr Service Role Key)
Environments: Production, Preview, Development

Name: OPENAI_API_KEY
Value: sk-proj-... (Ihr OpenAI Key)
Environments: Production, Preview, Development
```

## Schnellzugriff

**Supabase Dashboard:**
https://supabase.com/dashboard/project/stjjipfihjqsvrjnkrfn

**API Settings:**
https://supabase.com/dashboard/project/stjjipfihjqsvrjnkrfn/settings/api

**Database (SQL Editor):**
https://supabase.com/dashboard/project/stjjipfihjqsvrjnkrfn/editor

**Authentication:**
https://supabase.com/dashboard/project/stjjipfihjqsvrjnkrfn/auth/users
