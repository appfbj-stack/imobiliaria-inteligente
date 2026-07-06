import { useMemo, useState } from 'react';
import { CalendarDays, Home } from 'lucide-react';
import { useRealData } from '../state/RealDataContext';
import { useDemoData } from '../state/DemoDataProvider';
import { CalendarHeatmap } from '../components/charts/CalendarHeatmap';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';

export function AgendaPage() {
  const { visits, properties, clients } = useRealData();
  const { visits: mockVisits, properties: mockProperties, clients: mockClients } = useDemoData();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const now = new Date();

  const allVisits = useMemo(() => [...visits, ...mockVisits], [visits, mockVisits]);
  const allProperties = useMemo(() => [...properties, ...mockProperties], [properties, mockProperties]);
  const allClients = useMemo(() => [...clients, ...mockClients], [clients, mockClients]);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    allVisits.forEach((v) => {
      const [year, month] = v.date.split('-').map(Number);
      if (year === now.getFullYear() && month === now.getMonth() + 1) {
        map[v.date] = (map[v.date] ?? 0) + 1;
      }
    });
    return map;
  }, [allVisits, now]);

  const todayIso = now.toISOString().slice(0, 10);
  const dayVisits = allVisits
    .filter((v) => v.date === (selectedDate ?? todayIso))
    .sort((a, b) => (a.time < b.time ? -1 : 1));

  const getClientName = (id: string) => allClients.find((c) => c.id === id)?.name ?? 'Cliente Desconhecido';
  const getPropertySummary = (id: string) => {
    const p = allProperties.find((prop) => prop.id === id);
    return p ? `${p.code} · ${p.type} · ${p.bairro} (${p.cidade})` : 'Imóvel Não Encontrado';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-black text-text-primary">Agenda</h2>
        <p className="text-xs text-text-secondary">Visão de calendário unificada de visitas e compromissos.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="p-5 lg:col-span-5">
          <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-text-secondary">
            {now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </h3>
          <CalendarHeatmap year={now.getFullYear()} month={now.getMonth()} counts={counts} onDayClick={setSelectedDate} />
        </Card>

        <Card className="p-5 lg:col-span-7">
          <div className="mb-4 flex items-center gap-2">
            <CalendarDays size={16} className="text-primary" />
            <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary">
              Compromissos em {selectedDate ?? todayIso}
            </h3>
          </div>
          {dayVisits.length === 0 ? (
            <EmptyState title="Nenhum compromisso neste dia" description="Selecione outro dia no calendário para ver a agenda." />
          ) : (
            <div className="space-y-2">
              {dayVisits.map((v) => (
                <div key={v.id} className="flex items-center justify-between gap-3 rounded-xl border border-border p-3">
                  <div className="flex items-center gap-3">
                    <Badge tone="info">{v.time}</Badge>
                    <div>
                      <p className="text-xs font-bold text-text-primary">{getClientName(v.clientId)}</p>
                      <p className="flex items-center gap-1 text-[10px] text-text-secondary">
                        <Home size={11} /> {getPropertySummary(v.propertyId)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
