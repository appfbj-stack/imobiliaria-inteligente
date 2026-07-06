import { useEffect, useRef, useState } from 'react';
import { Bot, Send } from 'lucide-react';
import { Drawer } from '../components/ui/Drawer';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAion } from './useAion';
import { AionMessage } from './AionMessage';

const SUGGESTIONS = [
  'Quem faz aniversário hoje?',
  'Quais contratos vencem nos próximos 30 dias?',
  'Quais clientes estão sem contato há mais de 60 dias?',
  'Mostre os imóveis acima de R$ 1 milhão',
  'Liste imóveis com piscina em Sorocaba',
  'Qual corretor vendeu mais este mês?',
];

interface AionPanelProps {
  open: boolean;
  onClose: () => void;
}

export function AionPanel({ open, onClose }: AionPanelProps) {
  const { messages, ask, loading } = useAion();
  const [query, setQuery] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const submit = (value: string) => {
    if (!value.trim() || loading) return;
    ask(value);
    setQuery('');
  };

  return (
    <Drawer open={open} onClose={onClose} title="Aion" widthClassName="max-w-md">
      <div className="flex h-full flex-col">
        <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto pb-4">
          {messages.map((m) => (
            <AionMessage key={m.id} message={m} />
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <Bot size={14} className="text-primary" />
              <span className="flex gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" style={{ animationDelay: '0ms' }} />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" style={{ animationDelay: '150ms' }} />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" style={{ animationDelay: '300ms' }} />
              </span>
            </div>
          )}
        </div>

        {messages.length <= 1 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => submit(s)}
                className="rounded-full border border-border px-2.5 py-1 text-[10px] text-text-secondary hover:border-primary/40 hover:text-primary"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(query);
          }}
          className="flex items-center gap-2 border-t border-border pt-3"
        >
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pergunte ao Aion..."
            className="flex-1"
            disabled={loading}
          />
          <Button type="submit" size="icon" disabled={loading || !query.trim()}>
            <Send size={15} />
          </Button>
        </form>
      </div>
    </Drawer>
  );
}
