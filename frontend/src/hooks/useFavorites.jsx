import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { addFavorite, isFavorite, removeFavorite, subscribeToFavorites } from '../services/favoritesService';

const FavoritesContext = createContext(null);

export const FavoritesProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [loading, setLoading] = useState(Boolean(user));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.uid) {
      setFavoriteIds([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    const unsubscribe = subscribeToFavorites(user.uid, (ids) => {
      setFavoriteIds(ids);
      setLoading(false);
    }, (snapshotError) => {
      console.error('Error leyendo favoritos:', snapshotError);
      setError(snapshotError);
      setLoading(false);
    });
    return unsubscribe;
  }, [user?.uid]);

  const toggleFavorite = useCallback(async (productId) => {
    if (!user?.uid || !productId) return;
    const currentlyFavorite = isFavorite(favoriteIds, productId);
    setError(null);
    try {
      if (currentlyFavorite) await removeFavorite(user.uid, productId);
      else await addFavorite(user.uid, productId);
    } catch (toggleError) {
      console.error('Error actualizando favorito:', toggleError);
      setError(toggleError);
      throw toggleError;
    }
  }, [favoriteIds, user?.uid]);

  return <FavoritesContext.Provider value={{ favoriteIds, loading, error, isFavorite: (productId) => isFavorite(favoriteIds, productId), toggleFavorite }}>{children}</FavoritesContext.Provider>;
};

export const useFavorites = () => useContext(FavoritesContext) || {
  favoriteIds: [], loading: false, error: null, isFavorite: () => false, toggleFavorite: async () => {},
};
