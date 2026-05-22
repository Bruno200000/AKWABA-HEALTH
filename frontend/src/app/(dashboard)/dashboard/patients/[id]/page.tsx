"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
 User, 
 Calendar, 
 FileText, 
 Clock, 
 Activity, 
 Pill, 
 Beaker, 
 Bed, 
 CreditCard,
 ChevronLeft,
 Download,
 Printer,
 Plus,
 AlertCircle,
 Stethoscope,
 Heart,
 Sparkles,
 ShieldCheck,
 HeartPulse
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { QRCodeSVG } from "qrcode.react";
import { Modal } from "@/components/ui/modal";
import ConsultationForm from "../../consultations/ConsultationForm";

export default function PatientDetailPage() {
 const { id } = useParams();
 const router = useRouter();
 const [activeTab, setActiveTab] = useState("overview");
 const [patient, setPatient] = useState<any>(null);
 const [isLoading, setIsLoading] = useState(true);
 const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
 const [history, setHistory] = useState<any>({
 consultations: [],
 appointments: [],
 admissions: [],
 invoices: [],
 labTests: []
 });

 useEffect(() => {
 fetchPatientData();
 }, [id]);

 const fetchPatientData = async () => {
 setIsLoading(true);
 const { data: pData } = await supabase
 .from("patients")
 .select("*")
 .eq("id", id)
 .single();

 if (!pData) {
 router.push("/dashboard/patients");
 return;
 }
 setPatient(pData);

 const [cons, apps, adms, invs, labs] = await Promise.all([
 supabase.from("consultations").select("*, profiles(first_name, last_name)").eq("patient_id", id).order("created_at", { ascending: false }),
 supabase.from("appointments").select("*, profiles(first_name, last_name)").eq("patient_id", id).order("start_time", { ascending: false }),
 supabase.from("admissions").select("*, rooms(room_number)").eq("patient_id", id).order("admission_date", { ascending: false }),
 supabase.from("invoices").select("*").eq("patient_id", id).order("created_at", { ascending: false }),
 supabase.from("lab_tests").select("*, profiles(first_name, last_name)").eq("patient_id", id).order("created_at", { ascending: false })
 ]);

 setHistory({
 consultations: cons.data || [],
 appointments: apps.data || [],
 admissions: adms.data || [],
 invoices: invs.data || [],
 labTests: labs.data || []
 });
 setIsLoading(false);
 };

 const tabs = [
 { id: "overview", label: "Vue d'ensemble", icon: Activity },
 { id: "consultations", label: "Consultations", icon: Stethoscope },
 { id: "appointments", label: "Rendez-vous", icon: Calendar },
 { id: "lab", label: "Laboratoire", icon: Beaker },
 { id: "hospitalization", label: "Hospitalisation", icon: Bed },
 { id: "finance", label: "Finance", icon: CreditCard },
 ];

 const latestConsultation = history.consultations[0];
 const latestVitals = latestConsultation?.vital_signs || {};
 const hasBloodPressure = latestVitals.bp_systolic && latestVitals.bp_diastolic;
 const medicalDocuments = [
 ...history.consultations.map((item: any) => ({
 id: `consultation-${item.id}`,
 label: `Consultation - ${item.diagnosis || "Sans diagnostic"}`,
 date: item.created_at,
 type: "Consultation",
 href: `/dashboard/print/prescription/${item.id}`,
 })),
 ...history.labTests
 .filter((item: any) => item.status === "COMPLETED")
 .map((item: any) => ({
 id: `lab-${item.id}`,
 label: `Resultat labo - ${item.test_type}`,
 date: item.completed_at || item.created_at,
 type: "Laboratoire",
 href: null,
 })),
 ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

 if (isLoading) {
 return (
 <div className="flex items-center justify-center min-h-[60vh]">
 <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full" />
 </div>
 );
 }

 return (
 <div className="space-y-6 pb-20">
 {/* Header & Quick Actions */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
 <button 
 onClick={() => router.back()}
 className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors font-bold text-sm"
 >
 <ChevronLeft className="w-4 h-4" /> Retour à la liste
 </button>
 <div className="flex gap-2">
 <button className="flex items-center gap-2 px-4 py-2 bg-white  rounded-xl text-xs font-bold hover:bg-white border-blue-100 shadow-sm transition-all">
 <Printer className="w-4 h-4" /> Imprimer Dossier
 </button>
 <button 
 onClick={() => setIsConsultationModalOpen(true)}
 className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 "
 >
 <Plus className="w-4 h-4" /> Nouvelle Consultation
 </button>
 </div>
 </div>

 {/* Profile Card */}
 <div className="bg-white rounded-3xl  shadow-sm overflow-hidden">
 <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
 <div className="absolute -bottom-12 left-8 p-1 bg-white rounded-3xl">
 <div className="w-24 h-24 bg-blue-50/50 rounded-2xl flex items-center justify-center">
 <User className="w-12 h-12 text-slate-600" />
 </div>
 </div>
 </div>
 <div className="pt-16 pb-8 px-8 flex flex-col md:flex-row justify-between items-start gap-8">
 <div className="space-y-2">
 <div className="flex items-center gap-3">
 <h1 className="text-3xl font-black tracking-tight">{patient.first_name} {patient.last_name}</h1>
 <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">{patient.file_number}</span>
 </div>
 <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 font-medium">
 <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {patient.birth_date ? format(new Date(patient.birth_date), 'dd MMMM yyyy', { locale: fr }) : "N/A"}</span>
 <span className="flex items-center gap-1.5"><Heart className="w-4 h-4 text-red-500" /> Groupe: {patient.blood_group || "N/A"}</span>
 <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> Inscrit le {format(new Date(patient.created_at), 'dd/MM/yyyy')}</span>
 </div>
 </div>

 <div className="flex gap-6 items-center p-4 bg-white border-blue-100 shadow-sm /50 rounded-2xl border border-blue-50 ">
 <div className="text-center">
 <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">QR Accès Rapide</p>
 <div className="p-1.5 bg-white rounded-lg shadow-sm">
 <QRCodeSVG value={`akwaba:patient:${patient.id}`} size={64} />
 </div>
 </div>
 <div className="h-10 w-[1px] bg-slate-200 " />
 <div className="space-y-1">
 <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Contact</p>
 <p className="text-sm font-bold">{patient.phone || "Non renseigné"}</p>
 <p className="text-xs text-slate-600">{patient.email || "Pas d'email"}</p>
 </div>
 </div>
 </div>
 </div>

 {/* Navigation Tabs */}
 <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
 {tabs.map((tab) => (
 <button
 key={tab.id}
 onClick={() => setActiveTab(tab.id)}
 className={cn(
 "flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap",
 activeTab === tab.id 
 ? "bg-blue-600 text-white shadow-lg" 
 : "bg-white text-slate-600  hover:bg-white border-blue-100 shadow-sm"
 )}
 >
 <tab.icon className="w-4 h-4" />
 {tab.label}
 </button>
 ))}
 </div>

 {/* Tab Content */}
 <AnimatePresence mode="wait">
 <motion.div
 key={activeTab}
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 transition={{ duration: 0.2 }}
 >
 {activeTab === "overview" && (
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 {/* Left Column: Alerts & Medical Info */}
 <div className="md:col-span-2 space-y-6">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {/* Allergies */}
 <div className="bg-red-50 border border-red-100 p-6 rounded-3xl">
 <div className="flex items-center gap-3 text-red-600 mb-4">
 <AlertCircle className="w-5 h-5" />
 <h3 className="font-black uppercase text-xs tracking-widest">Allergies</h3>
 </div>
 <div className="flex flex-wrap gap-2">
 {patient.allergies?.length > 0 ? patient.allergies.map((a: string) => (
 <span key={a} className="px-3 py-1.5 bg-white border border-red-200 text-red-700 text-xs font-bold rounded-xl shadow-sm">{a}</span>
 )) : <p className="text-sm text-red-400 font-medium">Aucune allergie répertoriée</p>}
 </div>
 </div>

 {/* Insurance */}
 <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-3xl">
 <div className="flex items-center gap-3 text-indigo-600 mb-4">
 <ShieldCheck className="w-5 h-5" />
 <h3 className="font-black uppercase text-xs tracking-widest">Assurance</h3>
 </div>
 {patient.insurance_provider ? (
 <div className="space-y-1">
 <p className="text-sm font-bold text-indigo-900 ">{patient.insurance_provider}</p>
 <p className="text-xs text-indigo-600 font-medium">Police: {patient.insurance_number}</p>
 </div>
 ) : (
 <p className="text-sm text-indigo-400 font-medium">Non assuré / Particulier</p>
 )}
 </div>
 </div>

 {/* Medical History */}
 <div className="bg-white p-6 rounded-3xl  shadow-sm">
 <h3 className="font-black uppercase text-xs tracking-widest text-slate-600 mb-6 flex items-center gap-2">
 <HeartPulse className="w-4 h-4 text-red-500" /> Antécédents Médicaux
 </h3>
 <div className="p-4 bg-white border-blue-100 shadow-sm /50 rounded-2xl border border-blue-50 ">
 <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
 {patient.medical_history?.notes || "Aucun antécédent particulier renseigné."}
 </p>
 </div>
 </div>

 <div className="bg-white p-6 rounded-3xl  shadow-sm">
 <h3 className="font-black uppercase text-xs tracking-widest text-slate-600 mb-6 flex items-center gap-2">
 <Clock className="w-4 h-4" /> Activité Récente
 </h3>
 <div className="space-y-6">
 {history.consultations.slice(0, 3).map((c: any, i: number) => (
 <div key={c.id} className="relative pl-6 before:absolute before:left-0 before:top-2 before:bottom-0 before:w-0.5 before:bg-blue-50/50 ">
 <div className="absolute left-[-4px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white " />
 <div className="flex justify-between items-start">
 <div>
 <p className="text-xs text-slate-600 font-bold mb-1">{format(new Date(c.created_at), 'dd MMMM yyyy', { locale: fr })}</p>
 <h4 className="font-bold text-sm">Consultation - {c.diagnosis || "Contrôle routine"}</h4>
 <p className="text-xs text-slate-600 mt-1">Par Dr. {c.profiles?.last_name}</p>
 </div>
 <button className="text-[10px] font-black text-blue-600 uppercase hover:underline">Détails</button>
 </div>
 </div>
 ))}
 {history.consultations.length === 0 && <p className="text-sm text-slate-600 text-center py-4">Aucune activité enregistrée</p>}
 </div>
 </div>
 </div>

 {/* Right Column: Vitals & Documents */}
 <div className="space-y-6">
 {/* Clinical Summary */}
 <div className="bg-blue-600 text-white p-6 rounded-3xl border border-white/10 shadow-xl relative overflow-hidden group">
 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
 <Sparkles className="w-12 h-12" />
 </div>
 <h3 className="font-black uppercase text-[10px] tracking-widest text-blue-400 mb-4 flex items-center gap-2">
 <Sparkles className="w-3 h-3" /> Resume Clinique
 </h3>
 <div className="space-y-3 relative z-10">
 <p className="text-xs leading-relaxed text-slate-300">
 {latestConsultation
 ? `Derniere consultation: ${latestConsultation.diagnosis || "diagnostic non renseigne"}.`
 : "Aucune consultation enregistree pour ce patient."}
 </p>
 </div>
 </div>

 <div className="bg-white p-6 rounded-3xl  shadow-sm">
 <h3 className="font-black uppercase text-xs tracking-widest text-slate-600 mb-6 flex items-center gap-2">
 <Activity className="w-4 h-4" /> Dernières Constantes
 </h3>
 <div className="grid grid-cols-2 gap-4">
 <div className="p-4 bg-white border-blue-100 shadow-sm rounded-2xl border border-blue-50 ">
 <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Tension</p>
 <p className="text-lg font-black text-slate-900 ">
 {hasBloodPressure ? `${latestVitals.bp_systolic}/${latestVitals.bp_diastolic}` : "Non renseigne"}
 {hasBloodPressure && <span className="text-[10px] font-bold text-slate-600 ml-1">mmHg</span>}
 </p>
 </div>
 <div className="p-4 bg-white border-blue-100 shadow-sm rounded-2xl border border-blue-50 ">
 <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Temp.</p>
 <p className="text-lg font-black text-slate-900 ">
 {latestVitals.temp || "Non renseigne"}
 {latestVitals.temp && <span className="text-[10px] font-bold text-slate-600 ml-1">°C</span>}
 </p>
 </div>
 </div>
 </div>

 <div className="bg-white p-6 rounded-3xl  shadow-sm">
 <div className="flex justify-between items-center mb-6">
 <h3 className="font-black uppercase text-xs tracking-widest text-slate-600 flex items-center gap-2">
 <FileText className="w-4 h-4" /> Documents Médicaux
 </h3>
 </div>
 
 <div className="space-y-3">
 {medicalDocuments.length > 0 ? medicalDocuments.slice(0, 5).map((doc: any) => (
 <button
 key={doc.id}
 onClick={() => doc.href && window.open(doc.href, "_blank")}
 className="w-full p-3 border border-blue-50 rounded-xl flex items-center gap-3 hover:bg-white border-blue-100 shadow-sm transition-all cursor-pointer group text-left"
 >
 <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center font-bold text-[10px]">{doc.type.slice(0, 3).toUpperCase()}</div>
 <div className="flex-1 min-w-0">
 <p className="text-xs font-bold truncate">{doc.label}</p>
 <p className="text-[10px] text-slate-600">{new Date(doc.date).toLocaleDateString("fr-FR")}</p>
 </div>
 <Download className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
 </button>
 )) : (
 <p className="text-sm text-slate-600 text-center py-4">Aucun document issu de la base</p>
 )}
 </div>
 </div>
 </div>
 </div>
 )}

 {activeTab === "consultations" && (
 <div className="bg-white rounded-3xl  shadow-sm overflow-hidden">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-white border-blue-100 shadow-sm /50 border-b border-slate-100 ">
 <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Date</th>
 <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Médecin</th>
 <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Diagnostic</th>
 <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100 ">
 {history.consultations.map((c: any) => (
 <tr key={c.id} className="hover:bg-white border-blue-100 shadow-sm/50 transition-colors">
 <td className="px-6 py-4 text-sm font-medium">{format(new Date(c.created_at), 'dd/MM/yyyy')}</td>
 <td className="px-6 py-4 text-sm font-bold">Dr. {c.profiles?.first_name} {c.profiles?.last_name}</td>
 <td className="px-6 py-4 text-sm text-slate-600">{c.diagnosis || "Non spécifié"}</td>
 <td className="px-6 py-4 flex items-center gap-2">
 <button className="px-3 py-1 bg-white border-blue-100 shadow-sm text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-lg">Voir</button>
 <button 
 onClick={() => window.open(`/dashboard/print/prescription/${c.id}`, '_blank')}
 className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
 title="Imprimer Ordonnance"
 >
 <Printer className="w-4 h-4" />
 </button>
 </td>
 </tr>
 ))}
 {history.consultations.length === 0 && <tr><td colSpan={4} className="text-center py-10 text-slate-600">Aucune consultation</td></tr>}
 </tbody>
 </table>
 </div>
 )}

 {activeTab === "appointments" && (
 <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-white border-blue-100 shadow-sm /50 border-b border-slate-100">
 <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Date</th>
 <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Medecin</th>
 <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Motif</th>
 <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Statut</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {history.appointments.map((a: any) => (
 <tr key={a.id} className="hover:bg-white border-blue-100 shadow-sm/50 transition-colors">
 <td className="px-6 py-4 text-sm font-medium">{new Date(a.start_time || a.appointment_date).toLocaleString("fr-FR")}</td>
 <td className="px-6 py-4 text-sm font-bold">Dr. {a.profiles?.first_name} {a.profiles?.last_name}</td>
 <td className="px-6 py-4 text-sm text-slate-600">{a.reason || "Non renseigne"}</td>
 <td className="px-6 py-4 text-sm font-black text-blue-600">{a.status}</td>
 </tr>
 ))}
 {history.appointments.length === 0 && <tr><td colSpan={4} className="text-center py-10 text-slate-600">Aucun rendez-vous</td></tr>}
 </tbody>
 </table>
 </div>
 )}

 {activeTab === "lab" && (
 <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-white border-blue-100 shadow-sm /50 border-b border-slate-100">
 <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Date</th>
 <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Examen</th>
 <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Statut</th>
 <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Resultat</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {history.labTests.map((lab: any) => (
 <tr key={lab.id} className="hover:bg-white border-blue-100 shadow-sm/50 transition-colors">
 <td className="px-6 py-4 text-sm font-medium">{new Date(lab.completed_at || lab.created_at).toLocaleDateString("fr-FR")}</td>
 <td className="px-6 py-4 text-sm font-bold">{lab.test_type}</td>
 <td className="px-6 py-4 text-sm font-black text-blue-600">{lab.status}</td>
 <td className="px-6 py-4 text-sm text-slate-600">{lab.results_data?.text || lab.observations || "Non renseigne"}</td>
 </tr>
 ))}
 {history.labTests.length === 0 && <tr><td colSpan={4} className="text-center py-10 text-slate-600">Aucun examen laboratoire</td></tr>}
 </tbody>
 </table>
 </div>
 )}

 {activeTab === "hospitalization" && (
 <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-white border-blue-100 shadow-sm /50 border-b border-slate-100">
 <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Admission</th>
 <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Chambre</th>
 <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Sortie</th>
 <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Statut</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {history.admissions.map((adm: any) => (
 <tr key={adm.id} className="hover:bg-white border-blue-100 shadow-sm/50 transition-colors">
 <td className="px-6 py-4 text-sm font-medium">{new Date(adm.admission_date).toLocaleDateString("fr-FR")}</td>
 <td className="px-6 py-4 text-sm font-bold">{adm.rooms?.room_number || "Non assignee"}</td>
 <td className="px-6 py-4 text-sm text-slate-600">{adm.discharge_date ? new Date(adm.discharge_date).toLocaleDateString("fr-FR") : "En cours"}</td>
 <td className="px-6 py-4 text-sm font-black text-blue-600">{adm.status}</td>
 </tr>
 ))}
 {history.admissions.length === 0 && <tr><td colSpan={4} className="text-center py-10 text-slate-600">Aucune hospitalisation</td></tr>}
 </tbody>
 </table>
 </div>
 )}

 {activeTab === "finance" && (
 <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-white border-blue-100 shadow-sm /50 border-b border-slate-100">
 <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Facture</th>
 <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Total</th>
 <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Paye</th>
 <th className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {history.invoices.map((invoice: any) => (
 <tr key={invoice.id} className="hover:bg-white border-blue-100 shadow-sm/50 transition-colors">
 <td className="px-6 py-4 text-sm font-black text-blue-600">#{invoice.id.slice(0, 8).toUpperCase()}</td>
 <td className="px-6 py-4 text-sm font-bold">{Number(invoice.total_amount).toLocaleString()} CFA</td>
 <td className="px-6 py-4 text-sm text-slate-600">{Number(invoice.paid_amount || 0).toLocaleString()} CFA</td>
 <td className="px-6 py-4">
 <button
 onClick={() => window.open(`/dashboard/print/invoice/${invoice.id}`, "_blank")}
 className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
 >
 <Printer className="w-4 h-4" />
 </button>
 </td>
 </tr>
 ))}
 {history.invoices.length === 0 && <tr><td colSpan={4} className="text-center py-10 text-slate-600">Aucune facture</td></tr>}
 </tbody>
 </table>
 </div>
 )}
 </motion.div>
 </AnimatePresence>

 {/* Consultation Modal */}
 <Modal
 isOpen={isConsultationModalOpen}
 onClose={() => setIsConsultationModalOpen(false)}
 title="Nouvelle Consultation Médicale"
 >
 <ConsultationForm 
 patientId={id as string}
 onSuccess={() => {
 setIsConsultationModalOpen(false);
 fetchPatientData();
 }}
 onCancel={() => setIsConsultationModalOpen(false)}
 />
 </Modal>
 </div>
 );
}
