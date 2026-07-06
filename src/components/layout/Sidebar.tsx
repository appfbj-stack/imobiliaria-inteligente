import { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronsLeft, ChevronsRight, Search, Star, X } from 'lucide-react';
import { NAV_GROUPS, NAV_ITEMS } from '../../config/navigation';
import { useFavorites } from '../../state/useFavorites';
import { cn } from '../../lib/cn';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile }: SidebarProps) {
  const [query, setQuery] = useState('');
  const { favorites } = useFavorites();

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return NAV_GROUPS.map((group) => ({
      group,
      items: NAV_ITEMS.filter((item) => item.group === group && (!q || item.label.toLowerCase().includes(q))),
    })).filter((g) => g.items.length > 0);
  }, [query]);

  return (
    <>
      {mobileOpen && (
        <div onClick={onCloseMobile} className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden" />
      )}
      <aside
        className={cn(
          'fixed md:relative z-50 inset-y-0 left-0 flex h-full w-72 shrink-0 flex-col border-r border-border bg-surface transition-transform duration-200 md:transition-[width]',
          collapsed ? 'md:w-[76px]' : 'md:w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        )}
      >
        <div className="flex items-center justify-between gap-2 border-b border-border p-4">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary font-black text-[#04121a] shadow-glow-sm">
              K
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="truncate text-sm font-bold leading-none text-text-primary">Kairós</p>
                <p className="truncate text-[10px] uppercase tracking-wider text-text-secondary">Imobiliária</p>
              </div>
            )}
          </div>
          <button
            onClick={onToggleCollapse}
            className="hidden shrink-0 rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary md:flex"
            aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
          </button>
          <button
            onClick={onCloseMobile}
            className="shrink-0 rounded-lg p-1.5 text-text-secondary hover:bg-surface-hover md:hidden"
            aria-label="Fechar menu"
          >
            <X size={16} />
          </button>
        </div>

        {!collapsed && (
          <div className="p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={14} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar no menu..."
                className="w-full rounded-lg border border-border bg-surface-hover py-2 pl-8 pr-3 text-xs text-text-primary placeholder:text-text-secondary focus:border-primary/50 focus:outline-none"
              />
            </div>
          </div>
        )}

        {!collapsed && favorites.length > 0 && (
          <div className="px-3 pb-2">
            <p className="flex items-center gap-1 px-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-text-secondary">
              <Star size={10} /> Favoritos
            </p>
            <div className="space-y-0.5">
              {favorites.map((f) => (
                <NavLink
                  key={f.id}
                  to={f.path}
                  className={({ isActive }) =>
                    cn(
                      'block truncate rounded-lg px-3 py-1.5 text-xs text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary',
                      isActive && 'text-primary',
                    )
                  }
                >
                  {f.label}
                </NavLink>
              ))}
            </div>
          </div>
        )}

        <nav className="flex-1 space-y-4 overflow-y-auto px-3 pb-4">
          {filteredGroups.map(({ group, items }) => (
            <div key={group}>
              {!collapsed && (
                <p className="px-2 pb-1 pt-1 text-[10px] font-bold uppercase tracking-widest text-text-secondary">{group}</p>
              )}
              <div className="space-y-0.5">
                {items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.id}
                      to={item.path}
                      end={item.path === '/'}
                      onClick={onCloseMobile}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors',
                          collapsed && 'justify-center px-0',
                          isActive
                            ? 'border-primary/30 bg-primary/10 text-primary shadow-glow-sm'
                            : 'border-transparent text-text-secondary hover:bg-surface-hover hover:text-text-primary',
                        )
                      }
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon size={18} className="shrink-0" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
