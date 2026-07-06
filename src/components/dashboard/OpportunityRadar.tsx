import { AlertTriangle, CheckCircle2, Info, TrendingDown, Radar as RadarIcon } from 'lucide-react';
import type { Insight, InsightTone } from '../../lib/insights';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';

const TONE_ICON: Record<InsightTone, typeof Info> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: TrendingDown,
};

const TONE_CHIP: Record<InsightTone, string> = {
  info: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
};

interface OpportunityRadarProps {
  insights: Insight[];
  onOpenAion?: () => void;
}

export function OpportunityRadar({ insights, onOpenAion }: OpportunityRadarProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <RadarIcon size={16} className="text-primary" />
          <CardTitle>Radar de Oportunidades</CardTitle>
        </div>
        {onOpenAion && (
          <button onClick={onOpenAion} className="text-xs font-bold text-primary hover:text-primary-hover">
            Perguntar ao Aion →
          </button>
        )}
      </CardHeader>
      <CardContent>
        {insights.length === 0 ? (
          <EmptyState title="Sem oportunidades no momento" description="O Aion está monitorando os dados continuamente." />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {insights.map((insight) => {
              const Icon = TONE_ICON[insight.tone];
              return (
                <div key={insight.id} className="rounded-2xl border border-border bg-surface-hover/50 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className={`rounded-lg p-1.5 ${TONE_CHIP[insight.tone]}`}>
                      <Icon size={16} />
                    </div>
                    <Badge tone={insight.tone}>{insight.metric}</Badge>
                  </div>
                  <p className="mt-3 text-xs font-bold leading-snug text-text-primary">{insight.title}</p>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-text-secondary">{insight.description}</p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
