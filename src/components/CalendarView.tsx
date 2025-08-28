import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, MapPin, Users } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { storage, KEYS } from '../services/storage';
import { api } from '../services/api';

const CalendarView: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('week');
  const [events, setEvents] = useState<Array<{ id: string|number; title: string; start: string; end: string; location?: string; attendees?: number; color?: string }>>(() => storage.get(KEYS.calendarEvents) || []);
  const [googleConnected, setGoogleConnected] = useState<boolean>(() => !!storage.get(KEYS.googleConnected));

  useEffect(() => {
    storage.set(KEYS.calendarEvents, events);
  }, [events]);

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const today = new Date();
  const monthGrid = useMemo(() => {
    const first = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const start = new Date(first);
    start.setDate(first.getDate() - first.getDay());
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [selectedDate]);

  const dayEvents = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = date.getMonth();
    const dd = date.getDate();
    return events.filter(ev => {
      const s = new Date(ev.start);
      return s.getFullYear() === yyyy && s.getMonth() === mm && s.getDate() === dd;
    });
  };

  const formatTimeRange = (start: string, end: string) => {
    const s = new Date(start).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const e = new Date(end).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `${s} - ${e}`;
  };

  const connectGoogle = async () => {
    try {
      alert('Abrindo OAuth Google (simulado). Após conectar, faremos leitura.');
      storage.set(KEYS.googleConnected, true);
      setGoogleConnected(true);
      try {
        const imported = await api.importGoogle();
        if (imported?.events) {
          setEvents((prev) => [...prev, ...imported.events.map((e: any) => ({ id: e.id || Math.random(), title: e.summary || 'Evento', start: e.start, end: e.end, location: e.location }))]);
        }
      } catch {}
    } catch {}
  };

  useEffect(() => {
    // Alertas "sair em 20min" (simulado)
    const interval = setInterval(() => {
      const now = Date.now();
      const next = events.find(ev => new Date(ev.start).getTime() - now <= 20*60*1000 && new Date(ev.start).getTime() - now > 0);
      if (next && Notification && Notification.permission === 'granted') {
        new Notification('Lembrete', { body: `Saia em 20min para: ${next.title}` });
      }
    }, 60*1000);
    return () => clearInterval(interval);
  }, [events]);
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'long',
      year: 'numeric' 
    });
  };

  const generateWeekDays = () => {
    const startOfWeek = new Date(selectedDate);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day);
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });
  };

  const weekDates = generateWeekDays();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Agenda</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('day')}
            className={`px-3 py-1 rounded-lg text-sm ${
              viewMode === 'day' 
                ? 'bg-[var(--app-blue)] text-white' 
                : 'bg-gray-100 text-[var(--app-gray)]'
            }`}
          >
            Dia
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-3 py-1 rounded-lg text-sm ${
              viewMode === 'week' 
                ? 'bg-[var(--app-blue)] text-white' 
                : 'bg-gray-100 text-[var(--app-gray)]'
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={`px-3 py-1 rounded-lg text-sm ${
              viewMode === 'month' 
                ? 'bg-[var(--app-blue)] text-white' 
                : 'bg-gray-100 text-[var(--app-gray)]'
            }`}
          >
            Mês
          </button>
          <button
            onClick={connectGoogle}
            className={`px-3 py-1 rounded-lg text-sm ${googleConnected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-[var(--app-gray)]'}`}
          >
            {googleConnected ? 'Google conectado' : 'Conectar Google'}
          </button>
        </div>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => {
            const newDate = new Date(selectedDate);
            newDate.setDate(newDate.getDate() - 7);
            setSelectedDate(newDate);
          }}
          className="p-2 text-[var(--app-gray)] hover:text-gray-900"
        >
          <ChevronLeft size={20} />
        </button>
        
        <h2 className="text-lg font-medium text-gray-900">
          {formatDate(selectedDate)}
        </h2>
        
        <button 
          onClick={() => {
            const newDate = new Date(selectedDate);
            newDate.setDate(newDate.getDate() + 7);
            setSelectedDate(newDate);
          }}
          className="p-2 text-[var(--app-gray)] hover:text-gray-900"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Month View */}
      {viewMode === 'month' && (
        <div className="grid grid-cols-7 gap-2">
          {monthGrid.map((date, idx) => {
            const isCurrentMonth = date.getMonth() === selectedDate.getMonth();
            const isToday = date.toDateString() === today.toDateString();
            const evts = dayEvents(date);
            return (
              <div key={idx} className={`p-2 rounded-xl border ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'} ${isToday ? 'border-[var(--app-blue)]' : 'border-gray-100'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs ${isCurrentMonth ? 'text-gray-700' : 'text-gray-400'}`}>{date.getDate()}</span>
                </div>
                <div className="space-y-1">
                  {evts.slice(0, 3).map(ev => (
                    <div key={String(ev.id)} className="text-[10px] px-2 py-1 rounded bg-[var(--app-blue)]15 text-[var(--app-blue)]">
                      {ev.title}
                    </div>
                  ))}
                  {evts.length > 3 && (
                    <div className="text-[10px] text-[var(--app-gray)]">+{evts.length-3} mais</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Week View */}
      {viewMode === 'week' && (
        <>
          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {weekDates.map((date, index) => {
              const isToday = date.toDateString() === today.toDateString();
              const isSelected = date.toDateString() === selectedDate.toDateString();
              
              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(date)}
                  className={`flex flex-col items-center py-3 rounded-xl transition-colors ${
                    isSelected 
                      ? 'bg-[var(--app-blue)] text-white' 
                      : isToday
                      ? 'bg-[var(--app-blue)]15 text-[var(--app-blue)]'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <span className="text-xs mb-1">{weekDays[index]}</span>
                  <span className="text-lg font-medium">{date.getDate()}</span>
                </button>
              );
            })}
          </div>

          {/* Events for Selected Day */}
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 mb-4">
              Eventos de {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
            </h3>
            
            <div className="space-y-3">
              {dayEvents(selectedDate).map((event: any) => (
                <Card key={event.id} className="p-4 bg-white rounded-xl border-0 shadow-sm">
                  <div className="flex items-start space-x-4">
                    <div 
                      className="w-1 h-16 rounded-full flex-shrink-0"
                      style={{ backgroundColor: event.color || 'var(--app-blue)' }}
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">{event.title}</h4>
                      
                      <div className="flex items-center space-x-4 text-sm text-[var(--app-gray)] mb-2">
                        <div className="flex items-center space-x-1">
                          <Clock size={14} />
                          <span>{formatTimeRange(event.start, event.end)}</span>
                        </div>
                        {'attendees' in event && event.attendees && (
                          <div className="flex items-center space-x-1">
                            <Users size={14} />
                            <span>{event.attendees} pessoas</span>
                          </div>
                        )}
                      </div>
                      
                      {'location' in event && event.location && (
                        <div className="flex items-center space-x-1 text-sm text-[var(--app-gray)] mb-2">
                          <MapPin size={14} />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Day View */}
      {viewMode === 'day' && (
        <div className="flex-1">
          <div className="grid grid-cols-1 gap-1">
            {Array.from({ length: 24 }, (_, hour) => (
              <div key={hour} className="flex items-center border-b border-gray-100 py-3">
                <div className="w-16 text-sm text-[var(--app-gray)] text-right pr-4">
                  {hour.toString().padStart(2, '0')}:00
                </div>
                <div className="flex-1">
                  {dayEvents(selectedDate)
                    .filter(event => new Date(event.start).getHours() === hour)
                    .map(event => (
                      <div 
                        key={event.id}
                        className="p-3 rounded-lg mb-2"
                        style={{ backgroundColor: `${(event.color || 'var(--app-blue)')}15` }}
                      >
                        <h4 className="font-medium text-gray-900 text-sm">{event.title}</h4>
                        <p className="text-xs text-[var(--app-gray)]">{formatTimeRange(event.start, event.end)}</p>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;