import { Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { DashboardPage } from './pages/DashboardPage';
import { PropertiesPage } from './pages/PropertiesPage';
import { ClientsPage } from './pages/ClientsPage';
import { VisitsPage } from './pages/VisitsPage';
import { MapaPage } from './pages/MapaPage';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { NAV_ITEMS } from './config/navigation';

const PLACEHOLDER_DESCRIPTIONS: Record<string, string> = {
  captacao: 'Pipeline de captação de novos imóveis e leads de proprietários.',
  corretores: 'Produção, comissões, vendas, locações, agenda, avaliações e metas por corretor.',
  proprietarios: 'Imóveis, receitas, contratos, documentos e histórico por proprietário.',
  agenda: 'Visão de calendário unificada de visitas, retornos e compromissos.',
  propostas: 'Propostas pendentes, aceitas, recusadas e em negociação.',
  contratos: 'Contratos de venda e locação, renovações, vencimentos e assinaturas.',
  locacoes: 'Contratos de locação ativos, com receita e vencimentos.',
  vendas: 'Contratos de venda concluídos e em andamento.',
  financeiro: 'Entradas, saídas, comissões, recebimentos, fluxo de caixa e inadimplência.',
  documentos: 'Documentos de imóveis, clientes e contratos centralizados.',
  aniversariantes: 'Clientes, corretores, proprietários e parceiros aniversariantes do período.',
  relatorios: 'Relatórios exportáveis em PDF e Excel sobre todo o negócio.',
  configuracoes: 'Preferências da conta, equipe e integrações da Kairós.',
};

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/imoveis" element={<PropertiesPage />} />
        <Route path="/clientes" element={<ClientsPage />} />
        <Route path="/visitas" element={<VisitsPage />} />
        <Route path="/mapa" element={<MapaPage />} />

        {NAV_ITEMS.filter((item) => PLACEHOLDER_DESCRIPTIONS[item.id]).map((item) => (
          <Route
            key={item.id}
            path={item.path}
            element={<PlaceholderPage title={item.label} description={PLACEHOLDER_DESCRIPTIONS[item.id]} icon={item.icon} />}
          />
        ))}
      </Route>
    </Routes>
  );
}
