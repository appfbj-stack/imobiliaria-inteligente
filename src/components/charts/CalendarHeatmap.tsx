import { SEQUENTIAL } from './theme';

interface CalendarHeatmapProps {
  year: number;
  month: number; // 0-11
  counts: Record<string, number>;
  onDayClick?: (isoDate: string) => void;
}

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

function colorForRatio(ratio: number) {
  if (ratio <= 0) return 'transparent';
  const idx = Math.min(SEQUENTIAL.length - 1, Math.max(1, Math.ceil(ratio * (SEQUENTIAL.length - 1))));
  return SEQUENTIAL[idx];
}

/** Month grid with per-day intensity — visits/visits scheduled, agenda density, etc. */
export function CalendarHeatmap({ year, month, counts, onDayClick }: CalendarHeatmapProps) {
  const firstDay = new Date(Date.UTC(year, month, 1));
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const startWeekday = firstDay.getUTCDay();
  const max = Math.max(1, ...Object.values(counts));
  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10);

  const cells: (string | null)[] = [
    ...Array.from({ length: startWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => {
      const d = String(i + 1).padStart(2, '0');
      const m = String(month + 1).padStart(2, '0');
      return `${year}-${m}-${d}`;
    }),
  ];

  return (
    <div>
      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase text-text-secondary">
        {WEEKDAYS.map((w, i) => (
          <span key={i}>{w}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((iso, i) => {
          if (!iso) return <div key={i} />;
          const count = counts[iso] ?? 0;
          const ratio = count / max;
          const isToday = iso === todayIso;
          return (
            <button
              key={iso}
              onClick={() => onDayClick?.(iso)}
              title={`${iso}: ${count} evento(s)`}
              className={`flex aspect-square items-center justify-center rounded-lg border text-[11px] font-medium transition-colors ${
                isToday ? 'border-primary text-primary' : 'border-transparent text-text-secondary'
              }`}
              style={{ backgroundColor: colorForRatio(ratio) }}
            >
              {Number(iso.slice(-2))}
            </button>
          );
        })}
      </div>
    </div>
  );
}
