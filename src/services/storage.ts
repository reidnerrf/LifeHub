type StorableValue = unknown;

export const storage = {
  get<T = StorableValue>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },
  set(key: string, value: StorableValue): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  },
  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {}
  }
};

export default storage;

export const KEYS = {
  theme: 'themePreference',
  onboarding: 'onboardingPreferences',
  user: 'userStub',
  notes: 'notes',
  tasks: 'tasks',
  pomoSessions: 'pomodoroSessions'
} as const;

