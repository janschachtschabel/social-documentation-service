# 🚀 Erstes Deployment - Vollständige Anleitung

## ⚠️ WICHTIG: Datenbank muss VOR dem ersten Deployment eingerichtet werden!

Beim ersten Deployment existiert noch **KEINE** Datenbank-Struktur. Diese muss einmalig eingerichtet werden.

---

## 📋 Checkliste Erstes Deployment

### ✅ Phase 1: Supabase Datenbank einrichten (EINMALIG)

#### **1. Supabase Projekt erstellen (falls noch nicht vorhanden)**

Wenn Sie noch kein Supabase Projekt haben:
1. Gehen Sie zu: https://supabase.com/dashboard
2. Klicken Sie auf "New Project"
3. Notieren Sie sich:
   - Project URL: `https://XXXXX.supabase.co`
   - Anon Key
   - Service Role Key

#### **2. Datenbank-Schema ausführen (ZWINGEND ERFORDERLICH)**

**Das ist der wichtigste Schritt!**

1. Öffnen Sie den SQL Editor:
   ```
   https://supabase.com/dashboard/project/IHRE_PROJECT_ID/sql/new
   ```

2. Kopieren Sie den **GESAMTEN** Inhalt aus `supabase/schema.sql`

3. Klicken Sie auf **"Run"**

4. Erwartete Ausgabe:
   ```
   ✓ CREATE EXTENSION
   ✓ CREATE TABLE profiles
   ✓ CREATE TABLE clients
   ✓ CREATE TABLE sessions
   ✓ CREATE TABLE reports
   ✓ CREATE TABLE progress_indicators
   ✓ CREATE INDEX ...
   ✓ ALTER TABLE ... ENABLE ROW LEVEL SECURITY
   ✓ CREATE POLICY ...
   ```

**Was wurde erstellt:**
- ✅ 5 Tabellen (profiles, clients, sessions, reports, progress_indicators)
- ✅ Indexes für Performance
- ✅ Row Level Security (RLS) Policies
- ✅ Update Trigger für timestamps

#### **3. Verifizierung - Prüfen Sie ob die Tabellen existieren**

Im Table Editor:
```
https://supabase.com/dashboard/project/IHRE_PROJECT_ID/editor
```

Sie sollten sehen:
- ✅ `profiles`
- ✅ `clients`
- ✅ `sessions`
- ✅ `reports`
- ✅ `progress_indicators`

#### **4. Test-Benutzer erstellen**

**Option A - Automatisch (Lokal):**
```bash
# Lokale .env.local erstellen mit Supabase Keys
npm install
npm run setup:db
```

**Option B - Manuell (via Supabase Dashboard):**

1. **Admin erstellen:**
   - Auth Users: https://supabase.com/dashboard/project/IHRE_PROJECT_ID/auth/users
   - "Add user" → "Create new user"
   - Email: `admin@example.com`
   - Password: `wlo2025!`
   - ✓ Auto Confirm User
   - Kopieren Sie die User-ID (UUID)

2. **Admin-Profil erstellen:**
   ```sql
   -- SQL Editor:
   INSERT INTO profiles (id, email, role, full_name)
   VALUES (
     'DIE_KOPIERTE_UUID',
     'admin@example.com',
     'admin',
     'Administrator'
   );
   ```

3. **Sozialarbeiter erstellen:**
   - Wiederholen Sie Schritt 1 mit `sozial1@example.com`
   ```sql
   INSERT INTO profiles (id, email, role, full_name)
   VALUES (
     'DIE_KOPIERTE_UUID_2',
     'sozial1@example.com',
     'social_worker',
     'Sozialarbeiter 1'
   );
   ```

---

### ✅ Phase 2: Vercel Deployment einrichten

#### **1. Repository zu GitHub pushen**

```bash
git init
git add .
git commit -m "Initial commit - Social Documentation Service"
git branch -M main
git remote add origin https://github.com/IHR_USERNAME/social-documentation-service.git
git push -u origin main
```

#### **2. Projekt in Vercel importieren**

1. Gehen Sie zu: https://vercel.com/new
2. Klicken Sie auf "Import Git Repository"
3. Wählen Sie Ihr Repository
4. Vercel erkennt automatisch Next.js

**WICHTIG:** Klicken Sie noch **NICHT** auf "Deploy"!

#### **3. Environment Variables setzen**

**Settings → Environment Variables**

Fügen Sie **ALLE** folgenden Variablen hinzu:

