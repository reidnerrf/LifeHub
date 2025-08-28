import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface EventTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  duration: number; // em minutos
  type: Event['type'];
  priority: Event['priority'];
  tags: string[];
  location?: string;
  isRecurring: boolean;
  recurrence?: {
    type: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: Date;
  };
  isPublic: boolean;
  createdBy: string;
  usageCount: number;
  createdAt: Date;
}

export interface SharedCalendar {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  sharedWith: string[];
  permissions: 'read' | 'write' | 'admin';
  color: string;
  isPublic: boolean;
  createdAt: Date;
}

export interface VoiceRecognitionResult {
  text: string;
  confidence: number;
  entities: {
    date?: Date;
    time?: Date;
    duration?: number;
    location?: string;
    participants?: string[];
  };
}

export interface AIRescheduleSuggestion {
  id: string;
  eventId: string;
  originalTime: { start: Date; end: Date };
  suggestedTime: { start: Date; end: Date };
  reason: string;
  confidence: number;
  alternatives: { start: Date; end: Date }[];
  createdAt: Date;
}

export interface ProductivityAnalysis {
  id: string;
  period: 'daily' | 'weekly' | 'monthly';
  startDate: Date;
  endDate: Date;
  totalEvents: number;
  totalDuration: number;
  averageEventDuration: number;
  mostProductiveDay: string;
  mostProductiveHour: number;
  typeDistribution: Record<string, number>;
  priorityDistribution: Record<string, number>;
  conflictCount: number;
  rescheduleCount: number;
  generatedAt: Date;
}

export interface ExternalIntegration {
  id: string;
  type: 'slack' | 'teams' | 'google' | 'outlook';
  name: string;
  isConnected: boolean;
  lastSync: Date;
  settings: Record<string, any>;
  webhookUrl?: string;
  apiKey?: string;
}

export interface OfflineEvent {
  id: string;
  event: Event;
  action: 'create' | 'update' | 'delete';
  timestamp: Date;
  isSynced: boolean;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  type: 'event' | 'task' | 'meeting' | 'reminder';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  isAllDay: boolean;
  recurrence?: {
    type: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: Date;
  };
  reminders: {
    type: 'push' | 'email' | 'sms';
    minutesBefore: number;
    message?: string;
  }[];
  externalId?: string; // Para sincronização com Google/Outlook
  externalSource?: 'google' | 'outlook' | 'local';
  // Novos campos
  templateId?: string;
  sharedCalendarId?: string;
  participants: string[];
  notes?: string;
  attachments: {
    id: string;
    name: string;
    url: string;
    type: 'image' | 'document' | 'audio';
  }[];
  aiSuggestions: {
    bestTimeToReschedule?: Date;
    suggestedDuration?: number;
    conflictWarnings?: string[];
    productivityTips?: string[];
  };
  voiceRecognitionData?: VoiceRecognitionResult;
  createdAt: Date;
  updatedAt: Date;
}

export type CalendarView = 'month' | 'week' | 'day';

interface EventsStore {
  // Dados
  events: Event[];
  templates: EventTemplate[];
  sharedCalendars: SharedCalendar[];
  aiRescheduleSuggestions: AIRescheduleSuggestion[];
  productivityAnalyses: ProductivityAnalysis[];
  externalIntegrations: ExternalIntegration[];
  offlineEvents: OfflineEvent[];
  
  // Estado atual
  view: CalendarView;
  currentDate: Date;
  syncStatus: {
    google: 'idle' | 'syncing' | 'error' | 'connected';
    outlook: 'idle' | 'syncing' | 'error' | 'connected';
  };
  
  // Reconhecimento de voz
  isVoiceRecording: boolean;
  voiceRecognitionResult: VoiceRecognitionResult | null;
  
  // Modo offline
  isOffline: boolean;
  pendingSync: {
    events: Event[];
    templates: EventTemplate[];
    sharedCalendars: SharedCalendar[];
  };
  
