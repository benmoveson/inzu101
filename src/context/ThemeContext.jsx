import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [isLoading, setIsLoading] = useState(true);

  // Load theme from localStorage on mount
  useEffect(() => {
    const loadTheme = () => {
      // Force light theme as default
      const savedTheme = localStorage.getItem('inzu_theme');
      
      // Always default to light theme
      const themeToUse = savedTheme === 'dark' ? 'dark' : 'light';
      
      setTheme(themeToUse);
      document.documentElement.setAttribute('data-theme', themeToUse);
      
      if (!savedTheme) {
        localStorage.setItem('inzu_theme', 'light');
      }
      
      setIsLoading(false);
    };

    loadTheme();
  }, []);

  // Toggle theme method
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    // Apply to document root immediately
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // Persist to localStorage
    localStorage.setItem('inzu_theme', newTheme);
    
    // Sync with backend if user is authenticated
    const token = localStorage.getItem('inzu_token');
    if (token) {
      fetch('http://localhost:5000/api/users/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ theme: newTheme })
      }).catch(err => {
        console.error('Failed to sync theme with backend:', err);
      });
    }
  };

  const value = {
    theme,
    toggleTheme,
    isLoading
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
