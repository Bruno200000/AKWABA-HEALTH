"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, FileText, Filter, Search, User } from "lucide-react";
import ExportActions from "@/components/ExportActions";
import { supabase } from "@/lib/supabase";

export default function ConsultationHistoryPage() {
 const [history, setHistory] = useState<any[]>([]);
 const [isLoading, setIsLoading] = useState(true);
 const [searchQuery, setSearchQuery] = useState("");

 useEffect(() => {
 fetchHistory();
 }, []);

 const fetchHistory = async () => {
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
 .from("consultations")
 .select("*, patients(first_name, last_name, file_number), profiles!consultations_doctor_id_fkey(first_name, last_name)")
 .eq("hospital_id", profile.hospital_id)
 .order("created_at", { ascending: false });

 setHistory(data || []);
 setIsLoading(false);
 };

 const filteredHistory = history.filter((item) => {
 const query = searchQuery.toLowerCase();
 return (
 `${item.patients?.first_name || ""} ${item.patients?.last_name || ""}`.toLowerCase().includes(query) ||
 `${item.profiles?.first_name || ""} ${item.profiles?.last_name || ""}`.toLowerCase().includes(query) ||
 item.diagnosis?.toLowerCase().includes(query)
 );
 });

 return (
 <div className="space-y-8">
 <div className="flex justify-between items-center">
 <div>
 <h1 className="text-3xl font-black text-slate-900 tracking-tight">Historique des Consultations</h1>
 <p className="text-slate-600 font-medium">Archive complete des consultations enregistrees dans la base.</p>
 </div>
 <ExportActions
 title="Historique des consultations"
 rows={filteredHistory}
 columns={[
 { header: "Date", accessor: (item) => new Date(item.created_at).toLocaleDateString("fr-FR") },
 { header: "Patient", accessor: (item) => `${item.patients?.first_name || ""} ${item.patients?.last_name || ""}`.trim() },
 { header: "Numero dossier", accessor: (item) => item.patients?.file_number || "" },
 { header: "Diagnostic", accessor: (item) => item.diagnosis || "" },
 { header: "Medecin", accessor: (item) => `Dr. ${item.profiles?.first_name || ""} ${item.profiles?.last_name || ""}`.trim() },
 ]}
 />
 </div>

 <div className="flex gap-4">
 <div className="relative flex-1">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
 <input
 type="text"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="Rechercher par patient, docteur ou diagnostic..."
 className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/10"
 />
 </div>
 <button className="px-5 bg-white rounded-2xl hover:bg-white border-blue-100 shadow-sm transition-all">
 <Filter className="w-5 h-5 text-slate-600" />
 </button>
 </div>

 <div className="bg-white rounded-[32px] overflow-hidden shadow-sm">
 <table className="w-full text-left">
 <thead>
 <tr className="bg-white border-blue-100 shadow-sm /50 border-b border-blue-50">
 <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest">Date</th>
 <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest">Patient</th>
 <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest">Diagnostic</th>
 <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest">Medecin</th>
 <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {isLoading ? (
 <tr><td colSpan={5} className="text-center py-10 text-slate-600">Chargement de l&apos;historique...</td></tr>
 ) : filteredHistory.length > 0 ? filteredHistory.map((item, index) => (
 <motion.tr
 key={item.id}
 initial={{ opacity: 0, y: 8 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: index * 0.03 }}
 className="hover:bg-white border-blue-100 shadow-sm/50 transition-colors cursor-pointer group"
 >
 <td className="px-8 py-6">
 <div className="flex items-center gap-3">
 <Calendar className="w-4 h-4 text-slate-300" />
 <span className="text-sm font-bold">{new Date(item.created_at).toLocaleDateString("fr-FR")}</span>
 </div>
 </td>
 <td className="px-8 py-6 font-black text-sm">{item.patients?.first_name} {item.patients?.last_name}</td>
 <td className="px-8 py-6">
 <span className="text-sm text-slate-600 italic">&quot;{item.diagnosis || "Non renseigne"}&quot;</span>
 </td>
 <td className="px-8 py-6">
 <div className="flex items-center gap-2">
 <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
 <User className="w-3 h-3" />
 </div>
 <span className="text-sm font-medium">Dr. {item.profiles?.first_name} {item.profiles?.last_name}</span>
 </div>
 </td>
 <td className="px-8 py-6">
 <button
 onClick={() => window.open(`/dashboard/print/prescription/${item.id}`, "_blank")}
 className="p-2 text-slate-300 hover:text-blue-600 transition-colors"
 >
 <FileText className="w-5 h-5" />
 </button>
 </td>
 </motion.tr>
 )) : (
 <tr><td colSpan={5} className="text-center py-10 text-slate-600">Aucune consultation enregistree</td></tr>
 )}
 </tbody>
 </table>
 </div>
 </div>
 );
}
