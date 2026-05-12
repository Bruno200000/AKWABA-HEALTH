"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
 ShieldAlert, 
 Search, 
 Activity, 
 Clock, 
 ArrowRight,
 AlertTriangle,
 Zap,
 Phone
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export default function EmergencyPage() {
 const [emergencies, setEmergencies] = useState<any[]>([]);
 const [isLoading, setIsLoading] = useState(true);

 useEffect(() => {
 fetchEmergencies();
 }, []);

 const fetchEmergencies = async () => {
 // Simulated emergency cases
 setEmergencies([
 { id: "E-001", patient: "Aliou Cissé", priority: "CRITICAL", arrival: "16:45", symptom: "Douleur thoracique" },
 { id: "E-002", patient: "Binta Fall", priority: "HIGH", arrival: "16:55", symptom: "Fracture ouverte" },
 { id: "E-003", patient: "Chaka Traoré", priority: "MEDIUM", arrival: "17:10", symptom: "Forte fièvre" },
 ]);
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
 <span className="text-xs font-black uppercase tracking-[0.2em]">Unité de Soins Intensifs</span>
 </div>
 <h1 className="text-4xl font-black tracking-tight mb-2">Urgences Vitales</h1>
 <p className="text-red-100 font-medium max-w-xl">Gestion prioritaire des cas critiques. Les temps d'attente sont calculés en temps réel pour optimiser la prise en charge.</p>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
 <div className="space-y-6">
 <h3 className="text-xs font-black uppercase tracking-widest text-slate-600 ml-2">File d'Attente Critique</h3>
 <div className="space-y-4">
 <AnimatePresence>
 {emergencies.map((case_item, i) => (
 <motion.div
 key={case_item.id}
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: i * 0.1 }}
 className={cn(
 "p-6 rounded-[32px] border flex items-center justify-between transition-all group cursor-pointer",
 case_item.priority === 'CRITICAL' 
 ? "bg-red-50 border-red-100 " 
 : "bg-white border-slate-200 "
 )}
 >
 <div className="flex items-center gap-6">
 <div className={cn(
 "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg",
 case_item.priority === 'CRITICAL' ? "bg-red-600 text-white" : "bg-slate-900 text-white"
 )}>
 <Activity className="w-7 h-7" />
 </div>
 <div>
 <h4 className="font-black text-lg">{case_item.patient}</h4>
 <p className={cn(
 "text-[10px] font-bold uppercase tracking-widest",
 case_item.priority === 'CRITICAL' ? "text-red-600" : "text-slate-600"
 )}>{case_item.symptom}</p>
 </div>
 </div>
 <div className="text-right flex items-center gap-6">
 <div>
 <p className="text-[10px] font-black text-slate-600 uppercase mb-1">Arrivée</p>
 <p className="font-black text-sm">{case_item.arrival}</p>
 </div>
 <button className={cn(
 "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
 case_item.priority === 'CRITICAL' ? "bg-red-600 text-white" : "bg-slate-100 text-slate-600 group-hover:bg-blue-600 group-hover:text-white"
 )}>
 <ArrowRight className="w-5 h-5" />
 </button>
 </div>
 </motion.div>
 ))}
 </AnimatePresence>
 </div>
 </div>

 <div className="space-y-8">
 <div className="p-8 bg-slate-900 text-white rounded-[40px] border border-slate-800">
 <h4 className="text-lg font-black tracking-tight mb-6 flex items-center gap-3">
 <Clock className="w-5 h-5 text-blue-500" /> Stats de l'Unité
 </h4>
 <div className="grid grid-cols-2 gap-6">
 <div className="space-y-1">
 <p className="text-[10px] font-black text-slate-600 uppercase">Temps d'attente moy.</p>
 <p className="text-3xl font-black">14 min</p>
 </div>
 <div className="space-y-1">
 <p className="text-[10px] font-black text-slate-600 uppercase">Lits disponibles</p>
 <p className="text-3xl font-black text-emerald-500">04</p>
 </div>
 </div>
 </div>

 <div className="p-8 bg-white border border-slate-200 rounded-[40px] shadow-sm">
 <h4 className="text-lg font-black tracking-tight mb-6">Contact SAMU / Pompiers</h4>
 <div className="space-y-4">
 <button className="w-full flex items-center justify-between p-5 bg-red-50 text-red-600 rounded-2xl font-black uppercase tracking-widest text-xs">
 SAMU (185) <Phone className="w-5 h-5" />
 </button>
 <button className="w-full flex items-center justify-between p-5 bg-blue-50 text-blue-600 rounded-2xl font-black uppercase tracking-widest text-xs">
 Pompiers (180) <Phone className="w-5 h-5" />
 </button>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
