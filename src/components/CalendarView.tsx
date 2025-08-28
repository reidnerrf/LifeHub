import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, MapPin, Users } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

const CalendarView: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('week');

  const events = [
    {
      id: 1,
      title: 'Reunião de Equipe',
      time: '09:00 - 10:30',
      type: 'meeting',
      location: 'Sala de Conferência',
      attendees: 8,
      color: 'var(--app-blue)',
    },
    {
      id: 2,
      title: 'Exercício Academia',
      time: '18:00 - 19:00',
      type: 'personal',
      location: 'Smart Fit',
      color: 'var(--app-green)',
    },
    {
      id: 3,
      title: 'Jantar com Cliente',
      time: '20:00 - 22:00',
      type: 'business',
      location: 'Restaurante Italiano',
      attendees: 3,
      color: 'var(--app-yellow)',
    },
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const today = new Date();
  
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
              {events.map((event) => (
                <Card key={event.id} className="p-4 bg-white rounded-xl border-0 shadow-sm">
                  <div className="flex items-start space-x-4">
                    <div 
                      className="w-1 h-16 rounded-full flex-shrink-0"
                      style={{ backgroundColor: event.color }}
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">{event.title}</h4>
                      
                      <div className="flex items-center space-x-4 text-sm text-[var(--app-gray)] mb-2">
                        <div className="flex items-center space-x-1">
                          <Clock size={14} />
                          <span>{event.time}</span>
                        </div>
                        {event.attendees && (
                          <div className="flex items-center space-x-1">
                            <Users size={14} />
                            <span>{event.attendees} pessoas</span>
                          </div>
                        )}
                      </div>
                      
                      {event.location && (
                        <div className="flex items-center space-x-1 text-sm text-[var(--app-gray)] mb-2">
                          <MapPin size={14} />
                          <span>{event.location}</span>
                        </div>
                      )}
                      
                      <Badge 
                        variant="secondary" 
                        className="text-xs px-2 py-1 rounded-full capitalize"
                        style={{ 
                          backgroundColor: `${event.color}15`,
                          color: event.color
                        }}
                      >
                        {event.type === 'meeting' ? 'Reunião' : 
                         event.type === 'personal' ? 'Pessoal' : 'Negócios'}
                      </Badge>
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
                  {events
                    .filter(event => parseInt(event.time.split(':')[0]) === hour)
                    .map(event => (
                      <div 
                        key={event.id}
                        className="p-3 rounded-lg mb-2"
                        style={{ backgroundColor: `${event.color}15` }}
                      >
                        <h4 className="font-medium text-gray-900 text-sm">{event.title}</h4>
                        <p className="text-xs text-[var(--app-gray)]">{event.time}</p>
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