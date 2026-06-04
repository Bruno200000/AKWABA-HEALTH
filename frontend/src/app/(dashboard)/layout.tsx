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
  Bell,
  BrainCircuit,
  MessageSquare,
  Search,
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

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    router.push("/login");
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
                placeholder="Rechercher un patient, dossier, rendez-vous ou service..."
                className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
              <span className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                Ctrl K
              </span>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <button className="relative p-2.5 text-slate-500 hover:bg-blue-50 rounded-xl transition-all hover:scale-105 active:scale-95 group">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-white" />
                <div className="absolute top-full right-0 mt-2 hidden group-hover:block bg-white shadow-xl rounded-xl p-3 border border-blue-100 text-[10px] w-48 z-50">
                  <p className="font-bold text-slate-400 uppercase mb-2">Notifications</p>
                  <p className="text-slate-600">Pas de nouvelles notifications.</p>
                </div>
              </button>
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
