"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, Clock, Plus, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { getAppointmentStart } from "@/lib/appointment-utils";

export default function StaffSchedulePage() {
 const [activeDay, setActiveDay] = useState((new Date().getDay() + 6) % 7);
 const [appointments, setAppointments] = useState<any[]>([]);
 const [isLoading, setIsLoading] = useState(true);
 const router = useRouter();

 const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

 const selectedDate = useMemo(() => {
 const today = new Date();
 const monday = new Date(today);
 monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
 monday.setHours(0, 0, 0, 0);
 const date = new Date(monday);
 date.setDate(monday.getDate() + activeDay);
 return date;
 }, [activeDay]);

 useEffect(() => {
 fetchSchedule();
 }, [selectedDate]);

 const fetchSchedule = async () => {
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

 const start = new Date(selectedDate);
 const end = new Date(selectedDate);
 end.setDate(end.getDate() + 1);

 const { data } = await supabase
 .from("appointments")
 .select("*, patients(first_name, last_name), doctor:profiles!doctor_id(id, first_name, last_name, role, specialization)")
 .eq("hospital_id", profile.hospital_id)
 .gte("start_time", start.toISOString())
 .lt("start_time", end.toISOString())
 .order("start_time", { ascending: true });

 setAppointments(data || []);
 setIsLoading(false);
 };

 const schedule = Object.values(
 appointments.reduce((acc: Record<string, any>, appointment) => {
 const doctor = appointment.doctor;
 const key = doctor?.id || appointment.doctor_id;
 const start = new Date(getAppointmentStart(appointment));
 const end = appointment.end_time ? new Date(appointment.end_time) : new Date(start.getTime() + 30 * 60 * 1000);
 if (!acc[key]) {
 acc[key] = {
 id: key,
 name: `${doctor?.first_name || ""} ${doctor?.last_name || ""}`.trim() || "Praticien",
 role: doctor?.specialization || doctor?.role || "Personnel",
 start,
 end,
 appointments: [],
 };
 }
 acc[key].start = new Date(Math.min(acc[key].start.getTime(), start.getTime()));
 acc[key].end = new Date(Math.max(acc[key].end.getTime(), end.getTime()));
 acc[key].appointments.push(appointment);
 return acc;
 }, {})
 );

 return (
 <div className="space-y-8">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <h1 className="text-3xl font-black text-slate-900 tracking-tight">Planning du Personnel</h1>
 <p className="text-slate-600 font-medium">Planning derive des rendez-vous enregistres dans la base.</p>
 </div>
 <button
 onClick={() => router.push("/dashboard/appointments")}
 className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200"
 >
 <Plus className="w-4 h-4" /> Nouveau RDV
 </button>
 </div>

 <div className="flex bg-white p-2 rounded-[24px] shadow-sm overflow-x-auto custom-scrollbar">
 {days.map((day, i) => (
 <button
 key={day}
 onClick={() => setActiveDay(i)}
 className={cn(
 "flex-1 min-w-[100px] py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
 activeDay === i ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-white border-blue-100 shadow-sm"
 )}
 >
 {day}
 </button>
 ))}
 </div>

 <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
 <Calendar className="w-4 h-4 text-blue-600" />
 {selectedDate.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
 </div>

 {isLoading ? (
 <div className="text-center py-20 text-slate-600 font-bold uppercase text-[10px] tracking-widest">Chargement du planning...</div>
 ) : schedule.length > 0 ? (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {schedule.map((staff: any, i) => (
 <motion.div
 key={staff.id}
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: i * 0.1 }}
 className="p-6 bg-white rounded-[32px] shadow-sm flex items-center justify-between group"
 >
 <div className="flex items-center gap-6">
 <div className="w-16 h-16 rounded-[24px] bg-white border-blue-100 shadow-sm border border-blue-50 flex items-center justify-center relative">
 <User className="w-8 h-8 text-slate-300" />
 <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-white" />
 </div>
 <div>
 <h4 className="font-black text-lg">{staff.name}</h4>
 <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{staff.role}</p>
 </div>
 </div>

 <div className="text-right">
 <div className="flex items-center gap-2 justify-end mb-1">
 <Clock className="w-4 h-4 text-slate-300" />
 <span className="font-black text-sm">
 {staff.start.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} - {staff.end.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
 </span>
 </div>
 <p className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">{staff.appointments.length} rendez-vous</p>
 </div>
 </motion.div>
 ))}
 </div>
 ) : (
 <div className="text-center py-20 border border-dashed border-blue-100 rounded-[32px] text-slate-600 font-bold uppercase text-[10px] tracking-widest">
 Aucun planning enregistre pour cette journee
 </div>
 )}
 </div>
 );
}
