"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, User, Bot, Zap, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export default function AkwabaAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Bonjour ! Je suis Akwaba AI. Comment puis-je vous aider aujourd'hui ? Je peux analyser vos statistiques, vérifier les stocks de la pharmacie ou vous aider avec les diagnostics." }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      let aiResponse = "Désolé, je n'ai pas pu traiter votre demande.";
      const query = input.toLowerCase();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from('profiles').select('hospital_id').eq('id', user.id).single();
      const hospitalId = profile?.hospital_id;
      if (!hospitalId) return;

      // Smart AI Search Logic
      if (query.includes("patient") || query.includes("malade")) {
        const { count } = await supabase.from('patients').select('*', { count: 'exact', head: true }).eq('hospital_id', hospitalId);
        aiResponse = `Il y a actuellement ${count} patients enregistrés dans votre base de données.`;
      } else if (query.includes("consultation") || query.includes("visite")) {
        const { count } = await supabase.from('consultations').select('*', { count: 'exact', head: true }).eq('hospital_id', hospitalId);
        aiResponse = `Un total de ${count} consultations ont été effectuées dans votre établissement.`;
      } else if (query.includes("stock") || query.includes("pharmacie") || query.includes("médicament")) {
        const { data } = await supabase.from('medicines').select('name, stock_quantity').eq('hospital_id', hospitalId).lt('stock_quantity', 10).limit(3);
        if (data && data.length > 0) {
          aiResponse = `Alerte Stock : ${data.map(m => `${m.name} (${m.stock_quantity})`).join(", ")} sont en stock critique.`;
        } else {
          aiResponse = "Tous les stocks critiques sont sous contrôle. Aucun médicament n'est en dessous du seuil d'alerte.";
        }
      } else if (query.includes("argent") || query.includes("revenu") || query.includes("finance") || query.includes("chiffre")) {
        const { data } = await supabase.from('invoices').select('paid_amount').eq('hospital_id', hospitalId);
        const total = data?.reduce((acc, inv) => acc + (Number(inv.paid_amount) || 0), 0) || 0;
        aiResponse = `Le revenu total encaissé est de ${total.toLocaleString()} CFA.`;
      } else if (query.includes("médecin") || query.includes("staff") || query.includes("docteur") || query.includes("équipe")) {
        const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('hospital_id', hospitalId);
        aiResponse = `Votre équipe est composée de ${count} membres du personnel enregistrés.`;
      } else {
        aiResponse = "Je suis Akwaba AI. Je peux vous donner des infos sur les patients, les consultations, le stock de la pharmacie ou vos revenus. Posez-moi une question précise !";
      }

      setMessages(prev => [...prev, { role: "assistant", content: aiResponse }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: "Une erreur est survenue lors de la connexion à la base de données." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Button - Circular with Logo */}
      <motion.button
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full shadow-2xl shadow-blue-500/40 flex items-center justify-center text-white z-50 group border-4 border-white dark:border-slate-900"
      >
        <div className="relative">
           <Zap className="w-8 h-8 fill-current text-white group-hover:scale-110 transition-transform" />
           <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
        </div>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8, x: 50 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, y: 100, scale: 0.8, x: 50 }}
            className="fixed bottom-28 right-8 w-[400px] max-w-[90vw] h-[600px] bg-white dark:bg-slate-900 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-slate-200 dark:border-slate-800 z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-8 bg-gradient-to-br from-slate-900 to-blue-950 text-white relative">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Brain className="w-20 h-20" />
              </div>
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-blue-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Akwaba Health Intelligence</span>
                  </div>
                  <h3 className="text-2xl font-black tracking-tight">IA Assistante</h3>
                  <p className="text-xs text-blue-300 font-medium mt-1">Données Temps Réel Connectées</p>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/50 dark:bg-slate-900/50 custom-scrollbar">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-4",
                    msg.role === 'user' ? "flex-row-reverse" : ""
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg",
                    msg.role === 'user' ? "bg-slate-900 text-white" : "bg-blue-600 text-white"
                  )}>
                    {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>
                  <div className={cn(
                    "p-4 rounded-3xl max-w-[80%] text-sm font-medium leading-relaxed",
                    msg.role === 'user' 
                      ? "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-tr-none shadow-sm" 
                      : "bg-blue-600 text-white shadow-xl shadow-blue-500/20 rounded-tl-none"
                  )}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex gap-4 items-center animate-pulse">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full" />
                    <div className="w-2 h-2 bg-blue-400 rounded-full" />
                    <div className="w-2 h-2 bg-blue-400 rounded-full" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
              <div className="relative">
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Posez une question à l'IA..."
                  className="w-full pl-6 pr-16 py-4 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20"
                />
                <button 
                  onClick={handleSend}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <p className="text-[10px] text-center text-slate-400 font-black uppercase tracking-widest mt-4">
                Propulsé par Akwaba Health Intelligence
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
