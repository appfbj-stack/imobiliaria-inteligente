import { Bot, User } from 'lucide-react';
import type { AionMessage as AionMessageType } from './useAion';
import { Button } from '../components/ui/Button';

/** Compact key/value list, sized for the narrow Aion drawer — the full
 * Table component's 640px min-width would force horizontal scrolling here. */
function AionTableView({ table }: { table: NonNullable<AionMessageType['response']>['table'] }) {
  if (!table) return null;
  return (
    <div className="space-y-1.5 rounded-xl border border-border bg-surface/60 p-2">
      {table.rows.map((row, i) => (
        <div key={i} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5 rounded-lg px-2 py-1.5 odd:bg-surface-hover/40">
          {table.columns.map((col) => (
            <span key={col.key} className="text-[11px] text-text-primary">
              <span className="text-text-secondary">{col.header}: </span>
              {col.render(row)}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

export function AionMessage({ message }: { message: AionMessageType }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
          isUser ? 'bg-surface-hover text-text-secondary' : 'bg-primary/15 text-primary'
        }`}
      >
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>
      <div className={`max-w-[85%] space-y-2 ${isUser ? 'items-end text-right' : ''}`}>
        <div
          className={`whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
            isUser ? 'bg-primary text-[#04121a]' : 'border border-border bg-surface-hover/70 text-text-primary'
          }`}
        >
          {message.text ?? message.response?.text}
        </div>

        {message.response?.table && (
          <div className="text-left">
            <AionTableView table={message.response.table} />
          </div>
        )}

        {message.response?.actions && (
          <div className="flex flex-wrap gap-2">
            {message.response.actions.map((action) => (
              <Button key={action.label} size="sm" onClick={() => action.run()}>
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
