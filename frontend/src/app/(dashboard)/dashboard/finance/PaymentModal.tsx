"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
 Smartphone, 
 CheckCircle2, 
 Loader2, 
 X,
 CreditCard,
 DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentModalProps {
 isOpen: boolean;
 onClose: () => void;
 onSuccess: () => void;
 invoice: any;
}

export default function PaymentModal({ isOpen, onClose, onSuccess, invoice }: PaymentModalProps) {
 const [method, setMethod] = useState<"WAVE" | "ORANGE" | "MTN" | "CASH">("WAVE");
 const [step, setStep] = useState<"SELECTION" | "PROCESSING" | "SUCCESS">("SELECTION");
 const [phoneNumber, setPhoneNumber] = useState("");

 const handlePayment = () => {
 if (method !== "CASH" && !phoneNumber) return;
 setStep("PROCESSING");
 setTimeout(() => {
 setStep("SUCCESS");
 }, 2500);
 };

 const methods = [
 { id: "WAVE", name: "Wave", color: "bg-[#1da1f2]", logo: "W" },
 { id: "ORANGE", name: "Orange Money", color: "bg-[#ff6600]", logo: "O" },
 { id: "MTN", name: "MTN MoMo", color: "bg-[#ffcc00]", logo: "M" },
 { id: "CASH", name: "Espèces", color: "bg-emerald-500", logo: "C" },
 ];

 if (!isOpen) return null;

 return (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-blue-600/60 backdrop-blur-sm">
 <motion.div 
 initial={{ opacity: 0, scale: 0.95, y: 20 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-white/10"
 >
 <div className="p-6 border-b border-blue-50 flex justify-between items-center">
 <h3 className="font-black text-lg uppercase tracking-tight">Paiement Facture</h3>
 <button onClick={onClose} className="p-2 hover:bg-blue-50/50 rounded-xl"><X className="w-5 h-5" /></button>
 </div>

 <div className="p-8">
 <AnimatePresence mode="wait">
 {step === "SELECTION" && (
 <motion.div 
 key="selection"
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: -20 }}
 className="space-y-6"
 >
 <div className="bg-white border-blue-100 shadow-sm /50 p-6 rounded-2xl text-center border border-blue-50 ">
 <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">Montant à régler</p>
 <h2 className="text-3xl font-black text-slate-900 ">
 {Number(invoice?.total_amount - (invoice?.paid_amount || 0)).toLocaleString()} <span className="text-sm">FCFA</span>
 </h2>
 </div>

 <div className="space-y-3">
 <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-1">Choisir le mode de paiement</p>
 <div className="grid grid-cols-2 gap-3">
 {methods.map((m) => (
 <button
 key={m.id}
 onClick={() => setMethod(m.id as any)}
 className={cn(
 "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
 method === m.id 
 ? "border-blue-600 bg-blue-50 " 
 : "border-blue-50 hover:border-blue-200"
 )}
 >
 <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg", m.color)}>
 {m.logo}
 </div>
 <span className="text-xs font-bold">{m.name}</span>
 </button>
 ))}
 </div>
 </div>

 {method !== "CASH" && (
 <div className="space-y-2">
 <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-1">Numéro de téléphone</label>
 <div className="relative">
 <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
 <input 
 type="tel" 
 value={phoneNumber}
 onChange={(e) => setPhoneNumber(e.target.value)}
 placeholder="07 00 00 00 00"
 className="w-full pl-12 pr-4 py-4 bg-white border-blue-100 shadow-sm  rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none font-bold"
 />
 </div>
 </div>
 )}

 <button 
 onClick={handlePayment}
 className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all"
 >
 Confirmer le Paiement
 </button>
 </motion.div>
 )}

 {step === "PROCESSING" && (
 <motion.div 
 key="processing"
 initial={{ opacity: 0, scale: 0.9 }}
 animate={{ opacity: 1, scale: 1 }}
 className="text-center py-12 space-y-6"
 >
 <div className="relative w-20 h-20 mx-auto">
 <Loader2 className="w-20 h-20 text-blue-600 animate-spin" />
 <div className="absolute inset-0 flex items-center justify-center">
 <Smartphone className="w-8 h-8 text-blue-600" />
 </div>
 </div>
 <div>
 <h3 className="text-xl font-black mb-2">Demande envoyée</h3>
 <p className="text-slate-600 text-sm">Veuillez valider la transaction sur votre téléphone en saisissant votre code secret.</p>
 </div>
 </motion.div>
 )}

 {step === "SUCCESS" && (
 <motion.div 
 key="success"
 initial={{ opacity: 0, scale: 0.9 }}
 animate={{ opacity: 1, scale: 1 }}
 className="text-center py-8 space-y-6"
 >
 <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-100">
 <CheckCircle2 className="w-12 h-12" />
 </div>
 <div>
 <h3 className="text-2xl font-black text-slate-900 ">Paiement Réussi !</h3>
 <p className="text-slate-600 text-sm mt-2">La facture #{invoice.id.slice(0,8)} a été mise à jour. Un reçu a été généré.</p>
 </div>
 <div className="pt-4 flex gap-3">
 <button onClick={onSuccess} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold">Fermer</button>
 <button 
 onClick={() => window.open(`/dashboard/print/invoice/${invoice.id}`, '_blank')}
 className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2"
 >
 <Receipt className="w-4 h-4" /> Reçu PDF
 </button>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 </motion.div>
 </div>
 );
}

function Receipt({ className }: { className?: string }) {
 return (
 <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
 <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z" />
 <path d="M16 8h-6" />
 <path d="M16 12H8" />
 <path d="M13 16H8" />
 </svg>
 );
}
