import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  async connect(): Promise<Socket> {
    if (this.socket?.connected) {
      return this.socket;
    }

    const token = await AsyncStorage.getItem('token');
    const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

    this.socket = io(BASE_URL, {
      auth: {
        token: token ? `Bearer ${token}` : null,
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        this.attemptReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.attemptReconnect();
    });

    return this.socket;
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.socket?.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Note collaboration methods
  joinNoteRoom(noteId: string) {
    if (this.socket?.connected) {
      this.socket.emit('join-note', noteId);
    }
  }

  leaveNoteRoom(noteId: string) {
    if (this.socket?.connected) {
      this.socket.emit('leave-note', noteId);
    }
  }

  updateNote(noteId: string, content: string, title?: string) {
    if (this.socket?.connected) {
      this.socket.emit('note-update', { noteId, content, title });
    }
  }

  startTyping(noteId: string) {
    if (this.socket?.connected) {
      this.socket.emit('typing-start', noteId);
    }
  }

  stopTyping(noteId: string) {
    if (this.socket?.connected) {
      this.socket.emit('typing-stop', noteId);
    }
  }

  // Event listeners
  onNoteUpdated(callback: (data: any) => void) {
    this.socket?.on('note-updated', callback);
  }

  onUserTyping(callback: (data: { userId: string }) => void) {
    this.socket?.on('user-typing', callback);
  }

  onUserStoppedTyping(callback: (data: { userId: string }) => void) {
    this.socket?.on('user-stopped-typing', callback);
  }

  onNoteCreated(callback: (data: any) => void) {
    this.socket?.on('note-created', callback);
  }

  // Remove listeners
  offNoteUpdated() {
    this.socket?.off('note-updated');
  }

  offUserTyping() {
    this.socket?.off('user-typing');
  }

  offUserStoppedTyping() {
    this.socket?.off('user-stopped-typing');
  }

  offNoteCreated() {
    this.socket?.off('note-created');
  }
}

export const websocketService = new WebSocketService();
