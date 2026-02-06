// ===========================================
// USE SOCKET HOOK
// Custom hook for Socket.io connection
// ===========================================

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

let socket: Socket | null = null;

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const { token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Only connect if we have a token and haven't connected yet
    if (token && !socket) {
      const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

      socket = io(SOCKET_URL, {
        auth: {
          token
        },
        autoConnect: true
      });

      socket.on('connect', () => {
        console.log('✅ Socket connected');
        setIsConnected(true);
      });

      socket.on('disconnect', () => {
        console.log('❌ Socket disconnected');
        setIsConnected(false);
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });
    }

    // Cleanup on unmount
    return () => {
      if (socket && !token) {
        socket.disconnect();
        socket = null;
      }
    };
  }, [token]);

  return socket;
};

export const getSocket = () => socket;
