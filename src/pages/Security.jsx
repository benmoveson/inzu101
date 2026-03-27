import { User, BarChart3, Settings as SettingsIcon, Shield, Loader2, Eye, EyeOff } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

export default function Security() {
    const { user, updateUser, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    // Auto-dismiss messages after 3 seconds
    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => {
                setMessage({ type: '', text: '' });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            return;
        }

        setIsPasswordLoading(true);
        try {
            const token = localStorage.getItem('inzu_token');
            const res = await fetch('http://localhost:5000/api/users/change-password', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: passwords.current,
                    newPassword: passwords.new
                })
            });

            const data = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: 'Password changed successfully!' });
                setShowPasswordModal(false);
                setPasswords({ current: '', new: '', confirm: '' });
            } else {
                setMessage({ type: 'error', text: data.message });
            }
        } catch {
            setMessage({ type: 'error', text: 'Failed to update password' });
        } finally {
            setIsPasswordLoading(false);
        }
    };

    const handleToggle2FA = async () => {
        try {
            const token = localStorage.getItem('inzu_token');
            const res = await fetch('http://localhost:5000/api/users/toggle-2fa', {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await res.json();
            if (res.ok) {
                updateUser({ twoFactorEnabled: data.twoFactorEnabled });
                setMessage({ type: 'success', text: data.message });
            } else {
                setMessage({ type: 'error', text: data.message });
            }
        } catch {
            setMessage({ type: 'error', text: 'Failed to update 2FA status' });
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <Loader2 className="animate-spin" size={48} />
                <p>Loading security settings...</p>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const menuItems = [
        { id: 'personal', label: 'Personal Information', icon: User, path: '/profile' },
        { id: 'dashboard', label: 'Dashboard', icon: BarChart3, path: '/profile/dashboard' },
        { id: 'preferences', label: 'Preferences', icon: SettingsIcon, path: '/profile/preferences' },
        { id: 'security', label: 'Security', icon: Shield, path: '/profile/security' },
        { id: 'settings', label: 'Settings', icon: SettingsIcon, path: '/profile/settings' },
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
                                const isActive = location.pathname === item.path;
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
                            <h2 className="section-title">Security</h2>
                            <div className="security-actions">
                                <button
                                    className="btn btn-secondary btn-normal"
                                    onClick={() => setShowPasswordModal(true)}
                                >
                                    Change Password
                                </button>
                                <button
                                    className={`btn btn-normal ${user.twoFactorEnabled ? 'btn-danger' : 'btn-secondary'}`}
                                    onClick={handleToggle2FA}
                                >
                                    {user.twoFactorEnabled ? 'Disable Two-Factor Auth' : 'Enable Two-Factor Auth'}
                                </button>
                            </div>
                        </div>

                        {/* Password Modal */}
                        {showPasswordModal && (
                            <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
                                <div className="modal-card card animate-pop" onClick={(e) => e.stopPropagation()}>
                                    <div className="modal-header">
                                        <h3>Change Password</h3>
                                        <button className="btn-close" onClick={() => setShowPasswordModal(false)}>×</button>
                                    </div>
                                    <form onSubmit={handlePasswordChange} className="password-form">
                                        <div className="form-group">
                                            <label>Current Password</label>
                                            <div className="input-with-icon">
                                                <input
                                                    type={showCurrentPassword ? "text" : "password"}
                                                    className="input"
                                                    value={passwords.current}
                                                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    className="password-toggle-btn"
                                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                >
                                                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>New Password</label>
                                            <div className="input-with-icon">
                                                <input
                                                    type={showNewPassword ? "text" : "password"}
                                                    className="input"
                                                    value={passwords.new}
                                                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    className="password-toggle-btn"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                >
                                                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Confirm New Password</label>
                                            <div className="input-with-icon">
                                                <input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    className="input"
                                                    value={passwords.confirm}
                                                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    className="password-toggle-btn"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                >
                                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </div>
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            style={{ width: '100%', marginTop: '1rem' }}
                                            disabled={isPasswordLoading}
                                        >
                                            {isPasswordLoading ? 'Updating...' : 'Update Password'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
