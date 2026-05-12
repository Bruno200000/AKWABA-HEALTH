const DEMO_KEY = "akwaba_demo_session";

export type DemoHospital = { name: string };

/** Profil utilisé quand aucune connexion Supabase n’est disponible */
export const DEMO_PROFILE = {
  id: "demo-user",
  first_name: "Démo",
  last_name: "Clinique",
  role: "ADMIN",
  email: "demo@akwaba.health",
  hospital_id: "demo-hospital-id",
  hospitals: { name: "Clinique Akwaba (démo)" } as DemoHospital,
};

/** Données factices pour remplir le tableau de bord en mode démo */
export const DEMO_DASHBOARD = {
  patients: 428,
  consultations: 186,
  appointments: 94,
  revenue: 12_450_000,
  roomOccupancy: 72,
  activityData: [12, 18, 22, 19, 25, 30, 28, 24, 32, 27, 21, 15],
  staffPerformance: [
    { name: "K. Yao", role: "DOCTOR", score: 92, color: "bg-blue-600" },
    { name: "M. Kouassi", role: "DOCTOR", score: 78, color: "bg-blue-500" },
    { name: "A. Diabaté", role: "NURSE", score: 64, color: "bg-blue-400" },
  ],
  /** Liste courte pour les écrans patients */
  mockPatients: [
    {
      id: "demo-p1",
      first_name: "Aïcha",
      last_name: "Koné",
      phone: "+225 07 01 02 03 04",
      gender: "F",
      birth_date: "1989-03-15",
      blood_group: "A+",
      created_at: new Date().toISOString(),
      status: "STABLE",
      file_number: "DEMO-P1",
      hospital_id: DEMO_PROFILE.hospital_id,
    },
    {
      id: "demo-p2",
      first_name: "Jean",
      last_name: "Brou",
      phone: "+225 05 11 22 33 44",
      gender: "M",
      birth_date: "1975-11-02",
      blood_group: "O+",
      created_at: new Date().toISOString(),
      status: "OBSERVATION",
      file_number: "DEMO-P2",
      hospital_id: DEMO_PROFILE.hospital_id,
    },
  ],

  recentAppointments: [
    {
      id: "d1",
      reason: "Consultation générale",
      start_time: new Date(Date.now() + 86400000).toISOString(),
      appointment_date: new Date(Date.now() + 86400000).toISOString(),
      patients: { first_name: "Aïcha", last_name: "Koné" },
    },
    {
      id: "d2",
      reason: "Suivi tension",
      start_time: new Date().toISOString(),
      appointment_date: new Date().toISOString(),
      patients: { first_name: "Yvan", last_name: "Bamba" },
    },
  ],
};

export function isDemoSession(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(DEMO_KEY) === "1";
}

export function setDemoSession(): void {
  sessionStorage.setItem(DEMO_KEY, "1");
}

export function clearDemoSession(): void {
  sessionStorage.removeItem(DEMO_KEY);
}
