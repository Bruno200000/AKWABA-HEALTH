"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
 Calendar, 
 Clock, 
 User, 
 ChevronLeft, 
 ChevronRight,
 Plus,
 Filter,
 Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export default function StaffSchedulePage() {
 const [activeDay, setActiveDay] = useState(new Date().getDay());
 
 const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
 
 const schedule = [
 { name: "Dr. Sangaré", role: "Médecin Chef", shift: "08:00 - 16:00", unit: "Consultations" },
 { name: "Inf. Kouamé", role: "Infirmier", shift: "08:00 - 20:00", unit: "Urgences" },
 { name: "Biol. Diallo", role: "Biologiste", shift: "07:30 - 15:30", unit: "Laboratoire" },
 { name: "Dr. Yao", role: "Pédiatre", shift: "14:00 - 22:00", unit: "Consultations" },
 ];

 return (
 <div className="space-y-8">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <h1 className="text-3xl font-black text-slate-900 tracking-tight">Planning du Personnel</h1>
 <p className="text-slate-500 font-medium">Gérez les rotations et les horaires de garde de l'équipe.</p>
 </div>
 <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 ">
 <Plus className="w-4 h-4" /> Nouvelle Rotation
 </button>
 </div>

 {/* Week Selector */}
 <div className="flex bg-white p-2 rounded-[24px] border border-slate-200 shadow-sm overflow-x-auto custom-scrollbar">
 {days.map((day, i) => (
 <button
 key={day}
 onClick={() => setActiveDay(i)}
 className={cn(
 "flex-1 min-w-[100px] py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
 activeDay === i ? "bg-slate-900 text-white " : "text-slate-400 hover:bg-slate-50 "
 )}
 >
 {day}
 </button>
 ))}
 </div>

 {/* Daily Shift View */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {schedule.map((staff, i) => (
 <motion.div
 key={staff.name}
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: i * 0.1 }}
 className="p-6 bg-white rounded-[32px] border border-slate-200 shadow-sm flex items-center justify-between group"
 >
 <div className="flex items-center gap-6">
 <div className="w-16 h-16 rounded-[24px] bg-slate-50 border border-slate-100 flex items-center justify-center relative">
 <User className="w-8 h-8 text-slate-300" />
 <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-white " />
 </div>
 <div>
 <h4 className="font-black text-lg">{staff.name}</h4>
 <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{staff.role}</p>
 </div>
 </div>

 <div className="text-right">
 <div className="flex items-center gap-2 justify-end mb-1">
 <Clock className="w-4 h-4 text-slate-300" />
 <span className="font-black text-sm">{staff.shift}</span>
 </div>
 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{staff.unit}</p>
 </div>
 </motion.div>
 ))}
 </div>
 </div>
 );
}
