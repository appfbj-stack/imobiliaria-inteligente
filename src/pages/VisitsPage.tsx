import { useState } from 'react';
import { Home } from 'lucide-react';
import type { Visit } from '../types';
import { useRealData } from '../state/RealDataContext';
import VisitModal from '../components/visit/VisitModal';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';

export function VisitsPage() {
  const { visits, properties, clients, loadingVisits, saveVisit, deleteVisit, getClientName, getPropertySummary, getPropertyPrice } =
    useRealData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div>
          <h3 className="text-lg font-black leading-tight text-text-primary">Visitas imobiliárias agendadas</h3>
          <p className="mt-1 text-xs text-text-secondary">Acompanhe e configure a agenda de demonstração de imóveis</p>
        </div>
        <Button
          onClick={() => {
            setSelectedVisit(null);
            setIsModalOpen(true);
          }}
        >
          + Agenda
        </Button>
      </div>

      {loadingVisits ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : visits.length > 0 ? (
        <Card className="divide-y divide-border overflow-hidden">
          {visits.map((visit, idx) => (
            <div key={visit.id} className="flex flex-col justify-between gap-4 p-6 transition-colors hover:bg-surface-hover/60 md:flex-row md:items-center">
              <div className="flex items-start gap-4">
                <div className="flex w-16 shrink-0 flex-col items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 p-3 text-primary">
                  <span className="font-mono text-[10px] font-black uppercase">Visita #{idx + 1}</span>
                  <span className="mt-1 font-mono text-xs font-black tracking-tight">{visit.time}</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-text-primary">Cliente:</span>
                    <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                      {getClientName(visit.clientId)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-text-primary">
                    <Home className="h-3.5 w-3.5 text-text-secondary" />
                    <span className="font-semibold">{getPropertySummary(visit.propertyId)}</span>
                    <span className="rounded-sm bg-surface-hover px-1 text-[10px] text-text-secondary">{getPropertyPrice(visit.propertyId)}</span>
                  </div>
                  {visit.notes && (
                    <p className="max-w-xl rounded-xl bg-surface-hover px-3 py-1.5 text-[11px] italic leading-relaxed text-text-secondary">
                      "{visit.notes}"
                    </p>
                  )}
                  <div className="flex items-center gap-1 pt-1.5 text-[10px] font-bold text-text-secondary">
                    <span>Marcado: {visit.date} às {visit.time}h</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 md:self-center">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSelectedVisit(visit);
                    setIsModalOpen(true);
                  }}
                >
                  Reorganizar
                </Button>
                <Button variant="primary" size="sm" onClick={() => deleteVisit(visit.id)}>
                  Concluir / Cancelar
                </Button>
              </div>
            </div>
          ))}
        </Card>
      ) : (
        <EmptyState title="Agenda vazia de compromissos" description="Nenhuma visita está programada no momento. Cadastre uma pelo botão acima." />
      )}

      <VisitModal
        visit={selectedVisit}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedVisit(null);
        }}
        onSave={async (formData) => {
          const ok = await saveVisit(formData);
          if (ok) {
            setIsModalOpen(false);
            setSelectedVisit(null);
          }
        }}
        properties={properties}
        clients={clients}
      />
    </div>
  );
}
