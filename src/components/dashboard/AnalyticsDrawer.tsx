import { type ReactNode, useState } from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import { Drawer } from '../ui/Drawer';
import { Button } from '../ui/Button';
import { Table, type Column } from '../ui/Table';
import { exportToExcel, exportToPdf, type ExportColumn } from '../../lib/export';
import { useToast } from '../ui/Toast';

interface AnalyticsDrawerProps<T> {
  open: boolean;
  onClose: () => void;
  title: string;
  chart?: ReactNode;
  columns: Column<T>[];
  exportColumns: ExportColumn[];
  rows: T[];
  rowKey: (row: T) => string;
  toExportRow: (row: T) => Record<string, string | number>;
}

export function AnalyticsDrawer<T>({
  open,
  onClose,
  title,
  chart,
  columns,
  exportColumns,
  rows,
  rowKey,
  toExportRow,
}: AnalyticsDrawerProps<T>) {
  const { showToast } = useToast();
  const [exporting, setExporting] = useState<'pdf' | 'xlsx' | null>(null);

  const handleExport = async (kind: 'pdf' | 'xlsx') => {
    setExporting(kind);
    try {
      const exportRows = rows.map(toExportRow);
      if (kind === 'pdf') await exportToPdf(title, exportColumns, exportRows);
      else await exportToExcel(title, exportColumns, exportRows);
      showToast(`${title} exportado em ${kind.toUpperCase()}.`, 'success');
    } catch {
      showToast('Erro ao gerar o arquivo de exportação.', 'error');
    } finally {
      setExporting(null);
    }
  };

  return (
    <Drawer open={open} onClose={onClose} title={title} widthClassName="max-w-3xl">
      <div className="space-y-6">
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={() => handleExport('pdf')} disabled={exporting !== null}>
            <Download size={14} /> {exporting === 'pdf' ? 'Gerando...' : 'Exportar PDF'}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => handleExport('xlsx')} disabled={exporting !== null}>
            <FileSpreadsheet size={14} /> {exporting === 'xlsx' ? 'Gerando...' : 'Exportar Excel'}
          </Button>
        </div>

        {chart && <div className="h-64 rounded-2xl border border-border bg-surface-hover/40 p-4">{chart}</div>}

        <Table columns={columns} rows={rows} rowKey={rowKey} />
      </div>
    </Drawer>
  );
}
