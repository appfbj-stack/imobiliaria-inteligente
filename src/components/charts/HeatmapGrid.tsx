import { SEQUENTIAL } from './theme';

interface HeatmapCell {
  row: string;
  col: string;
  value: number;
}

interface HeatmapGridProps {
  cells: HeatmapCell[];
  rows: string[];
  cols: string[];
}

function colorForRatio(ratio: number) {
  const idx = Math.min(SEQUENTIAL.length - 1, Math.floor(ratio * SEQUENTIAL.length));
  return SEQUENTIAL[idx];
}

/** Sequential (single-hue) intensity grid — e.g. demand by city × property type. */
export function HeatmapGrid({ cells, rows, cols }: HeatmapGridProps) {
  const max = Math.max(1, ...cells.map((c) => c.value));
  const lookup = new Map(cells.map((c) => [`${c.row}__${c.col}`, c.value]));

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate" style={{ borderSpacing: 4 }}>
        <thead>
          <tr>
            <th className="w-28" />
            {cols.map((col) => (
              <th key={col} className="px-1 pb-2 text-center text-[10px] font-medium text-text-secondary">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row}>
              <td className="pr-2 text-right text-[11px] font-medium text-text-secondary">{row}</td>
              {cols.map((col) => {
                const value = lookup.get(`${row}__${col}`) ?? 0;
                const ratio = value / max;
                return (
                  <td key={col} className="p-0">
                    <div
                      title={`${row} · ${col}: ${value}`}
                      className="flex h-9 items-center justify-center rounded-lg text-[10px] font-semibold text-text-primary"
                      style={{ backgroundColor: colorForRatio(ratio) }}
                    >
                      {value > 0 ? value : ''}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
