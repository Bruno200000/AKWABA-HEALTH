"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Bed, Building2, CheckCircle2, DoorOpen, Plus, Search, Wallet } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import RoomForm from "./RoomForm";

export default function RoomsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rooms, setRooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("hospital_id")
        .eq("id", user.id)
        .single();

      if (!profile?.hospital_id) return;

      const { data } = await supabase
        .from("rooms")
        .select("*")
        .eq("hospital_id", profile.hospital_id)
        .order("room_number", { ascending: true });

      setRooms(data || []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const filteredRooms = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return rooms.filter((room) =>
      [room.room_number, room.department, room.type].some((value) =>
        String(value || "").toLowerCase().includes(query)
      )
    );
  }, [rooms, searchQuery]);

  const stats = useMemo(() => {
    const totalBeds = rooms.reduce((sum, room) => sum + Number(room.total_beds || 0), 0);
    const occupiedBeds = rooms.reduce((sum, room) => sum + Number(room.occupied_beds || 0), 0);
    return {
      rooms: rooms.length,
      totalBeds,
      freeBeds: Math.max(0, totalBeds - occupiedBeds),
      occupiedBeds,
    };
  }, [rooms]);

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Chambres & lits</h1>
          <p className="text-slate-600 font-medium">Configurez les chambres, services, capacites et tarifs journaliers.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200"
        >
          <Plus className="w-4 h-4" /> Nouvelle chambre
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Chambres", value: stats.rooms, icon: DoorOpen, color: "text-blue-600 bg-blue-50" },
          { label: "Lits totaux", value: stats.totalBeds, icon: Bed, color: "text-indigo-600 bg-indigo-50" },
          { label: "Lits libres", value: stats.freeBeds, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
          { label: "Lits occupes", value: stats.occupiedBeds, icon: Building2, color: "text-amber-600 bg-amber-50" },
        ].map((item) => (
          <div key={item.label} className="dash-card !p-5 flex items-center gap-4">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", item.color)}>
              <item.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{item.label}</p>
              <h3 className="text-2xl font-black">{item.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="dash-card !p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par chambre, service ou type..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-blue-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-20 text-slate-600 font-bold uppercase text-[10px] tracking-widest">
            Chargement des chambres...
          </div>
        ) : filteredRooms.length > 0 ? (
          filteredRooms.map((room, index) => {
            const occupied = Number(room.occupied_beds || 0);
            const total = Number(room.total_beds || 0);
            const rate = total > 0 ? Math.round((occupied / total) * 100) : 0;

            return (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="bg-white rounded-3xl border border-blue-100 shadow-sm p-6 space-y-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Bed className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-black text-lg text-slate-900 truncate">Chambre {room.room_number}</h3>
                      <p className="text-xs font-bold text-slate-500 truncate">{room.department || "Service non defini"}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase text-slate-600">
                    {room.type || "Standard"}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-black text-slate-600 uppercase tracking-widest">
                    <span>Occupation</span>
                    <span>{occupied}/{total} lits</span>
                  </div>
                  <div className="h-2 bg-blue-50 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full", rate >= 90 ? "bg-red-500" : rate >= 60 ? "bg-amber-500" : "bg-emerald-500")}
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Wallet className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-bold">Tarif jour</span>
                  </div>
                  <span className="font-black text-blue-600">{Number(room.price_per_day || 0).toLocaleString()} CFA</span>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-20 text-slate-600 font-bold uppercase text-[10px] tracking-widest">
            Aucune chambre trouvee
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nouvelle chambre">
        <RoomForm
          onSuccess={() => {
            setIsModalOpen(false);
            fetchRooms();
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
