"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Building2, 
  Mail, 
  Lock, 
  User, 
  Phone,
  ChevronRight,
  Loader2,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    hospitalName: "",
    adminName: "",
    email: "",
    password: "",
    phone: "",
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!isSupabaseConfigured) {
      setError(
        "Configuration Supabase manquante : renseignez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans frontend/.env.local."
      );
      setIsLoading(false);
      return;
    }

    try {
      // 1. Create User
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Erreur lors de la création du compte.");

      // 2. Create Hospital
      const { data: hospital, error: hError } = await supabase
        .from("hospitals")
        .insert([{ name: formData.hospitalName }])
        .select()
        .single();

      if (hError) throw hError;

      // 3. Create Admin Profile
      const { error: pError } = await supabase
        .from("profiles")
        .insert([
          {
            id: authData.user.id,
            hospital_id: hospital.id,
            first_name: formData.adminName.split(" ")[0],
            last_name: formData.adminName.split(" ").slice(1).join(" ") || "Admin",
            role: "ADMIN",
            email: formData.email,
          },
        ]);

      if (pError) throw pError;

      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white p-10 rounded-3xl shadow-2xl text-center space-y-6"
        >
          <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Compte créé avec succès !</h2>
          <p className="text-slate-500">Votre établissement <b>{formData.hospitalName}</b> a été enregistré. Vous allez être redirigé vers la page de connexion.</p>
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white font-sans text-slate-900">
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-8 sm:px-12 lg:px-24 py-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-50/50 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none" />
        
        <div className="max-w-md w-full mx-auto relative z-10">
          <div className="flex flex-col items-center lg:items-start mb-8">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-xl shadow-blue-200/20 mb-4 p-2 border border-slate-100">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-1">AKWABA HEALTH</h1>
            <p className="text-slate-500 font-medium tracking-widest uppercase text-xs">Simplement Efficace</p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Inscrivez votre établissement</h2>
            <p className="text-slate-500 mt-2">Rejoignez la révolution numérique de la santé en Côte d&apos;Ivoire.</p>
          </div>

          <form className="space-y-4" onSubmit={handleRegister}>
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium">
                {error}
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 ml-1">Nom de l&apos;Hôpital / Clinique</label>
              <div className="relative group">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500" />
                <input required type="text" placeholder="Clinique Akwaba" className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none" onChange={e => setFormData({...formData, hospitalName: e.target.value})} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 ml-1">Nom du Responsable</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500" />
                <input required type="text" placeholder="Jean Kouassi" className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none" onChange={e => setFormData({...formData, adminName: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 ml-1">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input required type="email" placeholder="admin@clinique.ci" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none" onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 ml-1">Téléphone</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input required type="tel" placeholder="0700000000" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none" onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 ml-1">Mot de passe</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input required type="password" placeholder="••••••••••••" className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none" onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
            </div>

            <button disabled={isLoading} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 mt-4">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Créer mon espace <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Déjà inscrit ? <Link href="/login" className="text-blue-600 font-bold hover:underline">Connectez-vous ici</Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 relative bg-slate-900 items-center justify-center p-16">
        <div className="max-w-xl relative z-10 text-white space-y-6">
           <h2 className="text-5xl font-black leading-tight">Digitalisez vos soins aujourd&apos;hui.</h2>
           <p className="text-xl text-slate-400 leading-relaxed">AKWABA HEALTH offre une suite complète d&apos;outils pour gérer vos patients, votre pharmacie et vos finances en toute simplicité.</p>
           <div className="flex gap-8 mt-12">
              <div>
                <p className="text-4xl font-black text-blue-500">100%</p>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Ivoirien</p>
              </div>
              <div>
                <p className="text-4xl font-black text-sky-400">Sécurisé</p>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Données cryptées</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
