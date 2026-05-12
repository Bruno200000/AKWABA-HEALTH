"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Printer, Download, ChevronLeft } from "lucide-react";

export default function PrescriptionPrintPage() {
 const { id } = useParams();
 const [data, setData] = useState<any>(null);
 const [isLoading, setIsLoading] = useState(true);

 useEffect(() => {
 fetchPrescriptionData();
 }, [id]);

 const fetchPrescriptionData = async () => {
 const { data: consultation } = await supabase
 .from("consultations")
 .select("*, patients(*), profiles(*), hospitals(*)")
 .eq("id", id)
 .single();

 if (consultation) {
 const { data: prescription } = await supabase
 .from("prescriptions")
 .select("*, prescription_items(*, medicines(*))")
 .eq("consultation_id", id)
 .single();
 
 setData({ ...consultation, prescription });
 }
 setIsLoading(false);
 };

 const handlePrint = () => {
 window.print();
 };

 if (isLoading) return <div className="p-10 text-center">Chargement...</div>;
 if (!data) return <div className="p-10 text-center">Ordonnance non trouvée</div>;

 return (
 <div className="min-h-screen bg-white border-blue-100 shadow-sm p-4 sm:p-8 print:p-0 print:bg-white">
 {/* Controls - Hidden on print */}
 <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center print:hidden">
 <button onClick={() => window.close()} className="flex items-center gap-2 text-slate-600 hover:text-slate-800 font-bold">
 <ChevronLeft className="w-4 h-4" /> Fermer
 </button>
 <div className="flex gap-4">
 <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200">
 <Printer className="w-5 h-5" /> Imprimer l&apos;ordonnance
 </button>
 </div>
 </div>

 {/* Prescription Document */}
 <div className="max-w-[21cm] mx-auto bg-white shadow-2xl print:shadow-none p-[2cm] min-h-[29.7cm] flex flex-col">
 {/* Hospital Header */}
 <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-12">
 <div className="flex items-center gap-6">
 {data.hospitals?.logo_url ? (
 <img src={data.hospitals.logo_url} alt="Logo" className="w-24 h-24 object-contain" />
 ) : (
 <div className="w-20 h-20 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-2xl p-2">
 AK
 </div>
 )}
 <div>
 <h1 className="text-3xl font-black tracking-tighter uppercase">{data.hospitals?.name || "AKWABA HEALTH"}</h1>
 <p className="text-sm font-bold text-slate-600 max-w-xs">{data.hospitals?.address || "Abidjan, Côte d'Ivoire"}</p>
 <p className="text-sm font-bold text-slate-600">{data.hospitals?.phone || "+225 00 00 00 00"}</p>
 </div>
 </div>
 <div className="text-right">
 <div className="inline-block px-4 py-2 bg-slate-900 text-white font-black text-xs uppercase tracking-[0.3em] mb-4">
 Ordonnance Médicale
 </div>
 <p className="text-sm font-bold">N°: {data.id.slice(0, 8).toUpperCase()}</p>
 <p className="text-sm text-slate-600">Date: {format(new Date(data.created_at), 'dd/MM/yyyy')}</p>
 </div>
 </div>

 {/* Patient & Doctor Info */}
 <div className="grid grid-cols-2 gap-12 mb-12">
 <div className="p-6 bg-white border-blue-100 shadow-sm rounded-2xl">
 <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3">Informations Patient</p>
 <h2 className="text-xl font-black mb-1">{data.patients?.first_name} {data.patients?.last_name}</h2>
 <p className="text-sm font-bold text-slate-600">{data.patients?.gender === 'M' ? 'Masculin' : 'Féminin'}, {data.patients?.birth_date ? `${new Date().getFullYear() - new Date(data.patients.birth_date).getFullYear()} ans` : 'Âge inconnu'}</p>
 <p className="text-sm text-slate-600 mt-2">ID: {data.patients?.file_number}</p>
 </div>
 <div className="p-6 border border-slate-100 rounded-2xl">
 <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3">Médecin Prescripteur</p>
 <h2 className="text-xl font-black mb-1">Dr. {data.profiles?.first_name} {data.profiles?.last_name}</h2>
 <p className="text-sm font-bold text-blue-600">{data.profiles?.specialization || "Médecine Générale"}</p>
 <p className="text-sm text-slate-600 mt-2">Licence: {data.profiles?.license_number || "CI-12345-MED"}</p>
 </div>
 </div>

 {/* Prescription Content */}
 <div className="flex-1">
 <div className="mb-8">
 <h3 className="text-lg font-black uppercase tracking-tight border-b border-slate-200 pb-2 mb-6">Traitement Prescrit</h3>
 <div className="space-y-8">
 {data.prescription?.prescription_items?.map((item: any, index: number) => (
 <div key={item.id} className="flex gap-6">
 <span className="text-lg font-black text-slate-300">{index + 1}.</span>
 <div>
 <h4 className="text-lg font-black text-slate-900 uppercase">{item.medicines?.name}</h4>
 <p className="text-sm font-bold text-blue-600 mt-1 italic">
 Posologie: {item.dosage} — Pendant {item.duration}
 </p>
 {item.instructions && (
 <p className="text-sm text-slate-600 mt-2">Note: {item.instructions}</p>
 )}
 </div>
 </div>
 ))}
 {!data.prescription?.prescription_items?.length && (
 <p className="text-slate-600 italic">Aucun médicament prescrit pour cette consultation.</p>
 )}
 </div>
 </div>
 </div>

 {/* Footer / Signature */}
 <div className="mt-20 pt-12 border-t border-slate-100 flex justify-between items-end">
 <div className="text-[10px] text-slate-600 font-bold max-w-xs leading-relaxed">
 Note: Cette ordonnance est valable 3 mois à compter de sa date d&apos;émission. 
 Veuillez respecter scrupuleusement les doses prescrites.
 </div>
 <div className="text-center min-w-[200px]">
 <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-12">Signature & Cachet</p>
 <div className="h-20 flex items-center justify-center italic text-blue-600 font-serif opacity-50">
 Dr. {data.profiles?.last_name}
 </div>
 <div className="h-px bg-slate-900 w-full mb-2" />
 <p className="text-sm font-black">Dr. {data.profiles?.first_name} {data.profiles?.last_name}</p>
 </div>
 </div>
 </div>

 <style jsx global>{`
 @media print {
 body {
 background: white !important;
 }
 @page {
 margin: 0;
 size: A4;
 }
 .print-hidden {
 display: none !important;
 }
 }
 `}</style>
 </div>
 );
}
