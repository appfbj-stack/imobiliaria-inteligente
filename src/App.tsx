import { Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { DashboardPage } from './pages/DashboardPage';
import { PropertiesPage } from './pages/PropertiesPage';
import { ClientsPage } from './pages/ClientsPage';
import { VisitsPage } from './pages/VisitsPage';
import { MapaPage } from './pages/MapaPage';
import { CaptacaoPage } from './pages/CaptacaoPage';
import { CorretoresPage } from './pages/CorretoresPage';
import { ProprietariosPage } from './pages/ProprietariosPage';
import { AgendaPage } from './pages/AgendaPage';
import { PropostasPage } from './pages/PropostasPage';
import { ContratosPage } from './pages/ContratosPage';
import { LocacoesPage } from './pages/LocacoesPage';
import { VendasPage } from './pages/VendasPage';
import { FinanceiroPage } from './pages/FinanceiroPage';
import { DocumentosPage } from './pages/DocumentosPage';
import { AniversariantesPage } from './pages/AniversariantesPage';
import { RelatoriosPage } from './pages/RelatoriosPage';
import { ConfiguracoesPage } from './pages/ConfiguracoesPage';

export default function App() {
  return (
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
  );
}
