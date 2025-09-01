import { useEffect, useState, useCallback } from 'react';
import { websocketService } from '../services/websocket';

interface NoteUpdate {
  noteId: string;
  content: string;
  title?: string;
  updatedBy: string;
  timestamp: string;
}

interface TypingUser {
  userId: string;
}

interface UseNotesCollaborationProps {
  noteId: string;
  onNoteUpdate?: (update: NoteUpdate) => void;
  onUserTyping?: (user: TypingUser) => void;
  onUserStoppedTyping?: (user: TypingUser) => void;
  onNoteCreated?: (data: any) => void;
}

export const useNotesCollaboration = ({
  noteId,
  onNoteUpdate,
  onUserTyping,
  onUserStoppedTyping,
  onNoteCreated,
}: UseNotesCollaborationProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!noteId) return;

    // Join the note room
    websocketService.joinNoteRoom(noteId);
    setIsConnected(websocketService.isConnected());

    // Set up event listeners
    const handleNoteUpdate = (data: NoteUpdate) => {
      onNoteUpdate?.(data);
    };

    const handleUserTyping = (data: TypingUser) => {
      setTypingUsers(prev => new Set(prev).add(data.userId));
      onUserTyping?.(data);
    };

    const handleUserStoppedTyping = (data: TypingUser) => {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
      onUserStoppedTyping?.(data);
    };

    const handleNoteCreated = (data: any) => {
      onNoteCreated?.(data);
    };

    websocketService.onNoteUpdated(handleNoteUpdate);
    websocketService.onUserTyping(handleUserTyping);
    websocketService.onUserStoppedTyping(handleUserStoppedTyping);
    websocketService.onNoteCreated(handleNoteCreated);

    // Cleanup function
    return () => {
      websocketService.leaveNoteRoom(noteId);
      websocketService.offNoteUpdated();
      websocketService.offUserTyping();
      websocketService.offUserStoppedTyping();
      websocketService.offNoteCreated();
      setTypingUsers(new Set());
    };
  }, [noteId, onNoteUpdate, onUserTyping, onUserStoppedTyping, onNoteCreated]);

  const updateNote = useCallback((content: string, title?: string) => {
    if (noteId) {
      websocketService.updateNote(noteId, content, title);
    }
  }, [noteId]);

  const startTyping = useCallback(() => {
    if (noteId) {
      websocketService.startTyping(noteId);
    }
  }, [noteId]);

  const stopTyping = useCallback(() => {
    if (noteId) {
      websocketService.stopTyping(noteId);
    }
  }, [noteId]);

  return {
    isConnected,
    typingUsers: Array.from(typingUsers),
    updateNote,
    startTyping,
    stopTyping,
  };
};
