import { useEffect, useState, useCallback } from 'react';
import { websocketService } from '../services/websocket';

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    const connect = async () => {
      try {
        await websocketService.connect();
        setIsConnected(true);
        setConnectionError(null);
      } catch (error) {
        console.error('Failed to connect to WebSocket:', error);
        setConnectionError('Failed to connect to server');
        setIsConnected(false);
      }
    };

    connect();

    // Cleanup on unmount
    return () => {
      websocketService.disconnect();
    };
  }, []);

  const reconnect = useCallback(async () => {
    try {
      await websocketService.connect();
      setIsConnected(true);
      setConnectionError(null);
    } catch (error) {
      console.error('Failed to reconnect to WebSocket:', error);
      setConnectionError('Failed to reconnect to server');
    }
  }, []);

  return {
    isConnected,
    connectionError,
    reconnect,
  };
};
