import type { ReactNode } from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Card } from './Card';
import { cn } from '../../lib/cn';

interface KpiCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  deltaPct?: number;
  sparkline?: ReactNode;
  onClick?: () => void;
}

export function KpiCard({ icon, label, value, deltaPct, sparkline, onClick }: KpiCardProps) {
  const positive = (deltaPct ?? 0) >= 0;
  return (
    <Card
      hoverGlow
      onClick={onClick}
      className={cn('group p-5', onClick && 'cursor-pointer')}
    >
      <div className="flex items-start justify-between">
        <div className="rounded-xl bg-primary/10 p-2.5 text-primary transition-colors group-hover:bg-primary/20">
          {icon}
        </div>
        {deltaPct !== undefined && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold',
              positive ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger',
            )}
          >
            {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(deltaPct).toFixed(1)}%
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-tight text-text-primary">{value}</p>
      <p className="mt-1 text-xs text-text-secondary">{label}</p>
      {sparkline && <div className="mt-3 h-10">{sparkline}</div>}
    </Card>
  );
}
