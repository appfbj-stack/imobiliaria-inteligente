import {
  AreaChart as RAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { axisTickStyle, CATEGORICAL, CHART_CHROME, tooltipContentStyle, tooltipLabelStyle } from './theme';

interface SeriesDef {
  key: string;
  label: string;
}

interface AreaChartProps {
  data: Record<string, string | number>[];
  xKey: string;
  series: SeriesDef[];
  stacked?: boolean;
}

export function AreaChart({ data, xKey, series, stacked = false }: AreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RAreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
        <defs>
          {series.map((s, i) => (
            <linearGradient key={s.key} id={`area-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CATEGORICAL[i % CATEGORICAL.length]} stopOpacity={0.4} />
              <stop offset="100%" stopColor={CATEGORICAL[i % CATEGORICAL.length]} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid stroke={CHART_CHROME.grid} vertical={false} />
        <XAxis dataKey={xKey} tick={axisTickStyle} axisLine={{ stroke: CHART_CHROME.axis }} tickLine={false} />
        <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipContentStyle} labelStyle={tooltipLabelStyle} />
        {series.length > 1 && <Legend wrapperStyle={{ fontSize: 12, color: CHART_CHROME.axisText }} />}
        {series.map((s, i) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stackId={stacked ? '1' : undefined}
            stroke={CATEGORICAL[i % CATEGORICAL.length]}
            strokeWidth={2}
            fill={`url(#area-${s.key})`}
          />
        ))}
      </RAreaChart>
    </ResponsiveContainer>
  );
}
