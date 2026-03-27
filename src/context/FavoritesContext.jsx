import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { authenticatedRequest, ApiError } from '../utils/api';

const FavoritesContext = createContext();

const PENDING_ACTIONS_KEY = 'favorites_pending_actions';

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error('useFavorites must be used within FavoritesProvider');
    }
    return context;
};

export const FavoritesProvider = ({ children }) => {
    const { user, isAuthenticated, getToken } = useAuth();
    const [favorites, setFavorites] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    // Load favorites from backend when user is authenticated
    useEffect(() => {
        if (isAuthenticated()) {
            fetchFavorites();
        } else {
            // Load from localStorage for unauthenticated users
            const localFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
            setFavorites(localFavorites);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const fetchFavorites = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await authenticatedRequest('http://localhost:5000/api/favorites');
            const favoriteIds = data.map(fav => fav._id || fav);
            setFavorites(favoriteIds);
            localStorage.setItem('favorites', JSON.stringify(favoriteIds));
        } catch (error) {
            console.error('Error fetching favorites:', error);
            // Load from localStorage as fallback
            const localFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
            setFavorites(localFavorites);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getPendingActions = () => {
        return JSON.parse(localStorage.getItem(PENDING_ACTIONS_KEY) || '[]');
    };

    const addPendingAction = (action) => {
        const pending = getPendingActions();
        pending.push(action);
        localStorage.setItem(PENDING_ACTIONS_KEY, JSON.stringify(pending));
    };

    const clearPendingActions = () => {
        localStorage.removeItem(PENDING_ACTIONS_KEY);
    };

    const syncPendingActions = useCallback(async () => {
        if (!isAuthenticated()) return;

        const pending = getPendingActions();
        if (pending.length === 0) return;
        
        for (const action of pending) {
            try {
                if (action.type === 'add') {
                    await authenticatedRequest(`http://localhost:5000/api/favorites/${action.propertyId}`, {
                        method: 'POST'
                    });
                } else if (action.type === 'remove') {
                    await authenticatedRequest(`http://localhost:5000/api/favorites/${action.propertyId}`, {
                        method: 'DELETE'
                    });
                }
            } catch (error) {
                console.error('Error syncing action:', error);
            }
        }

        clearPendingActions();
        // Refresh favorites after sync
        await fetchFavorites();
    }, [isAuthenticated, fetchFavorites]);

    // Monitor online/offline status
    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            syncPendingActions();
        };
        
        const handleOffline = () => {
            setIsOnline(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [syncPendingActions]);

    const isFavorite = (propertyId) => {
        return favorites.includes(propertyId);
    };

    const addFavorite = async (propertyId) => {
        // Optimistic update
        const newFavorites = [...favorites, propertyId];
        setFavorites(newFavorites);
        localStorage.setItem('favorites', JSON.stringify(newFavorites));

        if (isAuthenticated()) {
            if (!isOnline) {
                // Queue action for later sync
                addPendingAction({ type: 'add', propertyId });
                return;
            }

            try {
                await authenticatedRequest(`http://localhost:5000/api/favorites/${propertyId}`, {
                    method: 'POST'
                });
            } catch (error) {
                // If offline or error, queue for sync
                if (!navigator.onLine) {
                    addPendingAction({ type: 'add', propertyId });
                } else {
                    // Rollback on error
                    setFavorites(prev => prev.filter(id => id !== propertyId));
                    localStorage.setItem('favorites', JSON.stringify(favorites));
                    console.error('Error adding favorite:', error);
                }
            }
        }
    };

    const removeFavorite = async (propertyId) => {
        // Optimistic update
        const newFavorites = favorites.filter(id => id !== propertyId);
        setFavorites(newFavorites);
        localStorage.setItem('favorites', JSON.stringify(newFavorites));

        if (isAuthenticated()) {
            if (!isOnline) {
                // Queue action for later sync
                addPendingAction({ type: 'remove', propertyId });
                return;
            }

            try {
                await authenticatedRequest(`http://localhost:5000/api/favorites/${propertyId}`, {
                    method: 'DELETE'
                });
            } catch (error) {
                // If offline or error, queue for sync
                if (!navigator.onLine) {
                    addPendingAction({ type: 'remove', propertyId });
                } else {
                    // Rollback on error
                    setFavorites(prev => [...prev, propertyId]);
                    localStorage.setItem('favorites', JSON.stringify([...favorites, propertyId]));
                    console.error('Error removing favorite:', error);
                }
            }
        }
    };

    const toggleFavorite = async (propertyId) => {
        if (isFavorite(propertyId)) {
            await removeFavorite(propertyId);
        } else {
            await addFavorite(propertyId);
        }
    };

    const value = {
        favorites,
        isLoading,
        isFavorite,
        addFavorite,
        removeFavorite,
        toggleFavorite,
        refreshFavorites: fetchFavorites,
        isOnline
    };

    return (
        <FavoritesContext.Provider value={value}>
            {children}
        </FavoritesContext.Provider>
    );
};
