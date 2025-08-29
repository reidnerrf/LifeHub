import { create } from 'zustand';

export interface FocusSession {
  id: string;
  type: 'pomodoro' | 'flowtime' | 'deepwork';
  mode: 'focus' | 'break' | 'longBreak';
  duration: number; // em segundos
  actualDuration: number; // duração real
  startTime: Date;
  endTime?: Date;
  completed: boolean;
  interrupted: boolean;
  interruptions: number;
  notes?: string;
  tags: string[];
  playlist?: string;
  ambientSound?: string;
  createdAt: Date;
}

export interface FocusReport {
  id: string;
  date: Date;
  totalFocusTime: number;
  totalBreakTime: number;
  sessionsCompleted: number;
  sessionsInterrupted: number;
  averageSessionLength: number;
  productivityScore: number;
  mostProductiveTime: string;
  tags: string[];
  notes?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  tracks: string[];
  duration: number;
  category: 'focus' | 'relax' | 'energy' | 'nature' | 'ambient';
  isCustom: boolean;
}

export interface AmbientSound {
  id: string;
  name: string;
  description: string;
  category: 'nature' | 'white-noise' | 'instrumental' | 'lo-fi' | 'classical';
  duration: number;
  volume: number;
  isLooping: boolean;
}

export type FocusMode = 'pomodoro' | 'flowtime' | 'deepwork';

interface FocusStore {
  // Estado atual
  currentSession: FocusSession | null;
  isRunning: boolean;
  remainingTime: number;
  mode: FocusMode;
  currentPlaylist: Playlist | null;
  currentAmbientSound: AmbientSound | null;
  isDistractionBlocking: boolean;
  
  // Dados
  sessions: FocusSession[];
  reports: FocusReport[];
  playlists: Playlist[];
  ambientSounds: AmbientSound[];
  
  // Configurações
  settings: {
    pomodoroFocus: number; // 25 min
    pomodoroBreak: number; // 5 min
    pomodoroLongBreak: number; // 15 min
    flowtimeMin: number; // 25 min
    flowtimeMax: number; // 90 min
    deepworkMin: number; // 90 min
    autoStartBreaks: boolean;
    autoStartSessions: boolean;
    distractionBlocking: boolean;
    notifications: boolean;
    soundEnabled: boolean;
    volume: number;
  };
  
  // Ações
  startSession: (type: FocusMode, duration?: number) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  stopSession: () => void;
  completeSession: () => void;
  interruptSession: () => void;
  addSession: (session: Omit<FocusSession, 'id' | 'createdAt'>) => void;
  updateSession: (id: string, updates: Partial<FocusSession>) => void;
  deleteSession: (id: string) => void;
  
  // Relatórios
  generateDailyReport: (date: Date) => FocusReport;
  generateWeeklyReport: (startDate: Date) => FocusReport[];
  generateMonthlyReport: (year: number, month: number) => FocusReport;
  
  // Playlists e Sons
  setPlaylist: (playlist: Playlist | null) => void;
  setAmbientSound: (sound: AmbientSound | null) => void;
  createPlaylist: (playlist: Omit<Playlist, 'id'>) => void;
  updatePlaylist: (id: string, updates: Partial<Playlist>) => void;
  deletePlaylist: (id: string) => void;
  
  // Configurações
  updateSettings: (settings: Partial<FocusStore['settings']>) => void;
  toggleDistractionBlocking: () => void;
  
  // Análises
  getProductivityStats: (days: number) => {
    totalFocusTime: number;
    averageSessionLength: number;
    completionRate: number;
    mostProductiveHour: string;
    bestDayOfWeek: string;
    productivityTrend: 'increasing' | 'decreasing' | 'stable';
  };
  
  getSessionHistory: (type?: FocusMode, days?: number) => FocusSession[];
  getFocusStreak: () => number;
  getWeeklyGoal: () => { target: number; current: number; percentage: number };
}

