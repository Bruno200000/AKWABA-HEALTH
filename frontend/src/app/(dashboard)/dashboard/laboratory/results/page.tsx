"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, CheckCircle2, Download, FileText, Filter, Search, User } from "lucide-react";
import { supabase } from "@/lib/supabase";

function extractResultsText(data: unknown): string {
 if (data && typeof data === "object" && "text" in data && typeof (data as { text: unknown }).text === "string") {
 return (data as { text: string }).text;
 }
 return "";
}

export default function LabResultsPage() {
 const [results, setResults] = useState<any[]>([]);
 const [isLoading, setIsLoading] = useState(true);
 const [searchQuery, setSearchQuery] = useState("");

 useEffect(() => {
 fetchResults();
 }, []);

 const fetchResults = async () => {
 setIsLoading(true);
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) {
 setIsLoading(false);
 return;
 }

 const { data: profile } = await supabase
 .from("profiles")
 .select("hospital_id")
 .eq("id", user.id)
 .maybeSingle();

 if (!profile?.hospital_id) {
 setIsLoading(false);
 return;
 }

 const { data } = await supabase
 .from("lab_tests")
 .select("*, patients(first_name, last_name, file_number), technician:profiles!lab_tests_technician_id_fkey(first_name, last_name)")
 .eq("hospital_id", profile.hospital_id)
 .eq("status", "COMPLETED")
 .order("completed_at", { ascending: false });

 setResults(data || []);
 setIsLoading(false);
 };

 const filteredResults = results.filter((res) => {
 const query = searchQuery.toLowerCase();
 return (
 `${res.patients?.first_name || ""} ${res.patients?.last_name || ""}`.toLowerCase().includes(query) ||
 res.test_type?.toLowerCase().includes(query) ||
 extractResultsText(res.results_data).toLowerCase().includes(query)
 );
 });

 return (
 <div className="space-y-8">
 <div className="flex justify-between items-center">
 <div>
 <h1 className="text-3xl font-black text-slate-900 tracking-tight">Resultats de Laboratoire</h1>
 <p className="text-slate-600 font-medium">Archive securisee des analyses validees et publiees.</p>
 </div>
 <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200">
 <Download className="w-4 h-4" /> Exporter les donnees
 </button>
 </div>

 <div className="flex gap-4">
 <div className="relative flex-1">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
 <input
 type="text"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="Rechercher par patient ou type d'analyse..."
 className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/10"
 />
 </div>
 <button className="px-5 bg-white rounded-2xl hover:bg-white border-blue-100 shadow-sm transition-all">
 <Filter className="w-5 h-5 text-slate-600" />
 </button>
 </div>

 {isLoading ? (
 <div className="text-center py-20 text-slate-600 font-bold uppercase text-[10px] tracking-widest">Chargement des resultats...</div>
 ) : filteredResults.length > 0 ? (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {filteredResults.map((res) => (
 <motion.div
 key={res.id}
 whileHover={{ y: -5 }}
 className="p-8 bg-white rounded-[40px] shadow-sm group"
 >
 <div className="flex justify-between items-start mb-8">
 <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-[20px] flex items-center justify-center">
 <CheckCircle2 className="w-7 h-7" />
 </div>
 <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{res.id.slice(0, 8).toUpperCase()}</span>
 </div>

 <h3 className="font-black text-xl mb-1">{res.patients?.first_name} {res.patients?.last_name}</h3>
 <p className="text-sm font-bold text-blue-600 uppercase tracking-tight mb-4">{res.test_type}</p>
 <p className="text-xs text-slate-600 line-clamp-3 mb-8">{extractResultsText(res.results_data) || res.observations || "Resultat enregistre"}</p>

 <div className="space-y-3 mb-8">
 <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
 <Calendar className="w-4 h-4 opacity-30" /> Valide le {new Date(res.completed_at || res.created_at).toLocaleDateString("fr-FR")}
 </div>
 <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
 <User className="w-4 h-4 opacity-30" /> Technicien: {res.technician ? `${res.technician.first_name} ${res.technician.last_name}` : "Non renseigne"}
 </div>
 </div>

 <button className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2">
 <FileText className="w-4 h-4" /> Rapport enregistre
 </button>
 </motion.div>
 ))}
 </div>
 ) : (
 <div className="text-center py-20 border border-dashed border-blue-100 rounded-[32px] text-slate-600 font-bold uppercase text-[10px] tracking-widest">
 Aucun resultat valide dans la base
 </div>
 )}
 </div>
 );
}
