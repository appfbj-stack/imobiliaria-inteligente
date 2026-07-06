import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Property, Client, Visit, DashboardStats, MatchmakingResult } from '../types';
import { useToast } from '../components/ui/Toast';

interface AiSearchResponse {
  matchedPropertyIds: string[];
  explanation: string | null;
}

interface RealDataContextValue {
  properties: Property[];
  clients: Client[];
  visits: Visit[];
  stats: DashboardStats | null;
  loadingProperties: boolean;
  loadingClients: boolean;
  loadingVisits: boolean;
  loadingStats: boolean;
  refreshAll: () => void;
  saveProperty: (formData: Partial<Property>) => Promise<boolean>;
  deleteProperty: (id: string) => Promise<void>;
  saveClient: (formData: Partial<Client>) => Promise<boolean>;
  deleteClient: (id: string) => Promise<void>;
  saveVisit: (formData: Partial<Visit>) => Promise<boolean>;
  deleteVisit: (id: string) => Promise<void>;
  aiSearch: (query: string) => Promise<AiSearchResponse | null>;
  fetchMatches: (clientId: string) => Promise<MatchmakingResult | null>;
  getClientName: (id: string) => string;
  getPropertySummary: (id: string) => string;
  getPropertyPrice: (id: string) => string;
  // Header quick AI property search (shared between Topbar and the Imóveis page)
  aiQuery: string;
  setAiQuery: (value: string) => void;
  aiSearching: boolean;
  aiMatchedIds: string[] | null;
  aiResponseExplanation: string | null;
  submitAiSearch: (query: string) => Promise<void>;
  clearAiSearch: () => void;
}

const RealDataContext = createContext<RealDataContextValue | null>(null);

