import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Heart, Share2, Bed, Bath, Maximize, Calendar, MapPin,
    Phone, Mail, ChevronLeft, ChevronRight, X, Loader2, Grid, Star, ArrowLeft
} from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext';
import InquiryForm from '../components/InquiryForm';
import PropertyReview from '../components/PropertyReview';
import './PropertyDetails.css';

export default function PropertyDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isFavorite, toggleFavorite } = useFavorites();
    const [property, setProperty] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showLightbox, setShowLightbox] = useState(false);
    const [showAllPhotos, setShowAllPhotos] = useState(false);
    const [showContactForm, setShowContactForm] = useState(false);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/properties/${id}`);
                const data = await res.json();
                if (res.ok) {
                    setProperty(data);
                } else {
                    setError('Property not found');
                }
            } catch (err) {
                setError('Error connecting to server');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProperty();
    }, [id]);

    if (isLoading) {
        return (
            <div className="loading-grid">
                <Loader2 className="animate-spin" size={48} />
                <p>Fetching property details...</p>
            </div>
        );
    }

    if (error || !property) {
        return (
            <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
                <h2>{error || 'Property not found'}</h2>
                <button className="btn btn-primary" onClick={() => navigate('/')}>
                    Back to Home
                </button>
            </div>
        );
    }

    const handleToggleFavorite = () => {
        const propertyId = property._id || property.id;
        toggleFavorite(propertyId);
    };

    // Minimum swipe distance (in px)
    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;
        
        if (isLeftSwipe) {
            nextImage();
        }
        if (isRightSwipe) {
            prevImage();
        }
    };

    const openMap = () => {
        // Check for coordinates in different possible structures
        const lat = property.latitude || property.coordinates?.lat;
        const lng = property.longitude || property.coordinates?.lng;
        
        if (lat && lng) {
            // Open in device's default map app
            const mapUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
            window.open(mapUrl, '_blank');
        } else if (property.location || property.district) {
            // Fallback to location search
            const searchLocation = property.location || property.district;
            const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchLocation)}`;
            window.open(mapUrl, '_blank');
        }
    };

    const nextImage = () => {
        setCurrentImageIndex((prev) =>
            prev === property.images.length - 1 ? 0 : prev + 1
        );
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) =>
            prev === 0 ? property.images.length - 1 : prev - 1
        );
    };

    const formatPrice = (price) => {
        return (price * 3000).toLocaleString() + ' RWF';
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: property.title,
                    text: `Check out this property: ${property.title}`,
                    url: window.location.href,
                });
            } catch (err) {
                console.log('Share failed:', err);
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };

    const handleInquirySuccess = () => {
        setShowSuccessToast(true);
        setTimeout(() => {
            setShowSuccessToast(false);
        }, 3000);
    };

    return (
        <div className="property-details-page">
            {/* Back Button */}
            <div className="container">
                <button className="back-button" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                    <span>Back</span>
                </button>
            </div>
            
            {/* Airbnb-Style Image Grid */}
            <div className="image-grid-section">
                <div className="container">
                    <div className="image-grid">
                        {/* Main large image */}
                        <div className="image-grid-main" onClick={() => { setCurrentImageIndex(0); setShowLightbox(true); }}>
                            <img
                                src={property.images && property.images[0]
                                    ? (typeof property.images[0] === 'string' ? property.images[0] : property.images[0].url)
                                    : 'https://images.unsplash.com/photo-1518780664697-55e3ad937233'}
                                alt={property.title}
                            />
                        </div>
                        
                        {/* 2x2 grid of smaller images */}
                        <div className="image-grid-small">
                            {property.images?.slice(1, 5).map((img, index) => (
                                <div 
                                    key={index} 
                                    className="image-grid-item"
                                    onClick={() => { setCurrentImageIndex(index + 1); setShowLightbox(true); }}
                                >
                                    <img
                                        src={typeof img === 'string' ? img : img.url}
                                        alt={`${property.title} ${index + 2}`}
                                    />
                                    {index === 3 && property.images.length > 5 && (
                                        <button 
                                            className="show-all-photos-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowAllPhotos(true);
                                            }}
                                        >
                                            <Grid size={20} />
                                            Show all photos
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container">
                <div className="property-content">
                    {/* Main Content */}
                    <div className="property-main">
                        {/* Header */}
                        <div className="property-header">
                            <div>
                                <div className="property-badges">
                                    <span className="badge badge-primary">{property.type}</span>
                                    <span className="badge badge-success">{property.status}</span>
                                    {property.featured && (
                                        <span className="badge badge-accent">Featured</span>
                                    )}
                                </div>
                                <h1 className="property-title">{property.title}</h1>
                                <div className="property-location">
                                    <MapPin size={20} />
                                    <span>{property.address || property.sector || ''}{property.address || property.sector ? ', ' : ''}{property.location || property.district}</span>
                                </div>
                                {property.averageRating > 0 && (
                                    <div className="property-rating">
                                        <Star size={16} fill="#ffc107" color="#ffc107" />
                                        <span className="rating-value">{property.averageRating.toFixed(1)}</span>
                                        <span className="rating-count">({property.totalReviews} {property.totalReviews === 1 ? 'review' : 'reviews'})</span>
                                    </div>
                                )}
                            </div>
                            <div className="property-actions">
                                <button
                                    className={`action-btn ${isFavorite(property._id || property.id) ? 'active' : ''}`}
                                    onClick={handleToggleFavorite}
                                >
                                    <Heart size={24} fill={isFavorite(property._id || property.id) ? 'currentColor' : 'none'} />
                                </button>
                                <button className="action-btn" onClick={handleShare}>
                                    <Share2 size={24} />
                                </button>
                            </div>
                        </div>

                        <div className="property-price-section">
                            <div className="price-tag">
                                {property.listingType === 'sale' 
                                    ? `${property.price.toLocaleString()} RWF`
                                    : `${property.price.toLocaleString()} RWF / ${property.rentPeriod || 'month'}`
                                }
                            </div>
                        </div>

                        {/* Key Features */}
                        <div className="key-features">
                            <div className="feature-item">
                                <Bed size={24} />
                                <div>
                                    <div className="feature-value">{property.amenities?.bedrooms?.count || property.bedrooms || 0}</div>
                                    <div className="feature-label">Bedrooms</div>
                                </div>
                            </div>
                            <div className="feature-item">
                                <Bath size={24} />
                                <div>
                                    <div className="feature-value">{property.amenities?.bathrooms?.count || property.bathrooms || 0}</div>
                                    <div className="feature-label">Bathrooms</div>
                                </div>
                            </div>
                            <div className="feature-item">
                                <Calendar size={24} />
                                <div>
                                    <div className="feature-value">{property.yearBuilt || new Date(property.createdAt).getFullYear()}</div>
                                    <div className="feature-label">Year Built</div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="property-section">
                            <h2>About This Property</h2>
                            <p>{property.description}</p>
                        </div>

                        {/* Room Descriptions */}
                        {property.roomDescriptions && property.roomDescriptions.length > 0 && (
                            <div className="property-section">
                                <h2>Room Details</h2>
                                <div className="room-descriptions">
                                    {['bedroom', 'bathroom', 'kitchen', 'living room', 'other'].map((roomType) => {
                                        const roomsOfType = property.roomDescriptions.filter(
                                            (room) => room.type === roomType
                                        );
                                        
                                        if (roomsOfType.length === 0) return null;
                                        
                                        return (
                                            <div key={roomType} className="room-type-section">
                                                <button
                                                    className="room-type-header"
                                                    onClick={() => {
                                                        const section = document.getElementById(`room-${roomType}`);
                                                        if (section) {
                                                            section.classList.toggle('expanded');
                                                        }
                                                    }}
                                                >
                                                    <span className="room-type-title">
                                                        {roomType.charAt(0).toUpperCase() + roomType.slice(1)}
                                                        {roomsOfType.length > 1 && ` (${roomsOfType.length})`}
                                                    </span>
                                                    <ChevronRight className="room-chevron" size={20} />
                                                </button>
                                                <div id={`room-${roomType}`} className="room-descriptions-list">
                                                    {roomsOfType.map((room, index) => (
                                                        <div key={index} className="room-description-item">
                                                            {roomsOfType.length > 1 && (
                                                                <span className="room-number">{roomType.charAt(0).toUpperCase() + roomType.slice(1)} {index + 1}</span>
                                                            )}
                                                            <p>{room.description}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Amenities */}
                        <div className="property-section">
                            <h2>What this place offers</h2>
                            <div className="amenities-grid-airbnb">
                                {property.amenities && typeof property.amenities === 'object' ? (
                                    <>
                                        {property.amenities.kitchen?.available && (
                                            <div className="amenity-item-airbnb">
                                                <span className="amenity-icon-airbnb">🍳</span>
                                                <span>Kitchen {property.amenities.kitchen.equipped ? '(Equipped)' : ''}</span>
                                            </div>
                                        )}
                                        {property.amenities.heating && (
                                            <div className="amenity-item-airbnb">
                                                <span className="amenity-icon-airbnb">🔥</span>
                                                <span>Heating</span>
                                            </div>
                                        )}
                                        {property.amenities.airConditioning && (
                                            <div className="amenity-item-airbnb">
                                                <span className="amenity-icon-airbnb">❄️</span>
                                                <span>Air Conditioning</span>
                                            </div>
                                        )}
                                        {property.amenities.internet && (
                                            <div className="amenity-item-airbnb">
                                                <span className="amenity-icon-airbnb">📶</span>
                                                <span>WiFi</span>
                                            </div>
                                        )}
                                        {property.amenities.water && (
                                            <div className="amenity-item-airbnb">
                                                <span className="amenity-icon-airbnb">💧</span>
                                                <span>Water</span>
                                            </div>
                                        )}
                                        {property.amenities.electricity && (
                                            <div className="amenity-item-airbnb">
                                                <span className="amenity-icon-airbnb">⚡</span>
                                                <span>Electricity</span>
                                            </div>
                                        )}
                                        {property.amenities.laundry && (
                                            <div className="amenity-item-airbnb">
                                                <span className="amenity-icon-airbnb">🧺</span>
                                                <span>Laundry</span>
                                            </div>
                                        )}
                                    </>
                                ) : Array.isArray(property.amenities) ? (
                                    property.amenities.slice(0, 6).map((amenity, index) => (
                                        <div key={index} className="amenity-item-airbnb">
                                            <span className="amenity-icon-airbnb">✓</span>
                                            <span>{amenity}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p>No amenities listed</p>
                                )}
                            </div>
                            {((Array.isArray(property.amenities) && property.amenities.length > 6) || 
                              (property.amenities && typeof property.amenities === 'object' && Object.keys(property.amenities).length > 6)) && (
                                <button className="show-all-amenities-btn">
                                    Show all amenities
                                </button>
                            )}
                        </div>

                        {/* Reviews Section */}
                        <PropertyReview propertyId={property._id || property.id} />
                    </div>

                    {/* Sidebar */}
                    <div className="property-sidebar">
                        <div className="contact-card card">
                            <h3>Contact Agent</h3>
                            <div className="agent-info">
                                <div className="agent-avatar">
                                    {property.landlord?.name?.charAt(0) || property.agent?.name?.charAt(0) || '?'}
                                </div>
                                <div>
                                    <div className="agent-name">{property.landlord?.name || property.agent?.name || 'Inzu Agent'}</div>
                                    <div className="agent-title">Property Owner / Agent</div>
                                </div>
                            </div>

                            <div className="contact-methods">
                                <a href={`tel:${property.landlord?.phone || property.agent?.phone || ''}`} className="contact-method">
                                    <Phone size={20} />
                                    <span>{property.landlord?.phone || property.agent?.phone || 'Call for details'}</span>
                                </a>
                                <a href={`mailto:${property.landlord?.email || property.agent?.email || ''}`} className="contact-method">
                                    <Mail size={20} />
                                    <span>{property.landlord?.email || property.agent?.email || 'Email for details'}</span>
                                </a>
                            </div>

                            <button
                                className="btn btn-primary"
                                style={{ width: '100%' }}
                                onClick={() => setShowContactForm(true)}
                            >
                                Request Information
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Inquiry Form Modal */}
            {showContactForm && (
                <InquiryForm
                    propertyId={property._id || property.id}
                    onClose={() => setShowContactForm(false)}
                    onSuccess={handleInquirySuccess}
                />
            )}

            {/* Success Toast */}
            {showSuccessToast && (
                <div className="success-toast">
                    Message sent successfully!
                </div>
            )}

            {/* Show All Photos Modal */}
            {showAllPhotos && (
                <div className="all-photos-modal" onClick={() => setShowAllPhotos(false)}>
                    <div className="all-photos-header">
                        <button className="close-photos-btn" onClick={() => setShowAllPhotos(false)}>
                            <X size={24} />
                        </button>
                        <h2>All Photos</h2>
                    </div>
                    <div className="all-photos-grid" onClick={(e) => e.stopPropagation()}>
                        {property.images?.map((img, index) => (
                            <img
                                key={index}
                                src={typeof img === 'string' ? img : img.url}
                                alt={`${property.title} ${index + 1}`}
                                onClick={() => {
                                    setCurrentImageIndex(index);
                                    setShowAllPhotos(false);
                                    setShowLightbox(true);
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Lightbox */}
            {showLightbox && (
                <div className="lightbox" onClick={() => setShowLightbox(false)}>
                    <button className="lightbox-close">
                        <X size={32} />
                    </button>
                    <img
                        src={property.images && property.images[currentImageIndex]
                            ? (typeof property.images[currentImageIndex] === 'string' ? property.images[currentImageIndex] : property.images[currentImageIndex].url)
                            : 'https://images.unsplash.com/photo-1518780664697-55e3ad937233'}
                        alt={property.title}
                        onClick={(e) => e.stopPropagation()}
                    />
                    <button className="lightbox-nav prev" onClick={(e) => { e.stopPropagation(); prevImage(); }}>
                        <ChevronLeft size={32} />
                    </button>
                    <button className="lightbox-nav next" onClick={(e) => { e.stopPropagation(); nextImage(); }}>
                        <ChevronRight size={32} />
                    </button>
                </div>
            )}
        </div>
    );
}
