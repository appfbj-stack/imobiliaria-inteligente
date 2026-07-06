import { useMemo, useState } from 'react';
import { Cake, MessageCircle, Phone, CalendarCheck } from 'lucide-react';
import { useDemoData } from '../state/DemoDataProvider';
import { CalendarHeatmap } from '../components/charts/CalendarHeatmap';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Tabs } from '../components/ui/Tabs';
import { EmptyState } from '../components/ui/EmptyState';
import { useToast } from '../components/ui/Toast';

type Scope = 'hoje' | 'semana' | 'mes';

export function AniversariantesPage() {
  const { brokers, owners } = useDemoData();
  const { showToast } = useToast();
  const [scope, setScope] = useState<Scope>('mes');

  const now = new Date();
  const people = useMemo(
    () => [
      ...brokers.map((p) => ({ ...p, role: 'Corretor' as const })),
      ...owners.map((p) => ({ ...p, role: 'Proprietário' as const })),
    ],
    [brokers, owners],
  );

  const today = useMemo(() => new Date(now.getFullYear(), now.getMonth(), now.getDate()), [now]);

  const withNextBirthday = useMemo(
    () =>
      people.map((p) => {
        const [, month, day] = p.birthDate.split('-').map(Number);
        let next = new Date(today.getFullYear(), month - 1, day);
        if (next < today) {
          next = new Date(today.getFullYear() + 1, month - 1, day);
        }
        const daysUntil = Math.round((next.getTime() - today.getTime()) / 86400000);
        return { ...p, daysUntil };
      }),
    [people, today],
  );

  const filtered = useMemo(() => {
    const limit = scope === 'hoje' ? 0 : scope === 'semana' ? 7 : 31;
    return withNextBirthday.filter((p) => p.daysUntil <= limit).sort((a, b) => a.daysUntil - b.daysUntil);
  }, [withNextBirthday, scope]);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    people.forEach((p) => {
      const [, month, day] = p.birthDate.split('-');
      if (Number(month) === now.getMonth() + 1) {
        const iso = `${now.getFullYear()}-${month}-${day}`;
        map[iso] = (map[iso] ?? 0) + 1;
      }
    });
    return map;
  }, [people, now]);

  const monthCount = withNextBirthday.filter((p) => p.daysUntil <= 31).length;
  const todayCount = withNextBirthday.filter((p) => p.daysUntil === 0).length;

  const registerAction = (name: string, action: string) => showToast(`${action} registrado(a) para ${name}.`, 'success');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-black text-text-primary">Aniversariantes</h2>
        <p className="text-xs text-text-secondary">Clientes, corretores e proprietários aniversariantes do período.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card className="p-4">
          <p className="text-xl font-black text-text-primary">{todayCount}</p>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-text-secondary">Hoje</p>
        </Card>
        <Card className="p-4">
          <p className="text-xl font-black text-text-primary">{monthCount}</p>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-text-secondary">Este mês</p>
        </Card>
        <Card className="p-4">
          <p className="text-xl font-black text-text-primary">{brokers.length}</p>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-text-secondary">Corretores</p>
        </Card>
        <Card className="p-4">
          <p className="text-xl font-black text-text-primary">{owners.length}</p>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-text-secondary">Proprietários</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="p-5 lg:col-span-5">
          <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-text-secondary">Calendário do mês</h3>
          <CalendarHeatmap year={now.getFullYear()} month={now.getMonth()} counts={counts} />
        </Card>

        <Card className="p-5 lg:col-span-7">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary">Lista de aniversariantes</h3>
            <Tabs
              value={scope}
              onChange={(v) => setScope(v)}
              items={[
                { value: 'hoje', label: 'Hoje' },
                { value: 'semana', label: 'Semana' },
                { value: 'mes', label: 'Mês' },
              ]}
            />
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon={<Cake size={24} />} title="Sem aniversariantes neste período" />
          ) : (
            <div className="space-y-2">
              {filtered.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-3 rounded-xl border border-border p-3">
                  <div className="flex items-center gap-3">
                    <Avatar src={p.avatarUrl} name={p.name} size="sm" />
                    <div>
                      <p className="text-xs font-bold text-text-primary">{p.name}</p>
                      <p className="text-[10px] text-text-secondary">
                        {p.role} · {p.daysUntil === 0 ? 'Hoje!' : `em ${p.daysUntil} dia(s)`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge tone={p.daysUntil === 0 ? 'success' : 'neutral'}>{p.birthDate.slice(5)}</Badge>
                    <Button size="icon" variant="secondary" onClick={() => registerAction(p.name, 'Ligação')} title="Registrar ligação">
                      <Phone size={13} />
                    </Button>
                    <Button size="icon" variant="secondary" onClick={() => registerAction(p.name, 'Mensagem')} title="Registrar mensagem">
                      <MessageCircle size={13} />
                    </Button>
                    <Button size="icon" variant="secondary" onClick={() => registerAction(p.name, 'Visita')} title="Registrar visita">
                      <CalendarCheck size={13} />
                    </Button>
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
