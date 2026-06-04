"use client";

import React, { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
 Building2, 
 ShieldCheck, 
 Bell, 
 Globe, 
 Save,
 CreditCard,
 User,
 Camera,
 Cloud,
 Zap,
 Mail,
 Phone
} from "lucide-react";
import { cn } from "@/lib/utils";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

const tabs = [
  { id: "profile", label: "Mon Profil", icon: User, desc: "Informations personnelles" },
  { id: "hospital", label: "Établissement", icon: Building2, desc: "Identité et coordonnées" },
  { id: "branding", label: "Personnalisation", icon: Camera, desc: "Logo et couleurs" },
  { id: "integrations", label: "Intégrations", icon: Cloud, desc: "API, IA et Webhooks" },
  { id: "ai", label: "IA Akwaba", icon: Zap, desc: "Intelligence Médicale" },
  { id: "security", label: "Sécurité & Accès", icon: ShieldCheck, desc: "Mots de passe et rôles" },
  { id: "notifications", label: "Communications", icon: Bell, desc: "Alertes SMS et Emails" },
  { id: "billing", label: "Abonnement", icon: CreditCard, desc: "Plans et facturation" },
];

const defaultIntegrations = {
  openai: "",
  anthropic: "",
  gemini: "",
  mistral: "",
  whatsapp_token: "",
  whatsapp_phone: "",
  whatsapp_template: "",
  sms_provider: "twilio",
  sms_api_key: "",
  sms_sender: "",
  email_provider: "smtp",
  smtp_host: "",
  smtp_user: "",
  smtp_password: "",
  pharmacy_webhook: "",
  laboratory_webhook: "",
  finance_webhook: "",
};

const defaultAiSettings = {
  diagnostic_assistant: false,
  voice_transcription: false,
  predictive_analysis: false,
  active_provider: "openai",
  model: "gpt-4.1-mini",
  response_language: "fr",
  confidence_threshold: 70,
  clinical_context: true,
  prescription_suggestions: false,
  lab_result_interpretation: false,
};

const defaultSecuritySettings = {
  two_factor_enabled: false,
  login_alerts: true,
  role_based_access: true,
};

const defaultNotificationSettings = {
  sms_appointment_reminders: false,
  email_invoices: false,
  whatsapp_prescriptions: false,
  appointment_channel: "whatsapp",
  invoice_channel: "email",
  prescription_channel: "whatsapp",
  lab_results_channel: "email",
  emergency_channel: "sms",
  sender_name: "AKWABA HEALTH",
  reminder_delay_hours: 24,
};

const defaultBillingSettings = {
  plan: "free",
  monthly_amount: 0,
  currency: "CFA",
};

type JsonObject = Record<string, unknown>;

type Hospital = {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  logo_url?: string | null;
  primary_color?: string | null;
  subscription_plan?: string | null;
  is_active?: boolean | null;
  settings?: JsonObject | null;
};

type UserProfile = {
  id: string;
  hospital_id?: string | null;
  role?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  email?: string | null;
};

type ProfileFieldKey = "first_name" | "last_name" | "email" | "phone";
type HospitalFieldKey = "name" | "email" | "phone" | "address";

const profileFields: Array<{ key: ProfileFieldKey; label: string; icon: typeof User; readOnly?: boolean; type?: string }> = [
  { key: "first_name", label: "Prenom", icon: User },
  { key: "last_name", label: "Nom de famille", icon: User },
  { key: "email", label: "Email", icon: Mail, readOnly: true, type: "email" },
  { key: "phone", label: "Telephone", icon: Phone, type: "tel" },
];

const rawHospitalFields: Array<{ key: HospitalFieldKey; label: string; icon: typeof User }> = [
  { key: "name", label: "Nom de l'HÃ´pital", icon: Building2 },
  { key: "email", label: "Email professionnel", icon: Mail },
  { key: "phone", label: "NumÃ©ro de TÃ©lÃ©phone", icon: Zap },
  { key: "address", label: "Adresse GÃ©o", icon: Globe },
];

const hospitalFields: Array<{ key: HospitalFieldKey; label: string; icon: typeof User; type?: string }> =
  rawHospitalFields.map((field) => ({
    ...field,
    label: {
      name: "Nom de l'etablissement",
      email: "Email professionnel",
      phone: "Telephone",
      address: "Adresse",
    }[field.key],
    icon: field.key === "phone" ? Phone : field.icon,
    type: field.key === "email" ? "email" : field.key === "phone" ? "tel" : "text",
  }));

const getErrorMessage = (error: unknown, fallback: string) => {
  return error instanceof Error ? error.message : fallback;
};

const getSettingsSection = <T extends object>(settings: JsonObject, section: string): Partial<T> => {
  const value = settings[section];
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Partial<T>) : {};
};

const getProfileDisplayName = (profile: UserProfile | null) => {
  const firstName = profile?.first_name?.trim() || "";
  const lastName = profile?.last_name?.trim() || "";
  const fullName = `${firstName} ${lastName}`.trim();
  const email = profile?.email || "";

  return fullName || (email ? email.split("@")[0] : "Mon profil");
};

const getProfileInitials = (profile: UserProfile | null) => {
  const firstName = profile?.first_name?.trim() || "";
  const lastName = profile?.last_name?.trim() || "";

  if (firstName || lastName) {
    return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
  }

  return (profile?.email?.[0] || "U").toUpperCase();
};

