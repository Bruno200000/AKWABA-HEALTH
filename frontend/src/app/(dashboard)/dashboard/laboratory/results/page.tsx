"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
 FileText, 
 Search, 
 CheckCircle2, 
 Download, 
 Calendar,
 User,
 Beaker,
 Filter
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export default function LabResultsPage() {
 const [results, setResults] = useState<any[]>([]);
 const [isLoading, setIsLoading] = useState(true);

 useEffect(() => {
 fetchResults();
 }, []);

 const fetchResults = async () => {
 // Simulated results data
 setResults([
 { id: "R-501", patient: "Abdoulaye Touré", test: "NFS", date: "2026-05-11", status: "Validé" },
 { id: "R-502", patient: "Fatima Kouyaté", test: "Glycémie", date: "2026-05-11", status: "Validé" },
 { id: "R-503", patient: "Moussa Sow", test: "Paludisme (TDR)", date: "2026-05-10", status: "Validé" },
 ]);
 setIsLoading(false);
 };

 return (
 <div className="space-y-8">
 <div className="flex justify-between items-center">
 <div>
 <h1 className="text-3xl font-black text-slate-900 tracking-tight">Résultats de Laboratoire</h1>
 <p className="text-slate-600 font-medium">Archive sécurisée des analyses validées et publiées.</p>
 </div>
 <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 ">
 <Download className="w-4 h-4" /> Exporter les données
 </button>
 </div>

 <div className="flex gap-4">
 <div className="relative flex-1">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
 <input 
 type="text" 
 placeholder="Rechercher par patient ou type d'analyse..."
 className="w-full pl-12 pr-4 py-4 bg-white  rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/10"
 />
 </div>
 <button className="px-5 bg-white  rounded-2xl hover:bg-white border-blue-100 shadow-sm transition-all">
 <Filter className="w-5 h-5 text-slate-600" />
 </button>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {results.map((res) => (
 <motion.div
 key={res.id}
 whileHover={{ y: -5 }}
 className="p-8 bg-white rounded-[40px]  shadow-sm group"
 >
 <div className="flex justify-between items-start mb-8">
 <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-[20px] flex items-center justify-center">
 <CheckCircle2 className="w-7 h-7" />
 </div>
 <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{res.id}</span>
 </div>
 
 <h3 className="font-black text-xl mb-1">{res.patient}</h3>
 <p className="text-sm font-bold text-blue-600 uppercase tracking-tight mb-8">{res.test}</p>

 <div className="space-y-3 mb-8">
 <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
 <Calendar className="w-4 h-4 opacity-30" /> Effectué le {res.date}
 </div>
 <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
 <User className="w-4 h-4 opacity-30" /> Biologiste: Dr. Diallo
 </div>
 </div>

 <button className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2">
 <FileText className="w-4 h-4" /> Voir le Rapport PDF
 </button>
 </motion.div>
 ))}
 </div>
 </div>
 );
}
