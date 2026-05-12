"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
 Bed, 
 Search, 
 Plus, 
 User, 
 Clock, 
 LogOut,
 ChevronRight,
 ShieldAlert,
 Home,
 Users,
 LayoutGrid,
 Map as MapIcon,
 Activity,
 Heart
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import AdmissionForm from "./AdmissionForm";
import { supabase } from "@/lib/supabase";

export default function HospitalizationPage() {
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [rooms, setRooms] = useState<any[]>([]);
 const [isLoading, setIsLoading] = useState(true);
 const [viewMode, setViewMode] = useState("grid"); // grid, stats
 const [stats, setStats] = useState({
 totalBeds: 0,
 occupied: 0,
 free: 0,
 occupancyRate: 0
 });

 useEffect(() => {
 fetchRooms();
 }, []);

 const fetchRooms = async () => {
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) return;

 const { data: profile } = await supabase.from('profiles').select('hospital_id').eq('id', user.id).single();
 if (!profile?.hospital_id) return;

 const { data } = await supabase
 .from("rooms")
 .select("*, admissions(patients(first_name, last_name), status)")
 .eq("hospital_id", profile.hospital_id)
 .order("room_number", { ascending: true });

 if (data) {
 const processedRooms = data.map(room => {
 const activeAdmission = room.admissions?.find((a: any) => a.status === 'ADMITTED');
 return {
 ...room,
 status: activeAdmission ? 'OCCUPIED' : 'FREE',
 patient: activeAdmission ? `${activeAdmission.patients?.first_name} ${activeAdmission.patients?.last_name}` : null
 };
 });
 setRooms(processedRooms);
 
 const total = processedRooms.length;
 const occupied = processedRooms.filter(r => r.status === 'OCCUPIED').length;
 setStats({
 totalBeds: total,
 occupied,
 free: total - occupied,
 occupancyRate: total > 0 ? Math.round((occupied / total) * 100) : 0
 });
 }
 setIsLoading(false);
 };

 return (
 <div className="space-y-8 pb-20">
 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <h1 className="text-3xl font-black text-slate-900 tracking-tight">Hospitalisation</h1>
 <p className="text-slate-600 font-medium">Gérez l&apos;occupation des lits et le suivi patient en temps réel.</p>
 </div>
 <div className="flex gap-3">
 <div className="bg-blue-50/50 p-1 rounded-xl flex gap-1">
 <button 
 onClick={() => setViewMode("grid")}
 className={cn("p-2 rounded-lg transition-all", viewMode === "grid" ? "bg-white shadow-sm text-blue-600" : "text-slate-600")}
 >
 <LayoutGrid className="w-4 h-4" />
 </button>
 <button 
 onClick={() => setViewMode("stats")}
 className={cn("p-2 rounded-lg transition-all", viewMode === "stats" ? "bg-white shadow-sm text-blue-600" : "text-slate-600")}
 >
 <Activity className="w-4 h-4" />
 </button>
 </div>
 <button 
 onClick={() => setIsModalOpen(true)}
 className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 "
 >
 <Plus className="w-4 h-4" /> Admission
 </button>
 </div>
 </div>

 {/* Stats Quick View */}
 <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
 <div className="dash-card !p-6">
 <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3">Taux d&apos;occupation</p>
 <div className="flex items-end gap-2">
 <h3 className="text-2xl font-black">{stats.occupancyRate}%</h3>
 <div className="w-20 h-1.5 bg-blue-50/50 rounded-full mb-2 overflow-hidden">
 <div className="h-full bg-blue-600" style={{ width: `${stats.occupancyRate}%` }} />
 </div>
 </div>
 </div>
 <div className="dash-card !p-6">
 <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3">Lits Occupés</p>
 <div className="flex items-end gap-2">
 <h3 className="text-2xl font-black text-blue-600">{stats.occupied}</h3>
 <span className="text-[10px] font-bold text-slate-600 mb-1">Actifs</span>
 </div>
 </div>
 <div className="dash-card !p-6">
 <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-3">Lits Disponibles</p>
 <div className="flex items-end gap-2">
 <h3 className="text-2xl font-black text-emerald-600">{stats.free}</h3>
 <span className="text-[10px] font-bold text-slate-600 mb-1">Libres</span>
 </div>
 </div>
 <div className="bg-blue-600 text-white p-6 rounded-[32px] border border-slate-800 shadow-sm relative overflow-hidden">
 <div className="absolute top-0 right-0 p-6 opacity-10"><ShieldAlert className="w-8 h-8" /></div>
 <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">Capacité Totale</p>
 <div className="flex items-end gap-2">
 <h3 className="text-2xl font-black">{stats.totalBeds}</h3>
 <span className="text-[10px] font-bold text-slate-600 mb-1">Lits</span>
 </div>
 </div>
 </div>

 {/* Room Grid */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
 {isLoading ? (
 <div className="col-span-full text-center py-20 text-slate-600 font-bold uppercase text-[10px] tracking-widest">Cartographie des lits...</div>
 ) : rooms.length > 0 ? rooms.map((room, index) => (
 <motion.div
 key={room.id}
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ delay: index * 0.05 }}
 className={cn(
 "p-8 rounded-[40px] border transition-all cursor-pointer relative overflow-hidden group",
 room.status === 'OCCUPIED' 
 ? "bg-white border-slate-200 shadow-sm" 
 : "bg-white border-blue-100 shadow-sm /40 border-dashed border-slate-200 hover:border-blue-300 transition-all"
 )}
 >
 <div className="flex justify-between items-start mb-8 relative z-10">
 <div className={cn(
 "w-12 h-12 rounded-[20px] flex items-center justify-center font-black",
 room.status === 'OCCUPIED' ? "bg-blue-600 text-white shadow-xl shadow-blue-200 " : "bg-white text-slate-300 border border-blue-50 "
 )}>
 <Bed className="w-6 h-6" />
 </div>
 <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest px-3 py-1 bg-white/50 rounded-full border border-blue-50 ">{room.type}</span>
 </div>

 <div className="relative z-10">
 <h3 className="text-2xl font-black text-slate-900 tracking-tight">Chambre {room.room_number}</h3>
 {room.status === 'OCCUPIED' ? (
 <div className="mt-6 space-y-4">
 <div className="flex items-center gap-3">
 <div className="w-8 h-8 rounded-full bg-blue-50/50 flex items-center justify-center text-blue-600">
 <User className="w-4 h-4" />
 </div>
 <div>
 <p className="text-sm font-black truncate">{room.patient}</p>
 <div className="flex items-center gap-2 mt-0.5">
 <Activity className="w-3 h-3 text-emerald-500" />
 <span className="text-[10px] font-bold text-slate-600 uppercase">Stable</span>
 </div>
 </div>
 </div>
 <button className="w-full mt-6 py-3 bg-white border-blue-100 shadow-sm border border-blue-50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all flex items-center justify-center gap-2">
 <LogOut className="w-3.5 h-3.5" /> Libérer
 </button>
 </div>
 ) : (
 <div className="mt-6">
 <p className="text-xs text-slate-600 font-bold uppercase tracking-widest">Disponible</p>
 <div className="h-16 flex items-end justify-center opacity-5 group-hover:opacity-10 transition-opacity">
 <Home className="w-20 h-20" />
 </div>
 </div>
 )}
 </div>

 {room.status === 'OCCUPIED' && (
 <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-50/50 rounded-full blur-3xl" />
 )}
 </motion.div>
 )) : (
 <div className="col-span-full text-center py-20 text-slate-600 font-bold uppercase text-[10px] tracking-widest">Aucune chambre configurée</div>
 )}
 </div>

 {/* Admission Modal */}
 <Modal 
 isOpen={isModalOpen} 
 onClose={() => setIsModalOpen(false)} 
 title="Admission Patient"
 >
 <AdmissionForm 
 onSuccess={() => {
 setIsModalOpen(false);
 fetchRooms();
 }} 
 onCancel={() => setIsModalOpen(false)} 
 />
 </Modal>
 </div>
 );
}
