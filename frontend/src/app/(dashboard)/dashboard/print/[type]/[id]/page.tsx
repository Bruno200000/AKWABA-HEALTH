"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import PrintTemplate from "@/components/PrintTemplate";
import { Loader2 } from "lucide-react";

export default function PrintPage() {
  const { type, id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [hospital, setHospital] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const table = type === "invoice" ? "invoices" : "consultations";
        const { data: record, error } = await supabase
          .from(table)
          .select("*, patients(*), profiles(*)")
          .eq("id", id)
          .single();

        if (error || !record) throw new Error("Document introuvable");

        const { data: hData } = await supabase
          .from("hospitals")
          .select("*")
          .eq("id", record.hospital_id)
          .single();

        setData(record);
        setHospital(hData);
        setIsLoading(false);

        // Auto-trigger print after a short delay to ensure rendering
        setTimeout(() => {
          window.print();
        }, 1000);
      } catch (err) {
        console.error(err);
        router.push("/dashboard");
      }
    };

    fetchData();
  }, [type, id, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto" />
          <p className="font-bold text-slate-500 uppercase tracking-widest text-xs">Préparation de l&apos;impression...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-10 print:bg-white print:py-0">
      <div className="max-w-[800px] mx-auto mb-8 flex justify-between items-center px-4 print:hidden">
        <p className="text-sm text-slate-500 font-medium">Aperçu avant impression — {type?.toString().toUpperCase()}</p>
        <button onClick={() => window.print()} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-blue-700 transition-all">Imprimer maintenant</button>
      </div>
      
      <PrintTemplate 
        type={type === "invoice" ? "INVOICE" : "PRESCRIPTION"} 
        data={data} 
        hospital={hospital} 
      />
    </div>
  );
}
