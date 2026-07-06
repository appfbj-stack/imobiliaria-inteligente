import {
  LayoutDashboard,
  Building2,
  Target,
  Users,
  Briefcase,
  KeyRound,
  CalendarCheck,
  CalendarDays,
  FileText,
  FileSignature,
  Home as HomeIcon,
  TrendingUp,
  Wallet,
  FolderOpen,
  PartyPopper,
  Map as MapIcon,
  BarChart3,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  group: string;
}

export const NAV_GROUPS = ['Visão Geral', 'Portfólio', 'Relacionamento', 'Atividades', 'Negócios', 'Gestão', 'Sistema'] as const;

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', path: '/', icon: LayoutDashboard, group: 'Visão Geral' },

  { id: 'imoveis', label: 'Imóveis', path: '/imoveis', icon: Building2, group: 'Portfólio' },
  { id: 'captacao', label: 'Captação', path: '/captacao', icon: Target, group: 'Portfólio' },
  { id: 'mapa', label: 'Mapa', path: '/mapa', icon: MapIcon, group: 'Portfólio' },

  { id: 'clientes', label: 'Clientes', path: '/clientes', icon: Users, group: 'Relacionamento' },
  { id: 'corretores', label: 'Corretores', path: '/corretores', icon: Briefcase, group: 'Relacionamento' },
  { id: 'proprietarios', label: 'Proprietários', path: '/proprietarios', icon: KeyRound, group: 'Relacionamento' },
  { id: 'aniversariantes', label: 'Aniversariantes', path: '/aniversariantes', icon: PartyPopper, group: 'Relacionamento' },

  { id: 'visitas', label: 'Visitas', path: '/visitas', icon: CalendarCheck, group: 'Atividades' },
  { id: 'agenda', label: 'Agenda', path: '/agenda', icon: CalendarDays, group: 'Atividades' },

  { id: 'propostas', label: 'Propostas', path: '/propostas', icon: FileText, group: 'Negócios' },
  { id: 'contratos', label: 'Contratos', path: '/contratos', icon: FileSignature, group: 'Negócios' },
  { id: 'locacoes', label: 'Locações', path: '/locacoes', icon: HomeIcon, group: 'Negócios' },
  { id: 'vendas', label: 'Vendas', path: '/vendas', icon: TrendingUp, group: 'Negócios' },

  { id: 'financeiro', label: 'Financeiro', path: '/financeiro', icon: Wallet, group: 'Gestão' },
  { id: 'documentos', label: 'Documentos', path: '/documentos', icon: FolderOpen, group: 'Gestão' },
  { id: 'relatorios', label: 'Relatórios', path: '/relatorios', icon: BarChart3, group: 'Gestão' },

  { id: 'configuracoes', label: 'Configurações', path: '/configuracoes', icon: Settings, group: 'Sistema' },
];
