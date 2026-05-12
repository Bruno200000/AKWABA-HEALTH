"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Building2, 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  ChevronRight,
  Package,
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    // Simulated suppliers data
    setSuppliers([
      { id: "F-01", name: "DPCI", contact: "M. Kouadio", phone: "+225 01 02 03 04", category: "Générique" },
      { id: "F-02", name: "Laborex", contact: "Mme. Koné", phone: "+225 05 06 07 08", category: "Spécialités" },
      { id: "F-03", name: "Copharmed", contact: "M. Bakayoko", phone: "+225 07 08 09 10", category: "Matériel" },
    ]);
    setIsLoading(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Fournisseurs Pharmaceutiques</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Gérez vos relations avec les laboratoires et grossistes.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 dark:shadow-none">
          <Plus className="w-4 h-4" /> Ajouter un Fournisseur
        </button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Rechercher un fournisseur..."
            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.map((sup) => (
          <motion.div
            key={sup.id}
            whileHover={{ y: -5 }}
            className="p-8 bg-white dark:bg-slate-900 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-sm relative group"
          >
            <div className="flex justify-between items-start mb-8">
               <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-[20px] flex items-center justify-center">
                  <Building2 className="w-7 h-7" />
               </div>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{sup.id}</span>
            </div>

            <h3 className="font-black text-xl mb-1">{sup.name}</h3>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-8">{sup.category}</p>

            <div className="space-y-4 mb-8">
               <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                  <Phone className="w-4 h-4 opacity-30" /> {sup.phone}
               </div>
               <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                  <Globe className="w-4 h-4 opacity-30" /> {sup.name.toLowerCase()}.com
               </div>
            </div>

            <div className="flex gap-2">
               <button className="flex-1 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:bg-slate-100 transition-all">
                  Commandes
               </button>
               <button className="px-5 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all">
                  <ChevronRight className="w-5 h-5" />
               </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
