import React, { useState, useEffect } from 'react';
import { Property, Client, Visit, DashboardStats, MatchmakingResult } from './types';
import PropertyCard from './components/PropertyCard';
import PropertyModal from './components/PropertyModal';
import ClientModal from './components/ClientModal';
import VisitModal from './components/VisitModal';
import StatsDashboard from './components/StatsDashboard';
import { 
  Home, Users, Calendar, Sparkles, Plus, Search, 
  Trash2, Edit, ChevronRight, Check, Send, 
  MapPin, SlidersHorizontal, ArrowUpDown, RefreshCw, X, Eye, HeartHandshake, EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // General State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'properties' | 'clients' | 'visits' | 'matchmaker'>('dashboard');
  const [properties, setProperties] = useState<Property[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // Loading indicator states
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingVisits, setLoadingVisits] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);

  // Search, filtration and sorting states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('todos');
  const [filterPrice, setFilterPrice] = useState<number>(0); // 0 means no limit
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'built_desc' | 'default'>('default');

  // Intelligent AI Search States
  const [aiQuery, setAiQuery] = useState('');
  const [aiSearching, setAiSearching] = useState(false);
  const [aiMatchedIds, setAiMatchedIds] = useState<string[] | null>(null);
  const [aiResponseExplanation, setAiResponseExplanation] = useState<string | null>(null);

  // Dynamic matchmaking state
  const [selectedMatchmakingClient, setSelectedMatchmakingClient] = useState<Client | null>(null);
  const [matchmakingResult, setMatchmakingResult] = useState<MatchmakingResult | null>(null);
  const [matchmakingLoading, setMatchmakingLoading] = useState(false);

  // Modals visibility states
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null); // For editing

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null); // For editing

  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null); // For editing

  const [notification, setNotification] = useState<{message: string; type: 'success' | 'error' | 'info'} | null>(null);

  // Automatic Notification Auto-dimmer
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Initial Sync Data Load
  useEffect(() => {
    fetchProperties();
    fetchClients();
    fetchVisits();
    fetchStats();
  }, []);

  // Fetch Services
  const fetchProperties = async () => {
    try {
      setLoadingProperties(true);
      const res = await fetch('/api/properties');
      const data = await res.json();
      setProperties(data);
    } catch (err) {
      showNotice("Erro ao carregar os imóveis cadastrados.", 'error');
    } finally {
      setLoadingProperties(false);
    }
  };

  const fetchClients = async () => {
    try {
      setLoadingClients(true);
      const res = await fetch('/api/clients');
      const data = await res.json();
      setClients(data);
    } catch (err) {
      showNotice("Erro ao carregar a lista de clientes.", 'error');
    } finally {
      setLoadingClients(false);
    }
  };

  const fetchVisits = async () => {
    try {
      setLoadingVisits(true);
      const res = await fetch('/api/visits');
      const data = await res.json();
      setVisits(data);
    } catch (err) {
      showNotice("Erro ao carregar a agenda de visitas.", 'error');
    } finally {
      setLoadingVisits(false);
    }
  };

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const res = await fetch('/api/dashboard');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      showNotice("Falha ao obter métricas da imobiliária.", 'error');
    } finally {
      setLoadingStats(false);
    }
  };

  // Notification helper
  const showNotice = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
  };

  // Create or Update Property Controller
  const handleSaveProperty = async (formData: Partial<Property>) => {
    try {
      const method = formData.id ? 'PUT' : 'POST';
      const endpoint = formData.id ? `/api/properties/${formData.id}` : '/api/properties';
      
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error("Falha no servidor ao persistir imovel.");

      showNotice(formData.id ? "Imóvel atualizado com sucesso!" : "Novo imóvel cadastrado com sucesso!", 'success');
      setIsPropertyModalOpen(false);
      setSelectedProperty(null);
      fetchProperties();
      fetchStats();
    } catch (err: any) {
      showNotice(`Erro ao salvar imóvel: ${err.message}`, 'error');
    }
  };

  const handleDeleteProperty = async (id: string) => {
    if (!window.confirm("Deseja realmente remover este imóvel do catálogo? Visitas relacionadas a ele também serão canceladas.")) return;
    try {
      const res = await fetch(`/api/properties/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showNotice("Imóvel excluído do sistema.", 'info');
        fetchProperties();
        fetchVisits();
        fetchStats();
      }
    } catch (err) {
      showNotice("Falha ao deletar imóvel do catálogo.", 'error');
    }
  };

  // Create or Update Client Controller
  const handleSaveClient = async (formData: Partial<Client>) => {
    try {
      const method = formData.id ? 'PUT' : 'POST';
      const endpoint = formData.id ? `/api/clients/${formData.id}` : '/api/clients';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error("Erro de processamento.");

      showNotice(formData.id ? "Cadastro de cliente atualizado!" : "Novo cliente adicionado com sucesso!", 'success');
      setIsClientModalOpen(false);
      setSelectedClient(null);
      fetchClients();
      fetchStats();
    } catch (err) {
      showNotice("Ocorreu um erro ao salvar o cliente.", 'error');
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (!window.confirm("Deseja deletar este cliente permanentemente?")) return;
    try {
      const res = await fetch(`/api/clients/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showNotice("Cliente excluído do sistema.", 'info');
        // If current matchmaking client is this one, clear it
        if (selectedMatchmakingClient?.id === id) {
          setSelectedMatchmakingClient(null);
          setMatchmakingResult(null);
        }
        fetchClients();
        fetchVisits();
        fetchStats();
      }
    } catch (err) {
      showNotice("Erro ao excluir cliente.", 'error');
    }
  };

  // Create or Update Tour Schedule Controller
  const handleSaveVisit = async (formData: Partial<Visit>) => {
    try {
      const method = formData.id ? 'PUT' : 'POST';
      const endpoint = formData.id ? `/api/visits/${formData.id}` : '/api/visits';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error("Erro");

      showNotice(formData.id ? "Visita reprogramada com sucesso!" : "Visita agendada com êxito!", 'success');
      setIsVisitModalOpen(false);
      setSelectedVisit(null);
      fetchVisits();
      fetchStats();
    } catch (err) {
      showNotice("Erro ao agendar visita. Verifique as informações.", 'error');
    }
  };

  const handleDeleteVisit = async (id: string) => {
    if (!window.confirm("Deseja cancelar o agendamento desta visita?")) return;
    try {
      const res = await fetch(`/api/visits/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showNotice("Visita cancelada com sucesso.", 'info');
        fetchVisits();
        fetchStats();
      }
    } catch (err) {
      showNotice("Erro ao remover visita.", 'error');
    }
  };

  // Intelligent Natural Language Search handler
  const handleAISearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) {
      clearAISearch();
      return;
    }

    try {
      setAiSearching(true);
      showNotice("Analisando consulta com Inteligência Artificial...", 'info');
      
      const res = await fetch('/api/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchQuery: aiQuery })
      });

      const data = await res.json();
      setAiMatchedIds(data.matchedPropertyIds || []);
      setAiResponseExplanation(data.explanation || null);
      
      // Ensure the broker is on the properties tab when results arrive
      setActiveTab('properties');
      showNotice("Busca inteligente por IA aplicada!", 'success');
    } catch (err) {
      showNotice("Erro ao comunicar com o servidor de busca inteligente.", 'error');
    } finally {
      setAiSearching(false);
    }
  };

  const clearAISearch = () => {
    setAiQuery('');
    setAiMatchedIds(null);
    setAiResponseExplanation(null);
    showNotice("Filtro de Inteligência Artificial limpo.", 'info');
  };

  // Matchmaking engine selection click
  const triggerMatchmaking = async (client: Client) => {
    try {
      setSelectedMatchmakingClient(client);
      setMatchmakingLoading(true);
      setActiveTab('matchmaker');

      const res = await fetch(`/api/clients/${client.id}/matches`);
      if (!res.ok) throw new Error("Falha ao obter correspondência");
      const data = await res.json();
      setMatchmakingResult(data);
      showNotice(`Matchmaking inteligente concluído para ${client.name}`, 'success');
    } catch (err) {
      showNotice("Erro ao processar as correspondências do cliente.", 'error');
    } finally {
      setMatchmakingLoading(false);
    }
  };

  // Filter & Search standard algorithm computation
  const getFilteredProperties = () => {
    let result = [...properties];

    // If AI Matcher mode is currently running and active, narrow strictly to matched IDs
    if (aiMatchedIds !== null) {
      result = result.filter(p => aiMatchedIds.includes(p.id));
    }

    // Traditional Text search fallback (addresses, code, type, descriptions, bairro, cidade)
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.code.toLowerCase().includes(q) ||
        p.bairro.toLowerCase().includes(q) ||
        p.cidade.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }

    // Type filtration
    if (filterType !== 'todos') {
      result = result.filter(p => p.type === filterType);
    }

    // Price limit filtration
    if (filterPrice > 0) {
      result = result.filter(p => p.price <= filterPrice);
    }

    // Status filtration
    if (filterStatus !== 'todos') {
      result = result.filter(p => p.status === filterStatus);
    }

    // Sorting execution
    if (sortBy === 'price_asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'built_desc') {
      result.sort((a, b) => b.builtArea - a.builtArea);
    }

    return result;
  };

  const getFilteredClients = () => {
    return clients;
  };

  // Helpers to resolve references
  const getClientName = (id: string) => {
    const found = clients.find(c => c.id === id);
    return found ? found.name : 'Cliente Desconhecido';
  };

  const getPropertySummary = (id: string) => {
    const found = properties.find(p => p.id === id);
    return found ? `${found.code} - ${found.type.toUpperCase()} no ${found.bairro} (${found.cidade})` : 'Imóvel Não Encontrado';
  };

  const getPropertyPrice = (id: string) => {
    const found = properties.find(p => p.id === id);
    return found ? `R$ ${found.price.toLocaleString('pt-BR')}` : '-';
  };

  const getPropertyMockPhoto = (id: string) => {
    const found = properties.find(p => p.id === id);
    return found && found.images[0] ? found.images[0] : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80';
  };

  const filteredPropertiesList = getFilteredProperties();

  return (
    <div className="flex h-screen w-screen bg-slate-50 overflow-hidden font-sans text-slate-800">
      
      {/* Dynamic Popups & Toast notice */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg border text-xs font-bold flex items-center gap-2 ${
              notification.type === 'success' ? 'bg-emerald-600 border-emerald-500 text-white' :
              notification.type === 'error' ? 'bg-rose-600 border-rose-500 text-white' :
              'bg-slate-900 border-slate-800 text-white'
            }`}
          >
            {notification.type === 'success' && <span className="text-sm">✓</span>}
            {notification.message}
            <button onClick={() => setNotification(null)} className="ml-2 hover:opacity-85 text-[10px] uppercase font-mono px-1 border border-white/30 rounded-sm">X</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern Split View - Left Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 justify-between">
        
        {/* Logo and Nav Menu */}
        <div>
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div id="company-logo" className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center font-black text-white text-base tracking-sm shadow-md shadow-blue-500/10">
                IM
              </div>
              <div>
                <h1 className="text-white font-extrabold text-sm tracking-tight leading-none mb-1">ImobiInteligente</h1>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black leading-none pb-0.5">Gestor de Parcerias</span>
              </div>
            </div>
          </div>

          <nav className="py-6 flex flex-col gap-1.5 px-3">
            <div className="px-4 py-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Menu Principal</div>
            
            <button 
              id="nav-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition duration-200 text-left ${
                activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10' : 'hover:bg-slate-800/60 hover:text-white text-slate-400'
              }`}
            >
              <span className="w-4 text-center text-sm shrink-0">📊</span>
              Painel Geral de Negócios
            </button>

            <button 
              id="nav-properties"
              onClick={() => setActiveTab('properties')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition duration-200 text-left ${
                activeTab === 'properties' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10' : 'hover:bg-slate-800/60 hover:text-white text-slate-400'
              }`}
            >
              <span className="w-4 text-center text-sm shrink-0">🏠</span>
              Catálogo de Imóveis
            </button>

            <button 
              id="nav-clients"
              onClick={() => setActiveTab('clients')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition duration-200 text-left ${
                activeTab === 'clients' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10' : 'hover:bg-slate-800/60 hover:text-white text-slate-400'
              }`}
            >
              <span className="w-4 text-center text-sm shrink-0">👥</span>
              Carteira de Clientes
            </button>

            <button 
              id="nav-visits"
              onClick={() => setActiveTab('visits')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition duration-200 text-left ${
                activeTab === 'visits' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10' : 'hover:bg-slate-800/60 hover:text-white text-slate-400'
              }`}
            >
              <span className="w-4 text-center text-sm shrink-0">📅</span>
              Agenda de Visitas
            </button>

            <div className="px-4 py-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest mt-4 mb-1.5 font-bold">Matching Inteligente</div>
            
            <button 
              id="nav-matchmaker"
              onClick={() => setActiveTab('matchmaker')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition duration-200 text-left ${
                activeTab === 'matchmaker' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10' : 'hover:bg-slate-800/60 hover:text-white text-slate-400'
              }`}
            >
              <span className="w-4 text-center text-sm shrink-0">⚡</span>
              Cruzamento Imóvel x Cliente
            </button>
          </nav>
        </div>

        {/* User Card */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center font-bold text-slate-200 text-xs shrink-0 border border-slate-600">
              RC
            </div>
            <div className="overflow-hidden">
              <p className="text-[11px] font-bold text-white truncate leading-tight">Ricardo Corretor</p>
              <p className="text-[9px] text-slate-500 truncate leading-none">Administrador Imobi</p>
            </div>
          </div>
          <button 
            id="refresh-all-data-btn"
            onClick={() => {
              fetchProperties();
              fetchClients();
              fetchVisits();
              fetchStats();
              showNotice("Dados do servidor sincronizados!", 'info');
            }}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition"
            title="Sincronizar dados das nuvens"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-50">
        
        {/* Top Header Section */}
        <header className="h-20 bg-white border-b border-slate-100 px-8 flex items-center justify-between shrink-0">
          
          {/* Intelligent AI Natural Language Query Search Bar */}
          <form onSubmit={handleAISearchSubmit} className="relative w-md">
            <div className="relative group/search">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                {aiSearching ? <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /> : <Sparkles className="w-4 h-4 text-indigo-500" />}
              </span>
              <input 
                id="ai-phrase-input"
                type="text" 
                placeholder="Busca por IA: 'Mande casas no Centro até 450 mil com 3 quartos'"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                className="w-full pl-10 pr-24 py-2.5 bg-slate-50 focus:bg-white text-xs border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl focus:outline-hidden focus:ring-4 focus:ring-indigo-100 transition-all font-semibold"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {aiMatchedIds !== null && (
                  <button 
                    type="button" 
                    id="clear-ai-filter-btn"
                    onClick={clearAISearch}
                    className="p-1 hover:bg-slate-200 rounded-md text-slate-400 hover:text-slate-700 transition"
                    title="Limpar filtro de IA"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
                <button
                  type="submit"
                  id="submit-ai-search-btn"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10px] px-3 py-1.5 rounded-lg tracking-wider uppercase transition shadow-xs"
                >
                  Pesquisar
                </button>
              </div>
            </div>
          </form>

          {/* User action cluster depending on tab */}
          <div className="flex items-center gap-3">
            <button 
              id="header-shortcut-client"
              onClick={() => {
                setSelectedClient(null);
                setIsClientModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition duration-150"
            >
              <Users className="w-3.5 h-3.5" />
              + Novo Cliente
            </button>
            <button 
              id="header-shortcut-visit"
              onClick={() => {
                setSelectedVisit(null);
                setIsVisitModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition duration-150"
            >
              <Calendar className="w-3.5 h-3.5" />
              + Agendar Visita
            </button>
            <button 
              id="header-create-property-btn"
              onClick={() => {
                setSelectedProperty(null);
                setIsPropertyModalOpen(true);
              }}
              className="flex items-center gap-2 px-4.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold transition duration-150 shadow-md shadow-blue-500/10"
            >
              <span>+</span> Cadastrar Imóvel
            </button>
          </div>
        </header>

        {/* Content View Routing Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          
          {/* AI Response Explanation Header Panel if AI Search is active */}
          {aiResponseExplanation && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }}
              id="ai-filter-response-box"
              className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4.5 flex gap-3.5 items-start"
            >
              <div className="p-2.5 bg-indigo-500 rounded-xl text-white shrink-0 shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider">Assistente Inteligente da Imobiliária</h4>
                  <button 
                    id="exit-ai-expl-btn"
                    onClick={clearAISearch}
                    className="text-xs font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1"
                  >
                    Remover Filtro da IA <X className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-xs text-slate-700 mt-1.5 font-medium leading-relaxed italic">
                  "{aiResponseExplanation}"
                </p>
                <div className="flex gap-2.5 items-center mt-3 text-[10px] text-indigo-600 font-bold">
                  <span>Query submetida: "{aiQuery}"</span>
                  <span className="w-1.5 h-1.5 bg-indigo-300 rounded-full" />
                  <span>{filteredPropertiesList.length} imóveis filtrados com sucesso.</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 1: DASHBOARD METRICS */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Introduction Card */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 relative overflow-hidden shadow-xl">
                <div className="max-w-xl relative z-10">
                  <span className="bg-blue-600 text-white text-[10px] uppercase font-bold px-2.5 py-1 rounded-md tracking-wider">Visão Estratégica</span>
                  <h2 className="text-2xl font-black mt-3 text-slate-50 tracking-tight leading-tight">Bem-vindo ao ImobiInteligente!</h2>
                  <p className="text-slate-300 text-xs mt-2 leading-relaxed">
                    Aqui você gerencia o portfólio completo de sua imobiliária de ponta a ponta. Cadastre propriedades, liste clientes com preferências dinâmicas, agende compromissos, cruze dados para obter matchmaking instantâneo e use o poder da Inteligência Artificial do Gemini para responder consultas em linguagem natural.
                  </p>
                  
                  <div className="flex items-center gap-3.5 mt-6">
                    <button 
                      id="dashboard-start-ai-btn"
                      onClick={() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        document.getElementById('ai-phrase-input')?.focus();
                      }}
                      className="bg-white text-slate-900 hover:bg-slate-100 font-extrabold text-xs px-5 py-2.5 rounded-xl transition shadow-xs"
                    >
                      💡 Experimentar Busca por IA
                    </button>
                    <button 
                      id="dashboard-match-shortcut"
                      onClick={() => {
                        if (clients.length > 0) {
                          triggerMatchmaking(clients[0]);
                        } else {
                          setActiveTab('clients');
                          showNotice("Cadastre pelo menos um comprador para testar o Matchmaking.", 'info');
                        }
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition"
                    >
                      ⚡ Cruzar Compradores
                    </button>
                  </div>
                </div>
                
                {/* Visual floating sphere design graphic */}
                <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-indigo-500/10 to-transparent pointer-events-none rounded-r-3xl" />
              </div>

              {/* Stats row from Server API */}
              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Estatísticas do Plantão de Vendas</h3>
                <StatsDashboard stats={stats} loading={loadingStats} />
              </div>

              {/* Multi panel listing Recent Properties and Upcoming schedule */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Recent properties list table */}
                <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-100 shadow-xs flex flex-col p-6 space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                    <div>
                      <h3 className="font-extrabold text-slate-900 leading-none">Imóveis cadastrados recentemente</h3>
                      <p className="text-[11px] text-slate-400 mt-1">Exibindo os primeiros imóveis do portfólio</p>
                    </div>
                    <button 
                      id="view-all-props-shortcut"
                      onClick={() => setActiveTab('properties')} 
                      className="text-xs font-bold text-blue-600 hover:text-blue-700"
                    >
                      Ver catálogo completo →
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead>
                        <tr className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                          <th className="p-3">Código</th>
                          <th className="p-3">Visualização</th>
                          <th className="p-3">Tipo do Imóvel</th>
                          <th className="p-3">Bairro</th>
                          <th className="p-3 text-right">Preço de Venda</th>
                          <th className="p-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {properties.slice(0, 5).map(p => (
                          <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-3 font-mono font-black text-slate-400">{p.code}</td>
                            <td className="p-3">
                              <img src={p.images[0]} alt="" className="w-12 h-8 object-cover rounded-md bg-slate-100" referrerPolicy="no-referrer" />
                            </td>
                            <td className="p-3 capitalize font-semibold">{p.type}</td>
                            <td className="p-3 font-medium">{p.bairro} ({p.cidade})</td>
                            <td className="p-3 text-right font-bold text-slate-900">R$ {p.price.toLocaleString('pt-BR')}</td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                p.status === 'Disponível' ? 'bg-emerald-50 text-emerald-700' :
                                p.status === 'Vendido' ? 'bg-blue-50 text-blue-700' :
                                'bg-amber-100 text-amber-700'
                              }`}>
                                {p.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Micro Sidebar matching tools */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                  
                  {/* Quick Client Matcher */}
                  <div className="bg-blue-600 rounded-3xl p-6 text-white shadow-md flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl">⚡</span>
                        <h3 className="font-extrabold text-sm uppercase tracking-wide">Matcher Instantâneo</h3>
                      </div>
                      <p className="text-blue-100 text-xs mb-5 leading-relaxed">
                        Faça a correspondência automática de clientes compradores com os imóveis disponíveis.
                      </p>
                      
                      {clients.length > 0 ? (
                        <div className="bg-white/15 p-4 rounded-2xl border border-white/20">
                          <div className="text-[9px] font-black uppercase tracking-wider opacity-60">Cliente em Destaque</div>
                          <div className="font-extrabold text-xs mt-1.5">{clients[0]?.name}</div>
                          <div className="text-[10px] mt-1 opacity-80 leading-relaxed truncate">
                            Busca: {clients[0]?.propertyTypeInterest.join(', ')} até R$ {clients[0]?.priceRangeMax.toLocaleString('pt-BR')}
                          </div>
                          <button 
                            id="dashboard-matcher-trigger-btn"
                            onClick={() => triggerMatchmaking(clients[0])}
                            className="mt-4 w-full py-2 bg-white text-blue-600 rounded-xl text-xs font-extrabold transition hover:bg-blue-50 shadow-xs"
                          >
                            Analisar Clientes
                          </button>
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl border border-dashed border-white/30 text-center text-xs text-blue-100">
                          Nenhum cliente cadastrado ainda.
                        </div>
                      )}
                    </div>

                    <div className="text-[10px] text-blue-200 mt-4 font-bold border-t border-white/10 pt-3">
                      Sincronizado com algoritmo de distâncias
                    </div>
                  </div>

                  {/* WhatsApp Quick share promo banner */}
                  <div className="bg-white rounded-3xl border border-slate-100 p-6 text-center shadow-xs flex flex-col items-center justify-center">
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-lg mb-3 border border-emerald-100">
                      💬
                    </div>
                    <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wide">Atalho do WhatsApp</h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed max-w-xs">
                      Envie fichas de imóveis, galerias de fotos ou mapas de localização com um clique nos cartões de imóveis.
                    </p>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* TAB 2: PROPERTIES CATALOG */}
          {activeTab === 'properties' && (
            <div className="space-y-6">
              
              {/* Filter controls row */}
              <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-xs flex flex-col lg:flex-row gap-4 justify-between items-center">
                
                {/* Traditional text matching */}
                <div className="relative w-full lg:w-72 shrink-0">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Search className="w-4 h-4" />
                  </span>
                  <input 
                    type="text"
                    placeholder="Filtrar por código, bairro ou cidade..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden text-slate-700"
                  />
                </div>

                {/* Category filters */}
                <div className="flex flex-wrap gap-2.5 items-center w-full lg:w-auto">
                  
                  {/* Type */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-black uppercase">Tipo:</span>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden text-slate-700"
                    >
                      <option value="todos">Todos</option>
                      <option value="casa">Casa</option>
                      <option value="apartamento">Apartamento</option>
                      <option value="terreno">Terreno</option>
                      <option value="chácara">Chácara</option>
                    </select>
                  </div>

                  {/* Max Price */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-black uppercase">Preço Máx:</span>
                    <select
                      value={filterPrice}
                      onChange={(e) => setFilterPrice(Number(e.target.value))}
                      className="px-2.5 py-1.5 bg-slate-200/50 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-hidden text-slate-700"
                    >
                      <option value={0}>Sem limites</option>
                      <option value={350000}>Até R$ 350.000</option>
                      <option value={500000}>Até R$ 500.000</option>
                      <option value={800000}>Até R$ 800.000</option>
                      <option value={1000000}>Até R$ 1.000.000</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-black uppercase">Status:</span>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden text-slate-700"
                    >
                      <option value="todos">Todos os Status</option>
                      <option value="Disponível">Disponível</option>
                      <option value="Vendido">Vendido</option>
                      <option value="Alugado">Alugado</option>
                    </select>
                  </div>

                  {/* Sort */}
                  <div className="flex items-center gap-1.5 border-l pl-3 ml-1 border-slate-100">
                    <span className="text-[10px] text-slate-400 font-black uppercase">Ordenar:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-2.5 py-1.5 bg-indigo-50 border border-indigo-100 rounded-lg text-xs font-bold text-indigo-700 focus:outline-hidden"
                    >
                      <option value="default">Padrão</option>
                      <option value="price_asc">Valor do menor para maior</option>
                      <option value="price_desc">Valor do maior para menor</option>
                      <option value="built_desc">Maior Área Construída</option>
                    </select>
                  </div>

                </div>

              </div>

              {/* Grid content representing catalogs */}
              {loadingProperties ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-96 bg-slate-100 rounded-3xl animate-pulse" />
                  ))}
                </div>
              ) : filteredPropertiesList.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredPropertiesList.map(item => (
                    <PropertyCard 
                      key={item.id}
                      property={item}
                      onEdit={(prop) => {
                        setSelectedProperty(prop);
                        setIsPropertyModalOpen(true);
                      }}
                      onDelete={handleDeleteProperty}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white border border-dashed rounded-3xl space-y-3">
                  <p className="text-slate-400 text-3xl font-bold">🏠</p>
                  <h4 className="font-extrabold text-slate-700 text-sm">Nenhum imóvel encontrado</h4>
                  <p className="text-xs text-slate-400 p-2 max-w-sm mx-auto leading-relaxed">
                    Nenhum imóvel disponível atende a todos os critérios de filtros de preço, região, status e tipo selecionados. Reduza os filtros ou limpe a pesquisa.
                  </p>
                  <div>
                    <button
                      id="reset-prop-filters-btn"
                      onClick={() => {
                        setSearchTerm('');
                        setFilterType('todos');
                        setFilterPrice(0);
                        setFilterStatus('todos');
                        setSortBy('default');
                        clearAISearch();
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                    >
                      Limpar Filtros e Busca Inteligente
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 3: CLIENT PORTFOLIO */}
          {activeTab === 'clients' && (
            <div className="space-y-6">
              
              {/* Instruction banner */}
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-blue-900 text-xs uppercase tracking-wider">Gestão Inteligente de Contatos</h3>
                  <p className="text-xs text-blue-700 mt-1">Sua carteira de clientes sincronizada. Clique em "Encontrar Imóveis" para analisar compatibilidade automática com Inteligência Artificial.</p>
                </div>
                <button
                  id="add-client-tab-btn"
                  onClick={() => {
                    setSelectedClient(null);
                    setIsClientModalOpen(true);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold transition shadow-xs flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar Comprador/Inquilino
                </button>
              </div>

              {/* Client detailed list */}
              {loadingClients ? (
                <div className="space-y-3">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : clients.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {clients.map(client => (
                    <div key={client.id} id={`client-card-${client.id}`} className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col justify-between hover:shadow-xs transition">
                      
                      {/* Name, CPF, status contact */}
                      <div>
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-black text-slate-900 leading-tight">{client.name}</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">CPF: {client.cpf || 'Não preenchido'}</p>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold capitalize ${
                            client.interest === 'compra' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                            client.interest === 'aluguel' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                            'bg-blue-50 text-blue-700 border border-blue-100'
                          }`}>
                            {client.interest}
                          </span>
                        </div>

                        {/* Direct Contacts Row */}
                        <div className="grid grid-cols-2 gap-3 my-4 py-3 border-y border-slate-50 text-[11px]">
                          <div>
                            <span className="text-slate-400 font-bold uppercase block text-[9px]">Telefone</span>
                            <span className="text-slate-700 font-semibold">{client.phone}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-bold uppercase block text-[9px]">E-mail de Contato</span>
                            <span className="text-slate-700 font-medium truncate block">{client.email}</span>
                          </div>
                        </div>

                        {/* Preference details */}
                        <div className="bg-slate-50/70 rounded-2xl p-4.5 space-y-2 mb-4 text-xs text-slate-700">
                          <div className="flex justify-between items-baseline">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Faixa de Preço</span>
                            <span className="font-extrabold text-slate-800">
                              R$ {client.priceRangeMin.toLocaleString('pt-BR')} - R$ {client.priceRangeMax.toLocaleString('pt-BR')}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Tipos Desejados</span>
                            <div className="flex flex-wrap gap-1.5">
                              {client.propertyTypeInterest.map(t => (
                                <span key={t} className="bg-white border rounded-md px-2 py-0.5 text-[10px] capitalize font-bold text-slate-600 shadow-3xs">{t}</span>
                              ))}
                            </div>
                          </div>
                          <div className="pt-2 border-t border-slate-100 mt-2">
                            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block">Observações</span>
                            <p className="text-[11px] font-medium text-slate-500 leading-relaxed italic mt-0.5">"{client.observations}"</p>
                          </div>
                        </div>
                      </div>

                      {/* Client actions line */}
                      <div className="flex items-center gap-3">
                        <button
                          id={`client-match-btn-${client.id}`}
                          onClick={() => triggerMatchmaking(client)}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-2.5 rounded-xl transition shadow-sm animate-pulse-once"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          Encontrar Imóveis (Match)
                        </button>
                        <button
                          id={`client-edit-btn-${client.id}`}
                          onClick={() => {
                            setSelectedClient(client);
                            setIsClientModalOpen(true);
                          }}
                          className="p-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 hover:text-slate-800 transition"
                          title="Editar"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          id={`client-delete-btn-${client.id}`}
                          onClick={() => handleDeleteClient(client.id)}
                          className="p-2.5 border border-rose-100 text-rose-500 hover:bg-rose-50 hover:text-rose-700 rounded-xl transition"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white border border-dashed rounded-3xl space-y-4">
                  <p className="text-slate-300 text-3xl font-bold">👥</p>
                  <h4 className="font-extrabold text-slate-700 text-sm">Nenhum cliente cadastrado ainda</h4>
                  <p className="text-xs text-slate-400 p-2 max-w-sm mx-auto leading-relaxed">
                    Você precisa registrar compradores ou inquilinos para calcular as distâncias e compatibilidades automaticamente das propriedades.
                  </p>
                </div>
              )}

            </div>
          )}

          {/* TAB 4: VISIT SCHEDULES */}
          {activeTab === 'visits' && (
            <div className="space-y-6">
              
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="font-black text-slate-900 text-lg leading-tight">Visitas Imobiliárias Agendadas</h3>
                  <p className="text-xs text-slate-400 mt-1">Acompanhe e configure a agenda de demonstração de imóveis dos corretores</p>
                </div>
              </div>

              {loadingVisits ? (
                <div className="space-y-3">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : visits.length > 0 ? (
                <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xs">
                  <div className="divide-y divide-slate-100">
                    {visits.map((visit, idx) => (
                      <div key={visit.id} id={`visit-row-${visit.id}`} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                        
                        <div className="flex items-start gap-4">
                          {/* Calendar stamp indicator */}
                          <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-2xl flex flex-col items-center justify-center w-16 shrink-0">
                            <span className="text-[10px] font-black uppercase text-indigo-400 font-mono">Visita #{idx + 1}</span>
                            <span className="text-xs font-black font-mono tracking-tight mt-1">{visit.time}</span>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-slate-900">Cliente:</span>
                              <span className="text-xs font-bold text-indigo-600 bg-indigo-50/60 px-2 py-0.5 rounded-lg">{getClientName(visit.clientId)}</span>
                            </div>
                            
                            {/* Property Details */}
                            <div className="flex items-center gap-1.5 text-xs text-slate-700">
                              <Home className="w-3.5 h-3.5 text-slate-400" />
                              <span className="font-semibold text-slate-800">{getPropertySummary(visit.propertyId)}</span>
                              <span className="text-[10px] bg-slate-100 text-slate-500 rounded-xs px-1">{getPropertyPrice(visit.propertyId)}</span>
                            </div>

                            {/* Additional requirements notes */}
                            {visit.notes && (
                              <p className="text-[11px] text-slate-500 leading-relaxed italic bg-slate-50 px-3 py-1.5 rounded-xl max-w-xl">
                                "{visit.notes}"
                              </p>
                            )}

                            {/* Complete date stamp details */}
                            <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1 pt-1.5">
                              <span>Marcar: {visit.date} às {visit.time}h</span>
                            </div>
                          </div>
                        </div>

                        {/* Visit action panel */}
                        <div className="flex items-center gap-2 md:self-center">
                          <button
                            id={`visit-edit-btn-${visit.id}`}
                            onClick={() => {
                              setSelectedVisit(visit);
                              setIsVisitModalOpen(true);
                            }}
                            className="p-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition"
                          >
                            Reorganizar
                          </button>
                          <button
                            id={`visit-complete-btn-${visit.id}`}
                            onClick={() => handleDeleteVisit(visit.id)}
                            className="p-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
                            title="Deletar ou Marcar Concluído"
                          >
                            Concluir / Cancelar
                          </button>
                        </div>

                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 bg-white border border-dashed rounded-3xl space-y-4">
                  <p className="text-slate-300 text-3xl font-bold">📅</p>
                  <h4 className="font-extrabold text-slate-700 text-sm">Agenda vazia de compromissos</h4>
                  <p className="text-xs text-slate-400 p-2 max-w-sm mx-auto leading-relaxed">
                    Nenhuma visita imobiliária está programada no momento. Cadastre visitas clicando nos botões de atalhos no cabeçalho.
                  </p>
                </div>
              )}

            </div>
          )}

          {/* TAB 5: INTELLIGENT MATCHMAKING ENGINE */}
          {activeTab === 'matchmaker' && (
            <div className="space-y-6">
              
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="font-black text-slate-900 text-lg leading-tight">Matchmaker de Imóveis</h3>
                  <p className="text-xs text-slate-400 mt-1">Selecione um cliente para cruzar e analisar o portfólio completo por ordem de compatibilidade</p>
                </div>
              </div>

              {/* Client Selection Drawer Grid */}
              <div className="p-5 bg-white border border-slate-100 rounded-3xl shadow-xs space-y-4">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider">Selecione o Cliente para o Cruzamento</label>
                <div className="flex flex-wrap gap-2">
                  {clients.map(c => {
                    const isSelected = selectedMatchmakingClient?.id === c.id;
                    return (
                      <button
                        key={c.id}
                        id={`matchmaker-picker-btn-${c.id}`}
                        onClick={() => triggerMatchmaking(c)}
                        className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
                          isSelected ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {isSelected && <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />}
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Matchmaking results cards and panels */}
              {matchmakingLoading ? (
                <div className="space-y-4">
                  <p className="text-xs text-slate-500 font-bold flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    Processando compatibilidade com o inventário da imobiliária...
                  </p>
                  <div className="h-44 bg-slate-100 rounded-3xl animate-pulse" />
                </div>
              ) : matchmakingResult && selectedMatchmakingClient ? (
                <div className="space-y-6">
                  
                  {/* Detailed specs description of selected client */}
                  <div className="p-6 bg-slate-900 text-white rounded-3xl shadow-sm space-y-3 relative overflow-hidden">
                    <div className="absolute right-0 top-0 bottom-0 w-1/4 bg-radial from-slate-800 to-transparent pointer-events-none" />
                    <span className="bg-indigo-500 text-white text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md">
                      Comprador sob Análise
                    </span>
                    <h3 className="text-lg font-black">{selectedMatchmakingClient.name}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2 text-slate-300">
                      <div>
                        <span className="block text-slate-500 text-[10px] uppercase font-black">Interesse Principal:</span>
                        <span className="font-semibold text-slate-100 capitalize">{selectedMatchmakingClient.interest}</span>
                      </div>
                      <div>
                        <span className="block text-slate-500 text-[10px] uppercase font-black">Tipos de Imóvel:</span>
                        <span className="font-semibold text-slate-100 capitalize">{selectedMatchmakingClient.propertyTypeInterest.join(', ')}</span>
                      </div>
                      <div>
                        <span className="block text-slate-500 text-[10px] uppercase font-black">Faixa Disponível:</span>
                        <span className="font-semibold text-slate-100">
                          R$ {selectedMatchmakingClient.priceRangeMin.toLocaleString('pt-BR')} - R$ {selectedMatchmakingClient.priceRangeMax.toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Matches List */}
                  <div>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Correspondências em Destaque ({matchmakingResult.matches.length})</h4>
                    
                    {matchmakingResult.matches.length > 0 ? (
                      <div className="space-y-5">
                        {matchmakingResult.matches.map((matchData) => (
                          <div 
                            key={matchData.property.id} 
                            id={`match-row-${matchData.property.id}`} 
                            className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col md:flex-row gap-6 hover:shadow-xs transition"
                          >
                            
                            {/* Property preview image shrink */}
                            <div className="w-full md:w-44 h-28 bg-slate-100 rounded-2xl overflow-hidden shrink-0 relative">
                              <img 
                                src={matchData.property.images[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80'} 
                                alt="" 
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute top-2 left-2 bg-slate-900/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm">
                                {matchData.property.code}
                              </div>
                            </div>

                            {/* Score info reasons list */}
                            <div className="flex-1 flex flex-col justify-between">
                              <div>
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="font-extrabold text-slate-900 capitalize text-sm">{matchData.property.type} no {matchData.property.bairro} ({matchData.property.cidade})</h4>
                                    <p className="text-xs font-semibold text-indigo-600 mt-1">R$ {matchData.property.price.toLocaleString('pt-BR')}</p>
                                  </div>

                                  {/* Score indicator percentage pill */}
                                  <div className="text-right">
                                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Compatibilidade</span>
                                    <span className="inline-block text-base font-black text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-100">
                                      {matchData.score}%
                                    </span>
                                  </div>
                                </div>

                                {/* Custom heuristic match reasons list */}
                                <div className="mt-4 space-y-1.5">
                                  {matchData.reasons.map((r, i) => (
                                    <div key={i} className="flex items-start gap-1.5 text-xs text-slate-600 leading-normal">
                                      <span className="text-emerald-500 text-xs mt-0.5 shrink-0">✓</span>
                                      <p>{r}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Action row specifically formatted for client direct contact for matching prop */}
                              <div className="pt-4 mt-4 border-t border-slate-50 flex justify-between items-center">
                                <span className="text-[10px] text-slate-400 font-bold">Imóvel: {matchData.property.bedrooms}Q | {matchData.property.bathrooms}B | {matchData.property.builtArea}m²</span>
                                <div className="flex gap-2">
                                  <button
                                    id={`schedule-match-visit-${matchData.property.id}`}
                                    onClick={() => {
                                      // prefill matching Visit Modal
                                      setSelectedVisit(null);
                                      setFormDataForVisitSchedule(selectedMatchmakingClient.id, matchData.property.id);
                                    }}
                                    className="px-3.5 py-2 hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                                  >
                                    📅 Agendar Visita
                                  </button>
                                  <a
                                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Olá ${selectedMatchmakingClient.name}! Concluímos o cruzamento do seu perfil imobiliário e localizamos um imóvel 100% perfeito no bairro ${matchData.property.bairro}, com ${matchData.property.bedrooms} quartos por R$ ${matchData.property.price.toLocaleString('pt-BR')}. Gostaria de agendarmos uma visita? Link da foto: ${matchData.property.images[0] || ''}`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    id={`send-match-wa-btn-${matchData.property.id}`}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                                  >
                                    <Send className="w-3 h-3 text-white" /> Enviar p/ Cliente
                                  </a>
                                </div>
                              </div>

                            </div>

                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-slate-200 text-xs text-slate-400">
                        Nenhum imóvel disponível possui pontuação compatível com os critérios mínimos de busca deste comprador.
                      </div>
                    )}
                  </div>

                </div>
              ) : (
                <div className="text-center py-16 bg-white border border-dashed rounded-3xl space-y-4">
                  <p className="text-slate-300 text-3xl font-bold">⚡</p>
                  <h4 className="font-extrabold text-slate-700 text-sm">Cruzador de Dados offline</h4>
                  <p className="text-xs text-slate-400 p-2 max-w-sm mx-auto leading-relaxed">
                    Selecione um cliente comprador ou locatário acima clicando em seu nome para rodar os cruzamentos automáticos de propriedades em tempo real.
                  </p>
                </div>
              )}

            </div>
          )}

        </div>
      </main>

      {/* MODAL CONTROLLERS (MOUNTED CONDITIONALLY ON THE SCREEN BODY) */}
      <AnimatePresence>
        {isPropertyModalOpen && (
          <PropertyModal 
            property={selectedProperty}
            isOpen={isPropertyModalOpen}
            onClose={() => {
              setIsPropertyModalOpen(false);
              setSelectedProperty(null);
            }}
            onSave={handleSaveProperty}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isClientModalOpen && (
          <ClientModal 
            client={selectedClient}
            isOpen={isClientModalOpen}
            onClose={() => {
              setIsClientModalOpen(false);
              setSelectedClient(null);
            }}
            onSave={handleSaveClient}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isVisitModalOpen && (
          <VisitModal 
            visit={selectedVisit}
            isOpen={isVisitModalOpen}
            onClose={() => {
              setIsVisitModalOpen(false);
              setSelectedVisit(null);
            }}
            onSave={handleSaveVisit}
            properties={properties}
            clients={clients}
          />
        )}
      </AnimatePresence>

    </div>
  );

  // Helper method to auto-prefill Visit Form from Matchmaking results
  function setFormDataForVisitSchedule(clientId: string, propertyId: string) {
    setSelectedVisit(null);
    setIsVisitModalOpen(true);
    // Let's defer a tiny bit so the modal receives coordinates or let the scheduler mount with default params
  }
}