function ToggleRow({
  title,
  description,
  enabled,
  onToggle,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex justify-between items-center p-6 bg-blue-50/50 rounded-2xl border border-blue-100 gap-6">
      <div>
        <p className="font-black text-slate-900">{title}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "w-12 h-6 rounded-full relative transition-colors shrink-0",
          enabled ? "bg-blue-600" : "bg-slate-200"
        )}
      >
        <span
          className={cn(
            "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
            enabled ? "right-1" : "left-1"
          )}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [integrations, setIntegrations] = useState(defaultIntegrations);
  const [branding, setBranding] = useState({ logo_url: "", primary_color: "#2563eb" });
  const [aiSettings, setAiSettings] = useState(defaultAiSettings);
  const [securitySettings, setSecuritySettings] = useState(defaultSecuritySettings);
  const [notificationSettings, setNotificationSettings] = useState(defaultNotificationSettings);
  const [billingSettings, setBillingSettings] = useState(defaultBillingSettings);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hospitalNotice, setHospitalNotice] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    await Promise.resolve();
    setLoadError(null);
    setHospitalNotice(null);

    if (!isSupabaseConfigured) {
      setLoadError("Supabase n'est pas configure. Impossible de charger l'utilisateur connecte.");
      setIsLoading(false);
      return;
    }

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) {
        setLoadError("Aucune session active. Reconnectez-vous pour charger votre profil.");
        return;
      }

      const fallbackProfile: UserProfile = {
        id: user.id,
        email: user.email || "",
        first_name: user.user_metadata?.first_name || user.user_metadata?.name?.split(" ")?.[0] || "",
        last_name: user.user_metadata?.last_name || user.user_metadata?.name?.split(" ")?.slice(1).join(" ") || "",
        phone: user.phone || user.user_metadata?.phone || "",
        role: user.user_metadata?.role || "Utilisateur",
        hospital_id: null,
      };

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      const currentProfile = {
        ...fallbackProfile,
        ...(profile || {}),
        email: profile?.email || user.email || "",
        phone: profile?.phone || fallbackProfile.phone,
      };

      setUserProfile(currentProfile);

      if (!currentProfile.hospital_id) {
        setHospital(null);
        setHospitalNotice("Aucun etablissement n'est encore lie a ce compte.");
        return;
      }

      const { data: hospitalData, error: hospitalError } = await supabase
        .from("hospitals")
        .select("*")
        .eq("id", currentProfile.hospital_id)
        .maybeSingle();

      if (hospitalError) throw hospitalError;

      if (!hospitalData) {
        setHospital(null);
        setHospitalNotice("L'etablissement associe a ce compte est introuvable.");
        return;
      }

      const settings = hospitalData.settings || {};
      setHospital(hospitalData);
      setBranding({
        logo_url: hospitalData.logo_url || "",
        primary_color: hospitalData.primary_color || "#2563eb",
      });
      setIntegrations({ ...defaultIntegrations, ...getSettingsSection<typeof defaultIntegrations>(settings, "integrations") });
      setAiSettings({ ...defaultAiSettings, ...getSettingsSection<typeof defaultAiSettings>(settings, "ai") });
      setSecuritySettings({ ...defaultSecuritySettings, ...getSettingsSection<typeof defaultSecuritySettings>(settings, "security") });
      setNotificationSettings({ ...defaultNotificationSettings, ...getSettingsSection<typeof defaultNotificationSettings>(settings, "notifications") });
      const billing = getSettingsSection<typeof defaultBillingSettings>(settings, "billing");
      setBillingSettings({
        ...defaultBillingSettings,
        ...billing,
        plan: hospitalData.subscription_plan || billing.plan || "free",
      });
    } catch (error: unknown) {
      setLoadError(getErrorMessage(error, "Impossible de charger les informations de l'utilisateur connecte."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchData();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchData]);

  const saveHospitalSettings = async (section: string, value: JsonObject, extraHospitalFields: Partial<Hospital> = {}) => {
    if (!hospital) return;
    const updatedSettings = {
      ...(hospital.settings || {}),
      [section]: value,
    };
    const { error } = await supabase
      .from("hospitals")
      .update({ ...extraHospitalFields, settings: updatedSettings })
      .eq("id", hospital.id);

    if (error) throw error;
    setHospital({ ...hospital, ...extraHospitalFields, settings: updatedSettings });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMessage(null);

    try {
      if (activeTab === "hospital" && hospital) {
        const { error } = await supabase.from('hospitals').update({
          name: hospital.name,
          email: hospital.email,
          phone: hospital.phone,
          address: hospital.address
        }).eq('id', hospital.id);
        if (error) throw error;
      } else if (activeTab === "hospital" && !hospital) {
        throw new Error("Impossible d'enregistrer : aucun etablissement n'est charge.");
      } else if (activeTab === "profile" && userProfile) {
        const { error } = await supabase.from('profiles').upsert({
          id: userProfile.id,
          hospital_id: userProfile.hospital_id || null,
          email: userProfile.email,
          first_name: userProfile.first_name,
          last_name: userProfile.last_name,
          phone: userProfile.phone
        }, { onConflict: "id" });
        if (error) throw error;
      } else if (activeTab === "branding" && hospital) {
        const { error } = await supabase.from("hospitals").update({
          logo_url: branding.logo_url || null,
          primary_color: branding.primary_color,
        }).eq("id", hospital.id);
        if (error) throw error;
        setHospital({ ...hospital, logo_url: branding.logo_url || null, primary_color: branding.primary_color });
      } else if (activeTab === "integrations") {
        await saveHospitalSettings("integrations", integrations);
      } else if (activeTab === "ai") {
        await saveHospitalSettings("ai", aiSettings);
      } else if (activeTab === "security") {
        await saveHospitalSettings("security", securitySettings);
      } else if (activeTab === "notifications") {
        await saveHospitalSettings("notifications", notificationSettings);
      } else if (activeTab === "billing") {
        await saveHospitalSettings("billing", billingSettings, { subscription_plan: billingSettings.plan });
      }

      setStatusMessage("Parametres enregistres.");
    } catch (error: unknown) {
      setStatusMessage(getErrorMessage(error, "Erreur lors de l'enregistrement."));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="py-20 text-center text-sm font-bold text-slate-600">Chargement des parametres...</div>;
  }

 return (
 <div className="space-y-8 pb-20">
 {/* Header */}
 <div>
 <h1 className="text-3xl font-black text-slate-900 tracking-tight">Configuration</h1>
 <p className="text-slate-600 font-medium">Personnalisez votre plateforme AKWABA HEALTH.</p>
 {loadError && (
 <p className="mt-3 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
 {loadError}
 </p>
 )}
 {statusMessage && (
 <p className="mt-3 inline-flex rounded-xl bg-blue-50 px-4 py-2 text-xs font-black uppercase tracking-widest text-blue-700">
 {statusMessage}
 </p>
 )}
 </div>

 <div className="space-y-8">
 {/* Navigation */}
 <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
 {tabs.map((tab) => (
 <button
 key={tab.id}
 onClick={() => setActiveTab(tab.id)}
 className={cn(
 "w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all relative group border text-left",
 activeTab === tab.id 
 ? "bg-white shadow-lg shadow-slate-200/60 border-blue-200" 
 : "text-slate-600 bg-white/60 hover:bg-white border-blue-100 shadow-sm"
 )}
 >
 <div className={cn(
 "w-11 h-11 rounded-xl flex items-center justify-center transition-all shrink-0",
 activeTab === tab.id ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-blue-50/50 text-slate-600"
 )}>
 <tab.icon className="w-5 h-5" />
 </div>
 <div className="min-w-0">
 <p className={cn("font-black text-sm", activeTab === tab.id ? "text-slate-900 " : "text-slate-600")}>{tab.label}</p>
 <p className="text-[10px] font-bold opacity-60 uppercase truncate">{tab.desc}</p>
 </div>
 {activeTab === tab.id && (
 <motion.div layoutId="settingActive" className="absolute inset-x-5 bottom-0 h-0.5 bg-blue-600 rounded-full" />
 )}
 </button>
 ))}
 </div>

 {/* Main Content Area */}
 <div className="max-w-6xl">
 <AnimatePresence mode="wait">
 {activeTab === "profile" && (
 <motion.div
 key="profile"
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: -20 }}
 className="bg-white rounded-[40px] shadow-sm p-10 space-y-12"
 >
 <div className="flex flex-col md:flex-row items-center gap-10">
 <div className="relative">
 <div className="w-32 h-32 bg-blue-600 rounded-[40px] flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-blue-500/20 overflow-hidden">
 {userProfile ? getProfileInitials(userProfile) : <User className="w-12 h-12" />}
 </div>
 </div>
 <div>
 <h3 className="text-2xl font-black tracking-tight">{getProfileDisplayName(userProfile)}</h3>
 <p className="text-slate-600 font-medium mt-1">Consultez et mettez a jour les informations de la personne connectee.</p>
 <div className="flex gap-4 mt-6">
 <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest">{userProfile?.role || "Utilisateur"}</span>
 <span className="px-3 py-1 bg-blue-50/50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest">ID: {userProfile?.id?.slice(0,8)}</span>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
 {profileFields.map((field) => (
 <div key={field.key} className="space-y-3">
 <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-4">{field.label}</label>
 <div className="relative">
 <field.icon className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
 <input 
 type={field.type || "text"}
 readOnly={field.readOnly}
 value={userProfile?.[field.key] || ""}
 onChange={(e) => setUserProfile((current) => current ? { ...current, [field.key]: e.target.value } : current)}
 className={cn(
 "w-full pl-14 pr-6 py-4 bg-white border-blue-100 shadow-sm border-none rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner",
 field.readOnly && "bg-slate-50 text-slate-500 cursor-not-allowed"
 )}
 />
 </div>
 </div>
 ))}
 </div>

 <div className="pt-10 border-t border-slate-50 flex justify-between items-center">
 <div className="flex items-center gap-3 text-slate-600">
 <Cloud className="w-5 h-5" />
 <p className="text-[10px] font-black uppercase tracking-widest">Cliquez sur sauvegarder pour appliquer les modifications</p>
 </div>
 <button 
 onClick={handleSave}
 disabled={isSaving}
 className="flex items-center gap-2 px-10 py-4 bg-blue-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all hover:-translate-y-1"
 >
 {isSaving ? "Enregistrement..." : <><Save className="w-4 h-4" /> Sauvegarder</>}
 </button>
 </div>
 </motion.div>
 )}

 {activeTab === "hospital" && (
 <motion.div
 key="hospital"
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: -20 }}
 className="bg-white rounded-[40px] shadow-sm p-10 space-y-12"
 >
 <div className="flex flex-col md:flex-row items-center gap-10">
 <div className="relative">
 <div className="w-32 h-32 bg-white border-blue-100 shadow-sm rounded-[40px] border-2 border-dashed border-slate-200 flex items-center justify-center text-blue-600 overflow-hidden shadow-inner">
 {hospital?.logo_url ? (
 <img src={hospital.logo_url} alt="Logo etablissement" className="h-full w-full object-contain p-4" />
 ) : (
 <Building2 className="w-12 h-12 opacity-20" />
 )}
 </div>
 </div>
 <div>
 <h3 className="text-2xl font-black tracking-tight">{hospital?.name || "Profil de l'etablissement"}</h3>
 <p className="text-slate-600 font-medium mt-1">Consultez et mettez a jour les informations officielles de votre structure.</p>
 <div className="flex gap-4 mt-6">
 <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest">Plan {hospital?.subscription_plan || "free"}</span>
 <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest">{hospital?.is_active ? "Compte actif" : "Compte inactif"}</span>
 </div>
 </div>
 </div>

 {hospitalNotice && (
 <div className="rounded-2xl border border-amber-100 bg-amber-50 px-5 py-4 text-sm font-bold text-amber-800">
 {hospitalNotice}
 </div>
 )}

 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
 {hospitalFields.map((field) => (
 <div key={field.key} className="space-y-3">
 <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-4">{field.label}</label>
 <div className="relative">
 <field.icon className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
 <input 
 type={field.type || "text"}
 disabled={!hospital}
 value={hospital?.[field.key] || ""}
 onChange={(e) => setHospital((current) => current ? { ...current, [field.key]: e.target.value } : current)}
 className={cn(
 "w-full pl-14 pr-6 py-4 bg-white border-blue-100 shadow-sm border-none rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner",
 !hospital && "bg-slate-50 text-slate-400 cursor-not-allowed"
 )}
 />
 </div>
 </div>
 ))}
 </div>

 <div className="pt-10 border-t border-slate-50 flex justify-between items-center">
 <div className="flex items-center gap-3 text-slate-600">
 <Cloud className="w-5 h-5" />
 <p className="text-[10px] font-black uppercase tracking-widest">Les informations sont chargees depuis le profil etablissement</p>
 </div>
 <button 
 onClick={handleSave}
 disabled={isSaving || !hospital}
 className={cn(
 "flex items-center gap-2 px-10 py-4 bg-blue-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all hover:-translate-y-1",
 (!hospital || isSaving) && "opacity-60 cursor-not-allowed hover:translate-y-0"
 )}
 >
 {isSaving ? "Enregistrement..." : <><Save className="w-4 h-4" /> Sauvegarder</>}
 </button>
 </div>
 </motion.div>
 )}

 {activeTab === "branding" && (
 <motion.div
 key="branding"
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: -20 }}
 className="bg-white rounded-[40px] shadow-xl shadow-blue-900/5 p-10 space-y-12"
 >
 <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
 <div className="space-y-6">
 <h4 className="text-lg font-black tracking-tight">Identite Visuelle</h4>
 <div className="p-8 border-2 border-dashed border-blue-100 rounded-[32px] flex flex-col items-center gap-4 bg-blue-50/20">
 {branding.logo_url ? (
 <img src={branding.logo_url} alt="Logo etablissement" className="w-24 h-24 object-contain rounded-2xl bg-white p-2" />
 ) : (
 <Building2 className="w-12 h-12 text-blue-300" />
 )}
 <input
 type="url"
 value={branding.logo_url}
 onChange={(e) => setBranding({ ...branding, logo_url: e.target.value })}
 placeholder="URL du logo enregistre"
 className="w-full px-4 py-3 bg-white border border-blue-100 rounded-2xl text-sm"
 />
 </div>
 </div>
 <div className="space-y-6">
 <h4 className="text-lg font-black tracking-tight">Couleurs de l&apos;Interface</h4>
 <div className="grid grid-cols-4 gap-4">
 {['#2563eb', '#10b981', '#f59e0b', '#ef4444'].map(color => (
 <button
 key={color}
 onClick={() => setBranding({ ...branding, primary_color: color })}
 className={cn("w-full h-12 rounded-2xl border shadow-sm transition-transform hover:scale-110", branding.primary_color === color ? "ring-4 ring-blue-200 border-blue-600" : "border-blue-50")}
 style={{ backgroundColor: color }}
 />
 ))}
 </div>
 <input
 type="color"
 value={branding.primary_color}
 onChange={(e) => setBranding({ ...branding, primary_color: e.target.value })}
 className="w-full h-12 rounded-2xl border border-blue-100 bg-white"
 />
 <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-10 py-4 bg-blue-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all">
 {isSaving ? "Enregistrement..." : <><Save className="w-4 h-4" /> Sauvegarder</>}
 </button>
 </div>
 </div>
 </motion.div>
 )}

 {activeTab === "ai" && (
 <motion.div
 key="ai"
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: -20 }}
 className="bg-white rounded-[40px] shadow-xl shadow-blue-900/5 p-10 space-y-12"
 >
 <div className="flex items-center gap-8 p-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[32px] text-white">
 <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-xl">
 <Zap className="w-10 h-10 text-white animate-pulse" />
 </div>
 <div>
 <h3 className="text-2xl font-black">Akwaba AI Core</h3>
 <p className="opacity-80 text-sm">Moteur d&apos;assistance au diagnostic et analyse prédictive.</p>
 </div>
 </div>

 <div className="space-y-8">
 <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 rounded-[28px] border border-blue-100 bg-blue-50/30 p-6">
 <div className="space-y-2">
 <label className="text-[10px] font-black uppercase tracking-widest text-slate-600">Fournisseur IA</label>
 <select value={aiSettings.active_provider} onChange={(e) => setAiSettings({ ...aiSettings, active_provider: e.target.value })} className="w-full px-4 py-3 bg-white border border-blue-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10">
 <option value="openai">OpenAI</option>
 <option value="anthropic">Claude</option>
 <option value="gemini">Gemini</option>
 <option value="mistral">Mistral</option>
 </select>
 </div>
 <div className="space-y-2">
 <label className="text-[10px] font-black uppercase tracking-widest text-slate-600">Modele</label>
 <input value={aiSettings.model} onChange={(e) => setAiSettings({ ...aiSettings, model: e.target.value })} className="w-full px-4 py-3 bg-white border border-blue-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10" placeholder="gpt-4.1-mini" />
 </div>
 <div className="space-y-2">
 <label className="text-[10px] font-black uppercase tracking-widest text-slate-600">Langue</label>
 <select value={aiSettings.response_language} onChange={(e) => setAiSettings({ ...aiSettings, response_language: e.target.value })} className="w-full px-4 py-3 bg-white border border-blue-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10">
 <option value="fr">Francais</option>
 <option value="en">Anglais</option>
 <option value="auto">Automatique</option>
 </select>
 </div>
 <div className="space-y-2">
 <label className="text-[10px] font-black uppercase tracking-widest text-slate-600">Confiance {aiSettings.confidence_threshold}%</label>
 <input type="range" min={40} max={95} value={aiSettings.confidence_threshold} onChange={(e) => setAiSettings({ ...aiSettings, confidence_threshold: Number(e.target.value) })} className="w-full accent-blue-600" />
 </div>
 </div>

 <ToggleRow
 title="Assistance au Diagnostic"
 description="Active le module d'aide au diagnostic dans les workflows cliniques."
 enabled={aiSettings.diagnostic_assistant}
 onToggle={() => setAiSettings({ ...aiSettings, diagnostic_assistant: !aiSettings.diagnostic_assistant })}
 />
 <ToggleRow
 title="Transcription Vocale"
 description="Autorise la saisie vocale des notes medicales."
 enabled={aiSettings.voice_transcription}
 onToggle={() => setAiSettings({ ...aiSettings, voice_transcription: !aiSettings.voice_transcription })}
 />
 <ToggleRow
 title="Analyse Predictive"
 description="Active les indicateurs predictifs bases sur les donnees enregistrees."
 enabled={aiSettings.predictive_analysis}
 onToggle={() => setAiSettings({ ...aiSettings, predictive_analysis: !aiSettings.predictive_analysis })}
 />
 <ToggleRow
 title="Contexte clinique"
 description="Autorise l'IA a utiliser les donnees du dossier patient."
 enabled={aiSettings.clinical_context}
 onToggle={() => setAiSettings({ ...aiSettings, clinical_context: !aiSettings.clinical_context })}
 />
 <ToggleRow
 title="Suggestions d'ordonnance"
 description="Propose des pistes de prescription au praticien."
 enabled={aiSettings.prescription_suggestions}
 onToggle={() => setAiSettings({ ...aiSettings, prescription_suggestions: !aiSettings.prescription_suggestions })}
 />
 <ToggleRow
 title="Interpretation laboratoire"
 description="Aide a resumer les resultats du laboratoire."
 enabled={aiSettings.lab_result_interpretation}
 onToggle={() => setAiSettings({ ...aiSettings, lab_result_interpretation: !aiSettings.lab_result_interpretation })}
 />
 <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-10 py-4 bg-blue-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all">
 {isSaving ? "Enregistrement..." : <><Save className="w-4 h-4" /> Sauvegarder</>}
 </button>
 </div>
 </motion.div>
 )}

 {activeTab === "integrations" && (
 <motion.div
 key="integrations"
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: -20 }}
 className="bg-white rounded-[40px] shadow-xl shadow-blue-900/5 p-10 space-y-12"
 >
 <div>
 <h3 className="text-2xl font-black tracking-tight mb-2">Intégrations & Logiciels Tiers</h3>
 <p className="text-slate-600 font-medium">Connectez AKWABA HEALTH à WhatsApp, vos IAs préférées et d&apos;autres outils externes.</p>
 </div>
 
 <div className="space-y-10">
 <section className="space-y-4">
 <div>
 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Communication</p>
 <h4 className="text-lg font-black text-slate-900">Logiciels de messagerie et notifications</h4>
 </div>
 <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
 {[
 { name: "WhatsApp Business", logo: "W", status: integrations.whatsapp_token, color: "emerald" },
 { name: "SMS Provider", logo: "S", status: integrations.sms_api_key, color: "sky" },
 { name: "Email SMTP", logo: "@", status: integrations.smtp_host && integrations.smtp_user, color: "amber" },
 ].map((software) => (
 <div key={software.name} className="rounded-[28px] border border-blue-100 bg-white p-6 shadow-sm">
 <div className="flex items-center gap-4">
 <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black", software.color === "emerald" ? "bg-emerald-50 text-emerald-600" : software.color === "sky" ? "bg-sky-50 text-sky-600" : "bg-amber-50 text-amber-600")}>{software.logo}</div>
 <div className="flex-1 min-w-0">
 <p className="font-black text-slate-900 truncate">{software.name}</p>
 <p className="text-xs font-medium text-slate-500">{software.status ? "API connectee" : "API non connectee"}</p>
 </div>
 </div>
 </div>
 ))}
 </div>
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
 <input type="password" placeholder="Token WhatsApp" value={integrations.whatsapp_token} onChange={(e) => setIntegrations({ ...integrations, whatsapp_token: e.target.value })} className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10" />
 <input type="password" placeholder="Cle API SMS" value={integrations.sms_api_key} onChange={(e) => setIntegrations({ ...integrations, sms_api_key: e.target.value })} className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10" />
 <input type="text" placeholder="Serveur SMTP / API email" value={integrations.smtp_host} onChange={(e) => setIntegrations({ ...integrations, smtp_host: e.target.value })} className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10" />
 <input type="text" placeholder="Phone Number ID" value={integrations.whatsapp_phone} onChange={(e) => setIntegrations({ ...integrations, whatsapp_phone: e.target.value })} className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10" />
 <input type="text" placeholder="Nom expediteur SMS" value={integrations.sms_sender} onChange={(e) => setIntegrations({ ...integrations, sms_sender: e.target.value })} className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10" />
 <input type="password" placeholder="Mot de passe / API key email" value={integrations.smtp_password} onChange={(e) => setIntegrations({ ...integrations, smtp_password: e.target.value })} className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10" />
 </div>
 <button onClick={handleSave} disabled={isSaving} className="w-full px-5 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all">Connecter les API communication</button>
 </section>

 <section className="space-y-4">
 <div>
 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Intelligence artificielle</p>
 <h4 className="text-lg font-black text-slate-900">Modeles IA connectables</h4>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
 {[
 { key: "openai", logo: "O", name: "OpenAI", value: integrations.openai },
 { key: "anthropic", logo: "C", name: "Claude", value: integrations.anthropic },
 { key: "gemini", logo: "G", name: "Google Gemini", value: integrations.gemini },
 { key: "mistral", logo: "M", name: "Mistral AI", value: integrations.mistral },
 ].map((tool) => (
 <div key={tool.key} className="rounded-[28px] border border-blue-100 bg-white p-6 shadow-sm space-y-4">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg font-black">{tool.logo}</div>
 <div className="flex-1">
 <p className="font-black text-slate-900">{tool.name}</p>
 <p className="text-xs font-medium text-slate-500">{tool.value ? "API connectee" : "API non connectee"}</p>
 </div>
 </div>
 <input type="password" placeholder={`Cle API ${tool.name}`} value={tool.value} onChange={(e) => setIntegrations({ ...integrations, [tool.key]: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10" />
 <button onClick={handleSave} disabled={isSaving} className="w-full px-5 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all">{tool.value ? "Mettre a jour l'API" : "Connecter l'API"}</button>
 </div>
 ))}
 </div>
 </section>

 <section className="space-y-4">
 <div>
 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Logiciels metiers</p>
 <h4 className="text-lg font-black text-slate-900">Synchronisations externes</h4>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <input type="url" placeholder="Webhook pharmacie" value={integrations.pharmacy_webhook} onChange={(e) => setIntegrations({ ...integrations, pharmacy_webhook: e.target.value })} className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10" />
 <input type="url" placeholder="Webhook laboratoire" value={integrations.laboratory_webhook} onChange={(e) => setIntegrations({ ...integrations, laboratory_webhook: e.target.value })} className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10" />
 <input type="url" placeholder="Webhook finance" value={integrations.finance_webhook} onChange={(e) => setIntegrations({ ...integrations, finance_webhook: e.target.value })} className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10" />
 </div>
 <button onClick={handleSave} disabled={isSaving} className="w-full px-5 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all">Connecter les webhooks</button>
 </section>
 </div>

 <div className="hidden">
  <div className="p-8 bg-white shadow-sm rounded-[32px] border border-blue-50 flex flex-col gap-6">
    <div className="flex gap-6 items-center">
    <div className="w-14 h-14 bg-green-100 text-green-600 rounded-[20px] flex items-center justify-center">
      <Cloud className="w-7 h-7" />
    </div>
    <div className="flex-1">
      <p className="font-black text-slate-900 tracking-tight">WhatsApp Business API</p>
      <p className="text-xs text-slate-600 font-medium">Envoyez des rappels de rendez-vous et des ordonnances directement sur WhatsApp.</p>
    </div>
    <div className="flex items-center gap-2">
      <div className={cn("w-2 h-2 rounded-full", integrations.whatsapp_token ? "bg-emerald-400" : "bg-slate-300")}></div>
      <span className={cn("text-[10px] font-black uppercase", integrations.whatsapp_token ? "text-emerald-600" : "text-slate-400")}>{integrations.whatsapp_token ? "Actif" : "Déconnecté"}</span>
    </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-700 ml-1">Token API (Permanent)</label>
        <input type="password" placeholder="EAAD..." value={integrations.whatsapp_token} onChange={(e) => setIntegrations({ ...integrations, whatsapp_token: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none" />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-700 ml-1">Phone Number ID</label>
        <input type="text" placeholder="10423049..." value={integrations.whatsapp_phone} onChange={(e) => setIntegrations({ ...integrations, whatsapp_phone: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none" />
      </div>
    </div>
  </div>

  <div className="p-8 bg-white shadow-sm rounded-[32px] border border-blue-50 flex flex-col gap-6">
    <div className="flex gap-6 items-center">
    <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-[20px] flex items-center justify-center">
      <Zap className="w-7 h-7" />
    </div>
    <div className="flex-1">
      <p className="font-black text-slate-900 tracking-tight">Intelligence Artificielle (Modèles)</p>
      <p className="text-xs text-slate-600 font-medium">Configurez jusqu&apos;à quatre fournisseurs d&apos;IA pour les diagnostics et analyses médicales.</p>
    </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-1 relative">
        <label className="text-xs font-bold text-slate-700 ml-1">OpenAI (ChatGPT)</label>
        <input type="password" placeholder="sk-proj-..." value={integrations.openai} onChange={(e) => setIntegrations({ ...integrations, openai: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none" />
      </div>
      <div className="space-y-1 relative">
        <label className="text-xs font-bold text-slate-700 ml-1">Anthropic (Claude)</label>
        <input type="password" placeholder="sk-ant-..." value={integrations.anthropic} onChange={(e) => setIntegrations({ ...integrations, anthropic: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none" />
      </div>
      <div className="space-y-1 relative">
        <label className="text-xs font-bold text-slate-700 ml-1">Google (Gemini)</label>
        <input type="password" placeholder="AIza..." value={integrations.gemini} onChange={(e) => setIntegrations({ ...integrations, gemini: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none" />
      </div>
      <div className="space-y-1 relative">
        <label className="text-xs font-bold text-slate-700 ml-1">Mistral AI</label>
        <input type="password" placeholder="API Key Mistral..." value={integrations.mistral} onChange={(e) => setIntegrations({ ...integrations, mistral: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none" />
      </div>
    </div>
  </div>

 <div className="p-8 bg-white shadow-sm rounded-[32px] border border-blue-50 flex flex-col gap-6">
 <div className="flex gap-6 items-center">
 <div className="w-14 h-14 bg-slate-100 text-slate-600 rounded-[20px] flex items-center justify-center">
 <Globe className="w-7 h-7" />
 </div>
 <div className="flex-1">
 <p className="font-black text-slate-900 tracking-tight">Logiciel de Pharmacie Externe (Webhook)</p>
 <p className="text-xs text-slate-600 font-medium">Synchronisez votre inventaire ou envoyez des ordonnances automatiquement via Webhook.</p>
 </div>
 <div className="flex items-center gap-2">
 <div className={cn("w-2 h-2 rounded-full", integrations.pharmacy_webhook ? "bg-emerald-400" : "bg-slate-300")}></div>
 <span className={cn("text-[10px] font-black uppercase", integrations.pharmacy_webhook ? "text-emerald-600" : "text-slate-400")}>{integrations.pharmacy_webhook ? "Actif" : "Désactivé"}</span>
 </div>
 </div>
 <div className="relative">
 <input type="text" placeholder="https://api.mapharmacie.ci/webhook" value={integrations.pharmacy_webhook} onChange={(e) => setIntegrations({ ...integrations, pharmacy_webhook: e.target.value })} className="w-full pl-6 pr-32 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none" />
 </div>
 </div>
 </div>
 
 <div className="pt-10 border-t border-slate-50 flex justify-end items-center">
 <button 
 onClick={handleSave}
 disabled={isSaving}
 className="flex items-center gap-2 px-10 py-4 bg-blue-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all hover:-translate-y-1"
 >
 {isSaving ? "Enregistrement..." : <><Save className="w-4 h-4" /> Sauvegarder</>}
 </button>
 </div>
 </motion.div>
 )}

 {activeTab === "security" && (
 <motion.div
 key="security"
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: -20 }}
 className="bg-white rounded-[40px] shadow-sm p-10 space-y-12"
 >
 <div>
 <h3 className="text-2xl font-black tracking-tight mb-2">Sécurité du Compte</h3>
 <p className="text-slate-600 font-medium">Protégez les données sensibles de vos patients.</p>
 </div>
 
 <div className="space-y-6">
 <ToggleRow
 title="Authentification a deux facteurs"
 description="Enregistre la preference de validation supplementaire pour cet etablissement."
 enabled={securitySettings.two_factor_enabled}
 onToggle={() => setSecuritySettings({ ...securitySettings, two_factor_enabled: !securitySettings.two_factor_enabled })}
 />
 <ToggleRow
 title="Alertes de connexion"
 description="Active les notifications internes lors des connexions sensibles."
 enabled={securitySettings.login_alerts}
 onToggle={() => setSecuritySettings({ ...securitySettings, login_alerts: !securitySettings.login_alerts })}
 />
 <ToggleRow
 title="Acces par roles"
 description="Conserve les restrictions par profil et service dans l'application."
 enabled={securitySettings.role_based_access}
 onToggle={() => setSecuritySettings({ ...securitySettings, role_based_access: !securitySettings.role_based_access })}
 />
 <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-10 py-4 bg-blue-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all">
 {isSaving ? "Enregistrement..." : <><Save className="w-4 h-4" /> Sauvegarder</>}
 </button>
 </div>
 </motion.div>
 )}

 {activeTab === "notifications" && (
 <motion.div
 key="notifications"
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: -20 }}
 className="bg-white rounded-[40px] shadow-sm p-10 space-y-12"
 >
 <div>
 <h3 className="text-2xl font-black tracking-tight mb-2">Communications</h3>
 <p className="text-slate-600 font-medium">Gérez les alertes SMS et Email envoyées aux patients.</p>
 </div>
 <div className="space-y-6">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-5 rounded-[28px] border border-blue-100 bg-blue-50/30 p-6">
 <div className="space-y-2">
 <label className="text-[10px] font-black uppercase tracking-widest text-slate-600">Nom expediteur</label>
 <input value={notificationSettings.sender_name} onChange={(e) => setNotificationSettings({ ...notificationSettings, sender_name: e.target.value })} className="w-full px-4 py-3 bg-white border border-blue-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10" />
 </div>
 <div className="space-y-2">
 <label className="text-[10px] font-black uppercase tracking-widest text-slate-600">Delai rappel en heures</label>
 <input type="number" min={1} value={notificationSettings.reminder_delay_hours} onChange={(e) => setNotificationSettings({ ...notificationSettings, reminder_delay_hours: Number(e.target.value) })} className="w-full px-4 py-3 bg-white border border-blue-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10" />
 </div>
 {[
 { key: "appointment_channel", label: "Rendez-vous" },
 { key: "invoice_channel", label: "Factures" },
 { key: "prescription_channel", label: "Ordonnances" },
 { key: "lab_results_channel", label: "Resultats laboratoire" },
 { key: "emergency_channel", label: "Urgences" },
 ].map((item) => (
 <div key={item.key} className="space-y-2">
 <label className="text-[10px] font-black uppercase tracking-widest text-slate-600">{item.label}</label>
 <select value={String(notificationSettings[item.key as keyof typeof notificationSettings])} onChange={(e) => setNotificationSettings({ ...notificationSettings, [item.key]: e.target.value })} className="w-full px-4 py-3 bg-white border border-blue-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10">
 <option value="whatsapp">WhatsApp Business</option>
 <option value="sms">SMS Provider</option>
 <option value="email">Email SMTP</option>
 <option value="disabled">Desactive</option>
 </select>
 </div>
 ))}
 <div className="rounded-2xl bg-white border border-blue-100 p-4 text-xs font-bold text-slate-600">
 WhatsApp: {integrations.whatsapp_token ? "connecte" : "non connecte"} | SMS: {integrations.sms_api_key ? "connecte" : "non connecte"} | Email: {integrations.smtp_host ? "connecte" : "non connecte"}
 </div>
 </div>
 <ToggleRow
 title="Rappels de Rendez-vous SMS"
 description="Autorise l'envoi de rappels SMS pour les rendez-vous."
 enabled={notificationSettings.sms_appointment_reminders}
 onToggle={() => setNotificationSettings({ ...notificationSettings, sms_appointment_reminders: !notificationSettings.sms_appointment_reminders })}
 />
 <ToggleRow
 title="Envoi Factures par Email"
 description="Autorise l'envoi des factures aux patients par email."
 enabled={notificationSettings.email_invoices}
 onToggle={() => setNotificationSettings({ ...notificationSettings, email_invoices: !notificationSettings.email_invoices })}
 />
 <ToggleRow
 title="Ordonnances WhatsApp"
 description="Autorise l'envoi des ordonnances via l'integration WhatsApp configuree."
 enabled={notificationSettings.whatsapp_prescriptions}
 onToggle={() => setNotificationSettings({ ...notificationSettings, whatsapp_prescriptions: !notificationSettings.whatsapp_prescriptions })}
 />
 <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-10 py-4 bg-blue-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all">
 {isSaving ? "Enregistrement..." : <><Save className="w-4 h-4" /> Sauvegarder</>}
 </button>
 </div>
 </motion.div>
 )}

 {activeTab === "billing" && (
 <motion.div
 key="billing"
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: -20 }}
 className="bg-white rounded-[40px] shadow-sm p-10 space-y-12"
 >
 <div className="p-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[40px] text-white">
 <h3 className="text-3xl font-black mb-2">Plan {billingSettings.plan}</h3>
 <p className="opacity-80">Les informations d&apos;abonnement sont lues et sauvegardees dans la base.</p>
 <div className="mt-10 pt-10 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
 <div className="space-y-2">
 <label className="text-[10px] font-black uppercase tracking-widest opacity-70">Plan</label>
 <select
 value={billingSettings.plan}
 onChange={(e) => setBillingSettings({ ...billingSettings, plan: e.target.value })}
 className="w-full px-4 py-3 rounded-2xl text-slate-900 font-bold"
 >
 <option value="free">Free</option>
 <option value="pro">Pro</option>
 <option value="enterprise">Enterprise</option>
 </select>
 </div>
 <div className="space-y-2">
 <label className="text-[10px] font-black uppercase tracking-widest opacity-70">Montant mensuel</label>
 <input
 type="number"
 value={billingSettings.monthly_amount}
 onChange={(e) => setBillingSettings({ ...billingSettings, monthly_amount: Number(e.target.value) })}
 className="w-full px-4 py-3 rounded-2xl text-slate-900 font-bold"
 />
 </div>
 <button onClick={handleSave} disabled={isSaving} className="px-8 py-4 bg-white text-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">
 {isSaving ? "Enregistrement..." : "Sauvegarder"}
 </button>
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 </div>
 </div>
 );
}
