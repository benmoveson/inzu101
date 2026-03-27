import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const WebSocketContext = createContext(null);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [usePolling, setUsePolling] = useState(false);
  const { user, token } = useAuth();
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const pollingIntervalRef = useRef(null);
  const lastUpdateTimestampRef = useRef(null);
  const maxReconnectAttempts = 5;

  // Initialize timestamp on first render
  useEffect(() => {
    if (lastUpdateTimestampRef.current === null) {
      lastUpdateTimestampRef.current = Date.now();
    }
  }, []);

  // Polling function to check for updates
  const pollForUpdates = useCallback(async () => {
    if (!token) return;

    try {
      const serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      // Poll for unread message count
      const messagesRes = await fetch(`${serverUrl}/api/messages/unread-count`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (messagesRes.ok) {
        const data = await messagesRes.json();
        // Emit custom event for polling updates
        window.dispatchEvent(new CustomEvent('polling-update', { 
          detail: { 
            type: 'messages',
            unreadCount: data.unreadCount 
          } 
        }));
      }

      // Poll for property updates (check if there are new properties since last check)
      const propertiesRes = await fetch(`${serverUrl}/api/properties?page=1&limit=1`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (propertiesRes.ok) {
        const data = await propertiesRes.json();
        if (data.properties && data.properties.length > 0) {
          const latestProperty = data.properties[0];
          const propertyTimestamp = new Date(latestProperty.createdAt).getTime();
          
          // If there's a new property since last check, emit event
          if (propertyTimestamp > lastUpdateTimestampRef.current) {
            window.dispatchEvent(new CustomEvent('polling-update', { 
              detail: { 
                type: 'new_property',
                property: latestProperty 
              } 
            }));
            lastUpdateTimestampRef.current = propertyTimestamp;
          }
        }
      }
    } catch (error) {
      console.error('Polling error:', error);
    }
  }, [token]);

  useEffect(() => {
    if (!user || !token) {
      // Disconnect if user logs out
      if (socket) {
        socket.disconnect();
      }
      setSocket(null);
      setIsConnected(false);
      
      // Clear polling interval
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      
      return;
    }

    // Create socket connection
    const serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const newSocket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: maxReconnectAttempts
    });

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setUsePolling(false);
      reconnectAttemptsRef.current = 0;
      
      // Clear polling interval if WebSocket connects
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      
      // Authenticate with user ID
      newSocket.emit('authenticate', user._id);
    });

    newSocket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
      
      // Implement exponential backoff for reconnection
      reconnectAttemptsRef.current += 1;
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
        console.log(`Reconnecting in ${delay}ms...`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          newSocket.connect();
        }, delay);
      } else {
        // If max reconnection attempts reached, fall back to polling
        console.log('Max reconnection attempts reached. Falling back to polling...');
        setUsePolling(true);
        
        // Start polling every 30 seconds
        if (!pollingIntervalRef.current) {
          pollingIntervalRef.current = setInterval(pollForUpdates, 30000);
          // Poll immediately
          pollForUpdates();
        }
      }
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      newSocket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token, pollForUpdates]);

  const value = {
    socket,
    isConnected,
    usePolling
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
