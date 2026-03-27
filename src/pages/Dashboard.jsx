import { User, BarChart3, Settings, Shield, LogOut, Home as HouseIcon, MapPin, Eye, Trash2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

export default function Dashboard() {
    const { user, logout, loading } = useAuth();
    const navigate = useNavigate();
    const [userProperties, setUserProperties] = useState([]);
    const [isLoadingProperties, setIsLoadingProperties] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    useEffect(() => {
        if (user) {
            fetchUserProperties();
        }
    }, [user]);

    // Auto-dismiss messages after 3 seconds
    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => {
                setMessage({ type: '', text: '' });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const fetchUserProperties = async () => {
        setIsLoadingProperties(true);
        try {
            const token = localStorage.getItem('inzu_token');
            const res = await fetch('http://localhost:5000/api/properties/user', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (res.ok) {
                setUserProperties(data);
            }
        } catch (err) {
            console.error('Failed to fetch properties');
        } finally {
            setIsLoadingProperties(false);
        }
    };

    const handleDeleteProperty = async (propertyId) => {
        if (!confirm('Are you sure you want to delete this property?')) return;

        try {
            const token = localStorage.getItem('inzu_token');
            const res = await fetch(`http://localhost:5000/api/properties/${propertyId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                setUserProperties(prev => prev.filter(p => p._id !== propertyId));
                setMessage({ type: 'success', text: 'Property deleted successfully!' });
            } else {
                setMessage({ type: 'error', text: 'Failed to delete property' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to delete property' });
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <Loader2 className="animate-spin" size={48} />
                <p>Loading dashboard...</p>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const menuItems = [
        { id: 'personal', label: 'Personal Information', icon: User, path: '/profile' },
        { id: 'dashboard', label: 'Dashboard', icon: BarChart3, path: '/profile/dashboard' },
        { id: 'preferences', label: 'Preferences', icon: Settings, path: '/profile/preferences' },
        { id: 'security', label: 'Security', icon: Shield, path: '/profile/security' },
    ];

    return (
        <div className="profile-page-new">
            <div className="container">
                <div className="profile-layout">
                    {/* Sidebar */}
                    <aside className="profile-sidebar">
                        <div className="profile-sidebar-header">
                            <div className="profile-avatar">
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.name} />
                                ) : (
                                    <User size={32} />
                                )}
                            </div>
                            <h3>{user.name}</h3>
                            <p>{user.email}</p>
                        </div>

                        <nav className="profile-nav">
                            {menuItems.map(item => {
                                const Icon = item.icon;
                                const isActive = item.id === 'dashboard';
                                return (
                                    <button
                                        key={item.id}
                                        className={`profile-nav-item ${isActive ? 'active' : ''}`}
                                        onClick={() => navigate(item.path)}
                                    >
                                        <Icon size={20} />
                                        <span>{item.label}</span>
                                    </button>
                                );
                            })}
                            <button className="profile-nav-item logout-item" onClick={logout}>
                                <LogOut size={20} />
                                <span>Logout</span>
                            </button>
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <main className="profile-main">
                        {message.text && (
                            <div className={`alert alert-${message.type}`}>
                                {message.text}
                            </div>
                        )}

                        <div className="profile-section">
                            <h2 className="section-title">My Properties</h2>
                            
                            {isLoadingProperties ? (
                                <div className="loading-container">
                                    <Loader2 className="animate-spin" size={32} />
                                    <p>Loading properties...</p>
                                </div>
                            ) : userProperties.length === 0 ? (
                                <div className="empty-state">
                                    <HouseIcon size={64} color="#ccc" />
                                    <h3>No properties yet</h3>
                                    <p>Start by adding your first property</p>
                                    <button className="btn btn-primary" onClick={() => navigate('/add-property')}>
                                        Add Property
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="stats-grid">
                                        <div className="stat-card">
                                            <h4>Total Properties</h4>
                                            <p className="stat-value">{userProperties.length}</p>
                                        </div>
                                        <div className="stat-card">
                                            <h4>Active Listings</h4>
                                            <p className="stat-value">{userProperties.filter(p => p.status !== 'rented').length}</p>
                                        </div>
                                        <div className="stat-card">
                                            <h4>Total Views</h4>
                                            <p className="stat-value">{userProperties.reduce((sum, p) => sum + (p.views || 0), 0)}</p>
                                        </div>
                                    </div>

                                    <div className="properties-list">
                                        {userProperties.map(property => (
                                            <div key={property._id} className="property-item">
                                                <div className="property-item-image">
                                                    <img
                                                        src={property.images?.[0]?.url || property.images?.[0] || 'https://via.placeholder.com/150'}
                                                        alt={property.title}
                                                    />
                                                </div>
                                                <div className="property-item-info">
                                                    <h4>{property.title}</h4>
                                                    <p className="property-location">
                                                        <MapPin size={16} />
                                                        {property.district || property.location}
                                                    </p>
                                                    <p className="property-price">
                                                        {property.listingType === 'sale'
                                                            ? `${property.price.toLocaleString()} RWF`
                                                            : `${property.price.toLocaleString()} RWF / ${property.rentPeriod || 'month'}`
                                                        }
                                                    </p>
                                                </div>
                                                <div className="property-item-actions">
                                                    <button
                                                        className="btn-icon"
                                                        onClick={() => navigate(`/property/${property._id}`)}
                                                        title="View"
                                                    >
                                                        <Eye size={20} />
                                                    </button>
                                                    <button
                                                        className="btn-icon btn-danger"
                                                        onClick={() => handleDeleteProperty(property._id)}
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
