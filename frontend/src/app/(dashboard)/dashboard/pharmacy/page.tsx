"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Pill, 
  Search, 
  Plus, 
  Box, 
  AlertTriangle, 
  ChevronRight,
  Filter,
  ArrowUpRight,
  QrCode as QrIcon,
  Download,
  ShoppingCart
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import MedicineForm from "./MedicineForm";
import PharmacyPOS from "./PharmacyPOS";
import { supabase } from "@/lib/supabase";

export default function PharmacyPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inventory, setInventory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("inventory"); // inventory, pos
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    dailySales: 0
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase.from('profiles').select('hospital_id').eq('id', user.id).single();
    if (!profile?.hospital_id) return;

    const { data } = await supabase
      .from("medicines")
      .select("*")
      .eq("hospital_id", profile.hospital_id)
      .order("name", { ascending: true });

    if (data) {
      setInventory(data);
      
      const today = new Date();
      today.setHours(0,0,0,0);
      const { data: sales } = await supabase.from('invoices').select('paid_amount').eq('hospital_id', profile.hospital_id).gte('created_at', today.toISOString());
      const dailyTotal = sales?.reduce((acc, s) => acc + (Number(s.paid_amount) || 0), 0) || 0;

      setStats({
        totalProducts: data.length,
        lowStock: data.filter(m => m.stock_quantity <= (m.min_stock_alert || 10)).length,
        dailySales: dailyTotal
      });
    }
    setIsLoading(false);
  };

  const filteredInventory = inventory.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Pharmacie & Stocks</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Gérez vos stocks et réalisez des ventes en temps réel.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2">
            <Download className="w-4 h-4" /> Rapport
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 dark:shadow-none"
          >
            <Plus className="w-4 h-4" /> Ajouter un Produit
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Total Produits</p>
          <div className="flex items-end gap-2">
            <h3 className="text-2xl font-black">{stats.totalProducts}</h3>
            <span className="text-[10px] font-bold text-slate-400 mb-1">Articles</span>
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-[32px] border border-red-100 dark:border-red-900/20">
          <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-3">Stock Faible</p>
          <div className="flex items-end gap-2">
            <h3 className="text-2xl font-black text-red-600">{stats.lowStock}</h3>
            <span className="text-[10px] font-bold text-red-400 mb-1">Produits</span>
          </div>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-[32px] border border-emerald-100 dark:border-emerald-900/20">
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-3">Ventes Jour</p>
          <div className="flex items-end gap-2">
            <h3 className="text-2xl font-black text-emerald-600">{stats.dailySales.toLocaleString()}</h3>
            <span className="text-[10px] font-bold text-emerald-400 mb-1">CFA</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-100 dark:border-slate-800">
        <button 
          onClick={() => setActiveTab("inventory")}
          className={cn(
            "pb-4 px-2 text-[10px] font-black uppercase tracking-widest transition-all relative",
            activeTab === "inventory" ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
          )}
        >
          Gestion de Stock
          {activeTab === "inventory" && <motion.div layoutId="pharmaTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
        </button>
        <button 
          onClick={() => setActiveTab("pos")}
          className={cn(
            "pb-4 px-2 text-[10px] font-black uppercase tracking-widest transition-all relative",
            activeTab === "pos" ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
          )}
        >
          Point de Vente (POS)
          {activeTab === "pos" && <motion.div layoutId="pharmaTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "inventory" ? (
          <motion.div
            key="inventory"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Search & Filters */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Rechercher un médicament..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all">
                <Filter className="w-4 h-4" />
              </button>
            </div>

            {/* Inventory Table */}
            <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Produit</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Catégorie</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Prix</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {isLoading ? (
                      <tr><td colSpan={5} className="text-center py-20 text-slate-400 font-bold uppercase text-[10px] tracking-widest">Chargement...</td></tr>
                    ) : filteredInventory.length > 0 ? filteredInventory.map((item, index) => {
                      const isLow = item.stock_quantity <= (item.min_stock_alert || 10);
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer group">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center font-black">
                                <Pill className="w-6 h-6" />
                              </div>
                              <div>
                                <p className="font-black text-sm">{item.name}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{item.id.slice(0, 8).toUpperCase()}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-500">{item.category}</span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-2">
                               <span className={cn("font-black text-sm", isLow ? "text-red-600" : "text-slate-900")}>{item.stock_quantity}</span>
                               <span className="text-[10px] font-bold text-slate-400 uppercase">Unités</span>
                               {isLow && <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                            </div>
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-1.5 font-black text-sm text-blue-600">
                                {Number(item.unit_price).toLocaleString()}
                                <span className="text-[9px] font-bold text-slate-400 uppercase">CFA</span>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <button className="p-2 text-slate-300 hover:text-blue-600 transition-colors"><QrIcon className="w-4 h-4" /></button>
                              <button className="p-2 text-slate-300 hover:text-blue-600 transition-colors"><ChevronRight className="w-5 h-5" /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr><td colSpan={5} className="text-center py-20 text-slate-400 font-bold uppercase text-[10px] tracking-widest">Aucun produit trouvé</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="pos"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <PharmacyPOS onComplete={() => { setActiveTab("inventory"); fetchInventory(); }} />
          </motion.div>
        )}
      </AnimatePresence>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Ajouter un Médicament">
        <MedicineForm onSuccess={() => { setIsModalOpen(false); fetchInventory(); }} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}
