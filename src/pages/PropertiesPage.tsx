import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import type { Property } from '../types';
import { useRealData } from '../state/RealDataContext';
import { useDemoData } from '../state/DemoDataProvider';
import PropertyCard from '../components/property/PropertyCard';
import PropertyModal from '../components/property/PropertyModal';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonCard } from '../components/ui/Skeleton';
import { Badge } from '../components/ui/Badge';

type SortOption = 'default' | 'price_asc' | 'price_desc' | 'built_desc';
const PAGE_SIZE = 24;

function isMockId(id: string) {
  return id.startsWith('MKT-IMV-');
}

export function PropertiesPage() {
  const { properties, loadingProperties, saveProperty, deleteProperty, aiMatchedIds, aiQuery, aiResponseExplanation, clearAiSearch } =
    useRealData();
  const { properties: mockProperties, upsertMockProperty, deleteMockProperty } = useDemoData();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('todos');
  const [filterPrice, setFilterPrice] = useState(0);
  const [filterStatus, setFilterStatus] = useState('todos');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [page, setPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const allProperties = useMemo(() => [...properties, ...mockProperties], [properties, mockProperties]);

  const filteredProperties = useMemo(() => {
    let result = [...allProperties];
    if (aiMatchedIds !== null) result = result.filter((p) => aiMatchedIds.includes(p.id));

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.code.toLowerCase().includes(q) ||
          p.bairro.toLowerCase().includes(q) ||
          p.cidade.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q) ||
          p.type.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      );
    }
    if (filterType !== 'todos') result = result.filter((p) => p.type === filterType);
    if (filterPrice > 0) result = result.filter((p) => p.price <= filterPrice);
    if (filterStatus !== 'todos') result = result.filter((p) => p.status === filterStatus);

    if (sortBy === 'price_asc') result.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price_desc') result.sort((a, b) => b.price - a.price);
    else if (sortBy === 'built_desc') result.sort((a, b) => b.builtArea - a.builtArea);

    return result;
  }, [allProperties, aiMatchedIds, searchTerm, filterType, filterPrice, filterStatus, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredProperties.length / PAGE_SIZE));
  const pageItems = filteredProperties.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetFilters = () => {
    setSearchTerm('');
    setFilterType('todos');
    setFilterPrice(0);
    setFilterStatus('todos');
    setSortBy('default');
    setPage(1);
    clearAiSearch();
  };

  const handleDelete = (id: string) => (isMockId(id) ? deleteMockProperty(id) : deleteProperty(id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-text-primary">Catálogo de Imóveis</h2>
          <p className="text-xs text-text-secondary">
            {filteredProperties.length} imóveis exibidos ({properties.length} reais + {mockProperties.length} de demonstração)
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedProperty(null);
            setIsModalOpen(true);
          }}
        >
          + Imóvel
        </Button>
      </div>

      {aiResponseExplanation && (
        <Card className="flex items-start gap-3.5 border-primary/30 bg-primary/5 p-4.5">
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-primary">Assistente Inteligente Aion</h4>
              <button onClick={clearAiSearch} className="text-xs font-bold text-primary hover:text-primary-hover">
                Remover filtro
              </button>
            </div>
            <p className="mt-1.5 text-xs italic leading-relaxed text-text-primary">"{aiResponseExplanation}"</p>
            <p className="mt-2 text-[10px] font-bold text-text-secondary">
              Query: "{aiQuery}" · {filteredProperties.length} imóveis filtrados
            </p>
          </div>
        </Card>
      )}

      <Card className="flex flex-col items-center justify-between gap-4 p-5 lg:flex-row">
        <div className="relative w-full shrink-0 lg:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
          <Input
            placeholder="Filtrar por código, bairro ou cidade..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <div className="flex w-full flex-wrap items-center gap-2.5 lg:w-auto">
          <Select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setPage(1);
            }}
            className="w-auto"
          >
            <option value="todos">Todos os tipos</option>
            <option value="casa">Casa</option>
            <option value="apartamento">Apartamento</option>
            <option value="terreno">Terreno</option>
            <option value="chácara">Chácara</option>
          </Select>
          <Select
            value={filterPrice}
            onChange={(e) => {
              setFilterPrice(Number(e.target.value));
              setPage(1);
            }}
            className="w-auto"
          >
            <option value={0}>Sem limite de preço</option>
            <option value={350000}>Até R$ 350.000</option>
            <option value={500000}>Até R$ 500.000</option>
            <option value={800000}>Até R$ 800.000</option>
            <option value={1000000}>Até R$ 1.000.000</option>
            <option value={2000000}>Até R$ 2.000.000</option>
          </Select>
          <Select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(1);
            }}
            className="w-auto"
          >
            <option value="todos">Todos os status</option>
            <option value="Disponível">Disponível</option>
            <option value="Vendido">Vendido</option>
            <option value="Alugado">Alugado</option>
          </Select>
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)} className="w-auto">
            <option value="default">Ordenar: padrão</option>
            <option value="price_asc">Preço: menor para maior</option>
            <option value="price_desc">Preço: maior para menor</option>
            <option value="built_desc">Maior área construída</option>
          </Select>
        </div>
      </Card>

      {loadingProperties ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : pageItems.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {pageItems.map((item) => (
              <PropertyCard
                key={item.id}
                property={item}
                demo={isMockId(item.id)}
                onEdit={(prop) => {
                  setSelectedProperty(prop);
                  setIsModalOpen(true);
                }}
                onDelete={handleDelete}
              />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                Anterior
              </Button>
              <span className="text-xs font-bold text-text-secondary">
                Página {page} de {totalPages}
              </span>
              <Button variant="secondary" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                Próxima
              </Button>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon={<Badge tone="neutral">🏠</Badge>}
          title="Nenhum imóvel encontrado"
          description="Nenhum imóvel disponível atende aos critérios de filtro. Reduza os filtros ou limpe a busca."
          action={{ label: 'Limpar filtros e busca por IA', onClick: resetFilters }}
        />
      )}

      <PropertyModal
        property={selectedProperty}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProperty(null);
        }}
        onSave={async (formData) => {
          if (formData.id && isMockId(formData.id)) {
            const original = mockProperties.find((p) => p.id === formData.id);
            if (original) upsertMockProperty({ ...original, ...formData });
            setIsModalOpen(false);
            setSelectedProperty(null);
            return;
          }
          const ok = await saveProperty(formData);
          if (ok) {
            setIsModalOpen(false);
            setSelectedProperty(null);
          }
        }}
      />
    </div>
  );
}
