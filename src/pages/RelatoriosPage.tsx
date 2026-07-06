import { useMemo, useState } from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import { useDemoData } from '../state/DemoDataProvider';
import { useRealData } from '../state/RealDataContext';
import { ChartCard } from '../components/ui/ChartCard';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { DonutChart } from '../components/charts/DonutChart';
import { BarChart } from '../components/charts/BarChart';
import { monthlyCounts } from '../lib/timeseries';
import { exportToExcel, exportToPdf } from '../lib/export';
import { useToast } from '../components/ui/Toast';

export function RelatoriosPage() {
  const { properties: mockProperties, contracts, brokers } = useDemoData();
  const { properties } = useRealData();
  const { showToast } = useToast();
  const [exporting, setExporting] = useState<string | null>(null);

  const allProperties = useMemo(() => [...properties, ...mockProperties], [properties, mockProperties]);

  const statusDistribution = useMemo(() => {
    const counts = { Disponível: 0, Vendido: 0, Alugado: 0 };
    allProperties.forEach((p) => {
      counts[p.status] += 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [allProperties]);

  const monthlyContracts = useMemo(() => {
    const salesSeries = monthlyCounts(contracts.filter((c) => c.tipo === 'venda').map((c) => c.createdAt));
    const rentalSeries = monthlyCounts(contracts.filter((c) => c.tipo === 'locacao').map((c) => c.createdAt));
    return salesSeries.map((s, i) => ({ mes: `M${i + 1}`, vendas: s.value, locacoes: rentalSeries[i].value }));
  }, [contracts]);

  const topBrokersRevenue = useMemo(
    () =>
      [...brokers]
        .sort((a, b) => b.commissionTotal - a.commissionTotal)
        .slice(0, 6)
        .map((b) => ({ nome: b.name.split(' ')[0], comissao: b.commissionTotal })),
    [brokers],
  );

  const reports = [
    {
      id: 'imoveis',
      title: 'Relatório de Imóveis',
      columns: [
        { key: 'code', header: 'Código' },
        { key: 'tipo', header: 'Tipo' },
        { key: 'cidade', header: 'Cidade' },
        { key: 'preco', header: 'Preço' },
        { key: 'status', header: 'Status' },
      ],
      rows: allProperties.map((p) => ({ code: p.code, tipo: p.type, cidade: p.cidade, preco: p.price, status: p.status })),
    },
    {
      id: 'contratos',
      title: 'Relatório de Contratos',
      columns: [
        { key: 'id', header: 'Contrato' },
        { key: 'tipo', header: 'Tipo' },
        { key: 'valor', header: 'Valor' },
        { key: 'comissao', header: 'Comissão' },
        { key: 'status', header: 'Status' },
      ],
      rows: contracts.map((c) => ({ id: c.id, tipo: c.tipo, valor: c.value, comissao: c.commission, status: c.status })),
    },
    {
      id: 'corretores',
      title: 'Relatório de Corretores',
      columns: [
        { key: 'name', header: 'Nome' },
        { key: 'sales', header: 'Vendas' },
        { key: 'rentals', header: 'Locações' },
        { key: 'commission', header: 'Comissão' },
      ],
      rows: brokers.map((b) => ({ name: b.name, sales: b.salesCount, rentals: b.rentalsCount, commission: b.commissionTotal })),
    },
  ];

  const handleExport = async (report: (typeof reports)[number], kind: 'pdf' | 'xlsx') => {
    setExporting(`${report.id}-${kind}`);
    try {
      if (kind === 'pdf') await exportToPdf(report.title, report.columns, report.rows);
      else await exportToExcel(report.title, report.columns, report.rows);
      showToast(`${report.title} exportado em ${kind.toUpperCase()}.`, 'success');
    } catch {
      showToast('Erro ao gerar o arquivo de exportação.', 'error');
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-black text-text-primary">Relatórios</h2>
        <p className="text-xs text-text-secondary">Relatórios exportáveis em PDF e Excel sobre todo o negócio.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Distribuição de status dos imóveis">
          <DonutChart data={statusDistribution} />
        </ChartCard>
        <ChartCard title="Vendas x Locações (últimos 6 meses)">
          <BarChart
            data={monthlyContracts}
            xKey="mes"
            series={[
              { key: 'vendas', label: 'Vendas' },
              { key: 'locacoes', label: 'Locações' },
            ]}
          />
        </ChartCard>
      </div>

      <ChartCard title="Comissão por corretor (top 6)">
        <BarChart data={topBrokersRevenue} xKey="nome" series={[{ key: 'comissao', label: 'Comissão' }]} />
      </ChartCard>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {reports.map((report) => (
          <Card key={report.id} className="flex flex-col justify-between p-5">
            <div>
              <h4 className="text-sm font-bold text-text-primary">{report.title}</h4>
              <p className="mt-1 text-[11px] text-text-secondary">{report.rows.length} registros</p>
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="secondary" size="sm" disabled={exporting !== null} onClick={() => handleExport(report, 'pdf')}>
                <Download size={13} /> PDF
              </Button>
              <Button variant="secondary" size="sm" disabled={exporting !== null} onClick={() => handleExport(report, 'xlsx')}>
                <FileSpreadsheet size={13} /> Excel
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
