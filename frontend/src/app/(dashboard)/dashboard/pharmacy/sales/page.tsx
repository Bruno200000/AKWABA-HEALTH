"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
 ShoppingCart, 
 Search, 
 TrendingUp, 
 CreditCard, 
 Smartphone, 
 DollarSign,
 ChevronRight,
 Download,
 Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export default function PharmacySalesPage() {
 const [sales, setSales] = useState<any[]>([]);
 const [isLoading, setIsLoading] = useState(true);

 useEffect(() => {
 fetchSales();
 }, []);

 const fetchSales = async () => {
 // Simulated sales data
 setSales([
 { id: "S-1001", time: "14:20", items: 3, total: 15500, method: "Cash", status: "Terminé" },
 { id: "S-1002", time: "15:05", items: 1, total: 2500, method: "Wave", status: "Terminé" },
 { id: "S-1003", time: "15:45", items: 5, total: 42000, method: "Orange Money", status: "Terminé" },
 ]);
 setIsLoading(false);
 };

 const methodIcons = {
 Cash: DollarSign,
 Wave: Smartphone,
 "Orange Money": Smartphone,
 Card: CreditCard
 };

 return (
 <div className="space-y-8">
 <div className="flex justify-between items-center">
 <div>
 <h1 className="text-3xl font-black text-slate-900 tracking-tight">Historique des Ventes</h1>
 <p className="text-slate-500 font-medium">Suivi en temps réel des transactions de la pharmacie.</p>
 </div>
 <div className="flex gap-3">
 <button className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
 <TrendingUp className="w-4 h-4" /> Rapport Global
 </button>
 <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all shadow-sm">
 <Download className="w-4 h-4" /> CSV
 </button>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {sales.map((sale) => (
 <motion.div
 key={sale.id}
 whileHover={{ scale: 1.02 }}
 className="p-6 bg-white rounded-[32px] border border-slate-200 shadow-sm relative overflow-hidden group"
 >
 <div className="flex justify-between items-start mb-6">
 <div className="text-left">
 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction</p>
 <h3 className="font-black text-lg">{sale.id}</h3>
 </div>
 <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
 <ChevronRight className="w-5 h-5" />
 </div>
 </div>

 <div className="space-y-4">
 <div className="flex justify-between text-sm">
 <span className="text-slate-500 font-medium">Heure</span>
 <span className="font-black">{sale.time}</span>
 </div>
 <div className="flex justify-between text-sm">
 <span className="text-slate-500 font-medium">Articles</span>
 <span className="font-black">{sale.items} Produits</span>
 </div>
 <div className="flex justify-between text-sm">
 <span className="text-slate-500 font-medium">Paiement</span>
 <span className="font-black text-blue-600">{sale.method}</span>
 </div>
 </div>

 <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-end">
 <div>
 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Montant Total</p>
 <p className="text-2xl font-black text-slate-900 ">{sale.total.toLocaleString()} CFA</p>
 </div>
 <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest">
 {sale.status}
 </div>
 </div>
 </motion.div>
 ))}
 </div>
 </div>
 );
}
