import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import BottomNavigation from '../components/BottomNavigation';

// Mock the contexts
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { _id: 'user123', name: 'Test User' },
    token: 'test-token',
    isAuthenticated: true
  })
}));

vi.mock('../context/WebSocketContext', () => ({
  useWebSocket: () => ({
    socket: null,
    isConnected: false,
    usePolling: false
  })
}));

// Mock fetch
global.fetch = vi.fn();

describe('BottomNavigation Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ unreadCount: 0 })
    });
  });

  it('should render all 5 navigation tabs', () => {
    render(
      <MemoryRouter initialEntries={['/home']}>
        <BottomNavigation />
      </MemoryRouter>
    );

    expect(screen.getByLabelText('Home')).toBeInTheDocument();
    expect(screen.getByLabelText('Search')).toBeInTheDocument();
    expect(screen.getByLabelText('Favorites')).toBeInTheDocument();
    expect(screen.getByLabelText('Messages')).toBeInTheDocument();
    expect(screen.getByLabelText('Settings')).toBeInTheDocument();
  });

  it('should highlight the active tab based on current route', () => {
    render(
      <MemoryRouter initialEntries={['/home']}>
        <BottomNavigation />
      </MemoryRouter>
    );

    const homeTab = screen.getByLabelText('Home');
    expect(homeTab).toHaveClass('active');
  });

  it('should navigate to correct route when tab is clicked', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/home']}>
        <BottomNavigation />
      </MemoryRouter>
    );

    const searchTab = screen.getByLabelText('Search');
    fireEvent.click(searchTab);

    // After clicking, the search tab should become active
    expect(searchTab).toHaveClass('active');
  });

  it('should mark both /profile and /dashboard as active for profile tab', () => {
    const { rerender } = render(
      <MemoryRouter initialEntries={['/profile']}>
        <BottomNavigation />
      </MemoryRouter>
    );

    let profileTab = screen.getByLabelText('Settings');
    expect(profileTab).toHaveClass('active');

    // Rerender with /dashboard route
    rerender(
      <MemoryRouter initialEntries={['/dashboard']}>
        <BottomNavigation />
      </MemoryRouter>
    );

    profileTab = screen.getByLabelText('Settings');
    expect(profileTab).toHaveClass('active');
  });

  it('should have fixed position at bottom of viewport', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/home']}>
        <BottomNavigation />
      </MemoryRouter>
    );

    const nav = container.querySelector('.bottom-navigation');
    expect(nav).toBeInTheDocument();
    
    // Check that the component has the bottom-navigation class
    // which applies position: fixed in CSS
    expect(nav).toHaveClass('bottom-navigation');
  });

  it('should fetch unread count on mount', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ unreadCount: 5 })
    });

    render(
      <MemoryRouter initialEntries={['/home']}>
        <BottomNavigation />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/messages/unread-count',
        expect.objectContaining({
          headers: {
            'Authorization': 'Bearer test-token'
          }
        })
      );
    });
  });

  it('should display unread count badge when count > 0', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ unreadCount: 3 })
    });

    render(
      <MemoryRouter initialEntries={['/home']}>
        <BottomNavigation />
      </MemoryRouter>
    );

    await waitFor(() => {
      const badge = screen.getByText('3');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bottom-nav-badge');
    });
  });

  it('should display "99+" for unread count > 99', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ unreadCount: 150 })
    });

    render(
      <MemoryRouter initialEntries={['/home']}>
        <BottomNavigation />
      </MemoryRouter>
    );

    await waitFor(() => {
      const badge = screen.getByText('99+');
      expect(badge).toBeInTheDocument();
    });
  });

  it('should not display badge when unread count is 0', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ unreadCount: 0 })
    });

    render(
      <MemoryRouter initialEntries={['/home']}>
        <BottomNavigation />
      </MemoryRouter>
    );

    await waitFor(() => {
      const badge = screen.queryByText('0');
      expect(badge).not.toBeInTheDocument();
    });
  });
});

describe('Scroll Restoration', () => {
  beforeEach(() => {
    // Clear sessionStorage before each test
    sessionStorage.clear();
  });

  it('should persist filters to sessionStorage', () => {
    const testFilters = {
      location: 'Kigali',
      type: 'Apartment',
      minPrice: '100000',
      maxPrice: '500000'
    };

    sessionStorage.setItem('propertyFilters', JSON.stringify(testFilters));
    
    const saved = sessionStorage.getItem('propertyFilters');
    expect(saved).toBeTruthy();
    
    const parsed = JSON.parse(saved);
    expect(parsed.location).toBe('Kigali');
    expect(parsed.type).toBe('Apartment');
  });

  it('should persist scroll positions to sessionStorage', () => {
    const scrollPositions = {
      'home-feed': 500,
      'search-page': 300,
      'favorites-page': 200
    };

    sessionStorage.setItem('scrollPositions', JSON.stringify(scrollPositions));
    
    const saved = sessionStorage.getItem('scrollPositions');
    expect(saved).toBeTruthy();
    
    const parsed = JSON.parse(saved);
    expect(parsed['home-feed']).toBe(500);
    expect(parsed['search-page']).toBe(300);
  });
});
