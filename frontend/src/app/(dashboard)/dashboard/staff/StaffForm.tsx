"use client";

import React, { useState } from "react";
import { Loader2, Save, Stethoscope, Mail, Phone, Lock } from "lucide-react";
import { supabase } from "@/lib/supabase";

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
    specialization: "",
    phone: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Session expirée, reconnectez-vous.");

      const res = await fetch("/api/staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          first_name: formData.first_name,
          last_name: formData.last_name,
          role: formData.role,
          specialization: formData.specialization,
          phone: formData.phone,
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Impossible de créer le compte");

      alert(
        "Compte personnel créé. Transmettez l’email et le mot de passe au collaborateur pour sa première connexion."
      );
      onSuccess();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erreur";
      alert("Erreur: " + message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="text-xs text-slate-500 leading-relaxed bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3">
        Crée un <strong>vrai compte de connexion</strong> Supabase pour ce membre. Nécessite la variable serveur{" "}
        <code className="text-[11px] bg-white px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code> dans{" "}
        <code className="text-[11px] bg-white px-1 rounded">frontend/.env.local</code>.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 ml-1">Prénom</label>
            <input
              required
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none"
              placeholder="Dr. Marc"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 ml-1">Nom</label>
            <input
              required
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none"
              placeholder="Dibi"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 ml-1">Rôle</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none"
            >
              <option value="DOCTOR">Médecin / Praticien</option>
              <option value="NURSE">Infirmier(e)</option>
              <option value="LAB_TECHNICIAN">Technicien laboratoire</option>
              <option value="PHARMACIST">Pharmacien</option>
              <option value="ADMIN">Administrateur</option>
              <option value="RECEPTIONIST">Réceptionniste</option>
              <option value="CASHIER">Caissier</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 ml-1 flex items-center gap-2">
              <Stethoscope className="w-3.5 h-3.5" /> Spécialité
            </label>
            <input
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none"
              placeholder="Ex: Cardiologie, pédiatrie…"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 ml-1 flex items-center gap-2">
              <Phone className="w-3.5 h-3.5" /> Téléphone
            </label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none"
              placeholder="+225 0102030405"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 ml-1 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" /> Email de connexion
            </label>
            <input
              required
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none"
              placeholder="m.dibi@hopital.ci"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 ml-1 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5" /> Mot de passe temporaire
            </label>
            <input
              required
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              minLength={8}
              autoComplete="new-password"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none"
              placeholder="Minimum 8 caractères"
            />
          </div>
        </div>
      </div>

      <div className="pt-6 flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-4 border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all"
        >
          Annuler
        </button>
        <button
          disabled={isLoading}
          type="submit"
          className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Créer le compte
        </button>
      </div>
    </form>
  );
}
