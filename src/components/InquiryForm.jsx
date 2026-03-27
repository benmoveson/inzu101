import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import FormInput from './FormInput';
import ErrorMessage from './ErrorMessage';
import { validateEmail, validatePhone, validateRequired } from '../utils/validation';
import { authenticatedRequest, ApiError } from '../utils/api';
import './InquiryForm.css';

export default function InquiryForm({ propertyId, onClose, onSuccess }) {
    const { user, getToken } = useAuth();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        message: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateField = (name, value) => {
        switch (name) {
            case 'name':
                return validateRequired(value, 'Name');
            case 'email':
                return validateEmail(value);
            case 'phone':
                return validatePhone(value);
            case 'message':
                return validateRequired(value, 'Message');
            default:
                return '';
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        const error = validateField(name, value);
        if (error) {
            setErrors(prev => ({ ...prev, [name]: error }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        Object.keys(formData).forEach(key => {
            const error = validateField(key, formData[key]);
            if (error) {
                newErrors[key] = error;
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            await authenticatedRequest('http://localhost:5000/api/inquiries', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    propertyId,
                    ...formData
                })
            });

            // Show success toast
            if (onSuccess) {
                onSuccess();
            }
            
            // Close the form
            if (onClose) {
                onClose();
            }
        } catch (error) {
            if (error instanceof ApiError) {
                setErrors({ submit: error.message });
            } else {
                setErrors({ submit: 'Failed to send inquiry. Please try again.' });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="inquiry-form-overlay" onClick={onClose}>
            <div className="inquiry-form-modal" onClick={(e) => e.stopPropagation()}>
                <div className="inquiry-form-header">
                    <h2>Send Inquiry</h2>
                    <button className="close-btn" onClick={onClose} aria-label="Close">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="inquiry-form">
                    <div className="form-group">
                        <label htmlFor="name">Name *</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`input ${errors.name ? 'error' : ''}`}
                            placeholder="Your full name"
                        />
                        {errors.name && <span className="error-message">{errors.name}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email *</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`input ${errors.email ? 'error' : ''}`}
                            placeholder="your.email@example.com"
                        />
                        {errors.email && <span className="error-message">{errors.email}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone">Phone *</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`input ${errors.phone ? 'error' : ''}`}
                            placeholder="+250 XXX XXX XXX"
                        />
                        {errors.phone && <span className="error-message">{errors.phone}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="message">Message *</label>
                        <textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`input ${errors.message ? 'error' : ''}`}
                            placeholder="I'm interested in this property..."
                            rows="5"
                        />
                        {errors.message && <span className="error-message">{errors.message}</span>}
                    </div>

                    {errors.submit && (
                        <div className="error-message submit-error">{errors.submit}</div>
                    )}

                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Sending...
                                </>
                            ) : (
                                'Send Message'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
