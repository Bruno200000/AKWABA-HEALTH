"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
 Users, 
 Search, 
 Filter, 
 Plus, 
 MoreHorizontal,
 User,
 Activity,
 FileText,
 Phone,
 Droplets
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import PatientForm from "./PatientForm";

import { DEMO_DASHBOARD, isDemoSession } from "@/lib/demo-mode";
import { supabase } from "@/lib/supabase";

const statusStyles = {
 STABLE: "bg-emerald-50 text-emerald-700 border-emerald-100",
 CRITICAL: "bg-red-50 text-red-700 border-red-100",
 OBSERVATION: "bg-amber-50 text-amber-700 border-amber-100",
};

const statusLabels = {
 STABLE: "Stable",
 CRITICAL: "Critique",
 OBSERVATION: "En observation",
};

export default function PatientsPage() {
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [patients, setPatients] = useState<any[]>([]);
 const [searchQuery, setSearchQuery] = useState("");
 const [isLoading, setIsLoading] = useState(true);
 const router = useRouter();
 const [stats, setStats] = useState({
 total: 0,
 newThisMonth: 0,
 critical: 0
 });

 useEffect(() => {
 fetchPatients();
 }, []);

 const fetchPatients = async () => {
 try {
 if (isDemoSession()) {
 const data = DEMO_DASHBOARD.mockPatients;
 setPatients(data);
 const now = new Date();
 const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
 setStats({
 total: data.length,
 newThisMonth: data.filter((p) => new Date(p.created_at) >= firstDayOfMonth).length,
 critical: data.filter((p) => p.status === "CRITICAL").length,
 });
 return;
 }

 const { data: { user } } = await supabase.auth.getUser();
 if (!user) return;

 const { data: profile } = await supabase.from("profiles").select("hospital_id").eq("id", user.id).maybeSingle();
 if (!profile?.hospital_id) return;

 const { data } = await supabase
 .from("patients")
 .select("*")
 .eq("hospital_id", profile.hospital_id)
 .order("created_at", { ascending: false });

 if (data) {
 setPatients(data);
 const now = new Date();
 const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

 setStats({
 total: data.length,
 newThisMonth: data.filter((p) => new Date(p.created_at) >= firstDayOfMonth).length,
 critical: data.filter((p) => p.status === "CRITICAL").length,
 });
 }
 } finally {
 setIsLoading(false);
 }
 };

 const filteredPatients = patients.filter(p => 
 `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
 p.file_number?.toLowerCase().includes(searchQuery.toLowerCase())
 );
 return (
 <div className="space-y-6">
 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <h1 className="text-2xl font-bold text-slate-900 ">Annuaire des Patients</h1>
 <p className="text-slate-600 font-bold">Gérez les dossiers médicaux et le suivi de vos patients.</p>
 </div>
 <button 
 onClick={() => setIsModalOpen(true)}
 className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 "
 >
 <Plus className="w-5 h-5" /> Ajouter un Patient
 </button>
 </div>

 {/* Stats Quick View */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 <div className="dash-card !p-4 flex items-center gap-4">
 <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
 <Users className="w-6 h-6" />
 </div>
 <div>
 <p className="text-xs text-slate-600 font-bold uppercase tracking-wider">Total Patients</p>
 <h3 className="text-xl font-bold">{stats.total.toLocaleString()}</h3>
 </div>
 </div>
 <div className="dash-card !p-4 flex items-center gap-4">
 <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
 <Activity className="text-emerald-600 w-6 h-6" />
 </div>
 <div>
 <p className="text-xs text-slate-600 font-bold uppercase tracking-wider">Nouveaux (Mois)</p>
 <h3 className="text-xl font-bold">+{stats.newThisMonth}</h3>
 </div>
 </div>
 <div className="dash-card !p-4 flex items-center gap-4">
 <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
 <Droplets className="w-6 h-6" />
 </div>
 <div>
 <p className="text-xs text-slate-600 font-bold uppercase tracking-wider">Critiques</p>
 <h3 className="text-xl font-bold text-red-600">{stats.critical}</h3>
 </div>
 </div>
 </div>

 {/* Filters & Search */}
 <div className="dash-card !p-4 flex flex-col md:flex-row gap-4 items-center">
 <div className="relative flex-1 w-full">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
 <input 
 type="text" 
 placeholder="Rechercher par nom, ID ou téléphone..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full pl-10 pr-4 py-2 bg-white border-blue-100 shadow-sm border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
 />
 </div>
 <div className="flex gap-2 w-full md:w-auto">
 <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium hover:bg-white border-blue-100 shadow-sm transition-all">
 <Filter className="w-4 h-4" /> Filtres
 </button>
 </div>
 </div>

 {/* Patients Table */}
 <div className="dash-table-container">
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="dash-table-header">
 <th className="px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Patient</th>
 <th className="px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Âge / Sexe</th>
 <th className="px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Groupe Sanguin</th>
 <th className="px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Dernière Visite</th>
 <th className="px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Statut</th>
 <th className="px-6 py-4 text-xs font-black text-slate-700 uppercase tracking-wider">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100 ">
 {isLoading ? (
 <tr><td colSpan={6} className="text-center py-10 text-slate-600">Chargement des patients...</td></tr>
 ) : filteredPatients.length > 0 ? filteredPatients.map((patient, index) => (
 <motion.tr 
 key={patient.id}
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: index * 0.05 }}
 onClick={() => router.push(`/dashboard/patients/${patient.id}`)}
 className="hover:bg-white border-blue-100 shadow-sm/50 transition-colors cursor-pointer"
 >
 <td className="px-6 py-4">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
 <User className="w-5 h-5 text-slate-600" />
 </div>
 <div>
 <p className="font-bold text-sm">{patient.first_name} {patient.last_name}</p>
 <p className="text-xs text-slate-600">ID: {patient.file_number}</p>
 </div>
 </div>
 </td>
 <td className="px-6 py-4">
 <span className="text-sm font-medium">
 {patient.birth_date ? `${new Date().getFullYear() - new Date(patient.birth_date).getFullYear()} ans` : "N/A"}, {patient.gender}
 </span>
 </td>
 <td className="px-6 py-4">
 <div className="flex items-center gap-1.5">
 <Droplets className="w-4 h-4 text-red-500" />
 <span className="text-sm font-bold">{patient.blood_group || "?"}</span>
 </div>
 </td>
 <td className="px-6 py-4">
 <span className="text-sm text-slate-600 ">
 {patient.updated_at ? new Date(patient.updated_at).toLocaleDateString() : "Jamais"}
 </span>
 </td>
 <td className="px-6 py-4">
 <span className={cn(
 "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase",
 statusStyles[(patient.status || "STABLE") as keyof typeof statusStyles]
 )}>
 {statusLabels[(patient.status || "STABLE") as keyof typeof statusLabels]}
 </span>
 </td>
 <td className="px-6 py-4">
 <div className="flex items-center gap-2">
 <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Voir Dossier">
 <FileText className="w-4 h-4" />
 </button>
 <button className="p-2 text-slate-600 hover:text-slate-600 transition-colors">
 <MoreHorizontal className="w-5 h-5" />
 </button>
 </div>
 </td>
 </motion.tr>
 )) : (
 <tr><td colSpan={6} className="text-center py-10 text-slate-600">Aucun patient trouvé</td></tr>
 )}
 </tbody>
 </table>
 </div>
 </div>

 {/* Patient Creation Modal */}
 <Modal 
 isOpen={isModalOpen} 
 onClose={() => setIsModalOpen(false)} 
 title="Ajouter un nouveau patient"
 >
 <PatientForm 
 onSuccess={() => {
 setIsModalOpen(false);
 fetchPatients();
 }} 
 onCancel={() => setIsModalOpen(false)} 
 />
 </Modal>
 </div>
 );
}
