import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, DollarSign, Navigation, Plus, Loader2 } from 'lucide-react';
import PropertyCard from '../components/PropertyCard';
import SearchFilter from '../components/SearchFilter';
import ErrorMessage from '../components/ErrorMessage';
import { SkeletonGrid } from '../components/SkeletonLoader';
import LocationTracker from '../components/LocationTracker';
import { useScrollRestoration } from '../hooks/useScrollRestoration';
import { useWebSocket } from '../context/WebSocketContext';
import { apiRequest, ApiError } from '../utils/api';
import './Home.css';

export default function Home({ categoryFilter = 'rent', propertyTypeFilter = 'all' }) {
    const [filters, setFilters] = useState({});
    const [showWhereDropdown, setShowWhereDropdown] = useState(false);
    const [priceRange, setPriceRange] = useState('any');
    const [backendProperties, setBackendProperties] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [userLocation, setUserLocation] = useState(null);
    const [userDistrict, setUserDistrict] = useState(null);
    const [locationPermission, setLocationPermission] = useState('prompt');
    const observerRef = useRef(null);
    const lastPropertyRef = useRef(null);
    const { socket, isConnected } = useWebSocket();

    // Enable scroll position restoration
    useScrollRestoration('home-feed');

    // Update filters when category or property type changes
    useEffect(() => {
        const newFilters = {
            listingType: categoryFilter === 'buy' ? 'sale' : 'rent'
        };
        
        // Only add type filter if it's not 'all'
        if (propertyTypeFilter !== 'all') {
            newFilters.type = propertyTypeFilter;
        }
        
        setFilters(newFilters);
    }, [categoryFilter, propertyTypeFilter]);

    // Request geolocation permission
    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                    setLocationPermission('granted');
                },
                (error) => {
                    console.log('Location permission denied or unavailable');
                    setLocationPermission('denied');
                }
            );
        }
    }, []);

    // Fetch properties with pagination and geolocation
    const fetchProperties = useCallback(async (pageNum = 1, reset = false) => {
        if (pageNum === 1) {
            setIsLoading(true);
        } else {
            setIsLoadingMore(true);
        }
        setError('');

        try {
            const params = new URLSearchParams({
                page: pageNum,
                limit: 10
            });

            // Add location filter
            if (filters.location) {
                params.append('location', filters.location);
            }

            // Add district filter (for "Near me" functionality)
            if (filters.district) {
                params.append('district', filters.district);
            }

            // Add property type filter
            if (filters.type) {
                params.append('type', filters.type);
            }

            // Add listing type filter (rent/buy)
            if (filters.listingType) {
                params.append('listingType', filters.listingType);
            }

            // Add price filters
            if (filters.minPrice) {
                params.append('minPrice', filters.minPrice);
            }
            if (filters.maxPrice) {
                params.append('maxPrice', filters.maxPrice);
            }

            // Add bedroom filter
            if (filters.bedrooms) {
                const bedroomValue = filters.bedrooms === '5+' ? 5 : filters.bedrooms;
                params.append('bedrooms', bedroomValue);
            }

            // Add bathroom filter
            if (filters.bathrooms) {
                const bathroomValue = filters.bathrooms === '4+' ? 4 : filters.bathrooms;
                params.append('bathrooms', bathroomValue);
            }

            // Add geolocation for sorting
            if (userLocation) {
                params.append('latitude', userLocation.latitude);
                params.append('longitude', userLocation.longitude);
            }

            const data = await apiRequest(`http://localhost:5000/api/properties?${params}`);
            
            if (reset || pageNum === 1) {
                setBackendProperties(data.properties || data);
            } else {
                setBackendProperties(prev => [...prev, ...(data.properties || data)]);
            }
            setHasMore(data.hasMore !== undefined ? data.hasMore : true);
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }, [filters, userLocation]);

    // Initial load and filter changes
    useEffect(() => {
        setPage(1);
        fetchProperties(1, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

    // Infinite scroll observer
    useEffect(() => {
        if (isLoading || isLoadingMore || !hasMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore) {
                    setPage(prev => prev + 1);
                }
            },
            { threshold: 0.1 }
        );

        if (lastPropertyRef.current) {
            observer.observe(lastPropertyRef.current);
        }

        return () => {
            if (lastPropertyRef.current) {
                observer.unobserve(lastPropertyRef.current);
            }
        };
    }, [isLoading, isLoadingMore, hasMore]);

    // Load more when page changes
    useEffect(() => {
        if (page > 1) {
            fetchProperties(page, false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    // Listen for real-time property updates
    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleNewProperty = (property) => {
            console.log('New property received:', property);
            // Check if property matches current filters
            const matchesFilters = 
                (!filters.listingType || property.listingType === filters.listingType) &&
                (!filters.type || property.type === filters.type) &&
                (!filters.district || property.district === filters.district);

            if (matchesFilters) {
                setBackendProperties(prev => [property, ...prev]);
            }
        };

        const handlePropertyUpdated = (property) => {
            console.log('Property updated:', property);
            setBackendProperties(prev => 
                prev.map(p => p._id === property._id ? property : p)
            );
        };

        socket.on('new_property', handleNewProperty);
        socket.on('property_updated', handlePropertyUpdated);

        return () => {
            socket.off('new_property', handleNewProperty);
            socket.off('property_updated', handlePropertyUpdated);
        };
    }, [socket, isConnected, filters]);

    // Listen for polling updates (fallback when WebSocket unavailable)
    useEffect(() => {
        const handlePollingUpdate = (event) => {
            const { type, property } = event.detail;
            
            if (type === 'new_property' && property) {
                console.log('New property from polling:', property);
                // Check if property matches current filters
                const matchesFilters = 
                    (!filters.listingType || property.listingType === filters.listingType) &&
                    (!filters.type || property.type === filters.type) &&
                    (!filters.district || property.district === filters.district);

                if (matchesFilters) {
                    setBackendProperties(prev => {
                        // Check if property already exists
                        if (prev.some(p => p._id === property._id)) {
                            return prev;
                        }
                        return [property, ...prev];
                    });
                }
            }
        };

        window.addEventListener('polling-update', handlePollingUpdate);
        
        return () => {
            window.removeEventListener('polling-update', handlePollingUpdate);
        };
    }, [filters]);

    const filteredProperties = backendProperties;

    const handleFilterChange = (newFilters) => {
        setFilters(prev => ({
            ...prev,
            ...newFilters
        }));
    };

    const handleDistrictChange = (district) => {
        setUserDistrict(district);
    };

    return (
        <div className="home-page">
            {/* Location Tracker - invisible component */}
            <LocationTracker onDistrictChange={handleDistrictChange} />
            
            {/* Search and Filter Section */}
            <section className="search-section">
                <div className="container">
                    <SearchFilter 
                        onFilterChange={handleFilterChange} 
                        initialFilters={filters}
                        userDistrict={userDistrict}
                    />
                </div>
            </section>

            {/* Results Grid */}
            <section className="results-section">
                <div className="container">
                    {isLoading ? (
                        <SkeletonGrid count={8} />
                    ) : error ? (
                        <ErrorMessage 
                            message={error} 
                            onRetry={() => fetchProperties(1, true)} 
                        />
                    ) : filteredProperties.length === 0 ? (
                        <div className="empty-state">
                            <h3>No properties found</h3>
                            <p>Try adjusting your filters to see more results</p>
                            <Link to="/add-property" className="btn btn-primary btn-large">Add Property</Link>
                        </div>
                    ) : (
                        <>
                            <div className="airbnb-grid">
                                {filteredProperties.map((property, index) => {
                                    if (index === filteredProperties.length - 1) {
                                        return (
                                            <div key={property._id} ref={lastPropertyRef}>
                                                <PropertyCard property={property} />
                                            </div>
                                        );
                                    }
                                    return <PropertyCard key={property._id} property={property} />;
                                })}
                            </div>
                            {isLoadingMore && (
                                <div className="loading-more">
                                    <Loader2 className="animate-spin" size={32} />
                                    <p>Loading more properties...</p>
                                </div>
                            )}
                            {!hasMore && filteredProperties.length > 0 && (
                                <div className="end-message">
                                    <p>You've reached the end of the list</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>

            {/* Floating Add Property Button */}
            <Link to="/add-property" className="floating-add-btn" title="Add Property">
                <Plus size={28} strokeWidth={2.5} />
            </Link>
        </div>
    );
}