```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://stjjipfihjqsvrjnkrfn.supabase.co
Environments: ✓ Production  ✓ Preview  ✓ Development
```

```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: <Ihr Supabase Anon Key>
Environments: ✓ Production  ✓ Preview  ✓ Development
```

```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: <Ihr Supabase Service Role Key>
Environments: ✓ Production  ✓ Preview  ✓ Development

⚠️ WICHTIG: OHNE "NEXT_PUBLIC_" Prefix!
```

```
Name: OPENAI_API_KEY
Value: <Ihr OpenAI API Key>
Environments: ✓ Production  ✓ Preview  ✓ Development
```

#### **4. Deploy starten**

Jetzt klicken Sie auf **"Deploy"**!

Vercel wird:
1. ✅ Dependencies installieren (`npm install`)
2. ✅ App bauen (`npm run build`)
3. ✅ Deployen

**Erwartete Build-Zeit:** 2-3 Minuten

---

### ✅ Phase 3: Deployment verifizieren

#### **1. Deployment-URL öffnen**

Nach erfolgreichem Build zeigt Vercel Ihre URL:
```
https://ihr-projekt.vercel.app
```

#### **2. Login testen**

Öffnen Sie die App und loggen Sie sich ein:
- **Admin:** admin@example.com / wlo2025!
- **Sozialarbeiter:** sozial1@example.com / wlo2025!

#### **3. Funktionalität testen**

1. **Dashboard:** Sollte Statistiken zeigen (anfangs leer)
2. **Klienten:** Legen Sie einen Test-Klienten an
3. **Termine:** Erstellen Sie einen Termin
4. **Berichte:** Generieren Sie einen Test-Bericht
5. **Statistiken:** Prüfen Sie ob Grafiken erscheinen

---

## 🔧 Troubleshooting

### **Problem: "Table 'profiles' does not exist"**

**Ursache:** Schema wurde nicht ausgeführt

**Lösung:**
1. Öffnen Sie Supabase SQL Editor
2. Führen Sie `supabase/schema.sql` aus
3. Warten Sie 1 Minute
4. Testen Sie erneut

### **Problem: "Invalid login credentials"**

**Ursache 1:** Benutzer nicht in Auth angelegt  
**Lösung:** Erstellen Sie User im Supabase Auth Dashboard

**Ursache 2:** Profil fehlt in `profiles` Tabelle  
**Lösung:** Führen Sie INSERT-Statement für Profil aus

**Ursache 3:** Falsches Passwort  
**Lösung:** Prüfen Sie Passwort oder setzen Sie es in Supabase Auth zurück

### **Problem: "Environment variable not defined"**

**Ursache:** Environment Variables nicht in Vercel gesetzt

**Lösung:**
1. Vercel Dashboard → Settings → Environment Variables
2. Alle 4 Variablen hinzufügen
3. "Redeploy" klicken

### **Problem: Build schlägt fehl**

**Ursache:** TypeScript-Fehler oder fehlende Dependencies

**Lösung:**
1. Prüfen Sie Build Logs in Vercel
2. Lokal testen: `npm run build`
3. Fehler beheben und neu pushen

---

## 📊 Datenbank-Struktur Übersicht

Nach erfolgreichem Setup haben Sie:

### **Tabellen:**
```
profiles              → Benutzer (Admin, Sozialarbeiter)
  ├── id (UUID)
  ├── email
  ├── role (admin | social_worker)
  └── full_name

clients               → Klienten/Teilnehmer
  ├── id (UUID)
  ├── name
  ├── profile_data (JSONB)
  └── created_by (FK → profiles)

sessions              → Gesprächstermine
  ├── id (UUID)
  ├── client_id (FK → clients)
  ├── session_date
  ├── current_status
  ├── actions_taken
  ├── next_steps
  └── network_involvement

reports               → Berichte (Anamnese, Zwischen-, Endbericht)
  ├── id (UUID)
  ├── client_id (FK → clients)
  ├── report_type
  ├── title
  └── content

progress_indicators   → Fortschrittsindikatoren
  ├── id (UUID)
  ├── session_id (FK → sessions)
  ├── client_id (FK → clients)
  ├── finances (0-10)
  ├── health (0-10)
  ├── job_applications (0-10)
  ├── family_situation (0-10)
  └── child_welfare (0-10)
```

### **Row Level Security (RLS):**
- ✅ Alle Tabellen haben RLS aktiviert
- ✅ Benutzer sehen nur autorisierte Daten
- ✅ Admins haben volle Rechte
- ✅ Sozialarbeiter sehen alle Klienten

