"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  Smartphone, 
  DollarSign,
  X,
  Pill,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export default function PharmacyPOS({ onComplete }: { onComplete: () => void }) {
  const [search, setSearch] = useState("");
  const [inventory, setInventory] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase.from('profiles').select('hospital_id').eq('id', user?.id).single();
    
    const { data } = await supabase
      .from("medicines")
      .select("*")
      .eq("hospital_id", profile?.hospital_id)
      .gt("stock_quantity", 0);
    
    if (data) setInventory(data);
  };

  const addToCart = (item: any) => {
    const existing = cart.find(i => i.id === item.id);
    if (existing) {
      if (existing.quantity >= item.stock_quantity) return;
      setCart(cart.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(i => i.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(cart.map(i => {
      if (i.id === id) {
        const newQty = Math.max(1, Math.min(i.quantity + delta, i.stock_quantity));
        return { ...i, quantity: newQty };
      }
      return i;
    }));
  };

  const total = cart.reduce((acc, i) => acc + (i.unit_price * i.quantity), 0);

  const handleCheckout = async (method: string) => {
    if (cart.length === 0) return;
    setIsProcessing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from('profiles').select('hospital_id').eq('id', user?.id).single();
      
      if (!profile?.hospital_id) throw new Error("Hospital ID not found");

      // Record the transaction (using invoices table for simplicity or a dedicated transactions if exists)
      const { error: invError } = await supabase.from("invoices").insert([
        {
          hospital_id: profile.hospital_id,
          patient_id: null,
          total_amount: total,
          paid_amount: total,
          status: "PAID",
          payment_method: method.toUpperCase(),
          notes: "Vente Pharmacie POS",
        },
      ]).select().single();

      if (invError) throw invError;

      // Update stock for each item
      for (const item of cart) {
        const { error: stockError } = await supabase
          .from("medicines")
          .update({ stock_quantity: item.stock_quantity - item.quantity })
          .eq("id", item.id);
        
        if (stockError) console.error("Stock update error:", stockError);
      }

      onComplete();
    } catch (error: any) {
      alert("Erreur transaction: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredItems = inventory.filter(i => 
    i.name.toLowerCase().includes(search.toLowerCase()) || 
    i.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[700px]">
      {/* Product Selection */}
      <div className="lg:col-span-2 flex flex-col h-full">
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Rechercher un médicament ou scanner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 gap-4 pb-4 custom-scrollbar">
          {filteredItems.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => addToCart(item)}
              className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[24px] text-left hover:border-blue-500 transition-all group relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
                  <Pill className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase">{item.stock_quantity} dispo</span>
              </div>
              <h4 className="font-black text-sm tracking-tight truncate">{item.name}</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 mb-3">{item.category}</p>
              <p className="font-black text-blue-600">{Number(item.unit_price).toLocaleString()} CFA</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Cart & Checkout */}
      <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h3 className="font-black text-lg tracking-tight flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-600" /> Panier
          </h3>
          <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black">{cart.length} Articles</span>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {cart.map((item) => (
            <div key={item.id} className="flex items-center gap-4 group">
              <div className="flex-1 min-w-0">
                <p className="font-black text-sm truncate">{item.name}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">{item.unit_price.toLocaleString()} CFA / unité</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => updateQuantity(item.id, -1)}
                  className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-sm font-black w-4 text-center">{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item.id, 1)}
                  className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="p-1 text-slate-300 hover:text-red-500 transition-colors ml-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {cart.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-20">
              <ShoppingCart className="w-12 h-12 opacity-20 mb-4" />
              <p className="text-xs font-bold uppercase tracking-widest">Panier Vide</p>
            </div>
          )}
        </div>

        <div className="p-8 bg-slate-50 dark:bg-slate-800/50 space-y-6">
          <div className="flex justify-between items-end">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total à payer</span>
            <div className="text-right">
              <p className="text-3xl font-black text-slate-900 dark:text-white leading-none">{total.toLocaleString()}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase mt-1">CFA Francs</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'cash', icon: DollarSign, color: 'bg-emerald-600' },
              { id: 'wave', icon: Zap, color: 'bg-blue-500' },
              { id: 'card', icon: CreditCard, color: 'bg-slate-900' },
            ].map((m) => (
              <button
                key={m.id}
                disabled={cart.length === 0 || isProcessing}
                onClick={() => handleCheckout(m.id)}
                className={cn(
                  "p-4 rounded-2xl text-white flex flex-col items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100",
                  m.color
                )}
              >
                <m.icon className="w-5 h-5" />
                <span className="text-[9px] font-black uppercase tracking-widest">{m.id}</span>
              </button>
            ))}
          </div>

          {isProcessing && (
            <div className="flex items-center justify-center gap-2 py-4">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"
              />
              <span className="text-xs font-bold text-blue-600">Traitement de la transaction...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
