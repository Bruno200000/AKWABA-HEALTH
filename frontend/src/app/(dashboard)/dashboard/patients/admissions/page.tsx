"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRightCircle, Clock, FileText, Plus, Search, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export default function AdmissionsPage() {
 const [admissions, setAdmissions] = useState<any[]>([]);
 const [isLoading, setIsLoading] = useState(true);
 const [searchQuery, setSearchQuery] = useState("");
 const router = useRouter();

 useEffect(() => {
 fetchAdmissions();
 }, []);

 const fetchAdmissions = async () => {
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
 .from("admissions")
 .select("*, patients(id, first_name, last_name, file_number, status), rooms(room_number, type)")
 .eq("hospital_id", profile.hospital_id)
 .order("admission_date", { ascending: false });

 setAdmissions(data || []);
 setIsLoading(false);
 };

 const filtered = admissions.filter((adm) => {
 const query = searchQuery.toLowerCase();
 return (
 `${adm.patients?.first_name || ""} ${adm.patients?.last_name || ""}`.toLowerCase().includes(query) ||
 adm.patients?.file_number?.toLowerCase().includes(query) ||
 adm.status?.toLowerCase().includes(query)
 );
 });

 return (
 <div className="space-y-8 pb-20">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admissions en cours</h1>
 <p className="text-slate-600 font-medium">Suivez les admissions enregistrees dans l&apos;etablissement.</p>
 </div>
 <button
 onClick={() => router.push("/dashboard/hospitalization")}
 className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200"
 >
 <Plus className="w-4 h-4" /> Nouvelle Admission
 </button>
 </div>

 <div className="relative">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
 <input
 type="text"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="Rechercher par patient, dossier ou statut..."
 className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/10"
 />
 </div>

 {isLoading ? (
 <div className="text-center py-20 text-slate-600 font-bold uppercase text-[10px] tracking-widest">Chargement des admissions...</div>
 ) : filtered.length > 0 ? (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {filtered.map((adm) => (
 <motion.div
 key={adm.id}
 whileHover={{ y: -5 }}
 className="p-6 bg-white rounded-[32px] shadow-sm"
 >
 <div className="flex justify-between items-start mb-6">
 <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
 <Users className="w-6 h-6" />
 </div>
 <span className={cn(
 "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
 adm.status === "ADMITTED" ? "bg-blue-100 text-blue-600" :
 adm.status === "DISCHARGED" ? "bg-emerald-100 text-emerald-600" :
 "bg-amber-100 text-amber-600"
 )}>
 {adm.status}
 </span>
 </div>
 <h3 className="font-black text-lg mb-1">{adm.patients?.first_name} {adm.patients?.last_name}</h3>
 <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-4">{adm.patients?.file_number}</p>
 <div className="space-y-2 text-xs text-slate-600 font-bold mb-6">
 <div className="flex items-center gap-2">
 <Clock className="w-3.5 h-3.5" /> Admission le {new Date(adm.admission_date).toLocaleString("fr-FR")}
 </div>
 <div className="flex items-center gap-2">
 <FileText className="w-3.5 h-3.5" /> Chambre {adm.rooms?.room_number || "Non assignee"} {adm.rooms?.type ? `(${adm.rooms.type})` : ""}
 </div>
 </div>
 <div className="flex gap-2">
 <button
 onClick={() => router.push(`/dashboard/patients/${adm.patients?.id}`)}
 className="flex-1 py-3 bg-white border-blue-100 shadow-sm rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-blue-600 hover:text-white transition-all"
 >
 Details
 </button>
 <button
 onClick={() => router.push(`/dashboard/patients/${adm.patients?.id}`)}
 className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
 >
 <ArrowRightCircle className="w-4 h-4" />
 </button>
 </div>
 </motion.div>
 ))}
 </div>
 ) : (
 <div className="text-center py-20 border border-dashed border-blue-100 rounded-[32px] text-slate-600 font-bold uppercase text-[10px] tracking-widest">
 Aucune admission enregistree
 </div>
 )}
 </div>
 );
}
