import { useCallback, useEffect, useState } from 'react';

export interface FavoriteItem {
  id: string;
  label: string;
  path: string;
}

const STORAGE_KEY = 'kairos.favorites';

function readStoredFavorites(): FavoriteItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as FavoriteItem[]) : [];
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>(readStoredFavorites);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const isFavorite = useCallback((id: string) => favorites.some((f) => f.id === id), [favorites]);

  const toggleFavorite = useCallback((item: FavoriteItem) => {
    setFavorites((prev) => (prev.some((f) => f.id === item.id) ? prev.filter((f) => f.id !== item.id) : [item, ...prev].slice(0, 12)));
  }, []);

  return { favorites, isFavorite, toggleFavorite };
}
