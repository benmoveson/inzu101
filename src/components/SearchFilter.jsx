import { useState, useEffect, useRef } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import './SearchFilter.css';

export default function SearchFilter({ onFilterChange, initialFilters = {}, userDistrict = null }) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [nearMeActive, setNearMeActive] = useState(false);
    const debounceTimerRef = useRef(null);
    const [filters, setFilters] = useState(() => {
        // Initialize from sessionStorage or initialFilters
        const savedFilters = sessionStorage.getItem('propertyFilters');
        const savedSearch = sessionStorage.getItem('propertySearchQuery');
        
        if (savedSearch) {
            setSearchQuery(savedSearch);
        }
        
        if (savedFilters) {
            return JSON.parse(savedFilters);
        }
        return {
            location: initialFilters.location || '',
            type: initialFilters.type || '',
            minPrice: initialFilters.minPrice || '',
            maxPrice: initialFilters.maxPrice || '',
            bedrooms: initialFilters.bedrooms || '',
            bathrooms: initialFilters.bathrooms || '',
            furnished: initialFilters.furnished || false,
            petFriendly: initialFilters.petFriendly || false,
        };
    });

    // Debounced search handler
    useEffect(() => {
        // Clear existing timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // Set new timer for 300ms debounce
        debounceTimerRef.current = setTimeout(() => {
            setFilters(prev => ({
                ...prev,
                location: searchQuery
            }));
            sessionStorage.setItem('propertySearchQuery', searchQuery);
        }, 300);

        // Cleanup
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [searchQuery]);

    // Save filters to sessionStorage and notify parent whenever they change
    useEffect(() => {
        sessionStorage.setItem('propertyFilters', JSON.stringify(filters));
        onFilterChange(filters);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

    const handleInputChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSearchChange = (value) => {
        setSearchQuery(value);
    };

    const clearSearch = () => {
        setSearchQuery('');
        sessionStorage.removeItem('propertySearchQuery');
    };

    const clearAllFilters = () => {
        const emptyFilters = {
            location: '',
            type: '',
            minPrice: '',
            maxPrice: '',
            bedrooms: '',
            bathrooms: '',
            furnished: false,
            petFriendly: false,
            district: '',
        };
        setFilters(emptyFilters);
        setSearchQuery('');
        setNearMeActive(false);
        sessionStorage.removeItem('propertyFilters');
        sessionStorage.removeItem('propertySearchQuery');
    };

    const toggleNearMe = () => {
        if (!userDistrict) return;
        
        const newNearMeState = !nearMeActive;
        setNearMeActive(newNearMeState);
        
        if (newNearMeState) {
            // Apply district filter
            setFilters(prev => ({
                ...prev,
                district: userDistrict
            }));
        } else {
            // Remove district filter
            setFilters(prev => ({
                ...prev,
                district: ''
            }));
        }
    };

    const hasActiveFilters = Object.values(filters).some(value => 
        value !== '' && value !== false
    ) || nearMeActive;

    return (
        <div className="search-filter">
            {/* Search Bar */}
            <div className="search-filter-row">
                <div className="search-filter-group">
                    <div className="search-filter-input-wrapper">
                        <Search size={20} className="search-filter-icon" />
                        <input
                            type="text"
                            placeholder="Search by location..."
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="search-filter-input"
                        />
                        {searchQuery && (
                            <button
                                onClick={clearSearch}
                                className="search-filter-clear-btn"
                                aria-label="Clear search"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </div>
                
                {userDistrict && (
                    <button
                        onClick={toggleNearMe}
                        className={`search-filter-near-me ${nearMeActive ? 'active' : ''}`}
                        title={`Filter by ${userDistrict}`}
                    >
                        📍 Near me
                    </button>
                )}
                
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`search-filter-toggle ${hasActiveFilters ? 'active' : ''}`}
                >
                    <SlidersHorizontal size={20} />
                    {hasActiveFilters && <span className="search-filter-badge"></span>}
                </button>
            </div>

            {/* Filter Panel */}
            {isOpen && (
                <div className="search-filter-panel">
                    <div className="search-filter-header">
                        <h3 className="text-title-3">Filters</h3>
                        <button onClick={() => setIsOpen(false)} className="search-filter-close">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="search-filter-content">
                        {/* Property Type */}
                        <div className="search-filter-group">
                            <label className="search-filter-label">Property Type</label>
                            <div className="search-filter-button-group">
                                <button
                                    onClick={() => handleInputChange('type', filters.type === 'Apartment' ? '' : 'Apartment')}
                                    className={`search-filter-button ${filters.type === 'Apartment' ? 'active' : ''}`}
                                >
                                    Apartment
                                </button>
                                <button
                                    onClick={() => handleInputChange('type', filters.type === 'House' ? '' : 'House')}
                                    className={`search-filter-button ${filters.type === 'House' ? 'active' : ''}`}
                                >
                                    House
                                </button>
                                <button
                                    onClick={() => handleInputChange('type', filters.type === 'Land' ? '' : 'Land')}
                                    className={`search-filter-button ${filters.type === 'Land' ? 'active' : ''}`}
                                >
                                    Land
                                </button>
                            </div>
                        </div>

                        {/* Price Range */}
                        <div className="search-filter-group">
                            <label className="search-filter-label">Price Range (RWF)</label>
                            <div className="search-filter-price-range">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={filters.minPrice}
                                    onChange={(e) => handleInputChange('minPrice', e.target.value)}
                                    className="search-filter-input search-filter-price-input"
                                />
                                <span className="search-filter-price-separator">-</span>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={filters.maxPrice}
                                    onChange={(e) => handleInputChange('maxPrice', e.target.value)}
                                    className="search-filter-input search-filter-price-input"
                                />
                            </div>
                        </div>

                        {/* Bedrooms */}
                        <div className="search-filter-group">
                            <label className="search-filter-label">Bedrooms</label>
                            <div className="search-filter-button-group">
                                {[1, 2, 3, 4, '5+'].map((num) => (
                                    <button
                                        key={num}
                                        onClick={() => handleInputChange('bedrooms', filters.bedrooms === num ? '' : num)}
                                        className={`search-filter-button ${filters.bedrooms === num ? 'active' : ''}`}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Bathrooms */}
                        <div className="search-filter-group">
                            <label className="search-filter-label">Bathrooms</label>
                            <div className="search-filter-button-group">
                                {[1, 2, 3, '4+'].map((num) => (
                                    <button
                                        key={num}
                                        onClick={() => handleInputChange('bathrooms', filters.bathrooms === num ? '' : num)}
                                        className={`search-filter-button ${filters.bathrooms === num ? 'active' : ''}`}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="search-filter-actions">
                        <button onClick={clearAllFilters} className="search-filter-clear">
                            Clear all
                        </button>
                        <button onClick={() => setIsOpen(false)} className="search-filter-apply">
                            Show results
                        </button>
                    </div>
                </div>
            )}

            {/* Overlay */}
            {isOpen && <div className="search-filter-overlay" onClick={() => setIsOpen(false)}></div>}
        </div>
    );
}
