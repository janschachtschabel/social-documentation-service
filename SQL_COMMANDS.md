# SQL-Befehle für Supabase

## 🎯 Für Ihr laufendes System (NICHTS ändern!)

**Status:** ✅ Läuft bereits, keine Änderungen nötig!

Die bestehende Datenbank unterstützt bereits alle neuen Features:
- ✅ JSONB `profile_data` ist flexibel genug
- ✅ Basisprofil (15 Felder) funktioniert
- ✅ Anamnese (14 Bereiche) funktioniert
- ✅ Keine Schema-Änderung erforderlich

**Wenn Sie wollen:** Nur zur Dokumentation RLS-Fix ausführen (aber das läuft schon):

```sql
-- Nur zur Sicherheit (ist bereits so):
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
```

---

## 🆕 Für NEUES Deployment (Leere Datenbank)

Falls Sie die App komplett neu deployen oder jemand anderem geben:

### **Kopieren Sie das komplette Schema und führen Sie es aus:**

```sql
-- ============================================
-- SOCIAL DOCUMENTATION SERVICE - SCHEMA
-- Vollständige Datenbank-Einrichtung
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'social_worker')),
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clients table
-- profile_data JSONB struktur:
-- {
--   // Basisprofil (15 Felder)
--   firstName, lastName, email, phone,
--   street, zipCode, city,
--   dateOfBirth, age, gender,
--   maritalStatus, children, nationality, germanLevel, residenceStatus,
--   occupation, employmentStatus,
--   
--   // Anamnese (14 Bereiche für Sozialpädagogik/Erziehungshilfe)
--   anamnesis: {
--     housingSituation, financialSituation, healthStatus, professionalSituation,
--     familySituation, childrenSituation, parentingSkills, childDevelopment,
--     psychologicalState, socialNetwork, crisesAndRisks,
--     goalsAndWishes, previousMeasures, additionalNotes, rawTranscript
--   }
-- }
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  profile_data JSONB DEFAULT '{}',
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions table (conversation/meeting protocols)
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  session_date TIMESTAMPTZ NOT NULL,
  current_status TEXT,
  actions_taken TEXT,
  next_steps TEXT,
  network_involvement TEXT,
  raw_transcript TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL CHECK (report_type IN ('anamnese', 'interim', 'final')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Progress Indicators table
CREATE TABLE IF NOT EXISTS progress_indicators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  indicator_type TEXT NOT NULL CHECK (indicator_type IN ('finances', 'health', 'job_applications', 'family_situation', 'child_welfare', 'other')),
  value NUMERIC NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clients_created_by ON clients(created_by);
CREATE INDEX IF NOT EXISTS idx_sessions_client_id ON sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created_by ON sessions(created_by);
CREATE INDEX IF NOT EXISTS idx_reports_client_id ON reports(client_id);
CREATE INDEX IF NOT EXISTS idx_progress_indicators_client_id ON progress_indicators(client_id);
CREATE INDEX IF NOT EXISTS idx_progress_indicators_session_id ON progress_indicators(session_id);

-- Enable Row Level Security
-- WICHTIG: profiles RLS deaktiviert für Login-Funktionalität
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_indicators ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles (werden nicht verwendet wegen DISABLE, aber zur Dokumentation)
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for clients
CREATE POLICY "Social workers can view all clients" ON clients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Social workers can create clients" ON clients
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Social workers can update clients" ON clients
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete clients" ON clients
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for sessions
CREATE POLICY "Social workers can view all sessions" ON sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Social workers can create sessions" ON sessions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Social workers can update sessions" ON sessions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete sessions" ON sessions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for reports
CREATE POLICY "Social workers can view all reports" ON reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Social workers can create reports" ON reports
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Social workers can update reports" ON reports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete reports" ON reports
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for progress_indicators
CREATE POLICY "Social workers can view all progress indicators" ON progress_indicators
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Social workers can create progress indicators" ON progress_indicators
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**Nach dem Schema:** Test-Benutzer erstellen (siehe unten)

---

## 👥 Test-Benutzer erstellen

### **Schritt 1: Auth-Users im Supabase Dashboard**

1. **Gehen Sie zu:** https://supabase.com/dashboard/project/IHRE_PROJECT_ID/auth/users
2. **Klicken Sie "Add user" → "Create new user"**

**Admin:**
```
Email: admin@example.com
Password: wlo2025!
✓ Auto Confirm User
```

**Kopieren Sie die UUID!** (z.B. `948aa437-4485-45e1-8ca7-7c06e29637cf`)

**Sozialarbeiter:**
```
Email: sozial1@example.com
Password: wlo2025!
✓ Auto Confirm User
```

**Kopieren Sie die UUID!**

### **Schritt 2: Profile in Datenbank (SQL Editor)**

```sql
-- Admin-Profil (UUID anpassen!)
INSERT INTO profiles (id, email, role, full_name)
VALUES (
  'IHRE_ADMIN_UUID_HIER',  -- ← UUID aus Schritt 1
  'admin@example.com',
  'admin',
  'Administrator'
);

