export type Priority = 'low' | 'medium' | 'high';

export interface TaskItem {
  id: string | number;
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: string;
  tags: string[];
  completed?: boolean;
}

export type NoteType = 'text' | 'audio' | 'image';

export interface NoteItem {
  id: string | number;
  title: string;
  content: string;
  type: NoteType;
  tags: string[];
  favorite: boolean;
  date: string;
  color?: string;
}

export type PomodoroType = 'focus' | 'break' | 'longBreak';

export interface PomodoroSession {
  id: string;
  type: PomodoroType;
  startedAt: string;
  endedAt: string;
  taskId?: string | number;
}

export type ThemePreference = 'light' | 'dark' | 'system';

export interface OnboardingPreferences {
  goals: string[];
  preferredViews: Array<'tasks' | 'notes' | 'focus' | 'dashboard'>;
  enableSmartSuggestions: boolean;
  theme: ThemePreference;
}

export interface UserStub {
  id: string;
  name: string;
  email?: string;
}

