"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Save, Beaker, User, FileText, Activity } from "lucide-react";

interface LabTestFormProps {
 onSuccess: () => void;
 onCancel: () => void;
}

export default function LabTestForm({ onSuccess, onCancel }: LabTestFormProps) {
 const [isLoading, setIsLoading] = useState(false);
 const [patients, setPatients] = useState<any[]>([]);
 const [formData, setFormData] = useState({
 patient_id: "",
 test_type: "",
 doctor_id: "",
 notes: "",
 });

 useEffect(() => {
 const fetchData = async () => {
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) return;

 const { data: prof } = await supabase.from("profiles").select("hospital_id").eq("id", user.id).maybeSingle();
 const hid = prof?.hospital_id;
 if (!hid) return;

 const [{ data: patientsData }, { data: doctorsData }] = await Promise.all([
 supabase.from("patients").select("id, first_name, last_name").eq("hospital_id", hid).order("last_name"),
 supabase.from("profiles").select("id, first_name, last_name").eq("hospital_id", hid).eq("role", "DOCTOR"),
 ]);
 
 if (patientsData) setPatients(patientsData);
 if (doctorsData && doctorsData.length > 0) {
 setFormData(prev => ({ ...prev, doctor_id: doctorsData[0].id }));
 }
 };
 fetchData();
 }, []);

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setIsLoading(true);

 try {
 const { data: { user } } = await supabase.auth.getUser();
 const { data: profile } = await supabase.from('profiles').select('hospital_id').eq('id', user?.id).single();
 
 if (!profile?.hospital_id) throw new Error("Hospital ID not found");

 const { error } = await supabase.from("lab_tests").insert([
 {
 hospital_id: profile.hospital_id,
 patient_id: formData.patient_id,
 doctor_id: formData.doctor_id,
 test_type: formData.test_type,
 status: "ORDERED",
 notes: formData.notes || null,
 results_data: null,
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
 <User className="w-4 h-4 text-blue-500" /> Patient
 </label>
 <select required name="patient_id" value={formData.patient_id} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none">
 <option value="">Sélectionner un patient</option>
 {patients.map(p => (
 <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
 ))}
 </select>
 </div>

 <div className="space-y-2">
 <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
 <Beaker className="w-4 h-4 text-purple-500" /> Type d&apos;analyse
 </label>
 <select required name="test_type" value={formData.test_type} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none">
 <option value="">Choisir un test</option>
 <option value="SANG_NFS">NFS (Sang)</option>
 <option value="GLYCEMIE">Glycémie</option>
 <option value="URINE">Analyse d&apos;urine</option>
 <option value="PALUDISME">Test Paludisme (TDR)</option>
 <option value="TYPHOIDE">Test Typhoïde</option>
 <option value="CHIRSTEROL">Cholestérol</option>
 </select>
 </div>

 <div className="space-y-2">
 <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
 <FileText className="w-4 h-4 text-slate-400" /> Notes / Indications
 </label>
 <textarea name="notes" value={formData.notes} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none min-h-[100px]" placeholder="Pourquoi cet examen ? Précisions médicales..." />
 </div>
 </div>

 <div className="pt-6 flex gap-3">
 <button type="button" onClick={onCancel} className="flex-1 py-4 border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all">
 Annuler
 </button>
 <button disabled={isLoading} type="submit" className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
 {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
 Prescrire l&apos;Examen
 </button>
 </div>
 </form>
 );
}
