export interface ExportColumn {
  key: string;
  header: string;
}

/** Dynamically imported so jspdf never inflates the main bundle. */
export async function exportToPdf(title: string, columns: ExportColumn[], rows: Record<string, string | number>[]) {
  const [{ default: JsPDF }, autoTableModule] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
  const autoTable = autoTableModule.default;

  const doc = new JsPDF();
  doc.setFontSize(14);
  doc.text(title, 14, 16);
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Kairós · gerado em ${new Date().toLocaleString('pt-BR')}`, 14, 22);

  autoTable(doc, {
    startY: 28,
    head: [columns.map((c) => c.header)],
    body: rows.map((row) => columns.map((c) => String(row[c.key] ?? ''))),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [0, 204, 255], textColor: [4, 18, 26] },
  });

  doc.save(`${title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
}

/** Dynamically imported so exceljs never inflates the main bundle. */
export async function exportToExcel(title: string, columns: ExportColumn[], rows: Record<string, string | number>[]) {
  const ExcelJS = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(title.slice(0, 31));

  sheet.columns = columns.map((c) => ({ header: c.header, key: c.key, width: 22 }));
  sheet.getRow(1).font = { bold: true };
  rows.forEach((row) => sheet.addRow(row));

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${title.toLowerCase().replace(/\s+/g, '-')}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
}
