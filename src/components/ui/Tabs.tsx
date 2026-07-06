import { cn } from '../../lib/cn';

interface TabsProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  items: { value: T; label: string; count?: number }[];
}

export function Tabs<T extends string>({ value, onChange, items }: TabsProps<T>) {
  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-border bg-surface-hover/60 p-1">
      {items.map((item) => (
        <button
          key={item.value}
          onClick={() => onChange(item.value)}
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors',
            value === item.value
              ? 'bg-primary text-[#04121a] shadow-glow-sm'
              : 'text-text-secondary hover:text-text-primary',
          )}
        >
          {item.label}
          {item.count !== undefined && (
            <span
              className={cn(
                'rounded-full px-1.5 text-xs',
                value === item.value ? 'bg-black/15' : 'bg-surface-hover',
              )}
            >
              {item.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
