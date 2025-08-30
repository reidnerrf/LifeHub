import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Modal,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { useEvents, Event } from '../store/events';

interface AgendaSuggestionsProps {
  visible: boolean;
  onClose: () => void;
  onSelectTime: (date: Date) => void;
  duration: number; // em minutos
  priority: Event['priority'];
  eventType: Event['type'];
}

export default function AgendaSuggestions({ 
  visible, 
  onClose, 
  onSelectTime, 
  duration, 
  priority,
  eventType 
}: AgendaSuggestionsProps) {
  const t = useTheme();
  const { getAvailableSlots, suggestBestTime } = useEvents();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availableSlots, setAvailableSlots] = useState<{ start: Date; end: Date }[]>([]);
  const [bestTime, setBestTime] = useState<Date | null>(null);

  useEffect(() => {
    if (visible) {
      updateSuggestions();
    }
  }, [visible, selectedDate, duration, priority]);

  const updateSuggestions = () => {
    const slots = getAvailableSlots(selectedDate, duration);
    setAvailableSlots(slots);
    
    const suggested = suggestBestTime(duration, priority);
    setBestTime(suggested);
  };

  const getNextDays = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    
    return days;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Hoje';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Amanhã';
    } else {
      return date.toLocaleDateString('pt-BR', { 
        weekday: 'short', 
        day: 'numeric',
        month: 'short'
      });
    }
  };

  const getPriorityColor = (priority: Event['priority']) => {
    switch (priority) {
      case 'urgent': return '#FF3B30';
      case 'high': return '#FF9500';
      case 'medium': return '#007AFF';
      case 'low': return '#34C759';
      default: return t.primary;
    }
  };

  const getEventTypeIcon = (type: Event['type']) => {
    switch (type) {
      case 'meeting': return 'people';
      case 'task': return 'checkmark-circle';
      case 'reminder': return 'alarm';
      default: return 'calendar';
    }
  };

  const handleSelectSlot = (slot: { start: Date; end: Date }) => {
    onSelectTime(slot.start);
    onClose();
  };

  const handleSelectBestTime = () => {
    if (bestTime) {
      onSelectTime(bestTime);
      onClose();
    }
  };

  const getSlotScore = (slot: { start: Date; end: Date }) => {
    let score = 0;
    const hour = slot.start.getHours();
    
    // Preferir horários da manhã (9h-12h)
    if (hour >= 9 && hour <= 12) score += 30;
    else if (hour >= 13 && hour <= 17) score += 20;
    else score += 10;

    // Preferir hoje ou amanhã para tarefas urgentes
    if (priority === 'urgent') {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      
      if (slot.start.toDateString() === today.toDateString()) score += 50;
      else if (slot.start.toDateString() === tomorrow.toDateString()) score += 30;
    }

    // Preferir dias úteis
    const dayOfWeek = slot.start.getDay();
    if (dayOfWeek >= 1 && dayOfWeek <= 5) score += 20;

    return score;
  };

  const sortedSlots = [...availableSlots].sort((a, b) => getSlotScore(b) - getSlotScore(a));

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: t.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: t.card }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={t.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: t.text }]}>
            Sugestões de Horário
          </Text>
          <View style={styles.headerInfo}>
            <Ionicons 
              name={getEventTypeIcon(eventType)} 
              size={20} 
              color={getPriorityColor(priority)} 
            />
            <Text style={[styles.durationText, { color: t.textLight }]}>
              {duration}min
            </Text>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Melhor horário sugerido */}
          {bestTime && (
            <View style={[styles.bestTimeSection, { backgroundColor: t.card }]}>
              <View style={styles.bestTimeHeader}>
                <Ionicons name="star" size={20} color={t.warning} />
                <Text style={[styles.bestTimeTitle, { color: t.text }]}>
                  Melhor Horário Sugerido
                </Text>
              </View>
              
              <TouchableOpacity
                style={[styles.bestTimeCard, { backgroundColor: getPriorityColor(priority) + '20' }]}
                onPress={handleSelectBestTime}
              >
                <View style={styles.bestTimeInfo}>
                  <Text style={[styles.bestTimeDate, { color: getPriorityColor(priority) }]}>
                    {formatDate(bestTime)}
                  </Text>
                  <Text style={[styles.bestTimeTime, { color: getPriorityColor(priority) }]}>
                    {formatTime(bestTime)}
                  </Text>
                </View>
                
                <View style={styles.bestTimeReasons}>
                  <Text style={[styles.reasonText, { color: t.textLight }]}>
                    • Horário ideal para {eventType === 'meeting' ? 'reuniões' : 'tarefas'}
                  </Text>
                  <Text style={[styles.reasonText, { color: t.textLight }]}>
                    • Sem conflitos na agenda
                  </Text>
                  {priority === 'urgent' && (
                    <Text style={[styles.reasonText, { color: t.textLight }]}>
                      • Prioridade alta - agendado para hoje
                    </Text>
                  )}
                </View>
                
                <TouchableOpacity
                  style={[styles.selectButton, { backgroundColor: getPriorityColor(priority) }]}
                  onPress={handleSelectBestTime}
                >
                  <Text style={[styles.selectButtonText, { color: '#fff' }]}>
                    Selecionar
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            </View>
          )}

          {/* Seletor de data */}
          <View style={[styles.dateSelector, { backgroundColor: t.card }]}>
            <Text style={[styles.sectionTitle, { color: t.text }]}>Escolher Data</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {getNextDays().map((date) => (
                <TouchableOpacity
                  key={date.toISOString()}
                  onPress={() => setSelectedDate(date)}
                  style={[
                    styles.dateButton,
                    { backgroundColor: t.background },
                    selectedDate.toDateString() === date.toDateString() && {
                      backgroundColor: t.primary + '20'
                    }
                  ]}
                >
                  <Text style={[
                    styles.dateButtonText,
                    { color: t.text },
                    selectedDate.toDateString() === date.toDateString() && {
                      color: t.primary,
                      fontWeight: '600'
                    }
                  ]}>
                    {formatDate(date)}
                  </Text>
                  <Text style={[
                    styles.dateButtonDay,
                    { color: t.textLight },
                    selectedDate.toDateString() === date.toDateString() && {
                      color: t.primary
                    }
                  ]}>
                    {date.getDate()}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Horários disponíveis */}
          <View style={[styles.availableSlots, { backgroundColor: t.card }]}>
            <Text style={[styles.sectionTitle, { color: t.text }]}>
              Horários Disponíveis - {formatDate(selectedDate)}
            </Text>
            
            {sortedSlots.length === 0 ? (
              <View style={styles.noSlots}>
                <Ionicons name="time-outline" size={48} color={t.textLight} />
                <Text style={[styles.noSlotsText, { color: t.textLight }]}>
                  Nenhum horário disponível
                </Text>
                <Text style={[styles.noSlotsSubtext, { color: t.textLight }]}>
                  Tente outra data ou reduza a duração
                </Text>
              </View>
            ) : (
              <View style={styles.slotsGrid}>
                {sortedSlots.map((slot, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.slotCard,
                      { backgroundColor: t.background },
                      getSlotScore(slot) >= 50 && { 
                        backgroundColor: getPriorityColor(priority) + '10' 
                      }
                    ]}
                    onPress={() => handleSelectSlot(slot)}
                  >
                    <Text style={[
                      styles.slotTime,
                      { color: t.text },
                      getSlotScore(slot) >= 50 && { 
                        color: getPriorityColor(priority),
                        fontWeight: '600'
                      }
                    ]}>
                      {formatTime(slot.start)} - {formatTime(slot.end)}
                    </Text>
                    
                    {getSlotScore(slot) >= 50 && (
                      <View style={styles.recommendedBadge}>
                        <Ionicons name="star" size={12} color={getPriorityColor(priority)} />
                        <Text style={[styles.recommendedText, { color: getPriorityColor(priority) }]}>
                          Recomendado
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Dicas de IA */}
          <View style={[styles.aiTips, { backgroundColor: t.card }]}>
            <Text style={[styles.sectionTitle, { color: t.text }]}>
              💡 Dicas da IA
            </Text>
            
            <View style={styles.tipItem}>
              <Ionicons name="bulb" size={16} color={t.warning} />
              <Text style={[styles.tipText, { color: t.textLight }]}>
                Horários da manhã (9h-12h) são ideais para tarefas que requerem foco
              </Text>
            </View>
            
            <View style={styles.tipItem}>
              <Ionicons name="people" size={16} color={t.primary} />
              <Text style={[styles.tipText, { color: t.textLight }]}>
                Reuniões funcionam melhor entre 14h-17h quando todos estão mais ativos
              </Text>
            </View>
            
            <View style={styles.tipItem}>
              <Ionicons name="alarm" size={16} color={t.error} />
              <Text style={[styles.tipText, { color: t.textLight }]}>
                Tarefas urgentes devem ser agendadas para hoje ou amanhã
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  durationText: {
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  bestTimeSection: {
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
  },
  bestTimeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  bestTimeTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  bestTimeCard: {
    borderRadius: 12,
    padding: 16,
  },
  bestTimeInfo: {
    marginBottom: 12,
  },
  bestTimeDate: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  bestTimeTime: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  bestTimeReasons: {
    marginBottom: 16,
  },
  reasonText: {
    fontSize: 14,
    marginBottom: 4,
  },
  selectButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dateSelector: {
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  dateButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
    minWidth: 80,
  },
  dateButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  dateButtonDay: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 2,
  },
  availableSlots: {
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
  },
  noSlots: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noSlotsText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
    marginBottom: 4,
  },
  noSlotsSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slotCard: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  slotTime: {
    fontSize: 14,
    fontWeight: '500',
  },
  recommendedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  recommendedText: {
    fontSize: 12,
    fontWeight: '500',
  },
  aiTips: {
    borderRadius: 12,
    padding: 16,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 8,
  },
  tipText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
});