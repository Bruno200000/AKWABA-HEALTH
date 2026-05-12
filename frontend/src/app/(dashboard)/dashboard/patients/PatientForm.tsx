"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Save, User, Phone, Mail, MapPin, Droplets, ShieldCheck, HeartPulse } from "lucide-react";

interface PatientFormProps {
 onSuccess: () => void;
 onCancel: () => void;
}

export default function PatientForm({ onSuccess, onCancel }: PatientFormProps) {
 const [isLoading, setIsLoading] = useState(false);
 const [formData, setFormData] = useState({
 first_name: "",
 last_name: "",
 birth_date: "",
 gender: "M",
 blood_group: "",
 phone: "",
 email: "",
 address: "",
 emergency_contact: "",
 insurance_provider: "",
 insurance_number: "",
 allergies: "",
 medical_history: "",
 });

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setIsLoading(true);

 try {
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) throw new Error("Non authentifié");

 const { data: profile } = await supabase.from('profiles').select('hospital_id').eq('id', user.id).single();
 if (!profile?.hospital_id) throw new Error("Profil hospitalier non trouvé");
 
 const fileNumber = `PAT-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 999)}`;

 const { error } = await supabase.from("patients").insert([
 {
 hospital_id: profile.hospital_id,
 file_number: fileNumber,
 first_name: formData.first_name,
 last_name: formData.last_name,
 birth_date: formData.birth_date || null,
 gender: formData.gender,
 blood_group: formData.blood_group || null,
 phone: formData.phone,
 email: formData.email || null,
 address: formData.address || null,
 insurance_provider: formData.insurance_provider || null,
 insurance_number: formData.insurance_number || null,
 allergies: formData.allergies ? formData.allergies.split(",").map((s) => s.trim()).filter(Boolean) : [],
 medical_history: { notes: formData.medical_history },
 },
 ]);

 if (error) throw error;
 onSuccess();
 } catch (error: any) {
 alert("Erreur lors de l'enregistrement: " + error.message);
 } finally {
 setIsLoading(false);
 }
 };

 const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
 setFormData({ ...formData, [e.target.name]: e.target.value });
 };

 return (
 <form onSubmit={handleSubmit} className="space-y-6">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {/* Identité */}
 <div className="space-y-4">
 <h4 className="text-sm font-bold text-blue-600 uppercase tracking-widest flex items-center gap-2">
 <User className="w-4 h-4" /> Identité
 </h4>
 <div className="space-y-2">
 <label className="text-xs font-bold text-slate-500 ml-1">Prénom</label>
 <input required name="first_name" value={formData.first_name} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none" placeholder="Jean" />
 </div>
 <div className="space-y-2">
 <label className="text-xs font-bold text-slate-500 ml-1">Nom</label>
 <input required name="last_name" value={formData.last_name} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none" placeholder="Kouassi" />
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-2">
 <label className="text-xs font-bold text-slate-500 ml-1">Date de naissance</label>
 <input required type="date" name="birth_date" value={formData.birth_date} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none text-sm" />
 </div>
 <div className="space-y-2">
 <label className="text-xs font-bold text-slate-500 ml-1">Sexe</label>
 <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none text-sm">
 <option value="M">Masculin</option>
 <option value="F">Féminin</option>
 <option value="O">Autre</option>
 </select>
 </div>
 </div>
 </div>

 {/* Contact & Médical */}
 <div className="space-y-4">
 <h4 className="text-sm font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-2">
 <Phone className="w-4 h-4" /> Contact & Médical
 </h4>
 <div className="space-y-2">
 <label className="text-xs font-bold text-slate-500 ml-1">Téléphone</label>
 <input required name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none text-sm" placeholder="+225 0700000000" />
 </div>
 <div className="space-y-2">
 <label className="text-xs font-bold text-slate-500 ml-1">Email</label>
 <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none text-sm" placeholder="jean@exemple.com" />
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-2">
 <label className="text-xs font-bold text-slate-500 ml-1">Groupe Sanguin</label>
 <select name="blood_group" value={formData.blood_group} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none text-sm">
 <option value="">Inconnu</option>
 <option value="A+">A+</option>
 <option value="A-">A-</option>
 <option value="B+">B+</option>
 <option value="B-">B-</option>
 <option value="O+">O+</option>
 <option value="O-">O-</option>
 <option value="AB+">AB+</option>
 <option value="AB-">AB-</option>
 </select>
 </div>
 <div className="space-y-2">
 <label className="text-xs font-bold text-slate-500 ml-1">Allergies (séparées par virgule)</label>
 <input name="allergies" value={formData.allergies} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none text-sm" placeholder="Pénicilline, Arachides..." />
 </div>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="space-y-4">
 <h4 className="text-sm font-bold text-amber-600 uppercase tracking-widest flex items-center gap-2">
 <MapPin className="w-4 h-4" /> Adresse & Localisation
 </h4>
 <div className="space-y-2">
 <label className="text-xs font-bold text-slate-500 ml-1">Adresse complète</label>
 <textarea name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none min-h-[80px] text-sm" placeholder="Abidjan, Cocody, Cité des arts..." />
 </div>
 </div>
 <div className="space-y-4">
 <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-2">
 <ShieldCheck className="w-4 h-4" /> Assurance Santé
 </h4>
 <div className="space-y-4">
 <div className="space-y-2">
 <label className="text-xs font-bold text-slate-500 ml-1">Assureur</label>
 <input name="insurance_provider" value={formData.insurance_provider} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none text-sm" placeholder="MUGEF-CI, SAHAM, etc." />
 </div>
 <div className="space-y-2">
 <label className="text-xs font-bold text-slate-500 ml-1">Numéro de police / Assuré</label>
 <input name="insurance_number" value={formData.insurance_number} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none text-sm" placeholder="123-456-789" />
 </div>
 </div>
 </div>
 </div>

 <div className="space-y-4">
 <h4 className="text-sm font-bold text-red-600 uppercase tracking-widest flex items-center gap-2">
 <HeartPulse className="w-4 h-4" /> Antécédents Médicaux
 </h4>
 <div className="space-y-2">
 <label className="text-xs font-bold text-slate-500 ml-1">Notes sur l&apos;historique médical</label>
 <textarea name="medical_history" value={formData.medical_history} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none min-h-[120px] text-sm" placeholder="Asthme depuis l'enfance, opération du genou en 2018..." />
 </div>
 </div>

 <div className="pt-6 flex gap-3 sticky bottom-0 bg-white pb-2">
 <button type="button" onClick={onCancel} className="flex-1 py-4 border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all">
 Annuler
 </button>
 <button disabled={isLoading} type="submit" className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
 {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
 Enregistrer le Patient
 </button>
 </div>
 </form>
 );
}
