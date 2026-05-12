"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Save, Pill, CreditCard, Box, AlertTriangle } from "lucide-react";

interface MedicineFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function MedicineForm({ onSuccess, onCancel }: MedicineFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    unit: "Boîte",
    category: "Générique",
    stock_quantity: 0,
    min_stock_alert: 5,
    unit_price: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from('profiles').select('hospital_id').eq('id', user?.id).single();
      
      if (!profile?.hospital_id) throw new Error("Hospital ID not found");

      const { error } = await supabase.from("medicines").insert([
        {
          ...formData,
          hospital_id: profile.hospital_id,
        },
      ]);

      if (error) throw error;
      onSuccess();
    } catch (error: any) {
      alert("Erreur: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === "stock_quantity" || name === "min_stock_alert" || name === "unit_price" ? Number(value) : value 
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Pill className="w-4 h-4 text-blue-500" /> Nom du Médicament
          </label>
          <input required name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none" placeholder="Ex: Paracétamol 500mg" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Description / Dosage</label>
          <textarea name="description" value={formData.description} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none min-h-[80px]" placeholder="Précisions sur le produit..." />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Box className="w-4 h-4 text-amber-500" /> Quantité Initiale
            </label>
            <input required type="number" name="stock_quantity" value={formData.stock_quantity} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" /> Seuil d&apos;alerte
            </label>
            <input required type="number" name="min_stock_alert" value={formData.min_stock_alert} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-500" /> Prix Unitaire (CFA)
            </label>
            <input required type="number" name="unit_price" value={formData.unit_price} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none" placeholder="1500" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Unité</label>
            <select name="unit" value={formData.unit} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none">
              <option value="Boîte">Boîte</option>
              <option value="Flacon">Flacon</option>
              <option value="Plaquette">Plaquette</option>
              <option value="Unité">Unité</option>
            </select>
          </div>
        </div>
      </div>

      <div className="pt-6 flex gap-3">
        <button type="button" onClick={onCancel} className="flex-1 py-4 border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all">
          Annuler
        </button>
        <button disabled={isLoading} type="submit" className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Enregistrer le Produit
        </button>
      </div>
    </form>
  );
}
