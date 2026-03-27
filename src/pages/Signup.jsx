import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, UserPlus, Eye, EyeOff, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import FormInput from '../components/FormInput';
import PasswordStrength from '../components/PasswordStrength';
import ErrorMessage from '../components/ErrorMessage';
import { validateEmail, validatePhone, validatePassword, validateRequired } from '../utils/validation';
import './Auth.css';

export default function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [language, setLanguage] = useState('en');
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setErrors({});

        // Validate all fields
        const newErrors = {};
        
        const nameError = validateRequired(name, 'Name');
        if (nameError) newErrors.name = nameError;
        
        const emailError = validateEmail(email);
        if (emailError) newErrors.email = emailError;
        
        // Phone is optional, but validate if provided
        if (phone) {
            const phoneError = validatePhone(phone);
            if (phoneError) newErrors.phone = phoneError;
        }
        
        const passwordError = validatePassword(password);
        if (passwordError) newErrors.password = passwordError;
        
        if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (!acceptedTerms) {
            newErrors.terms = 'You must accept the Terms & Conditions';
        }
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setIsLoading(false);
            return;
        }

        try {
            const result = await signup({ 
                name, 
                email, 
                phone: phone || undefined,
                password,
                language,
                role: 'seeker' 
            });

            if (result.success) {
                // Navigate to OTP verification
                navigate('/verify-otp', { state: { email, userId: result.userId } });
            } else {
                setError(result.error || 'Something went wrong');
            }
        } catch {
            setError('An error occurred during signup');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Create Account</h1>
                    <p>Join Inzu and find your perfect space</p>
                </div>

                {error && <ErrorMessage message={error} />}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <FormInput
                        label="Full Name"
                        type="text"
                        name="name"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        error={errors.name}
                        required
                    />

                    <FormInput
                        label="Email Address"
                        type="email"
                        name="email"
                        placeholder="yours@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        error={errors.email}
                        required
                    />

                    <FormInput
                        label="Phone Number (Optional)"
                        type="tel"
                        name="phone"
                        placeholder="+250 XXX XXX XXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        error={errors.phone}
                    />

                    <div className="form-group">
                        <label htmlFor="language">Preferred Language *</label>
                        <select
                            id="language"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="input"
                            required
                            style={{ padding: '12px', fontSize: '1rem' }}
                        >
                            <option value="en">English</option>
                            <option value="rw">Kinyarwanda</option>
                            <option value="fr">Français</option>
                        </select>
                    </div>

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
                    <PasswordStrength password={password} />

                    <FormInput
                        label="Confirm Password"
                        type="password"
                        name="confirmPassword"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        error={errors.confirmPassword}
                        showPasswordToggle
                        required
                    />

                    <div className="form-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={acceptedTerms}
                                onChange={(e) => setAcceptedTerms(e.target.checked)}
                                required
                            />
                            <span>
                                I accept the{' '}
                                <Link to="/terms" className="auth-link">
                                    Terms & Conditions
                                </Link>
                            </span>
                        </label>
                        {errors.terms && <span className="error-message" style={{ display: 'block', marginTop: '6px' }}>{errors.terms}</span>}
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '0.875rem', marginTop: '1rem' }}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Creating account...' : (
                            <>
                                <UserPlus size={20} style={{ marginRight: '0.5rem' }} />
                                Get Started
                            </>
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account?
                    <Link to="/login" className="auth-link">Sign In</Link>
                </div>
            </div>
        </div>
    );
}
