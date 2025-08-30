import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  Animated,
  Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { useAssistant, Routine, RoutineActivity } from '../store/assistant';

const { width } = Dimensions.get('window');

interface RoutinesManagerProps {
  visible: boolean;
  onClose: () => void;
}

export default function RoutinesManager({ visible, onClose }: RoutinesManagerProps) {
  const t = useTheme();
  const {
    routines,
    selectedRoutine,
    setSelectedRoutine,
    activateRoutine,
    deactivateRoutine,
    executeRoutine,
    getRoutinesByType,
    getActiveRoutines,
  } = useAssistant();

  const [selectedType, setSelectedType] = useState<'all' | 'morning' | 'evening' | 'deep-work' | 'study' | 'custom'>('all');

  const routineTypes = [
    { key: 'all', label: 'Todas', icon: 'grid' },
    { key: 'morning', label: 'Manhã', icon: 'sunny' },
    { key: 'evening', label: 'Noite', icon: 'moon' },
    { key: 'deep-work', label: 'Deep Work', icon: 'bulb' },
    { key: 'study', label: 'Estudos', icon: 'school' },
    { key: 'custom', label: 'Personalizadas', icon: 'settings' },
  ];

  const filteredRoutines = selectedType === 'all' 
    ? routines 
    : getRoutinesByType(selectedType as any);

  const activeRoutines = getActiveRoutines();

  const handleExecuteRoutine = async (routine: Routine) => {
    Alert.alert(
      'Executar Rotina',
      `Deseja executar a rotina "${routine.name}" agora?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Executar',
          onPress: async () => {
            try {
              await executeRoutine(routine.id, new Date());
              Alert.alert('Sucesso', `Rotina "${routine.name}" iniciada!`);
            } catch (error) {
              Alert.alert('Erro', 'Falha ao executar a rotina');
            }
          }
        }
      ]
    );
  };

  const handleToggleRoutine = (routine: Routine) => {
    if (routine.isActive) {
      deactivateRoutine(routine.id);
      Alert.alert('Rotina Desativada', `${routine.name} foi desativada`);
    } else {
      activateRoutine(routine.id);
      Alert.alert('Rotina Ativada', `${routine.name} foi ativada`);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}min` : ''}`;
    }
    return `${mins}min`;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'morning': return '#FF9500';
      case 'evening': return '#5856D6';
      case 'deep-work': return '#34C759';
      case 'study': return '#007AFF';
      case 'custom': return '#FF3B30';
      default: return t.primary;
    }
  };

  const renderRoutineCard = (routine: Routine) => {
    const typeColor = getTypeColor(routine.type);
    
    return (
      <View key={routine.id} style={[styles.routineCard, { backgroundColor: t.card }]}>
        {/* Header da Rotina */}
        <View style={styles.routineHeader}>
          <View style={styles.routineInfo}>
            <View style={[styles.routineIcon, { backgroundColor: typeColor + '20' }]}>
              <Ionicons name={routine.icon as any} size={24} color={typeColor} />
            </View>
            <View style={styles.routineDetails}>
              <Text style={[styles.routineName, { color: t.text }]}>
                {routine.name}
              </Text>
              <Text style={[styles.routineDescription, { color: t.textLight }]}>
                {routine.description}
              </Text>
              <View style={styles.routineMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="time" size={14} color={t.textLight} />
                  <Text style={[styles.metaText, { color: t.textLight }]}>
                    {formatDuration(routine.duration)}
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="list" size={14} color={t.textLight} />
                  <Text style={[styles.metaText, { color: t.textLight }]}>
                    {routine.activities.length} atividades
                  </Text>
                </View>
              </View>
            </View>
          </View>
          
          <View style={styles.routineStatus}>
            <View style={[
              styles.statusBadge, 
              { backgroundColor: routine.isActive ? t.success + '20' : t.textLight + '20' }
            ]}>
              <Text style={[
                styles.statusText, 
                { color: routine.isActive ? t.success : t.textLight }
              ]}>
                {routine.isActive ? 'Ativa' : 'Inativa'}
              </Text>
            </View>
          </View>
        </View>

        {/* Lista de Atividades */}
        <View style={styles.activitiesSection}>
          <Text style={[styles.activitiesTitle, { color: t.text }]}>
            Atividades ({routine.activities.length})
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {routine.activities.map((activity, index) => (
              <View key={activity.id} style={[styles.activityCard, { backgroundColor: t.background }]}>
                <View style={styles.activityHeader}>
                  <Text style={[styles.activityOrder, { color: t.textLight }]}>
                    {activity.order}
                  </Text>
                  <Ionicons name={activity.icon as any} size={16} color={typeColor} />
                </View>
                <Text style={[styles.activityTitle, { color: t.text }]} numberOfLines={2}>
                  {activity.title}
                </Text>
                <Text style={[styles.activityDuration, { color: t.textLight }]}>
                  {activity.duration}min
                </Text>
                {activity.isOptional && (
                  <View style={[styles.optionalBadge, { backgroundColor: t.warning + '20' }]}>
                    <Text style={[styles.optionalText, { color: t.warning }]}>
                      Opcional
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Ações da Rotina */}
        <View style={styles.routineActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: t.primary + '20' }]}
            onPress={() => handleExecuteRoutine(routine)}
          >
            <Ionicons name="play" size={16} color={t.primary} />
            <Text style={[styles.actionText, { color: t.primary }]}>
              Executar
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: t.warning + '20' }]}
            onPress={() => setSelectedRoutine(routine)}
          >
            <Ionicons name="create" size={16} color={t.warning} />
            <Text style={[styles.actionText, { color: t.warning }]}>
              Editar
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.actionButton, 
              { backgroundColor: routine.isActive ? t.error + '20' : t.success + '20' }
            ]}
            onPress={() => handleToggleRoutine(routine)}
          >
            <Ionicons 
              name={routine.isActive ? "pause" : "play"} 
              size={16} 
              color={routine.isActive ? t.error : t.success} 
            />
            <Text style={[
              styles.actionText, 
              { color: routine.isActive ? t.error : t.success }
            ]}>
              {routine.isActive ? 'Desativar' : 'Ativar'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (!visible) return null;

  return (
    <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
      <View style={[styles.modal, { backgroundColor: t.card }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: t.text }]}>Gerenciar Rotinas</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={t.text} />
          </TouchableOpacity>
        </View>

        {/* Filtros por Tipo */}
        <View style={styles.filtersSection}>
          <Text style={[styles.sectionTitle, { color: t.text }]}>Filtrar por Tipo</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {routineTypes.map((type) => (
              <TouchableOpacity
                key={type.key}
                onPress={() => setSelectedType(type.key as any)}
                style={[
                  styles.filterChip,
                  { backgroundColor: t.background },
                  selectedType === type.key && { backgroundColor: t.primary + '20' }
                ]}
              >
                <Ionicons 
                  name={type.icon as any} 
                  size={16} 
                  color={selectedType === type.key ? t.primary : t.textLight} 
                />
                <Text style={[
                  styles.filterText,
                  { color: t.text },
                  selectedType === type.key && { color: t.primary, fontWeight: '600' }
                ]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Estatísticas */}
        <View style={styles.statsSection}>
          <View style={[styles.statCard, { backgroundColor: t.background }]}>
            <Text style={[styles.statValue, { color: t.primary }]}>
              {routines.length}
            </Text>
            <Text style={[styles.statLabel, { color: t.textLight }]}>
              Total de Rotinas
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: t.background }]}>
            <Text style={[styles.statValue, { color: t.success }]}>
              {activeRoutines.length}
            </Text>
            <Text style={[styles.statLabel, { color: t.textLight }]}>
              Rotinas Ativas
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: t.background }]}>
            <Text style={[styles.statValue, { color: t.warning }]}>
              {routines.reduce((total, routine) => total + routine.activities.length, 0)}
            </Text>
            <Text style={[styles.statLabel, { color: t.textLight }]}>
              Total de Atividades
            </Text>
          </View>
        </View>

        {/* Lista de Rotinas */}
        <ScrollView style={styles.routinesList} showsVerticalScrollIndicator={false}>
          {filteredRoutines.length > 0 ? (
            filteredRoutines.map(renderRoutineCard)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="time-outline" size={64} color={t.textLight} />
              <Text style={[styles.emptyTitle, { color: t.text }]}>
                Nenhuma Rotina Encontrada
              </Text>
              <Text style={[styles.emptyDescription, { color: t.textLight }]}>
                {selectedType === 'all' 
                  ? 'Crie sua primeira rotina para começar'
                  : `Nenhuma rotina do tipo "${routineTypes.find(t => t.key === selectedType)?.label}" encontrada`
                }
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Botão de Nova Rotina */}
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: t.primary }]}
          onPress={() => {
            // Aqui você pode abrir um modal para criar nova rotina
            Alert.alert('Nova Rotina', 'Funcionalidade de criação de rotina será implementada em breve');
          }}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={[styles.addButtonText, { color: '#fff' }]}>
            Nova Rotina
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    width: width - 32,
    maxHeight: '90%',
    borderRadius: 12,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  filtersSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    gap: 6,
  },
  filterText: {
    fontSize: 14,
  },
  statsSection: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  routinesList: {
    flex: 1,
    marginBottom: 16,
  },
  routineCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  routineInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  routineIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  routineDetails: {
    flex: 1,
  },
  routineName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  routineDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  routineMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  routineStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activitiesSection: {
    marginBottom: 16,
  },
  activitiesTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  activityCard: {
    width: 100,
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  activityOrder: {
    fontSize: 12,
    fontWeight: '600',
  },
  activityTitle: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  activityDuration: {
    fontSize: 10,
  },
  optionalBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  optionalText: {
    fontSize: 8,
    fontWeight: '600',
  },
  routineActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});