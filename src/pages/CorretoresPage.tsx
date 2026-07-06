import { useMemo, useState } from 'react';
import { Star, TrendingUp } from 'lucide-react';
import { useDemoData } from '../state/DemoDataProvider';
import type { Broker } from '../mocks/schema';
import { EntityListPage } from '../components/entity/EntityListPage';
import { Drawer } from '../components/ui/Drawer';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { BarChart } from '../components/charts/BarChart';
import type { Column } from '../components/ui/Table';

export function CorretoresPage() {
  const { brokers } = useDemoData();
  const [selected, setSelected] = useState<Broker | null>(null);

  const kpis = useMemo(
    () => [
      { label: 'Total de Corretores', value: String(brokers.length) },
      { label: 'Vendas no período', value: brokers.reduce((s, b) => s + b.salesCount, 0).toLocaleString('pt-BR') },
      { label: 'Locações no período', value: brokers.reduce((s, b) => s + b.rentalsCount, 0).toLocaleString('pt-BR') },
      {
        label: 'Comissão total',
        value: `R$ ${brokers.reduce((s, b) => s + b.commissionTotal, 0).toLocaleString('pt-BR')}`,
      },
    ],
    [brokers],
  );

  const topBrokers = useMemo(() => [...brokers].sort((a, b) => b.salesCount - a.salesCount).slice(0, 8), [brokers]);

  const columns: Column<Broker>[] = [
    {
      key: 'name',
      header: 'Corretor',
      render: (b) => (
        <div className="flex items-center gap-2.5">
          <Avatar src={b.avatarUrl} name={b.name} size="sm" />
          <span className="font-semibold text-text-primary">{b.name}</span>
        </div>
      ),
    },
    { key: 'region', header: 'Região', render: (b) => b.region },
    { key: 'sales', header: 'Vendas', render: (b) => b.salesCount },
    { key: 'rentals', header: 'Locações', render: (b) => b.rentalsCount },
    { key: 'commission', header: 'Comissão', render: (b) => `R$ ${b.commissionTotal.toLocaleString('pt-BR')}` },
    {
      key: 'rating',
      header: 'Avaliação',
      render: (b) => (
        <span className="inline-flex items-center gap-1">
          <Star size={12} className="fill-warning text-warning" /> {b.rating.toFixed(1)}
        </span>
      ),
    },
    {
      key: 'goal',
      header: 'Meta',
      render: (b) => <Badge tone={b.goalProgress >= 100 ? 'success' : b.goalProgress >= 60 ? 'info' : 'warning'}>{b.goalProgress}%</Badge>,
    },
  ];

  return (
    <>
      <EntityListPage
        title="Corretores"
        description="Produção, comissões, avaliações e metas da equipe de corretores."
        kpis={kpis}
        searchPlaceholder="Buscar corretor por nome ou região..."
        searchFn={(b, q) => b.name.toLowerCase().includes(q) || b.region.toLowerCase().includes(q)}
        columns={columns}
        rows={brokers}
        rowKey={(b) => b.id}
        onRowClick={(b) => setSelected(b)}
        exportColumns={[
          { key: 'name', header: 'Nome' },
          { key: 'region', header: 'Região' },
          { key: 'sales', header: 'Vendas' },
          { key: 'rentals', header: 'Locações' },
          { key: 'commission', header: 'Comissão' },
          { key: 'rating', header: 'Avaliação' },
        ]}
        toExportRow={(b) => ({
          name: b.name,
          region: b.region,
          sales: b.salesCount,
          rentals: b.rentalsCount,
          commission: b.commissionTotal,
          rating: b.rating,
        })}
      />

      <Card className="p-5">
        <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-text-secondary">Top 8 corretores por vendas</h3>
        <div className="h-72">
          <BarChart
            data={topBrokers.map((b) => ({ nome: b.name.split(' ')[0], vendas: b.salesCount }))}
            xKey="nome"
            series={[{ key: 'vendas', label: 'Vendas' }]}
            layout="vertical"
          />
        </div>
      </Card>

      <Drawer open={!!selected} onClose={() => setSelected(null)} title={selected?.name ?? ''}>
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <Avatar src={selected.avatarUrl} name={selected.name} size="lg" />
              <div>
                <p className="font-black text-text-primary">{selected.name}</p>
                <p className="text-xs text-text-secondary">{selected.region}</p>
                <p className="text-xs text-text-secondary">{selected.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4">
                <p className="text-lg font-black text-text-primary">{selected.salesCount}</p>
                <p className="text-[10px] font-bold uppercase text-text-secondary">Vendas</p>
              </Card>
              <Card className="p-4">
                <p className="text-lg font-black text-text-primary">{selected.rentalsCount}</p>
                <p className="text-[10px] font-bold uppercase text-text-secondary">Locações</p>
              </Card>
              <Card className="p-4">
                <p className="text-lg font-black text-text-primary">R$ {selected.commissionTotal.toLocaleString('pt-BR')}</p>
                <p className="text-[10px] font-bold uppercase text-text-secondary">Comissão total</p>
              </Card>
              <Card className="p-4">
                <p className="flex items-center gap-1 text-lg font-black text-text-primary">
                  <TrendingUp size={16} className="text-success" /> {selected.goalProgress}%
                </p>
                <p className="text-[10px] font-bold uppercase text-text-secondary">Meta do período</p>
              </Card>
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
}
