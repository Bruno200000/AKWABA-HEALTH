"use client";

export type ExportColumn<T> = {
  header: string;
  accessor: keyof T | ((row: T) => string | number | null | undefined);
};

const cleanFileName = (name: string) =>
  name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "export";

const getCellValue = <T,>(row: T, column: ExportColumn<T>) => {
  const value =
    typeof column.accessor === "function"
      ? column.accessor(row)
      : row[column.accessor];

  return value === null || value === undefined ? "" : String(value);
};

const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const exportToCsv = <T,>({
  title,
  columns,
  rows,
}: {
  title: string;
  columns: ExportColumn<T>[];
  rows: T[];
}) => {
  const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const content = [
    columns.map((column) => escapeCsv(column.header)).join(","),
    ...rows.map((row) =>
      columns.map((column) => escapeCsv(getCellValue(row, column))).join(",")
    ),
  ].join("\r\n");

  downloadBlob(
    new Blob([`\uFEFF${content}`], { type: "text/csv;charset=utf-8" }),
    `${cleanFileName(title)}.csv`
  );
};

const pdfText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .slice(0, 42);

const buildPdf = <T,>(title: string, columns: ExportColumn<T>[], rows: T[]) => {
  const width = 842;
  const height = 595;
  const margin = 36;
  const rowHeight = 18;
  const colWidth = (width - margin * 2) / Math.max(columns.length, 1);
  const rowsPerPage = 24;
  const pages = Math.max(1, Math.ceil(rows.length / rowsPerPage));
  const objects: string[] = [];
  const pageObjectIndexes: number[] = [];
  const contentObjectIndexes: number[] = [];

  objects.push("<< /Type /Catalog /Pages 2 0 R >>");
  objects.push("");
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");

  for (let page = 0; page < pages; page += 1) {
    const pageRows = rows.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
    let stream = "q\n";
    stream += `BT /F2 18 Tf ${margin} ${height - 36} Td (${pdfText(title)}) Tj ET\n`;
    stream += `BT /F1 9 Tf ${width - 150} ${height - 36} Td (Page ${page + 1}/${pages}) Tj ET\n`;
    stream += `0.92 0.95 1 rg ${margin} ${height - 72} ${width - margin * 2} 22 re f\n`;
    stream += "0 0 0 rg\n";

    columns.forEach((column, index) => {
      stream += `BT /F2 8 Tf ${margin + index * colWidth + 6} ${height - 58} Td (${pdfText(column.header)}) Tj ET\n`;
    });

    pageRows.forEach((row, rowIndex) => {
      const y = height - 92 - rowIndex * rowHeight;
      stream += `0.88 0.9 0.94 RG ${margin} ${y - 5} ${width - margin * 2} 0.5 re f\n`;
      columns.forEach((column, colIndex) => {
        stream += `BT /F1 8 Tf ${margin + colIndex * colWidth + 6} ${y} Td (${pdfText(getCellValue(row, column))}) Tj ET\n`;
      });
    });

    if (pageRows.length === 0) {
      stream += `BT /F1 10 Tf ${margin} ${height - 100} Td (Aucune donnee a exporter.) Tj ET\n`;
    }

    stream += "Q\n";
    const content = `<< /Length ${stream.length} >>\nstream\n${stream}endstream`;
    contentObjectIndexes.push(objects.length + 1);
    objects.push(content);
    pageObjectIndexes.push(objects.length + 1);
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${objects.length} 0 R >>`
    );
  }

  objects[1] = `<< /Type /Pages /Kids [${pageObjectIndexes
    .map((index) => `${index} 0 R`)
    .join(" ")}] /Count ${pages} >>`;

  const offsets: number[] = [];
  let pdf = "%PDF-1.4\n";
  objects.forEach((object, index) => {
    offsets[index + 1] = pdf.length;
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return pdf;
};

export const exportToPdf = <T,>({
  title,
  columns,
  rows,
}: {
  title: string;
  columns: ExportColumn<T>[];
  rows: T[];
}) => {
  downloadBlob(
    new Blob([buildPdf(title, columns, rows)], { type: "application/pdf" }),
    `${cleanFileName(title)}.pdf`
  );
};
