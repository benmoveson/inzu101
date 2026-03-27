import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import FormInput from '../components/FormInput';
import ErrorMessage from '../components/ErrorMessage';
import { validateEmailOrPhone, validateRequired } from '../utils/validation';
import './Auth.css';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [show2FA, setShow2FA] = useState(false);
    const [twoFACode, setTwoFACode] = useState('');
    const [userId, setUserId] = useState(null);
    const { login, verify2FA } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Check for success message from password reset
        if (location.state?.message) {
            setSuccessMessage(location.state.message);
            // Clear the message from location state
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setErrors({});

        // Validate fields
        if (!show2FA) {
            const newErrors = {};
            
            const emailError = validateEmailOrPhone(email);
            if (emailError) newErrors.email = emailError;
            
            const passwordError = validateRequired(password, 'Password');
            if (passwordError) newErrors.password = passwordError;
            
            if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors);
                setIsLoading(false);
                return;
            }
        } else {
            const codeError = validateRequired(twoFACode, '2FA code');
            if (codeError) {
                setErrors({ twoFACode: codeError });
                setIsLoading(false);
                return;
            }
        }

        try {
            if (show2FA) {
                const result = await verify2FA(userId, twoFACode);
                if (result.success) {
                    navigate('/home');
                } else {
                    setError(result.error || 'Verification failed');
                }
            } else {
                const result = await login(email, password);
                if (result.success) {
                    if (result.requires2FA) {
                        setShow2FA(true);
                        setUserId(result.userId);
                    } else {
                        navigate('/home');
                    }
                } else {
                    setError(result.error || 'Invalid email or password');
                }
            }
        } catch {
            setError('An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Welcome Back</h1>
                    <p>Login to your Inzu account</p>
                </div>

                {error && <ErrorMessage message={error} />}
                {successMessage && <div className="success-message">{successMessage}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    {!show2FA ? (
                        <>
                            <FormInput
                                label="Email or Phone"
                                type="text"
                                name="email"
                                placeholder="yours@example.com or +250..."
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                error={errors.email}
                                required
                            />

                            <FormInput
                                label="Password"
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                error={errors.password}
                                showPasswordToggle
                                required
                            />

                            <div className="forgot-password-link">
                                <Link to="/forgot-password" className="auth-link">
                                    Forgot Password?
                                </Link>
                            </div>
                        </>
                    ) : (
                        <div className="form-group slide-up">
                            <FormInput
                                label="Enter 6-digit Code"
                                type="text"
                                name="twoFACode"
                                placeholder="123456"
                                maxLength="6"
                                value={twoFACode}
                                onChange={(e) => setTwoFACode(e.target.value)}
                                error={errors.twoFACode}
                                required
                            />
                            <p className="text-small text-muted text-center mt-2">
                                We sent a secure code to your email.
                            </p>
                            <button
                                type="button"
                                className="auth-link btn-link"
                                onClick={() => setShow2FA(false)}
                            >
                                Back to Login
                            </button>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '0.875rem', marginTop: '1rem' }}
                        disabled={isLoading}
                    >
                        {isLoading ? (show2FA ? 'Verifying...' : 'Signing in...') : (
                            <>
                                <LogIn size={20} style={{ marginRight: '0.5rem' }} />
                                {show2FA ? 'Verify Code' : 'Sign In'}
                            </>
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    Don't have an account?
                    <Link to="/signup" className="auth-link">Sign Up</Link>
                </div>
            </div>
        </div>
    );
}
