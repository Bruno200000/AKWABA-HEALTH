"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  Calendar, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  MoreVertical,
  Sparkles,
  ChevronRight,
  Bed,
  CreditCard,
  Target,
  Zap,
  Download,
  Plus,
  FileText,
  Beaker,
  Pill
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DEMO_DASHBOARD, DEMO_PROFILE, isDemoSession } from "@/lib/demo-mode";
import { supabase } from "@/lib/supabase";
import { getAppointmentStart } from "@/lib/appointment-utils";
import Link from "next/link";

export default function DashboardHome() {
  const [data, setData] = useState({
    patients: 0,
    consultations: 0,
    appointments: 0,
    revenue: 0,
    roomOccupancy: 0,
  });
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recentApps, setRecentApps] = useState<any[]>([]);
  const [activityData, setActivityData] = useState<number[]>(new Array(12).fill(0));
  const [staffPerformance, setStaffPerformance] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (isDemoSession()) {
          setProfile(DEMO_PROFILE);
          const d = DEMO_DASHBOARD;
          setData({
            patients: d.patients,
            consultations: d.consultations,
            appointments: d.appointments,
            revenue: d.revenue,
            roomOccupancy: d.roomOccupancy,
          });
          setActivityData(d.activityData);
          setStaffPerformance(d.staffPerformance);
          setRecentApps(d.recentAppointments);
          return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          return;
        }

        const { data: prof } = await supabase
          .from("profiles")
          .select("*, hospitals(name)")
          .eq("id", user.id)
          .maybeSingle();
        const hospitalId = prof?.hospital_id;
        if (!hospitalId) {
          setProfile(prof ?? null);
          return;
        }
        setProfile(prof);

      const [
        { count: patientsCount },
        { count: consultationsCount },
        { count: appointmentsCount },
        { data: invoices },
        { data: recentAppointments },
        { count: totalRooms },
        { count: occupiedRooms },
        { data: consultationsRaw },
        { data: staffData }
      ] = await Promise.all([
        supabase.from('patients').select('*', { count: 'exact', head: true }).eq('hospital_id', hospitalId),
        supabase.from('consultations').select('*', { count: 'exact', head: true }).eq('hospital_id', hospitalId),
        supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('hospital_id', hospitalId),
        supabase.from('invoices').select('total_amount').eq('hospital_id', hospitalId),
        supabase.from('appointments')
          .select('*, patients(first_name, last_name)')
          .eq('hospital_id', hospitalId)
          .order('start_time', { ascending: false })
          .limit(5),
        supabase.from('rooms').select('*', { count: 'exact', head: true }).eq('hospital_id', hospitalId),
        supabase.from('admissions').select('*', { count: 'exact', head: true }).eq('hospital_id', hospitalId).eq('status', 'ADMITTED'),
        supabase.from('consultations').select('created_at').eq('hospital_id', hospitalId),
        supabase.from('profiles').select('id, first_name, last_name, role').eq('hospital_id', hospitalId).limit(3)
      ]);
      
      const totalRevenue = invoices?.reduce((acc, inv) => acc + (Number(inv.total_amount) || 0), 0) || 0;
      const occupancy = totalRooms && totalRooms > 0 ? Math.round((occupiedRooms || 0) / totalRooms * 100) : 0;

      // Monthly activity chart
      const monthlyData = new Array(12).fill(0);
      consultationsRaw?.forEach(c => {
        const month = new Date(c.created_at).getMonth();
        monthlyData[month]++;
      });
      setActivityData(monthlyData);

      // Staff performance
      if (staffData) {
        const perf = await Promise.all(staffData.map(async (s) => {
          const { count } = await supabase.from('consultations').select('*', { count: 'exact', head: true }).eq('doctor_id', s.id);
          return { 
            name: `${s.first_name?.[0] || ''}. ${s.last_name || ''}`, 
            role: s.role || "Praticien", 
            score: Math.min(100, (count || 0) * 10),
            color: s.role === 'DOCTOR' ? 'bg-blue-600' : 'bg-sky-500'
          };
        }));
        setStaffPerformance(perf);
      }

      setData(prev => ({
        ...prev,
        patients: patientsCount || 0,
        consultations: consultationsCount || 0,
        appointments: appointmentsCount || 0,
        revenue: totalRevenue,
        roomOccupancy: occupancy,
      }));
      setRecentApps(recentAppointments || []);
      } catch {
        /* Laisser le tableau vide ; le layout gère déjà l’accès */
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const stats = [
    { label: "Total Patients", value: data.patients.toLocaleString(), change: "Live", trending: "up", icon: Users, color: "from-blue-500 to-blue-700" },
    { label: "Consultations", value: data.consultations.toLocaleString(), change: "Live", trending: "up", icon: Activity, color: "from-blue-400 to-blue-600" },
    { label: "Occupation Lits", value: `${data.roomOccupancy}%`, change: "Live", trending: "up", icon: Bed, color: "from-sky-500 to-blue-700" },
    { label: "Revenus (CFA)", value: (data.revenue / 1000).toFixed(0) + "k", change: "Live", trending: "up", icon: CreditCard, color: "from-blue-600 to-blue-800" },
  ];

  const maxActivity = Math.max(...activityData, 1);

  return (
    <div className="space-y-8 pb-20 font-sans">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Bonjour,{" "}
            {isLoading
              ? "…"
              : profile
                ? `${profile.role === "DOCTOR" ? "Dr. " : ""}${profile.first_name} ${profile.last_name}`
                : "Akwaba User"}{" "}
            👋
          </h1>
          <p className="text-slate-600 font-medium">
            Voici le rapport d&apos;activité de{" "}
            <span className="text-blue-600 font-bold uppercase">{profile?.hospitals?.name || "Votre Établissement"}</span>{" "}
            pour aujourd&apos;hui.
            {isDemoSession() && (
              <span className="ml-2 text-xs font-bold text-blue-500 normal-case tracking-normal">
                (mode démo — données exemple)
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-blue-100 rounded-xl text-xs font-bold shadow-sm hover:bg-blue-50/80 transition-all flex items-center gap-2 text-slate-700">
            <Calendar className="w-4 h-4 text-blue-500" /> {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/25 flex items-center gap-2 hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4" /> Exporter PDF
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-blue-100/90 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all group relative overflow-hidden"
          >
            <div className={cn("absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity rounded-full", stat.color)} />
            <div className="flex justify-between items-start mb-6">
              <div className={cn("p-3 rounded-2xl text-white shadow-lg bg-gradient-to-br", stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-tighter",
                "text-blue-700 bg-blue-50"
              )}>
                {stat.change}
                <ArrowUpRight className="w-3 h-3" />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-3xl font-black mt-1 tracking-tight">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Section */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-blue-100/90 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="font-black text-xl tracking-tight">Activité Médicale</h3>
                <p className="text-xs text-slate-400 font-medium mt-1">Nombre de consultations par mois</p>
              </div>
            </div>
            <div className="h-64 flex items-end justify-between gap-4 pt-10">
              {activityData.map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                  <div className="w-full relative flex items-end justify-center">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(5, (val / maxActivity) * 100)}%` }}
                      transition={{ delay: i * 0.05, duration: 1 }}
                      className={cn(
                        "w-full max-w-[12px] rounded-full transition-all relative group-hover:scale-x-125",
                        i === new Date().getMonth() ? "bg-blue-600 shadow-lg shadow-blue-300" : "bg-blue-50 group-hover:bg-blue-400 group-hover:bg-opacity-70"
                      )}
                    />
                    <div className="absolute -top-10 bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      {val}
                    </div>
                  </div>
                  <span className="text-[9px] font-black text-slate-400 uppercase">{i + 1}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Performance Card */}
            <div className="bg-white p-6 rounded-3xl border border-blue-100/90 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-sm uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-600" /> Top Praticiens
                </h3>
                <MoreVertical className="w-4 h-4 text-slate-300" />
              </div>
              <div className="space-y-6">
                {staffPerformance.map((s) => (
                  <div key={s.name} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold">{s.name}</span>
                      <span className="font-black text-blue-600">{s.score}%</span>
                    </div>
                    <div className="h-1.5 bg-blue-50 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${s.score}%` }}
                        className={cn("h-full rounded-full", s.color)} 
                      />
                    </div>
                  </div>
                ))}
                {staffPerformance.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-4">Aucune donnée de performance</p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Nouvelle Admission", icon: Plus, color: "bg-blue-600", href: "/dashboard/patients" },
                { label: "Générer Facture", icon: FileText, color: "bg-blue-800", href: "/dashboard/finance" },
                { label: "Rapport Labo", icon: Beaker, color: "bg-blue-500", href: "/dashboard/laboratory" },
                { label: "Stock Pharma", icon: Pill, color: "bg-sky-600", href: "/dashboard/pharmacy" },
              ].map((action) => (
                <Link 
                  key={action.label} 
                  href={action.href}
                  className="flex flex-col items-center justify-center gap-3 p-4 bg-white rounded-3xl border border-blue-100 hover:border-blue-400 hover:shadow-md transition-all group text-center"
                >
                  <div className={cn("p-3 rounded-2xl text-white shadow-lg group-hover:scale-110 transition-transform", action.color)}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 group-hover:text-blue-600">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-8">
          {/* AI Assistant Panel */}
          <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white p-8 rounded-[40px] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Zap className="w-20 h-20 text-blue-400" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-8">
                <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/50">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-black text-xs uppercase tracking-[0.2em] text-blue-400">Akwaba AI Assistant</h3>
              </div>
              <div className="space-y-6">
                <div className="p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Insight du jour</p>
                  <p className="text-sm font-medium leading-relaxed">
                    Suivez l&apos;activité de votre établissement en temps réel grâce aux données Supabase.
                  </p>
                </div>
                <div className="p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">
                  <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-2">Stock</p>
                  <p className="text-sm font-medium leading-relaxed">
                    Posez une question à l&apos;IA sur les stocks, patients ou revenus via le bouton en bas à droite.
                  </p>
                </div>
              </div>
              <button className="w-full mt-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-2">
                Parler à l&apos;assistant <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Recent Appointments */}
          <div className="bg-white p-8 rounded-3xl border border-blue-100/90 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-black text-sm uppercase tracking-widest text-slate-400">Rendez-vous</h3>
              <Link href="/dashboard/appointments" className="p-2 bg-blue-50 rounded-xl hover:bg-blue-100 text-blue-700 transition-all">
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-6">
              {recentApps.length > 0 ? recentApps.map((app) => (
                <div key={app.id} className="flex items-center gap-4 group cursor-pointer">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center font-black text-blue-600 shrink-0 border border-blue-100 group-hover:border-blue-300 transition-all uppercase">
                    {app.patients?.first_name?.[0]}{app.patients?.last_name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-slate-900 truncate">{app.patients?.first_name} {app.patients?.last_name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">{app.reason || "Consultation Générale"}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 text-[10px] font-black text-blue-700 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">
                      <Clock className="w-3 h-3" /> {new Date(getAppointmentStart(app)).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>
              )) : (
                <p className="text-xs text-slate-400 font-bold text-center py-10">Aucun rendez-vous récent</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
