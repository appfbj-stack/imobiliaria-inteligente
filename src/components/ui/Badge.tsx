import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'demo';

const toneClasses: Record<Tone, string> = {
  success: 'bg-success/15 text-success border-success/30',
  warning: 'bg-warning/15 text-warning border-warning/30',
  danger: 'bg-danger/15 text-danger border-danger/30',
  info: 'bg-primary/15 text-primary border-primary/30',
  neutral: 'bg-surface-hover text-text-secondary border-border',
  demo: 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-400/30',
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ className, tone = 'neutral', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
