import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, TrendingUp, Inbox, Users, Calendar, Sparkles, Zap } from 'lucide-react';
import { useRealData } from '../state/RealDataContext';
import { useDemoData } from '../state/DemoDataProvider';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { KpiCard } from '../components/ui/KpiCard';
import { Badge } from '../components/ui/Badge';
import { SkeletonCard } from '../components/ui/Skeleton';
import { Sparkline } from '../components/charts/Sparkline';
import { LineChart } from '../components/charts/LineChart';
import { AnalyticsDrawer } from '../components/dashboard/AnalyticsDrawer';
import { OpportunityRadar } from '../components/dashboard/OpportunityRadar';
import { monthlyCounts, percentChange } from '../lib/timeseries';
import { computeOpportunityRadar } from '../lib/insights';
import { useAionUI } from '../aion/AionUIContext';
import type { Column } from '../components/ui/Table';

interface KpiConfig {
  id: string;
  icon: React.ReactNode;
  label: string;
  value: number;
  series: { value: number }[];
  columns: Column<Record<string, string | number>>[];
  rows: Record<string, string | number>[];
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { stats, loadingStats, properties, clients } = useRealData();
  const { properties: mockProperties, clients: mockClients, visits: mockVisits, contracts, brokers } = useDemoData();
  const { visits: realVisits } = useRealData();
  const { openAion } = useAionUI();

  const [activeKpi, setActiveKpi] = useState<string | null>(null);

  const data = stats ?? { totalProperties: 0, totalSold: 0, totalRented: 0, totalClients: 0, totalVisits: 0 };

  const kpis = useMemo<KpiConfig[]>(() => {
    const salesContracts = contracts.filter((c) => c.tipo === 'venda');
    const rentalContracts = contracts.filter((c) => c.tipo === 'locacao');

    return [
      {
        id: 'imoveis',
        icon: <Home size={18} />,
        label: 'Total de Imóveis',
        value: data.totalProperties + mockProperties.length,
        series: monthlyCounts(mockProperties.map((p) => p.createdAt)),
        columns: [
          { key: 'code', header: 'Código', render: (r) => String(r.code) },
          { key: 'tipo', header: 'Tipo', render: (r) => String(r.tipo) },
          { key: 'cidade', header: 'Cidade', render: (r) => String(r.cidade) },
          { key: 'preco', header: 'Preço', render: (r) => `R$ ${Number(r.preco).toLocaleString('pt-BR')}` },
          { key: 'status', header: 'Status', render: (r) => String(r.status) },
        ],
        rows: [...mockProperties]
          .sort((a, b) => b.views - a.views)
          .slice(0, 30)
          .map((p) => ({ code: p.code, tipo: p.type, cidade: p.cidade, preco: p.price, status: p.status })),
      },
      {
        id: 'vendidos',
        icon: <TrendingUp size={18} />,
        label: 'Imóveis Vendidos',
        value: data.totalSold + salesContracts.filter((c) => c.status === 'assinado').length,
        series: monthlyCounts(salesContracts.map((c) => c.createdAt)),
        columns: [
          { key: 'id', header: 'Contrato', render: (r) => String(r.id) },
          { key: 'valor', header: 'Valor', render: (r) => `R$ ${Number(r.valor).toLocaleString('pt-BR')}` },
          { key: 'comissao', header: 'Comissão', render: (r) => `R$ ${Number(r.comissao).toLocaleString('pt-BR')}` },
          { key: 'status', header: 'Status', render: (r) => String(r.status) },
        ],
        rows: salesContracts.slice(0, 30).map((c) => ({ id: c.id, valor: c.value, comissao: c.commission, status: c.status })),
      },
      {
        id: 'alugados',
        icon: <Inbox size={18} />,
        label: 'Imóveis Alugados',
        value: data.totalRented + rentalContracts.filter((c) => c.status === 'ativo').length,
        series: monthlyCounts(rentalContracts.map((c) => c.createdAt)),
        columns: [
          { key: 'id', header: 'Contrato', render: (r) => String(r.id) },
          { key: 'valor', header: 'Aluguel', render: (r) => `R$ ${Number(r.valor).toLocaleString('pt-BR')}` },
          { key: 'fim', header: 'Vencimento', render: (r) => String(r.fim) },
          { key: 'status', header: 'Status', render: (r) => String(r.status) },
        ],
        rows: rentalContracts.slice(0, 30).map((c) => ({ id: c.id, valor: c.value, fim: c.endDate ?? '-', status: c.status })),
      },
      {
        id: 'clientes',
        icon: <Users size={18} />,
        label: 'Clientes Cadastrados',
        value: data.totalClients + mockClients.length,
        series: monthlyCounts(mockClients.map((c) => c.lastContactDate)),
        columns: [
          { key: 'name', header: 'Nome', render: (r) => String(r.name) },
          { key: 'interesse', header: 'Interesse', render: (r) => String(r.interesse) },
          { key: 'faixa', header: 'Faixa de preço', render: (r) => String(r.faixa) },
        ],
        rows: mockClients.slice(0, 30).map((c) => ({
          name: c.name,
          interesse: c.interest,
          faixa: `R$ ${c.priceRangeMin.toLocaleString('pt-BR')} - R$ ${c.priceRangeMax.toLocaleString('pt-BR')}`,
        })),
      },
      {
        id: 'visitas',
        icon: <Calendar size={18} />,
        label: 'Visitas Agendadas',
        value: data.totalVisits + mockVisits.length,
        series: monthlyCounts(mockVisits.map((v) => v.date)),
        columns: [
          { key: 'id', header: 'Visita', render: (r) => String(r.id) },
          { key: 'data', header: 'Data', render: (r) => `${r.data} ${r.hora}` },
          { key: 'status', header: 'Status', render: (r) => String(r.status) },
        ],
        rows: mockVisits.slice(0, 30).map((v) => ({ id: v.id, data: v.date, hora: v.time, status: v.status })),
      },
    ];
  }, [data, mockProperties, mockClients, mockVisits, contracts]);

