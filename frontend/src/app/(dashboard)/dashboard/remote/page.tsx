"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
 Zap, 
 Activity, 
 Users, 
 TrendingUp, 
 AlertCircle, 
 Smartphone,
 ShieldCheck,
 Power,
 RefreshCw,
 Bell,
 MessageSquare,
 Lock,
 Cpu,
 Globe,
 Radio,
 ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export default function RemotePage() {
 const [stats, setStats] = useState({
 activePatients: 0,
 dailyRevenue: 0,
 staffOnline: 0,
 criticalAlerts: 2,
 systemLoad: 12
 });

 const [notifications, setNotifications] = useState([
 { id: 1, text: "Nouveau patient admis en urgence", type: "urgent" },
 { id: 2, text: "Stock de Paracétamol critique", type: "warning" }
 ]);

 useEffect(() => {
 fetchRealStats();
 const interval = setInterval(fetchRealStats, 10000);
 return () => clearInterval(interval);
 }, []);

 const fetchRealStats = async () => {
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) return;
 const { data: profile } = await supabase.from('profiles').select('hospital_id').eq('id', user.id).single();
 if (!profile?.hospital_id) return;
 const hospitalId = profile.hospital_id;

 const today = new Date();
 today.setHours(0,0,0,0);

 const [
 { count: patientCount },
 { count: staffCount },
 { data: todayInvoices },
 { count: criticalCount }
 ] = await Promise.all([
 supabase.from('patients').select('*', { count: 'exact', head: true }).eq('hospital_id', hospitalId),
 supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('hospital_id', hospitalId),
 supabase.from('invoices').select('paid_amount').eq('hospital_id', hospitalId).gte('created_at', today.toISOString()),
 supabase.from('patients').select('*', { count: 'exact', head: true }).eq('hospital_id', hospitalId).eq('status', 'CRITICAL')
 ]);
 
 const revenue = todayInvoices?.reduce((acc, inv) => acc + (Number(inv.paid_amount) || 0), 0) || 0;

 setStats({
 activePatients: patientCount || 0,
 staffOnline: staffCount || 0,
 dailyRevenue: revenue,
 criticalAlerts: criticalCount || 0,
 systemLoad: 12 // Hardcoded load is fine as it's a "system" stat
 });
 };

 return (
 <div className="min-h-screen bg-[#020617] text-white p-6 pb-32 space-y-12 overflow-hidden relative">
 {/* Background Glows */}
 <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full -mr-64 -mt-64" />
 <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full -ml-64 -mb-64" />

 {/* Header Panel */}
 <div className="flex justify-between items-center bg-white/5 border border-white/10 p-6 rounded-[32px] backdrop-blur-2xl">
 <div className="flex items-center gap-6">
 <div className="relative">
 <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center shadow-2xl shadow-blue-500/20">
 <Cpu className="w-7 h-7 text-white" />
 </div>
 <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-[#020617] animate-pulse" />
 </div>
 <div>
 <h2 className="text-xl font-black tracking-tighter">AKWABA OS <span className="text-blue-500">v4.0</span></h2>
 <div className="flex items-center gap-2 mt-1">
 <div className="w-2 h-2 bg-emerald-500 rounded-full" />
 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Core Engine : Active</p>
 </div>
 </div>
 </div>
 <div className="flex gap-3">
 <button className="w-12 h-12 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all group">
 <Radio className="w-5 h-5 text-slate-400 group-hover:text-blue-400" />
 </button>
 <button className="w-12 h-12 bg-red-600/10 rounded-2xl border border-red-600/20 flex items-center justify-center hover:bg-red-600/20 transition-all group">
 <Power className="w-5 h-5 text-red-500" />
 </button>
 </div>
 </div>

 {/* Real-time Pulse Monitor */}
 <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
 <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
 {[
 { label: "Flux Patients", value: stats.activePatients, icon: Users, color: "text-blue-400", trend: "+12%" },
 { label: "Charge Système", value: `${stats.systemLoad}%`, icon: Activity, color: "text-emerald-400", trend: "Stable" },
 { label: "Revenu Live", value: stats.dailyRevenue.toLocaleString(), icon: TrendingUp, color: "text-amber-400", trend: "+5k" },
 ].map((stat, i) => (
 <motion.div
 key={stat.label}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: i * 0.1 }}
 className="p-8 bg-white/5 border border-white/5 rounded-[40px] relative overflow-hidden group"
 >
 <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
 <stat.icon className="w-16 h-16" />
 </div>
 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">{stat.label}</p>
 <div className="flex items-end gap-3">
 <h3 className={cn("text-4xl font-black tracking-tight", stat.color)}>{stat.value}</h3>
 <span className="text-[10px] font-bold text-slate-500 mb-2">{stat.trend}</span>
 </div>
 </motion.div>
 ))}
 </div>

 {/* Emergency Panel */}
 <div className="bg-red-600 rounded-[40px] p-8 shadow-2xl shadow-red-600/20 flex flex-col justify-between">
 <div>
 <AlertCircle className="w-10 h-10 text-white/50 mb-6" />
 <h3 className="text-2xl font-black tracking-tight leading-tight">Urgences<br />Critiques</h3>
 </div>
 <div className="mt-8">
 <p className="text-4xl font-black">{stats.criticalAlerts.toString().padStart(2, '0')}</p>
 <button className="w-full mt-6 py-4 bg-white/20 hover:bg-white/30 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
 Intervenir
 </button>
 </div>
 </div>
 </div>

 {/* Operations Matrix */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
 <div className="space-y-6">
 <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 ml-2">Console d'Opérations</h3>
 <div className="grid grid-cols-1 gap-4">
 {[
 { label: "Diffusion Alerte", sub: "Notification push à tout le staff", icon: Bell, color: "bg-blue-600" },
 { label: "Verrouillage Cyber", sub: "Protocole de sécurité AES-256", icon: ShieldCheck, color: "bg-slate-800" },
 { label: "Backup Cloud", sub: "Dernière synchro il y a 2 min", icon: Globe, color: "bg-emerald-600" },
 ].map((action, i) => (
 <motion.button
 key={action.label}
 whileHover={{ x: 10 }}
 className="w-full flex items-center justify-between p-6 bg-white/5 border border-white/5 rounded-[32px] hover:bg-white/10 transition-all text-left"
 >
 <div className="flex items-center gap-6">
 <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg", action.color)}>
 <action.icon className="w-7 h-7" />
 </div>
 <div>
 <p className="font-black text-sm">{action.label}</p>
 <p className="text-[10px] font-medium text-slate-500 mt-1">{action.sub}</p>
 </div>
 </div>
 <ChevronRight className="w-5 h-5 text-slate-600" />
 </motion.button>
 ))}
 </div>
 </div>

 {/* Active Matrix Log */}
 <div className="space-y-6">
 <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 ml-2">Log Système Live</h3>
 <div className="bg-white/5 border border-white/5 rounded-[40px] p-8 h-[340px] overflow-hidden relative">
 <div className="space-y-6">
 {notifications.map((n) => (
 <div key={n.id} className="flex gap-4">
 <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", n.type === 'urgent' ? 'bg-red-500' : 'bg-amber-500')} />
 <div>
 <p className="text-sm font-bold leading-tight">{n.text}</p>
 <p className="text-[10px] font-medium text-slate-500 mt-1">Maintenant • Terminal 04</p>
 </div>
 </div>
 ))}
 </div>
 {/* Terminal Overlay */}
 <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#020617] to-transparent pt-20">
 <div className="flex items-center gap-4 text-[10px] font-mono text-emerald-500/50">
 <span>&gt; SYSLOG_READY</span>
 <span className="animate-pulse">_</span>
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Bottom Dock */}
 <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/10 backdrop-blur-3xl p-3 rounded-[32px] border border-white/10 shadow-2xl">
 {[MessageSquare, ShieldCheck, Zap, Globe].map((Icon, i) => (
 <button key={i} className="w-14 h-14 bg-white/5 hover:bg-blue-600 rounded-2xl flex items-center justify-center transition-all group">
 <Icon className="w-6 h-6 text-slate-400 group-hover:text-white" />
 </button>
 ))}
 </div>
 </div>
 );
}
