import { useMemo, useState } from 'react';
import { useDemoData } from '../state/DemoDataProvider';
import type { Contract, ContractType } from '../mocks/schema';
import { EntityListPage } from '../components/entity/EntityListPage';
import { Badge } from '../components/ui/Badge';
import type { Column } from '../components/ui/Table';

const STATUS_TONE: Record<Contract['status'], 'success' | 'warning' | 'danger' | 'info'> = {
  assinado: 'success',
  ativo: 'success',
  negociacao: 'warning',
  renovacao: 'info',
  encerrado: 'info',
  distrato: 'danger',
};

interface ContractsViewProps {
  title: string;
  description: string;
  tipoFilter?: ContractType;
}

export function ContractsView({ title, description, tipoFilter }: ContractsViewProps) {
  const { contracts, properties, clients, brokers } = useDemoData();
  const [status, setStatus] = useState('todos');

  const base = useMemo(() => (tipoFilter ? contracts.filter((c) => c.tipo === tipoFilter) : contracts), [contracts, tipoFilter]);
  const rows = useMemo(() => (status === 'todos' ? base : base.filter((c) => c.status === status)), [base, status]);

  const propertyById = useMemo(() => new Map(properties.map((p) => [p.id, p])), [properties]);
  const clientById = useMemo(() => new Map(clients.map((c) => [c.id, c])), [clients]);
  const brokerById = useMemo(() => new Map(brokers.map((b) => [b.id, b])), [brokers]);

  const kpis = [
    { label: 'Total', value: String(base.length) },
    { label: 'Formalizados', value: String(base.filter((c) => c.status === 'assinado' || c.status === 'ativo').length) },
    { label: 'Em negociação', value: String(base.filter((c) => c.status === 'negociacao').length) },
    { label: 'Valor total', value: `R$ ${base.reduce((s, c) => s + c.value, 0).toLocaleString('pt-BR')}` },
  ];

  const columns: Column<Contract>[] = [
    { key: 'id', header: 'Contrato', render: (c) => c.id },
    { key: 'tipo', header: 'Tipo', render: (c) => <span className="capitalize">{c.tipo}</span> },
    { key: 'imovel', header: 'Imóvel', render: (c) => propertyById.get(c.propertyId)?.code ?? '-' },
    { key: 'cliente', header: 'Cliente', render: (c) => clientById.get(c.clientId)?.name ?? '-' },
    { key: 'corretor', header: 'Corretor', render: (c) => brokerById.get(c.brokerId)?.name ?? '-' },
    { key: 'valor', header: 'Valor', render: (c) => `R$ ${c.value.toLocaleString('pt-BR')}` },
    { key: 'comissao', header: 'Comissão', render: (c) => `R$ ${c.commission.toLocaleString('pt-BR')}` },
    { key: 'vencimento', header: 'Vencimento', render: (c) => c.endDate ?? '-' },
    { key: 'status', header: 'Status', render: (c) => <Badge tone={STATUS_TONE[c.status]}>{c.status}</Badge> },
  ];

  const statusOptions = [
    { value: 'todos', label: 'Todos os status' },
    { value: 'negociacao', label: 'Negociação' },
    { value: 'assinado', label: 'Assinado' },
    { value: 'ativo', label: 'Ativo' },
    { value: 'renovacao', label: 'Renovação' },
    { value: 'encerrado', label: 'Encerrado' },
    { value: 'distrato', label: 'Distrato' },
  ];

  return (
    <EntityListPage
      title={title}
      description={description}
      kpis={kpis}
      searchPlaceholder="Buscar por código de contrato..."
      searchFn={(c, q) => c.id.toLowerCase().includes(q)}
      filters={[{ label: 'Status', value: status, onChange: setStatus, options: statusOptions }]}
      columns={columns}
      rows={rows}
      rowKey={(c) => c.id}
      exportColumns={[
        { key: 'id', header: 'Contrato' },
        { key: 'tipo', header: 'Tipo' },
        { key: 'valor', header: 'Valor' },
        { key: 'comissao', header: 'Comissão' },
        { key: 'status', header: 'Status' },
      ]}
      toExportRow={(c) => ({ id: c.id, tipo: c.tipo, valor: c.value, comissao: c.commission, status: c.status })}
    />
  );
}
