# Vercel Deployment & Datenbank-Setup

## ⚠️ Wichtig: Setup-Reihenfolge

Das Datenbank-Setup sollte **NICHT** automatisch bei jedem Vercel-Build laufen!

**Grund:** 
- Test-Benutzer würden bei jedem Deploy neu erstellt (oder Fehler werfen)
- Schema sollte nur einmal ausgeführt werden
- Sicherheit: Build-Logs sind öffentlich sichtbar

## ✅ Richtige Setup-Reihenfolge

### 1. **Lokales Setup (einmalig)**

#### A) Environment Variables setzen

Erstellen Sie `.env.local` lokal:

```env
NEXT_PUBLIC_SUPABASE_URL=https://stjjipfihjqsvrjnkrfn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
OPENAI_API_KEY=sk-proj-...
```

#### B) Schema ausführen (einmalig in Supabase)

1. Öffnen: https://supabase.com/dashboard/project/stjjipfihjqsvrjnkrfn/sql/new
2. Kopieren Sie den Inhalt von `supabase/schema.sql`
3. Klicken Sie **"Run"**

#### C) Test-Benutzer erstellen (einmalig lokal)

```bash
npm install
npm run setup:db
```

**Das war's für die Datenbank!** Sie ist jetzt eingerichtet.

---

### 2. **Vercel Deployment**

#### A) Repository zu GitHub pushen

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/IHR_USERNAME/social-documentation-service.git
git push -u origin main
```

#### B) Projekt mit Vercel verbinden

1. Gehen Sie zu: https://vercel.com/new
2. Importieren Sie Ihr GitHub Repository
3. Vercel erkennt automatisch Next.js

#### C) Environment Variables in Vercel setzen

**Settings → Environment Variables → Add**

```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://stjjipfihjqsvrjnkrfn.supabase.co
Environments: ✓ Production  ✓ Preview  ✓ Development
```

```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (Ihr echter Key)
Environments: ✓ Production  ✓ Preview  ✓ Development
```

```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (Ihr echter Key)
Environments: ✓ Production  ✓ Preview  ✓ Development
```

```
Name: OPENAI_API_KEY
Value: sk-proj-... (Ihr echter Key)
Environments: ✓ Production  ✓ Preview  ✓ Development
```

#### D) Deploy auslösen

```bash
# Automatisch bei Git Push:
git push