export const useFocus = create<FocusStore>((set, get) => ({
  // Estado inicial
  currentSession: null,
  isRunning: false,
  remainingTime: 25 * 60,
  mode: 'pomodoro',
  currentPlaylist: null,
  currentAmbientSound: null,
  isDistractionBlocking: false,
  
  sessions: [],
  reports: [],
  
  // Playlists padrão
  playlists: [
    {
      id: '1',
      name: 'Foco Profundo',
      description: 'Música instrumental para concentração máxima',
      tracks: ['track1', 'track2', 'track3'],
      duration: 3600,
      category: 'focus',
      isCustom: false,
    },
    {
      id: '2',
      name: 'Lo-Fi Study',
      description: 'Beats relaxantes para estudo',
      tracks: ['track4', 'track5', 'track6'],
      duration: 7200,
      category: 'lo-fi',
      isCustom: false,
    },
    {
      id: '3',
      name: 'Natureza Calmante',
      description: 'Sons da natureza para relaxamento',
      tracks: ['rain', 'forest', 'ocean'],
      duration: 5400,
      category: 'nature',
      isCustom: false,
    },
  ],
  
  // Sons ambientes padrão
  ambientSounds: [
    {
      id: '1',
      name: 'Chuva Suave',
      description: 'Som de chuva para concentração',
      category: 'nature',
      duration: 3600,
      volume: 0.7,
      isLooping: true,
    },
    {
      id: '2',
      name: 'Ruído Branco',
      description: 'Ruído branco para bloquear distrações',
      category: 'white-noise',
      duration: 7200,
      volume: 0.5,
      isLooping: true,
    },
    {
      id: '3',
      name: 'Piano Clássico',
      description: 'Música clássica para foco',
      category: 'classical',
      duration: 5400,
      volume: 0.6,
      isLooping: true,
    },
  ],
  
  // Configurações padrão
  settings: {
    pomodoroFocus: 25 * 60,
    pomodoroBreak: 5 * 60,
    pomodoroLongBreak: 15 * 60,
    flowtimeMin: 25 * 60,
    flowtimeMax: 90 * 60,
    deepworkMin: 90 * 60,
    autoStartBreaks: true,
    autoStartSessions: false,
    distractionBlocking: true,
    notifications: true,
    soundEnabled: true,
    volume: 0.7,
  },
  
  startSession: (type, duration) => {
    const { settings } = get();
    let sessionDuration = duration;
    
    if (!sessionDuration) {
      switch (type) {
        case 'pomodoro':
          sessionDuration = settings.pomodoroFocus;
          break;
        case 'flowtime':
          sessionDuration = settings.flowtimeMin;
          break;
        case 'deepwork':
          sessionDuration = settings.deepworkMin;
          break;
      }
    }
    
    const newSession: FocusSession = {
      id: Date.now().toString(),
      type,
      mode: 'focus',
      duration: sessionDuration,
      actualDuration: 0,
      startTime: new Date(),
      completed: false,
      interrupted: false,
      interruptions: 0,
      tags: [],
      createdAt: new Date(),
    };
    
    set({
      currentSession: newSession,
      isRunning: true,
      remainingTime: sessionDuration,
      mode: type,
      isDistractionBlocking: get().settings.distractionBlocking,
    });
  },
  
  pauseSession: () => {
    set({ isRunning: false });
  },
  
  resumeSession: () => {
    set({ isRunning: true });
  },
  
  stopSession: () => {
    const { currentSession } = get();
    if (currentSession) {
      const updatedSession = {
        ...currentSession,
        endTime: new Date(),
        actualDuration: Math.floor((new Date().getTime() - currentSession.startTime.getTime()) / 1000),
        interrupted: true,
      };
      
      get().addSession(updatedSession);
    }
    
    set({
      currentSession: null,
      isRunning: false,
      remainingTime: get().settings.pomodoroFocus,
      isDistractionBlocking: false,
    });
  },
  
  completeSession: () => {
    const { currentSession } = get();
    if (currentSession) {
      const updatedSession = {
        ...currentSession,
        endTime: new Date(),
        actualDuration: Math.floor((new Date().getTime() - currentSession.startTime.getTime()) / 1000),
        completed: true,
      };
      
      get().addSession(updatedSession);
    }
    
    set({
      currentSession: null,
      isRunning: false,
      remainingTime: get().settings.pomodoroFocus,
      isDistractionBlocking: false,
    });
  },
  
  interruptSession: () => {
    const { currentSession } = get();
    if (currentSession) {
      const updatedSession = {
        ...currentSession,
        interruptions: currentSession.interruptions + 1,
      };
      
      set({ currentSession: updatedSession });
    }
  },
  
  addSession: (session) => {
    const newSession: FocusSession = {
      ...session,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    
    set((state) => ({
      sessions: [newSession, ...state.sessions],
    }));
  },
  
  updateSession: (id, updates) => {
    set((state) => ({
      sessions: state.sessions.map((session) =>
        session.id === id ? { ...session, ...updates } : session
      ),
    }));
  },
  
  deleteSession: (id) => {
    set((state) => ({
      sessions: state.sessions.filter((session) => session.id !== id),
    }));
  },
  
  generateDailyReport: (date) => {
    const { sessions } = get();
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    
    const daySessions = sessions.filter((session) => {
      const sessionDate = new Date(session.startTime);
      return sessionDate >= dayStart && sessionDate <= dayEnd;
    });
    
    const totalFocusTime = daySessions
      .filter((s) => s.mode === 'focus')
      .reduce((sum, s) => sum + s.actualDuration, 0);
    
    const totalBreakTime = daySessions
      .filter((s) => s.mode === 'break' || s.mode === 'longBreak')
      .reduce((sum, s) => sum + s.actualDuration, 0);
    
    const completedSessions = daySessions.filter((s) => s.completed).length;
    const interruptedSessions = daySessions.filter((s) => s.interrupted).length;
    
    const averageSessionLength = daySessions.length > 0
      ? daySessions.reduce((sum, s) => sum + s.actualDuration, 0) / daySessions.length
      : 0;
    
    const productivityScore = daySessions.length > 0
      ? (completedSessions / daySessions.length) * 100
      : 0;
    
    // Encontrar hora mais produtiva
    const hourStats = new Array(24).fill(0);
    daySessions.forEach((session) => {
      const hour = new Date(session.startTime).getHours();
      hourStats[hour] += session.actualDuration;
    });
    const mostProductiveHour = hourStats.indexOf(Math.max(...hourStats));
    
    const report: FocusReport = {
      id: Date.now().toString(),
      date,
      totalFocusTime,
      totalBreakTime,
      sessionsCompleted: completedSessions,
      sessionsInterrupted: interruptedSessions,
      averageSessionLength,
      productivityScore,
      mostProductiveTime: `${mostProductiveHour}:00`,
      tags: [],
    };
    
    set((state) => ({
      reports: [report, ...state.reports],
    }));
    
    return report;
  },
  
  generateWeeklyReport: (startDate) => {
    const reports: FocusReport[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      reports.push(get().generateDailyReport(date));
    }
    return reports;
  },
  
  generateMonthlyReport: (year, month) => {
    const { sessions } = get();
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);
    
    const monthSessions = sessions.filter((session) => {
      const sessionDate = new Date(session.startTime);
      return sessionDate >= monthStart && sessionDate <= monthEnd;
    });
    
    const totalFocusTime = monthSessions
      .filter((s) => s.mode === 'focus')
      .reduce((sum, s) => sum + s.actualDuration, 0);
    
    const totalBreakTime = monthSessions
      .filter((s) => s.mode === 'break' || s.mode === 'longBreak')
      .reduce((sum, s) => sum + s.actualDuration, 0);
    
    const completedSessions = monthSessions.filter((s) => s.completed).length;
    const interruptedSessions = monthSessions.filter((s) => s.interrupted).length;
    
    const averageSessionLength = monthSessions.length > 0
      ? monthSessions.reduce((sum, s) => sum + s.actualDuration, 0) / monthSessions.length
      : 0;
    
    const productivityScore = monthSessions.length > 0
      ? (completedSessions / monthSessions.length) * 100
      : 0;
    
    const report: FocusReport = {
      id: Date.now().toString(),
      date: new Date(year, month, 1),
      totalFocusTime,
      totalBreakTime,
      sessionsCompleted: completedSessions,
      sessionsInterrupted: interruptedSessions,
      averageSessionLength,
      productivityScore,
      mostProductiveTime: 'N/A',
      tags: [],
    };
    
    return report;
  },
  
  setPlaylist: (playlist) => {
    set({ currentPlaylist: playlist });
  },
  
  setAmbientSound: (sound) => {
    set({ currentAmbientSound: sound });
  },
  
  createPlaylist: (playlist) => {
    const newPlaylist: Playlist = {
      ...playlist,
      id: Date.now().toString(),
    };
    
    set((state) => ({
      playlists: [...state.playlists, newPlaylist],
    }));
  },
  
  updatePlaylist: (id, updates) => {
    set((state) => ({
      playlists: state.playlists.map((playlist) =>
        playlist.id === id ? { ...playlist, ...updates } : playlist
      ),
    }));
  },
  
  deletePlaylist: (id) => {
    set((state) => ({
      playlists: state.playlists.filter((playlist) => playlist.id !== id),
    }));
  },
  
  updateSettings: (newSettings) => {
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    }));
  },
  
  toggleDistractionBlocking: () => {
    set((state) => ({
      isDistractionBlocking: !state.isDistractionBlocking,
    }));
  },
  
  getProductivityStats: (days) => {
    const { sessions } = get();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const recentSessions = sessions.filter((session) => 
      new Date(session.startTime) >= cutoffDate
    );
    
    const totalFocusTime = recentSessions
      .filter((s) => s.mode === 'focus')
      .reduce((sum, s) => sum + s.actualDuration, 0);
    
    const averageSessionLength = recentSessions.length > 0
      ? recentSessions.reduce((sum, s) => sum + s.actualDuration, 0) / recentSessions.length
      : 0;
    
    const completionRate = recentSessions.length > 0
      ? (recentSessions.filter((s) => s.completed).length / recentSessions.length) * 100
      : 0;
    
    // Hora mais produtiva
    const hourStats = new Array(24).fill(0);
    recentSessions.forEach((session) => {
      const hour = new Date(session.startTime).getHours();
      hourStats[hour] += session.actualDuration;
    });
    const mostProductiveHour = `${hourStats.indexOf(Math.max(...hourStats))}:00`;
    
    // Melhor dia da semana
    const dayStats = new Array(7).fill(0);
    recentSessions.forEach((session) => {
      const day = new Date(session.startTime).getDay();
      dayStats[day] += session.actualDuration;
    });
    const bestDayOfWeek = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][
      dayStats.indexOf(Math.max(...dayStats))
    ];
    
    // Tendência de produtividade (simplificado)
    const productivityTrend = completionRate > 80 ? 'increasing' : completionRate < 50 ? 'decreasing' : 'stable';
    
    return {
      totalFocusTime,
      averageSessionLength,
      completionRate,
      mostProductiveHour,
      bestDayOfWeek,
      productivityTrend,
    };
  },
  
  getSessionHistory: (type, days = 7) => {
    const { sessions } = get();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    let filteredSessions = sessions.filter((session) => 
      new Date(session.startTime) >= cutoffDate
    );
    
    if (type) {
      filteredSessions = filteredSessions.filter((session) => session.type === type);
    }
    
    return filteredSessions.sort((a, b) => 
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
  },
  
  getFocusStreak: () => {
    const { sessions } = get();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    let currentDate = new Date(today);
    
    while (true) {
      const daySessions = sessions.filter((session) => {
        const sessionDate = new Date(session.startTime);
        return sessionDate >= currentDate && sessionDate < new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
      });
      
      if (daySessions.length === 0) break;
      
      const hasFocusSession = daySessions.some((session) => 
        session.mode === 'focus' && session.actualDuration > 0
      );
      
      if (!hasFocusSession) break;
      
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    return streak;
  },
  
  getWeeklyGoal: () => {
    const { sessions } = get();
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const weekSessions = sessions.filter((session) => {
      const sessionDate = new Date(session.startTime);
      return sessionDate >= weekStart;
    });
    
    const currentFocusTime = weekSessions
      .filter((s) => s.mode === 'focus')
      .reduce((sum, s) => sum + s.actualDuration, 0);
    
    const target = 20 * 60 * 60; // 20 horas por semana
    const percentage = Math.min((currentFocusTime / target) * 100, 100);
    
    return {
      target,
      current: currentFocusTime,
      percentage,
    };
  },
}));