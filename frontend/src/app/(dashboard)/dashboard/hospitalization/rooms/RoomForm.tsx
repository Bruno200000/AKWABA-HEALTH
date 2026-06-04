"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Bed, Building2, CreditCard, DoorOpen, Loader2, Save } from "lucide-react";

interface RoomFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const numericFields = new Set(["total_beds", "price_per_day"]);

export default function RoomForm({ onSuccess, onCancel }: RoomFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    room_number: "",
    department: "Medecine generale",
    type: "Standard",
    total_beds: 1,
    price_per_day: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((current) => ({
      ...current,
      [name]: numericFields.has(name) ? Number(value) : value,
    }));
  };

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

      const { error } = await supabase.from("rooms").insert([
        {
          hospital_id: profile.hospital_id,
          room_number: formData.room_number.trim(),
          department: formData.department.trim() || null,
          type: formData.type,
          total_beds: formData.total_beds,
          occupied_beds: 0,
          price_per_day: formData.price_per_day,
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <DoorOpen className="w-4 h-4 text-blue-500" /> Numero de chambre
          </label>
          <input
            required
            name="room_number"
            value={formData.room_number}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white border border-blue-100 shadow-sm rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none"
            placeholder="Ex: A-101"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-500" /> Service
          </label>
          <input
            name="department"
            value={formData.department}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white border border-blue-100 shadow-sm rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none"
            placeholder="Ex: Pediatrie"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white border border-blue-100 shadow-sm rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none"
          >
            <option value="Standard">Standard</option>
            <option value="VIP">VIP</option>
            <option value="Urgence">Urgence</option>
            <option value="Reanimation">Reanimation</option>
            <option value="Maternite">Maternite</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Bed className="w-4 h-4 text-amber-500" /> Nombre de lits
          </label>
          <input
            required
            min={1}
            type="number"
            name="total_beds"
            value={formData.total_beds}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white border border-blue-100 shadow-sm rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-indigo-500" /> Prix par jour (CFA)
        </label>
        <input
          required
          min={0}
          type="number"
          name="price_per_day"
          value={formData.price_per_day}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-white border border-blue-100 shadow-sm rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none"
          placeholder="Ex: 15000"
        />
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
          Enregistrer la chambre
        </button>
      </div>
    </form>
  );
}