  const insights = useMemo(
    () =>
      computeOpportunityRadar({
        properties,
        mockProperties,
        clients,
        mockClients,
        visits: realVisits,
        mockVisits,
        contracts,
        brokers,
      }),
    [properties, mockProperties, clients, mockClients, realVisits, mockVisits, contracts, brokers],
  );

  const activeKpiConfig = kpis.find((k) => k.id === activeKpi);

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-surface via-[#0d1730] to-surface p-8 shadow-glow-sm">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-[radial-gradient(circle_at_top_right,_var(--color-primary-glow)_0%,_transparent_60%)] opacity-20" />
        <div className="relative z-10 max-w-xl">
          <Badge tone="info">Visão Estratégica</Badge>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-text-primary">Bem-vindo à Kairós!</h2>
          <p className="mt-2 text-xs leading-relaxed text-text-secondary">
            Gerencie o portfólio completo da sua imobiliária de ponta a ponta: imóveis, clientes, corretores,
            contratos e visitas em dashboards analíticos, com o Aion como seu consultor imobiliário inteligente.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button onClick={() => document.getElementById('ai-phrase-input')?.focus()} variant="primary" size="sm">
              <Sparkles size={14} /> Experimentar busca por IA
            </Button>
            <Button onClick={() => navigate('/clientes')} variant="secondary" size="sm">
              <Zap size={14} /> Cruzar compradores
            </Button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-text-secondary">
          Estatísticas do plantão de vendas
        </h3>
        {loadingStats ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {kpis.map((kpi) => (
              <KpiCard
                key={kpi.id}
                icon={kpi.icon}
                label={kpi.label}
                value={kpi.value.toLocaleString('pt-BR')}
                deltaPct={percentChange(kpi.series)}
                sparkline={<Sparkline data={kpi.series} />}
                onClick={() => setActiveKpi(kpi.id)}
              />
            ))}
          </div>
        )}
      </div>

