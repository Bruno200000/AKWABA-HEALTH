"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Save, User, CreditCard, Receipt, Calendar } from "lucide-react";

interface InvoiceFormProps {
 onSuccess: () => void;
 onCancel: () => void;
}

export default function InvoiceForm({ onSuccess, onCancel }: InvoiceFormProps) {
 const [isLoading, setIsLoading] = useState(false);
 const [patients, setPatients] = useState<any[]>([]);
 const [formData, setFormData] = useState({
 patient_id: "",
 total_amount: 0,
 paid_amount: 0,
 status: "UNPAID",
 due_date: new Date().toISOString().split('T')[0],
 });

 useEffect(() => {
 const fetchData = async () => {
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) return;

 const { data: profile } = await supabase.from("profiles").select("hospital_id").eq("id", user.id).maybeSingle();
 const hid = profile?.hospital_id;
 if (!hid) return;

 const { data } = await supabase
 .from("patients")
 .select("id, first_name, last_name")
 .eq("hospital_id", hid)
 .order("last_name");

 if (data) setPatients(data);
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
 
 const { error } = await supabase.from("invoices").insert([
 {
 ...formData,
 hospital_id: profile.hospital_id,
 status: formData.paid_amount >= formData.total_amount ? "PAID" : formData.paid_amount > 0 ? "PARTIAL" : "UNPAID",
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

 const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
 const { name, value } = e.target;
 setFormData(prev => ({ 
 ...prev, 
 [name]: name.includes("amount") ? Number(value) : value 
 }));
 };

 return (
 <form onSubmit={handleSubmit} className="space-y-6">
 <div className="space-y-4">
 <div className="space-y-2">
 <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
 <User className="w-4 h-4 text-blue-500" /> Patient à facturer
 </label>
 <select required name="patient_id" value={formData.patient_id} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none">
 <option value="">Sélectionner un patient</option>
 {patients.map(p => (
 <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
 ))}
 </select>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-2">
 <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
 <Receipt className="w-4 h-4 text-slate-400" /> Montant Total (CFA)
 </label>
 <input required type="number" name="total_amount" value={formData.total_amount} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none font-bold" />
 </div>
 <div className="space-y-2">
 <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
 <CreditCard className="w-4 h-4 text-emerald-500" /> Montant Payé (CFA)
 </label>
 <input required type="number" name="paid_amount" value={formData.paid_amount} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none font-bold text-emerald-600" />
 </div>
 </div>

 <div className="space-y-2">
 <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
 <Calendar className="w-4 h-4 text-amber-500" /> Échéance de paiement
 </label>
 <input required type="date" name="due_date" value={formData.due_date} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none" />
 </div>
 </div>

 <div className="pt-6 flex gap-3">
 <button type="button" onClick={onCancel} className="flex-1 py-4 border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all">
 Annuler
 </button>
 <button disabled={isLoading} type="submit" className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
 {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
 Générer la Facture
 </button>
 </div>
 </form>
 );
}
