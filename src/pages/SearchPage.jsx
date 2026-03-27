import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, Loader2 } from 'lucide-react';
import PropertyCard from '../components/PropertyCard';
import { properties, propertyTypes, priceRanges, bedroomOptions } from '../data/properties';
import { useScrollRestoration } from '../hooks/useScrollRestoration';
import './SearchPage.css';

export default function SearchPage() {
    const [searchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        type: 'All',
        priceRange: 0,
        bedrooms: 'Any',
        sortBy: 'featured'
    });

    const [backendProperties, setBackendProperties] = useState([]);
    const [filteredProperties, setFilteredProperties] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // Enable scroll position restoration
    useScrollRestoration('search-page');

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const res = await fetch(`${serverUrl}/api/properties?limit=100`);
                const data = await res.json();
                if (res.ok) {
                    // Handle both array and object responses
                    const propertiesArray = Array.isArray(data) ? data : (data.properties || []);
                    setBackendProperties(propertiesArray);
                } else {
                    setError('Failed to load properties');
                }
            } catch (err) {
                console.error('Error fetching properties:', err);
                setError('Error connecting to server');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProperties();
    }, []);

    useEffect(() => {
        let results = [...backendProperties];

        // Search query filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            results = results.filter(p =>
                (p.title || '').toLowerCase().includes(query) ||
                (p.location || '').toLowerCase().includes(query) ||
                (p.type || '').toLowerCase().includes(query) ||
                (p.description || '').toLowerCase().includes(query)
            );
        }

        // Type filter
        if (filters.type !== 'All') {
            results = results.filter(p => p.type === filters.type.toLowerCase());
        }

        // Price range filter
        if (filters.priceRange > 0) {
            const range = priceRanges[filters.priceRange];
            results = results.filter(p => p.price >= range.min && p.price <= range.max);
        }

        // Bedrooms filter
        if (filters.bedrooms !== 'Any') {
            const minBeds = parseInt(filters.bedrooms);
            results = results.filter(p => p.bedrooms >= minBeds);
        }

        // Sort
        switch (filters.sortBy) {
            case 'price-low':
                results.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                results.sort((a, b) => b.price - a.price);
                break;
            case 'newest':
                results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'featured':
            default:
                // For now, keep as is or sort by rating if available
                break;
        }

        setFilteredProperties(results);
    }, [searchQuery, filters, backendProperties]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            type: 'All',
            priceRange: 0,
            bedrooms: 'Any',
            sortBy: 'featured'
        });
        setSearchQuery('');
    };

    const activeFiltersCount =
        (filters.type !== 'All' ? 1 : 0) +
        (filters.priceRange > 0 ? 1 : 0) +
        (filters.bedrooms !== 'Any' ? 1 : 0);

    return (
        <div className="search-page">
            <div className="container">
                {/* Search Header */}
                <div className="search-header">
                    <div className="search-bar-wrapper">
                        <div className="search-bar">
                            <Search className="search-bar-icon" size={20} />
                            <input
                                type="text"
                                placeholder="Search by location, property type, or keyword..."
                                className="search-bar-input"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button
                                    className="clear-search-btn"
                                    onClick={() => setSearchQuery('')}
                                    aria-label="Clear search"
                                >
                                    <X size={18} />
                                </button>
                            )}
                        </div>
                        <button
                            className={`filters-toggle-btn btn ${showFilters ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <SlidersHorizontal size={20} />
                            <span>Filters</span>
                            {activeFiltersCount > 0 && (
                                <span className="filter-count">{activeFiltersCount}</span>
                            )}
                        </button>
                    </div>

                    {/* Filters Panel */}
                    {showFilters && (
                        <div className="filters-panel animate-slide-down">
                            <div className="filters-grid">
                                {/* Property Type */}
                                <div className="filter-group">
                                    <label className="filter-label">Property Type</label>
                                    <select
                                        className="filter-select"
                                        value={filters.type}
                                        onChange={(e) => handleFilterChange('type', e.target.value)}
                                    >
                                        {propertyTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Price Range */}
                                <div className="filter-group">
                                    <label className="filter-label">Price Range</label>
                                    <select
                                        className="filter-select"
                                        value={filters.priceRange}
                                        onChange={(e) => handleFilterChange('priceRange', parseInt(e.target.value))}
                                    >
                                        {priceRanges.map((range, index) => (
                                            <option key={index} value={index}>{range.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Bedrooms */}
                                <div className="filter-group">
                                    <label className="filter-label">Bedrooms</label>
                                    <select
                                        className="filter-select"
                                        value={filters.bedrooms}
                                        onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                                    >
                                        {bedroomOptions.map(option => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Sort By */}
                                <div className="filter-group">
                                    <label className="filter-label">Sort By</label>
                                    <select
                                        className="filter-select"
                                        value={filters.sortBy}
                                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                    >
                                        <option value="featured">Featured</option>
                                        <option value="price-low">Price: Low to High</option>
                                        <option value="price-high">Price: High to Low</option>
                                        <option value="newest">Newest</option>
                                    </select>
                                </div>
                            </div>

                            {activeFiltersCount > 0 && (
                                <button className="btn btn-ghost" onClick={clearFilters}>
                                    <X size={18} />
                                    Clear All Filters
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Results */}
                <div className="search-results">
                    <div className="results-header">
                        <h2 className="results-title">
                            {isLoading ? 'Searching...' : `${filteredProperties.length} ${filteredProperties.length === 1 ? 'Property' : 'Properties'} Found`}
                        </h2>
                    </div>

                    {isLoading ? (
                        <div className="loading-grid">
                            <Loader2 className="animate-spin" size={48} />
                            <p>Searching for properties...</p>
                        </div>
                    ) : error ? (
                        <div className="error-state">{error}</div>
                    ) : filteredProperties.length > 0 ? (
                        <div className="properties-grid">
                            {filteredProperties.map(property => (
                                <PropertyCard key={property._id} property={property} />
                            ))}
                        </div>
                    ) : (
                        <div className="no-results">
                            <div className="no-results-icon">🏠</div>
                            <h3>No properties found</h3>
                            <p>Try adjusting your search criteria or filters</p>
                            <button className="btn btn-primary" onClick={clearFilters}>
                                Clear Filters
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