      <OpportunityRadar insights={insights} onOpenAion={openAion} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-8">
          <CardHeader>
            <div>
              <CardTitle>Imóveis cadastrados recentemente</CardTitle>
              <p className="mt-1 text-[11px] text-text-secondary">Exibindo os primeiros imóveis do portfólio</p>
            </div>
            <button onClick={() => navigate('/imoveis')} className="text-xs font-bold text-primary hover:text-primary-hover">
              Ver catálogo completo →
            </button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-[10px] font-black uppercase tracking-wider text-text-secondary">
                    <th className="p-3">Código</th>
                    <th className="p-3">Foto</th>
                    <th className="p-3">Tipo</th>
                    <th className="p-3">Bairro</th>
                    <th className="p-3 text-right">Preço</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {properties.slice(0, 5).map((p) => (
                    <tr key={p.id} className="transition-colors hover:bg-surface-hover/60">
                      <td className="p-3 font-mono font-black text-text-secondary">{p.code}</td>
                      <td className="p-3">
                        <img src={p.images[0]} alt="" className="h-8 w-12 rounded-md bg-surface-hover object-cover" referrerPolicy="no-referrer" />
                      </td>
                      <td className="p-3 font-semibold capitalize text-text-primary">{p.type}</td>
                      <td className="p-3 font-medium text-text-primary">
                        {p.bairro} ({p.cidade})
                      </td>
                      <td className="p-3 text-right font-bold text-text-primary">R$ {p.price.toLocaleString('pt-BR')}</td>
                      <td className="p-3 text-center">
                        <Badge tone={p.status === 'Disponível' ? 'success' : p.status === 'Vendido' ? 'info' : 'warning'}>
                          {p.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6 lg:col-span-4">
          <Card className="flex flex-1 flex-col justify-between bg-primary/10 p-6">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Zap size={18} className="text-primary" />
                <h3 className="text-sm font-extrabold uppercase tracking-wide text-text-primary">Matcher instantâneo</h3>
              </div>
              <p className="mb-5 text-xs leading-relaxed text-text-secondary">
                Faça a correspondência automática de clientes compradores com os imóveis disponíveis.
              </p>
              {clients.length > 0 ? (
                <div className="rounded-2xl border border-primary/20 bg-surface/60 p-4">
                  <div className="text-[9px] font-black uppercase tracking-wider text-text-secondary">Cliente em destaque</div>
                  <div className="mt-1.5 text-xs font-extrabold text-text-primary">{clients[0]?.name}</div>
                  <div className="mt-1 truncate text-[10px] leading-relaxed text-text-secondary">
                    Busca: {clients[0]?.propertyTypeInterest.join(', ')} até R$ {clients[0]?.priceRangeMax.toLocaleString('pt-BR')}
                  </div>
                  <Button onClick={() => navigate('/clientes')} size="sm" className="mt-4 w-full">
                    Analisar clientes
                  </Button>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-text-secondary">
                  Nenhum cliente cadastrado ainda.
                </div>
              )}
            </div>
          </Card>

          <Card className="flex flex-col items-center justify-center p-6 text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-success/10 text-success">💬</div>
            <h4 className="text-xs font-extrabold uppercase tracking-wide text-text-primary">Atalho do WhatsApp</h4>
            <p className="mt-1 max-w-xs text-[11px] leading-relaxed text-text-secondary">
              Envie fichas de imóveis, galerias de fotos ou mapas de localização com um clique nos cartões de imóveis.
            </p>
          </Card>
        </div>
      </div>

      {activeKpiConfig && (
        <AnalyticsDrawer
          open={!!activeKpi}
          onClose={() => setActiveKpi(null)}
          title={activeKpiConfig.label}
          chart={<LineChart data={activeKpiConfig.series.map((s, i) => ({ mes: `M${i + 1}`, valor: s.value }))} xKey="mes" series={[{ key: 'valor', label: activeKpiConfig.label }]} />}
          columns={activeKpiConfig.columns}
          exportColumns={activeKpiConfig.columns.map((c) => ({ key: c.key, header: c.header }))}
          rows={activeKpiConfig.rows}
          rowKey={(r) => JSON.stringify(r)}
          toExportRow={(r) => r}
        />
      )}
    </div>
  );
}
