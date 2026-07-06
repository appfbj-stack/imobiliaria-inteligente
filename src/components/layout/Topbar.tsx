import { type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Sparkles, X, Bot } from 'lucide-react';
import { useRealData } from '../../state/RealDataContext';
import { Avatar } from '../ui/Avatar';

interface TopbarProps {
  title: string;
  onOpenMobileMenu: () => void;
  onOpenAion: () => void;
}

export function Topbar({ title, onOpenMobileMenu, onOpenAion }: TopbarProps) {
  const navigate = useNavigate();
  const { aiQuery, setAiQuery, aiSearching, aiMatchedIds, submitAiSearch, clearAiSearch } = useRealData();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await submitAiSearch(aiQuery);
    navigate('/imoveis');
  };

  return (
    <header className="flex h-auto shrink-0 flex-col gap-3 border-b border-border bg-surface/60 px-4 py-3 backdrop-blur md:h-20 md:flex-row md:items-center md:justify-between md:gap-4 md:px-8 md:py-0">
      <div className="flex w-full items-center justify-between gap-3 md:w-auto">
        <button
          onClick={onOpenMobileMenu}
          className="rounded-xl border border-border p-2.5 text-text-secondary hover:text-text-primary md:hidden"
          aria-label="Abrir menu"
        >
          <Menu size={16} />
        </button>
        <h1 className="text-sm font-bold text-text-primary md:hidden">{title}</h1>
        <div className="w-8 md:hidden" />
      </div>

      <h1 className="hidden text-base font-bold text-text-primary md:block">{title}</h1>

      <form onSubmit={handleSubmit} className="relative w-full md:w-md">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2">
          {aiSearching ? (
            <span className="block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          ) : (
            <Sparkles className="h-4 w-4 text-primary" />
          )}
        </span>
        <input
          id="ai-phrase-input"
          type="text"
          placeholder="Busca por IA: 'casas no Centro até 450 mil com 3 quartos'"
          value={aiQuery}
          onChange={(e) => setAiQuery(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface-hover py-2.5 pl-10 pr-24 text-xs text-text-primary placeholder:text-text-secondary focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
          {aiMatchedIds !== null && (
            <button
              type="button"
              onClick={clearAiSearch}
              className="rounded-md p-1 text-text-secondary hover:bg-surface hover:text-text-primary"
              title="Limpar filtro de IA"
            >
              <X className="h-3 w-3" />
            </button>
          )}
          <button
            type="submit"
            className="rounded-lg bg-primary px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#04121a] shadow-glow-sm"
          >
            Pesquisar
          </button>
        </div>
      </form>

      <div className="flex items-center justify-end gap-3">
        <button
          onClick={onOpenAion}
          className="flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3.5 py-2 text-xs font-bold text-primary transition-colors hover:bg-primary/20"
        >
          <Bot size={15} /> Aion
        </button>
        <Avatar name="Ricardo Corretor" size="sm" />
      </div>
    </header>
  );
}
