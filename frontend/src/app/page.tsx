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
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#f0f7ff] to-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-blue-100/80 shadow-sm shadow-blue-500/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Activity className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500">
                AKWABA HEALTH
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
              <a href="#features" className="hover:text-blue-600 transition-colors">Fonctionnalités</a>
              <a href="#solutions" className="hover:text-blue-600 transition-colors">Solutions</a>
              <a href="#pricing" className="hover:text-blue-600 transition-colors">Tarifs</a>
              <div className="flex items-center gap-3">
                <Link href="/login" className="px-5 py-2 border-2 border-blue-600 text-blue-600 rounded-full hover:bg-blue-50 font-bold transition-all">
                  Démo
                </Link>
                <Link href="/login" className="px-5 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 font-bold">
                  Espace Pro
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-35">
          <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-blue-300 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-sky-300 blur-[120px] rounded-full" />
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
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500">
                dans l&apos;ère du Digital
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-slate-600 mb-10 leading-relaxed">
              AKWABA HEALTH est la plateforme SaaS ultra-moderne conçue pour les hôpitaux africains. 
              Gérez vos patients, votre pharmacie et vos finances avec une efficacité inégalée.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 group">
                Essayer Gratuitement <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-white text-blue-800 border-2 border-blue-200 rounded-2xl font-bold text-lg hover:bg-blue-50 transition-all text-center shadow-sm shadow-blue-500/10 flex items-center justify-center gap-2">
                <Smartphone className="w-5 h-5" /> Accès Démo
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-16 relative"
          >
            <div className="relative mx-auto max-w-5xl rounded-3xl overflow-hidden border border-blue-100 shadow-2xl shadow-blue-500/15 bg-white p-2">
              <div className="bg-gradient-to-br from-blue-50 via-white to-sky-50 rounded-2xl w-full aspect-video flex flex-col items-center justify-center gap-3 border border-blue-50">
                 <Activity className="w-14 h-14 text-blue-500 opacity-90" />
                 <span className="text-blue-900/55 font-semibold text-sm tracking-wide uppercase">Tableau de bord — clinique digitale</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-white border-y border-blue-50">
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

      <section id="solutions" className="py-20 bg-white border-y border-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Solutions pour chaque service</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Urgences, médecine générale, maternité ou admin : les modules AKWABA HEALTH partagent le même dossier
              patient et la même base sécurisée.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { t: "Bloc & Hospitalisation", d: "Lits, admissions et sorties suivis en temps réel." },
              { t: "Ambulatoire & RDV", d: "Agenda médecins, file d’attente et historique des consultations." },
              { t: "Support & conformité", d: "Traçabilité des factures, analyses et prescriptions." },
            ].map((x) => (
              <div key={x.t} className="p-8 rounded-3xl border border-blue-100 bg-blue-50/30">
                <h3 className="font-bold text-slate-900 mb-2">{x.t}</h3>
                <p className="text-sm text-slate-600">{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-24 bg-[#f0f7ff]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Tarifs transparents</h2>
            <p className="text-slate-600">Choisissez l’échelle adaptée à votre structure ; passage à l’échelle sans friction.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Essentiel", price: "25 000", period: "/mois", desc: "Idéal pour les petites cliniques de quartier.", feats: ["Jusqu’à 10 lits", "Dossiers Patients illimités", "Pharmacie standard", "Support email 24/7"] },
              { name: "Premium", price: "75 000", period: "/mois", desc: "Le pack complet pour les centres hospitaliers.", feats: ["Lits illimités", "Laboratoire intégré", "Facturation Wave/OM", "Rôles d'accès avancés"], highlight: true },
              { name: "Hôpital Gnl", price: "Sur Devis", period: "", desc: "Solutions personnalisées pour grands établissements.", feats: ["Multi-sites & Réseau", "Formation sur site", "SLA Garanti 99.9%", "Intégrations API sur mesure"] },
            ].map((p) => (
              <motion.div
                key={p.name}
                whileHover={{ y: -10 }}
                className={`relative rounded-[40px] p-10 border bg-white flex flex-col ${p.highlight ? "border-blue-600 shadow-2xl shadow-blue-600/20 ring-1 ring-blue-600" : "border-blue-100 shadow-xl shadow-blue-900/5"}`}
              >
                {p.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                    Recommandé
                  </div>
                )}
                <h3 className="font-black text-xl text-slate-900 uppercase tracking-tight">{p.name}</h3>
                <p className="text-sm text-slate-500 font-medium mt-2">{p.desc}</p>
                
                <div className="mt-8 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">{p.price}</span>
                  <span className="text-sm font-bold text-slate-400">{p.price === "Sur Devis" ? "" : "CFA"}</span>
                  <span className="text-sm font-bold text-slate-400">{p.period}</span>
                </div>

                <ul className="mt-10 space-y-4 flex-1">
                  {p.feats.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm font-medium text-slate-600">
                      <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/login"
                  className={`mt-10 block text-center py-4 rounded-2xl font-black text-xs uppercase tracking-[0.1em] transition-all ${p.highlight ? "bg-blue-600 text-white shadow-xl shadow-blue-600/30 hover:bg-blue-700" : "bg-slate-50 text-blue-900 hover:bg-blue-100"}`}
                >
                  Démarrer maintenant
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-700 via-blue-600 to-sky-600">
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
      <footer className="bg-[#0c2d4a] text-white py-12 px-4 border-t border-blue-400/20">
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
        <div className="max-w-7xl mx-auto pt-12 mt-12 border-t border-blue-500/20 text-center text-blue-200/70 text-sm">
          &copy; {new Date().getFullYear()} AKWABA HEALTH. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 bg-white rounded-3xl border border-blue-100/80 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/10 transition-all group">
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
