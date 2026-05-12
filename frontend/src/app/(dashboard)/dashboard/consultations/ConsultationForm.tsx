"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { 
 Loader2, 
 Save, 
 Stethoscope, 
 Activity, 
 Pill, 
 Plus, 
 Trash2, 
 Search,
 FileText,
 Thermometer,
 Scale,
 Ruler,
 Droplet,
 QrCode
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ConsultationFormProps {
 patientId?: string;
 onSuccess: () => void;
 onCancel: () => void;
}

export default function ConsultationForm({ patientId: initialPatientId, onSuccess, onCancel }: ConsultationFormProps) {
 const [patientId, setPatientId] = useState(initialPatientId || "");
 const [patientSearch, setPatientSearch] = useState("");
 const [patientResults, setPatientResults] = useState<any[]>([]);
 const [isLoading, setIsLoading] = useState(false);
 const [activeStep, setActiveStep] = useState(patientId ? 1 : 0);
 const [medicines, setMedicines] = useState<any[]>([]);
 const [searchQuery, setSearchQuery] = useState("");
 const [searchResults, setSearchResults] = useState<any[]>([]);
 
 const [formData, setFormData] = useState({
 symptoms: "",
 diagnosis: "",
 notes_private: "",
 vital_signs: {
 weight: "",
 height: "",
 temp: "",
 bp_systolic: "",
 bp_diastolic: "",
 heart_rate: "",
 },
 prescription: [] as any[],
 });

 useEffect(() => {
 if (patientSearch.length > 2) {
 searchPatients();
 } else {
 setPatientResults([]);
 }
 }, [patientSearch]);

 const searchPatients = async () => {
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) return;

 const { data: profile } = await supabase.from("profiles").select("hospital_id").eq("id", user.id).maybeSingle();
 const hid = profile?.hospital_id;
 if (!hid) return;

 const { data } = await supabase
 .from("patients")
 .select("*")
 .eq("hospital_id", hid)
 .or(`last_name.ilike.%${patientSearch}%,first_name.ilike.%${patientSearch}%`)
 .limit(8);
 setPatientResults(data || []);
 };

 useEffect(() => {
 if (searchQuery.length > 2) {
 searchMedicines();
 } else {
 setSearchResults([]);
 }
 }, [searchQuery]);

 const searchMedicines = async () => {
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) return;

 const { data: profile } = await supabase.from("profiles").select("hospital_id").eq("id", user.id).maybeSingle();
 const hid = profile?.hospital_id;
 if (!hid) return;

 const { data } = await supabase
 .from("medicines")
 .select("*")
 .eq("hospital_id", hid)
 .ilike("name", `%${searchQuery}%`)
 .limit(8);
 setSearchResults(data || []);
 };

 const addMedicineToPrescription = (medicine: any) => {
 if (formData.prescription.find(m => m.id === medicine.id)) return;
 setFormData({
 ...formData,
 prescription: [...formData.prescription, { ...medicine, dosage: "", duration: "", quantity: 1, instructions: "" }]
 });
 setSearchQuery("");
 };

 const removeMedicine = (id: string) => {
 setFormData({
 ...formData,
 prescription: formData.prescription.filter(m => m.id !== id)
 });
 };

 const updateMedicine = (id: string, field: string, value: any) => {
 setFormData({
 ...formData,
 prescription: formData.prescription.map(m => m.id === id ? { ...m, [field]: value } : m)
 });
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setIsLoading(true);

 try {
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) throw new Error("Non authentifié");

 const { data: profile } = await supabase.from('profiles').select('hospital_id').eq('id', user.id).single();
 if (!profile?.hospital_id) throw new Error("Profil hospitalier non trouvé");

 // 1. Create Consultation
 const { data: consultation, error: consError } = await supabase.from("consultations").insert([
 {
 hospital_id: profile.hospital_id,
 patient_id: patientId,
 doctor_id: user.id,
 symptoms: formData.symptoms,
 diagnosis: formData.diagnosis,
 vital_signs: formData.vital_signs,
 notes_private: formData.notes_private,
 },
 ]).select().single();

 if (consError) throw consError;

 // 2. Create Prescription if medicines added
 if (formData.prescription.length > 0) {
 const { data: prescription, error: presError } = await supabase.from("prescriptions").insert([
 {
 hospital_id: profile.hospital_id,
 consultation_id: consultation.id,
 doctor_id: user.id,
 status: "PENDING"
 }
 ]).select().single();

 if (presError) throw presError;

 const prescriptionItems = formData.prescription.map(item => ({
 prescription_id: prescription.id,
 medicine_id: item.id,
 dosage: item.dosage,
 duration: item.duration,
 quantity: item.quantity,
 instructions: item.instructions
 }));

 const { error: itemsError } = await supabase.from("prescription_items").insert(prescriptionItems);
 if (itemsError) throw itemsError;
 }

 onSuccess();
 } catch (error: any) {
 alert("Erreur lors de l'enregistrement: " + error.message);
 } finally {
 setIsLoading(false);
 }
 };

 return (
 <div className="space-y-8">
 {/* Steps Header */}
 <div className="flex items-center justify-between px-4">
 {[
 { step: 1, label: "Constantes", icon: Activity },
 { step: 2, label: "Diagnostic", icon: Stethoscope },
 { step: 3, label: "Ordonnance", icon: Pill },
 { step: 4, label: "Signature", icon: FileText }
 ].map((s) => (
 <div key={s.step} className="flex flex-col items-center gap-2">
 <div className={cn(
 "w-10 h-10 rounded-full flex items-center justify-center transition-all",
 activeStep >= s.step ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-slate-100 text-slate-600"
 )}>
 <s.icon className="w-5 h-5" />
 </div>
 <span className={cn("text-[10px] font-black uppercase tracking-widest", activeStep >= s.step ? "text-blue-600" : "text-slate-600")}>
 {s.label}
 </span>
 </div>
 ))}
 </div>

 <form onSubmit={handleSubmit} className="space-y-6">
 {activeStep === 0 && (
 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
 <div className="space-y-2">
 <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Sélectionner un Patient</label>
 <div className="relative">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
 <input 
 type="text" 
 value={patientSearch}
 onChange={(e) => setPatientSearch(e.target.value)}
 placeholder="Rechercher par nom..."
 className="w-full pl-12 pr-4 py-4 bg-white border-blue-100 shadow-sm border border-slate-200 rounded-3xl focus:ring-2 focus:ring-blue-500/20 outline-none font-bold"
 />
 </div>
 
 {patientResults.length > 0 && (
 <div className="mt-2 bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden">
 {patientResults.map((p) => (
 <button
 key={p.id}
 type="button"
 onClick={() => { setPatientId(p.id); setActiveStep(1); }}
 className="w-full flex items-center gap-4 px-6 py-4 hover:bg-white border-blue-100 shadow-sm text-left transition-colors"
 >
 <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black">
 {p.first_name[0]}{p.last_name[0]}
 </div>
 <div>
 <p className="font-bold text-sm">{p.first_name} {p.last_name}</p>
 <p className="text-[10px] text-slate-600 font-bold uppercase">ID: {p.id.slice(0, 8)}</p>
 </div>
 </button>
 ))}
 </div>
 )}
 </div>
 </motion.div>
 )}

 {activeStep === 1 && (
 <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
 <div className="space-y-2">
 <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-1">
 <Thermometer className="w-3 h-3" /> Température (°C)
 </label>
 <input 
 type="number" step="0.1" 
 value={formData.vital_signs.temp} 
 onChange={(e) => setFormData({...formData, vital_signs: {...formData.vital_signs, temp: e.target.value}})}
 className="w-full px-4 py-3 bg-white border-blue-100 shadow-sm border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none font-bold" 
 placeholder="37.0"
 />
 </div>
 <div className="space-y-2">
 <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-1">
 <Scale className="w-3 h-3" /> Poids (kg)
 </label>
 <input 
 type="number" step="0.1" 
 value={formData.vital_signs.weight} 
 onChange={(e) => setFormData({...formData, vital_signs: {...formData.vital_signs, weight: e.target.value}})}
 className="w-full px-4 py-3 bg-white border-blue-100 shadow-sm border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none font-bold" 
 placeholder="70.0"
 />
 </div>
 <div className="space-y-2">
 <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-1">
 <Ruler className="w-3 h-3" /> Taille (cm)
 </label>
 <input 
 type="number" 
 value={formData.vital_signs.height} 
 onChange={(e) => setFormData({...formData, vital_signs: {...formData.vital_signs, height: e.target.value}})}
 className="w-full px-4 py-3 bg-white border-blue-100 shadow-sm border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none font-bold" 
 placeholder="175"
 />
 </div>
 <div className="space-y-2">
 <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-1">
 <Droplet className="w-3 h-3" /> TA Systolique
 </label>
 <input 
 type="number" 
 value={formData.vital_signs.bp_systolic} 
 onChange={(e) => setFormData({...formData, vital_signs: {...formData.vital_signs, bp_systolic: e.target.value}})}
 className="w-full px-4 py-3 bg-white border-blue-100 shadow-sm border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none font-bold" 
 placeholder="120"
 />
 </div>
 <div className="space-y-2">
 <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-1">
 TA Diastolique
 </label>
 <input 
 type="number" 
 value={formData.vital_signs.bp_diastolic} 
 onChange={(e) => setFormData({...formData, vital_signs: {...formData.vital_signs, bp_diastolic: e.target.value}})}
 className="w-full px-4 py-3 bg-white border-blue-100 shadow-sm border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none font-bold" 
 placeholder="80"
 />
 </div>
 <div className="space-y-2">
 <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-1">
 Fréq. Cardiaque
 </label>
 <input 
 type="number" 
 value={formData.vital_signs.heart_rate} 
 onChange={(e) => setFormData({...formData, vital_signs: {...formData.vital_signs, heart_rate: e.target.value}})}
 className="w-full px-4 py-3 bg-white border-blue-100 shadow-sm border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none font-bold" 
 placeholder="72"
 />
 </div>
 </div>
 <div className="flex gap-4">
 <button type="button" onClick={() => setActiveStep(2)} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
 Suivant : Diagnostic
 </button>
 </div>
 </motion.div>
 )}

 {activeStep === 2 && (
 <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
 <div className="space-y-2">
 <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Symptômes & Motifs</label>
 <textarea 
 required
 value={formData.symptoms}
 onChange={(e) => setFormData({...formData, symptoms: e.target.value})}
 className="w-full px-4 py-3 bg-white border-blue-100 shadow-sm border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none min-h-[100px] text-sm" 
 placeholder="Décrivez les symptômes rapportés par le patient..."
 />
 </div>
 <div className="space-y-2">
 <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Diagnostic Médical</label>
 <textarea 
 required
 value={formData.diagnosis}
 onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
 className="w-full px-4 py-3 bg-white border-blue-100 shadow-sm border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none min-h-[100px] text-sm font-bold" 
 placeholder="Saisissez le diagnostic final..."
 />
 </div>
 <div className="space-y-2">
 <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Notes Privées</label>
 <textarea 
 value={formData.notes_private}
 onChange={(e) => setFormData({...formData, notes_private: e.target.value})}
 className="w-full px-4 py-3 bg-white border-blue-100 shadow-sm border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none min-h-[80px] text-sm italic" 
 placeholder="Notes pour votre suivi personnel..."
 />
 </div>
 <div className="flex gap-4">
 <button type="button" onClick={() => setActiveStep(1)} className="flex-1 py-4 border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-white border-blue-100 shadow-sm transition-all">
 Précédent
 </button>
 <button type="button" onClick={() => setActiveStep(3)} className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
 Suivant : Ordonnance
 </button>
 </div>
 </motion.div>
 )}

 {activeStep === 3 && (
 <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
 <div className="relative">
 <div className="flex items-center gap-3 px-4 py-3 bg-slate-100 rounded-2xl focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
 <Search className="w-5 h-5 text-slate-600" />
 <input 
 type="text" 
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="Rechercher un médicament..."
 className="bg-transparent border-none outline-none w-full text-sm font-bold"
 />
 </div>
 
 {searchResults.length > 0 && (
 <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 overflow-hidden">
 {searchResults.map((m) => (
 <button
 key={m.id}
 type="button"
 onClick={() => addMedicineToPrescription(m)}
 className="w-full flex items-center justify-between px-4 py-3 hover:bg-white border-blue-100 shadow-sm text-left transition-colors"
 >
 <div>
 <p className="text-sm font-bold">{m.name}</p>
 <p className="text-[10px] text-slate-600 uppercase">{m.brand} • {m.category}</p>
 </div>
 <Plus className="w-4 h-4 text-blue-500" />
 </button>
 ))}
 </div>
 )}
 </div>

 <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
 {formData.prescription.map((item) => (
 <div key={item.id} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-3 relative group">
 <div className="flex justify-between items-start">
 <div>
 <h5 className="text-sm font-black text-blue-600">{item.name}</h5>
 <p className="text-[10px] text-slate-600 font-bold uppercase">{item.brand}</p>
 </div>
 <button type="button" onClick={() => removeMedicine(item.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
 <Trash2 className="w-4 h-4" />
 </button>
 </div>
 <div className="grid grid-cols-2 gap-3">
 <div className="space-y-1">
 <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Posologie</label>
 <input 
 required
 value={item.dosage}
 onChange={(e) => updateMedicine(item.id, "dosage", e.target.value)}
 className="w-full px-3 py-2 bg-white border-blue-100 shadow-sm border border-slate-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/10" 
 placeholder="Ex: 1 matin, 1 soir"
 />
 </div>
 <div className="space-y-1">
 <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Durée</label>
 <input 
 required
 value={item.duration}
 onChange={(e) => updateMedicine(item.id, "duration", e.target.value)}
 className="w-full px-3 py-2 bg-white border-blue-100 shadow-sm border border-slate-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/10" 
 placeholder="Ex: 5 jours"
 />
 </div>
 </div>
 <div className="space-y-1">
 <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Instructions spéciales</label>
 <input 
 value={item.instructions}
 onChange={(e) => updateMedicine(item.id, "instructions", e.target.value)}
 className="w-full px-3 py-2 bg-white border-blue-100 shadow-sm border border-slate-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/10" 
 placeholder="Ex: Après le repas"
 />
 </div>
 </div>
 ))}
 {formData.prescription.length === 0 && (
 <div className="text-center py-8 bg-white border-blue-100 shadow-sm /50 rounded-2xl border-2 border-dashed border-slate-200 ">
 <Pill className="w-8 h-8 text-slate-300 mx-auto mb-2" />
 <p className="text-xs text-slate-600 font-bold">Aucun médicament ajouté</p>
 </div>
 )}
 </div>

 <div className="flex gap-4 pt-4">
 <button type="button" onClick={() => setActiveStep(2)} className="flex-1 py-4 border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-white border-blue-100 shadow-sm transition-all">
 Précédent
 </button>
 <button type="button" onClick={() => setActiveStep(4)} className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
 Suivant : Signature
 </button>
 </div>
 </motion.div>
 )}

 {activeStep === 4 && (
 <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
 <div className="bg-white border-blue-100 shadow-sm /50 p-8 rounded-[40px] border border-slate-100 space-y-6">
 <div className="flex justify-between items-start">
 <div>
 <h4 className="text-lg font-black tracking-tight">Récapitulatif & Signature</h4>
 <p className="text-xs text-slate-600 font-medium mt-1">Veuillez signer pour valider la consultation.</p>
 </div>
 <div className="w-16 h-16 bg-white rounded-2xl border border-slate-100 p-2 flex items-center justify-center">
 <QrCode className="w-full h-full text-slate-200" />
 </div>
 </div>

 <div className="space-y-4">
 <div className="flex justify-between text-xs">
 <span className="font-bold text-slate-600 uppercase">Diagnostic</span>
 <span className="font-black text-slate-900 truncate max-w-[200px]">{formData.diagnosis}</span>
 </div>
 <div className="flex justify-between text-xs">
 <span className="font-bold text-slate-600 uppercase">Ordonnance</span>
 <span className="font-black text-slate-900 ">{formData.prescription.length} Médicament(s)</span>
 </div>
 </div>

 <div className="pt-6 border-t border-slate-200 ">
 <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-4 text-center">Signature du Praticien</label>
 <div className="h-40 bg-white rounded-3xl border-2 border-dashed border-slate-200 relative group cursor-crosshair">
 <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-10 transition-opacity">
 <FileText className="w-12 h-12" />
 </div>
 {/* Simuler une signature avec un texte manuscrit si "signé" */}
 <div className="absolute bottom-4 left-0 right-0 text-center">
 <p className="text-[10px] text-slate-600 font-medium italic">Signez électroniquement ici</p>
 </div>
 </div>
 </div>
 </div>

 <div className="flex gap-4">
 <button type="button" onClick={() => setActiveStep(3)} className="flex-1 py-4 border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-white border-blue-100 shadow-sm transition-all">
 Précédent
 </button>
 <button disabled={isLoading} type="submit" className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
 {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
 Signer & Terminer
 </button>
 </div>
 </motion.div>
 )}
 </form>
 </div>
 );
}
