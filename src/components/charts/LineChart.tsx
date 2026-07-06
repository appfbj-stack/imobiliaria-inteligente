import {
  LineChart as RLineChart,
  Line,
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

interface LineChartProps {
  data: Record<string, string | number>[];
  xKey: string;
  series: SeriesDef[];
}

export function LineChart({ data, xKey, series }: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RLineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
        <CartesianGrid stroke={CHART_CHROME.grid} vertical={false} />
        <XAxis dataKey={xKey} tick={axisTickStyle} axisLine={{ stroke: CHART_CHROME.axis }} tickLine={false} />
        <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipContentStyle} labelStyle={tooltipLabelStyle} />
        {series.length > 1 && <Legend wrapperStyle={{ fontSize: 12, color: CHART_CHROME.axisText }} />}
        {series.map((s, i) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={CATEGORICAL[i % CATEGORICAL.length]}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        ))}
      </RLineChart>
    </ResponsiveContainer>
  );
}
