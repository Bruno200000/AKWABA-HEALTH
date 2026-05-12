"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Stethoscope, 
  Search, 
  Plus, 
  FileText, 
  Clock, 
  User, 
  Pill, 
  ChevronRight,
  ClipboardList
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import ConsultationForm from "./ConsultationForm";

import { supabase } from "@/lib/supabase";

export default function ConsultationsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase.from('profiles').select('hospital_id').eq('id', user.id).single();
    if (!profile?.hospital_id) return;

    const { data, error } = await supabase
      .from("consultations")
      .select("*, patients(first_name, last_name), profiles!consultations_doctor_id_fkey(first_name, last_name)")
      .eq("hospital_id", profile.hospital_id)
      .order("created_at", { ascending: false });

    if (data) {
      setConsultations(data);
    }
    setIsLoading(false);
  };

  const filteredConsultations = consultations.filter(cons => 
    `${cons.patients?.first_name} ${cons.patients?.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cons.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Consultations Médicales</h1>
          <p className="text-slate-500 dark:text-slate-400">Enregistrez et consultez les diagnostics et ordonnances.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-none"
        >
          <Plus className="w-5 h-5" /> Nouvelle Consultation
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Rechercher une consultation (Patient, Docteur, Diagnostic)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>
      </div>

      {/* Consultations List */}
      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="text-center py-10 text-slate-500">Chargement des consultations...</div>
        ) : filteredConsultations.length > 0 ? filteredConsultations.map((cons, index) => (
          <motion.div
            key={cons.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900 transition-all cursor-pointer"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg">{cons.patients?.first_name} {cons.patients?.last_name}</h3>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border",
                      cons.type === 'Urgence' ? "bg-red-50 text-red-600 border-red-100" : "bg-slate-50 text-slate-600 border-slate-100"
                    )}>
                      {cons.type || 'Standard'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                    <User className="w-3.5 h-3.5" /> Par Dr. {cons.profiles?.last_name}
                  </p>
                </div>
              </div>

              <div className="flex-1 md:px-8">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Diagnostic :</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 italic mt-0.5">&ldquo;{cons.diagnosis}&rdquo;</p>
              </div>

              <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4">
                <div className="text-right">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <Clock className="w-3.5 h-3.5" /> {new Date(cons.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg hover:text-blue-600 transition-colors" title="Ordonnance">
                    <Pill className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg hover:text-blue-600 transition-colors" title="Rapport PDF">
                    <FileText className="w-4 h-4" />
                  </button>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors ml-2" />
                </div>
              </div>
            </div>
          </motion.div>
        )) : (
          <div className="text-center py-10 text-slate-500">Aucune consultation trouvée</div>
        )}
      </div>

      {/* Consultation Creation Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Enregistrer une nouvelle consultation"
      >
        <ConsultationForm 
          onSuccess={() => {
            setIsModalOpen(false);
            fetchConsultations();
          }} 
          onCancel={() => setIsModalOpen(false)} 
        />
      </Modal>
    </div>
  );
}
