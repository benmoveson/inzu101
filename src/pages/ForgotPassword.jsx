import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import './Auth.css';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (!email) {
            setError('Please enter your email address');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                // Navigate to reset password page with email
                navigate('/reset-password', { state: { email } });
            } else {
                setError(data.message || 'Failed to send reset code');
            }
        } catch {
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <button 
                    className="back-button"
                    onClick={() => navigate('/login')}
                    type="button"
                >
                    <ArrowLeft size={20} />
                    Back to Login
                </button>

                <div className="auth-header">
                    <h1>Forgot Password?</h1>
                    <p>Enter your email and we'll send you a code to reset your password</p>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <div className="input-wrapper">
                            <Mail size={18} />
                            <input
                                type="email"
                                id="email"
                                placeholder="yours@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '0.875rem', marginTop: '1rem' }}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Sending...' : 'Send Reset Code'}
                    </button>
                </form>

                <div className="auth-footer">
                    Remember your password?
                    <Link to="/login" className="auth-link">Sign In</Link>
                </div>
            </div>
        </div>
    );
}
