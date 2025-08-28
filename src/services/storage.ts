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
  pomoSessions: 'pomodoroSessions',
  calendarEvents: 'calendarEvents',
  googleConnected: 'googleConnected',
  habits: 'habits',
  bills: 'bills',
  receivables: 'receivables',
  transactions: 'transactions',
  subscription: 'subscription',
  appearanceExtraTheme: 'appearance.extraTheme',
  appearanceAvatar: 'appearance.avatar',
  appearanceIconPack: 'appearance.iconPack',
  appearanceDensity: 'appearance.density',
  appearanceFont: 'appearance.font'
} as const;