---

## 🎯 Deployment-Workflow (nach Erst-Setup)

```
┌─────────────────────────────────────────┐
│ EINMALIG (nur beim ersten Mal)          │
├─────────────────────────────────────────┤
│ 1. Supabase Schema ausführen            │
│ 2. Test-Benutzer erstellen              │
│ 3. Vercel Environment Variables setzen  │
│ 4. Erstes Deployment                    │
└─────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ WIEDERKEHREND (bei jedem Update)        │
├─────────────────────────────────────────┤
│ 1. Code ändern                          │
│ 2. git push                             │
│ 3. Vercel deployed automatisch          │
│ 4. Datenbank bleibt unverändert ✓       │
└─────────────────────────────────────────┘
```

---

## ✅ Erfolgs-Checkliste

Nach vollständigem Setup sollten alle Punkte ✅ sein:

### **Supabase:**
- [ ] Projekt erstellt
- [ ] Schema ausgeführt (5 Tabellen sichtbar)
- [ ] Admin-User in Auth angelegt
- [ ] Admin-Profil in `profiles` Tabelle
- [ ] Sozialarbeiter-User angelegt
- [ ] Sozialarbeiter-Profil erstellt
- [ ] RLS Policies aktiv
- [ ] Test-Login funktioniert

### **Vercel:**
- [ ] Repository auf GitHub
- [ ] Projekt in Vercel importiert
- [ ] 4 Environment Variables gesetzt
- [ ] Erstes Deployment erfolgreich
- [ ] Keine Build-Fehler
- [ ] App erreichbar unter vercel.app URL

### **Funktionalität:**
- [ ] Login funktioniert
- [ ] Dashboard lädt
- [ ] Klient kann angelegt werden
- [ ] Termin kann erstellt werden
- [ ] KI-Parsing funktioniert (OpenAI)
- [ ] Bericht kann generiert werden
- [ ] Statistiken werden angezeigt

---

## 🔐 Sicherheits-Hinweise

### **Nach dem Deployment:**

1. **Ändern Sie die Test-Passwörter:**
   ```
   Supabase Auth Dashboard → User auswählen → Reset Password
   ```

2. **Erstellen Sie echte Benutzer:**
   - Löschen Sie Test-User wenn nicht mehr benötigt
   - Erstellen Sie echte User mit sicheren Passwörtern

3. **OpenAI Budget setzen:**
   - https://platform.openai.com/account/billing/limits
   - Setzen Sie Monthly Limits

4. **Backup einrichten:**
   - Supabase: Automatische tägliche Backups (Free Tier: 7 Tage)
   - Erwägen Sie manuelles Export für wichtige Daten

---

## 📞 Support & Ressourcen

### **Hilfreich bei Problemen:**

**Supabase:**
- Dashboard: https://supabase.com/dashboard
- Docs: https://supabase.com/docs
- Support: https://supabase.com/support

**Vercel:**
- Dashboard: https://vercel.com/dashboard
- Docs: https://vercel.com/docs
- Support: https://vercel.com/support

**OpenAI:**
- Dashboard: https://platform.openai.com
- Docs: https://platform.openai.com/docs
- API Status: https://status.openai.com

---

## 🎉 Gratulation!

Wenn alle Schritte erfolgreich waren, haben Sie jetzt:

✅ Eine vollständig funktionierende Social Documentation Service App  
✅ Deployed auf Vercel mit automatischen Updates  
✅ Sichere Datenbank mit RLS auf Supabase  
✅ KI-gestützte Features mit OpenAI  
✅ Material Design UI  
✅ Produktionsbereit!  

**Die App ist jetzt live und einsatzbereit!** 🚀

---

## 📋 Schnell-Referenz

### **Wichtige URLs:**

| Service | URL |
|---------|-----|
| Ihre App | `https://ihr-projekt.vercel.app` |
| Supabase Dashboard | `https://supabase.com/dashboard/project/stjjipfihjqsvrjnkrfn` |
| Vercel Dashboard | `https://vercel.com/ihr-username/ihr-projekt` |
| GitHub Repo | `https://github.com/ihr-username/social-documentation-service` |

### **Login-Credentials (Ändern!):**
- Admin: `admin@example.com` / `wlo2025!`
- Sozialarbeiter: `sozial1@example.com` / `wlo2025!`

---

**Status:** ✅ **Deployment-Ready!**
