"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
 History, 
 Search, 
 Calendar, 
 User, 
 ChevronRight,
 Filter,
 FileText,
 Download
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export default function ConsultationHistoryPage() {
 const [history, setHistory] = useState<any[]>([]);
 const [isLoading, setIsLoading] = useState(true);

 useEffect(() => {
 fetchHistory();
 }, []);

 const fetchHistory = async () => {
 // Simulated historical data
 setHistory([
 { id: "1", patient: "Mamadou Koné", date: "2026-05-10", diagnosis: "Paludisme simple", doctor: "Dr. Sangaré" },
 { id: "2", patient: "Aicha Bakayoko", date: "2026-05-09", diagnosis: "Infection respiratoire", doctor: "Dr. Yao" },
 { id: "3", patient: "Jean Kouassi", date: "2026-05-08", diagnosis: "Hypertension artérielle", doctor: "Dr. Sangaré" },
 ]);
 setIsLoading(false);
 };

 return (
 <div className="space-y-8">
 <div className="flex justify-between items-center">
 <div>
 <h1 className="text-3xl font-black text-slate-900 tracking-tight">Historique des Consultations</h1>
 <p className="text-slate-500 font-medium">Archive complète de toutes les consultations passées.</p>
 </div>
 <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all shadow-sm">
 <Download className="w-4 h-4" /> Exporter l'archive
 </button>
 </div>

 <div className="flex gap-4">
 <div className="relative flex-1">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
 <input 
 type="text" 
 placeholder="Rechercher par patient, docteur ou diagnostic..."
 className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/10"
 />
 </div>
 <button className="px-5 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all">
 <Filter className="w-5 h-5 text-slate-500" />
 </button>
 </div>

 <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm">
 <table className="w-full text-left">
 <thead>
 <tr className="bg-slate-50 /50 border-b border-slate-100 ">
 <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
 <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient</th>
 <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Diagnostic</th>
 <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Médecin</th>
 <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100 ">
 {history.map((item) => (
 <tr key={item.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer group">
 <td className="px-8 py-6">
 <div className="flex items-center gap-3">
 <Calendar className="w-4 h-4 text-slate-300" />
 <span className="text-sm font-bold">{item.date}</span>
 </div>
 </td>
 <td className="px-8 py-6 font-black text-sm">{item.patient}</td>
 <td className="px-8 py-6">
 <span className="text-sm text-slate-600 italic">"{item.diagnosis}"</span>
 </td>
 <td className="px-8 py-6">
 <div className="flex items-center gap-2">
 <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
 <User className="w-3 h-3" />
 </div>
 <span className="text-sm font-medium">{item.doctor}</span>
 </div>
 </td>
 <td className="px-8 py-6">
 <button className="p-2 text-slate-300 hover:text-blue-600 transition-colors">
 <FileText className="w-5 h-5" />
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 );
}
