/** Debut de RDV : schema DB courant (start_time) avec compatibilite historique. */
export function getAppointmentStart(row: {
  start_time?: string | null;
  appointment_date?: string | null;
}): string {
  return row.start_time || row.appointment_date || new Date().toISOString();
}
