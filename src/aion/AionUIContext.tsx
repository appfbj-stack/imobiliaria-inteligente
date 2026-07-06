import { createContext, useContext } from 'react';

interface AionUIContextValue {
  openAion: () => void;
}

export const AionUIContext = createContext<AionUIContextValue | null>(null);

export function useAionUI() {
  const ctx = useContext(AionUIContext);
  if (!ctx) throw new Error('useAionUI must be used within AppShell');
  return ctx;
}
