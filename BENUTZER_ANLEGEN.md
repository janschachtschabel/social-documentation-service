# Test-Benutzer in Supabase anlegen

## Schritt-für-Schritt Anleitung

### 1. Supabase Dashboard öffnen

Gehen Sie zu: https://supabase.com/dashboard/project/stjjipfihjqsvrjnkrfn/auth/users

### 2. Admin-Benutzer erstellen

#### A) User in Authentication anlegen:

1. Klicken Sie auf **"Add user"** → **"Create new user"**
2. Geben Sie ein:
   - **Email:** `admin@example.com`
   - **Password:** `wlo2025!`
   - ✓ **Auto Confirm User** (wichtig!)
3. Klicken Sie auf **"Create user"**
4. **Kopieren Sie die User-ID** (UUID) - Sie brauchen sie gleich!

#### B) Profil in Datenbank eintragen:

1. Gehen Sie zum SQL Editor: https://supabase.com/dashboard/project/stjjipfihjqsvrjnkrfn/sql/new
2. Führen Sie diesen SQL-Befehl aus (ersetzen Sie `IHRE_USER_ID`):

```sql
-- Admin-Profil erstellen
-- Ersetzen Sie 'IHRE_USER_ID' mit der kopierten UUID aus Schritt A)
INSERT INTO profiles (id, email, role, full_name)
VALUES (
  'IHRE_USER_ID',  -- ← Hier die UUID einfügen!
  'admin@example.com',
  'admin',
  'Administrator'
);
```

### 3. Sozialarbeiter-Benutzer erstellen

#### A) User in Authentication anlegen:

1. Klicken Sie wieder auf **"Add user"** → **"Create new user"**
2. Geben Sie ein:
   - **Email:** `sozial1@example.com`
   - **Password:** `wlo2025!`
   - ✓ **Auto Confirm User** (wichtig!)
3. Klicken Sie auf **"Create user"**
4. **Kopieren Sie die User-ID** (UUID)

#### B) Profil in Datenbank eintragen:

```sql
-- Sozialarbeiter-Profil erstellen
-- Ersetzen Sie 'IHRE_USER_ID' mit der kopierten UUID
INSERT INTO profiles (id, email, role, full_name)
VALUES (
  'IHRE_USER_ID',  -- ← Hier die UUID einfügen!
  'sozial1@example.com',
  'social_worker',
  'Sozialarbeiter 1'
);
```

## Schnellversion (Beide auf einmal)

Falls Sie schneller gehen möchten:

### 1. Beide User in Auth anlegen:
- `admin@example.com` / `wlo2025!`
- `sozial1@example.com` / `wlo2025!`

### 2. User-IDs kopieren und dieses SQL ausführen:

```sql
-- Admin
INSERT INTO profiles (id, email, role, full_name)
VALUES (
  '00000000-0000-0000-0000-000000000001',  -- ← Admin UUID hier einfügen
  'admin@example.com',
  'admin',
  'Administrator'
);

-- Sozialarbeiter
INSERT INTO profiles (id, email, role, full_name)
VALUES (
  '00000000-0000-0000-0000-000000000002',  -- ← Sozialarbeiter UUID hier einfügen
  'sozial1@example.com',
  'social_worker',
  'Sozialarbeiter 1'
);
```

## Environment Variables korrigieren

Erstellen/bearbeiten Sie `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://stjjipfihjqsvrjnkrfn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0amppcGZpaGpxc3Zyam5rcmZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMDg3NzQsImV4cCI6MjA3Njc4NDc3NH0.I5xgzxTmqXPHPVztbqgdSMGQP1_GHYKAEd4GZH6YHbs

# ⚠️ WICHTIG: OHNE "NEXT_PUBLIC_" Prefix!
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0amppcGZpaGpxc3Zyam5rcmZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTIwODc3NCwiZXhwIjoyMDc2Nzg0Nzc0fQ.nepK773YJo6I7V1Oi6KfzzWXK7bhWF8Qdc6PzpP3m2c

# OpenAI
OPENAI_API_KEY=sk-proj-...  # Ihr OpenAI Key
```

## Prüfen ob es funktioniert

### 1. Profiles prüfen:

```sql
SELECT * FROM profiles;
```

Sie sollten 2 Zeilen sehen (admin und social_worker).

### 2. App neu starten:

```bash
npm run dev
```

### 3. Login testen:

- **Admin:** admin@example.com / wlo2025!
- **Sozialarbeiter:** sozial1@example.com / wlo2025!

## Troubleshooting

### "Invalid login credentials"

**Ursachen:**
1. ❌ Benutzer nicht in Auth angelegt
2. ❌ Profil nicht in `profiles` Tabelle
3. ❌ Falsches Passwort
4. ❌ "Auto Confirm User" nicht aktiviert

**Lösung:**
- Prüfen Sie in Supabase Auth ob die Benutzer existieren
- Prüfen Sie ob Status = "Confirmed" ist
- Führen Sie das SQL aus um Profile zu erstellen

### "Profil nicht gefunden"

**Ursache:**
❌ User in Auth existiert, aber NICHT in `profiles` Tabelle

**Lösung:**
Führen Sie das INSERT-Statement für `profiles` aus

### Environment Variable Fehler

**Ursache:**
❌ `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` statt `SUPABASE_SERVICE_ROLE_KEY`

**Lösung:**
Entfernen Sie `NEXT_PUBLIC_` Prefix!

## Wichtige Links

- **Supabase Auth Users:** https://supabase.com/dashboard/project/stjjipfihjqsvrjnkrfn/auth/users
- **SQL Editor:** https://supabase.com/dashboard/project/stjjipfihjqsvrjnkrfn/sql/new
- **Table Editor (profiles):** https://supabase.com/dashboard/project/stjjipfihjqsvrjnkrfn/editor

---

**Nach Durchführung sollten beide Logins funktionieren!** ✅
