# Schnellstart-Anleitung

## Schritt-für-Schritt Setup

### 1. Dependencies installieren

```bash
npm install
```

### 2. Supabase Projekt erstellen

1. Gehen Sie zu https://supabase.com
2. Erstellen Sie ein neues Projekt
3. Warten Sie, bis das Projekt bereit ist

### 3. Datenbank-Schema einrichten

1. Öffnen Sie im Supabase Dashboard: **SQL Editor**
2. Kopieren Sie den gesamten Inhalt aus `supabase/schema.sql`
3. Fügen Sie ihn in den SQL Editor ein
4. Klicken Sie auf **Run**

### 4. Erste Benutzer manuell erstellen

Da die App für die Benutzererstellung einen Admin benötigt, müssen wir die ersten Benutzer manuell anlegen:

#### Via Supabase Dashboard:

1. Gehen Sie zu **Authentication** > **Users**
2. Klicken Sie auf **Add user** > **Create new user**

**Admin Benutzer:**
- Email: `admin@example.com`
- Password: `wlo2025!`
- Auto Confirm User: ✓ (aktivieren)

3. Notieren Sie sich die **User ID** (UUID) des erstellten Admin-Benutzers

4. Gehen Sie zum **SQL Editor** und führen Sie aus:

```sql
-- Ersetzen Sie 'ADMIN_USER_ID' mit der tatsächlichen UUID
INSERT INTO profiles (id, email, role, full_name)
VALUES (
  'ADMIN_USER_ID',
  'admin@example.com',
  'admin',
  'Administrator'
);
```

5. Wiederholen Sie für den Sozialarbeiter:

**Sozialarbeiter:**
- Email: `sozial1@example.com`
- Password: `wlo2025!`
- Auto Confirm User: ✓

```sql
-- Ersetzen Sie 'SOCIAL_WORKER_USER_ID' mit der tatsächlichen UUID
INSERT INTO profiles (id, email, role, full_name)
VALUES (
  'SOCIAL_WORKER_USER_ID',
  'sozial1@example.com',
  'social_worker',
  'Sozialarbeiter 1'
);
```

### 5. Supabase Credentials holen

1. Gehen Sie zu **Project Settings** > **API**
2. Kopieren Sie:
   - **Project URL**
   - **anon public** Key
   - **service_role** Key (unter "Project API keys")

### 6. OpenAI API Key holen

1. Gehen Sie zu https://platform.openai.com
2. Erstellen Sie einen API Key
3. Stellen Sie sicher, dass Ihr Account Zugriff auf GPT-4 hat

### 7. .env.local Datei erstellen

Erstellen Sie eine Datei `.env.local` im Projekt-Root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://ihr-projekt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ihr-anon-key
SUPABASE_SERVICE_ROLE_KEY=ihr-service-role-key

# OpenAI
OPENAI_API_KEY=sk-ihre-openai-key
```

### 8. App starten

```bash
npm run dev
```

Die App läuft nun auf: http://localhost:3000

### 9. Testen

1. Öffnen Sie http://localhost:3000
2. Sie werden zur Login-Seite weitergeleitet
3. Melden Sie sich an:
   - Email: `admin@example.com`
   - Passwort: `wlo2025!`

## Checkliste

- [ ] `npm install` ausgeführt
- [ ] Supabase Projekt erstellt
- [ ] Datenbank-Schema (`supabase/schema.sql`) ausgeführt
- [ ] Admin-Benutzer in Supabase Auth erstellt
- [ ] Admin-Profil in `profiles` Tabelle eingefügt
- [ ] Sozialarbeiter-Benutzer in Supabase Auth erstellt
- [ ] Sozialarbeiter-Profil in `profiles` Tabelle eingefügt
- [ ] `.env.local` Datei mit allen Keys erstellt
- [ ] `npm run dev` ausgeführt
- [ ] Login getestet

## Troubleshooting

### "Profile nicht gefunden" beim Login

**Problem:** Der Benutzer existiert in Supabase Auth, aber nicht in der `profiles` Tabelle.

**Lösung:**
```sql
-- Fügen Sie das fehlende Profil ein
INSERT INTO profiles (id, email, role, full_name)
VALUES (
  'USER_ID_AUS_AUTH',
  'email@example.com',
  'admin', -- oder 'social_worker'
  'Name'
);
```

### "Invalid API Key" bei OpenAI

**Problem:** Der OpenAI API Key ist ungültig oder hat kein Guthaben.

**Lösung:**
1. Überprüfen Sie den Key auf https://platform.openai.com
2. Stellen Sie sicher, dass Billing eingerichtet ist
3. Überprüfen Sie, dass Sie Zugriff auf GPT-4 haben

### RLS Policy Fehler

**Problem:** "new row violates row-level security policy"

**Lösung:**
1. Überprüfen Sie, dass alle RLS Policies aus `schema.sql` ausgeführt wurden
2. Stellen Sie sicher, dass der Benutzer in der `profiles` Tabelle existiert

### Port bereits in Verwendung

**Problem:** "Port 3000 is already in use"

**Lösung:**
```bash
# Starten Sie auf einem anderen Port
npm run dev -- -p 3001
```

## Nächste Schritte

Nach dem erfolgreichen Setup können Sie:

1. **Weitere Benutzer anlegen**: Als Admin über "Benutzer verwalten"
2. **Klienten erstellen**: Über "Klienten" > "Neuer Klient"
3. **Termine protokollieren**: Klient auswählen > "Neuer Termin"
4. **Berichte generieren**: KI-gestützte Berichte erstellen
5. **Statistiken ansehen**: Fortschrittsindikatoren visualisieren

## Production Deployment

Für Production auf Vercel:

1. Pushen Sie den Code zu GitHub
2. Verbinden Sie das Repository mit Vercel
3. Setzen Sie die Environment Variables in Vercel
4. Deploy!

Details im Haupt-README.md
