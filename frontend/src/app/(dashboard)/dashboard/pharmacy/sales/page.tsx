"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, DollarSign, Search, ShoppingCart, Smartphone, TrendingUp } from "lucide-react";
import ExportActions from "@/components/ExportActions";
import { supabase } from "@/lib/supabase";

function parseSaleNotes(notes?: string | null) {
 if (!notes) return null;
 try {
 const parsed = JSON.parse(notes);
 return parsed?.type === "PHARMACY_POS" ? parsed : null;
 } catch {
 return notes.includes("Vente Pharmacie POS") ? { type: "PHARMACY_POS", items: [] } : null;
 }
}

export default function PharmacySalesPage() {
 const [sales, setSales] = useState<any[]>([]);
 const [isLoading, setIsLoading] = useState(true);
 const [searchQuery, setSearchQuery] = useState("");

 useEffect(() => {
 fetchSales();
 }, []);

 const fetchSales = async () => {
 setIsLoading(true);
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) {
 setIsLoading(false);
 return;
 }

 const { data: profile } = await supabase
 .from("profiles")
 .select("hospital_id")
 .eq("id", user.id)
 .maybeSingle();

 if (!profile?.hospital_id) {
 setIsLoading(false);
 return;
 }

 const { data } = await supabase
 .from("invoices")
 .select("*")
 .eq("hospital_id", profile.hospital_id)
 .eq("status", "PAID")
 .order("created_at", { ascending: false });

 setSales((data || []).filter((invoice) => parseSaleNotes(invoice.notes)));
 setIsLoading(false);
 };

 const filteredSales = sales.filter((sale) => {
 const details = parseSaleNotes(sale.notes);
 const query = searchQuery.toLowerCase();
 return (
 sale.id.toLowerCase().includes(query) ||
 sale.payment_method?.toLowerCase().includes(query) ||
 details?.items?.some((item: any) => item.name?.toLowerCase().includes(query))
 );
 });

 const totalRevenue = sales.reduce((sum, sale) => sum + (Number(sale.paid_amount) || 0), 0);

 const methodIcons: Record<string, any> = {
 CASH: DollarSign,
 WAVE: Smartphone,
 ORANGE: Smartphone,
 CARD: CreditCard,
 };

 return (
 <div className="space-y-8">
 <div className="flex justify-between items-center">
 <div>
 <h1 className="text-3xl font-black text-slate-900 tracking-tight">Historique des Ventes</h1>
 <p className="text-slate-600 font-medium">Transactions pharmacie enregistrees en base via le POS.</p>
 </div>
 <div className="flex gap-3">
 <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
 <TrendingUp className="w-4 h-4" /> {totalRevenue.toLocaleString()} CFA
 </div>
 <ExportActions
 title="Historique des ventes pharmacie"
 rows={filteredSales}
 columns={[
 { header: "Transaction", accessor: (sale) => sale.id.slice(0, 8).toUpperCase() },
 { header: "Date", accessor: (sale) => new Date(sale.created_at).toLocaleDateString("fr-FR") },
 { header: "Heure", accessor: (sale) => new Date(sale.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) },
 { header: "Articles", accessor: (sale) => parseSaleNotes(sale.notes)?.items?.length || 0 },
 { header: "Paiement", accessor: (sale) => sale.payment_method || "" },
 { header: "Montant", accessor: (sale) => `${Number(sale.total_amount || 0).toLocaleString()} CFA` },
 ]}
 />
 </div>
 </div>

 <div className="relative">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
 <input
 type="text"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="Rechercher une vente, un paiement ou un produit..."
 className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/10"
 />
 </div>

 {isLoading ? (
 <div className="text-center py-20 text-slate-600 font-bold uppercase text-[10px] tracking-widest">Chargement des ventes...</div>
 ) : filteredSales.length > 0 ? (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {filteredSales.map((sale) => {
 const details = parseSaleNotes(sale.notes);
 const MethodIcon = methodIcons[sale.payment_method as string] || ShoppingCart;
 return (
 <motion.div
 key={sale.id}
 whileHover={{ scale: 1.02 }}
 className="p-6 bg-white rounded-[32px] shadow-sm relative overflow-hidden group"
 >
 <div className="flex justify-between items-start mb-6">
 <div className="text-left">
 <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Transaction</p>
 <h3 className="font-black text-lg">#{sale.id.slice(0, 8).toUpperCase()}</h3>
 </div>
 <div className="w-10 h-10 bg-white border-blue-100 shadow-sm rounded-xl flex items-center justify-center text-slate-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
 <MethodIcon className="w-5 h-5" />
 </div>
 </div>

 <div className="space-y-4">
 <div className="flex justify-between text-sm">
 <span className="text-slate-600 font-medium">Heure</span>
 <span className="font-black">{new Date(sale.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
 </div>
 <div className="flex justify-between text-sm">
 <span className="text-slate-600 font-medium">Articles</span>
 <span className="font-black">{details?.items?.length || 0} Produits</span>
 </div>
 <div className="flex justify-between text-sm">
 <span className="text-slate-600 font-medium">Paiement</span>
 <span className="font-black text-blue-600">{sale.payment_method || "Non renseigne"}</span>
 </div>
 </div>

 <div className="mt-8 pt-6 border-t border-blue-50 flex justify-between items-end">
 <div>
 <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Montant Total</p>
 <p className="text-2xl font-black text-slate-900">{Number(sale.total_amount).toLocaleString()} CFA</p>
 </div>
 <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest">
 Payee
 </div>
 </div>
 </motion.div>
 );
 })}
 </div>
 ) : (
 <div className="text-center py-20 border border-dashed border-blue-100 rounded-[32px] text-slate-600 font-bold uppercase text-[10px] tracking-widest">
 Aucune vente pharmacie enregistree
 </div>
 )}
 </div>
 );
}
