import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom hook to preserve and restore scroll position when navigating
 * Uses sessionStorage to persist scroll positions across navigation
 */
export function useScrollRestoration(key) {
  const location = useLocation();
  const scrollPositions = useRef({});
  const isRestoringRef = useRef(false);

  useEffect(() => {
    // Load saved scroll positions from sessionStorage on mount
    const saved = sessionStorage.getItem('scrollPositions');
    if (saved) {
      try {
        scrollPositions.current = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse scroll positions:', e);
      }
    }
  }, []);

  useEffect(() => {
    const scrollKey = key || location.pathname;

    // Restore scroll position when component mounts or location changes
    if (scrollPositions.current[scrollKey] !== undefined) {
      isRestoringRef.current = true;
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollPositions.current[scrollKey]);
        // Reset flag after a short delay
        setTimeout(() => {
          isRestoringRef.current = false;
        }, 100);
      });
    }

    // Save scroll position before navigating away
    const handleScroll = () => {
      if (!isRestoringRef.current) {
        scrollPositions.current[scrollKey] = window.scrollY;
        sessionStorage.setItem('scrollPositions', JSON.stringify(scrollPositions.current));
      }
    };

    // Throttle scroll events for performance
    let scrollTimeout;
    const throttledHandleScroll = () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      scrollTimeout = setTimeout(handleScroll, 100);
    };

    window.addEventListener('scroll', throttledHandleScroll);

    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      // Save final scroll position on unmount
      handleScroll();
    };
  }, [location.pathname, key]);

  // Function to manually clear scroll position for a specific key
  const clearScrollPosition = (clearKey) => {
    const keyToClear = clearKey || key || location.pathname;
    delete scrollPositions.current[keyToClear];
    sessionStorage.setItem('scrollPositions', JSON.stringify(scrollPositions.current));
  };

  return { clearScrollPosition };
}
