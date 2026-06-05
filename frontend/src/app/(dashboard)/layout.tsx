"use client";

import React, { useState } from "react";
import { 
  LayoutDashboard, 
  Users, 
  UserRound, 
  Calendar, 
  Stethoscope, 
  Pill, 
  Beaker, 
  Bed, 
  CreditCard, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Mic,
  MicOff,
  HelpCircle,
  Bell,
  BrainCircuit,
  MessageSquare,
  Search,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Activity,
  Zap,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import AkwabaAI from "@/components/AkwabaAI";

const menuGroups = [
  {
    title: "Principal",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
      { icon: Zap, label: "Remote Control", href: "/dashboard/remote" },
      { icon: HelpCircle, label: "Guide", href: "/dashboard/guide" },
    ]
  },
  {
    title: "Dossiers & Soins",
    items: [
      { 
        icon: Users, 
        label: "Patients", 
        href: "/dashboard/patients",
        subItems: [
          { label: "Liste des patients", href: "/dashboard/patients" },
          { label: "Admissions", href: "/dashboard/patients/admissions" },
          { label: "Dossiers Médicaux", href: "/dashboard/patients/records" },
        ]
      },
      { 
        icon: Stethoscope, 
        label: "Consultations", 
        href: "/dashboard/consultations",
        subItems: [
          { label: "File d'attente", href: "/dashboard/consultations" },
          { label: "Historique", href: "/dashboard/consultations/history" },
          { label: "Urgences", href: "/dashboard/consultations/emergency" },
        ]
      },
      {
        icon: Bed,
        label: "Hospitalisation",
        href: "/dashboard/hospitalization",
        subItems: [
          { label: "Occupation des lits", href: "/dashboard/hospitalization" },
          { label: "Chambres & lits", href: "/dashboard/hospitalization/rooms" },
        ]
      },
    ]
  },
  {
    title: "Services Tech",
    items: [
      { 
        icon: Pill, 
        label: "Pharmacie", 
        href: "/dashboard/pharmacy",
        subItems: [
          { label: "Stock", href: "/dashboard/pharmacy" },
          { label: "Ventes", href: "/dashboard/pharmacy/sales" },
          { label: "Fournisseurs", href: "/dashboard/pharmacy/suppliers" },
        ]
      },
      { 
        icon: Beaker, 
        label: "Laboratoire", 
        href: "/dashboard/laboratory",
        subItems: [
          { label: "Analyses", href: "/dashboard/laboratory" },
          { label: "Résultats", href: "/dashboard/laboratory/results" },
        ]
      },
    ]
  },
  {
    title: "Organisation",
    items: [
      { icon: Calendar, label: "Rendez-vous", href: "/dashboard/appointments" },
      { 
        icon: UserRound, 
        label: "Personnel", 
        href: "/dashboard/staff",
        subItems: [
          { label: "Équipe", href: "/dashboard/staff" },
          { label: "Planning", href: "/dashboard/staff/schedule" },
        ]
      },
    ]
  },
  {
    title: "Gestion",
    items: [
      { icon: CreditCard, label: "Finance", href: "/dashboard/finance" },
      { icon: Settings, label: "Paramètres", href: "/dashboard/settings" },
    ]
  }
];

const getProfileDisplayName = (profile: any) => {
  const firstName = profile?.first_name?.trim?.() || "";
  const lastName = profile?.last_name?.trim?.() || "";
  const fullName = `${firstName} ${lastName}`.trim();
  const email = profile?.email || "";

  if (fullName) {
    return profile?.role === "DOCTOR" ? `Dr. ${fullName}` : fullName;
  }

  return email ? email.split("@")[0] : "Utilisateur";
};

const getProfileInitials = (profile: any) => {
  const firstName = profile?.first_name?.trim?.() || "";
  const lastName = profile?.last_name?.trim?.() || "";

  if (firstName || lastName) {
    return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
  }

  return (profile?.email?.[0] || "U").toUpperCase();
};

type SpeechRecognitionConstructor = new () => {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  type: "appointment" | "stock" | "invoice" | "lab";
  priority: "high" | "medium" | "low";
  createdAt?: string;
};

