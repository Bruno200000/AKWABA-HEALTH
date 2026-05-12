-- À exécuter sur une base déjà créée avec une ancienne version de schema.sql
-- (après sauvegarde). Ignorez les erreurs « already exists » si besoin.

CREATE OR REPLACE FUNCTION public.current_hospital_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT hospital_id FROM profiles WHERE id = auth.uid()
$$;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

ALTER TABLE patients ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'STABLE';

ALTER TABLE invoices ALTER COLUMN patient_id DROP NOT NULL;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE lab_tests ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE lab_tests ADD COLUMN IF NOT EXISTS observations TEXT;
ALTER TABLE lab_tests ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Colonne dérivée pour compatibilité avec les requêtes frontend (appointment_date)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'appointments'
      AND column_name = 'appointment_date'
  ) THEN
    ALTER TABLE appointments
      ADD COLUMN appointment_date TIMESTAMPTZ
      GENERATED ALWAYS AS (start_time) STORED;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact_name TEXT,
  phone TEXT,
  email TEXT,
  category TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_suppliers_hospital ON suppliers(hospital_id);

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_suppliers ON suppliers;
CREATE POLICY tenant_suppliers ON suppliers FOR ALL TO authenticated
  USING (hospital_id = public.current_hospital_id())
  WITH CHECK (hospital_id = public.current_hospital_id());

-- Policies profiles : remplacer si l’ancienne policy existe
DROP POLICY IF EXISTS profiles_select_same_hospital ON profiles;
DROP POLICY IF EXISTS profiles_select_own_or_team ON profiles;
CREATE POLICY profiles_select_own_or_team ON profiles
  FOR SELECT TO authenticated
  USING (
    id = auth.uid()
    OR (
      hospital_id IS NOT NULL
      AND hospital_id = public.current_hospital_id()
    )
  );
