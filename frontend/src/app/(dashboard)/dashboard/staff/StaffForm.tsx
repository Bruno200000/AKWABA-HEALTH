"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Save, User, Stethoscope, Mail, Phone, Briefcase } from "lucide-react";

interface StaffFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function StaffForm({ onSuccess, onCancel }: StaffFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    role: "DOCTOR",
    specialty: "",
    phone: "",
    email: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { data: profile } = await supabase.from('profiles').select('hospital_id').eq('id', user.id).single();
      if (!profile?.hospital_id) throw new Error("Profil hospitalier non trouvé");
      
      const { error } = await supabase.from("profiles").insert([
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 ml-1">Prénom</label>
            <input required name="first_name" value={formData.first_name} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none" placeholder="Dr. Marc" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 ml-1">Nom</label>
            <input required name="last_name" value={formData.last_name} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none" placeholder="Dibi" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 ml-1">Rôle</label>
            <select name="role" value={formData.role} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none">
              <option value="DOCTOR">Médecin / Praticien</option>
              <option value="NURSE">Infirmier(e)</option>
              <option value="TECHNICIAN">Technicien Labo</option>
              <option value="PHARMACIST">Pharmacien</option>
              <option value="ADMIN">Administrateur</option>
              <option value="RECEPTIONIST">Réceptionniste</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 ml-1 flex items-center gap-2">
              <Stethoscope className="w-3.5 h-3.5" /> Spécialité
            </label>
            <input required name="specialty" value={formData.specialty} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none" placeholder="Ex: Cardiologie, Pédiatrie..." />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 ml-1 flex items-center gap-2">
              <Phone className="w-3.5 h-3.5" /> Téléphone
            </label>
            <input required name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none" placeholder="+225 0102030405" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 ml-1 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" /> Adresse Email Pro
            </label>
            <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none" placeholder="m.dibi@akwaba.health" />
          </div>
        </div>
      </div>

      <div className="pt-6 flex gap-3">
        <button type="button" onClick={onCancel} className="flex-1 py-4 border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all">
          Annuler
        </button>
        <button disabled={isLoading} type="submit" className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Enregistrer le Membre
        </button>
      </div>
    </form>
  );
}
