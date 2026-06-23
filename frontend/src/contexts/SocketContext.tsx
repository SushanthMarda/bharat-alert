// frontend/src/contexts/SocketContext.tsx
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';

// Context value interface
interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  emit: (event: string, payload?: any) => void;
  on: (event: string, handler: (payload: any) => void) => void;
}

// Create context with default empty values
const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
  emit: () => {},
  on: () => {},
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // Build the connection URL; fallback to localhost if env var not set
  const url = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:5000';

  // Initialise socket only once (singleton per token/url)
  useEffect(() => {
    const query = token ? { token } : undefined;
    const sock = io(url, {
      query,
      transports: ['websocket'], // enforce websocket transport
    });

    socketRef.current = sock;
    setSocket(sock);

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);
    const handleConnectError = (err: Error) => console.warn('Socket connect_error:', err);

    sock.on('connect', handleConnect);
    sock.on('disconnect', handleDisconnect);
    sock.on('connect_error', handleConnectError);

    // Clean up listeners and disconnect on unmount
    return () => {
      sock.off('connect', handleConnect);
      sock.off('disconnect', handleDisconnect);
      sock.off('connect_error', handleConnectError);
      sock.disconnect();
    };
  }, [url, token]);

  // Wrapper to emit only when socket is connected
  const emit = (event: string, payload?: any) => {
    if (socket && isConnected) {
      socket.emit(event, payload);
    }
  };

  // Wrapper to register listeners; removal is handled by socket cleanup
  const on = (event: string, handler: (payload: any) => void) => {
    if (!socket) return;
    socket.on(event, handler);
  };

  const contextValue: SocketContextValue = {
    socket,
    isConnected,
    emit,
    on,
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};

// Hook for consuming the socket context
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
