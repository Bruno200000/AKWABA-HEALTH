"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronRight, FileText, Filter, Lock, Search, ShieldCheck } from "lucide-react";
import ExportActions from "@/components/ExportActions";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export default function PatientRecordsPage() {
 const [records, setRecords] = useState<any[]>([]);
 const [isLoading, setIsLoading] = useState(true);
 const [searchQuery, setSearchQuery] = useState("");
 const router = useRouter();

 useEffect(() => {
 fetchRecords();
 }, []);

 const fetchRecords = async () => {
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

 const [{ data: patients }, { data: consultations }, { data: labs }, { data: invoices }, { data: admissions }] = await Promise.all([
 supabase.from("patients").select("id, file_number, first_name, last_name, status, updated_at, created_at").eq("hospital_id", profile.hospital_id).order("updated_at", { ascending: false }),
 supabase.from("consultations").select("patient_id, created_at").eq("hospital_id", profile.hospital_id),
 supabase.from("lab_tests").select("patient_id, created_at, completed_at").eq("hospital_id", profile.hospital_id),
 supabase.from("invoices").select("patient_id, created_at").eq("hospital_id", profile.hospital_id),
 supabase.from("admissions").select("patient_id, admission_date, discharge_date").eq("hospital_id", profile.hospital_id),
 ]);

 const activityByPatient = new Map<string, { docs: number; lastUpdate: string }>();
 const register = (patientId: string | null, date?: string | null) => {
 if (!patientId) return;
 const current = activityByPatient.get(patientId) || { docs: 0, lastUpdate: "" };
 current.docs += 1;
 if (date && (!current.lastUpdate || new Date(date) > new Date(current.lastUpdate))) {
 current.lastUpdate = date;
 }
 activityByPatient.set(patientId, current);
 };

 consultations?.forEach((item) => register(item.patient_id, item.created_at));
 labs?.forEach((item) => register(item.patient_id, item.completed_at || item.created_at));
 invoices?.forEach((item) => register(item.patient_id, item.created_at));
 admissions?.forEach((item) => register(item.patient_id, item.discharge_date || item.admission_date));

 setRecords((patients || []).map((patient) => {
 const activity = activityByPatient.get(patient.id);
 return {
 ...patient,
 docs: activity?.docs || 0,
 lastUpdate: activity?.lastUpdate || patient.updated_at || patient.created_at,
 safety: patient.status === "CRITICAL" ? "Critical" : patient.status === "OBSERVATION" ? "Observation" : "Stable",
 };
 }));
 setIsLoading(false);
 };

 const filtered = records.filter((rec) => {
 const query = searchQuery.toLowerCase();
 return (
 `${rec.first_name} ${rec.last_name}`.toLowerCase().includes(query) ||
 rec.file_number?.toLowerCase().includes(query)
 );
 });

 return (
 <div className="space-y-8">
 <div className="flex justify-between items-center">
 <div>
 <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dossiers Medicaux Digitaux</h1>
 <p className="text-slate-600 font-medium">Dossiers generes a partir des patients et actes enregistres en base.</p>
 </div>
 <div className="flex flex-wrap items-center gap-2">
 <ExportActions
 title="Dossiers medicaux digitaux"
 rows={filtered}
 columns={[
 { header: "Dossier", accessor: (rec) => rec.file_number || "" },
 { header: "Patient", accessor: (rec) => `${rec.first_name || ""} ${rec.last_name || ""}`.trim() },
 { header: "Documents", accessor: (rec) => rec.docs || 0 },
 { header: "Derniere mise a jour", accessor: (rec) => new Date(rec.lastUpdate).toLocaleDateString("fr-FR") },
 { header: "Securite", accessor: (rec) => rec.safety || "" },
 ]}
 />
 <div className="flex items-center gap-3 px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">
 <Lock className="w-4 h-4 text-blue-200" /> Donnees Supabase
 </div>
 </div>
 </div>

 <div className="flex gap-4">
 <div className="relative flex-1">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
 <input
 type="text"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="Rechercher un dossier par nom ou ID..."
 className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/10"
 />
 </div>
 <button className="px-5 bg-white rounded-2xl hover:bg-white border-blue-100 shadow-sm transition-all">
 <Filter className="w-5 h-5 text-slate-600" />
 </button>
 </div>

 {isLoading ? (
 <div className="text-center py-20 text-slate-600 font-bold uppercase text-[10px] tracking-widest">Chargement des dossiers...</div>
 ) : filtered.length > 0 ? (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {filtered.map((rec) => (
 <motion.div
 key={rec.id}
 whileHover={{ y: -5 }}
 onClick={() => router.push(`/dashboard/patients/${rec.id}`)}
 className="p-8 bg-white rounded-[40px] shadow-sm relative group overflow-hidden cursor-pointer"
 >
 <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />

 <div className="flex justify-between items-start mb-8 relative z-10">
 <div className="w-14 h-14 bg-blue-600 rounded-[20px] flex items-center justify-center text-white">
 <FileText className="w-7 h-7" />
 </div>
 <ShieldCheck className={cn("w-6 h-6", rec.safety === "Critical" ? "text-red-500" : rec.safety === "Observation" ? "text-amber-500" : "text-emerald-500")} />
 </div>

 <h3 className="font-black text-xl mb-1 relative z-10">{rec.first_name} {rec.last_name}</h3>
 <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-8 relative z-10">Dossier : {rec.file_number}</p>

 <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
 <div className="p-4 bg-white border-blue-100 shadow-sm /50 rounded-2xl">
 <p className="text-[10px] font-black text-slate-600 uppercase mb-1">Documents</p>
 <p className="font-black text-lg">{rec.docs}</p>
 </div>
 <div className="p-4 bg-white border-blue-100 shadow-sm /50 rounded-2xl">
 <p className="text-[10px] font-black text-slate-600 uppercase mb-1">Mise a jour</p>
 <p className="font-black text-sm">{new Date(rec.lastUpdate).toLocaleDateString("fr-FR")}</p>
 </div>
 </div>

 <button className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white border-blue-100 shadow-sm transition-all flex items-center justify-center gap-2 relative z-10">
 Ouvrir le Dossier <ChevronRight className="w-4 h-4" />
 </button>
 </motion.div>
 ))}
 </div>
 ) : (
 <div className="text-center py-20 border border-dashed border-blue-100 rounded-[32px] text-slate-600 font-bold uppercase text-[10px] tracking-widest">
 Aucun dossier enregistre
 </div>
 )}
 </div>
 );
}