# Oder manuell via CLI:
vercel --prod
```

---

## 🔄 Was passiert bei Vercel Builds?

### ✅ Was Vercel macht:
1. `npm install` - Dependencies installieren
2. `npm run build` - Next.js App bauen
3. Deployment

### ❌ Was Vercel NICHT macht:
- ❌ Datenbank-Schema ausführen
- ❌ Test-Benutzer erstellen
- ❌ `npm run setup:db` ausführen

**Das ist gut so!** Die Datenbank ist bereits eingerichtet.

---

## 🎯 Workflow-Übersicht

```
┌─────────────────────────────────────────┐
│ EINMALIG (Lokal)                        │
├─────────────────────────────────────────┤
│ 1. Schema in Supabase ausführen         │
│ 2. npm run setup:db (Benutzer anlegen)  │
└─────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ EINMALIG (Vercel)                       │
├─────────────────────────────────────────┤
│ 1. Projekt importieren                  │
│ 2. Environment Variables setzen         │
│ 3. Erstes Deployment                    │
└─────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ WIEDERKEHREND (Entwicklung)             │
├─────────────────────────────────────────┤
│ 1. Code ändern                          │
│ 2. git push                             │
│ 3. Vercel deployed automatisch          │
└─────────────────────────────────────────┘
```

---

## ❓ FAQ

### **Q: Warum läuft setup:db nicht automatisch bei Vercel?**

**A:** Weil:
1. Die Datenbank ist **persistent** (nicht neu bei jedem Deploy)
2. Benutzer sollten nur einmal erstellt werden
3. Schema-Änderungen sollten manuell kontrolliert werden
4. Build-Logs sind öffentlich (keine Passwörter!)

### **Q: Was wenn ich das Schema ändern will?**

**A:** 
1. Änderungen in `supabase/schema.sql` vornehmen
2. Neue Migration in Supabase SQL Editor ausführen
3. **Nicht** das gesamte Schema neu ausführen (würde existierende Daten löschen)

### **Q: Wie erstelle ich neue Benutzer in Production?**

**Option 1 - Via Supabase Dashboard** (Empfohlen):
1. Öffnen: https://supabase.com/dashboard/project/stjjipfihjqsvrjnkrfn/auth/users
2. "Add user" klicken
3. Profil in SQL Editor erstellen

**Option 2 - Via Admin-UI in der App**:
1. Als Admin einloggen
2. `/dashboard/users` öffnen
3. Neuen Benutzer erstellen

**Option 3 - Setup-Script lokal ausführen** (nur für Test-User):
```bash
# Lokal auf Ihrem Computer:
npm run setup:db
```

### **Q: Was wenn ich die Test-Benutzer löschen will?**

**A:**
```sql
-- In Supabase SQL Editor:
DELETE FROM profiles WHERE email IN ('admin@example.com', 'sozial1@example.com');
```

Dann in Auth Dashboard die User auch löschen.

---

## 🔐 Sicherheits-Best Practices

### ✅ Do's:
- ✅ Environment Variables nur in Vercel Dashboard setzen
- ✅ Schema manuell in Supabase ausführen
- ✅ Test-Benutzer lokal erstellen (einmalig)
- ✅ Production-Benutzer via Supabase Dashboard erstellen

### ❌ Don'ts:
- ❌ KEINE automatischen Datenbank-Änderungen beim Build
- ❌ KEINE Passwörter in Build-Logs
- ❌ KEINE Schema-Ausführung in CI/CD
- ❌ KEINE `.env` Dateien committen

---

## 🚀 Deployment-Checkliste

### Vor dem ersten Deployment:

- [ ] `.env.local` lokal erstellt
- [ ] Schema in Supabase ausgeführt (`schema.sql`)
- [ ] Test-Benutzer mit `npm run setup:db` erstellt
- [ ] Login lokal getestet (`npm run dev`)
- [ ] Code zu GitHub gepusht

### Vercel Setup:

- [ ] Projekt mit Vercel verbunden
- [ ] `NEXT_PUBLIC_SUPABASE_URL` gesetzt
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` gesetzt
- [ ] `SUPABASE_SERVICE_ROLE_KEY` gesetzt
- [ ] `OPENAI_API_KEY` gesetzt
- [ ] Erstes Deployment erfolgreich
- [ ] Production-Login getestet

---

## 📊 Deployment-Logs prüfen

Nach dem Deployment:

1. **Build Logs**:
   - Vercel Dashboard → Deployments → Ihr Deployment → Building
   - Sollte keine Datenbank-Befehle zeigen
   - Nur `npm install` und `npm run build`

2. **Function Logs**:
   - Vercel Dashboard → Functions → Logs
   - Prüfen Sie API-Routes (`/api/parse-client`, etc.)

3. **Runtime Logs**:
   - Bei Fehlern hier nachsehen
   - Zeigt Fehler zur Laufzeit (nicht Build-Zeit)

---

## ✅ Zusammenfassung

**Lokales Setup (einmalig):**
```bash
npm install
npm run setup:db
npm run dev
```

**Vercel Setup (einmalig):**
1. GitHub Repository erstellen
2. Vercel-Projekt erstellen
3. Environment Variables setzen
4. Deployen

**Updates (wiederkehrend):**
```bash
git add .
git commit -m "Update"
git push  # ← Vercel deployed automatisch
```

**Die Datenbank bleibt unverändert!** ✨

---

**Status:** ✅ **Vercel-kompatibel und production-ready!**
