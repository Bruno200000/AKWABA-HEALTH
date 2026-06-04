"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { AlertTriangle, Barcode, Box, Calendar, CreditCard, Loader2, Pill, Save } from "lucide-react";

interface MedicineFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const numericFields = new Set(["stock_quantity", "min_stock_alert", "unit_price"]);

export default function MedicineForm({ onSuccess, onCancel }: MedicineFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "Generique",
    barcode: "",
    expiry_date: "",
    stock_quantity: 0,
    min_stock_alert: 5,
    unit_price: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilisateur non authentifie");

      const { data: profile } = await supabase
        .from("profiles")
        .select("hospital_id")
        .eq("id", user.id)
        .single();

      if (!profile?.hospital_id) {
        throw new Error("Etablissement introuvable pour ce compte");
      }

      const { error } = await supabase.from("medicines").insert([
        {
          hospital_id: profile.hospital_id,
          name: formData.name.trim(),
          brand: formData.brand.trim() || null,
          category: formData.category.trim() || null,
          barcode: formData.barcode.trim() || null,
          expiry_date: formData.expiry_date || null,
          stock_quantity: formData.stock_quantity,
          min_stock_alert: formData.min_stock_alert,
          unit_price: formData.unit_price,
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: numericFields.has(name) ? Number(value) : value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Pill className="w-4 h-4 text-blue-500" /> Nom du medicament
          </label>
          <input
            required
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white border border-blue-100 shadow-sm rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none"
            placeholder="Ex: Paracetamol 500mg"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Marque / Laboratoire</label>
            <input
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white border border-blue-100 shadow-sm rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none"
              placeholder="Ex: Sanofi"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Categorie</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white border border-blue-100 shadow-sm rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none"
            >
              <option value="Generique">Generique</option>
              <option value="Antalgique">Antalgique</option>
              <option value="Antibiotique">Antibiotique</option>
              <option value="Antipaludique">Antipaludique</option>
              <option value="Cardiologie">Cardiologie</option>
              <option value="Diabete">Diabete</option>
              <option value="Consommable">Consommable</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Box className="w-4 h-4 text-amber-500" /> Quantite initiale
            </label>
            <input
              required
              min={0}
              type="number"
              name="stock_quantity"
              value={formData.stock_quantity}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white border border-blue-100 shadow-sm rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" /> Seuil d&apos;alerte
            </label>
            <input
              required
              min={0}
              type="number"
              name="min_stock_alert"
              value={formData.min_stock_alert}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white border border-blue-100 shadow-sm rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-500" /> Prix unitaire (CFA)
            </label>
            <input
              required
              min={0}
              type="number"
              name="unit_price"
              value={formData.unit_price}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white border border-blue-100 shadow-sm rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none"
              placeholder="1500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500" /> Date d&apos;expiration
            </label>
            <input
              type="date"
              name="expiry_date"
              value={formData.expiry_date}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white border border-blue-100 shadow-sm rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Barcode className="w-4 h-4 text-slate-500" /> Code barre
          </label>
          <input
            name="barcode"
            value={formData.barcode}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white border border-blue-100 shadow-sm rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none"
            placeholder="Code barre ou reference interne"
          />
        </div>
      </div>

      <div className="pt-6 flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-4 rounded-2xl font-bold text-slate-600 hover:bg-blue-50 border border-blue-100 shadow-sm transition-all"
        >
          Annuler
        </button>
        <button
          disabled={isLoading}
          type="submit"
          className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Enregistrer le produit
        </button>
      </div>
    </form>
  );
}