const getSearchDestination = (query: string) => {
  const value = query.toLowerCase();

  if (value.includes("patient") || value.includes("dossier")) return "/dashboard/patients";
  if (value.includes("rendez") || value.includes("rdv") || value.includes("calendrier")) return "/dashboard/appointments";
  if (value.includes("consultation") || value.includes("diagnostic")) return "/dashboard/consultations";
  if (value.includes("pharmacie") || value.includes("stock") || value.includes("medicament")) return "/dashboard/pharmacy";
  if (value.includes("laboratoire") || value.includes("analyse") || value.includes("resultat")) return "/dashboard/laboratory";
  if (value.includes("finance") || value.includes("facture") || value.includes("paiement")) return "/dashboard/finance";
  if (value.includes("personnel") || value.includes("equipe") || value.includes("planning")) return "/dashboard/staff";
  if (value.includes("hospitalisation") || value.includes("chambre") || value.includes("lit")) return "/dashboard/hospitalization";
  if (value.includes("integration") || value.includes("api") || value.includes("parametre")) return "/dashboard/settings";
  if (value.includes("guide") || value.includes("aide") || value.includes("comment")) return "/dashboard/guide";

  return "/dashboard";
};

function NavItem({ item, isSidebarOpen, pathname }: { item: any, isSidebarOpen: boolean, pathname: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const hasSubItems = item.subItems && item.subItems.length > 0;
  const isActive = pathname === item.href || (hasSubItems && item.subItems.some((sub: any) => pathname === sub.href));
  
  // Auto-open if active
  React.useEffect(() => {
    if (isActive && hasSubItems) setIsOpen(true);
  }, [isActive, hasSubItems]);

  return (
    <div className="space-y-1">
      <div className="relative group">
        <Link 
          href={hasSubItems ? "#" : item.href}
          onClick={(e) => {
            if (hasSubItems) {
              e.preventDefault();
              setIsOpen(!isOpen);
            }
          }}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all relative z-10",
            isActive && !hasSubItems
              ? "bg-white text-blue-900 shadow-xl" 
              : "text-blue-100/80 hover:bg-white/10 hover:text-white"
          )}
        >
          <item.icon className={cn("w-5 h-5 shrink-0 text-current", !isActive && "group-hover:scale-110 transition-transform")} />
          {isSidebarOpen && (
            <div className="flex-1 flex items-center justify-between min-w-0">
              <span className="font-bold text-sm truncate">{item.label}</span>
              {hasSubItems && (
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
                  <ChevronDown className="w-4 h-4 opacity-50" />
                </motion.div>
              )}
            </div>
          )}
        </Link>
        {isActive && !hasSubItems && (
          <motion.div 
            layoutId="activeNav"
            className="absolute inset-0 bg-white rounded-2xl -z-0 shadow-lg shadow-blue-900/20"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
      </div>

      <AnimatePresence>
        {isOpen && isSidebarOpen && hasSubItems && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="ml-9 border-l border-white/10 space-y-1 overflow-hidden"
          >
            {item.subItems.map((sub: any) => {
              const isSubActive = pathname === sub.href;
              return (
                <Link
                  key={sub.href}
                  href={sub.href}
                  className={cn(
                    "block px-4 py-2 text-sm transition-all rounded-lg",
                    isSubActive
                      ? "text-white font-black"
                      : "text-blue-100/70 hover:text-white hover:bg-white/5"
                  )}
                >
                  {sub.label}
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [gateReady, setGateReady] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState("");
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [dismissedNotifications, setDismissedNotifications] = useState<string[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  React.useEffect(() => {
    const fetchProfile = async () => {
      if (!isSupabaseConfigured) {
        router.replace("/login");
        setGateReady(true);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        setGateReady(true);
        return;
      }

      const fallbackProfile = {
        id: user.id,
        email: user.email || "",
        first_name: user.user_metadata?.first_name || user.user_metadata?.name?.split(" ")?.[0] || "",
        last_name: user.user_metadata?.last_name || user.user_metadata?.name?.split(" ")?.slice(1).join(" ") || "",
        phone: user.phone || user.user_metadata?.phone || "",
        role: user.user_metadata?.role || "Utilisateur",
      };

      const { data } = await supabase
        .from("profiles")
        .select("*, hospitals(name, logo_url, primary_color)")
        .eq("id", user.id)
        .maybeSingle();

      setProfile({
        ...fallbackProfile,
        ...(data || {}),
        email: data?.email || user.email || "",
      });
      setGateReady(true);
    };
    fetchProfile();
  }, [router]);

  React.useEffect(() => {
    const stored = window.localStorage.getItem("akwaba-dismissed-notifications");
    if (stored) {
      try {
        setDismissedNotifications(JSON.parse(stored));
      } catch {
        setDismissedNotifications([]);
      }
    }
  }, []);

  const fetchNotifications = React.useCallback(async () => {
    const hospitalId = profile?.hospital_id;
    if (!hospitalId || !isSupabaseConfigured) return;

    setIsLoadingNotifications(true);

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const [
        { data: appointments },
        { data: medicines },
        { data: invoices },
        { data: labResults },
      ] = await Promise.all([
        supabase
          .from("appointments")
          .select("id, start_time, status, reason, patients(first_name, last_name)")
          .eq("hospital_id", hospitalId)
          .gte("start_time", today.toISOString())
          .lt("start_time", tomorrow.toISOString())
          .in("status", ["PENDING", "CONFIRMED", "IN_PROGRESS"])
          .order("start_time", { ascending: true })
          .limit(5),
        supabase
          .from("medicines")
          .select("id, name, stock_quantity, min_stock_alert")
          .eq("hospital_id", hospitalId)
          .limit(20),
        supabase
          .from("invoices")
          .select("id, total_amount, paid_amount, status, patients(first_name, last_name)")
          .eq("hospital_id", hospitalId)
          .neq("status", "PAID")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("lab_tests")
          .select("id, test_type, completed_at, created_at, patients(first_name, last_name)")
          .eq("hospital_id", hospitalId)
          .eq("status", "COMPLETED")
          .order("completed_at", { ascending: false })
          .limit(3),
      ]);

      const lowStock = (medicines || []).filter(
        (item: any) => Number(item.stock_quantity || 0) <= Number(item.min_stock_alert || 10)
      );

      const nextNotifications: NotificationItem[] = [
        ...(appointments || []).map((appointment: any) => ({
          id: `appointment-${appointment.id}`,
          title: "Rendez-vous aujourd'hui",
          description: `${appointment.patients?.first_name || ""} ${appointment.patients?.last_name || ""} - ${new Date(appointment.start_time).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`,
          href: "/dashboard/appointments",
          type: "appointment" as const,
          priority: appointment.status === "IN_PROGRESS" ? "high" as const : "medium" as const,
          createdAt: appointment.start_time,
        })),
        ...lowStock.slice(0, 5).map((medicine: any) => ({
          id: `stock-${medicine.id}`,
          title: "Stock faible",
          description: `${medicine.name} : ${medicine.stock_quantity} unite(s) restantes`,
          href: "/dashboard/pharmacy",
          type: "stock" as const,
          priority: "high" as const,
        })),
        ...(invoices || []).map((invoice: any) => ({
          id: `invoice-${invoice.id}`,
          title: "Facture a suivre",
          description: `${invoice.patients?.first_name || ""} ${invoice.patients?.last_name || ""} - reste ${Math.max(0, Number(invoice.total_amount || 0) - Number(invoice.paid_amount || 0)).toLocaleString()} CFA`,
          href: "/dashboard/finance",
          type: "invoice" as const,
          priority: "medium" as const,
        })),
        ...(labResults || []).map((lab: any) => ({
          id: `lab-${lab.id}`,
          title: "Resultat laboratoire pret",
          description: `${lab.test_type || "Analyse"} - ${lab.patients?.first_name || ""} ${lab.patients?.last_name || ""}`,
          href: "/dashboard/laboratory/results",
          type: "lab" as const,
          priority: "low" as const,
          createdAt: lab.completed_at || lab.created_at,
        })),
      ];

      setNotifications(nextNotifications);
    } finally {
      setIsLoadingNotifications(false);
    }
  }, [profile?.hospital_id]);

  React.useEffect(() => {
    if (!gateReady || !profile?.hospital_id) return;
    void fetchNotifications();
  }, [fetchNotifications, gateReady, profile?.hospital_id]);

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    router.push("/login");
  };

  const runGlobalSearch = (value: string) => {
    const query = value.trim();
    if (!query) return;
    router.push(getSearchDestination(query));
  };

  const startVoiceSearch = () => {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor }).SpeechRecognition ||
      (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceMessage("Micro non disponible sur ce navigateur.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "fr-FR";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript || "";
      setGlobalSearch(transcript);
      setVoiceMessage(transcript ? `Recherche vocale : ${transcript}` : "");
      runGlobalSearch(transcript);
    };
    recognition.onerror = () => {
      setIsListening(false);
      setVoiceMessage("Impossible d'utiliser le micro.");
    };
    recognition.onend = () => setIsListening(false);
    setIsListening(true);
    setVoiceMessage("Parlez maintenant...");
    recognition.start();
  };

  const visibleNotifications = notifications.filter((item) => !dismissedNotifications.includes(item.id));

  const dismissNotification = (id: string) => {
    const nextDismissed = [...dismissedNotifications, id];
    setDismissedNotifications(nextDismissed);
    window.localStorage.setItem("akwaba-dismissed-notifications", JSON.stringify(nextDismissed));
  };

  const notificationIcon = (type: NotificationItem["type"]) => {
    if (type === "stock") return Pill;
    if (type === "invoice") return CreditCard;
    if (type === "lab") return Beaker;
    return Calendar;
  };

  if (!gateReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#f0f7ff] text-blue-900">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        <p className="text-sm font-bold text-blue-900/80">Chargement de votre espace…</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f0f7ff] text-slate-900 overflow-hidden font-sans">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="relative bg-slate-950 border-r border-white/5 flex flex-col z-40 shadow-2xl transition-all duration-300 bg-grid"
      >
        {/* Logo Section */}
        <div className="h-20 flex items-center px-6 border-b border-white/5 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-md p-1.5 ring-2 ring-blue-100">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            {isSidebarOpen && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col min-w-0"
              >
                <span className="font-black text-sm tracking-tight text-white leading-tight truncate max-w-[160px]">
                  {profile?.hospitals?.name || "AKWABA HEALTH"}
                </span>
                <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest leading-none mt-1">
                  Plateforme Médicale
                </span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-8 custom-scrollbar">
          {menuGroups.map((group) => (
            <div key={group.title} className="space-y-2">
              {isSidebarOpen && (
                <div className="px-4 text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-4">
                  {group.title}
                </div>
              )}
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavItem key={item.label} item={item} isSidebarOpen={isSidebarOpen} pathname={pathname} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 mt-auto border-t border-white/5 bg-slate-900/30">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-blue-100/80 hover:bg-white/5 hover:text-white transition-all group"
          >
            <LogOut className="w-5 h-5 shrink-0 group-hover:-translate-x-1 transition-transform" />
            {isSidebarOpen && <span className="font-bold text-sm">Déconnexion</span>}
          </button>
        </div>

        {/* Toggle Button */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-24 w-6 h-6 bg-slate-900 border border-white/10 rounded-full flex items-center justify-center shadow-lg z-50 hover:bg-white hover:text-slate-900 transition-all text-blue-400 group"
        >
          {isSidebarOpen ? (
            <ChevronLeft className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          )}
        </button>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white/90 backdrop-blur-xl border-b border-blue-100/80 flex items-center justify-between px-8 sticky top-0 z-30 shadow-sm shadow-blue-500/5">
          <div className="flex items-center gap-6 flex-1">
            <div className="relative max-w-2xl w-full hidden lg:flex items-center gap-3 rounded-2xl border border-blue-100 bg-white px-4 py-2.5 shadow-sm transition-all focus-within:border-blue-300 focus-within:shadow-md focus-within:shadow-blue-100/60">
              <div className="w-8 h-8 rounded-xl bg-white border border-blue-100 flex items-center justify-center shrink-0 shadow-sm p-1.5">
                <img src="/logo.png" alt="AKWABA HEALTH" className="w-full h-full object-contain" />
              </div>
              <div className="h-8 w-px bg-blue-100" />
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={globalSearch}
                onChange={(event) => setGlobalSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") runGlobalSearch(globalSearch);
                }}
                placeholder="Rechercher un patient, dossier, rendez-vous ou service..."
                className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={startVoiceSearch}
                className={cn(
                  "relative flex h-8 w-8 items-center justify-center rounded-xl border text-slate-500 transition-all hover:bg-blue-50 hover:text-blue-600",
                  isListening ? "border-blue-300 bg-blue-50 text-blue-600" : "border-slate-200 bg-slate-50"
                )}
                title={isListening ? "Micro actif" : "Recherche vocale"}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                {isListening && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />}
              </button>
              <button
                type="button"
                onClick={() => runGlobalSearch(globalSearch)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all hover:bg-blue-50 hover:text-blue-600"
              >
                Entrer
              </button>
              {voiceMessage && (
                <div className="absolute left-16 top-full mt-2 rounded-xl border border-blue-100 bg-white px-3 py-2 text-[10px] font-bold text-slate-500 shadow-xl">
                  {voiceMessage}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsNotificationsOpen((current) => !current)}
                  className="relative p-2.5 text-slate-500 hover:bg-blue-50 rounded-xl transition-all hover:scale-105 active:scale-95"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {visibleNotifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-500 text-white rounded-full ring-2 ring-white text-[10px] font-black flex items-center justify-center">
                      {visibleNotifications.length > 9 ? "9+" : visibleNotifications.length}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {isNotificationsOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 12, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.96 }}
                        className="absolute right-0 top-full z-50 mt-3 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-2xl shadow-blue-900/10"
                      >
                        <div className="flex items-center justify-between gap-3 border-b border-blue-50 bg-blue-50/50 px-5 py-4">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-600">Centre d&apos;alertes</p>
                            <p className="text-sm font-black text-slate-900">
                              {visibleNotifications.length} notification{visibleNotifications.length > 1 ? "s" : ""}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => void fetchNotifications()}
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm transition-all hover:text-blue-600"
                            title="Actualiser"
                          >
                            <RefreshCw className={cn("h-4 w-4", isLoadingNotifications && "animate-spin")} />
                          </button>
                        </div>

                        <div className="max-h-[420px] overflow-y-auto p-3 custom-scrollbar">
                          {isLoadingNotifications ? (
                            <div className="flex items-center justify-center gap-2 py-10 text-xs font-black uppercase tracking-widest text-slate-500">
                              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                              Chargement
                            </div>
                          ) : visibleNotifications.length > 0 ? (
                            <div className="space-y-2">
                              {visibleNotifications.map((item) => {
                                const Icon = notificationIcon(item.type);
                                return (
                                  <div key={item.id} className="group rounded-2xl border border-slate-100 bg-white p-3 transition-all hover:border-blue-100 hover:bg-blue-50/40">
                                    <div className="flex gap-3">
                                      <div className={cn(
                                        "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                                        item.priority === "high" ? "bg-red-50 text-red-600" : item.priority === "medium" ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"
                                      )}>
                                        {item.priority === "high" ? <AlertTriangle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setIsNotificationsOpen(false);
                                          router.push(item.href);
                                        }}
                                        className="min-w-0 flex-1 text-left"
                                      >
                                        <p className="text-sm font-black text-slate-900">{item.title}</p>
                                        <p className="mt-1 line-clamp-2 text-xs font-medium leading-relaxed text-slate-500">{item.description}</p>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => dismissNotification(item.id)}
                                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-300 transition-all hover:bg-white hover:text-slate-600"
                                        title="Masquer"
                                      >
                                        <X className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                <CheckCircle2 className="h-6 w-6" />
                              </div>
                              <p className="text-sm font-black text-slate-900">Aucune alerte active</p>
                              <p className="mt-1 text-xs font-medium text-slate-500">Rendez-vous, stocks, factures et resultats sont a jour.</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
              <button className="relative p-2.5 text-slate-500 hover:bg-blue-50 rounded-xl transition-all hover:scale-105 active:scale-95 group">
                <MessageSquare className="w-5 h-5" />
                <div className="absolute top-full right-0 mt-2 hidden group-hover:block bg-white shadow-xl rounded-xl p-3 border border-blue-100 text-[10px] w-48 z-50">
                  <p className="font-bold text-slate-400 uppercase mb-2">Messages</p>
                  <p className="text-slate-600">Aucune discussion en cours.</p>
                </div>
              </button>
            </div>
            
            <div className="h-8 w-px bg-blue-100 mx-2" />
            
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3.5 p-1 pr-3 rounded-full hover:bg-blue-50/70 transition-all border border-transparent hover:border-blue-100"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/25">
                  {getProfileInitials(profile)}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-bold text-slate-900 leading-none mb-1">
                    {getProfileDisplayName(profile)}
                  </p>
                  <p className="text-[10px] text-blue-700 uppercase font-black tracking-wider">
                    {profile?.role || "Collaborateur"}
                  </p>
                </div>
                <ChevronDown className={cn("w-4 h-4 text-slate-500 transition-transform", isProfileOpen && "rotate-180")} />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-64 bg-white border border-blue-100 rounded-2xl shadow-xl shadow-blue-900/10 z-50 p-2 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-blue-50 mb-1 bg-blue-50/60 -m-2 mb-2">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Compte Connecté</p>
                        <p className="text-xs font-bold text-slate-700 truncate mt-0.5">{getProfileDisplayName(profile)}</p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{profile?.email}</p>
                      </div>
                      <div className="space-y-1">
                        <Link 
                          href="/dashboard/settings" 
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-blue-50 transition-all"
                        >
                          <Settings className="w-4 h-4 text-slate-400" /> Mon Profil
                        </Link>
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
                        >
                          <LogOut className="w-4 h-4" /> Déconnexion
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#f0f7ff] p-8 custom-scrollbar relative">
          <div className="max-w-7xl mx-auto relative z-10">
            {children}
          </div>
          {/* Subtle background decoration to avoid 'noir' look */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200/20 blur-[100px] -z-0 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-sky-200/20 blur-[100px] -z-0 pointer-events-none" />
        </main>
      </div>
      <AkwabaAI />
    </div>
  );
}
