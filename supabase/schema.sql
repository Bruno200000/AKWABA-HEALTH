-- =============================================================================
-- AKWABA HEALTH — Schéma Supabase / PostgreSQL (installation complète)
-- Exécuter dans le SQL Editor Supabase sur un projet vide, ou après reset.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------
CREATE TYPE user_role AS ENUM (
  'SUPER_ADMIN',
  'ADMIN',
  'DOCTOR',
  'NURSE',
  'RECEPTIONIST',
  'PHARMACIST',
  'LAB_TECHNICIAN',
  'CASHIER',
  'PATIENT'
);

CREATE TYPE appointment_status AS ENUM (
  'PENDING',
  'CONFIRMED',
  'CANCELLED',
  'COMPLETED',
  'IN_PROGRESS'
);

-- ---------------------------------------------------------------------------
-- Hospitals & profiles
-- ---------------------------------------------------------------------------
CREATE TABLE hospitals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  domain TEXT UNIQUE,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#2563eb',
  address TEXT,
  phone TEXT,
  email TEXT UNIQUE,
  subscription_plan TEXT DEFAULT 'free',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  role user_role DEFAULT 'PATIENT',
  first_name TEXT,
  last_name TEXT,
  specialization TEXT,
  license_number TEXT,
  phone TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_hospital ON profiles(hospital_id);

-- ---------------------------------------------------------------------------
-- Patients
-- ---------------------------------------------------------------------------
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  file_number TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  birth_date DATE,
  gender TEXT,
  blood_group TEXT,
  status TEXT DEFAULT 'STABLE',
  allergies TEXT[],
  medical_history JSONB DEFAULT '{}',
  phone TEXT,
  email TEXT,
  address TEXT,
  insurance_provider TEXT,
  insurance_number TEXT,
  qr_code_data TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_patients_hospital ON patients(hospital_id);

-- ---------------------------------------------------------------------------
-- Appointments (start_time / end_time + colonne dérivée pour le frontend)
-- ---------------------------------------------------------------------------
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  appointment_date TIMESTAMPTZ GENERATED ALWAYS AS (start_time) STORED,
  status appointment_status DEFAULT 'PENDING',
  reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_appointments_hospital ON appointments(hospital_id);
CREATE INDEX idx_appointments_start ON appointments(start_time);

-- ---------------------------------------------------------------------------
-- Consultations & prescriptions
-- ---------------------------------------------------------------------------
CREATE TABLE consultations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  symptoms TEXT,
  diagnosis TEXT,
  vital_signs JSONB DEFAULT '{"weight": 0, "height": 0, "temp": 0, "bp_systolic": 0, "bp_diastolic": 0}',
  notes_private TEXT,
  type TEXT DEFAULT 'Standard',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_consultations_hospital ON consultations(hospital_id);

CREATE TABLE medicines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  brand TEXT,
  category TEXT,
  stock_quantity INTEGER DEFAULT 0,
  unit_price DECIMAL(12, 2),
  expiry_date DATE,
  barcode TEXT,
  min_stock_alert INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  notes TEXT,
  status TEXT DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE prescription_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prescription_id UUID REFERENCES prescriptions(id) ON DELETE CASCADE,
  medicine_id UUID REFERENCES medicines(id),
  dosage TEXT,
  duration TEXT,
  quantity INTEGER,
  instructions TEXT
);

-- ---------------------------------------------------------------------------
-- Laboratory
-- ---------------------------------------------------------------------------
CREATE TABLE lab_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  technician_id UUID REFERENCES profiles(id),
  test_type TEXT NOT NULL,
  status TEXT DEFAULT 'ORDERED',
  notes TEXT,
  results_data JSONB,
  observations TEXT,
  completed_at TIMESTAMPTZ,
  report_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lab_tests_hospital ON lab_tests(hospital_id);

-- ---------------------------------------------------------------------------
-- Hospitalization
-- ---------------------------------------------------------------------------
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  room_number TEXT NOT NULL,
  department TEXT,
  type TEXT,
  total_beds INTEGER DEFAULT 1,
  occupied_beds INTEGER DEFAULT 0,
  price_per_day DECIMAL(12, 2),
  UNIQUE (hospital_id, room_number)
);

CREATE TABLE admissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  room_id UUID REFERENCES rooms(id),
  admission_date TIMESTAMPTZ DEFAULT NOW(),
  discharge_date TIMESTAMPTZ,
  reason TEXT,
  status TEXT DEFAULT 'ADMITTED',
  notes TEXT
);

