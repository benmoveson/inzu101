import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

// Rwanda districts for validation
const RWANDA_DISTRICTS = [
  'Kigali', 'Musanze', 'Rubavu', 'Huye', 'Nyanza', 'Muhanga', 'Karongi', 
  'Rusizi', 'Nyagatare', 'Kayonza', 'Kirehe', 'Ngoma', 'Bugesera', 'Gatsibo', 
  'Rwamagana', 'Nyaruguru', 'Gisagara', 'Nyamagabe', 'Kamonyi', 'Ruhango', 
  'Ngororero', 'Rutsiro', 'Nyamasheke', 'Rulindo', 'Gakenke', 'Gicumbi', 'Burera'
];

export default function LocationTracker({ onDistrictChange }) {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [userDistrict, setUserDistrict] = useState(null);
  const [error, setError] = useState(null);
  const { updateUser, user } = useAuth();

  useEffect(() => {
    // Check if user already has a district stored
    if (user?.district) {
      setUserDistrict(user.district);
      setPermissionGranted(true);
      if (onDistrictChange) {
        onDistrictChange(user.district);
      }
      return;
    }

    // Request geolocation permission
    requestLocation();
  }, []);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setPermissionGranted(true);
        const { latitude, longitude } = position.coords;
        
        // Reverse geocode to get district
        try {
          const district = await reverseGeocode(latitude, longitude);
          setUserDistrict(district);
          
          // Store district in user context
          updateUser({ district });
          
          // Notify parent component
          if (onDistrictChange) {
            onDistrictChange(district);
          }
        } catch (err) {
          setError('Failed to determine your district');
          console.error('Reverse geocoding error:', err);
        }
      },
      (err) => {
        setPermissionGranted(false);
        setError('Location permission denied');
        console.error('Geolocation error:', err);
      }
    );
  };

  const reverseGeocode = async (lat, lng) => {
    // Use Nominatim (OpenStreetMap) for reverse geocoding
    // This is a free service, but for production you might want to use a paid service
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'INZU Property Rental Platform'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Geocoding service unavailable');
      }
      
      const data = await response.json();
      
      // Extract district from the address
      // In Rwanda, districts are typically in the 'county' or 'state_district' field
      const district = data.address?.county || 
                      data.address?.state_district || 
                      data.address?.city ||
                      'Kigali'; // Default to Kigali if not found
      
      // Validate against known Rwanda districts
      const matchedDistrict = RWANDA_DISTRICTS.find(d => 
        district.toLowerCase().includes(d.toLowerCase()) || 
        d.toLowerCase().includes(district.toLowerCase())
      );
      
      return matchedDistrict || 'Kigali';
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      // Fallback to Kigali as default
      return 'Kigali';
    }
  };

  // This component doesn't render anything visible
  return null;
}
