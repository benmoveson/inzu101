import { useState, useEffect } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import PropertyCard from '../components/PropertyCard';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';
import { useScrollRestoration } from '../hooks/useScrollRestoration';
import './Favorites.css';

export default function Favorites() {
    const { favorites, isLoading: favoritesLoading, refreshFavorites } = useFavorites();
    const { getToken } = useAuth();
    const [favoriteProperties, setFavoriteProperties] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // Enable scroll position restoration
    useScrollRestoration('favorites-page');

    const loadFavoriteProperties = async () => {
        setIsLoading(true);
        setError('');
        
        try {
            const token = getToken();
            
            if (token) {
                // Fetch favorites from backend for authenticated users
                const res = await fetch('http://localhost:5000/api/favorites', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    setFavoriteProperties(data);
                } else {
                    setError('Failed to load favorites');
                }
            } else {
                // For unauthenticated users, fetch properties and filter by favorites
                if (favorites.length === 0) {
                    setFavoriteProperties([]);
                } else {
                    const res = await fetch('http://localhost:5000/api/properties');
                    const allProperties = await res.json();

                    if (res.ok) {
                        const favProps = allProperties.filter(p => favorites.includes(p._id));
                        setFavoriteProperties(favProps);
                    } else {
                        setError('Failed to load properties');
                    }
                }
            }
        } catch (err) {
            console.error('Error loading favorites:', err);
            setError('Error connecting to server');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadFavoriteProperties();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [favorites]);

    // Refresh favorites when component mounts
    useEffect(() => {
        refreshFavorites();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="favorites-page">
            <div className="container">
                <div className="page-header">
                    <div className="page-header-icon">
                        <Heart size={32} />
                    </div>
                    <div>
                        <h1 className="page-title">My Favorites</h1>
                        <p className="page-subtitle">
                            {favoriteProperties.length} {favoriteProperties.length === 1 ? 'property' : 'properties'} saved
                        </p>
                    </div>
                </div>

                {isLoading || favoritesLoading ? (
                    <div className="loading-grid">
                        <Loader2 className="animate-spin" size={48} />
                        <p>Loading your favorites...</p>
                    </div>
                ) : error ? (
                    <div className="error-state">{error}</div>
                ) : favoriteProperties.length > 0 ? (
                    <div className="properties-grid">
                        {favoriteProperties.map(property => (
                            <PropertyCard 
                                key={property._id} 
                                property={property}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-icon">
                            <Heart size={64} />
                        </div>
                        <h2>No favorites yet</h2>
                        <p>Start exploring and save your favorite properties to view them here</p>
                        <a href="/search" className="btn btn-primary">
                            Browse Properties
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
