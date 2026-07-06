import type { LucideIcon } from 'lucide-react';
import { Construction } from 'lucide-react';
import { EmptyState } from '../components/ui/EmptyState';

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon?: LucideIcon;
}

export function PlaceholderPage({ title, description, icon: Icon = Construction }: PlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-black text-text-primary">{title}</h2>
        <p className="text-xs text-text-secondary">{description}</p>
      </div>
      <EmptyState icon={<Icon size={28} />} title="Em construção" description="Esta seção chega numa próxima etapa do redesign Kairós." />
    </div>
  );
}
