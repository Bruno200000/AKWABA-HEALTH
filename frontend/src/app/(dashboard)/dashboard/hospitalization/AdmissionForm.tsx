"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Save, User, Bed, Calendar, ClipboardList } from "lucide-react";

interface AdmissionFormProps {
 onSuccess: () => void;
 onCancel: () => void;
}

export default function AdmissionForm({ onSuccess, onCancel }: AdmissionFormProps) {
 const [isLoading, setIsLoading] = useState(false);
 const [patients, setPatients] = useState<any[]>([]);
 const [rooms, setRooms] = useState<any[]>([]);
 const [formData, setFormData] = useState({
 patient_id: "",
 room_id: "",
 admission_date: new Date().toISOString().split('T')[0],
 notes: "",
 });

 useEffect(() => {
 const fetchData = async () => {
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) return;

 const { data: profile } = await supabase.from('profiles').select('hospital_id').eq('id', user.id).single();
 if (!profile?.hospital_id) return;

 const { data: pData } = await supabase.from('patients').select('id, first_name, last_name').eq('hospital_id', profile.hospital_id);
 const { data: rData } = await supabase.from('rooms').select('id, room_number, type').eq('hospital_id', profile.hospital_id);
 
 if (pData) setPatients(pData);
 if (rData) setRooms(rData);
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
 
 const { error } = await supabase.from("admissions").insert([
 {
 ...formData,
 hospital_id: profile.hospital_id,
 status: "ADMITTED",
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
 setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
 };

 return (
 <form onSubmit={handleSubmit} className="space-y-6">
 <div className="space-y-4">
 <div className="space-y-2">
 <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
 <User className="w-4 h-4 text-blue-500" /> Patient à admettre
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
 <Bed className="w-4 h-4 text-emerald-500" /> Chambre Disponible
 </label>
 <select required name="room_id" value={formData.room_id} onChange={handleChange} className="w-full px-4 py-3 bg-white border-blue-100 shadow-sm  rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none">
 <option value="">Choisir une chambre</option>
 {rooms.length > 0 ? rooms.map(r => (
 <option key={r.id} value={r.id}>Chambre {r.room_number} ({r.type})</option>
 )) : <option disabled>Aucune chambre libre</option>}
 </select>
 </div>

 <div className="space-y-2">
 <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
 <Calendar className="w-4 h-4 text-amber-500" /> Date d&apos;Admission
 </label>
 <input required type="date" name="admission_date" value={formData.admission_date} onChange={handleChange} className="w-full px-4 py-3 bg-white border-blue-100 shadow-sm  rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none" />
 </div>

 <div className="space-y-2">
 <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
 <ClipboardList className="w-4 h-4 text-slate-600" /> Observations d&apos;entrée
 </label>
 <textarea name="notes" value={formData.notes} onChange={handleChange} className="w-full px-4 py-3 bg-white border-blue-100 shadow-sm  rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none min-h-[100px]" placeholder="Condition du patient, raison de l'hospitalisation..." />
 </div>
 </div>

 <div className="pt-6 flex gap-3">
 <button type="button" onClick={onCancel} className="flex-1 py-4  rounded-2xl font-bold text-slate-600 hover:bg-white border-blue-100 shadow-sm transition-all">
 Annuler
 </button>
 <button disabled={isLoading} type="submit" className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
 {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
 Confirmer l&apos;Admission
 </button>
 </div>
 </form>
 );
}
