import {
  RadarChart as RRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { axisTickStyle, CATEGORICAL, CHART_CHROME, tooltipContentStyle } from './theme';

interface SeriesDef {
  key: string;
  label: string;
}

interface RadarChartProps {
  data: Record<string, string | number>[];
  angleKey: string;
  series: SeriesDef[];
}

export function RadarChart({ data, angleKey, series }: RadarChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RRadarChart data={data}>
        <PolarGrid stroke={CHART_CHROME.grid} />
        <PolarAngleAxis dataKey={angleKey} tick={axisTickStyle} />
        <PolarRadiusAxis tick={axisTickStyle} axisLine={false} />
        <Tooltip contentStyle={tooltipContentStyle} />
        {series.length > 1 && <Legend wrapperStyle={{ fontSize: 12, color: CHART_CHROME.axisText }} />}
        {series.map((s, i) => (
          <Radar
            key={s.key}
            name={s.label}
            dataKey={s.key}
            stroke={CATEGORICAL[i % CATEGORICAL.length]}
            fill={CATEGORICAL[i % CATEGORICAL.length]}
            fillOpacity={0.25}
          />
        ))}
      </RRadarChart>
    </ResponsiveContainer>
  );
}
