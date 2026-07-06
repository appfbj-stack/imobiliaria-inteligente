import { useState } from 'react';
import { useDemoData } from '../state/DemoDataProvider';
import type { CaptationLead, LeadStage } from '../mocks/schema';
import { EntityListPage } from '../components/entity/EntityListPage';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Input';
import type { Column } from '../components/ui/Table';

const STAGE_LABEL: Record<LeadStage, string> = {
  novo: 'Novo',
  contato: 'Em contato',
  visita_agendada: 'Visita agendada',
  avaliacao: 'Em avaliação',
  captado: 'Captado',
  perdido: 'Perdido',
};

const STAGE_TONE: Record<LeadStage, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
  novo: 'neutral',
  contato: 'info',
  visita_agendada: 'info',
  avaliacao: 'warning',
  captado: 'success',
  perdido: 'danger',
};

export function CaptacaoPage() {
  const { leads, upsertLead } = useDemoData();
  const [stage, setStage] = useState('todos');

  const rows = stage === 'todos' ? leads : leads.filter((l) => l.stage === stage);

  const kpis = [
    { label: 'Leads ativos', value: String(leads.filter((l) => l.stage !== 'captado' && l.stage !== 'perdido').length) },
    { label: 'Captados', value: String(leads.filter((l) => l.stage === 'captado').length) },
    { label: 'Perdidos', value: String(leads.filter((l) => l.stage === 'perdido').length) },
    {
      label: 'Valor estimado em pipeline',
      value: `R$ ${leads.reduce((s, l) => s + l.estimatedValue, 0).toLocaleString('pt-BR')}`,
    },
  ];

  const columns: Column<CaptationLead>[] = [
    { key: 'ownerName', header: 'Proprietário', render: (l) => l.ownerName },
    { key: 'propertyType', header: 'Tipo', render: (l) => <span className="capitalize">{l.propertyType}</span> },
    { key: 'local', header: 'Local', render: (l) => `${l.bairro}, ${l.cidade}` },
    { key: 'estimatedValue', header: 'Valor estimado', render: (l) => `R$ ${l.estimatedValue.toLocaleString('pt-BR')}` },
    {
      key: 'stage',
      header: 'Estágio',
      render: (l) => (
        <Select
          value={l.stage}
          onChange={(e) => upsertLead({ ...l, stage: e.target.value as LeadStage })}
          className="w-auto py-1 text-xs"
        >
          {(Object.keys(STAGE_LABEL) as LeadStage[]).map((s) => (
            <option key={s} value={s}>
              {STAGE_LABEL[s]}
            </option>
          ))}
        </Select>
      ),
    },
    { key: 'badge', header: '', render: (l) => <Badge tone={STAGE_TONE[l.stage]}>{STAGE_LABEL[l.stage]}</Badge> },
  ];

  return (
    <EntityListPage
      title="Captação"
      description="Pipeline de captação de novos imóveis e leads de proprietários."
      kpis={kpis}
      searchPlaceholder="Buscar por proprietário ou bairro..."
      searchFn={(l, q) => l.ownerName.toLowerCase().includes(q) || l.bairro.toLowerCase().includes(q)}
      filters={[
        {
          label: 'Estágio',
          value: stage,
          onChange: setStage,
          options: [{ value: 'todos', label: 'Todos os estágios' }, ...(Object.keys(STAGE_LABEL) as LeadStage[]).map((s) => ({ value: s, label: STAGE_LABEL[s] }))],
        },
      ]}
      columns={columns}
      rows={rows}
      rowKey={(l) => l.id}
      exportColumns={[
        { key: 'ownerName', header: 'Proprietário' },
        { key: 'propertyType', header: 'Tipo' },
        { key: 'estimatedValue', header: 'Valor estimado' },
        { key: 'stage', header: 'Estágio' },
      ]}
      toExportRow={(l) => ({ ownerName: l.ownerName, propertyType: l.propertyType, estimatedValue: l.estimatedValue, stage: STAGE_LABEL[l.stage] })}
    />
  );
}
