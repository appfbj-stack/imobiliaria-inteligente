import { useMemo, useState } from 'react';
import { useDemoData } from '../state/DemoDataProvider';
import type { Owner } from '../mocks/schema';
import { EntityListPage } from '../components/entity/EntityListPage';
import { Drawer } from '../components/ui/Drawer';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import type { Column } from '../components/ui/Table';

export function ProprietariosPage() {
  const { owners, properties } = useDemoData();
  const [selected, setSelected] = useState<Owner | null>(null);

  const kpis = useMemo(
    () => [
      { label: 'Total de Proprietários', value: String(owners.length) },
      { label: 'Imóveis vinculados', value: owners.reduce((s, o) => s + o.propertyIds.length, 0).toLocaleString('pt-BR') },
      {
        label: 'Receita mensal total',
        value: `R$ ${owners.reduce((s, o) => s + o.monthlyRevenue, 0).toLocaleString('pt-BR')}`,
      },
    ],
    [owners],
  );

  const columns: Column<Owner>[] = [
    {
      key: 'name',
      header: 'Proprietário',
      render: (o) => (
        <div className="flex items-center gap-2.5">
          <Avatar src={o.avatarUrl} name={o.name} size="sm" />
          <span className="font-semibold text-text-primary">{o.name}</span>
        </div>
      ),
    },
    { key: 'properties', header: 'Imóveis', render: (o) => o.propertyIds.length },
    { key: 'revenue', header: 'Receita mensal', render: (o) => `R$ ${o.monthlyRevenue.toLocaleString('pt-BR')}` },
    { key: 'phone', header: 'Telefone', render: (o) => o.phone },
  ];

  const selectedProperties = selected ? properties.filter((p) => selected.propertyIds.includes(p.id)) : [];

  return (
    <>
      <EntityListPage
        title="Proprietários"
        description="Imóveis, receitas e histórico por proprietário."
        kpis={kpis}
        searchPlaceholder="Buscar proprietário por nome..."
        searchFn={(o, q) => o.name.toLowerCase().includes(q)}
        columns={columns}
        rows={owners}
        rowKey={(o) => o.id}
        onRowClick={(o) => setSelected(o)}
        exportColumns={[
          { key: 'name', header: 'Nome' },
          { key: 'properties', header: 'Imóveis' },
          { key: 'revenue', header: 'Receita mensal' },
          { key: 'phone', header: 'Telefone' },
        ]}
        toExportRow={(o) => ({ name: o.name, properties: o.propertyIds.length, revenue: o.monthlyRevenue, phone: o.phone })}
      />

      <Drawer open={!!selected} onClose={() => setSelected(null)} title={selected?.name ?? ''}>
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <Avatar src={selected.avatarUrl} name={selected.name} size="lg" />
              <div>
                <p className="font-black text-text-primary">{selected.name}</p>
                <p className="text-xs text-text-secondary">{selected.email}</p>
                <p className="text-xs text-text-secondary">{selected.phone}</p>
              </div>
            </div>
            <div>
              <h4 className="mb-3 text-xs font-black uppercase tracking-widest text-text-secondary">
                Imóveis ({selectedProperties.length})
              </h4>
              <div className="space-y-2">
                {selectedProperties.map((p) => (
                  <Card key={p.id} className="flex items-center justify-between p-3">
                    <div>
                      <p className="text-xs font-bold text-text-primary">
                        {p.code} · {p.type} · {p.bairro}, {p.cidade}
                      </p>
                      <p className="text-[10px] text-text-secondary">R$ {p.price.toLocaleString('pt-BR')}</p>
                    </div>
                    <Badge tone={p.status === 'Disponível' ? 'success' : p.status === 'Vendido' ? 'info' : 'warning'}>{p.status}</Badge>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
}