  // Ações básicas
  setEvents: (events: Event[]) => void;
  addEvent: (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEvent: (id: string, updates: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  setView: (view: CalendarView) => void;
  setCurrentDate: (date: Date) => void;
  
  // Templates
  addTemplate: (template: Omit<EventTemplate, 'id' | 'createdAt' | 'usageCount'>) => void;
  updateTemplate: (id: string, updates: Partial<EventTemplate>) => void;
  deleteTemplate: (id: string) => void;
  createEventFromTemplate: (templateId: string, customizations?: Partial<Event>) => void;
  getTemplatesByCategory: (category: string) => EventTemplate[];
  getPopularTemplates: (limit?: number) => EventTemplate[];
  
  // Compartilhamento de calendários
  createSharedCalendar: (calendar: Omit<SharedCalendar, 'id' | 'createdAt'>) => void;
  updateSharedCalendar: (id: string, updates: Partial<SharedCalendar>) => void;
  deleteSharedCalendar: (id: string) => void;
  shareCalendarWithUser: (calendarId: string, userId: string, permissions: SharedCalendar['permissions']) => void;
  removeUserFromCalendar: (calendarId: string, userId: string) => void;
  getSharedCalendars: () => SharedCalendar[];
  getCalendarsSharedWithMe: () => SharedCalendar[];
  
  // Reconhecimento de voz
  startVoiceRecording: () => Promise<void>;
  stopVoiceRecording: () => Promise<VoiceRecognitionResult>;
  processVoiceInput: (audioData: any) => Promise<Event | null>;
  createEventFromVoice: (voiceResult: VoiceRecognitionResult) => Event | null;
  
  // IA para sugestões de reagendamento
  generateRescheduleSuggestions: (eventId: string) => Promise<AIRescheduleSuggestion[]>;
  applyRescheduleSuggestion: (suggestionId: string) => void;
  getRescheduleSuggestions: (eventId: string) => AIRescheduleSuggestion[];
  analyzeConflicts: (eventId: string) => string[];
  
  // Análise de produtividade
  generateProductivityAnalysis: (period: ProductivityAnalysis['period'], startDate: Date, endDate: Date) => ProductivityAnalysis;
  getProductivityAnalyses: (period?: ProductivityAnalysis['period']) => ProductivityAnalysis[];
  getProductivityStats: () => {
    totalEvents: number;
    totalDuration: number;
    averageEventDuration: number;
    conflictCount: number;
    rescheduleCount: number;
  };
  
  // Integrações externas
  connectExternalService: (type: ExternalIntegration['type'], credentials: any) => Promise<boolean>;
  disconnectExternalService: (type: ExternalIntegration['type']) => void;
  syncWithExternalService: (type: ExternalIntegration['type']) => Promise<boolean>;
  getExternalIntegrations: () => ExternalIntegration[];
  sendToSlack: (eventId: string, channel: string) => Promise<boolean>;
  sendToTeams: (eventId: string, channel: string) => Promise<boolean>;
  
  // Modo offline
  setOfflineMode: (isOffline: boolean) => void;
  syncOfflineChanges: () => Promise<boolean>;
  getPendingSync: () => EventsStore['pendingSync'];
  addOfflineEvent: (event: Event, action: OfflineEvent['action']) => void;
  
  // Widgets
  getWidgetData: () => {
    todayEvents: Event[];
    upcomingEvents: Event[];
    conflicts: string[];
    suggestions: AIRescheduleSuggestion[];
  };
  
  // Utilitários
  getEventsForDate: (date: Date) => Event[];
  getEventsForWeek: (startDate: Date) => Event[];
  getEventsForMonth: (year: number, month: number) => Event[];
  getAvailableSlots: (date: Date, duration: number) => { start: Date; end: Date }[];
  suggestBestTime: (duration: number, priority: Event['priority']) => Date | null;
  syncWithGoogle: () => Promise<void>;
  syncWithOutlook: () => Promise<void>;
  addReminder: (eventId: string, reminder: Event['reminders'][0]) => void;
  removeReminder: (eventId: string, reminderIndex: number) => void;
  
  // Persistência
  saveEvents: () => Promise<void>;
  loadEvents: () => Promise<void>;
  exportEvents: (format: 'json' | 'csv' | 'ics') => Promise<string>;
  importEvents: (data: string, format: 'json' | 'csv' | 'ics') => Promise<boolean>;
}

export const useEvents = create<EventsStore>((set, get) => ({
  // Estado inicial
  events: [],
  templates: [
    {
      id: 'template-1',
      name: 'Reunião Semanal',
      description: 'Template para reuniões semanais de equipe',
      category: 'Reuniões',
      duration: 60,
      type: 'meeting',
      priority: 'high',
      tags: ['reunião', 'semanal', 'equipe'],
      isRecurring: true,
      recurrence: {
        type: 'weekly',
        interval: 1,
      },
      isPublic: true,
      createdBy: 'system',
      usageCount: 12,
      createdAt: new Date('2024-01-01'),
    },
    {
      id: 'template-2',
      name: 'Consulta Médica',
      description: 'Template para consultas médicas',
      category: 'Saúde',
      duration: 30,
      type: 'event',
      priority: 'high',
      tags: ['saúde', 'consulta', 'médico'],
      isRecurring: false,
      isPublic: true,
      createdBy: 'system',
      usageCount: 8,
      createdAt: new Date('2024-01-01'),
    },
    {
      id: 'template-3',
      name: 'Treino Matinal',
      description: 'Template para treinos matinais',
      category: 'Fitness',
      duration: 45,
      type: 'event',
      priority: 'medium',
      tags: ['fitness', 'treino', 'matinal'],
      isRecurring: true,
      recurrence: {
        type: 'daily',
        interval: 1,
      },
      isPublic: true,
      createdBy: 'system',
      usageCount: 25,
      createdAt: new Date('2024-01-01'),
    },
  ],
  sharedCalendars: [],
  aiRescheduleSuggestions: [],
  productivityAnalyses: [],
  externalIntegrations: [
    {
      id: 'google-1',
      type: 'google',
      name: 'Google Calendar',
      isConnected: false,
      lastSync: new Date(),
      settings: {},
    },
    {
      id: 'outlook-1',
      type: 'outlook',
      name: 'Outlook Calendar',
      isConnected: false,
      lastSync: new Date(),
      settings: {},
    },
    {
      id: 'slack-1',
      type: 'slack',
      name: 'Slack',
      isConnected: false,
      lastSync: new Date(),
      settings: {},
    },
    {
      id: 'teams-1',
      type: 'teams',
      name: 'Microsoft Teams',
      isConnected: false,
      lastSync: new Date(),
      settings: {},
    },
  ],
  offlineEvents: [],
  view: 'week',
  currentDate: new Date(),
  syncStatus: {
    google: 'idle',
    outlook: 'idle',
  },
  isVoiceRecording: false,
  voiceRecognitionResult: null,
  isOffline: false,
  pendingSync: {
    events: [],
    templates: [],
    sharedCalendars: [],
  },

  // Implementações das ações básicas
  setEvents: (events) => set({ events }),

  addEvent: (event) => {
    const newEvent: Event = {
      ...event,
      participants: event.participants || [],
      notes: event.notes || '',
      attachments: event.attachments || [],
      aiSuggestions: event.aiSuggestions || {},
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({ 
      events: [...state.events, newEvent],
      pendingSync: {
        ...state.pendingSync,
        events: [...state.pendingSync.events, newEvent],
      },
    }));
  },

  updateEvent: (id, updates) => {
    set((state) => ({
      events: state.events.map((event) =>
        event.id === id
          ? { ...event, ...updates, updatedAt: new Date() }
          : event
      ),
      pendingSync: {
        ...state.pendingSync,
        events: [...state.pendingSync.events, { ...state.events.find(e => e.id === id)!, ...updates }],
      },
    }));
  },

  deleteEvent: (id) => {
    set((state) => ({
      events: state.events.filter((event) => event.id !== id),
    }));
  },

  setView: (view) => set({ view }),
  setCurrentDate: (date) => set({ currentDate: date }),

  // Templates
  addTemplate: (template) => {
    const newTemplate: EventTemplate = {
      ...template,
      id: Date.now().toString(),
      usageCount: 0,
      createdAt: new Date(),
    };
    set((state) => ({ templates: [newTemplate, ...state.templates] }));
  },

  updateTemplate: (id, updates) => {
    set((state) => ({
      templates: state.templates.map((template) =>
        template.id === id ? { ...template, ...updates } : template
      ),
    }));
  },

  deleteTemplate: (id) => {
    set((state) => ({
      templates: state.templates.filter((template) => template.id !== id),
    }));
  },

  createEventFromTemplate: (templateId, customizations = {}) => {
    const template = get().templates.find((t) => t.id === templateId);
    if (!template) return;

    const now = new Date();
    const startTime = customizations.startTime || now;
    const endTime = new Date(startTime.getTime() + template.duration * 60 * 1000);

    const newEvent: Omit<Event, 'id' | 'createdAt' | 'updatedAt'> = {
      title: customizations.title || template.name,
      description: customizations.description || template.description,
      startTime,
      endTime,
      location: customizations.location || template.location,
      type: customizations.type || template.type,
      priority: customizations.priority || template.priority,
      tags: customizations.tags || template.tags,
      isAllDay: false,
      recurrence: template.isRecurring ? template.recurrence : undefined,
      reminders: [],
      participants: customizations.participants || [],
      notes: customizations.notes || '',
      attachments: customizations.attachments || [],
      aiSuggestions: customizations.aiSuggestions || {},
      templateId: template.id,
    };

    get().addEvent(newEvent);

    // Incrementar contador de uso
    set((state) => ({
      templates: state.templates.map((t) =>
        t.id === templateId ? { ...t, usageCount: t.usageCount + 1 } : t
      ),
    }));
  },

  getTemplatesByCategory: (category) => {
    return get().templates.filter((template) => template.category === category);
  },

  getPopularTemplates: (limit = 5) => {
    return get().templates
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  },

  // Compartilhamento de calendários
  createSharedCalendar: (calendar) => {
    const newCalendar: SharedCalendar = {
      ...calendar,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    set((state) => ({ sharedCalendars: [newCalendar, ...state.sharedCalendars] }));
  },

  updateSharedCalendar: (id, updates) => {
    set((state) => ({
      sharedCalendars: state.sharedCalendars.map((calendar) =>
        calendar.id === id ? { ...calendar, ...updates } : calendar
      ),
    }));
  },

  deleteSharedCalendar: (id) => {
    set((state) => ({
      sharedCalendars: state.sharedCalendars.filter((calendar) => calendar.id !== id),
    }));
  },

  shareCalendarWithUser: (calendarId, userId, permissions) => {
    set((state) => ({
      sharedCalendars: state.sharedCalendars.map((calendar) =>
        calendar.id === calendarId
          ? { ...calendar, sharedWith: [...calendar.sharedWith, userId] }
          : calendar
      ),
    }));
  },

  removeUserFromCalendar: (calendarId, userId) => {
    set((state) => ({
      sharedCalendars: state.sharedCalendars.map((calendar) =>
        calendar.id === calendarId
          ? { ...calendar, sharedWith: calendar.sharedWith.filter(id => id !== userId) }
          : calendar
      ),
    }));
  },

  getSharedCalendars: () => {
    return get().sharedCalendars.filter(calendar => calendar.ownerId === 'current-user');
  },

  getCalendarsSharedWithMe: () => {
    return get().sharedCalendars.filter(calendar => 
      calendar.sharedWith.includes('current-user') || calendar.isPublic
    );
  },

  // Reconhecimento de voz
  startVoiceRecording: async () => {
    set({ isVoiceRecording: true });
    // Simular gravação de voz
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });
  },

  stopVoiceRecording: async () => {
    set({ isVoiceRecording: false });
    
    // Simular resultado de reconhecimento de voz
    const result: VoiceRecognitionResult = {
      text: 'Reunião com João amanhã às 14h por 1 hora',
      confidence: 0.95,
      entities: {
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // amanhã
        time: new Date(Date.now() + 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000), // 14h
        duration: 60, // 1 hora
        participants: ['João'],
      },
    };
    
    set({ voiceRecognitionResult: result });
    return result;
  },

  processVoiceInput: async (audioData) => {
    // Simular processamento de áudio
    const result = await get().stopVoiceRecording();
    return get().createEventFromVoice(result);
  },

  createEventFromVoice: (voiceResult) => {
    if (!voiceResult.entities.date || !voiceResult.entities.time) return null;

    const startTime = voiceResult.entities.time;
    const endTime = voiceResult.entities.duration 
      ? new Date(startTime.getTime() + voiceResult.entities.duration * 60 * 1000)
      : new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hora padrão

    const event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'> = {
      title: voiceResult.text,
      startTime,
      endTime,
      type: 'meeting',
      priority: 'medium',
      tags: [],
      isAllDay: false,
      reminders: [],
      participants: voiceResult.entities.participants || [],
      location: voiceResult.entities.location,
      notes: '',
      attachments: [],
      aiSuggestions: {},
      voiceRecognitionData: voiceResult,
    };

    get().addEvent(event);
    return event as Event;
  },

  // IA para sugestões de reagendamento
  generateRescheduleSuggestions: async (eventId) => {
    const event = get().events.find(e => e.id === eventId);
    if (!event) return [];

    // Simular análise de IA
    return new Promise((resolve) => {
      setTimeout(() => {
        const suggestions: AIRescheduleSuggestion[] = [
          {
            id: Date.now().toString(),
            eventId,
            originalTime: { start: event.startTime, end: event.endTime },
            suggestedTime: {
              start: new Date(event.startTime.getTime() + 2 * 60 * 60 * 1000), // +2 horas
              end: new Date(event.endTime.getTime() + 2 * 60 * 60 * 1000),
            },
            reason: 'Melhor horário baseado na sua produtividade',
            confidence: 0.85,
            alternatives: [
              {
                start: new Date(event.startTime.getTime() + 1 * 60 * 60 * 1000),
                end: new Date(event.endTime.getTime() + 1 * 60 * 60 * 1000),
              },
            ],
            createdAt: new Date(),
          },
        ];

        set((state) => ({
          aiRescheduleSuggestions: [...suggestions, ...state.aiRescheduleSuggestions],
        }));

        resolve(suggestions);
      }, 2000);
    });
  },

  applyRescheduleSuggestion: (suggestionId) => {
    const suggestion = get().aiRescheduleSuggestions.find(s => s.id === suggestionId);
    if (!suggestion) return;

    get().updateEvent(suggestion.eventId, {
      startTime: suggestion.suggestedTime.start,
      endTime: suggestion.suggestedTime.end,
    });
  },

  getRescheduleSuggestions: (eventId) => {
    return get().aiRescheduleSuggestions.filter(s => s.eventId === eventId);
  },

  analyzeConflicts: (eventId) => {
    const event = get().events.find(e => e.id === eventId);
    if (!event) return [];

    const conflicts = get().events.filter(e => 
      e.id !== eventId &&
      ((e.startTime < event.endTime && e.endTime > event.startTime) ||
       (event.startTime < e.endTime && event.endTime > e.startTime))
    );

    return conflicts.map(c => `Conflito com: ${c.title}`);
  },

  // Análise de produtividade
  generateProductivityAnalysis: (period, startDate, endDate) => {
    const events = get().events.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate >= startDate && eventDate <= endDate;
    });

    const totalDuration = events.reduce((total, event) => {
      return total + (event.endTime.getTime() - event.startTime.getTime()) / (1000 * 60);
    }, 0);

    const averageEventDuration = events.length > 0 ? totalDuration / events.length : 0;

    const analysis: ProductivityAnalysis = {
      id: Date.now().toString(),
      period,
      startDate,
      endDate,
      totalEvents: events.length,
      totalDuration,
      averageEventDuration,
      mostProductiveDay: 'Segunda-feira', // Simulado
      mostProductiveHour: 9, // Simulado
      typeDistribution: {
        event: events.filter(e => e.type === 'event').length,
        task: events.filter(e => e.type === 'task').length,
        meeting: events.filter(e => e.type === 'meeting').length,
        reminder: events.filter(e => e.type === 'reminder').length,
      },
      priorityDistribution: {
        low: events.filter(e => e.priority === 'low').length,
        medium: events.filter(e => e.priority === 'medium').length,
        high: events.filter(e => e.priority === 'high').length,
        urgent: events.filter(e => e.priority === 'urgent').length,
      },
      conflictCount: get().events.filter(e => get().analyzeConflicts(e.id).length > 0).length,
      rescheduleCount: get().aiRescheduleSuggestions.length,
      generatedAt: new Date(),
    };

    set((state) => ({
      productivityAnalyses: [analysis, ...state.productivityAnalyses],
    }));

    return analysis;
  },

