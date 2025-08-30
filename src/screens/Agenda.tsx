import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  Dimensions,
  ScrollView,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { useEvents, Event, CalendarView } from '../store/events';
import { api } from '../services/api';
import MonthView from '../components/MonthView';
import WeekView from '../components/CalendarView';
import DayView from '../components/DayView';
import AgendaSuggestions from '../components/AgendaSuggestions';
import SyncManager from '../components/SyncManager';
import { VoiceRecognitionModal } from '../components/VoiceRecognitionModal';
import { EventTemplatesModal } from '../components/EventTemplatesModal';
import { AIRescheduleModal } from '../components/AIRescheduleModal';
import { SharedCalendarsModal } from '../components/SharedCalendarsModal';
import { ProductivityAnalysisModal } from '../components/ProductivityAnalysisModal';
import { ExternalIntegrationsModal } from '../components/ExternalIntegrationsModal';

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
    deleteEvent,
    getProductivityStats,
    getWidgetData,
    isOffline,
    syncOfflineChanges,
    getPendingSync,
  } = useEvents();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showSyncManager, setShowSyncManager] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Novos modais
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [showAIRescheduleModal, setShowAIRescheduleModal] = useState(false);
  const [showSharedCalendarsModal, setShowSharedCalendarsModal] = useState(false);
  const [showProductivityModal, setShowProductivityModal] = useState(false);
  const [showIntegrationsModal, setShowIntegrationsModal] = useState(false);

  const stats = getProductivityStats();
  const widgetData = getWidgetData();
  const pendingSync = getPendingSync();

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
        participants: event.participants || [],
        notes: event.notes || '',
        attachments: event.attachments || [],
        aiSuggestions: event.aiSuggestions || {},
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
        participants: created.participants || [],
        notes: created.notes || '',
        attachments: created.attachments || [],
        aiSuggestions: created.aiSuggestions || {},
        createdAt: new Date(created.createdAt),
        updatedAt: new Date(created.updatedAt),
      };
      addEvent(newEvent);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao criar evento');
    }
  };

  const handleUpdateEvent = async (id: string, updates: any) => {
    try {
      await api.updateEvent(id, updates);
      updateEvent(id, updates);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao atualizar evento');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir este evento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteEvent(id);
              deleteEvent(id);
            } catch (error) {
              Alert.alert('Erro', 'Falha ao excluir evento');
            }
          },
        },
      ]
    );
  };

  const handleSyncOffline = async () => {
    try {
      const success = await syncOfflineChanges();
      if (success) {
        Alert.alert('Sucesso', 'Sincronização concluída!');
      } else {
        Alert.alert('Erro', 'Falha na sincronização');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro durante a sincronização');
    }
  };

  const handleTemplateSelect = (template: any) => {
    // Implementar criação de evento a partir do template
    Alert.alert('Template Selecionado', `Template "${template.name}" selecionado`);
  };

  const handleVoiceEventCreated = (event: any) => {
    handleCreateEvent(event);
  };

  const getViewIcon = (viewType: CalendarView) => {
    switch (viewType) {
      case 'month':
        return 'calendar-outline';
      case 'week':
        return 'calendar';
      case 'day':
        return 'today-outline';
      default:
        return 'calendar-outline';
    }
  };

  const getViewLabel = (viewType: CalendarView) => {
    switch (viewType) {
      case 'month':
        return 'Mês';
      case 'week':
        return 'Semana';
      case 'day':
        return 'Dia';
      default:
        return 'Semana';
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.quickActionsContent}>
          <TouchableOpacity
            onPress={() => setShowVoiceModal(true)}
            style={[styles.quickActionButton, { backgroundColor: t.primary }]}
          >
            <Ionicons name="mic" size={16} color="#fff" />
            <Text style={[styles.quickActionText, { color: '#fff' }]}>Voz</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowTemplatesModal(true)}
            style={[styles.quickActionButton, { backgroundColor: t.card }]}
          >
            <Ionicons name="copy-outline" size={16} color={t.text} />
            <Text style={[styles.quickActionText, { color: t.text }]}>Templates</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowAIRescheduleModal(true)}
            style={[styles.quickActionButton, { backgroundColor: t.card }]}
          >
            <Ionicons name="sparkles" size={16} color={t.text} />
            <Text style={[styles.quickActionText, { color: t.text }]}>IA</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowSharedCalendarsModal(true)}
            style={[styles.quickActionButton, { backgroundColor: t.card }]}
          >
            <Ionicons name="share-outline" size={16} color={t.text} />
            <Text style={[styles.quickActionText, { color: t.text }]}>Compartilhar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowProductivityModal(true)}
            style={[styles.quickActionButton, { backgroundColor: t.card }]}
          >
            <Ionicons name="analytics-outline" size={16} color={t.text} />
            <Text style={[styles.quickActionText, { color: t.text }]}>Produtividade</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowIntegrationsModal(true)}
            style={[styles.quickActionButton, { backgroundColor: t.card }]}
          >
            <Ionicons name="link-outline" size={16} color={t.text} />
            <Text style={[styles.quickActionText, { color: t.text }]}>Integrações</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );

  const renderAlerts = () => {
    const alerts = [];

    if (isOffline) {
      alerts.push({
        type: 'warning',
        icon: 'cloud-offline-outline',
        text: 'Modo offline ativo',
        action: () => handleSyncOffline(),
        actionText: 'Sincronizar',
      });
    }

    if (pendingSync.events.length > 0) {
      alerts.push({
        type: 'info',
        icon: 'sync-outline',
        text: `${pendingSync.events.length} alterações pendentes`,
        action: () => handleSyncOffline(),
        actionText: 'Sincronizar',
      });
    }

    if (widgetData.conflicts.length > 0) {
      alerts.push({
        type: 'error',
        icon: 'alert-circle-outline',
        text: `${widgetData.conflicts.length} conflitos detectados`,
        action: () => setShowAIRescheduleModal(true),
        actionText: 'Resolver',
      });
    }

    if (widgetData.suggestions.length > 0) {
      alerts.push({
        type: 'success',
        icon: 'bulb-outline',
        text: `${widgetData.suggestions.length} sugestões de IA`,
        action: () => setShowAIRescheduleModal(true),
        actionText: 'Ver',
      });
    }

    if (alerts.length === 0) return null;

    return (
      <View style={styles.alertsContainer}>
        {alerts.map((alert, index) => (
          <View key={index} style={[styles.alertCard, { backgroundColor: getAlertColor(alert.type) }]}>
            <Ionicons name={alert.icon} size={16} color="#fff" />
            <Text style={styles.alertText}>{alert.text}</Text>
            {alert.action && (
              <TouchableOpacity onPress={alert.action}>
                <Text style={styles.alertActionText}>{alert.actionText}</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    );
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error':
        return '#ff4757';
      case 'warning':
        return '#ffa726';
      case 'success':
        return '#4caf50';
      case 'info':
        return '#007bff';
      default:
        return '#666';
    }
  };

  const renderWidgetData = () => (
    <View style={styles.widgetContainer}>
      <Text style={[styles.widgetTitle, { color: t.text }]}>Resumo do Dia</Text>
      
      <View style={styles.widgetStats}>
        <View style={styles.widgetStat}>
          <Text style={[styles.widgetStatNumber, { color: t.primary }]}>
            {widgetData.todayEvents.length}
          </Text>
          <Text style={[styles.widgetStatLabel, { color: t.textLight }]}>Eventos Hoje</Text>
        </View>
        
        <View style={styles.widgetStat}>
          <Text style={[styles.widgetStatNumber, { color: t.success }]}>
            {widgetData.upcomingEvents.length}
          </Text>
          <Text style={[styles.widgetStatLabel, { color: t.textLight }]}>Próximos</Text>
        </View>
        
        <View style={styles.widgetStat}>
          <Text style={[styles.widgetStatNumber, { color: t.warning }]}>
            {formatDuration(stats.averageEventDuration)}
          </Text>
          <Text style={[styles.widgetStatLabel, { color: t.textLight }]}>Duração Média</Text>
        </View>
      </View>

      {widgetData.todayEvents.length > 0 && (
        <View style={styles.todayEventsContainer}>
          <Text style={[styles.todayEventsTitle, { color: t.text }]}>Eventos de Hoje</Text>
          <FlatList
            data={widgetData.todayEvents.slice(0, 3)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={[styles.todayEventItem, { backgroundColor: t.card }]}>
                <View style={styles.todayEventTime}>
                  <Text style={[styles.todayEventTimeText, { color: t.text }]}>
                    {item.startTime.toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </Text>
                </View>
                <View style={styles.todayEventInfo}>
                  <Text style={[styles.todayEventTitle, { color: t.text }]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  {item.location && (
                    <Text style={[styles.todayEventLocation, { color: t.textLight }]} numberOfLines={1}>
                      📍 {item.location}
                    </Text>
                  )}
                </View>
              </View>
            )}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: t.background }]}>
        <Text style={[styles.loadingText, { color: t.text }]}>Carregando agenda...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: t.background }]}>
        <Text style={[styles.errorText, { color: t.text }]}>{error}</Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: t.primary }]}
          onPress={loadEvents}
        >
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: t.background }]}>
      <View style={[styles.header, { backgroundColor: t.card }]}>
        <View style={styles.headerTop}>
          <Text style={[styles.title, { color: t.text }]}>Agenda</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => setShowVoiceModal(true)}
              style={[styles.headerActionButton, { backgroundColor: t.background }]}
            >
              <Ionicons name="mic" size={20} color={t.text} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowSuggestions(true)}
              style={[styles.addButton, { backgroundColor: t.primary }]}
            >
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* View Selector */}
        <View style={styles.viewSelector}>
          {(['month', 'week', 'day'] as CalendarView[]).map((viewType) => (
            <TouchableOpacity
              key={viewType}
              style={[
                styles.viewButton,
                view === viewType && { backgroundColor: t.primary }
              ]}
              onPress={() => setView(viewType)}
            >
              <Ionicons 
                name={getViewIcon(viewType)} 
                size={16} 
                color={view === viewType ? '#fff' : t.text} 
              />
              <Text style={[
                styles.viewButtonText,
                { color: view === viewType ? '#fff' : t.text }
              ]}>
                {getViewLabel(viewType)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Estatísticas */}
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: t.text }]}>{stats.totalEvents}</Text>
            <Text style={[styles.statLabel, { color: t.textLight }]}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: t.success }]}>
              {formatDuration(stats.totalDuration)}
            </Text>
            <Text style={[styles.statLabel, { color: t.textLight }]}>Tempo Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#FF3B30' }]}>
              {stats.conflictCount}
            </Text>
            <Text style={[styles.statLabel, { color: t.textLight }]}>Conflitos</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: t.warning }]}>
              {stats.rescheduleCount}
            </Text>
            <Text style={[styles.statLabel, { color: t.textLight }]}>Reagendamentos</Text>
          </View>
        </View>

        {renderQuickActions()}
        {renderAlerts()}
      </View>

      {/* Widget de Resumo */}
      {renderWidgetData()}

      {/* Conteúdo baseado na view */}
      <View style={styles.content}>
        {view === 'month' && (
          <MonthView 
            events={events}
            currentDate={currentDate}
            onDateSelect={setCurrentDate}
            onEventPress={(event) => setSelectedEvent(event)}
          />
        )}
        {view === 'week' && (
          <WeekView 
            events={events}
            currentDate={currentDate}
            onDateSelect={setCurrentDate}
            onEventPress={(event) => setSelectedEvent(event)}
          />
        )}
        {view === 'day' && (
          <DayView 
            events={events}
            currentDate={currentDate}
            onDateSelect={setCurrentDate}
            onEventPress={(event) => setSelectedEvent(event)}
          />
        )}
      </View>

      {/* Modais */}
      <AgendaSuggestions
        visible={showSuggestions}
        onClose={() => setShowSuggestions(false)}
        onEventCreate={handleCreateEvent}
      />

      <SyncManager
        visible={showSyncManager}
        onClose={() => setShowSyncManager(false)}
      />

      <VoiceRecognitionModal
        visible={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onEventCreated={handleVoiceEventCreated}
      />

      <EventTemplatesModal
        visible={showTemplatesModal}
        onClose={() => setShowTemplatesModal(false)}
        onSelectTemplate={handleTemplateSelect}
      />

      <AIRescheduleModal
        visible={showAIRescheduleModal}
        onClose={() => setShowAIRescheduleModal(false)}
        eventId={selectedEvent?.id}
      />

      <SharedCalendarsModal
        visible={showSharedCalendarsModal}
        onClose={() => setShowSharedCalendarsModal(false)}
      />

      <ProductivityAnalysisModal
        visible={showProductivityModal}
        onClose={() => setShowProductivityModal(false)}
      />

      <ExternalIntegrationsModal
        visible={showIntegrationsModal}
        onClose={() => setShowIntegrationsModal(false)}
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
    borderBottomColor: '#e9ecef',
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
  headerActionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
  viewSelector: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  viewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 6,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  quickActionsContainer: {
    marginBottom: 12,
  },
  quickActionsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  alertsContainer: {
    gap: 8,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  alertText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
    flex: 1,
  },
  alertActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  widgetContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  widgetTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  widgetStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  widgetStat: {
    alignItems: 'center',
  },
  widgetStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  widgetStatLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  todayEventsContainer: {
    marginTop: 8,
  },
  todayEventsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  todayEventItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    marginBottom: 6,
  },
  todayEventTime: {
    marginRight: 12,
  },
  todayEventTimeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  todayEventInfo: {
    flex: 1,
  },
  todayEventTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  todayEventLocation: {
    fontSize: 12,
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
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});