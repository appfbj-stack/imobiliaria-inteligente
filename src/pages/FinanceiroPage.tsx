import { useMemo, useState } from 'react';
import { useDemoData } from '../state/DemoDataProvider';
import type { FinanceEntry } from '../mocks/schema';
import { EntityListPage } from '../components/entity/EntityListPage';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { AreaChart } from '../components/charts/AreaChart';
import type { Column } from '../components/ui/Table';

export function FinanceiroPage() {
  const { finance } = useDemoData();
  const [type, setType] = useState('todos');

  const rows = useMemo(() => (type === 'todos' ? finance : finance.filter((f) => f.type === type)), [finance, type]);

  const totalEntradas = finance.filter((f) => f.type === 'entrada').reduce((s, f) => s + f.value, 0);
  const totalSaidas = finance.filter((f) => f.type === 'saida').reduce((s, f) => s + f.value, 0);

  const monthlyFlow = useMemo(() => {
    const buckets = new Map<string, { entrada: number; saida: number }>();
    finance.forEach((f) => {
      const key = f.date.slice(0, 7);
      const bucket = buckets.get(key) ?? { entrada: 0, saida: 0 };
      bucket[f.type] += f.value;
      buckets.set(key, bucket);
    });
    return Array.from(buckets.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .slice(-6)
      .map(([mes, v]) => ({ mes, entrada: v.entrada, saida: v.saida }));
  }, [finance]);

  const kpis = [
    { label: 'Entradas', value: `R$ ${totalEntradas.toLocaleString('pt-BR')}` },
    { label: 'Saídas', value: `R$ ${totalSaidas.toLocaleString('pt-BR')}` },
    { label: 'Saldo', value: `R$ ${(totalEntradas - totalSaidas).toLocaleString('pt-BR')}` },
    { label: 'Lançamentos', value: String(finance.length) },
  ];

  const columns: Column<FinanceEntry>[] = [
    { key: 'id', header: 'ID', render: (f) => f.id },
    { key: 'type', header: 'Tipo', render: (f) => <Badge tone={f.type === 'entrada' ? 'success' : 'danger'}>{f.type}</Badge> },
    { key: 'category', header: 'Categoria', render: (f) => f.category },
    { key: 'description', header: 'Descrição', render: (f) => f.description },
    { key: 'value', header: 'Valor', render: (f) => `R$ ${f.value.toLocaleString('pt-BR')}` },
    { key: 'date', header: 'Data', render: (f) => f.date },
  ];

  return (
    <>
      <Card className="p-5">
        <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-text-secondary">Fluxo de caixa (últimos 6 meses)</h3>
        <div className="h-64">
          <AreaChart
            data={monthlyFlow}
            xKey="mes"
            series={[
              { key: 'entrada', label: 'Entradas' },
              { key: 'saida', label: 'Saídas' },
            ]}
          />
        </div>
      </Card>

      <EntityListPage
        title="Financeiro"
        description="Entradas, saídas, comissões, recebimentos e fluxo de caixa."
        kpis={kpis}
        searchPlaceholder="Buscar por categoria ou descrição..."
        searchFn={(f, q) => f.category.toLowerCase().includes(q) || f.description.toLowerCase().includes(q)}
        filters={[
          {
            label: 'Tipo',
            value: type,
            onChange: setType,
            options: [
              { value: 'todos', label: 'Todos' },
              { value: 'entrada', label: 'Entradas' },
              { value: 'saida', label: 'Saídas' },
            ],
          },
        ]}
        columns={columns}
        rows={rows}
        rowKey={(f) => f.id}
        exportColumns={[
          { key: 'id', header: 'ID' },
          { key: 'type', header: 'Tipo' },
          { key: 'category', header: 'Categoria' },
          { key: 'value', header: 'Valor' },
          { key: 'date', header: 'Data' },
        ]}
        toExportRow={(f) => ({ id: f.id, type: f.type, category: f.category, value: f.value, date: f.date })}
      />
    </>
  );
}
