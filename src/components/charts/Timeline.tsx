import type { ReactNode } from 'react';
import { Badge } from '../ui/Badge';
import type { Tone } from '../ui/Badge';

export interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  tone?: Tone;
  icon?: ReactNode;
}

interface TimelineProps {
  events: TimelineEvent[];
}

export function Timeline({ events }: TimelineProps) {
  return (
    <ol className="relative space-y-6 border-l border-border pl-6">
      {events.map((event) => (
        <li key={event.id} className="relative">
          <span className="absolute -left-[29px] flex h-4 w-4 items-center justify-center rounded-full border-2 border-background bg-primary shadow-glow-sm" />
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-text-primary">{event.title}</p>
            <span className="whitespace-nowrap text-[10px] font-bold uppercase tracking-wider text-text-secondary">{event.date}</span>
          </div>
          {event.description && <p className="mt-1 text-xs text-text-secondary">{event.description}</p>}
          {event.tone && (
            <Badge tone={event.tone} className="mt-2">
              {event.title}
            </Badge>
          )}
        </li>
      ))}
    </ol>
  );
}
