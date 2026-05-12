"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Activity, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  ChevronRight,
  HeartPulse,
  Sparkles,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { setDemoSession } from "@/lib/demo-mode";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const enterDemo = () => {
    setDemoSession();
    router.push("/dashboard");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!isSupabaseConfigured) {
      setError("Supabase n’est pas configuré. Ajoutez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY, ou utilisez le mode démo.");
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors de la connexion");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans text-slate-900">
      {/* Left Side: Login Form */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-8 sm:px-12 lg:px-24 py-12 relative overflow-hidden">
        {/* Background Decorative Element */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-50/50 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none" />
        
        <div className="max-w-md w-full mx-auto relative z-10">
          {/* Logo Section */}
          <div className="flex flex-col items-center lg:items-start mb-12">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-xl shadow-blue-200/20 mb-4 group hover:rotate-3 transition-transform duration-300 p-2 border border-slate-100">
              <img src="/logo.png" alt="Akwaba Health Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-1">AKWABA HEALTH</h1>
            <p className="text-slate-500 font-medium tracking-widest uppercase text-xs">Simplement Efficace</p>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-2xl font-bold text-slate-800">Bienvenue</h2>
            <p className="text-slate-500 mt-2">
              Connectez-vous pour accéder à votre espace hospitalier. 
              Pas encore de compte ? <Link href="/register" className="text-blue-600 font-bold hover:underline">Inscrivez votre établissement</Link>
            </p>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium"
              >
                {error}
              </motion.div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Adresse Email</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@hopital.ci"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-800 font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-bold text-slate-700">Mot de passe</label>
                <Link href="#" className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-800 font-medium"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 px-1">
              <input 
                type="checkbox" 
                id="remember" 
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="remember" className="text-sm font-medium text-slate-600 cursor-pointer select-none">
                Se rappeler de moi
              </label>
            </div>

            {!isSupabaseConfigured && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-amber-900 text-sm font-medium leading-relaxed">
                Les variables Supabase sont absentes (.env.local). Vous pouvez quand même parcourir l’interface avec le mode démo ci-dessous.
              </div>
            )}

            <motion.button 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={isLoading}
              type="submit"
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                <>
                  Connexion
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>

            <button
              type="button"
              onClick={enterDemo}
              className="w-full py-3.5 border-2 border-blue-200 bg-white text-blue-700 rounded-2xl font-bold text-sm hover:bg-blue-50 transition-all"
            >
              Explorer le tableau de bord (mode démo)
            </button>
          </form>

          {/* Hospital Footer Info */}
          <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
             <div className="flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-red-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Certifié Standard Santé</span>
             </div>
             <p className="text-[10px] font-bold text-slate-400">© 2026 Akwaba Health ERP</p>
          </div>
        </div>
      </div>

      {/* Right Side: Inspiration Section */}
      <div className="hidden lg:flex flex-1 relative bg-slate-900 items-center justify-center p-16 overflow-hidden">
        {/* Background Image / Pattern */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
           <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,#3b82f6_0%,transparent_50%)]" />
           <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,#0ea5e9_0%,transparent_50%)]" />
        </div>

        {/* Dynamic Pattern Overlay */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        <div className="max-w-xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-[10px] font-bold text-white uppercase tracking-wider">Inspiration Médicale</span>
            </div>

            <blockquote className="text-4xl md:text-5xl font-bold text-white leading-tight">
              &ldquo;La santé est la plus grande des richesses, et la guérison est un voyage vers l&apos;équilibre.&rdquo;
            </blockquote>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-[1px] bg-blue-500" />
              <p className="text-blue-400 font-bold tracking-widest uppercase text-sm">Akwaba Health Philosophie</p>
            </div>

            <p className="text-slate-400 text-lg leading-relaxed">
              Nous croyons qu&apos;une gestion hospitalière fluide est le premier pas vers des soins d&apos;excellence. Akwaba Health simplifie vos processus pour que vous puissiez vous concentrer sur l&apos;essentiel : <b>sauver des vies</b>.
            </p>
          </motion.div>
        </div>

        {/* Floating Stats or Badges */}
        <div className="absolute bottom-12 right-12 flex gap-4">
           <div className="px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
              <p className="text-xs text-slate-500 font-bold uppercase">Uptime</p>
              <p className="text-white font-bold tracking-tight">99.99%</p>
           </div>
           <div className="px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
              <p className="text-xs text-slate-500 font-bold uppercase">Sécurité</p>
              <p className="text-white font-bold tracking-tight">AES-256</p>
           </div>
        </div>
      </div>
    </div>
  );
}
