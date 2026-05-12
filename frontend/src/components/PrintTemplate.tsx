"use client";

import React from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface PrintTemplateProps {
  type: "INVOICE" | "PRESCRIPTION";
  data: any;
  hospital: any;
}

export default function PrintTemplate({ type, data, hospital }: PrintTemplateProps) {
  return (
    <div className="p-12 bg-white text-slate-900 font-serif max-w-[800px] mx-auto min-h-screen border shadow-sm print:shadow-none print:border-none print:p-0">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-blue-600 pb-8 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center p-2">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain invert" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-blue-600 uppercase">{hospital?.name || "AKWABA HEALTH"}</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Simplement Efficace</p>
          </div>
        </div>
        <div className="text-right text-xs space-y-1">
          <p className="font-bold">{hospital?.address || "Abidjan, Côte d'Ivoire"}</p>
          <p>Tél: {hospital?.phone || "+225 07 00 00 00 00"}</p>
          <p>Email: {hospital?.email || "contact@hopital.ci"}</p>
        </div>
      </div>

      {/* Document Info */}
      <div className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-4xl font-black text-slate-900 uppercase mb-2">
            {type === "INVOICE" ? "FACTURE" : "ORDONNANCE"}
          </h2>
          <p className="text-sm font-bold text-slate-500">
            N° {data.id.slice(0, 8).toUpperCase()} — {format(new Date(), 'dd MMMM yyyy', { locale: fr })}
          </p>
        </div>
        <div className="text-right">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Patient</p>
           <p className="text-xl font-bold uppercase">{data.patients?.first_name} {data.patients?.last_name}</p>
           <p className="text-xs text-slate-500">ID: {data.patients?.file_number}</p>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {type === "INVOICE" ? (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b-2 border-slate-200 text-left">
                <th className="py-4 px-2 text-xs font-black uppercase tracking-widest">Description</th>
                <th className="py-4 px-2 text-xs font-black uppercase tracking-widest text-right">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-4 px-2 text-sm font-bold">Consultation Médicale / Soins</td>
                <td className="py-4 px-2 text-sm font-bold text-right">{Number(data.total_amount).toLocaleString()} FCFA</td>
              </tr>
              {/* Add more items if available */}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200">
                <td className="py-4 px-2 text-lg font-black uppercase text-right">Total</td>
                <td className="py-4 px-2 text-lg font-black text-right text-blue-600">{Number(data.total_amount).toLocaleString()} FCFA</td>
              </tr>
            </tfoot>
          </table>
        ) : (
          <div className="space-y-8">
            <div className="p-6 bg-slate-50 rounded-2xl border-l-4 border-blue-600">
               <p className="text-sm italic text-slate-700 leading-loose whitespace-pre-wrap">
                 {data.notes || "Aucun médicament prescrit."}
               </p>
            </div>
            <div className="grid grid-cols-2 gap-8 pt-20">
               <div className="p-4 border border-dashed border-slate-200 rounded-xl text-center grayscale opacity-50">
                  <p className="text-[8px] font-bold uppercase mb-2">Tampon de l&apos;établissement</p>
                  <div className="h-20" />
               </div>
               <div className="text-center pt-8">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-8 tracking-widest">Signature du Médecin</p>
                  <p className="text-sm font-bold italic underline">Dr. {data.profiles?.last_name || "Nom du médecin"}</p>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-20 pt-8 border-t border-slate-100 text-center space-y-2 opacity-50">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Akwaba Health ERP — Gestion Hospitalière Certifiée</p>
        <p className="text-[9px] text-slate-400">Ce document est généré électroniquement et est valide sans signature physique.</p>
      </div>
    </div>
  );
}
