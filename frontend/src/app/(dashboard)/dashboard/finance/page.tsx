"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
 CreditCard, 
 Search, 
 Plus, 
 Receipt, 
 TrendingUp, 
 AlertCircle,
 CheckCircle2,
 ChevronRight,
 Filter,
 DollarSign,
 Smartphone,
 Wallet,
 Download,
 FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import InvoiceForm from "./InvoiceForm";
import PaymentModal from "./PaymentModal";
import { supabase } from "@/lib/supabase";

const statusStyles = {
 PAID: "bg-emerald-50 text-emerald-600 border-emerald-100",
 PARTIAL: "bg-amber-50 text-amber-600 border-amber-100",
 UNPAID: "bg-red-50 text-red-600 border-red-100",
};

export default function FinancePage() {
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [invoices, setInvoices] = useState<any[]>([]);
 const [isLoading, setIsLoading] = useState(true);
 const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
 const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
 const [activeView, setActiveView] = useState("invoices"); // invoices, quotes, cash-report
 const [stats, setStats] = useState({
 totalRevenue: 0,
 paidAmount: 0,
 unpaidAmount: 0,
 waveRevenue: 0,
 orangeRevenue: 0,
 cashRevenue: 0
 });

 useEffect(() => {
 fetchInvoices();
 }, []);

 const fetchInvoices = async () => {
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) return;

 const { data: profile } = await supabase.from('profiles').select('hospital_id').eq('id', user.id).single();
 if (!profile?.hospital_id) return;

 const { data } = await supabase
 .from("invoices")
 .select("*, patients(first_name, last_name)")
 .eq("hospital_id", profile.hospital_id)
 .order("created_at", { ascending: false });

 if (data) {
 setInvoices(data);
 const total = data.reduce((acc, inv) => acc + (Number(inv.total_amount) || 0), 0);
 const paid = data.reduce((acc, inv) => acc + (Number(inv.paid_amount) || 0), 0);
 
 const wave = data.filter(inv => inv.payment_method === 'WAVE').reduce((acc, inv) => acc + (Number(inv.paid_amount) || 0), 0);
 const cash = data.filter(inv => inv.payment_method === 'CASH').reduce((acc, inv) => acc + (Number(inv.paid_amount) || 0), 0);
 const card = data.filter(inv => inv.payment_method === 'CARD' || inv.payment_method === 'ORANGE').reduce((acc, inv) => acc + (Number(inv.paid_amount) || 0), 0);

 setStats({
 totalRevenue: total,
 paidAmount: paid,
 unpaidAmount: total - paid,
 waveRevenue: wave,
 orangeRevenue: card,
 cashRevenue: cash
 });
 }
 setIsLoading(false);
 };

 return (
 <div className="space-y-8 pb-20">
 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestion Financière</h1>
 <p className="text-slate-500 font-medium">Suivez les encaissements et revenus en temps réel.</p>
 </div>
 <div className="flex gap-3">
 <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2">
 <Download className="w-4 h-4" /> Rapport
 </button>
 <button 
 onClick={() => setIsModalOpen(true)}
 className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 "
 >
 <Plus className="w-4 h-4" /> Nouvelle Facture
 </button>
 </div>
 </div>

 {/* Stats Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
 <div className="dash-card !p-6">
 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Chiffre d&apos;Affaires</p>
 <div className="flex items-end gap-2">
 <h3 className="text-2xl font-black">{stats.totalRevenue.toLocaleString()}</h3>
 <span className="text-[10px] font-bold text-slate-400 mb-1">CFA</span>
 </div>
 </div>

 <div className="dash-card !p-6">
 <div className="absolute top-0 right-0 p-4 opacity-5"><Smartphone className="w-12 h-12" /></div>
 <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3">Mobile Money</p>
 <div className="flex items-end gap-2">
 <h3 className="text-2xl font-black">{(stats.waveRevenue + stats.orangeRevenue).toLocaleString()}</h3>
 <span className="text-[10px] font-bold text-slate-400 mb-1">CFA</span>
 </div>
 </div>

 <div className="dash-card !p-6">
 <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-3">Caisse (Espèces)</p>
 <div className="flex items-end gap-2">
 <h3 className="text-2xl font-black">{stats.cashRevenue.toLocaleString()}</h3>
 <span className="text-[10px] font-bold text-slate-400 mb-1">CFA</span>
 </div>
 </div>

 <div className="dash-card !p-6 !bg-red-50/50 !border-red-100">
 <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-3">Impayés</p>
 <div className="flex items-end gap-2">
 <h3 className="text-2xl font-black text-red-600">{stats.unpaidAmount.toLocaleString()}</h3>
 <span className="text-[10px] font-bold text-red-400 mb-1">CFA</span>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 <div className="lg:col-span-2 space-y-6">
 <div className="flex gap-4 border-b border-slate-100 ">
 {["invoices", "quotes", "cash-report"].map((tab) => (
 <button
 key={tab}
 onClick={() => setActiveView(tab)}
 className={cn(
 "pb-4 px-2 text-[10px] font-black uppercase tracking-widest transition-all relative",
 activeView === tab ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
 )}
 >
 {tab === 'invoices' ? 'Factures' : tab === 'quotes' ? 'Devis' : 'Caisse'}
 {activeView === tab && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
 </button>
 ))}
 </div>

 <div className="dash-table-container">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="dash-table-header">
 <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">N°</th>
 <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient</th>
 <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Montant</th>
 <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Statut</th>
 <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100 ">
 {isLoading ? (
 <tr><td colSpan={5} className="text-center py-20 text-slate-400 text-xs font-bold uppercase">Chargement...</td></tr>
 ) : invoices.map((inv, index) => (
 <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer">
 <td className="px-8 py-5 font-black text-xs text-blue-600">#{inv.id.slice(0, 8).toUpperCase()}</td>
 <td className="px-8 py-5 text-sm font-bold">{inv.patients?.first_name} {inv.patients?.last_name}</td>
 <td className="px-8 py-5 font-black text-sm">{Number(inv.total_amount).toLocaleString()} CFA</td>
 <td className="px-8 py-5">
 <span className={cn("px-3 py-1 rounded-xl text-[9px] font-black border uppercase tracking-widest", statusStyles[inv.status as keyof typeof statusStyles])}>
 {inv.status === 'PAID' ? 'Payée' : inv.status === 'PARTIAL' ? 'Partielle' : 'Impayée'}
 </span>
 </td>
 <td className="px-8 py-5">
 <button onClick={() => { setSelectedInvoice(inv); setIsPaymentModalOpen(true); }} className="px-4 py-1.5 bg-slate-900 text-white text-[9px] font-black uppercase rounded-xl">Payer</button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>

 <div className="space-y-8">
 <div className="bg-slate-900 text-white p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
 <div className="absolute bottom-0 right-0 p-8 opacity-10"><Wallet className="w-20 h-20" /></div>
 <h3 className="font-black text-xs uppercase tracking-widest text-blue-400 mb-8">Répartition Mobile</h3>
 <div className="space-y-6">
 {[
 { name: "Wave CI", amount: stats.waveRevenue, color: "bg-blue-400" },
 { name: "Orange Money", amount: stats.orangeRevenue, color: "bg-orange-500" },
 { name: "Espèces", amount: stats.cashRevenue, color: "bg-emerald-500" },
 ].map((method) => (
 <div key={method.name} className="space-y-2">
 <div className="flex justify-between text-xs font-bold">
 <span>{method.name}</span>
 <span>{method.amount.toLocaleString()} CFA</span>
 </div>
 <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
 <div className={cn("h-full", method.color)} style={{ width: `${(method.amount / stats.paidAmount) * 100}%` }} />
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>

 <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nouvelle Facture">
 <InvoiceForm onSuccess={() => { setIsModalOpen(false); fetchInvoices(); }} onCancel={() => setIsModalOpen(false)} />
 </Modal>

 {selectedInvoice && (
 <PaymentModal isOpen={isPaymentModalOpen} invoice={selectedInvoice} onClose={() => setIsPaymentModalOpen(false)} onSuccess={() => { setIsPaymentModalOpen(false); fetchInvoices(); }} />
 )}
 </div>
 );
}
