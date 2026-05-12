"use client";

import { motion } from "framer-motion";
import { 
  Activity, 
  Users, 
  Calendar, 
  Stethoscope, 
  Pill, 
  Beaker, 
  Bed, 
  ShieldCheck, 
  TrendingUp, 
  Globe, 
  Smartphone,
  ChevronRight
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Activity className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-emerald-600">
                AKWABA HEALTH
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
              <a href="#features" className="hover:text-blue-600 transition-colors">Fonctionnalités</a>
              <a href="#solutions" className="hover:text-blue-600 transition-colors">Solutions</a>
              <a href="#pricing" className="hover:text-blue-600 transition-colors">Tarifs</a>
              <Link href="/login" className="px-5 py-2 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                Connexion
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-400 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-semibold tracking-widest text-blue-600 uppercase bg-blue-50 rounded-full">
              SaaS Médical de Nouvelle Génération
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.1]">
              Propulsez votre Hôpital <br /> 
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-blue-500 to-emerald-500">
                dans l&apos;ère du Digital
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-slate-600 mb-10 leading-relaxed">
              AKWABA HEALTH est la plateforme SaaS ultra-moderne conçue pour les hôpitaux africains. 
              Gérez vos patients, votre pharmacie et vos finances avec une efficacité inégalée.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 group">
                Commencer <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all text-center">
                Espace Hospitalier
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-16 relative"
          >
            <div className="relative mx-auto max-w-5xl rounded-3xl overflow-hidden border border-slate-200 shadow-2xl bg-white p-2">
              <div className="bg-slate-50 rounded-2xl w-full aspect-video flex items-center justify-center">
                 <span className="text-slate-400 font-medium">Dashboard Preview Placeholder</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Une gestion complète à 360°</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Tous les outils dont vous avez besoin pour piloter votre établissement de santé en une seule interface intuitive.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Users className="w-6 h-6" />}
              title="Dossier Patient Numérique"
              description="Accès instantané à l'historique médical, allergies et documents de chaque patient."
            />
            <FeatureCard 
              icon={<Calendar className="w-6 h-6" />}
              title="Gestion des Rendez-vous"
              description="Calendrier intelligent avec rappels SMS/WhatsApp automatiques pour réduire les absences."
            />
            <FeatureCard 
              icon={<Stethoscope className="w-6 h-6" />}
              title="Consultation Médicale"
              description="Diagnostic assisté, prescriptions électroniques et suivi des constantes vitales."
            />
            <FeatureCard 
              icon={<Pill className="w-6 h-6" />}
              title="Pharmacie & Stocks"
              description="Inventaire en temps réel, alertes péremption et liaison directe avec les prescriptions."
            />
            <FeatureCard 
              icon={<Beaker className="w-6 h-6" />}
              title="Laboratoire Intégré"
              description="Gestion des analyses, upload de rapports et validation biologique sécurisée."
            />
            <FeatureCard 
              icon={<TrendingUp className="w-6 h-6" />}
              title="Finance & Facturation"
              description="Paiements mobiles (Wave, Orange), gestion des assurances et comptabilité journalière."
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <div className="text-blue-100 text-sm">Disponibilité</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">256+</div>
              <div className="text-blue-100 text-sm">Hôpitaux</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">1M+</div>
              <div className="text-blue-100 text-sm">Patients gérés</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-blue-100 text-sm">Support technique</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="text-blue-400 w-6 h-6" />
              <span className="text-2xl font-bold tracking-tight">AKWABA HEALTH</span>
            </div>
            <p className="text-slate-400 max-w-sm">
              La plateforme SaaS de référence pour la transformation digitale des systèmes de santé en Afrique. 
              Sécurisé, rapide et évolutif.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-6">Produit</h4>
            <ul className="space-y-4 text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">Fonctionnalités</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Tarifs</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Sécurité</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6">Contact</h4>
            <ul className="space-y-4 text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Partenariats</a></li>
              <li><a href="#" className="hover:text-white transition-colors">À propos</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-12 mt-12 border-t border-slate-800 text-center text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} AKWABA HEALTH. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 bg-white rounded-3xl border border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50 transition-all group">
      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
