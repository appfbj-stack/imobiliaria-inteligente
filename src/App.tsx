import { lazy, Suspense, type ComponentType } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { SkeletonCard } from './components/ui/Skeleton';

/** React.lazy needs a default export; our pages use named exports, so wrap the dynamic import. */
function lazyPage<T extends Record<string, ComponentType>>(loader: () => Promise<T>, name: keyof T) {
  return lazy(() => loader().then((module) => ({ default: module[name] })));
}

const DashboardPage = lazyPage(() => import('./pages/DashboardPage'), 'DashboardPage');
const PropertiesPage = lazyPage(() => import('./pages/PropertiesPage'), 'PropertiesPage');
const ClientsPage = lazyPage(() => import('./pages/ClientsPage'), 'ClientsPage');
const VisitsPage = lazyPage(() => import('./pages/VisitsPage'), 'VisitsPage');
const MapaPage = lazyPage(() => import('./pages/MapaPage'), 'MapaPage');
const CaptacaoPage = lazyPage(() => import('./pages/CaptacaoPage'), 'CaptacaoPage');
const CorretoresPage = lazyPage(() => import('./pages/CorretoresPage'), 'CorretoresPage');
const ProprietariosPage = lazyPage(() => import('./pages/ProprietariosPage'), 'ProprietariosPage');
const AgendaPage = lazyPage(() => import('./pages/AgendaPage'), 'AgendaPage');
const PropostasPage = lazyPage(() => import('./pages/PropostasPage'), 'PropostasPage');
const ContratosPage = lazyPage(() => import('./pages/ContratosPage'), 'ContratosPage');
const LocacoesPage = lazyPage(() => import('./pages/LocacoesPage'), 'LocacoesPage');
const VendasPage = lazyPage(() => import('./pages/VendasPage'), 'VendasPage');
const FinanceiroPage = lazyPage(() => import('./pages/FinanceiroPage'), 'FinanceiroPage');
const DocumentosPage = lazyPage(() => import('./pages/DocumentosPage'), 'DocumentosPage');
const AniversariantesPage = lazyPage(() => import('./pages/AniversariantesPage'), 'AniversariantesPage');
const RelatoriosPage = lazyPage(() => import('./pages/RelatoriosPage'), 'RelatoriosPage');
const ConfiguracoesPage = lazyPage(() => import('./pages/ConfiguracoesPage'), 'ConfiguracoesPage');

function RouteFallback() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/imoveis" element={<PropertiesPage />} />
          <Route path="/captacao" element={<CaptacaoPage />} />
          <Route path="/mapa" element={<MapaPage />} />
          <Route path="/clientes" element={<ClientsPage />} />
          <Route path="/corretores" element={<CorretoresPage />} />
          <Route path="/proprietarios" element={<ProprietariosPage />} />
          <Route path="/aniversariantes" element={<AniversariantesPage />} />
          <Route path="/visitas" element={<VisitsPage />} />
          <Route path="/agenda" element={<AgendaPage />} />
          <Route path="/propostas" element={<PropostasPage />} />
          <Route path="/contratos" element={<ContratosPage />} />
          <Route path="/locacoes" element={<LocacoesPage />} />
          <Route path="/vendas" element={<VendasPage />} />
          <Route path="/financeiro" element={<FinanceiroPage />} />
          <Route path="/documentos" element={<DocumentosPage />} />
          <Route path="/relatorios" element={<RelatoriosPage />} />
          <Route path="/configuracoes" element={<ConfiguracoesPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
