-- ============================================
-- WICHTIG: In Supabase SQL Editor ausführen!
-- ============================================
-- Ermöglicht allen Sozialarbeitern das Löschen von Daten
-- (nicht nur Admins)
-- ============================================

-- 1. Lösche alte Admin-only Policies
DROP POLICY IF EXISTS "Admins can delete clients" ON clients;
DROP POLICY IF EXISTS "Admins can delete sessions" ON sessions;
DROP POLICY IF EXISTS "Admins can delete reports" ON reports;

-- 2. Erstelle neue Policies für ALLE Sozialarbeiter
CREATE POLICY "Social workers can delete clients" ON clients
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      -- KEIN "AND role = 'admin'" mehr!
    )
  );

CREATE POLICY "Social workers can delete sessions" ON sessions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Social workers can delete reports" ON reports
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
    )
  );

-- 3. Bonus: Füge fehlende UPDATE/DELETE Policies für progress_indicators hinzu
CREATE POLICY "Social workers can update progress indicators" ON progress_indicators
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Social workers can delete progress indicators" ON progress_indicators
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
    )
  );
