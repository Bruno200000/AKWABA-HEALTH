/** Début de RDV : schéma DB (start_time) ou anciennes données / démo */
export function getAppointmentStart(row: {
  start_time?: string | null;
  appointment_date?: string | null;
}): string {
  return row.start_time || row.appointment_date || new Date().toISOString();
}
