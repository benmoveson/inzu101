// Form validation utilities

/**
 * Validate email format
 */
export function validateEmail(email) {
  if (!email) {
    return 'Email is required';
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  
  return null;
}

/**
 * Validate Rwanda phone format
 * Accepts: +250XXXXXXXXX, 250XXXXXXXXX, 07XXXXXXXX, 7XXXXXXXX
 */
export function validatePhone(phone) {
  if (!phone) {
    return 'Phone number is required';
  }
  
  // Remove spaces and dashes
  const cleaned = phone.replace(/[\s-]/g, '');
  
  // Rwanda phone patterns
  const patterns = [
    /^\+250[0-9]{9}$/,     // +250XXXXXXXXX
    /^250[0-9]{9}$/,       // 250XXXXXXXXX
    /^0[0-9]{9}$/,         // 0XXXXXXXXX
    /^[0-9]{9}$/           // XXXXXXXXX
  ];
  
  const isValid = patterns.some(pattern => pattern.test(cleaned));
  
  if (!isValid) {
    return 'Please enter a valid phone number';
  }
  
  return null;
}

/**
 * Validate password strength
 */
export function validatePassword(password) {
  if (!password) {
    return 'Password is required';
  }
  
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  
  if (!/[a-zA-Z]/.test(password)) {
    return 'Password must contain at least one letter';
  }
  
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  
  return null;
}

/**
 * Get password strength level
 */
export function getPasswordStrength(password) {
  if (!password) return { level: 0, label: '', color: '' };
  
  let strength = 0;
  
  // Length
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  
  // Character types
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;
  
  // Map strength to level
  if (strength <= 2) {
    return { level: 1, label: 'Weak', color: '#f44336' };
  } else if (strength <= 4) {
    return { level: 2, label: 'Medium', color: '#ff9800' };
  } else {
    return { level: 3, label: 'Strong', color: '#4caf50' };
  }
}

/**
 * Validate required field
 */
export function validateRequired(value, fieldName = 'This field') {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`;
  }
  return null;
}

/**
 * Validate email or phone (accepts either)
 */
export function validateEmailOrPhone(value) {
  if (!value) {
    return 'Email or phone number is required';
  }
  
  // Check if it looks like an email
  if (value.includes('@')) {
    return validateEmail(value);
  }
  
  // Otherwise treat as phone
  return validatePhone(value);
}
