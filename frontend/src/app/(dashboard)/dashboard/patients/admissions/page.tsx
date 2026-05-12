"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
 Users, 
 Search, 
 Plus, 
 Clock, 
 ChevronRight,
 ShieldAlert,
 ArrowRightCircle,
 FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export default function AdmissionsPage() {
 const [admissions, setAdmissions] = useState<any[]>([]);
 const [isLoading, setIsLoading] = useState(true);

 useEffect(() => {
 fetchAdmissions();
 }, []);

 const fetchAdmissions = async () => {
 // Mock data for demo
 setAdmissions([
 { id: "1", patient: "Moussa Traoré", status: "PENDING", time: "10:30", type: "Urgence" },
 { id: "2", patient: "Fatou Diop", status: "IN_PROGRESS", time: "11:15", type: "Standard" },
 { id: "3", patient: "Koffi Konan", status: "COMPLETED", time: "09:00", type: "Standard" },
 ]);
 setIsLoading(false);
 };

 return (
 <div className="space-y-8 pb-20">
 <div>
 <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admissions en cours</h1>
 <p className="text-slate-600 font-medium">Suivez les patients en cours d'admission dans l'établissement.</p>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {admissions.map((adm) => (
 <motion.div
 key={adm.id}
 whileHover={{ y: -5 }}
 className="p-6 bg-white rounded-[32px] border border-slate-200 shadow-sm"
 >
 <div className="flex justify-between items-start mb-6">
 <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
 <Users className="w-6 h-6" />
 </div>
 <span className={cn(
 "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
 adm.status === 'PENDING' ? "bg-amber-100 text-amber-600" : 
 adm.status === 'IN_PROGRESS' ? "bg-blue-100 text-blue-600" : "bg-emerald-100 text-emerald-600"
 )}>
 {adm.status}
 </span>
 </div>
 <h3 className="font-black text-lg mb-1">{adm.patient}</h3>
 <div className="flex items-center gap-2 text-xs text-slate-600 font-bold mb-6">
 <Clock className="w-3.5 h-3.5" /> Admission à {adm.time}
 </div>
 <div className="flex gap-2">
 <button className="flex-1 py-3 bg-white border-blue-100 shadow-sm rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-blue-600 hover:text-white transition-all">
 Détails
 </button>
 <button className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all">
 <ArrowRightCircle className="w-4 h-4" />
 </button>
 </div>
 </motion.div>
 ))}
 </div>
 </div>
 );
}
