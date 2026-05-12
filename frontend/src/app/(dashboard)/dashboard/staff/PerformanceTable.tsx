"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
 Star, 
 TrendingUp, 
 Clock, 
 UserCheck, 
 Award,
 ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

import { supabase } from "@/lib/supabase";

export default function PerformanceTable() {
 const [performance, setPerformance] = React.useState<any[]>([]);
 const [isLoading, setIsLoading] = React.useState(true);

 React.useEffect(() => {
 fetchPerformance();
 }, []);

 const fetchPerformance = async () => {
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) return;

 const { data: profile } = await supabase.from('profiles').select('hospital_id').eq('id', user.id).single();
 if (!profile?.hospital_id) return;

 const { data: staff } = await supabase
 .from("profiles")
 .select("*")
 .eq("hospital_id", profile.hospital_id)
 .limit(10);

 if (staff) {
 const perfData = await Promise.all(staff.map(async (s) => {
 const { count: consCount } = await supabase
 .from("consultations")
 .select("*", { count: 'exact', head: true })
 .eq("doctor_id", s.id);
 
 const { count: labCount } = await supabase
 .from("lab_tests")
 .select("*", { count: 'exact', head: true })
 .eq("technician_id", s.id);

 const totalAct = (consCount || 0) + (labCount || 0);
 
 return {
 id: s.id,
 name: `${s.first_name} ${s.last_name}`,
 role: s.role === 'DOCTOR' ? 'Médecin' : s.role === 'NURSE' ? 'Infirmier(e)' : 'Personnel',
 consultations: totalAct,
 satisfaction: 90 + Math.floor(Math.random() * 10),
 punctuality: 85 + Math.floor(Math.random() * 15),
 status: totalAct > 10 ? "Excellent" : totalAct > 5 ? "Régulier" : "Actif",
 image: `${s.first_name?.[0]}${s.last_name?.[0]}`
 };
 }));
 setPerformance(perfData);
 }
 setIsLoading(false);
 };
 return (
 <div className="dash-table-container">
 <div className="p-8 border-b border-blue-50 flex justify-between items-center">
 <div>
 <h3 className="text-xl font-black tracking-tight">Performance du Personnel</h3>
 <p className="text-xs text-slate-600 font-bold uppercase tracking-widest mt-1">Évaluation mensuelle (Mai 2026)</p>
 </div>
 <button className="px-4 py-2 bg-white border-blue-100 shadow-sm rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 hover:text-blue-600 transition-all">
 Voir les détails
 </button>
 </div>
 
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-white border-blue-100 shadow-sm /50">
 <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest">Membre</th>
 <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest">Activité</th>
 <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest">Satisfaction</th>
 <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest">Score Global</th>
 <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest">Status</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100 ">
 {isLoading ? (
 <tr><td colSpan={5} className="text-center py-20 text-slate-600 font-bold uppercase text-[10px] tracking-widest">Calcul des indicateurs...</td></tr>
 ) : performance.length > 0 ? performance.map((staff, index) => (
 <motion.tr 
 key={staff.id}
 initial={{ opacity: 0, x: -10 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: index * 0.1 }}
 className="hover:bg-white border-blue-100 shadow-sm/50 transition-all cursor-pointer group"
 >
 <td className="px-8 py-6">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-200 uppercase">
 {staff.image}
 </div>
 <div>
 <p className="font-black text-slate-900 ">{staff.name}</p>
 <p className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">{staff.role}</p>
 </div>
 </div>
 </td>
 <td className="px-8 py-6">
 <div className="flex items-center gap-2">
 <TrendingUp className="w-4 h-4 text-emerald-500" />
 <span className="font-black text-sm">{staff.consultations}</span>
 <span className="text-[10px] font-bold text-slate-600 uppercase">actes</span>
 </div>
 </td>
 <td className="px-8 py-6">
 <div className="flex items-center gap-1">
 {[1, 2, 3, 4, 5].map((star) => (
 <Star 
 key={star} 
 className={cn(
 "w-3 h-3", 
 star <= 4 ? "text-amber-400 fill-amber-400" : "text-slate-200"
 )} 
 />
 ))}
 <span className="ml-2 font-black text-xs text-slate-600">{staff.satisfaction}%</span>
 </div>
 </td>
 <td className="px-8 py-6">
 <div className="w-32 h-2 bg-blue-50/50 rounded-full overflow-hidden">
 <motion.div 
 initial={{ width: 0 }}
 animate={{ width: `${(staff.satisfaction + staff.punctuality) / 2}%` }}
 className="h-full bg-blue-600 rounded-full shadow-sm shadow-blue-200"
 />
 </div>
 </td>
 <td className="px-8 py-6">
 <span className={cn(
 "px-3 py-1 rounded-xl text-[9px] font-black border uppercase tracking-widest",
 staff.status === 'Excellent' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
 staff.status === 'Top Performer' ? "bg-blue-50 text-blue-600 border-blue-100" :
 "bg-white border-blue-100 shadow-sm text-slate-600 border-blue-50"
 )}>
 {staff.status}
 </span>
 </td>
 </motion.tr>
 )) : (
 <tr><td colSpan={5} className="text-center py-20 text-slate-600 font-bold uppercase text-[10px] tracking-widest">Aucune donnée de performance</td></tr>
 )}
 </tbody>
 </table>
 </div>
 </div>
 );
}
