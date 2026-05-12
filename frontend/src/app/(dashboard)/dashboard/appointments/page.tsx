"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
 Calendar as CalendarIcon, 
 Search, 
 Filter, 
 Plus, 
 Clock,
 User,
 Users,
 Stethoscope,
 ChevronRight,
 ChevronLeft,
 MoreVertical,
 Activity,
 CheckCircle2,
 XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import AppointmentForm from "./AppointmentForm";
import { supabase } from "@/lib/supabase";
import { getAppointmentStart } from "@/lib/appointment-utils";

const statusStyles: Record<string, string> = {
 CONFIRMED: "bg-blue-50 text-blue-600 border-blue-100",
 PENDING: "bg-amber-50 text-amber-600 border-amber-100",
 CANCELLED: "bg-red-50 text-red-600 border-red-100",
 COMPLETED: "bg-emerald-50 text-emerald-600 border-emerald-100",
 IN_PROGRESS: "bg-indigo-50 text-indigo-700 border-indigo-100",
};

export default function AppointmentsPage() {
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [appointments, setAppointments] = useState<any[]>([]);
 const [isLoading, setIsLoading] = useState(true);
 const [searchQuery, setSearchQuery] = useState("");
 const [activeTab, setActiveTab] = useState("today"); // today, upcoming, history

 useEffect(() => {
 fetchAppointments();
 }, []);

 const fetchAppointments = async () => {
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) return;

 const { data: profile } = await supabase.from('profiles').select('hospital_id').eq('id', user.id).single();
 if (!profile?.hospital_id) return;

 const { data } = await supabase
 .from("appointments")
 .select(
 "*, patients(first_name, last_name), doctor:profiles!doctor_id(first_name, last_name, specialization)"
 )
 .eq("hospital_id", profile.hospital_id)
 .order("start_time", { ascending: true });

 if (data) setAppointments(data);
 setIsLoading(false);
 };

 const filteredAppointments = appointments.filter(apt => 
 `${apt.patients?.first_name} ${apt.patients?.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
 );

 const startOfToday = () => {
 const d = new Date();
 d.setHours(0, 0, 0, 0);
 return d;
 };

 const endOfToday = () => {
 const d = startOfToday();
 d.setDate(d.getDate() + 1);
 return d;
 };

 const todayApts = filteredAppointments.filter((apt) => {
 const date = new Date(getAppointmentStart(apt));
 return date >= startOfToday() && date < endOfToday();
 });

 const upcomingApts = filteredAppointments.filter((apt) => {
 const date = new Date(getAppointmentStart(apt));
 return date >= endOfToday();
 });

 const historyApts = filteredAppointments.filter((apt) => {
 const date = new Date(getAppointmentStart(apt));
 return date < startOfToday();
 });

 const tabAppointments =
 activeTab === "today" ? todayApts : activeTab === "upcoming" ? upcomingApts : historyApts;

 return (
 <div className="space-y-8 pb-20">
 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <h1 className="text-3xl font-black text-slate-900 tracking-tight">Rendez-vous</h1>
 <p className="text-slate-600 font-medium">Planifiez et gérez le flux de patients de votre établissement.</p>
 </div>
 <button 
 onClick={() => setIsModalOpen(true)}
 className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 "
 >
 <Plus className="w-4 h-4" /> Nouveau RDV
 </button>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 <div className="lg:col-span-2 space-y-8">
 {/* Timeline / Queue Header */}
 <div className="flex gap-4 border-b border-slate-100 ">
 {["today", "upcoming", "history"].map((tab) => (
 <button
 key={tab}
 onClick={() => setActiveTab(tab)}
 className={cn(
 "pb-4 px-2 text-[10px] font-black uppercase tracking-widest transition-all relative",
 activeTab === tab ? "text-blue-600" : "text-slate-600 hover:text-slate-600"
 )}
 >
 {tab === 'today' ? 'Aujourd\'hui' : tab === 'upcoming' ? 'À venir' : 'Historique'}
 {activeTab === tab && <motion.div layoutId="aptTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
 </button>
 ))}
 </div>

 {/* Appointment List */}
 <div className="space-y-4">
 {isLoading ? (
 <div className="text-center py-20 text-slate-600 font-black uppercase text-[10px] tracking-widest">Sychronisation du calendrier...</div>
 ) : tabAppointments.map((apt, index) => (
 <motion.div 
 key={apt.id}
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: index * 0.05 }}
 className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-xl hover:-translate-y-1 transition-all"
 >
 <div className="flex items-center gap-6">
 <div className="flex flex-col items-center justify-center w-16 h-16 bg-white border-blue-100 shadow-sm rounded-3xl border border-slate-100 ">
 <p className="text-[10px] font-black text-slate-600 uppercase">{new Date(getAppointmentStart(apt)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
 </div>
 <div>
 <h4 className="font-black text-slate-900 tracking-tight">{apt.patients?.first_name} {apt.patients?.last_name}</h4>
 <div className="flex items-center gap-2 mt-1">
 <Stethoscope className="w-3 h-3 text-blue-500" />
 <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
 Dr. {apt.doctor?.last_name} • {apt.doctor?.specialization || "—"}
 </p>
 </div>
 </div>
 </div>
 <div className="flex items-center gap-6">
 <span className={cn(
 "px-3 py-1 rounded-xl text-[9px] font-black border uppercase tracking-widest",
 statusStyles[apt.status as string] || statusStyles.PENDING
 )}>
 {apt.status === "CONFIRMED"
 ? "Confirmé"
 : apt.status === "PENDING"
 ? "Attente"
 : apt.status === "COMPLETED"
 ? "Terminé"
 : apt.status === "CANCELLED"
 ? "Annulé"
 : apt.status === "IN_PROGRESS"
 ? "En cours"
 : String(apt.status)}
 </span>
 <button className="p-2 text-slate-300 hover:text-blue-600 transition-colors">
 <MoreVertical className="w-5 h-5" />
 </button>
 </div>
 </motion.div>
 ))}
 {(!isLoading && tabAppointments.length === 0) && (
 <div className="text-center py-20 bg-white border-blue-100 shadow-sm /50 rounded-[40px] border-2 border-dashed border-slate-100 ">
 <CalendarIcon className="w-12 h-12 text-slate-200 mx-auto mb-4" />
 <p className="text-xs font-black text-slate-600 uppercase tracking-widest">Aucun rendez-vous</p>
 </div>
 )}
 </div>
 </div>

 {/* Sidebar: Quick Actions & Queue Stats */}
 <div className="space-y-8">
 <div className="bg-slate-900 text-white p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
 <div className="absolute bottom-0 right-0 p-8 opacity-10"><Activity className="w-20 h-20" /></div>
 <h3 className="font-black text-xs uppercase tracking-widest text-blue-400 mb-8">Statut du Flux</h3>
 <div className="space-y-8">
 <div>
 <p className="text-4xl font-black">{todayApts.length}</p>
 <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1">Patients Attendus (J)</p>
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div className="p-4 bg-white/5 rounded-3xl border border-white/5">
 <p className="text-xl font-black text-emerald-400">{todayApts.filter(a => a.status === 'COMPLETED').length}</p>
 <p className="text-[9px] font-black text-slate-600 uppercase mt-1">Traités</p>
 </div>
 <div className="p-4 bg-white/5 rounded-3xl border border-white/5">
 <p className="text-xl font-black text-blue-400">{todayApts.filter(a => a.status === 'CONFIRMED' || a.status === 'PENDING').length}</p>
 <p className="text-[9px] font-black text-slate-600 uppercase mt-1">En File</p>
 </div>
 </div>
 </div>
 </div>

 <div className="dash-card !p-8">
 <h3 className="font-black text-xs uppercase tracking-widest text-slate-600 mb-6">Akwaba AI Insight</h3>
 <div className="flex gap-4 items-start">
 <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shrink-0">
 <Activity className="w-5 h-5 text-white" />
 </div>
 <p className="text-xs font-medium leading-relaxed text-slate-600 ">
 Pic d&apos;activité prévu entre **10:00 et 11:30**. 
 Je recommande d&apos;ouvrir un box de consultation supplémentaire.
 </p>
 </div>
 </div>
 </div>
 </div>

 <Modal 
 isOpen={isModalOpen} 
 onClose={() => setIsModalOpen(false)} 
 title="Nouveau Rendez-vous"
 >
 <AppointmentForm 
 onSuccess={() => {
 setIsModalOpen(false);
 fetchAppointments();
 }} 
 onCancel={() => setIsModalOpen(false)} 
 />
 </Modal>
 </div>
 );
}
