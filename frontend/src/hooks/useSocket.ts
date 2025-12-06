import { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import socketService from '@/services/socket.service';
import authService from '@/services/auth.service';

export const useSocket = () => {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = authService.getToken();
    
    if (!token) {
      console.warn('⚠️ useSocket: No authentication token found');
      setError('No authentication token found. Please login first.');
      return;
    }

    console.log('🔌 useSocket: Initializing socket connection...');

    // Connect to socket
    try {
      const socket = socketService.connect(token);
      socketRef.current = socket;

      // Update connection status
      socket.on('connect', () => {
        console.log('✅ useSocket: Socket connected successfully');
        setConnected(true);
        setError(null);
      });

      socket.on('disconnect', (reason) => {
        console.log('🔌 useSocket: Socket disconnected:', reason);
        setConnected(false);
      });

      socket.on('connect_error', (err) => {
        console.error('❌ useSocket: Connection error:', err);
        setError(err.message || 'Connection failed');
        setConnected(false);
      });

      socket.on('error', (err: any) => {
        console.error('❌ useSocket: Socket error:', err);
        setError(err.message || 'Socket error occurred');
      });

      // Log initial connection attempt
      if (socket.connected) {
        console.log('✅ useSocket: Socket already connected');
        setConnected(true);
      }

    } catch (err: any) {
      console.error('❌ useSocket: Failed to initialize:', err);
      setError(err.message || 'Failed to connect to socket');
    }

    // Cleanup on unmount
    return () => {
      console.log('🔌 useSocket: Cleaning up...');
      // Don't disconnect here - let socket service manage it
      // socketService.disconnect();
    };
  }, []);

  return {
    socket: socketRef.current,
    connected,
    error,
    socketService
  };
};

export default useSocket;

