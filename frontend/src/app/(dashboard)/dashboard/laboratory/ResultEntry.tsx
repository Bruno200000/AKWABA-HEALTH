"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Save, Beaker, AlertCircle, CheckCircle2, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export default function ResultEntry({ test, onCancel, onSuccess }: { test: any, onCancel: () => void, onSuccess: () => void }) {
  const [results, setResults] = useState(test.results || "");
  const [observations, setObservations] = useState(test.observations || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await supabase
      .from("lab_tests")
      .update({
        results,
        observations,
        status: 'COMPLETED',
        completed_at: new Date().toISOString()
      })
      .eq("id", test.id);

    if (!error) {
      onSuccess();
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-8 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
           <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <ChevronLeft className="w-5 h-5" />
           </button>
           <div>
              <h3 className="text-xl font-black tracking-tight">Saisie des Résultats</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                {test.patients?.first_name} {test.patients?.last_name} • {test.test_type}
              </p>
           </div>
        </div>
        <div className={cn(
          "px-4 py-2 rounded-2xl border flex items-center gap-2",
          test.status === 'COMPLETED' ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-blue-50 border-blue-100 text-blue-600"
        )}>
          {test.status === 'COMPLETED' ? <CheckCircle2 className="w-4 h-4" /> : <Beaker className="w-4 h-4" />}
          <span className="text-[10px] font-black uppercase tracking-widest">{test.status}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Résultats Quantitatifs / Qualitatifs</label>
          <textarea 
            required
            value={results}
            onChange={(e) => setResults(e.target.value)}
            placeholder="Ex: Glycémie: 1.2g/L, NFS: Normal..."
            className="w-full h-40 p-6 bg-slate-50 dark:bg-slate-900 border-none rounded-[32px] text-sm font-medium focus:ring-4 focus:ring-blue-500/10 transition-all resize-none shadow-inner"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Observations & Conclusions</label>
          <textarea 
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            placeholder="Observations cliniques importantes..."
            className="w-full h-32 p-6 bg-slate-50 dark:bg-slate-900 border-none rounded-[32px] text-sm font-medium focus:ring-4 focus:ring-blue-500/10 transition-all resize-none shadow-inner"
          />
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-[24px] border border-amber-100 dark:border-amber-900/20 flex gap-4">
          <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />
          <p className="text-xs text-amber-700 dark:text-amber-400 font-medium leading-relaxed">
            La validation de ces résultats les rendra immédiatement consultables par le médecin prescripteur dans le dossier patient. Assurez-vous de l&apos;exactitude des données.
          </p>
        </div>

        <div className="flex gap-4 pt-4">
          <button 
            type="button" 
            onClick={onCancel}
            className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
          >
            Annuler
          </button>
          <button 
            type="submit"
            disabled={isSubmitting}
            className="flex-[2] py-4 bg-blue-600 text-white rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 dark:shadow-none flex items-center justify-center gap-2"
          >
            {isSubmitting ? "Validation..." : <><Save className="w-4 h-4" /> Valider & Publier</>}
          </button>
        </div>
      </form>
    </div>
  );
}
