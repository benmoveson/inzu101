import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Loader2 } from 'lucide-react';
import PropertyCard from '../components/PropertyCard';
import SearchFilter from '../components/SearchFilter';
import ErrorMessage from '../components/ErrorMessage';
import { SkeletonGrid } from '../components/SkeletonLoader';
import LocationTracker from '../components/LocationTracker';
import { useScrollRestoration } from '../hooks/useScrollRestoration';
import { apiRequest, ApiError } from '../utils/api';
import './Home.css';

export default function PropertyListPage({ propertyType, categoryFilter = 'rent' }) {
    const [filters, setFilters] = useState({});
    const [backendProperties, setBackendProperties] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [userLocation, setUserLocation] = useState(null);
    const [userDistrict, setUserDistrict] = useState(null);
    const lastPropertyRef = useRef(null);

    // Enable scroll position restoration
    useScrollRestoration(`${propertyType}-feed`);

    // Update filters when category changes
    useEffect(() => {
        const newFilters = {
            listingType: categoryFilter === 'buy' ? 'sale' : 'rent',
            type: propertyType
        };
        
        console.log('PropertyListPage: Filters updated', { categoryFilter, propertyType, newFilters });
        setFilters(newFilters);
    }, [categoryFilter, propertyType]);

    // Request geolocation permission
    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                () => {
                    console.log('Location permission denied or unavailable');
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
        setErrorMsg('');

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
                setErrorMsg(err.message);
            } else {
                setErrorMsg('An unexpected error occurred');
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

    const handleFilterChange = (newFilters) => {
        setFilters(prev => ({
            ...prev,
            ...newFilters
        }));
    };

    const handleDistrictChange = (district) => {
        setUserDistrict(district);
    };

    const getPageTitle = () => {
        const typeNames = {
            house: 'Houses',
            room: 'Rooms',
            apartment: 'Apartments',
            hotel: 'Hotels'
        };
        return typeNames[propertyType] || 'Properties';
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
                    <h2 className="section-title">{getPageTitle()} for {categoryFilter === 'buy' ? 'Sale' : 'Rent'}</h2>
                    {isLoading ? (
                        <SkeletonGrid count={8} />
                    ) : errorMsg ? (
                        <ErrorMessage 
                            message={errorMsg} 
                            onRetry={() => fetchProperties(1, true)} 
                        />
                    ) : backendProperties.length === 0 ? (
                        <div className="empty-state">
                            <h3>No {getPageTitle().toLowerCase()} found</h3>
                            <p>Try adjusting your filters to see more results</p>
                            <Link to="/add-property" className="btn btn-primary btn-large">Add Property</Link>
                        </div>
                    ) : (
                        <>
                            <div className="airbnb-grid">
                                {backendProperties.map((property, index) => {
                                    if (index === backendProperties.length - 1) {
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
                            {!hasMore && backendProperties.length > 0 && (
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
