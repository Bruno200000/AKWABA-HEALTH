-- SQL Schema for AKWABA HEALTH (Multi-tenant Hospital Management System)
-- Optimized for Supabase (PostgreSQL)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TENANTS (Hospitals / Clinics)
CREATE TABLE hospitals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    domain TEXT UNIQUE,
    logo_url TEXT,
    primary_color TEXT DEFAULT '#2563eb',
    address TEXT,
    phone TEXT,
    email TEXT UNIQUE,
    subscription_plan TEXT DEFAULT 'free', -- free, pro, enterprise
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USERS & ROLES
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

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    role user_role DEFAULT 'PATIENT',
    first_name TEXT,
    last_name TEXT,
    specialization TEXT, -- For doctors
    license_number TEXT,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PATIENTS
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    file_number TEXT UNIQUE NOT NULL, -- Automatic unique number
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    birth_date DATE,
    gender TEXT,
    blood_group TEXT,
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

-- 4. APPOINTMENTS
CREATE TYPE appointment_status AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'IN_PROGRESS');

CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status appointment_status DEFAULT 'PENDING',
    reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CONSULTATIONS
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
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PRESCRIPTIONS & PHARMACY
CREATE TABLE medicines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    brand TEXT,
    category TEXT,
    stock_quantity INTEGER DEFAULT 0,
    unit_price DECIMAL(12,2),
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
    status TEXT DEFAULT 'PENDING', -- PENDING, DISPENSED
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

-- 7. LABORATORY
CREATE TABLE lab_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    technician_id UUID REFERENCES profiles(id),
    test_type TEXT NOT NULL,
    status TEXT DEFAULT 'ORDERED', -- ORDERED, IN_PROGRESS, COMPLETED
    results_data JSONB,
    report_url TEXT, -- PDF Link
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. HOSPITALIZATION
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    room_number TEXT NOT NULL,
    department TEXT,
    type TEXT, -- General, ICU, Private
    total_beds INTEGER DEFAULT 1,
    occupied_beds INTEGER DEFAULT 0,
    price_per_day DECIMAL(12,2)
);

CREATE TABLE admissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    room_id UUID REFERENCES rooms(id),
    admission_date TIMESTAMPTZ DEFAULT NOW(),
    discharge_date TIMESTAMPTZ,
    reason TEXT,
    status TEXT DEFAULT 'ADMITTED', -- ADMITTED, DISCHARGED
    notes TEXT
);

-- 9. FINANCE
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    total_amount DECIMAL(12,2) NOT NULL,
    paid_amount DECIMAL(12,2) DEFAULT 0,
    status TEXT DEFAULT 'UNPAID', -- UNPAID, PARTIAL, PAID
    due_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    method TEXT, -- WAVE, ORANGE_MONEY, CASH, CARD
    transaction_ref TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. ROW LEVEL SECURITY (RLS) - Basic Example
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see data from their own hospital
CREATE POLICY hospital_isolation_policy ON patients
    FOR ALL USING (hospital_id = (SELECT hospital_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY hospital_isolation_policy ON appointments
    FOR ALL USING (hospital_id = (SELECT hospital_id FROM profiles WHERE id = auth.uid()));

-- Repeat for all tables...
