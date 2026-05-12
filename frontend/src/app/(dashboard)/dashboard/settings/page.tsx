"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
 Settings, 
 Building2, 
 ShieldCheck, 
 Bell, 
 Globe, 
 Lock, 
 Save,
 Activity,
 CreditCard,
 User,
 Camera,
 Cloud,
 Zap,
 Mail,
 Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

const tabs = [
  { id: "profile", label: "Mon Profil", icon: User, desc: "Informations personnelles" },
  { id: "hospital", label: "Établissement", icon: Building2, desc: "Identité et coordonnées" },
  { id: "branding", label: "Personnalisation", icon: Camera, desc: "Logo et couleurs" },
  { id: "ai", label: "IA Akwaba", icon: Zap, desc: "Intelligence Médicale" },
  { id: "security", label: "Sécurité & Accès", icon: ShieldCheck, desc: "Mots de passe et rôles" },
  { id: "notifications", label: "Communications", icon: Bell, desc: "Alertes SMS et Emails" },
  { id: "billing", label: "Abonnement", icon: CreditCard, desc: "Plans et facturation" },
];

export default function SettingsPage() {
 const [activeTab, setActiveTab] = useState("profile");
 const [isSaving, setIsSaving] = useState(false);
 const [isLoading, setIsLoading] = useState(true);
 const [hospital, setHospital] = useState<any>(null);
 const [userProfile, setUserProfile] = useState<any>(null);

 useEffect(() => {
 fetchData();
 }, []);

 const fetchData = async () => {
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) return;

 const { data: profile } = await supabase.from('profiles').select('*, hospitals(*)').eq('id', user.id).single();
 if (profile) {
 setUserProfile(profile);
 if (profile.hospitals) setHospital(profile.hospitals);
 }
 setIsLoading(false);
 };

 const handleSave = async () => {
 setIsSaving(true);
 
 if (activeTab === "hospital" && hospital) {
 await supabase.from('hospitals').update({
 name: hospital.name,
 email: hospital.email,
 phone: hospital.phone,
 address: hospital.address
 }).eq('id', hospital.id);
 } else if (activeTab === "profile" && userProfile) {
 await supabase.from('profiles').update({
 first_name: userProfile.first_name,
 last_name: userProfile.last_name,
 phone: userProfile.phone
 }).eq('id', userProfile.id);
 }

 setTimeout(() => setIsSaving(false), 1000);
 };

 return (
 <div className="space-y-8 pb-20">
 {/* Header */}
 <div>
 <h1 className="text-3xl font-black text-slate-900 tracking-tight">Configuration</h1>
 <p className="text-slate-600 font-medium">Personnalisez votre plateforme AKWABA HEALTH.</p>
 </div>

 <div className="flex flex-col lg:flex-row gap-12">
 {/* Sidebar Navigation */}
 <div className="lg:w-80 space-y-2">
 {tabs.map((tab) => (
 <button
 key={tab.id}
 onClick={() => setActiveTab(tab.id)}
 className={cn(
 "w-full flex items-center gap-4 px-6 py-5 rounded-[28px] transition-all relative group",
 activeTab === tab.id 
 ? "bg-white shadow-xl shadow-slate-200/50 border border-blue-50 " 
 : "text-slate-600 hover:bg-white border-blue-100 shadow-sm "
 )}
 >
 <div className={cn(
 "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
 activeTab === tab.id ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-blue-50/50 text-slate-600"
 )}>
 <tab.icon className="w-6 h-6" />
 </div>
 <div className="text-left">
 <p className={cn("font-black text-sm", activeTab === tab.id ? "text-slate-900 " : "text-slate-600")}>{tab.label}</p>
 <p className="text-[10px] font-bold opacity-60 uppercase tracking-tighter">{tab.desc}</p>
 </div>
 {activeTab === tab.id && (
 <motion.div layoutId="settingActive" className="absolute right-4 w-1.5 h-1.5 bg-blue-600 rounded-full" />
 )}
 </button>
 ))}
 </div>

 {/* Main Content Area */}
 <div className="flex-1">
 <AnimatePresence mode="wait">
 {activeTab === "profile" && (
 <motion.div
 key="profile"
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: -20 }}
 className="bg-white rounded-[40px] shadow-sm p-10 space-y-12"
 >
 <div className="flex flex-col md:flex-row items-center gap-10">
 <div className="relative group">
 <div className="w-32 h-32 bg-blue-600 rounded-[40px] flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-blue-500/20 overflow-hidden">
 {userProfile ? `${userProfile.first_name?.[0]}${userProfile.last_name?.[0]}` : <User className="w-12 h-12" />}
 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm">
 <Camera className="w-8 h-8 text-white" />
 </div>
 </div>
 <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-2xl shadow-xl border border-blue-50 flex items-center justify-center text-slate-600 hover:scale-110 transition-transform">
 <Plus className="w-5 h-5" />
 </button>
 </div>
 <div>
 <h3 className="text-2xl font-black tracking-tight">Mon Profil Personnel</h3>
 <p className="text-slate-600 font-medium mt-1">Gérez vos informations de compte et votre identité.</p>
 <div className="flex gap-4 mt-6">
 <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest">{userProfile?.role || "Utilisateur"}</span>
 <span className="px-3 py-1 bg-blue-50/50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest">ID: {userProfile?.id?.slice(0,8)}</span>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
 {[
 { key: "first_name", label: "Prénom", icon: User },
 { key: "last_name", label: "Nom de Famille", icon: User },
 { key: "email", label: "Email (Lecture seule)", icon: Mail, disabled: true },
 { key: "phone", label: "Numéro de Mobile", icon: Zap },
 ].map((field) => (
 <div key={field.key} className="space-y-3">
 <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-4">{field.label}</label>
 <div className="relative">
 <field.icon className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
 <input 
 type="text" 
 disabled={field.disabled}
 value={userProfile?.[field.key] || ""}
 onChange={(e) => setUserProfile({ ...userProfile, [field.key]: e.target.value })}
 className={cn(
 "w-full pl-14 pr-6 py-4 bg-white border-blue-100 shadow-sm border-none rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner",
 field.disabled && "opacity-50 cursor-not-allowed"
 )}
 />
 </div>
 </div>
 ))}
 </div>

 <div className="pt-10 border-t border-slate-50 flex justify-between items-center">
 <div className="flex items-center gap-3 text-slate-600">
 <Cloud className="w-5 h-5" />
 <p className="text-[10px] font-black uppercase tracking-widest">Dernière sauvegarde: Automatique</p>
 </div>
 <button 
 onClick={handleSave}
 disabled={isSaving}
 className="flex items-center gap-2 px-10 py-4 bg-blue-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all hover:-translate-y-1"
 >
 {isSaving ? "Enregistrement..." : <><Save className="w-4 h-4" /> Sauvegarder</>}
 </button>
 </div>
 </motion.div>
 )}

 {activeTab === "hospital" && (
 <motion.div
 key="hospital"
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: -20 }}
 className="bg-white rounded-[40px] shadow-sm p-10 space-y-12"
 >
 <div className="flex flex-col md:flex-row items-center gap-10">
 <div className="relative group">
 <div className="w-32 h-32 bg-white border-blue-100 shadow-sm rounded-[40px] border-2 border-dashed border-slate-200 flex items-center justify-center text-blue-600 overflow-hidden shadow-inner">
 <Building2 className="w-12 h-12 opacity-20" />
 <div className="absolute inset-0 bg-blue-600/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm">
 <Camera className="w-8 h-8 text-white" />
 </div>
 </div>
 <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-2xl shadow-xl border border-blue-50 flex items-center justify-center text-slate-600 hover:scale-110 transition-transform">
 <Plus className="w-5 h-5" />
 </button>
 </div>
 <div>
 <h3 className="text-2xl font-black tracking-tight">Profil de l&apos;Établissement</h3>
 <p className="text-slate-600 font-medium mt-1">Ces informations apparaîtront sur vos factures et comptes-rendus.</p>
 <div className="flex gap-4 mt-6">
 <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest">Plan Premium</span>
 <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest">Compte Vérifié</span>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
 {[
 { key: "name", label: "Nom de l'Hôpital", icon: Building2 },
 { key: "email", label: "Email Professionnel", icon: Mail },
 { key: "phone", label: "Numéro de Téléphone", icon: Zap },
 { key: "address", label: "Adresse Géo", icon: Globe },
 ].map((field) => (
 <div key={field.key} className="space-y-3">
 <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-4">{field.label}</label>
 <div className="relative">
 <field.icon className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
 <input 
 type="text" 
 value={hospital?.[field.key] || ""}
 onChange={(e) => setHospital({ ...hospital, [field.key]: e.target.value })}
 className="w-full pl-14 pr-6 py-4 bg-white border-blue-100 shadow-sm border-none rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner"
 />
 </div>
 </div>
 ))}
 </div>

 <div className="pt-10 border-t border-slate-50 flex justify-between items-center">
 <div className="flex items-center gap-3 text-slate-600">
 <Cloud className="w-5 h-5" />
 <p className="text-[10px] font-black uppercase tracking-widest">Dernière sauvegarde: Automatique</p>
 </div>
 <button 
 onClick={handleSave}
 disabled={isSaving}
 className="flex items-center gap-2 px-10 py-4 bg-blue-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all hover:-translate-y-1"
 >
 {isSaving ? "Enregistrement..." : <><Save className="w-4 h-4" /> Sauvegarder</>}
 </button>
 </div>
 </motion.div>
 )}

 {activeTab === "branding" && (
 <motion.div
 key="branding"
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: -20 }}
 className="bg-white rounded-[40px] shadow-xl shadow-blue-900/5 p-10 space-y-12"
 >
 <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
 <div className="space-y-6">
 <h4 className="text-lg font-black tracking-tight">Identité Visuelle</h4>
 <div className="p-8 border-2 border-dashed border-blue-100 rounded-[32px] flex flex-col items-center gap-4 bg-blue-50/20">
 <Building2 className="w-12 h-12 text-blue-300" />
 <p className="text-[10px] font-black uppercase text-slate-500">Téléverser votre Logo</p>
 <button className="px-6 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase">Parcourir</button>
 </div>
 </div>
 <div className="space-y-6">
 <h4 className="text-lg font-black tracking-tight">Couleurs de l'Interface</h4>
 <div className="grid grid-cols-4 gap-4">
 {['#2563eb', '#10b981', '#f59e0b', '#ef4444'].map(color => (
 <button key={color} className="w-full h-12 rounded-2xl border border-blue-50 shadow-sm transition-transform hover:scale-110" style={{ backgroundColor: color }} />
 ))}
 </div>
 <p className="text-xs text-slate-500 font-medium italic">Sélectionnez la couleur dominante de votre ERP.</p>
 </div>
 </div>
 </motion.div>
 )}

 {activeTab === "ai" && (
 <motion.div
 key="ai"
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: -20 }}
 className="bg-white rounded-[40px] shadow-xl shadow-blue-900/5 p-10 space-y-12"
 >
 <div className="flex items-center gap-8 p-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[32px] text-white">
 <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-xl">
 <Zap className="w-10 h-10 text-white animate-pulse" />
 </div>
 <div>
 <h3 className="text-2xl font-black">Akwaba AI Core</h3>
 <p className="opacity-80 text-sm">Moteur d'assistance au diagnostic et analyse prédictive.</p>
 </div>
 </div>

 <div className="space-y-8">
 <div className="flex justify-between items-center p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
 <div>
 <p className="font-black text-slate-900">Assistance au Diagnostic</p>
 <p className="text-xs text-slate-500">Proposer des diagnostics basés sur les symptômes.</p>
 </div>
 <div className="w-12 h-6 bg-blue-600 rounded-full relative"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" /></div>
 </div>
 <div className="flex justify-between items-center p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
 <div>
 <p className="font-black text-slate-900">Transcription Vocale</p>
 <p className="text-xs text-slate-500">Saisie des notes médicales par la voix.</p>
 </div>
 <div className="w-12 h-6 bg-blue-600 rounded-full relative"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" /></div>
 </div>
 </div>
 </motion.div>
 )}

 {activeTab === "security" && (
 <motion.div
 key="security"
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: -20 }}
 className="bg-white rounded-[40px] shadow-sm p-10 space-y-12"
 >
 <div>
 <h3 className="text-2xl font-black tracking-tight mb-2">Sécurité du Compte</h3>
 <p className="text-slate-600 font-medium">Protégez les données sensibles de vos patients.</p>
 </div>
 
 <div className="space-y-6">
 <div className="p-8 bg-white border-blue-100 shadow-sm /50 rounded-[32px] border border-blue-50 flex justify-between items-center">
 <div className="flex gap-6 items-center">
 <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-[20px] flex items-center justify-center">
 <Lock className="w-7 h-7" />
 </div>
 <div>
 <p className="font-black text-slate-900 tracking-tight">Authentification à deux facteurs</p>
 <p className="text-xs text-slate-600 font-medium">Ajoute une étape de validation via mobile.</p>
 </div>
 </div>
 <button className="px-6 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Activer</button>
 </div>

 <div className="p-8 bg-white border-blue-100 shadow-sm /50 rounded-[32px] border border-blue-50 flex justify-between items-center">
 <div className="flex gap-6 items-center">
 <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-[20px] flex items-center justify-center">
 <ShieldCheck className="w-7 h-7" />
 </div>
 <div>
 <p className="font-black text-slate-900 tracking-tight">Journal des Accès</p>
 <p className="text-xs text-slate-600 font-medium">Consulter l&apos;historique des connexions.</p>
 </div>
 </div>
 <button className="px-6 py-2 bg-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">Consulter</button>
 </div>
 </div>
 </motion.div>
 )}

 {activeTab === "notifications" && (
 <motion.div
 key="notifications"
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: -20 }}
 className="bg-white rounded-[40px] shadow-sm p-10 space-y-12"
 >
 <div>
 <h3 className="text-2xl font-black tracking-tight mb-2">Communications</h3>
 <p className="text-slate-600 font-medium">Gérez les alertes SMS et Email envoyées aux patients.</p>
 </div>
 <div className="space-y-6">
 <div className="p-8 bg-white border-blue-100 shadow-sm /50 rounded-[32px] border border-blue-50 flex justify-between items-center">
 <p className="font-black">Rappels de Rendez-vous SMS</p>
 <div className="w-12 h-6 bg-blue-600 rounded-full relative"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" /></div>
 </div>
 <div className="p-8 bg-white border-blue-100 shadow-sm /50 rounded-[32px] border border-blue-50 flex justify-between items-center">
 <p className="font-black">Envoi Factures par Email</p>
 <div className="w-12 h-6 bg-slate-200 rounded-full relative"><div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full" /></div>
 </div>
 </div>
 </motion.div>
 )}

 {activeTab === "billing" && (
 <motion.div
 key="billing"
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: -20 }}
 className="bg-white rounded-[40px] shadow-sm p-10 space-y-12"
 >
 <div className="p-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[40px] text-white">
 <h3 className="text-3xl font-black mb-2">Plan Enterprise</h3>
 <p className="opacity-80">Votre prochain prélèvement est prévu le 01 Juin 2026.</p>
 <div className="mt-10 pt-10 border-t border-white/10 flex justify-between items-end">
 <div>
 <p className="text-4xl font-black">150.000 CFA <span className="text-sm font-medium opacity-60">/ mois</span></p>
 </div>
 <button className="px-8 py-4 bg-white text-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Gérer l&apos;Abonnement</button>
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 </div>
 </div>
 );
}
