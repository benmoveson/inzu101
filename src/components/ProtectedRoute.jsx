import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute component that guards authenticated routes
 * Redirects to login if user is not authenticated
 * Redirects to OTP verification if user is not verified
 */
export default function ProtectedRoute({ children, requireVerified = true }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  // Not authenticated - redirect to login
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authenticated but not verified - redirect to OTP verification
  if (requireVerified && user && !user.isVerified) {
    return <Navigate to="/verify-otp" state={{ from: location }} replace />;
  }

  // Authenticated and verified (or verification not required)
  return children;
}