-- Sozialarbeiter-Profil (UUID anpassen!)
INSERT INTO profiles (id, email, role, full_name)
VALUES (
  'IHRE_SOZIALARBEITER_UUID_HIER',  -- ← UUID aus Schritt 1
  'sozial1@example.com',
  'social_worker',
  'Sozialarbeiter 1'
);
```

---

## ✅ Verifizierung

Nach dem Setup:

```sql
-- Prüfen ob Tabellen existieren:
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Sollte zeigen:
-- profiles
-- clients
-- sessions
-- reports
-- progress_indicators

-- Prüfen ob Benutzer existieren:
SELECT * FROM profiles;

-- Sollte 2 Zeilen zeigen (admin + sozial1)
```

---

## 📊 Datenstruktur-Beispiel

**Klient mit vollem Profil + Anamnese:**

```sql
-- Beispiel INSERT für Test-Klient:
INSERT INTO clients (name, profile_data, created_by)
VALUES (
  'Max Mustermann',
  '{
    "firstName": "Max",
    "lastName": "Mustermann",
    "email": "max@example.com",
    "phone": "030-12345678",
    "street": "Musterstraße 12",
    "zipCode": "10115",
    "city": "Berlin",
    "dateOfBirth": "1990-05-15",
    "age": "35",
    "gender": "male",
    "maritalStatus": "verheiratet",
    "children": "2",
    "nationality": "deutsch",
    "germanLevel": "Muttersprache",
    "residenceStatus": "unbefristet",
    "occupation": "Bäcker",
    "employmentStatus": "arbeitslos",
    "anamnesis": {
      "housingSituation": "Die Familie lebt in einer 3-Zimmer-Wohnung in einem Hochhaus...",
      "financialSituation": "Die finanzielle Situation ist angespannt durch Schulden...",
      "healthStatus": "Körperlich gesund, psychisch belastet durch Arbeitslosigkeit...",
      "professionalSituation": "Ausgebildeter Bäcker, seit 6 Monaten arbeitslos...",
      "familySituation": "Verheiratet, gute Beziehung zur Ehefrau...",
      "childrenSituation": "Zwei Kinder, 5 und 8 Jahre alt, besuchen Kita und Grundschule...",
      "parentingSkills": "Beide Eltern zeigen sich bemüht, teilweise überfordert...",
      "childDevelopment": "Das ältere Kind zeigt leichte Entwicklungsverzögerungen...",
      "psychologicalState": "Herr Mustermann zeigt Anzeichen von Depression...",
      "socialNetwork": "Soziales Netzwerk ist klein, wenig Kontakte außer Familie...",
      "crisesAndRisks": "Keine akuten Krisen, Risiko der finanziellen Überschuldung...",
      "goalsAndWishes": "Wünscht sich baldige Wiedereingliederung in den Arbeitsmarkt...",
      "previousMeasures": "Teilnahme an Bewerbungstraining im letzten Jahr...",
      "additionalNotes": "Kooperativ und motiviert.",
      "rawTranscript": "Original-Aufnahme der Anamnese..."
    }
  }',
  'ADMIN_UUID'
);
```

---

## 🚀 Zusammenfassung

| Aktion | SQL-Befehl | Wann? |
|--------|-----------|-------|
| **Ihr laufendes System** | Nichts | ✅ Läuft bereits |
| **Neues Deployment** | Komplettes Schema (oben) | Neue Datenbank |
| **Test-User** | INSERT Statements | Nach Schema |
| **Verifizierung** | SELECT Statements | Nach Setup |

---

**Das Schema ist jetzt auf dem neuesten Stand und bereit für alle Features!** 🎉
