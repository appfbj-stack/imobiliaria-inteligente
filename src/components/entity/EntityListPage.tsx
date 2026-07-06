import { type ReactNode, useMemo, useState } from 'react';
import { Search, Download, FileSpreadsheet } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';
import { Table, type Column } from '../ui/Table';
import { EmptyState } from '../ui/EmptyState';
import { useToast } from '../ui/Toast';
import { exportToExcel, exportToPdf, type ExportColumn } from '../../lib/export';

export interface EntityFilter {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

export interface EntityKpi {
  label: string;
  value: string;
}

interface EntityListPageProps<T> {
  title: string;
  description: string;
  kpis?: EntityKpi[];
  searchPlaceholder?: string;
  searchFn?: (row: T, query: string) => boolean;
  filters?: EntityFilter[];
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  exportColumns?: ExportColumn[];
  toExportRow?: (row: T) => Record<string, string | number>;
  pageSize?: number;
  emptyMessage?: string;
  headerAction?: ReactNode;
}

/**
 * Shared list-view template for the demo-only entity screens (Corretores,
 * Proprietários, Propostas, Documentos, Financeiro, Captação, ...):
 * KPI row + search + filters + paginated table + PDF/Excel export. Keeps
 * ~10 screens from becoming bespoke, near-duplicate implementations.
 */
export function EntityListPage<T>({
  title,
  description,
  kpis = [],
  searchPlaceholder = 'Buscar...',
  searchFn,
  filters = [],
  columns,
  rows,
  rowKey,
  onRowClick,
  exportColumns,
  toExportRow,
  pageSize = 20,
  emptyMessage,
  headerAction,
}: EntityListPageProps<T>) {
  const { showToast } = useToast();
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState<'pdf' | 'xlsx' | null>(null);

  const filteredRows = useMemo(() => {
    if (!searchFn || !query.trim()) return rows;
    return rows.filter((row) => searchFn(row, query.trim().toLowerCase()));
  }, [rows, query, searchFn]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const pageItems = filteredRows.slice((page - 1) * pageSize, page * pageSize);

  const handleExport = async (kind: 'pdf' | 'xlsx') => {
    if (!exportColumns || !toExportRow) return;
    setExporting(kind);
    try {
      const exportRows = filteredRows.map(toExportRow);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-text-primary">{title}</h2>
          <p className="text-xs text-text-secondary">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          {exportColumns && toExportRow && (
            <>
              <Button variant="secondary" size="sm" onClick={() => handleExport('pdf')} disabled={exporting !== null}>
                <Download size={14} /> PDF
              </Button>
              <Button variant="secondary" size="sm" onClick={() => handleExport('xlsx')} disabled={exporting !== null}>
                <FileSpreadsheet size={14} /> Excel
              </Button>
            </>
          )}
          {headerAction}
        </div>
      </div>

      {kpis.length > 0 && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {kpis.map((kpi) => (
            <Card key={kpi.label} className="p-4">
              <p className="text-xl font-black text-text-primary">{kpi.value}</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-text-secondary">{kpi.label}</p>
            </Card>
          ))}
        </div>
      )}

      {(searchFn || filters.length > 0) && (
        <Card className="flex flex-col items-center gap-3 p-4 md:flex-row">
          {searchFn && (
            <div className="relative w-full md:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={15} />
              <Input
                placeholder={searchPlaceholder}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>
          )}
          {filters.map((filter) => (
            <Select
              key={filter.label}
              value={filter.value}
              onChange={(e) => {
                filter.onChange(e.target.value);
                setPage(1);
              }}
              className="w-auto"
            >
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          ))}
        </Card>
      )}

      {pageItems.length > 0 ? (
        <>
          <Table columns={columns} rows={pageItems} rowKey={rowKey} onRowClick={onRowClick} />
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                Anterior
              </Button>
              <span className="text-xs font-bold text-text-secondary">
                Página {page} de {totalPages} ({filteredRows.length} registros)
              </span>
              <Button variant="secondary" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                Próxima
              </Button>
            </div>
          )}
        </>
      ) : (
        <EmptyState title="Nenhum registro encontrado" description={emptyMessage ?? 'Ajuste os filtros ou a busca.'} />
      )}
    </div>
  );
}
