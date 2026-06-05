"use client";

import { Download, FileText } from "lucide-react";
import { ExportColumn, exportToCsv, exportToPdf } from "@/lib/export-utils";

export default function ExportActions<T>({
  title,
  columns,
  rows,
}: {
  title: string;
  columns: ExportColumn<T>[];
  rows: T[];
}) {
  const disabled = rows.length === 0;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => exportToPdf({ title, columns, rows })}
        disabled={disabled}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-sm transition-all hover:bg-blue-950 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <FileText className="h-4 w-4" />
        PDF
      </button>
      <button
        type="button"
        onClick={() => exportToCsv({ title, columns, rows })}
        disabled={disabled}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-100 bg-white px-4 py-2.5 text-xs font-black uppercase tracking-widest text-slate-700 shadow-sm transition-all hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Download className="h-4 w-4" />
        CSV
      </button>
    </div>
  );
}
