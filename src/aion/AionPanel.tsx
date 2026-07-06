import { Bot } from 'lucide-react';
import { Drawer } from '../components/ui/Drawer';

interface AionPanelProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Placeholder shell for the Aion assistant panel. Full chat + intents
 * land in a later phase; this keeps the "Aion" trigger wired end-to-end
 * from the Topbar so navigation never dead-ends during the redesign.
 */
export function AionPanel({ open, onClose }: AionPanelProps) {
  return (
    <Drawer open={open} onClose={onClose} title="Aion" widthClassName="max-w-md">
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-text-secondary">
        <div className="rounded-2xl bg-primary/10 p-4 text-primary">
          <Bot size={28} />
        </div>
        <p className="text-sm font-semibold text-text-primary">Aion está aprendendo o negócio</p>
        <p className="max-w-xs text-xs">
          O consultor de IA da Kairós será conectado nesta fase do redesign — em breve ele vai responder perguntas
          sobre imóveis, clientes, contratos e oportunidades diretamente por aqui.
        </p>
      </div>
    </Drawer>
  );
}