-- ---------------------------------------------------------------------------
-- Finance
-- ---------------------------------------------------------------------------
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  total_amount DECIMAL(12, 2) NOT NULL,
  paid_amount DECIMAL(12, 2) DEFAULT 0,
  status TEXT DEFAULT 'UNPAID',
  due_date DATE,
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  method TEXT,
  transaction_ref TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Pharmacy suppliers
-- ---------------------------------------------------------------------------
CREATE TABLE suppliers (
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

CREATE INDEX idx_suppliers_hospital ON suppliers(hospital_id);

-- =============================================================================
-- Row Level Security
-- =============================================================================
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

-- Helper : hospital courant
CREATE OR REPLACE FUNCTION public.current_hospital_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT hospital_id FROM profiles WHERE id = auth.uid()
$$;

-- Hospitals : lecture / mise à jour pour membres du même établissement
CREATE POLICY hospitals_select_member ON hospitals
  FOR SELECT TO authenticated
  USING (id = public.current_hospital_id());

CREATE POLICY hospitals_insert_any ON hospitals
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY hospitals_update_admin ON hospitals
  FOR UPDATE TO authenticated
  USING (
    id = public.current_hospital_id()
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.hospital_id = hospitals.id
      AND p.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- Profiles
CREATE POLICY profiles_select_own_or_team ON profiles
  FOR SELECT TO authenticated
  USING (
    id = auth.uid()
    OR (
      hospital_id IS NOT NULL
      AND hospital_id = public.current_hospital_id()
    )
  );

CREATE POLICY profiles_insert_self ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY profiles_update_self ON profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid());

-- Tenant tables : même pattern
CREATE POLICY tenant_patients ON patients FOR ALL TO authenticated
  USING (hospital_id = public.current_hospital_id())
  WITH CHECK (hospital_id = public.current_hospital_id());

CREATE POLICY tenant_appointments ON appointments FOR ALL TO authenticated
  USING (hospital_id = public.current_hospital_id())
  WITH CHECK (hospital_id = public.current_hospital_id());

CREATE POLICY tenant_consultations ON consultations FOR ALL TO authenticated
  USING (hospital_id = public.current_hospital_id())
  WITH CHECK (hospital_id = public.current_hospital_id());

CREATE POLICY tenant_medicines ON medicines FOR ALL TO authenticated
  USING (hospital_id = public.current_hospital_id())
  WITH CHECK (hospital_id = public.current_hospital_id());

CREATE POLICY tenant_prescriptions ON prescriptions FOR ALL TO authenticated
  USING (hospital_id = public.current_hospital_id())
  WITH CHECK (hospital_id = public.current_hospital_id());

CREATE POLICY tenant_prescription_items ON prescription_items FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM prescriptions pr
      WHERE pr.id = prescription_items.prescription_id
      AND pr.hospital_id = public.current_hospital_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM prescriptions pr
      WHERE pr.id = prescription_items.prescription_id
      AND pr.hospital_id = public.current_hospital_id()
    )
  );

CREATE POLICY tenant_lab_tests ON lab_tests FOR ALL TO authenticated
  USING (hospital_id = public.current_hospital_id())
  WITH CHECK (hospital_id = public.current_hospital_id());

CREATE POLICY tenant_rooms ON rooms FOR ALL TO authenticated
  USING (hospital_id = public.current_hospital_id())
  WITH CHECK (hospital_id = public.current_hospital_id());

CREATE POLICY tenant_admissions ON admissions FOR ALL TO authenticated
  USING (hospital_id = public.current_hospital_id())
  WITH CHECK (hospital_id = public.current_hospital_id());

CREATE POLICY tenant_invoices ON invoices FOR ALL TO authenticated
  USING (hospital_id = public.current_hospital_id())
  WITH CHECK (hospital_id = public.current_hospital_id());

CREATE POLICY tenant_payments ON payments FOR ALL TO authenticated
  USING (hospital_id = public.current_hospital_id())
  WITH CHECK (hospital_id = public.current_hospital_id());

CREATE POLICY tenant_suppliers ON suppliers FOR ALL TO authenticated
  USING (hospital_id = public.current_hospital_id())
  WITH CHECK (hospital_id = public.current_hospital_id());
