import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Wifi, Zap, Bed, MapPin } from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';
import './PropertyCard.css';

export default function PropertyCard({ property }) {
    const { isFavorite, toggleFavorite } = useFavorites();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [shouldLoadImage, setShouldLoadImage] = useState(false);
    const imageRef = useRef(null);
    const propertyId = property._id || property.id;

    // Lazy loading with Intersection Observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setShouldLoadImage(true);
                        observer.disconnect();
                    }
                });
            },
            {
                rootMargin: '50px',
            }
        );

        if (imageRef.current) {
            observer.observe(imageRef.current);
        }

        return () => {
            if (imageRef.current) {
                observer.unobserve(imageRef.current);
            }
        };
    }, []);

    const handleToggleFavorite = (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(propertyId);
    };

    const imageUrl = property.images && property.images[0]
        ? (typeof property.images[0] === 'string' ? property.images[0] : property.images[0].url)
        : 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=800';

    // Get bedroom count from amenities
    const bedroomCount = property.amenities?.bedrooms?.count || 
                        property.amenities?.bedrooms || 
                        property.bedrooms || 
                        0;
    
    // Get bathroom count
    const bathroomCount = property.amenities?.bathrooms?.count || 
                         property.amenities?.bathrooms || 
                         property.bathrooms || 
                         0;
    
    // Check amenities
    const hasWifi = property.amenities?.internet === true || 
                   property.amenities?.internet === 'true' ||
                   property.amenities?.internet === 1;
                   
    const hasElectricity = property.amenities?.electricity === true || 
                          property.amenities?.electricity === 'true' ||
                          property.amenities?.electricity === 1;

    // Format price based on listing type
    const formatPrice = () => {
        if (property.listingType === 'sale') {
            return `${property.price.toLocaleString()} RWF`;
        } else {
            const period = property.rentPeriod === 'night' ? 'night' : 'month';
            return `${property.price.toLocaleString()} RWF / ${period}`;
        }
    };

    return (
        <Link to={`/property/${propertyId}`} className="property-card">
            <div className="property-card-image-container" ref={imageRef}>
                {shouldLoadImage ? (
                    <img 
                        src={imageUrl} 
                        alt={property.title}
                        onLoad={() => setIsImageLoaded(true)}
                        className={`property-card-image ${isImageLoaded ? 'loaded' : 'loading'}`}
                    />
                ) : (
                    <div className="property-card-image loading"></div>
                )}
                <button
                    className={`property-card-favorite-btn ${isFavorite(propertyId) ? 'favorited' : ''}`}
                    onClick={handleToggleFavorite}
                    title="Add to favorites"
                >
                    <Heart size={20} fill={isFavorite(propertyId) ? 'currentColor' : 'none'} />
                </button>
            </div>

            <div className="property-card-content">
                <div className="property-card-header">
                    <h3 className="property-card-title">{property.title || 'Beautiful Property'}</h3>
                    <span className="property-card-price">{formatPrice()}</span>
                </div>
                
                <div className="property-card-location">
                    <MapPin size={14} />
                    <span>{property.district || property.location || 'Rwanda'}</span>
                </div>
                
                <span className="property-card-type">{property.type}</span>
                
                {(bedroomCount > 0 || bathroomCount > 0 || hasWifi || hasElectricity) && (
                    <div className="property-card-meta">
                        {bedroomCount > 0 && (
                            <div className="property-card-meta-item">
                                <Bed size={16} />
                                <span>{bedroomCount} bed{bedroomCount > 1 ? 's' : ''}</span>
                            </div>
                        )}
                        {bathroomCount > 0 && (
                            <div className="property-card-meta-item">
                                <span>{bathroomCount} bath{bathroomCount > 1 ? 's' : ''}</span>
                            </div>
                        )}
                        {hasWifi && (
                            <div className="property-card-meta-item">
                                <Wifi size={16} />
                            </div>
                        )}
                        {hasElectricity && (
                            <div className="property-card-meta-item">
                                <Zap size={16} />
                            </div>
                        )}
                    </div>
                )}
                
                {property.averageRating > 0 && (
                    <div className="property-card-rating">
                        <span className="property-card-rating-stars">★</span>
                        <span>{property.averageRating.toFixed(1)}</span>
                        <span>({property.totalReviews})</span>
                    </div>
                )}
            </div>
        </Link>
    );
}
