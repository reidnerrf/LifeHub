import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { useEvents, Event, CalendarView } from '../store/events';
import { api } from '../services/api';
import MonthView from '../components/MonthView';
import CalendarView as WeekView from '../components/CalendarView';
import DayView from '../components/DayView';
import AgendaSuggestions from '../components/AgendaSuggestions';
import SyncManager from '../components/SyncManager';

const { width } = Dimensions.get('window');

export default function Agenda() {
  const t = useTheme();
  const { 
    events, 
    setEvents, 
    view, 
    setView, 
    currentDate, 
    setCurrentDate,
    addEvent,
    updateEvent,
    deleteEvent
  } = useEvents();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showSyncManager, setShowSyncManager] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const list = await api.listEvents();
      // Converter dados do backend para o formato do store
      const formattedEvents = list.map((event: any) => ({
        id: event._id,
        title: event.title,
        description: event.description || '',
        startTime: new Date(event.start),
        endTime: new Date(event.end),
        location: event.location || '',
        type: event.type || 'event',
        priority: event.priority || 'medium',
        tags: event.tags || [],
        isAllDay: event.isAllDay || false,
        recurrence: event.recurrence,
        reminders: event.reminders || [],
        externalId: event.externalId,
        externalSource: event.externalSource || 'local',
        createdAt: new Date(event.createdAt),
        updatedAt: new Date(event.updatedAt),
      }));
      setEvents(formattedEvents);
    } catch (e: any) {
      setError('Falha ao carregar eventos');
      console.error('Error loading events:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (eventData: any) => {
    try {
      const created = await api.createEvent(eventData);
      const newEvent = {
        id: created._id,
        title: created.title,
        description: created.description || '',
        startTime: new Date(created.start),
        endTime: new Date(created.end),
        location: created.location || '',
        type: created.type || 'event',
        priority: created.priority || 'medium',
        tags: created.tags || [],
        isAllDay: created.isAllDay || false,
        recurrence: created.recurrence,
        reminders: created.reminders || [],
        externalId: created.externalId,
        externalSource: created.externalSource || 'local',
        createdAt: new Date(created.createdAt),
        updatedAt: new Date(created.updatedAt),
      };
      addEvent(newEvent);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao criar evento');
    }
  };

  const handleUpdateEvent = async (eventId: string, updates: any) => {
    try {
      await api.updateEvent(eventId, updates);
      updateEvent(eventId, updates);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao atualizar evento');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await api.deleteEvent(eventId);
      deleteEvent(eventId);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao excluir evento');
    }
  };

  const handleEventPress = (event: Event) => {
    setSelectedEvent(event);
    // Aqui você pode abrir um modal de detalhes do evento
    Alert.alert(
      event.title,
      `${event.description || 'Sem descrição'}\n\n${event.startTime.toLocaleString('pt-BR')} - ${event.endTime.toLocaleString('pt-BR')}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Editar', onPress: () => {/* Implementar edição */} },
        { text: 'Excluir', style: 'destructive', onPress: () => handleDeleteEvent(event.id) }
      ]
    );
  };

  const handleDatePress = (date: Date) => {
    setCurrentDate(date);
    setView('day');
  };

  const handleTimeSlotPress = (time: Date) => {
    // Abrir sugestões de IA para criar evento
    setShowSuggestions(true);
  };

  const handleSelectTime = (selectedTime: Date) => {
    // Criar evento com o horário selecionado
    const endTime = new Date(selectedTime);
    endTime.setMinutes(endTime.getMinutes() + 60); // 1 hora padrão
    
    const newEvent = {
      title: 'Novo Evento',
      description: '',
      startTime: selectedTime,
      endTime: endTime,
      location: '',
      type: 'event' as Event['type'],
      priority: 'medium' as Event['priority'],
      tags: [],
      isAllDay: false,
      reminders: [],
    };
    
    handleCreateEvent(newEvent);
  };

  const getViewIcon = (viewType: CalendarView) => {
    switch (viewType) {
      case 'month': return 'calendar';
      case 'week': return 'calendar-outline';
      case 'day': return 'today';
      default: return 'calendar';
    }
  };

  const getViewLabel = (viewType: CalendarView) => {
    switch (viewType) {
      case 'month': return 'Mês';
      case 'week': return 'Semana';
      case 'day': return 'Dia';
      default: return 'Mês';
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    switch (view) {
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getMonthStats = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthEvents = events.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate.getFullYear() === year && eventDate.getMonth() === month;
    });

    return {
      total: monthEvents.length,
      meetings: monthEvents.filter(e => e.type === 'meeting').length,
      urgent: monthEvents.filter(e => e.priority === 'urgent').length,
      allDay: monthEvents.filter(e => e.isAllDay).length,
    };
  };

  const monthStats = getMonthStats();

  return (
    <View style={[styles.container, { backgroundColor: t.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: t.card }]}>
        <View style={styles.headerTop}>
          <Text style={[styles.title, { color: t.text }]}>Agenda</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              onPress={() => setShowSyncManager(true)}
              style={[styles.syncButton, { backgroundColor: t.primary }]}
            >
              <Ionicons name="sync" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setShowSuggestions(true)}
              style={[styles.addButton, { backgroundColor: t.primary }]}
            >
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Navegação */}
        <View style={styles.navigation}>
          <TouchableOpacity onPress={() => navigateDate('prev')} style={styles.navButton}>
            <Ionicons name="chevron-back" size={24} color={t.text} />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={goToToday} style={styles.todayButton}>
            <Text style={[styles.todayText, { color: t.primary }]}>Hoje</Text>
          </TouchableOpacity>
          
          <Text style={[styles.dateText, { color: t.text }]}>
            {view === 'month' && currentDate.toLocaleDateString('pt-BR', { 
              month: 'long', 
              year: 'numeric' 
            })}
            {view === 'week' && `${currentDate.toLocaleDateString('pt-BR', { 
              day: 'numeric', 
              month: 'short' 
            })} - ${new Date(currentDate.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR', { 
              day: 'numeric', 
              month: 'short' 
            })}`}
            {view === 'day' && currentDate.toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long' 
            })}
          </Text>
          
          <TouchableOpacity onPress={() => navigateDate('next')} style={styles.navButton}>
            <Ionicons name="chevron-forward" size={24} color={t.text} />
          </TouchableOpacity>
        </View>

        {/* View Selector */}
        <View style={styles.viewSelector}>
          {(['month', 'week', 'day'] as CalendarView[]).map((viewType) => (
            <TouchableOpacity
              key={viewType}
              onPress={() => setView(viewType)}
              style={[
                styles.viewButton,
                { backgroundColor: t.background },
                view === viewType && { backgroundColor: t.primary + '20' }
              ]}
            >
              <Ionicons 
                name={getViewIcon(viewType)} 
                size={20} 
                color={view === viewType ? t.primary : t.textLight} 
              />
              <Text style={[
                styles.viewButtonText,
                { color: view === viewType ? t.primary : t.textLight }
              ]}>
                {getViewLabel(viewType)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Estatísticas */}
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: t.text }]}>{monthStats.total}</Text>
            <Text style={[styles.statLabel, { color: t.textLight }]}>Eventos</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: t.success }]}>{monthStats.meetings}</Text>
            <Text style={[styles.statLabel, { color: t.textLight }]}>Reuniões</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#FF3B30' }]}>{monthStats.urgent}</Text>
            <Text style={[styles.statLabel, { color: t.textLight }]}>Urgentes</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: t.warning }]}>{monthStats.allDay}</Text>
            <Text style={[styles.statLabel, { color: t.textLight }]}>Dia Inteiro</Text>
          </View>
        </View>
      </View>

      {/* Conteúdo baseado na view */}
      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: t.textLight }]}>Carregando agenda...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: t.error }]}>{error}</Text>
            <TouchableOpacity onPress={loadEvents} style={[styles.retryButton, { backgroundColor: t.primary }]}>
              <Text style={[styles.retryButtonText, { color: '#fff' }]}>Tentar Novamente</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {view === 'month' && (
              <MonthView
                year={currentDate.getFullYear()}
                month={currentDate.getMonth()}
                onDatePress={handleDatePress}
                onEventPress={handleEventPress}
              />
            )}

            {view === 'week' && (
              <WeekView
                onTaskPress={handleEventPress}
              />
            )}

            {view === 'day' && (
              <DayView
                date={currentDate}
                onEventPress={handleEventPress}
                onTimeSlotPress={handleTimeSlotPress}
              />
            )}
          </>
        )}
      </View>

      {/* Modais */}
      <AgendaSuggestions
        visible={showSuggestions}
        onClose={() => setShowSuggestions(false)}
        onSelectTime={handleSelectTime}
        duration={60}
        priority="medium"
        eventType="event"
      />

      <SyncManager
        visible={showSyncManager}
        onClose={() => setShowSyncManager(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  syncButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
  },
  todayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,122,255,0.1)',
  },
  todayText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  viewSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  viewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});