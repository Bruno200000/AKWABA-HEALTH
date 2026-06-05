"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bed,
  Calendar,
  CreditCard,
  FileText,
  FlaskConical,
  Mic,
  Pill,
  Settings,
  Stethoscope,
  Users,
} from "lucide-react";

const workflows = [
  {
    title: "Accueil et dossier patient",
    description: "Creez le patient, retrouvez son dossier, puis suivez ses consultations, examens, factures et admissions.",
    href: "/dashboard/patients",
    icon: Users,
  },
  {
    title: "Rendez-vous et consultations",
    description: "Planifiez un rendez-vous, ouvrez la consultation, saisissez le diagnostic et produisez les documents medicaux.",
    href: "/dashboard/appointments",
    icon: Stethoscope,
  },
  {
    title: "Laboratoire",
    description: "Prescrivez une analyse, suivez son statut, saisissez le resultat et exportez le rapport.",
    href: "/dashboard/laboratory",
    icon: FlaskConical,
  },
  {
    title: "Pharmacie",
    description: "Gerez le stock, surveillez les alertes, enregistrez les ventes POS et exportez les rapports.",
    href: "/dashboard/pharmacy",
    icon: Pill,
  },
  {
    title: "Hospitalisation",
    description: "Configurez les chambres, admettez les patients, suivez les lits occupes et liberez les chambres.",
    href: "/dashboard/hospitalization",
    icon: Bed,
  },
  {
    title: "Finance",
    description: "Creez les factures, enregistrez les paiements, controlez les impayes et exportez les rapports.",
    href: "/dashboard/finance",
    icon: CreditCard,
  },
];

const tips = [
  { icon: Mic, title: "Recherche vocale", text: "Cliquez sur le micro en haut, dites patient, pharmacie, rendez-vous ou finance, puis l'application ouvre le module." },
  { icon: FileText, title: "Exports", text: "Les listes principales proposent PDF et CSV pour les donnees affichees a l'ecran." },
  { icon: Settings, title: "Integrations", text: "Dans Parametres, ouvrez une application, renseignez les API, puis cliquez sur Connecter l'API." },
  { icon: Calendar, title: "Organisation", text: "Les rendez-vous, plannings et admissions aident a organiser le parcours patient." },
];

export default function GuidePage() {
  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Guide d'utilisation</h1>
        <p className="max-w-3xl text-sm font-medium leading-relaxed text-slate-600">
          Cet espace resume le fonctionnement de AKWABA HEALTH et les chemins principaux pour gerer un etablissement medical.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {tips.map((tip) => (
          <div key={tip.title} className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <tip.icon className="h-5 w-5" />
            </div>
            <h2 className="text-sm font-black text-slate-900">{tip.title}</h2>
            <p className="mt-2 text-xs font-medium leading-relaxed text-slate-500">{tip.text}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {workflows.map((flow, index) => (
          <Link
            key={flow.title}
            href={flow.href}
            className="group rounded-2xl border border-blue-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg"
          >
            <div className="flex items-start gap-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <flow.icon className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-500">Etape {index + 1}</p>
                <h2 className="mt-1 text-lg font-black text-slate-900">{flow.title}</h2>
                <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">{flow.description}</p>
              </div>
              <ArrowRight className="mt-2 h-5 w-5 shrink-0 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-blue-600" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
