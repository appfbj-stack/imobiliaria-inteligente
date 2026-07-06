import {
  BarChart as RBarChart,
  Bar,
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

interface BarChartProps {
  data: Record<string, string | number>[];
  xKey: string;
  series: SeriesDef[];
  layout?: 'horizontal' | 'vertical';
}

export function BarChart({ data, xKey, series, layout = 'horizontal' }: BarChartProps) {
  const isVertical = layout === 'vertical';
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RBarChart data={data} layout={layout} margin={{ top: 8, right: 12, bottom: 0, left: isVertical ? 24 : -12 }}>
        <CartesianGrid stroke={CHART_CHROME.grid} horizontal={!isVertical} vertical={isVertical} />
        {isVertical ? (
          <>
            <XAxis type="number" tick={axisTickStyle} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey={xKey} tick={axisTickStyle} axisLine={false} tickLine={false} width={90} />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} tick={axisTickStyle} axisLine={{ stroke: CHART_CHROME.axis }} tickLine={false} />
            <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} />
          </>
        )}
        <Tooltip contentStyle={tooltipContentStyle} labelStyle={tooltipLabelStyle} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
        {series.length > 1 && <Legend wrapperStyle={{ fontSize: 12, color: CHART_CHROME.axisText }} />}
        {series.map((s, i) => (
          <Bar key={s.key} dataKey={s.key} name={s.label} fill={CATEGORICAL[i % CATEGORICAL.length]} radius={[4, 4, 4, 4]} maxBarSize={28} />
        ))}
      </RBarChart>
    </ResponsiveContainer>
  );
}
