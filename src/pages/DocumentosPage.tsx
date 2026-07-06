import { useState } from 'react';
import { FileText, FileImage, File } from 'lucide-react';
import { useDemoData } from '../state/DemoDataProvider';
import type { DocumentItem } from '../mocks/schema';
import { EntityListPage } from '../components/entity/EntityListPage';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../components/ui/Toast';
import type { Column } from '../components/ui/Table';

const FILE_ICON = { pdf: FileText, docx: File, jpg: FileImage };

export function DocumentosPage() {
  const { documents } = useDemoData();
  const { showToast } = useToast();
  const [category, setCategory] = useState('todos');

  const rows = category === 'todos' ? documents : documents.filter((d) => d.category === category);

  const kpis = [
    { label: 'Total de documentos', value: String(documents.length) },
    { label: 'Contratos', value: String(documents.filter((d) => d.category === 'contrato').length) },
    { label: 'Imóveis', value: String(documents.filter((d) => d.category === 'imovel').length) },
    { label: 'Financeiro', value: String(documents.filter((d) => d.category === 'financeiro').length) },
  ];

  const columns: Column<DocumentItem>[] = [
    {
      key: 'title',
      header: 'Documento',
      render: (d) => {
        const Icon = FILE_ICON[d.fileType];
        return (
          <span className="flex items-center gap-2">
            <Icon size={14} className="text-primary" /> {d.title}
          </span>
        );
      },
    },
    { key: 'category', header: 'Categoria', render: (d) => <Badge tone="neutral">{d.category}</Badge> },
    { key: 'fileType', header: 'Formato', render: (d) => d.fileType.toUpperCase() },
    { key: 'size', header: 'Tamanho', render: (d) => d.size },
    { key: 'uploadedAt', header: 'Enviado em', render: (d) => d.uploadedAt },
  ];

  return (
    <EntityListPage
      title="Documentos"
      description="Documentos de imóveis, clientes e contratos centralizados."
      kpis={kpis}
      searchPlaceholder="Buscar por título..."
      searchFn={(d, q) => d.title.toLowerCase().includes(q)}
      filters={[
        {
          label: 'Categoria',
          value: category,
          onChange: setCategory,
          options: [
            { value: 'todos', label: 'Todas as categorias' },
            { value: 'contrato', label: 'Contrato' },
            { value: 'proposta', label: 'Proposta' },
            { value: 'imovel', label: 'Imóvel' },
            { value: 'cliente', label: 'Cliente' },
            { value: 'financeiro', label: 'Financeiro' },
          ],
        },
      ]}
      columns={columns}
      rows={rows}
      rowKey={(d) => d.id}
      onRowClick={(d) => showToast(`Pré-visualização de "${d.title}" indisponível (documento fictício de demonstração).`, 'info')}
    />
  );
}
