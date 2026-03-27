import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Globe, Menu, User, Home as HouseIcon,
    Bed, LayoutGrid, ConciergeBell, MapPin, Bell, LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const categories = [
    { id: 'rent', label: 'Rent' },
    { id: 'buy', label: 'Buy' },
];

const propertyTypes = [
    { id: 'all', label: 'All', icon: LayoutGrid, path: '/home' },
    { id: 'house', label: 'Houses', icon: HouseIcon, path: '/houses' },
    { id: 'room', label: 'Rooms', icon: Bed, path: '/rooms' },
    { id: 'apartment', label: 'Apartments', icon: MapPin, path: '/apartments' },
    { id: 'hotel', label: 'Hotels', icon: ConciergeBell, path: '/hotels' },
];

export default function Header({ onCategoryChange, onPropertyTypeChange }) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeCategory, setActiveCategory] = useState('rent');
    const [activePropertyType, setActivePropertyType] = useState('all');
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    // Update active property type based on current route
    useEffect(() => {
        const currentPath = location.pathname;
        const matchedType = propertyTypes.find(type => type.path === currentPath);
        if (matchedType) {
            setActivePropertyType(matchedType.id);
        }
    }, [location.pathname]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleCategoryChange = (categoryId) => {
        console.log('Header: Category changed to', categoryId);
        setActiveCategory(categoryId);
        if (onCategoryChange) {
            onCategoryChange(categoryId);
        }
    };

    const handlePropertyTypeChange = (typeId, path) => {
        setActivePropertyType(typeId);
        navigate(path);
        if (onPropertyTypeChange) {
            onPropertyTypeChange(typeId);
        }
    };

    return (
        <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
            <div className="header-top-wrapper">
                <div className="container">
                    <div className="header-top">
                        {/* Logo */}
                        <Link to="/" className="logo">
                            <HouseIcon className="logo-icon" size={32} strokeWidth={2.5} />
                            <span className="logo-text">inzu</span>
                        </Link>

                        {/* Center: Rent | Buy Toggle */}
                        <div className="header-center">
                            <div className="category-toggle">
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        className={`category-toggle-btn ${activeCategory === cat.id ? 'active' : ''}`}
                                        onClick={() => handleCategoryChange(cat.id)}
                                    >
                                        {cat.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Profile/Menu: Sign In / Sign Up */}
                        <div className="header-right">
                            {user ? (
                                <div className="user-nav">
                                    <Link to="/notifications" className="notification-bell">
                                        <Bell size={20} />
                                    </Link>
                                    <Link to="/profile" className="profile-avatar-link">
                                        <div className="profile-avatar-circle">
                                            {user.avatar ? (
                                                <img 
                                                    src={user.avatar} 
                                                    alt={user.name}
                                                    className="profile-avatar-img"
                                                />
                                            ) : (
                                                <User size={20} />
                                            )}
                                        </div>
                                    </Link>
                                    <button onClick={logout} className="logout-icon-btn" title="Logout">
                                        <LogOut size={20} />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <Link to="/signup" className="nav-auth-link">Sign up</Link>
                                    <Link to="/login" className="nav-auth-link">Log in</Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
