"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
 UserRound, 
 Search, 
 Plus, 
 Mail, 
 Phone, 
 Stethoscope,
 Calendar,
 Award,
 MoreVertical,
 Filter,
 ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import StaffForm from "./StaffForm";
import PerformanceTable from "./PerformanceTable";
import { supabase } from "@/lib/supabase";

const statusColors = {
 AVAILABLE: "bg-emerald-500",
 BUSY: "bg-amber-500",
 OFFLINE: "bg-slate-300",
};

export default function StaffPage() {
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [staffMembers, setStaffMembers] = useState<any[]>([]);
 const [isLoading, setIsLoading] = useState(true);
 const [searchQuery, setSearchQuery] = useState("");
 const [activeTab, setActiveTab] = useState("list"); // list, performance

 useEffect(() => {
 fetchStaff();
 }, []);

 const fetchStaff = async () => {
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) return;

 const { data: profile } = await supabase.from('profiles').select('hospital_id').eq('id', user.id).single();
 if (!profile?.hospital_id) return;

 const { data } = await supabase
 .from("profiles")
 .select("*")
 .eq("hospital_id", profile.hospital_id)
 .order("last_name", { ascending: true });

 if (data) setStaffMembers(data);
 setIsLoading(false);
 };

 const filteredStaff = staffMembers.filter(s => 
 `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
 s.role?.toLowerCase().includes(searchQuery.toLowerCase())
 );

 return (
 <div className="space-y-8 pb-20">
 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestion du Personnel</h1>
 <p className="text-slate-600 font-medium">Gérez votre équipe médicale et suivez leurs performances.</p>
 </div>
 <button 
 onClick={() => setIsModalOpen(true)}
 className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 "
 >
 <Plus className="w-4 h-4" /> Ajouter un Membre
 </button>
 </div>

 {/* Tabs */}
 <div className="flex gap-4 border-b border-blue-50 ">
 <button 
 onClick={() => setActiveTab("list")}
 className={cn(
 "pb-4 px-2 text-[10px] font-black uppercase tracking-widest transition-all relative",
 activeTab === "list" ? "text-blue-600" : "text-slate-600 hover:text-slate-600"
 )}
 >
 Liste du Personnel
 {activeTab === "list" && <motion.div layoutId="staffTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
 </button>
 <button 
 onClick={() => setActiveTab("performance")}
 className={cn(
 "pb-4 px-2 text-[10px] font-black uppercase tracking-widest transition-all relative",
 activeTab === "performance" ? "text-blue-600" : "text-slate-600 hover:text-slate-600"
 )}
 >
 Tableau de Performance
 {activeTab === "performance" && <motion.div layoutId="staffTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
 </button>
 </div>

 <AnimatePresence mode="wait">
 {activeTab === "list" ? (
 <motion.div
 key="list"
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 className="space-y-8"
 >
 {/* Filters & Search */}
 <div className="flex flex-col md:flex-row gap-4">
 <div className="relative flex-1">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
 <input 
 type="text" 
 placeholder="Rechercher par nom, rôle..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full pl-10 pr-4 py-3 bg-white  rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
 />
 </div>
 <div className="flex gap-2">
 {["Tous", "Médecins", "Infirmiers"].map((tab) => (
 <button key={tab} className="px-4 py-2 bg-white  rounded-xl text-xs font-bold hover:bg-white border-blue-100 shadow-sm transition-all first:bg-blue-600 first:text-white first:border-blue-600">
 {tab}
 </button>
 ))}
 </div>
 </div>

 {/* Staff Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {isLoading ? (
 <div className="col-span-full text-center py-20 text-slate-600 font-bold uppercase text-[10px] tracking-widest">Initialisation...</div>
 ) : filteredStaff.length > 0 ? filteredStaff.map((staff, index) => (
 <motion.div
 key={staff.id}
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ delay: index * 0.1 }}
 className="bg-white rounded-[32px]  shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden"
 >
 <div className="p-8">
 <div className="flex justify-between items-start mb-6">
 <div className="relative">
 <div className="w-16 h-16 rounded-[20px] bg-blue-50 flex items-center justify-center font-black text-xl text-blue-600 shadow-inner uppercase">
 {staff.first_name?.[0]}{staff.last_name?.[0]}
 </div>
 <div className={cn(
 "absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full shadow-sm",
 statusColors[staff.status as keyof typeof statusColors] || statusColors.OFFLINE
 )} />
 </div>
 <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
 <MoreVertical className="w-5 h-5" />
 </button>
 </div>

 <div>
 <h3 className="font-black text-lg tracking-tight">{staff.first_name} {staff.last_name}</h3>
 <div className="flex items-center gap-1.5 text-blue-600 text-[10px] font-black uppercase tracking-widest mt-1">
 <Stethoscope className="w-3 h-3" />
 {staff.role === 'DOCTOR' ? 'Médecin' : staff.role === 'NURSE' ? 'Infirmier(e)' : staff.role === 'ADMIN' ? 'Administrateur' : 'Personnel'}
 </div>
 </div>

 <div className="mt-8 space-y-3">
 <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
 <Mail className="w-4 h-4 opacity-40" /> {staff.email || "Pas d'email"}
 </div>
 <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
 <Award className="w-4 h-4 opacity-40" />{" "}
 {staff.specialization || staff.specialty || "Praticien"}
 </div>
 </div>
 </div>

 <div className="px-8 py-4 bg-white border-blue-100 shadow-sm /50 border-t border-blue-50 flex justify-between items-center">
 <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:underline">
 <Calendar className="w-3.5 h-3.5" /> Planning
 </button>
 <button className="p-2 text-slate-300 hover:text-blue-600 transition-colors">
 <ChevronRight className="w-5 h-5" />
 </button>
 </div>
 </motion.div>
 )) : (
 <div className="col-span-full text-center py-20 text-slate-600 font-bold uppercase text-[10px] tracking-widest">Aucun membre trouvé</div>
 )}
 </div>
 </motion.div>
 ) : (
 <motion.div
 key="performance"
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 >
 <PerformanceTable />
 </motion.div>
 )}
 </AnimatePresence>

 <Modal 
 isOpen={isModalOpen} 
 onClose={() => setIsModalOpen(false)} 
 title="Ajouter au Personnel"
 >
 <StaffForm 
 onSuccess={() => {
 setIsModalOpen(false);
 fetchStaff();
 }} 
 onCancel={() => setIsModalOpen(false)} 
 />
 </Modal>
 </div>
 );
}