  getProductivityAnalyses: (period) => {
    const analyses = get().productivityAnalyses;
    if (period) {
      return analyses.filter((analysis) => analysis.period === period);
    }
    return analyses;
  },

  getProductivityStats: () => {
    const events = get().events;
    const totalDuration = events.reduce((total, event) => {
      return total + (event.endTime.getTime() - event.startTime.getTime()) / (1000 * 60);
    }, 0);

    return {
      totalEvents: events.length,
      totalDuration,
      averageEventDuration: events.length > 0 ? totalDuration / events.length : 0,
      conflictCount: events.filter(e => get().analyzeConflicts(e.id).length > 0).length,
      rescheduleCount: get().aiRescheduleSuggestions.length,
    };
  },

  // Integrações externas
  connectExternalService: async (type, credentials) => {
    // Simular conexão
    return new Promise((resolve) => {
      setTimeout(() => {
        const success = Math.random() > 0.1;
        if (success) {
          set((state) => ({
            externalIntegrations: state.externalIntegrations.map((integration) =>
              integration.type === type
                ? { ...integration, isConnected: true, lastSync: new Date() }
                : integration
            ),
          }));
        }
        resolve(success);
      }, 2000);
    });
  },

  disconnectExternalService: (type) => {
    set((state) => ({
      externalIntegrations: state.externalIntegrations.map((integration) =>
        integration.type === type
          ? { ...integration, isConnected: false }
          : integration
      ),
    }));
  },

