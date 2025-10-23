# Vercel Deployment Anleitung

## ✅ Sicherheit geprüft

Die App ist korrekt für Vercel konfiguriert:

- ✅ `.env.local` und `.env` sind in `.gitignore` und werden **NICHT** hochgeladen
- ✅ OpenAI API Key wird nur **serverseitig** verwendet (API Routes)
- ✅ Keine sensiblen Daten werden client-seitig exponiert
- ✅ Alle API-Aufrufe laufen über Next.js API Routes

## 🚀 Deployment Schritte

### 1. Repository auf GitHub pushen

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/IHR_USERNAME/social-documentation-service.git
git push -u origin main
```

### 2. Projekt mit Vercel verbinden

#### Option A: Via Vercel Dashboard (Empfohlen)

1. Gehen Sie zu [vercel.com](https://vercel.com)
2. Klicken Sie auf **"Add New Project"**
3. Importieren Sie Ihr GitHub Repository
4. Vercel erkennt automatisch Next.js

#### Option B: Via Vercel CLI

```bash
npm i -g vercel
vercel login
vercel
```

### 3. Environment Variables in Vercel setzen

**WICHTIG:** Die Environment Variables müssen in Vercel konfiguriert werden!

#### Via Vercel Dashboard:

1. Gehen Sie zu Ihrem Projekt
2. Klicken Sie auf **Settings** > **Environment Variables**
3. Fügen Sie folgende Variablen hinzu:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `OPENAI_API_KEY` | `sk-...` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Production, Preview, Development |

**Hinweis:** 
- ✅ `NEXT_PUBLIC_*` Variablen sind für den Browser sichtbar (nur für öffentliche Keys!)
- 🔒 `OPENAI_API_KEY` und `SUPABASE_SERVICE_ROLE_KEY` sind **nur serverseitig** verfügbar

4. Klicken Sie auf **"Save"**

#### Via Vercel CLI:

```bash
vercel env add OPENAI_API_KEY
# Geben Sie Ihren API Key ein
# Wählen Sie: Production, Preview, Development

vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

### 4. Deployment auslösen

Nach dem Setzen der Environment Variables:

#### Automatisch:
- Jeder `git push` löst ein neues Deployment aus

#### Manuell via Dashboard:
- Gehen Sie zu **Deployments**
- Klicken Sie auf **"Redeploy"**

#### Via CLI:
```bash
vercel --prod
```

## 🔍 Deployment überprüfen

### 1. Build-Logs prüfen

Gehen Sie zu Ihrem Deployment in Vercel und überprüfen Sie die Build-Logs auf Fehler.

### 2. Environment Variables testen

Nach dem Deployment:

1. Öffnen Sie Ihre App
2. Melden Sie sich an
3. Erstellen Sie einen Test-Klienten
4. Testen Sie die KI-Funktionen (Parsing, Berichte)

Wenn die KI-Funktionen nicht funktionieren:
- ✅ Prüfen Sie, ob `OPENAI_API_KEY` korrekt gesetzt ist
- ✅ Prüfen Sie die Function Logs in Vercel

### 3. Function Logs ansehen

```
Vercel Dashboard > Ihr Projekt > Functions
```

Hier sehen Sie Logs der API Routes (`/api/parse-session`, etc.)

## 🔒 Sicherheits-Best Practices

### ✅ Was ist bereits implementiert:

1. **Keine .env Dateien im Git**
   - `.gitignore` schließt alle `.env*` Dateien aus

2. **OpenAI API Key serverseitig**
   - Wird nur in `/app/api/*` Route Handlers verwendet
   - Nie client-seitig exponiert

3. **Supabase Row Level Security (RLS)**
   - Datenbankzugriffe sind durch RLS Policies geschützt
   - Benutzer sehen nur ihre autorisierten Daten

4. **Authentifizierung**
   - Supabase Auth mit sicheren Sessions
   - Rollenbasierte Zugriffskontrolle

### 🔐 Zusätzliche Empfehlungen:

1. **OpenAI API Key Budget Limits setzen**
   ```
   https://platform.openai.com/account/billing/limits
   ```

2. **Supabase RLS Policies prüfen**
   - Stellen Sie sicher, dass das Schema korrekt angewendet wurde

3. **Vercel-spezifische Sicherheit**
   ```bash
   # Setzen Sie Deployment Protection (optional)
   Vercel Dashboard > Settings > Deployment Protection
   ```

## 📊 Performance & Monitoring

### Vercel Analytics aktivieren (optional)

```
Vercel Dashboard > Ihr Projekt > Analytics > Enable
```

### Function Timeouts prüfen

OpenAI API Calls können länger dauern:

```javascript
// In vercel.json (falls nötig)
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 60
    }
  }
}
```

## 🔄 Updates & Rollbacks

### Neues Update deployen:

```bash
git add .
git commit -m "Update: ..."
git push
```

### Rollback zu vorheriger Version:

```
Vercel Dashboard > Deployments > 
Wählen Sie eine alte Version > "Promote to Production"
```

## 🌍 Custom Domain (optional)

1. Gehen Sie zu **Settings** > **Domains**
2. Fügen Sie Ihre Domain hinzu
3. Konfigurieren Sie DNS Records bei Ihrem Domain-Provider

## ❓ Troubleshooting

### "Missing Environment Variables"

**Problem:** Build schlägt fehl mit "OPENAI_API_KEY is not defined"

**Lösung:**
1. Gehen Sie zu Settings > Environment Variables
2. Stellen Sie sicher, dass alle 4 Variablen gesetzt sind
3. Wählen Sie alle Environments (Production, Preview, Development)
4. Redeploy das Projekt

### "OpenAI API Error"

**Problem:** KI-Funktionen funktionieren nicht

**Lösung:**
1. Prüfen Sie Function Logs in Vercel
2. Verifizieren Sie den OpenAI API Key
3. Stellen Sie sicher, dass Billing aktiviert ist
4. Prüfen Sie Rate Limits

### "Supabase Connection Failed"

**Problem:** Datenbank-Verbindung funktioniert nicht

**Lösung:**
1. Prüfen Sie die Supabase URL und Keys
2. Stellen Sie sicher, dass das Supabase-Projekt läuft
3. Verifizieren Sie RLS Policies

## 📝 Checkliste vor Deployment

- [ ] GitHub Repository erstellt und Code gepusht
- [ ] Vercel Account erstellt
- [ ] Projekt mit Vercel verbunden
- [ ] Alle 4 Environment Variables in Vercel gesetzt
- [ ] Supabase Datenbank-Schema ausgeführt
- [ ] Test-Benutzer in Supabase angelegt
- [ ] Deployment erfolgreich
- [ ] Login getestet
- [ ] KI-Funktionen getestet

## 🎉 Fertig!

Ihre App ist jetzt live unter:
```
https://ihr-projekt.vercel.app
```

Die App aktualisiert sich automatisch bei jedem Git Push!
