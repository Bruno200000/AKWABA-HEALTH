"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, AlertTriangle, ArrowRight, Bed, Clock, Phone, ShieldAlert, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export default function EmergencyPage() {
 const [emergencies, setEmergencies] = useState<any[]>([]);
 const [isLoading, setIsLoading] = useState(true);
 const [stats, setStats] = useState({ critical: 0, availableBeds: 0 });

 useEffect(() => {
 fetchEmergencies();
 }, []);

 const fetchEmergencies = async () => {
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

 const [{ data: patients }, { data: rooms }] = await Promise.all([
 supabase
 .from("patients")
 .select("id, file_number, first_name, last_name, phone, status, updated_at, created_at")
 .eq("hospital_id", profile.hospital_id)
 .eq("status", "CRITICAL")
 .order("updated_at", { ascending: false }),
 supabase
 .from("rooms")
 .select("id, admissions(status)")
 .eq("hospital_id", profile.hospital_id),
 ]);

 const availableBeds = (rooms || []).filter((room: any) => !room.admissions?.some((adm: any) => adm.status === "ADMITTED")).length;
 setEmergencies(patients || []);
 setStats({ critical: patients?.length || 0, availableBeds });
 setIsLoading(false);
 };

 return (
 <div className="space-y-8">
 <div className="p-8 bg-red-600 rounded-[40px] text-white relative overflow-hidden">
 <div className="absolute top-0 right-0 p-12 opacity-10">
 <ShieldAlert className="w-40 h-40" />
 </div>
 <div className="relative z-10">
 <div className="flex items-center gap-3 mb-4">
 <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center animate-pulse">
 <Zap className="w-6 h-6" />
 </div>
 <span className="text-xs font-black uppercase tracking-[0.2em]">Patients critiques</span>
 </div>
 <h1 className="text-4xl font-black tracking-tight mb-2">Urgences Vitales</h1>
 <p className="text-red-100 font-medium max-w-xl">Cette file affiche uniquement les patients marques CRITICAL dans la base de donnees.</p>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
 <div className="space-y-6">
 <h3 className="text-xs font-black uppercase tracking-widest text-slate-600 ml-2">File Critique</h3>
 <div className="space-y-4">
 {isLoading ? (
 <div className="p-8 bg-white rounded-[32px] text-center text-slate-600 font-bold text-sm">Chargement...</div>
 ) : (
 <AnimatePresence>
 {emergencies.length > 0 ? emergencies.map((patient, i) => (
 <motion.div
 key={patient.id}
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: i * 0.1 }}
 className="p-6 rounded-[32px] border flex items-center justify-between transition-all group cursor-pointer bg-red-50 border-red-100"
 >
 <div className="flex items-center gap-6">
 <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg bg-red-600 text-white">
 <Activity className="w-7 h-7" />
 </div>
 <div>
 <h4 className="font-black text-lg">{patient.first_name} {patient.last_name}</h4>
 <p className="text-[10px] font-bold uppercase tracking-widest text-red-600">{patient.file_number}</p>
 </div>
 </div>
 <div className="text-right flex items-center gap-6">
 <div>
 <p className="text-[10px] font-black text-slate-600 uppercase mb-1">Mis a jour</p>
 <p className="font-black text-sm">{new Date(patient.updated_at || patient.created_at).toLocaleString("fr-FR")}</p>
 </div>
 <button className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all bg-red-600 text-white">
 <ArrowRight className="w-5 h-5" />
 </button>
 </div>
 </motion.div>
 )) : (
 <div className="p-10 bg-white border border-dashed border-red-100 rounded-[32px] text-center text-slate-600">
 <AlertTriangle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
 <p className="text-xs font-black uppercase tracking-widest">Aucun patient critique enregistre</p>
 </div>
 )}
 </AnimatePresence>
 )}
 </div>
 </div>

 <div className="space-y-8">
 <div className="p-8 bg-blue-600 text-white rounded-[40px] border border-slate-800">
 <h4 className="text-lg font-black tracking-tight mb-6 flex items-center gap-3">
 <Clock className="w-5 h-5 text-blue-200" /> Stats de l&apos;Unite
 </h4>
 <div className="grid grid-cols-2 gap-6">
 <div className="space-y-1">
 <p className="text-[10px] font-black text-blue-100 uppercase">Patients critiques</p>
 <p className="text-3xl font-black">{stats.critical}</p>
 </div>
 <div className="space-y-1">
 <p className="text-[10px] font-black text-blue-100 uppercase">Lits disponibles</p>
 <p className={cn("text-3xl font-black", stats.availableBeds > 0 ? "text-emerald-300" : "text-red-200")}>
 {stats.availableBeds}
 </p>
 </div>
 </div>
 </div>

 <div className="p-8 bg-white rounded-[40px] shadow-sm">
 <h4 className="text-lg font-black tracking-tight mb-6">Contact SAMU / Pompiers</h4>
 <div className="space-y-4">
 <a href="tel:185" className="w-full flex items-center justify-between p-5 bg-red-50 text-red-600 rounded-2xl font-black uppercase tracking-widest text-xs">
 SAMU (185) <Phone className="w-5 h-5" />
 </a>
 <a href="tel:180" className="w-full flex items-center justify-between p-5 bg-blue-50 text-blue-600 rounded-2xl font-black uppercase tracking-widest text-xs">
 Pompiers (180) <Phone className="w-5 h-5" />
 </a>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
