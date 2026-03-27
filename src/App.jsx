import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { ThemeProvider } from './context/ThemeContext';
import { WebSocketProvider } from './context/WebSocketContext';
import Header from './components/Header';
import BottomNavigation from './components/BottomNavigation';
import SessionExpiredModal from './components/SessionExpiredModal';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import PropertyListPage from './pages/PropertyListPage';
import SearchPage from './pages/SearchPage';
import PropertyDetails from './pages/PropertyDetails';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Preferences from './pages/Preferences';
import Security from './pages/Security';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Signup from './pages/Signup';
import OTPVerification from './pages/OTPVerification';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AddProperty from './pages/AddProperty';
import SplashScreen from './pages/SplashScreen';
import Messages from './pages/Messages';
import NotificationCenter from './pages/NotificationCenter';
import TermsAndConditions from './pages/TermsAndConditions';
import './App.css';

function AppLayout({ children, onCategoryChange, onPropertyTypeChange }) {
  const location = useLocation();
  const hiddenLayoutRoutes = ['/splash', '/login', '/signup', '/verify-otp', '/forgot-password', '/reset-password'];
  const shouldHideLayout = hiddenLayoutRoutes.includes(location.pathname);
  
  // Routes where bottom navigation should be shown
  const bottomNavRoutes = ['/home', '/search', '/favorites', '/messages', '/dashboard', '/profile', '/property'];
  const shouldShowBottomNav = bottomNavRoutes.some(route => location.pathname.startsWith(route));

  return (
    <div className="app">
      {!shouldHideLayout && <Header onCategoryChange={onCategoryChange} onPropertyTypeChange={onPropertyTypeChange} />}
      <main className="main-content">
        {children}
      </main>
      {shouldShowBottomNav && <BottomNavigation />}
    </div>
  );
}

function InitialRedirect() {
  const { isAuthenticated } = useAuth();
  const [hasShownSplash, setHasShownSplash] = useState(false);

  useEffect(() => {
    const splashShown = sessionStorage.getItem('splashShown');
    if (splashShown) {
      setHasShownSplash(true);
    }
  }, []);

  // Show splash screen on first visit
  if (!hasShownSplash) {
    sessionStorage.setItem('splashShown', 'true');
    return <Navigate to="/splash" replace />;
  }

  // After splash, redirect based on authentication status
  if (isAuthenticated()) {
    return <Navigate to="/home" replace />;
  } else {
    return <Navigate to="/login" replace />;
  }
}

function App() {
  const [categoryFilter, setCategoryFilter] = useState('rent');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState('all');

  const handleCategoryChange = (category) => {
    console.log('App: Category changed to', category);
    setCategoryFilter(category);
  };

  const handlePropertyTypeChange = (propertyType) => {
    setPropertyTypeFilter(propertyType);
  };

  return (
    <ThemeProvider>
      <FavoritesProvider>
        <WebSocketProvider>
          <Router>
            <SessionExpiredModal />
            <AppLayout onCategoryChange={handleCategoryChange} onPropertyTypeChange={handlePropertyTypeChange}>
              <Routes>
                <Route path="/splash" element={<SplashScreen />} />
                <Route path="/" element={<InitialRedirect />} />
              
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/verify-otp" element={<OTPVerification />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/terms" element={<TermsAndConditions />} />
              <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
              
              {/* Protected routes - require authentication and verification */}
              <Route path="/home" element={
                <ProtectedRoute>
                  <Home categoryFilter={categoryFilter} propertyTypeFilter={propertyTypeFilter} />
                </ProtectedRoute>
              } />
              <Route path="/houses" element={
                <ProtectedRoute>
                  <PropertyListPage propertyType="house" categoryFilter={categoryFilter} />
                </ProtectedRoute>
              } />
              <Route path="/rooms" element={
                <ProtectedRoute>
                  <PropertyListPage propertyType="room" categoryFilter={categoryFilter} />
                </ProtectedRoute>
              } />
              <Route path="/apartments" element={
                <ProtectedRoute>
                  <PropertyListPage propertyType="apartment" categoryFilter={categoryFilter} />
                </ProtectedRoute>
              } />
              <Route path="/hotels" element={
                <ProtectedRoute>
                  <PropertyListPage propertyType="hotel" categoryFilter={categoryFilter} />
                </ProtectedRoute>
              } />
              <Route path="/search" element={
                <ProtectedRoute>
                  <SearchPage />
                </ProtectedRoute>
              } />
              <Route path="/property/:id" element={
                <ProtectedRoute>
                  <PropertyDetails />
                </ProtectedRoute>
              } />
              <Route path="/favorites" element={
                <ProtectedRoute>
                  <Favorites />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/profile/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/profile/preferences" element={
                <ProtectedRoute>
                  <Preferences />
                </ProtectedRoute>
              } />
              <Route path="/profile/security" element={
                <ProtectedRoute>
                  <Security />
                </ProtectedRoute>
              } />
              <Route path="/profile/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/notifications" element={
                <ProtectedRoute>
                  <NotificationCenter />
                </ProtectedRoute>
              } />
              <Route path="/messages" element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              } />
              <Route path="/add-property" element={
                <ProtectedRoute>
                  <AddProperty />
                </ProtectedRoute>
              } />
            </Routes>
          </AppLayout>
        </Router>
      </WebSocketProvider>
      </FavoritesProvider>
    </ThemeProvider>
  );
}

export default App;
