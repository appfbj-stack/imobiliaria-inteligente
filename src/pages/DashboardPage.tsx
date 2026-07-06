import { useNavigate } from 'react-router-dom';
import { Home, TrendingUp, Inbox, Users, Calendar, Sparkles, Zap } from 'lucide-react';
import { useRealData } from '../state/RealDataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { KpiCard } from '../components/ui/KpiCard';
import { Badge } from '../components/ui/Badge';
import { SkeletonCard } from '../components/ui/Skeleton';

export function DashboardPage() {
  const navigate = useNavigate();
  const { stats, loadingStats, properties, clients } = useRealData();

  const data = stats ?? { totalProperties: 0, totalSold: 0, totalRented: 0, totalClients: 0, totalVisits: 0 };

  const kpis = [
    { icon: <Home size={18} />, label: 'Total de Imóveis', value: data.totalProperties },
    { icon: <TrendingUp size={18} />, label: 'Imóveis Vendidos', value: data.totalSold },
    { icon: <Inbox size={18} />, label: 'Imóveis Alugados', value: data.totalRented },
    { icon: <Users size={18} />, label: 'Clientes Cadastrados', value: data.totalClients },
    { icon: <Calendar size={18} />, label: 'Visitas Agendadas', value: data.totalVisits },
  ];

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-surface via-[#0d1730] to-surface p-8 shadow-glow-sm">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-[radial-gradient(circle_at_top_right,_var(--color-primary-glow)_0%,_transparent_60%)] opacity-20" />
        <div className="relative z-10 max-w-xl">
          <Badge tone="info">Visão Estratégica</Badge>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-text-primary">Bem-vindo à Kairós!</h2>
          <p className="mt-2 text-xs leading-relaxed text-text-secondary">
            Gerencie o portfólio completo da sua imobiliária de ponta a ponta: imóveis, clientes, corretores,
            contratos e visitas em dashboards analíticos, com o Aion como seu consultor imobiliário inteligente.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button
              onClick={() => document.getElementById('ai-phrase-input')?.focus()}
              variant="primary"
              size="sm"
            >
              <Sparkles size={14} /> Experimentar busca por IA
            </Button>
            <Button onClick={() => navigate('/clientes')} variant="secondary" size="sm">
              <Zap size={14} /> Cruzar compradores
            </Button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-text-secondary">
          Estatísticas do plantão de vendas
        </h3>
        {loadingStats ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {kpis.map((kpi) => (
              <KpiCard key={kpi.label} icon={kpi.icon} label={kpi.label} value={String(kpi.value)} />
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-8">
          <CardHeader>
            <div>
              <CardTitle>Imóveis cadastrados recentemente</CardTitle>
              <p className="mt-1 text-[11px] text-text-secondary">Exibindo os primeiros imóveis do portfólio</p>
            </div>
            <button onClick={() => navigate('/imoveis')} className="text-xs font-bold text-primary hover:text-primary-hover">
              Ver catálogo completo →
            </button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-[10px] font-black uppercase tracking-wider text-text-secondary">
                    <th className="p-3">Código</th>
                    <th className="p-3">Foto</th>
                    <th className="p-3">Tipo</th>
                    <th className="p-3">Bairro</th>
                    <th className="p-3 text-right">Preço</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {properties.slice(0, 5).map((p) => (
                    <tr key={p.id} className="transition-colors hover:bg-surface-hover/60">
                      <td className="p-3 font-mono font-black text-text-secondary">{p.code}</td>
                      <td className="p-3">
                        <img src={p.images[0]} alt="" className="h-8 w-12 rounded-md bg-surface-hover object-cover" referrerPolicy="no-referrer" />
                      </td>
                      <td className="p-3 font-semibold capitalize text-text-primary">{p.type}</td>
                      <td className="p-3 font-medium text-text-primary">
                        {p.bairro} ({p.cidade})
                      </td>
                      <td className="p-3 text-right font-bold text-text-primary">R$ {p.price.toLocaleString('pt-BR')}</td>
                      <td className="p-3 text-center">
                        <Badge tone={p.status === 'Disponível' ? 'success' : p.status === 'Vendido' ? 'info' : 'warning'}>
                          {p.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6 lg:col-span-4">
          <Card className="flex flex-1 flex-col justify-between bg-primary/10 p-6">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Zap size={18} className="text-primary" />
                <h3 className="text-sm font-extrabold uppercase tracking-wide text-text-primary">Matcher instantâneo</h3>
              </div>
              <p className="mb-5 text-xs leading-relaxed text-text-secondary">
                Faça a correspondência automática de clientes compradores com os imóveis disponíveis.
              </p>
              {clients.length > 0 ? (
                <div className="rounded-2xl border border-primary/20 bg-surface/60 p-4">
                  <div className="text-[9px] font-black uppercase tracking-wider text-text-secondary">Cliente em destaque</div>
                  <div className="mt-1.5 text-xs font-extrabold text-text-primary">{clients[0]?.name}</div>
                  <div className="mt-1 truncate text-[10px] leading-relaxed text-text-secondary">
                    Busca: {clients[0]?.propertyTypeInterest.join(', ')} até R$ {clients[0]?.priceRangeMax.toLocaleString('pt-BR')}
                  </div>
                  <Button onClick={() => navigate('/clientes')} size="sm" className="mt-4 w-full">
                    Analisar clientes
                  </Button>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-text-secondary">
                  Nenhum cliente cadastrado ainda.
                </div>
              )}
            </div>
          </Card>

          <Card className="flex flex-col items-center justify-center p-6 text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-success/10 text-success">💬</div>
            <h4 className="text-xs font-extrabold uppercase tracking-wide text-text-primary">Atalho do WhatsApp</h4>
            <p className="mt-1 max-w-xs text-[11px] leading-relaxed text-text-secondary">
              Envie fichas de imóveis, galerias de fotos ou mapas de localização com um clique nos cartões de imóveis.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
