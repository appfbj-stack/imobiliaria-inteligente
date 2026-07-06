import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import type { Property } from '../types';
import { useRealData } from '../state/RealDataContext';
import PropertyCard from '../components/property/PropertyCard';
import PropertyModal from '../components/property/PropertyModal';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonCard } from '../components/ui/Skeleton';
import { Badge } from '../components/ui/Badge';

type SortOption = 'default' | 'price_asc' | 'price_desc' | 'built_desc';

export function PropertiesPage() {
  const { properties, loadingProperties, saveProperty, deleteProperty, aiMatchedIds, aiQuery, aiResponseExplanation, clearAiSearch } =
    useRealData();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('todos');
  const [filterPrice, setFilterPrice] = useState(0);
  const [filterStatus, setFilterStatus] = useState('todos');
  const [sortBy, setSortBy] = useState<SortOption>('default');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const filteredProperties = useMemo(() => {
    let result = [...properties];
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
  }, [properties, aiMatchedIds, searchTerm, filterType, filterPrice, filterStatus, sortBy]);

  const resetFilters = () => {
    setSearchTerm('');
    setFilterType('todos');
    setFilterPrice(0);
    setFilterStatus('todos');
    setSortBy('default');
    clearAiSearch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-text-primary">Catálogo de Imóveis</h2>
          <p className="text-xs text-text-secondary">{filteredProperties.length} imóveis exibidos</p>
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
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex w-full flex-wrap items-center gap-2.5 lg:w-auto">
          <Select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="w-auto">
            <option value="todos">Todos os tipos</option>
            <option value="casa">Casa</option>
            <option value="apartamento">Apartamento</option>
            <option value="terreno">Terreno</option>
            <option value="chácara">Chácara</option>
          </Select>
          <Select value={filterPrice} onChange={(e) => setFilterPrice(Number(e.target.value))} className="w-auto">
            <option value={0}>Sem limite de preço</option>
            <option value={350000}>Até R$ 350.000</option>
            <option value={500000}>Até R$ 500.000</option>
            <option value={800000}>Até R$ 800.000</option>
            <option value={1000000}>Até R$ 1.000.000</option>
          </Select>
          <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-auto">
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
      ) : filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredProperties.map((item) => (
            <PropertyCard
              key={item.id}
              property={item}
              onEdit={(prop) => {
                setSelectedProperty(prop);
                setIsModalOpen(true);
              }}
              onDelete={deleteProperty}
            />
          ))}
        </div>
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
