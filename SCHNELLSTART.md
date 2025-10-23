# Schnellstart - Ihr Setup

## 📝 Ihre Supabase-Verbindung

**URL:** `https://stjjipfihjqsvrjnkrfn.supabase.co`

## 🚀 Setup in 5 Schritten

### Schritt 1: Dependencies installieren

```bash
npm install
```

### Schritt 2: Supabase Keys holen

1. Gehen Sie zu: https://supabase.com/dashboard/project/stjjipfihjqsvrjnkrfn/settings/api
2. Kopieren Sie:
   - **anon public** Key
   - **service_role secret** Key

### Schritt 3: .env.local Datei erstellen

Erstellen Sie eine Datei `.env.local` im Projekt-Root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://stjjipfihjqsvrjnkrfn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=HIER_IHREN_ANON_KEY_EINFÜGEN
SUPABASE_SERVICE_ROLE_KEY=HIER_IHREN_SERVICE_ROLE_KEY_EINFÜGEN

# OpenAI
OPENAI_API_KEY=HIER_IHREN_OPENAI_KEY_EINFÜGEN
```

### Schritt 4: Datenbank-Schema einrichten

1. Gehen Sie zu: https://supabase.com/dashboard/project/stjjipfihjqsvrjnkrfn/editor
2. Klicken Sie auf **"New query"**
3. Kopieren Sie den Inhalt aus `supabase/schema.sql`
4. Fügen Sie ihn ein und klicken Sie auf **"Run"**

### Schritt 5: Test-Benutzer anlegen

#### Via Supabase Dashboard:

1. Gehen Sie zu: https://supabase.com/dashboard/project/stjjipfihjqsvrjnkrfn/auth/users
2. Klicken Sie auf **"Add user"** > **"Create new user"**

**Admin erstellen:**
- Email: `admin@example.com`
- Password: `wlo2025!`
- ✓ Auto Confirm User

3. Notieren Sie die User-ID (UUID)
4. SQL Editor öffnen und ausführen:

```sql
-- Ersetzen Sie 'IHRE_ADMIN_USER_ID' mit der kopierten UUID
INSERT INTO profiles (id, email, role, full_name)
VALUES (
  'IHRE_ADMIN_USER_ID',
  'admin@example.com',
  'admin',
  'Administrator'
);
```

**Sozialarbeiter erstellen:**
- Email: `sozial1@example.com`
- Password: `wlo2025!`
- ✓ Auto Confirm User

```sql
-- Ersetzen Sie 'IHRE_SOZIALARBEITER_USER_ID' mit der kopierten UUID
INSERT INTO profiles (id, email, role, full_name)
VALUES (
  'IHRE_SOZIALARBEITER_USER_ID',
  'sozial1@example.com',
  'social_worker',
  'Sozialarbeiter 1'
);
```

## ▶️ App starten

```bash
npm run dev
```

Die App läuft auf: http://localhost:3000

## 🔐 Login

- **Admin:** admin@example.com / wlo2025!
- **Sozialarbeiter:** sozial1@example.com / wlo2025!

## 📋 Checkliste

- [ ] `npm install` ausgeführt
- [ ] Supabase Keys aus Dashboard kopiert
- [ ] `.env.local` Datei erstellt
- [ ] Datenbank-Schema (`schema.sql`) ausgeführt
- [ ] Admin-Benutzer in Supabase Auth angelegt
- [ ] Admin-Profil in `profiles` Tabelle eingefügt
- [ ] Sozialarbeiter-Benutzer angelegt
- [ ] Sozialarbeiter-Profil eingefügt
- [ ] `npm run dev` ausgeführt
- [ ] Login getestet

## 🔗 Wichtige Links

| Bereich | URL |
|---------|-----|
| **Dashboard** | https://supabase.com/dashboard/project/stjjipfihjqsvrjnkrfn |
| **API Keys** | https://supabase.com/dashboard/project/stjjipfihjqsvrjnkrfn/settings/api |
| **SQL Editor** | https://supabase.com/dashboard/project/stjjipfihjqsvrjnkrfn/editor |
| **Auth Benutzer** | https://supabase.com/dashboard/project/stjjipfihjqsvrjnkrfn/auth/users |
| **Tabellen** | https://supabase.com/dashboard/project/stjjipfihjqsvrjnkrfn/editor |

## ❓ Probleme?

### TypeScript-Fehler nach npm install?

Das ist normal während der Installation. Nach Abschluss sollten sie verschwinden.

### "Profile nicht gefunden" beim Login?

Sie müssen das Profil manuell in die `profiles` Tabelle einfügen (siehe Schritt 5).

### Keine Verbindung zu Supabase?

Überprüfen Sie:
1. Ist die URL korrekt: `https://stjjipfihjqsvrjnkrfn.supabase.co`
2. Sind die Keys korrekt kopiert (ohne Leerzeichen)?
3. Läuft Ihr Supabase Projekt?

## 🎯 Nächste Schritte

Nach erfolgreichem Setup:

1. **Klienten anlegen** (`/dashboard/clients`)
2. **Termine protokollieren** (Klient auswählen > "Neuer Termin")
3. **Berichte generieren** (KI-gestützt)
4. **Statistiken ansehen** (`/dashboard/statistics`)

---

**Bei Fragen:** Siehe `README.md` für detaillierte Dokumentation
