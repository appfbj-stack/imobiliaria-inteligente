import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './Card';

interface ChartCardProps {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
  height?: number;
}

export function ChartCard({ title, actions, children, height = 280 }: ChartCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {actions}
      </CardHeader>
      <CardContent>
        <div style={{ height }}>{children}</div>
      </CardContent>
    </Card>
  );
}
