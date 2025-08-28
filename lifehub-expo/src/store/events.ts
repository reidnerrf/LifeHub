import { create } from 'zustand';

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
  createdAt: Date;
  updatedAt: Date;
}

export type CalendarView = 'month' | 'week' | 'day';

interface EventsStore {
  events: Event[];
  view: CalendarView;
  currentDate: Date;
  syncStatus: {
    google: 'idle' | 'syncing' | 'error' | 'connected';
    outlook: 'idle' | 'syncing' | 'error' | 'connected';
  };
  setEvents: (events: Event[]) => void;
  addEvent: (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEvent: (id: string, updates: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  setView: (view: CalendarView) => void;
  setCurrentDate: (date: Date) => void;
  getEventsForDate: (date: Date) => Event[];
  getEventsForWeek: (startDate: Date) => Event[];
  getEventsForMonth: (year: number, month: number) => Event[];
  getAvailableSlots: (date: Date, duration: number) => { start: Date; end: Date }[];
  suggestBestTime: (duration: number, priority: Event['priority']) => Date | null;
  syncWithGoogle: () => Promise<void>;
  syncWithOutlook: () => Promise<void>;
  addReminder: (eventId: string, reminder: Event['reminders'][0]) => void;
  removeReminder: (eventId: string, reminderIndex: number) => void;
}

export const useEvents = create<EventsStore>((set, get) => ({
  events: [],
  view: 'week',
  currentDate: new Date(),
  syncStatus: {
    google: 'idle',
    outlook: 'idle',
  },

  setEvents: (events) => set({ events }),

  addEvent: (event) => {
    const newEvent: Event = {
      ...event,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({ events: [...state.events, newEvent] }));
  },

  updateEvent: (id, updates) => {
    set((state) => ({
      events: state.events.map((event) =>
        event.id === id
          ? { ...event, ...updates, updatedAt: new Date() }
          : event
      ),
    }));
  },

  deleteEvent: (id) => {
    set((state) => ({
      events: state.events.filter((event) => event.id !== id),
    }));
  },

  setView: (view) => set({ view }),

  setCurrentDate: (date) => set({ currentDate: date }),

  getEventsForDate: (date) => {
    const { events } = get();
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return events.filter((event) => {
      if (event.isAllDay) {
        const eventDate = new Date(event.startTime);
        return eventDate.toDateString() === date.toDateString();
      }
      return event.startTime <= endOfDay && event.endTime >= startOfDay;
    });
  },

  getEventsForWeek: (startDate) => {
    const { events } = get();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);

    return events.filter((event) => {
      if (event.isAllDay) {
        const eventDate = new Date(event.startTime);
        return eventDate >= startDate && eventDate <= endDate;
      }
      return event.startTime <= endDate && event.endTime >= startDate;
    });
  },

  getEventsForMonth: (year, month) => {
    const { events } = get();
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

    return events.filter((event) => {
      if (event.isAllDay) {
        const eventDate = new Date(event.startTime);
        return eventDate >= startDate && eventDate <= endDate;
      }
      return event.startTime <= endDate && event.endTime >= startDate;
    });
  },

  getAvailableSlots: (date, duration) => {
    const { events } = get();
    const dayEvents = get().getEventsForDate(date);
    
    // Horário de trabalho padrão (9h às 18h)
    const workStart = new Date(date);
    workStart.setHours(9, 0, 0, 0);
    const workEnd = new Date(date);
    workEnd.setHours(18, 0, 0, 0);

    // Ordenar eventos do dia por horário de início
    const sortedEvents = dayEvents
      .filter(e => !e.isAllDay)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    const availableSlots: { start: Date; end: Date }[] = [];
    let currentTime = new Date(workStart);

    for (const event of sortedEvents) {
      // Verificar se há espaço antes do evento
      const timeDiff = event.startTime.getTime() - currentTime.getTime();
      const minutesDiff = timeDiff / (1000 * 60);
      
      if (minutesDiff >= duration) {
        availableSlots.push({
          start: new Date(currentTime),
          end: new Date(event.startTime),
        });
      }
      
      currentTime = new Date(event.endTime);
    }

    // Verificar se há espaço após o último evento
    const timeDiff = workEnd.getTime() - currentTime.getTime();
    const minutesDiff = timeDiff / (1000 * 60);
    
    if (minutesDiff >= duration) {
      availableSlots.push({
        start: new Date(currentTime),
        end: new Date(workEnd),
      });
    }

    return availableSlots;
  },

  suggestBestTime: (duration, priority) => {
    const { events } = get();
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    // Buscar slots disponíveis nos próximos 7 dias
    const suggestions: { date: Date; score: number }[] = [];

    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() + i);
      
      const availableSlots = get().getAvailableSlots(checkDate, duration);
      
      for (const slot of availableSlots) {
        let score = 0;
        
        // Preferir horários da manhã (9h-12h)
        const hour = slot.start.getHours();
        if (hour >= 9 && hour <= 12) score += 30;
        else if (hour >= 13 && hour <= 17) score += 20;
        else score += 10;

        // Preferir hoje ou amanhã para tarefas urgentes
        if (priority === 'urgent') {
          if (i === 0) score += 50; // Hoje
          else if (i === 1) score += 30; // Amanhã
        }

        // Preferir dias úteis
        const dayOfWeek = slot.start.getDay();
        if (dayOfWeek >= 1 && dayOfWeek <= 5) score += 20; // Segunda a sexta

        // Penalizar horários muito próximos de outros eventos
        const nearbyEvents = events.filter(e => {
          const timeDiff = Math.abs(e.startTime.getTime() - slot.start.getTime());
          return timeDiff < 30 * 60 * 1000; // 30 minutos
        });
        score -= nearbyEvents.length * 10;

        suggestions.push({ date: slot.start, score });
      }
    }

    // Retornar o horário com maior pontuação
    if (suggestions.length > 0) {
      suggestions.sort((a, b) => b.score - a.score);
      return suggestions[0].date;
    }

    return null;
  },

  syncWithGoogle: async () => {
    set((state) => ({
      syncStatus: { ...state.syncStatus, google: 'syncing' }
    }));

    try {
      // Implementar sincronização com Google Calendar
      // Por enquanto, simular uma sincronização
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      set((state) => ({
        syncStatus: { ...state.syncStatus, google: 'connected' }
      }));
    } catch (error) {
      set((state) => ({
        syncStatus: { ...state.syncStatus, google: 'error' }
      }));
    }
  },

  syncWithOutlook: async () => {
    set((state) => ({
      syncStatus: { ...state.syncStatus, outlook: 'syncing' }
    }));

    try {
      // Implementar sincronização com Outlook
      // Por enquanto, simular uma sincronização
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      set((state) => ({
        syncStatus: { ...state.syncStatus, outlook: 'connected' }
      }));
    } catch (error) {
      set((state) => ({
        syncStatus: { ...state.syncStatus, outlook: 'error' }
      }));
    }
  },

  addReminder: (eventId, reminder) => {
    set((state) => ({
      events: state.events.map((event) =>
        event.id === eventId
          ? { 
              ...event, 
              reminders: [...event.reminders, reminder],
              updatedAt: new Date() 
            }
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
              updatedAt: new Date() 
            }
          : event
      ),
    }));
  },
}));