  syncWithExternalService: async (type) => {
    // Simular sincronização
    return new Promise((resolve) => {
      setTimeout(() => {
        const success = Math.random() > 0.1;
        if (success) {
          set((state) => ({
            externalIntegrations: state.externalIntegrations.map((integration) =>
              integration.type === type
                ? { ...integration, lastSync: new Date() }
                : integration
            ),
          }));
        }
        resolve(success);
      }, 3000);
    });
  },

  getExternalIntegrations: () => {
    return get().externalIntegrations;
  },

  sendToSlack: async (eventId, channel) => {
    // Simular envio para Slack
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(Math.random() > 0.1);
      }, 1000);
    });
  },

  sendToTeams: async (eventId, channel) => {
    // Simular envio para Teams
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(Math.random() > 0.1);
      }, 1000);
    });
  },

  // Modo offline
  setOfflineMode: (isOffline) => set({ isOffline }),
  
  syncOfflineChanges: async () => {
    const { pendingSync } = get();
    
    // Simular sincronização
    return new Promise((resolve) => {
      setTimeout(() => {
        const success = Math.random() > 0.1;
        if (success) {
          set({ 
            pendingSync: { events: [], templates: [], sharedCalendars: [] },
            isOffline: false,
          });
        }
        resolve(success);
      }, 3000);
    });
  },

  getPendingSync: () => get().pendingSync,

  addOfflineEvent: (event, action) => {
    const offlineEvent: OfflineEvent = {
      id: Date.now().toString(),
      event,
      action,
      timestamp: new Date(),
      isSynced: false,
    };

    set((state) => ({
      offlineEvents: [...state.offlineEvents, offlineEvent],
    }));
  },

  // Widgets
  getWidgetData: () => {
    const today = new Date();
    const todayEvents = get().getEventsForDate(today);
    const upcomingEvents = get().events
      .filter(e => e.startTime > today)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
      .slice(0, 5);

    const conflicts = get().events
      .filter(e => get().analyzeConflicts(e.id).length > 0)
      .map(e => e.title);

    const suggestions = get().aiRescheduleSuggestions
      .filter(s => s.createdAt > new Date(Date.now() - 24 * 60 * 60 * 1000))
      .slice(0, 3);

    return {
      todayEvents,
      upcomingEvents,
      conflicts,
      suggestions,
    };
  },

  // Utilitários existentes
  getEventsForDate: (date) => {
    const { events } = get();
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return events.filter((event) => {
      const eventStart = new Date(event.startTime);
      return eventStart >= startOfDay && eventStart <= endOfDay;
    });
  },

  getEventsForWeek: (startDate) => {
    const { events } = get();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);

    return events.filter((event) => {
      const eventStart = new Date(event.startTime);
      return eventStart >= startDate && eventStart < endDate;
    });
  },

  getEventsForMonth: (year, month) => {
    const { events } = get();
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    return events.filter((event) => {
      const eventStart = new Date(event.startTime);
      return eventStart >= startDate && eventStart <= endDate;
    });
  },

  getAvailableSlots: (date, duration) => {
    const events = get().getEventsForDate(date);
    const slots: { start: Date; end: Date }[] = [];
    
    // Simular slots disponíveis
    for (let hour = 9; hour < 18; hour++) {
      const start = new Date(date);
      start.setHours(hour, 0, 0, 0);
      const end = new Date(start.getTime() + duration * 60 * 1000);
      
      const hasConflict = events.some(event => 
        (event.startTime < end && event.endTime > start)
      );
      
      if (!hasConflict) {
        slots.push({ start, end });
      }
    }
    
    return slots;
  },

  suggestBestTime: (duration, priority) => {
    const today = new Date();
    const slots = get().getAvailableSlots(today, duration);
    
    if (slots.length === 0) return null;
    
    // Priorizar horários da manhã para tarefas de alta prioridade
    if (priority === 'high' || priority === 'urgent') {
      const morningSlots = slots.filter(slot => slot.start.getHours() < 12);
      return morningSlots.length > 0 ? morningSlots[0].start : slots[0].start;
    }
    
    return slots[0].start;
  },

  syncWithGoogle: async () => {
    set((state) => ({
      syncStatus: { ...state.syncStatus, google: 'syncing' },
    }));

    try {
      // Simular sincronização
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      set((state) => ({
        syncStatus: { ...state.syncStatus, google: 'connected' },
      }));
    } catch (error) {
      set((state) => ({
        syncStatus: { ...state.syncStatus, google: 'error' },
      }));
    }
  },

  syncWithOutlook: async () => {
    set((state) => ({
      syncStatus: { ...state.syncStatus, outlook: 'syncing' },
    }));

    try {
      // Simular sincronização
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      set((state) => ({
        syncStatus: { ...state.syncStatus, outlook: 'connected' },
      }));
    } catch (error) {
      set((state) => ({
        syncStatus: { ...state.syncStatus, outlook: 'error' },
      }));
    }
  },

  addReminder: (eventId, reminder) => {
    set((state) => ({
      events: state.events.map((event) =>
        event.id === eventId
          ? { ...event, reminders: [...event.reminders, reminder] }
          : event
      ),
    }));
  },

  removeReminder: (eventId, reminderIndex) => {
    set((state) => ({
      events: state.events.map((event) =>
        event.id === eventId
          ? {
              ...event,
              reminders: event.reminders.filter((_, index) => index !== reminderIndex),
            }
          : event
      ),
    }));
  },

  // Persistência
  saveEvents: async () => {
    const { events, templates, sharedCalendars } = get();
    try {
      await AsyncStorage.setItem('events', JSON.stringify(events));
      await AsyncStorage.setItem('eventTemplates', JSON.stringify(templates));
      await AsyncStorage.setItem('sharedCalendars', JSON.stringify(sharedCalendars));
    } catch (error) {
      console.error('Erro ao salvar eventos:', error);
    }
  },

  loadEvents: async () => {
    try {
      const eventsData = await AsyncStorage.getItem('events');
      const templatesData = await AsyncStorage.getItem('eventTemplates');
      const calendarsData = await AsyncStorage.getItem('sharedCalendars');

      if (eventsData) {
        const events = JSON.parse(eventsData);
        set({ events });
      }
      if (templatesData) {
        const templates = JSON.parse(templatesData);
        set({ templates });
      }
      if (calendarsData) {
        const sharedCalendars = JSON.parse(calendarsData);
        set({ sharedCalendars });
      }
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    }
  },

  exportEvents: async (format) => {
    const { events } = get();
    
    if (format === 'json') {
      return JSON.stringify(events, null, 2);
    } else if (format === 'csv') {
      const headers = ['ID', 'Título', 'Descrição', 'Início', 'Fim', 'Local', 'Tipo', 'Prioridade'];
      const rows = events.map(event => [
        event.id,
        event.title,
        event.description || '',
        event.startTime.toISOString(),
        event.endTime.toISOString(),
        event.location || '',
        event.type,
        event.priority,
      ]);
      
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    } else if (format === 'ics') {
      // Simular formato iCal
      let ics = 'BEGIN:VCALENDAR\nVERSION:2.0\n';
      events.forEach(event => {
        ics += `BEGIN:VEVENT\n`;
        ics += `UID:${event.id}\n`;
        ics += `DTSTART:${event.startTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z\n`;
        ics += `DTEND:${event.endTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z\n`;
        ics += `SUMMARY:${event.title}\n`;
        if (event.description) {
          ics += `DESCRIPTION:${event.description}\n`;
        }
        ics += `END:VEVENT\n`;
      });
      ics += 'END:VCALENDAR';
      return ics;
    }
    
    return '';
  },

  importEvents: async (data, format) => {
    try {
      let events: Event[] = [];
      
      if (format === 'json') {
        events = JSON.parse(data);
      } else if (format === 'csv') {
        const lines = data.split('\n');
        const headers = lines[0].split(',');
        
        events = lines.slice(1).map(line => {
          const values = line.split(',');
          return {
            id: values[0],
            title: values[1],
            description: values[2],
            startTime: new Date(values[3]),
            endTime: new Date(values[4]),
            location: values[5],
            type: values[6] as Event['type'],
            priority: values[7] as Event['priority'],
            tags: [],
            isAllDay: false,
            reminders: [],
            participants: [],
            notes: '',
            attachments: [],
            aiSuggestions: {},
            createdAt: new Date(),
            updatedAt: new Date(),
          };
        });
      } else if (format === 'ics') {
        // Simular parsing de iCal
        const eventMatches = data.match(/BEGIN:VEVENT([\s\S]*?)END:VEVENT/g);
        if (eventMatches) {
          events = eventMatches.map(match => {
            const uidMatch = match.match(/UID:(.*)/);
            const startMatch = match.match(/DTSTART:(.*)/);
            const endMatch = match.match(/DTEND:(.*)/);
            const summaryMatch = match.match(/SUMMARY:(.*)/);
            
            return {
              id: uidMatch ? uidMatch[1] : Date.now().toString(),
              title: summaryMatch ? summaryMatch[1] : 'Evento Importado',
              startTime: startMatch ? new Date(startMatch[1]) : new Date(),
              endTime: endMatch ? new Date(endMatch[1]) : new Date(),
              type: 'event' as Event['type'],
              priority: 'medium' as Event['priority'],
              tags: [],
              isAllDay: false,
              reminders: [],
              participants: [],
              notes: '',
              attachments: [],
              aiSuggestions: {},
              createdAt: new Date(),
              updatedAt: new Date(),
            };
          });
        }
      }
      
      set({ events });
      return true;
    } catch (error) {
      console.error('Erro ao importar eventos:', error);
      return false;
    }
  },
}));