export function RealDataProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast();

  const [properties, setProperties] = useState<Property[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const [loadingProperties, setLoadingProperties] = useState(true);
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingVisits, setLoadingVisits] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchProperties = useCallback(async () => {
    try {
      setLoadingProperties(true);
      const res = await fetch('/api/properties');
      setProperties(await res.json());
    } catch {
      showToast('Erro ao carregar os imóveis cadastrados.', 'error');
    } finally {
      setLoadingProperties(false);
    }
  }, [showToast]);

  const fetchClients = useCallback(async () => {
    try {
      setLoadingClients(true);
      const res = await fetch('/api/clients');
      setClients(await res.json());
    } catch {
      showToast('Erro ao carregar a lista de clientes.', 'error');
    } finally {
      setLoadingClients(false);
    }
  }, [showToast]);

  const fetchVisits = useCallback(async () => {
    try {
      setLoadingVisits(true);
      const res = await fetch('/api/visits');
      setVisits(await res.json());
    } catch {
      showToast('Erro ao carregar a agenda de visitas.', 'error');
    } finally {
      setLoadingVisits(false);
    }
  }, [showToast]);

  const fetchStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const res = await fetch('/api/dashboard');
      setStats(await res.json());
    } catch {
      showToast('Falha ao obter métricas da imobiliária.', 'error');
    } finally {
      setLoadingStats(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchProperties();
    fetchClients();
    fetchVisits();
    fetchStats();
  }, [fetchProperties, fetchClients, fetchVisits, fetchStats]);

  const refreshAll = useCallback(() => {
    fetchProperties();
    fetchClients();
    fetchVisits();
    fetchStats();
    showToast('Dados do servidor sincronizados!', 'info');
  }, [fetchProperties, fetchClients, fetchVisits, fetchStats, showToast]);

  const saveProperty = useCallback(
    async (formData: Partial<Property>) => {
      try {
        const method = formData.id ? 'PUT' : 'POST';
        const endpoint = formData.id ? `/api/properties/${formData.id}` : '/api/properties';
        const res = await fetch(endpoint, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error('Falha no servidor ao persistir imóvel.');
        showToast(formData.id ? 'Imóvel atualizado com sucesso!' : 'Novo imóvel cadastrado com sucesso!', 'success');
        await fetchProperties();
        await fetchStats();
        return true;
      } catch (err) {
        showToast(`Erro ao salvar imóvel: ${err instanceof Error ? err.message : ''}`, 'error');
        return false;
      }
    },
    [fetchProperties, fetchStats, showToast],
  );

  const deleteProperty = useCallback(
    async (id: string) => {
      if (!window.confirm('Deseja realmente remover este imóvel do catálogo? Visitas relacionadas a ele também serão canceladas.')) return;
      try {
        const res = await fetch(`/api/properties/${id}`, { method: 'DELETE' });
        if (res.ok) {
          showToast('Imóvel excluído do sistema.', 'info');
          await fetchProperties();
          await fetchVisits();
          await fetchStats();
        }
      } catch {
        showToast('Falha ao deletar imóvel do catálogo.', 'error');
      }
    },
    [fetchProperties, fetchVisits, fetchStats, showToast],
  );

  const saveClient = useCallback(
    async (formData: Partial<Client>) => {
      try {
        const method = formData.id ? 'PUT' : 'POST';
        const endpoint = formData.id ? `/api/clients/${formData.id}` : '/api/clients';
        const res = await fetch(endpoint, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error('Erro de processamento.');
        showToast(formData.id ? 'Cadastro de cliente atualizado!' : 'Novo cliente adicionado com sucesso!', 'success');
        await fetchClients();
        await fetchStats();
        return true;
      } catch {
        showToast('Ocorreu um erro ao salvar o cliente.', 'error');
        return false;
      }
    },
    [fetchClients, fetchStats, showToast],
  );

  const deleteClient = useCallback(
    async (id: string) => {
      if (!window.confirm('Deseja deletar este cliente permanentemente?')) return;
      try {
        const res = await fetch(`/api/clients/${id}`, { method: 'DELETE' });
        if (res.ok) {
          showToast('Cliente excluído do sistema.', 'info');
          await fetchClients();
          await fetchVisits();
          await fetchStats();
        }
      } catch {
        showToast('Erro ao excluir cliente.', 'error');
      }
    },
    [fetchClients, fetchVisits, fetchStats, showToast],
  );

  const saveVisit = useCallback(
    async (formData: Partial<Visit>) => {
      try {
        const method = formData.id ? 'PUT' : 'POST';
        const endpoint = formData.id ? `/api/visits/${formData.id}` : '/api/visits';
        const res = await fetch(endpoint, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error('Erro');
        showToast(formData.id ? 'Visita reprogramada com sucesso!' : 'Visita agendada com êxito!', 'success');
        await fetchVisits();
        await fetchStats();
        return true;
      } catch {
        showToast('Erro ao agendar visita. Verifique as informações.', 'error');
        return false;
      }
    },
    [fetchVisits, fetchStats, showToast],
  );

  const deleteVisit = useCallback(
    async (id: string) => {
      if (!window.confirm('Deseja cancelar o agendamento desta visita?')) return;
      try {
        const res = await fetch(`/api/visits/${id}`, { method: 'DELETE' });
        if (res.ok) {
          showToast('Visita cancelada com sucesso.', 'info');
          await fetchVisits();
          await fetchStats();
        }
      } catch {
        showToast('Erro ao remover visita.', 'error');
      }
    },
    [fetchVisits, fetchStats, showToast],
  );

  const aiSearch = useCallback(
    async (query: string): Promise<AiSearchResponse | null> => {
      try {
        showToast('Analisando consulta com Inteligência Artificial...', 'info');
        const res = await fetch('/api/ai-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ searchQuery: query }),
        });
        const data = await res.json();
        showToast('Busca inteligente por IA aplicada!', 'success');
        return { matchedPropertyIds: data.matchedPropertyIds || [], explanation: data.explanation || null };
      } catch {
        showToast('Erro ao comunicar com o servidor de busca inteligente.', 'error');
        return null;
      }
    },
    [showToast],
  );

  const fetchMatches = useCallback(
    async (clientId: string): Promise<MatchmakingResult | null> => {
      try {
        const res = await fetch(`/api/clients/${clientId}/matches`);
        if (!res.ok) throw new Error('Falha ao obter correspondência');
        return await res.json();
      } catch {
        showToast('Erro ao processar as correspondências do cliente.', 'error');
        return null;
      }
    },
    [showToast],
  );

  const getClientName = useCallback((id: string) => clients.find((c) => c.id === id)?.name ?? 'Cliente Desconhecido', [clients]);

  const getPropertySummary = useCallback(
    (id: string) => {
      const found = properties.find((p) => p.id === id);
      return found ? `${found.code} - ${found.type.toUpperCase()} no ${found.bairro} (${found.cidade})` : 'Imóvel Não Encontrado';
    },
    [properties],
  );

  const getPropertyPrice = useCallback(
    (id: string) => {
      const found = properties.find((p) => p.id === id);
      return found ? `R$ ${found.price.toLocaleString('pt-BR')}` : '-';
    },
    [properties],
  );

  const [aiQuery, setAiQuery] = useState('');
  const [aiSearching, setAiSearching] = useState(false);
  const [aiMatchedIds, setAiMatchedIds] = useState<string[] | null>(null);
  const [aiResponseExplanation, setAiResponseExplanation] = useState<string | null>(null);

  const submitAiSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setAiMatchedIds(null);
        setAiResponseExplanation(null);
        return;
      }
      setAiSearching(true);
      const result = await aiSearch(query);
      if (result) {
        setAiMatchedIds(result.matchedPropertyIds);
        setAiResponseExplanation(result.explanation);
      }
      setAiSearching(false);
    },
    [aiSearch],
  );

  const clearAiSearch = useCallback(() => {
    setAiQuery('');
    setAiMatchedIds(null);
    setAiResponseExplanation(null);
    showToast('Filtro de Inteligência Artificial limpo.', 'info');
  }, [showToast]);

  return (
    <RealDataContext.Provider
      value={{
        properties,
        clients,
        visits,
        stats,
        loadingProperties,
        loadingClients,
        loadingVisits,
        loadingStats,
        refreshAll,
        saveProperty,
        deleteProperty,
        saveClient,
        deleteClient,
        saveVisit,
        deleteVisit,
        aiSearch,
        fetchMatches,
        getClientName,
        getPropertySummary,
        getPropertyPrice,
        aiQuery,
        setAiQuery,
        aiSearching,
        aiMatchedIds,
        aiResponseExplanation,
        submitAiSearch,
        clearAiSearch,
      }}
    >
      {children}
    </RealDataContext.Provider>
  );
}

export function useRealData() {
  const ctx = useContext(RealDataContext);
  if (!ctx) throw new Error('useRealData must be used within RealDataProvider');
  return ctx;
}
