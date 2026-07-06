import { useMemo, useState } from 'react';
import { Check, X } from 'lucide-react';
import { useDemoData } from '../state/DemoDataProvider';
import type { Proposal } from '../mocks/schema';
import { EntityListPage } from '../components/entity/EntityListPage';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import type { Column } from '../components/ui/Table';
import { useToast } from '../components/ui/Toast';

const STATUS_TONE: Record<Proposal['status'], 'success' | 'warning' | 'danger' | 'info'> = {
  pendente: 'warning',
  negociacao: 'info',
  aceita: 'success',
  recusada: 'danger',
};

export function PropostasPage() {
  const { proposals, upsertProposal, properties, clients } = useDemoData();
  const { showToast } = useToast();
  const [status, setStatus] = useState('todos');

  const propertyById = useMemo(() => new Map(properties.map((p) => [p.id, p])), [properties]);
  const clientById = useMemo(() => new Map(clients.map((c) => [c.id, c])), [clients]);

  const rows = useMemo(() => (status === 'todos' ? proposals : proposals.filter((p) => p.status === status)), [proposals, status]);

  const kpis = [
    { label: 'Total', value: String(proposals.length) },
    { label: 'Pendentes', value: String(proposals.filter((p) => p.status === 'pendente').length) },
    { label: 'Aceitas', value: String(proposals.filter((p) => p.status === 'aceita').length) },
    { label: 'Recusadas', value: String(proposals.filter((p) => p.status === 'recusada').length) },
  ];

  const decide = (proposal: Proposal, decision: 'aceita' | 'recusada') => {
    upsertProposal({ ...proposal, status: decision });
    showToast(`Proposta ${proposal.id} marcada como ${decision}.`, decision === 'aceita' ? 'success' : 'info');
  };

  const columns: Column<Proposal>[] = [
    { key: 'id', header: 'Proposta', render: (p) => p.id },
    { key: 'imovel', header: 'Imóvel', render: (p) => propertyById.get(p.propertyId)?.code ?? '-' },
    { key: 'cliente', header: 'Cliente', render: (p) => clientById.get(p.clientId)?.name ?? '-' },
    { key: 'valor', header: 'Valor', render: (p) => `R$ ${p.value.toLocaleString('pt-BR')}` },
    { key: 'data', header: 'Data', render: (p) => p.createdAt },
    { key: 'status', header: 'Status', render: (p) => <Badge tone={STATUS_TONE[p.status]}>{p.status}</Badge> },
    {
      key: 'acoes',
      header: 'Ações',
      render: (p) =>
        p.status === 'pendente' || p.status === 'negociacao' ? (
          <div className="flex gap-1.5">
            <Button size="icon" variant="secondary" onClick={() => decide(p, 'aceita')} title="Aceitar">
              <Check size={14} className="text-success" />
            </Button>
            <Button size="icon" variant="secondary" onClick={() => decide(p, 'recusada')} title="Recusar">
              <X size={14} className="text-danger" />
            </Button>
          </div>
        ) : (
          <span className="text-text-secondary">—</span>
        ),
    },
  ];

  return (
    <EntityListPage
      title="Propostas"
      description="Propostas pendentes, aceitas, recusadas e em negociação."
      kpis={kpis}
      searchPlaceholder="Buscar por código da proposta..."
      searchFn={(p, q) => p.id.toLowerCase().includes(q)}
      filters={[
        {
          label: 'Status',
          value: status,
          onChange: setStatus,
          options: [
            { value: 'todos', label: 'Todos os status' },
            { value: 'pendente', label: 'Pendente' },
            { value: 'negociacao', label: 'Negociação' },
            { value: 'aceita', label: 'Aceita' },
            { value: 'recusada', label: 'Recusada' },
          ],
        },
      ]}
      columns={columns}
      rows={rows}
      rowKey={(p) => p.id}
      exportColumns={[
        { key: 'id', header: 'Proposta' },
        { key: 'valor', header: 'Valor' },
        { key: 'status', header: 'Status' },
        { key: 'data', header: 'Data' },
      ]}
      toExportRow={(p) => ({ id: p.id, valor: p.value, status: p.status, data: p.createdAt })}
    />
  );
}
