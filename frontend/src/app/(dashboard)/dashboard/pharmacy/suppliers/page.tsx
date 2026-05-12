"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Building2, Search, Plus, Phone, Mail, ChevronRight, Package, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { Modal } from "@/components/ui/modal";

export default function SuppliersPage() {
 const [suppliers, setSuppliers] = useState<any[]>([]);
 const [isLoading, setIsLoading] = useState(true);
 const [searchQuery, setSearchQuery] = useState("");
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [isSaving, setIsSaving] = useState(false);
 const [form, setForm] = useState({
 name: "",
 contact_name: "",
 phone: "",
 email: "",
 category: "",
 notes: "",
 });

 useEffect(() => {
 fetchSuppliers();
 }, []);

 const fetchSuppliers = async () => {
 setIsLoading(true);
 try {
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) return;

 const { data: profile } = await supabase.from("profiles").select("hospital_id").eq("id", user.id).maybeSingle();
 const hid = profile?.hospital_id;
 if (!hid) return;

 const { data, error } = await supabase
 .from("suppliers")
 .select("*")
 .eq("hospital_id", hid)
 .order("name");

 if (!error && data) setSuppliers(data);
 } finally {
 setIsLoading(false);
 }
 };

 const resetForm = () => {
 setForm({ name: "", contact_name: "", phone: "", email: "", category: "", notes: "" });
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setIsSaving(true);
 try {
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) throw new Error("Non authentifié");

 const { data: profile } = await supabase.from("profiles").select("hospital_id").eq("id", user.id).maybeSingle();
 if (!profile?.hospital_id) throw new Error("Établissement introuvable");

 const { error } = await supabase.from("suppliers").insert([
 {
 hospital_id: profile.hospital_id,
 name: form.name.trim(),
 contact_name: form.contact_name.trim() || null,
 phone: form.phone.trim() || null,
 email: form.email.trim() || null,
 category: form.category.trim() || null,
 notes: form.notes.trim() || null,
 },
 ]);

 if (error) throw error;

 resetForm();
 setIsModalOpen(false);
 fetchSuppliers();
 } catch (err: unknown) {
 const msg = err instanceof Error ? err.message : "Erreur";
 alert(msg);
 } finally {
 setIsSaving(false);
 }
 };

 const handleDelete = async (id: string) => {
 if (!confirm("Supprimer ce fournisseur ?")) return;
 const { error } = await supabase.from("suppliers").delete().eq("id", id);
 if (error) alert(error.message);
 else fetchSuppliers();
 };

 const filtered = suppliers.filter(
 (sup) =>
 sup.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
 sup.contact_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
 sup.category?.toLowerCase().includes(searchQuery.toLowerCase())
 );

 return (
 <div className="space-y-8">
 <div className="flex justify-between items-center flex-wrap gap-4">
 <div>
 <h1 className="text-3xl font-black text-slate-900 tracking-tight">Fournisseurs Pharmaceutiques</h1>
 <p className="text-slate-600 font-medium">
 Laboratoires et grossistes liés à votre établissement (Supabase table{" "}
 <code className="text-xs bg-blue-50 px-1 rounded">suppliers</code>).
 </p>
 </div>
 <button
 type="button"
 onClick={() => {
 resetForm();
 setIsModalOpen(true);
 }}
 className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200"
 >
 <Plus className="w-4 h-4" /> Ajouter un Fournisseur
 </button>
 </div>

 <div className="flex gap-4">
 <div className="relative flex-1">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
 <input
 type="text"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="Rechercher un fournisseur..."
 className="w-full pl-12 pr-4 py-4 bg-white border border-blue-100 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/15"
 />
 </div>
 </div>

 {isLoading ? (
 <div className="flex justify-center py-24 text-slate-600 gap-2 items-center font-bold text-sm">
 <Loader2 className="w-5 h-5 animate-spin" /> Chargement…
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {filtered.map((sup) => (
 <motion.div
 key={sup.id}
 whileHover={{ y: -4 }}
 className="p-8 bg-white rounded-[40px] border border-blue-100 shadow-sm relative group"
 >
 <div className="flex justify-between items-start mb-8">
 <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-[20px] flex items-center justify-center">
 <Building2 className="w-7 h-7" />
 </div>
 <button
 type="button"
 onClick={() => handleDelete(sup.id)}
 className="p-2 text-slate-300 hover:text-red-600 transition-colors"
 title="Supprimer"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 </div>

 <h3 className="font-black text-xl mb-1">{sup.name}</h3>
 <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-8">
 {sup.category || "Non classé"}
 </p>

 <div className="space-y-4 mb-8">
 <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
 <Package className="w-4 h-4 opacity-40" /> {sup.contact_name || "—"}
 </div>
 <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
 <Phone className="w-4 h-4 opacity-40" /> {sup.phone || "—"}
 </div>
 <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
 <Mail className="w-4 h-4 opacity-40" /> {sup.email || "—"}
 </div>
 </div>

 <button
 type="button"
 className={cn(
 "w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 border transition-all",
 "border-blue-100 text-blue-600 hover:bg-blue-50"
 )}
 >
 Historique commandes <ChevronRight className="w-4 h-4" />
 </button>
 </motion.div>
 ))}
 </div>
 )}

 {!isLoading && filtered.length === 0 && (
 <div className="text-center py-16 border border-dashed border-blue-100 rounded-[32px] text-slate-600 text-sm font-medium">
 Aucun fournisseur. Ajoutez votre premier grossiste ou représentant pharmaceutique.
 </div>
 )}

 <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nouveau fournisseur">
 <form onSubmit={handleSubmit} className="space-y-4 p-2">
 <div className="space-y-1">
 <label className="text-xs font-bold text-slate-600">Nom du fournisseur *</label>
 <input
 required
 value={form.name}
 onChange={(e) => setForm({ ...form, name: e.target.value })}
 className="w-full px-4 py-3 bg-white border-blue-100 shadow-sm  rounded-2xl text-sm"
 placeholder="Laborex, DPCI…"
 />
 </div>
 <div className="grid grid-cols-2 gap-3">
 <div className="space-y-1">
 <label className="text-xs font-bold text-slate-600">Contact</label>
 <input
 value={form.contact_name}
 onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
 className="w-full px-4 py-3 bg-white border-blue-100 shadow-sm  rounded-2xl text-sm"
 />
 </div>
 <div className="space-y-1">
 <label className="text-xs font-bold text-slate-600">Catégorie</label>
 <input
 value={form.category}
 onChange={(e) => setForm({ ...form, category: e.target.value })}
 className="w-full px-4 py-3 bg-white border-blue-100 shadow-sm  rounded-2xl text-sm"
 placeholder="Générique, matériel…"
 />
 </div>
 </div>
 <div className="grid grid-cols-2 gap-3">
 <div className="space-y-1">
 <label className="text-xs font-bold text-slate-600">Téléphone</label>
 <input
 value={form.phone}
 onChange={(e) => setForm({ ...form, phone: e.target.value })}
 className="w-full px-4 py-3 bg-white border-blue-100 shadow-sm  rounded-2xl text-sm"
 />
 </div>
 <div className="space-y-1">
 <label className="text-xs font-bold text-slate-600">Email</label>
 <input
 type="email"
 value={form.email}
 onChange={(e) => setForm({ ...form, email: e.target.value })}
 className="w-full px-4 py-3 bg-white border-blue-100 shadow-sm  rounded-2xl text-sm"
 />
 </div>
 </div>
 <div className="space-y-1">
 <label className="text-xs font-bold text-slate-600">Notes</label>
 <textarea
 value={form.notes}
 onChange={(e) => setForm({ ...form, notes: e.target.value })}
 className="w-full px-4 py-3 bg-white border-blue-100 shadow-sm  rounded-2xl text-sm min-h-[80px]"
 />
 </div>
 <div className="flex gap-3 pt-4">
 <button
 type="button"
 onClick={() => setIsModalOpen(false)}
 className="flex-1 py-3 rounded-2xl  font-bold text-slate-600"
 >
 Annuler
 </button>
 <button
 disabled={isSaving}
 type="submit"
 className="flex-[2] py-3 rounded-2xl bg-blue-600 text-white font-bold flex justify-center items-center gap-2"
 >
 {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Enregistrer"}
 </button>
 </div>
 </form>
 </Modal>
 </div>
 );
}
