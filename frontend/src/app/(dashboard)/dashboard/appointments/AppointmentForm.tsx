"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Save, User, Calendar, Stethoscope, FileText } from "lucide-react";

interface AppointmentFormProps {
 onSuccess: () => void;
 onCancel: () => void;
}

export default function AppointmentForm({ onSuccess, onCancel }: AppointmentFormProps) {
 const [isLoading, setIsLoading] = useState(false);
 const [patients, setPatients] = useState<any[]>([]);
 const [doctors, setDoctors] = useState<any[]>([]);
 const [formData, setFormData] = useState({
 patient_id: "",
 doctor_id: "",
 appointment_date: "",
 reason: "",
 status: "PENDING",
 });

 useEffect(() => {
 const fetchData = async () => {
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) return;

 const { data: profile } = await supabase
 .from("profiles")
 .select("hospital_id")
 .eq("id", user.id)
 .maybeSingle();

 const hid = profile?.hospital_id;
 if (!hid) return;

 const [{ data: patientsData }, { data: doctorsData }] = await Promise.all([
 supabase.from("patients").select("id, first_name, last_name").eq("hospital_id", hid).order("last_name"),
 supabase.from("profiles").select("id, first_name, last_name").eq("hospital_id", hid).eq("role", "DOCTOR"),
 ]);

 if (patientsData) setPatients(patientsData);
 if (doctorsData) setDoctors(doctorsData);
 };
 fetchData();
 }, []);

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setIsLoading(true);

 try {
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) throw new Error("Non authentifié");

 const { data: profile } = await supabase.from('profiles').select('hospital_id').eq('id', user.id).single();
 if (!profile?.hospital_id) throw new Error("Profil hospitalier non trouvé");
 
 const start = new Date(formData.appointment_date);
 if (Number.isNaN(start.getTime())) throw new Error("Date invalide");

 const end = new Date(start.getTime() + 30 * 60 * 1000);

 const { error } = await supabase.from("appointments").insert([
 {
 hospital_id: profile.hospital_id,
 patient_id: formData.patient_id,
 doctor_id: formData.doctor_id,
 status: formData.status as "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "IN_PROGRESS",
 reason: formData.reason || null,
 start_time: start.toISOString(),
 end_time: end.toISOString(),
 },
 ]);

 if (error) throw error;
 onSuccess();
 } catch (error: any) {
 alert("Erreur: " + error.message);
 } finally {
 setIsLoading(false);
 }
 };

 const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
 setFormData({ ...formData, [e.target.name]: e.target.value });
 };

 return (
 <form onSubmit={handleSubmit} className="space-y-6">
 <div className="space-y-4">
 <div className="space-y-2">
 <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
 <User className="w-4 h-4 text-blue-500" /> Patient
 </label>
 <select required name="patient_id" value={formData.patient_id} onChange={handleChange} className="w-full px-4 py-3 bg-white border-blue-100 shadow-sm  rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none">
 <option value="">Sélectionner un patient</option>
 {patients.map(p => (
 <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
 ))}
 </select>
 </div>

 <div className="space-y-2">
 <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
 <Stethoscope className="w-4 h-4 text-emerald-500" /> Médecin
 </label>
 <select required name="doctor_id" value={formData.doctor_id} onChange={handleChange} className="w-full px-4 py-3 bg-white border-blue-100 shadow-sm  rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none">
 <option value="">Sélectionner un médecin</option>
 {doctors.map(d => (
 <option key={d.id} value={d.id}>{d.first_name} {d.last_name}</option>
 ))}
 </select>
 </div>

 <div className="space-y-2">
 <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
 <Calendar className="w-4 h-4 text-amber-500" /> Date et Heure
 </label>
 <input required type="datetime-local" name="appointment_date" value={formData.appointment_date} onChange={handleChange} className="w-full px-4 py-3 bg-white border-blue-100 shadow-sm  rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none" />
 </div>

 <div className="space-y-2">
 <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
 <FileText className="w-4 h-4 text-slate-600" /> Motif de la consultation
 </label>
 <textarea name="reason" value={formData.reason} onChange={handleChange} className="w-full px-4 py-3 bg-white border-blue-100 shadow-sm  rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none min-h-[100px]" placeholder="Symptômes, suivi, etc." />
 </div>
 </div>

 <div className="pt-6 flex gap-3">
 <button type="button" onClick={onCancel} className="flex-1 py-4  rounded-2xl font-bold text-slate-600 hover:bg-white border-blue-100 shadow-sm transition-all">
 Annuler
 </button>
 <button disabled={isLoading} type="submit" className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
 {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
 Confirmer le Rendez-vous
 </button>
 </div>
 </form>
 );
}
