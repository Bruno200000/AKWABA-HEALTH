"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
 FileText, 
 Search, 
 ShieldCheck, 
 Lock, 
 Download,
 Users,
 ChevronRight,
 Filter
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export default function PatientRecordsPage() {
 const [records, setRecords] = useState<any[]>([]);
 const [isLoading, setIsLoading] = useState(true);

 useEffect(() => {
 fetchRecords();
 }, []);

 const fetchRecords = async () => {
 // Simulated medical records
 setRecords([
 { id: "M-7001", name: "Ibrahim Konaté", lastUpdate: "2026-05-11", safety: "High", docs: 12 },
 { id: "M-7002", name: "Sali Diarra", lastUpdate: "2026-05-10", safety: "Medium", docs: 8 },
 { id: "M-7003", name: "Bakary Sidibé", lastUpdate: "2026-05-09", safety: "High", docs: 24 },
 ]);
 setIsLoading(false);
 };

 return (
 <div className="space-y-8">
 <div className="flex justify-between items-center">
 <div>
 <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dossiers Médicaux Digitaux</h1>
 <p className="text-slate-600 font-medium">Gestion sécurisée des antécédents et documents patients.</p>
 </div>
 <div className="flex items-center gap-3 px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">
 <Lock className="w-4 h-4 text-blue-400" /> Sécurisé AES-256
 </div>
 </div>

 <div className="flex gap-4">
 <div className="relative flex-1">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
 <input 
 type="text" 
 placeholder="Rechercher un dossier par nom ou ID..."
 className="w-full pl-12 pr-4 py-4 bg-white  rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/10"
 />
 </div>
 <button className="px-5 bg-white  rounded-2xl hover:bg-white border-blue-100 shadow-sm transition-all">
 <Filter className="w-5 h-5 text-slate-600" />
 </button>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {records.map((rec) => (
 <motion.div
 key={rec.id}
 whileHover={{ y: -5 }}
 className="p-8 bg-white rounded-[40px]  shadow-sm relative group overflow-hidden"
 >
 <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
 
 <div className="flex justify-between items-start mb-8 relative z-10">
 <div className="w-14 h-14 bg-blue-600 rounded-[20px] flex items-center justify-center text-white ">
 <FileText className="w-7 h-7" />
 </div>
 <ShieldCheck className={cn("w-6 h-6", rec.safety === 'High' ? "text-emerald-500" : "text-amber-500")} />
 </div>

 <h3 className="font-black text-xl mb-1 relative z-10">{rec.name}</h3>
 <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-8 relative z-10">Dossier : {rec.id}</p>

 <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
 <div className="p-4 bg-white border-blue-100 shadow-sm /50 rounded-2xl">
 <p className="text-[10px] font-black text-slate-600 uppercase mb-1">Documents</p>
 <p className="font-black text-lg">{rec.docs}</p>
 </div>
 <div className="p-4 bg-white border-blue-100 shadow-sm /50 rounded-2xl">
 <p className="text-[10px] font-black text-slate-600 uppercase mb-1">Mise à jour</p>
 <p className="font-black text-sm">{rec.lastUpdate}</p>
 </div>
 </div>

 <button className="w-full py-4  rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white border-blue-100 shadow-sm transition-all flex items-center justify-center gap-2 relative z-10">
 Ouvrir le Dossier <ChevronRight className="w-4 h-4" />
 </button>
 </motion.div>
 ))}
 </div>
 </div>
 );
}
