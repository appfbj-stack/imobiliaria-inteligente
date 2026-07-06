import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CATEGORICAL, CHART_CHROME, tooltipContentStyle } from './theme';

interface DonutChartProps {
  data: { name: string; value: number }[];
}

export function DonutChart({ data }: DonutChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius="60%" outerRadius="85%" paddingAngle={2} stroke="none">
          {data.map((_, i) => (
            <Cell key={i} fill={CATEGORICAL[i % CATEGORICAL.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipContentStyle} />
        <Legend wrapperStyle={{ fontSize: 12, color: CHART_CHROME.axisText }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
