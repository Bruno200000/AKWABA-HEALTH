"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
 Beaker, 
 Search, 
 Plus, 
 FileText, 
 Clock, 
 CheckCircle2, 
 AlertCircle,
 FlaskConical,
 ChevronRight,
 Filter,
 Activity,
 QrCode
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import LabTestForm from "./LabTestForm";
import ResultEntry from "./ResultEntry";
import { supabase } from "@/lib/supabase";

const statusStyles = {
 ORDERED: "bg-white border-blue-100 shadow-sm text-slate-600 border-blue-50",
 IN_PROGRESS: "bg-blue-50 text-blue-600 border-blue-100",
 COMPLETED: "bg-emerald-50 text-emerald-600 border-emerald-100",
};

export default function LaboratoryPage() {
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [labTests, setLabTests] = useState<any[]>([]);
 const [isLoading, setIsLoading] = useState(true);
 const [searchQuery, setSearchQuery] = useState("");
 const [selectedTest, setSelectedTest] = useState<any>(null);
 const [activeView, setActiveView] = useState("list"); // list, entry
 const [stats, setStats] = useState({
 pending: 0,
 processing: 0,
 completedToday: 0
 });

 useEffect(() => {
 fetchLabTests();
 }, []);

 const fetchLabTests = async () => {
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) return;

 const { data: profile } = await supabase.from('profiles').select('hospital_id').eq('id', user.id).single();
 if (!profile?.hospital_id) return;

 const { data } = await supabase
 .from("lab_tests")
 .select("*, patients(first_name, last_name)")
 .eq("hospital_id", profile.hospital_id)
 .order("created_at", { ascending: false });

 if (data) {
 setLabTests(data);
 setStats({
 pending: data.filter(t => t.status === 'ORDERED').length,
 processing: data.filter(t => t.status === 'IN_PROGRESS').length,
 completedToday: data.filter(t => t.status === 'COMPLETED' && new Date(t.created_at).toDateString() === new Date().toDateString()).length
 });
 }
 setIsLoading(false);
 };

 const filteredTests = labTests.filter(t => 
 `${t.patients?.first_name} ${t.patients?.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
 t.test_type?.toLowerCase().includes(searchQuery.toLowerCase())
 );

 return (
 <div className="space-y-8 pb-20">
 {activeView === "list" ? (
 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <h1 className="text-3xl font-black text-slate-900 tracking-tight">Laboratoire</h1>
 <p className="text-slate-600 font-medium">Suivez les prélèvements et gérez les résultats d&apos;analyses.</p>
 </div>
 <button 
 onClick={() => setIsModalOpen(true)}
 className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 "
 >
 <Plus className="w-4 h-4" /> Nouvelle Analyse
 </button>
 </div>

 {/* Stats Grid */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 <div className="dash-card !p-6">
 <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform"><Clock className="w-12 h-12" /></div>
 <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3">En Attente</p>
 <div className="flex items-end gap-2">
 <h3 className="text-2xl font-black">{stats.pending}</h3>
 <span className="text-[10px] font-bold text-slate-600 mb-1">Prélèvements</span>
 </div>
 </div>
 <div className="dash-card !p-6">
 <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform text-blue-500"><FlaskConical className="w-12 h-12" /></div>
 <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3">En Cours</p>
 <div className="flex items-end gap-2">
 <h3 className="text-2xl font-black">{stats.processing}</h3>
 <span className="text-[10px] font-bold text-slate-600 mb-1">Analyses</span>
 </div>
 </div>
 <div className="dash-card !p-6 !bg-emerald-50/50 !border-emerald-100">
 <div className="absolute top-0 right-0 p-6 opacity-10"><CheckCircle2 className="w-12 h-12 text-emerald-600" /></div>
 <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-3">Terminés Aujourd&apos;hui</p>
 <div className="flex items-end gap-2">
 <h3 className="text-2xl font-black text-emerald-600">{stats.completedToday}</h3>
 <span className="text-[10px] font-bold text-emerald-400 mb-1">Résultats</span>
 </div>
 </div>
 </div>

 {/* Table Container */}
 <div className="space-y-6">
 <div className="flex gap-4">
 <div className="relative flex-1">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
 <input 
 type="text" 
 placeholder="Rechercher par patient ou test..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full pl-10 pr-4 py-3 bg-white  rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
 />
 </div>
 <button className="flex items-center gap-2 px-4 py-3 bg-white  rounded-2xl text-sm font-bold hover:bg-white border-blue-100 shadow-sm transition-all">
 <Filter className="w-4 h-4" />
 </button>
 </div>

 <div className="dash-table-container">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="dash-table-header">
 <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest">Patient</th>
 <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest">Type d&apos;examen</th>
 <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest">Prescrit</th>
 <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest">Statut</th>
 <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100 ">
 {isLoading ? (
 <tr><td colSpan={5} className="text-center py-20 text-slate-600 font-bold uppercase text-[10px] tracking-widest">Initialisation du labo...</td></tr>
 ) : filteredTests.length > 0 ? filteredTests.map((test, index) => (
 <tr key={test.id} className="hover:bg-white border-blue-100 shadow-sm/50 transition-colors cursor-pointer group">
 <td className="px-8 py-6">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
 {test.patients?.first_name?.[0]}{test.patients?.last_name?.[0]}
 </div>
 <div>
 <p className="font-black text-sm">{test.patients?.first_name} {test.patients?.last_name}</p>
 <p className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">ID: {test.id.slice(0, 6)}</p>
 </div>
 </div>
 </td>
 <td className="px-8 py-6">
 <div className="flex items-center gap-2">
 <Activity className="w-4 h-4 text-blue-500" />
 <span className="font-black text-xs text-slate-700 ">{test.test_type}</span>
 </div>
 </td>
 <td className="px-8 py-6 text-xs font-bold text-slate-600">
 {new Date(test.created_at).toLocaleDateString()}
 </td>
 <td className="px-8 py-6">
 <span className={cn(
 "px-3 py-1 rounded-xl text-[9px] font-black border uppercase tracking-widest",
 statusStyles[test.status as keyof typeof statusStyles]
 )}>
 {test.status === 'ORDERED' ? 'Attente' : test.status === 'IN_PROGRESS' ? 'Encours' : 'Prêt'}
 </span>
 </td>
 <td className="px-8 py-6">
 <div className="flex items-center gap-3">
 <button onClick={() => { setSelectedTest(test); setActiveView("entry"); }} className="px-4 py-1.5 bg-blue-600 text-white text-[9px] font-black uppercase rounded-xl hover:bg-blue-600 transition-all">Saisir</button>
 <button className="p-2 text-slate-300 hover:text-blue-600 transition-colors"><QrCode className="w-4 h-4" /></button>
 </div>
 </td>
 </tr>
 )) : (
 <tr><td colSpan={5} className="text-center py-20 text-slate-600 font-bold uppercase text-[10px] tracking-widest">Aucun test à traiter</td></tr>
 )}
 </tbody>
 </table>
 </div>
 </div>
 </motion.div>
 ) : (
 <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
 <ResultEntry 
 test={selectedTest} 
 onCancel={() => setActiveView("list")} 
 onSuccess={() => {
 setActiveView("list");
 fetchLabTests();
 }} 
 />
 </motion.div>
 )}

 <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Prescrire une Analyse">
 <LabTestForm onSuccess={() => { setIsModalOpen(false); fetchLabTests(); }} onCancel={() => setIsModalOpen(false)} />
 </Modal>
 </div>
 );
}
