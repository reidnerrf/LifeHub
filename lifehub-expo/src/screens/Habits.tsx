import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Alert,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { useHabits } from '../store/habits';
import WellnessCheckin from '../components/WellnessCheckin';
import ProductivityCorrelations from '../components/ProductivityCorrelations';

const { width } = Dimensions.get('window');

export default function Habits() {
  const t = useTheme();
  const {
    habits,
    checkins,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleHabit,
    incrementHabit,
    decrementHabit,
    getCompletionRate,
    getStreakStats,
    getCheckinForDate,
    selectedPeriod,
    setSelectedPeriod
  } = useHabits();

  const [showCheckin, setShowCheckin] = useState(false);
  const [showCorrelations, setShowCorrelations] = useState(false);

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    }).format(date);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return t.success;
    if (percentage >= 60) return t.warning;
    if (percentage >= 40) return t.primary;
    return t.error;
  };

  const handleAddHabit = () => {
    Alert.prompt(
      'Novo Hábito',
      'Digite o nome do hábito:',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Adicionar',
          onPress: (name) => {
            if (name && name.trim()) {
              addHabit({
                name: name.trim(),
                description: '',
                icon: '✅',
                category: 'Geral',
                color: t.primary,
                frequency: 'daily',
                target: 1,
                current: 0,
                streak: 0,
                longestStreak: 0,
                completedToday: false,
                completedDates: [],
                isActive: true,
              });
            }
          }
        }
      ],
      'plain-text'
    );
  };

  const handleEditHabit = (habit: any) => {
    Alert.prompt(
      'Editar Hábito',
      'Digite o novo nome:',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salvar',
          onPress: (name) => {
            if (name && name.trim()) {
              updateHabit(habit.id, { name: name.trim() });
            }
          }
        }
      ],
      'plain-text',
      habit.name
    );
  };

  const handleDeleteHabit = (habit: any) => {
    Alert.alert(
      'Excluir Hábito',
      `Tem certeza que deseja excluir "${habit.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: () => deleteHabit(habit.id)
        }
      ]
    );
  };

  const handleToggleHabit = (habit: any) => {
    toggleHabit(habit.id);
  };

  const handleIncrementHabit = (habit: any) => {
    incrementHabit(habit.id);
  };

  const handleDecrementHabit = (habit: any) => {
    decrementHabit(habit.id);
  };

  const completionRate = getCompletionRate('day');
  const streakStats = getStreakStats();
  const todayCheckin = getCheckinForDate(new Date());

  return (
    <View style={[styles.container, { backgroundColor: t.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: t.card }]}>
        <Text style={[styles.title, { color: t.text }]}>Hábitos & Bem-estar</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            onPress={() => setShowCheckin(true)}
            style={[styles.headerButton, { backgroundColor: t.background }]}
          >
            <Ionicons name="heart" size={20} color={t.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => setShowCorrelations(true)}
            style={[styles.headerButton, { backgroundColor: t.background }]}
          >
            <Ionicons name="analytics" size={20} color={t.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Seletor de Período */}
        <View style={[styles.periodSelector, { backgroundColor: t.card }]}>
          <View style={styles.periodButtons}>
            {(['week', 'month', 'year'] as const).map((period) => (
              <TouchableOpacity
                key={period}
                onPress={() => setSelectedPeriod(period)}
                style={[
                  styles.periodButton,
                  { backgroundColor: t.background },
                  selectedPeriod === period && { backgroundColor: t.primary + '20' }
                ]}
              >
                <Text style={[
                  styles.periodButtonText,
                  { color: t.text },
                  selectedPeriod === period && { color: t.primary, fontWeight: '600' }
                ]}>
                  {period === 'week' ? 'Semana' : period === 'month' ? 'Mês' : 'Ano'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Progress Overview */}
        <View style={[styles.progressCard, { backgroundColor: t.card }]}>
          <View style={styles.progressHeader}>
            <View>
              <Text style={[styles.progressTitle, { color: t.text }]}>
                Progresso de Hoje
              </Text>
              <Text style={[styles.progressSubtitle, { color: t.textLight }]}>
                {habits.filter(h => h.completedToday).length} de {habits.length} hábitos concluídos
              </Text>
            </View>
            <View style={styles.progressStats}>
              <Text style={[styles.progressPercentage, { color: getProgressColor(completionRate) }]}>
                {formatPercentage(completionRate)}
              </Text>
              <View style={styles.progressTrend}>
                <Ionicons name="trending-up" size={14} color={t.success} />
                <Text style={[styles.progressTrendText, { color: t.textLight }]}>
                  +5% vs ontem
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { 
                  width: `${completionRate}%`,
                  backgroundColor: getProgressColor(completionRate)
                }
              ]} 
            />
          </View>
        </View>

        {/* Wellness Check-in Status */}
        <View style={[styles.checkinCard, { backgroundColor: t.card }]}>
          <View style={styles.checkinHeader}>
            <View style={styles.checkinInfo}>
              <Ionicons name="heart" size={20} color="#FF6B6B" />
              <Text style={[styles.checkinTitle, { color: t.text }]}>
                Check-in de Bem-estar
              </Text>
            </View>
            <TouchableOpacity 
              onPress={() => setShowCheckin(true)}
              style={[styles.checkinButton, { backgroundColor: t.primary }]}
            >
              <Text style={[styles.checkinButtonText, { color: '#fff' }]}>
                {todayCheckin ? 'Atualizar' : 'Fazer Check-in'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {todayCheckin && (
            <View style={styles.checkinData}>
              <View style={styles.checkinMetric}>
                <Text style={[styles.checkinLabel, { color: t.textLight }]}>Humor</Text>
                <Text style={[styles.checkinValue, { color: t.text }]}>
                  {todayCheckin.mood}/5
                </Text>
              </View>
              <View style={styles.checkinMetric}>
                <Text style={[styles.checkinLabel, { color: t.textLight }]}>Energia</Text>
                <Text style={[styles.checkinValue, { color: t.text }]}>
                  {todayCheckin.energy}/5
                </Text>
              </View>
              <View style={styles.checkinMetric}>
                <Text style={[styles.checkinLabel, { color: t.textLight }]}>Sono</Text>
                <Text style={[styles.checkinValue, { color: t.text }]}>
                  {todayCheckin.sleepHours}h
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Streak Stats */}
        <View style={[styles.streakCard, { backgroundColor: t.card }]}>
          <Text style={[styles.sectionTitle, { color: t.text }]}>Sequências</Text>
          
          <View style={styles.streakGrid}>
            <View style={styles.streakItem}>
              <View style={styles.streakIcon}>
                <Ionicons name="flame" size={20} color="#FF9500" />
              </View>
              <Text style={[styles.streakValue, { color: t.text }]}>
                {streakStats.current}
              </Text>
              <Text style={[styles.streakLabel, { color: t.textLight }]}>
                Atual
              </Text>
            </View>
            
            <View style={styles.streakItem}>
              <View style={styles.streakIcon}>
                <Ionicons name="trophy" size={20} color="#FFD700" />
              </View>
              <Text style={[styles.streakValue, { color: t.text }]}>
                {streakStats.longest}
              </Text>
              <Text style={[styles.streakLabel, { color: t.textLight }]}>
                Maior
              </Text>
            </View>
            
            <View style={styles.streakItem}>
              <View style={styles.streakIcon}>
                <Ionicons name="analytics" size={20} color={t.primary} />
              </View>
              <Text style={[styles.streakValue, { color: t.text }]}>
                {streakStats.average}
              </Text>
              <Text style={[styles.streakLabel, { color: t.textLight }]}>
                Média
              </Text>
            </View>
          </View>
        </View>

        {/* Habits List */}
        <View style={styles.habitsSection}>
          <View style={styles.habitsHeader}>
            <Text style={[styles.sectionTitle, { color: t.text }]}>
              Meus Hábitos ({habits.length})
            </Text>
            <TouchableOpacity onPress={handleAddHabit}>
              <Ionicons name="add" size={24} color={t.primary} />
            </TouchableOpacity>
          </View>
          
          {habits.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle" size={64} color={t.textLight} />
              <Text style={[styles.emptyTitle, { color: t.text }]}>
                Nenhum Hábito Definido
              </Text>
              <Text style={[styles.emptyDescription, { color: t.textLight }]}>
                Crie seu primeiro hábito para começar a construir uma rotina saudável
              </Text>
              <TouchableOpacity
                onPress={handleAddHabit}
                style={[styles.createButton, { backgroundColor: t.primary }]}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={[styles.createButtonText, { color: '#fff' }]}>
                  Criar Primeiro Hábito
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.habitsList}>
              {habits.map((habit) => {
                const percentage = (habit.current / habit.target) * 100;
                const progressColor = getProgressColor(percentage);
                
                return (
                  <View key={habit.id} style={[styles.habitCard, { backgroundColor: t.card }]}>
                    <View style={styles.habitHeader}>
                      <View style={styles.habitInfo}>
                        <View style={[styles.habitIcon, { backgroundColor: habit.color + '20' }]}>
                          <Text style={styles.habitIconText}>{habit.icon}</Text>
                        </View>
                        
                        <View style={styles.habitDetails}>
                          <Text style={[styles.habitName, { color: t.text }]}>
                            {habit.name}
                          </Text>
                          <Text style={[styles.habitCategory, { color: t.textLight }]}>
                            {habit.category}
                          </Text>
                        </View>
                      </View>
                      
                      <View style={styles.habitActions}>
                        <TouchableOpacity
                          onPress={() => handleToggleHabit(habit)}
                          style={styles.habitToggle}
                        >
                          {habit.completedToday ? (
                            <Ionicons name="checkmark-circle" size={24} color={habit.color} />
                          ) : (
                            <Ionicons name="ellipse-outline" size={24} color={t.textLight} />
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>

                    {habit.target > 1 && (
                      <View style={styles.habitProgress}>
                        <View style={styles.progressInfo}>
                          <Text style={[styles.progressText, { color: t.text }]}>
                            {habit.current}/{habit.target} concluído
                          </Text>
                          <Text style={[styles.progressPercentage, { color: progressColor }]}>
                            {formatPercentage(percentage)}
                          </Text>
                        </View>
                        
                        <View style={styles.progressBar}>
                          <View 
                            style={[
                              styles.progressFill,
                              { 
                                width: `${Math.min(percentage, 100)}%`,
                                backgroundColor: progressColor
                              }
                            ]} 
                          />
                        </View>
                        
                        <View style={styles.progressActions}>
                          <TouchableOpacity
                            onPress={() => handleDecrementHabit(habit)}
                            style={[styles.progressButton, { backgroundColor: t.background }]}
                          >
                            <Ionicons name="remove" size={16} color={t.text} />
                          </TouchableOpacity>
                          
                          <TouchableOpacity
                            onPress={() => handleIncrementHabit(habit)}
                            style={[styles.progressButton, { backgroundColor: t.background }]}
                          >
                            <Ionicons name="add" size={16} color={t.text} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}

                    <View style={styles.habitFooter}>
                      <View style={styles.habitStats}>
                        <View style={styles.streakInfo}>
                          <Ionicons name="flame" size={14} color="#FF9500" />
                          <Text style={[styles.streakText, { color: t.textLight }]}>
                            {habit.streak} dias
                          </Text>
                        </View>
                        
                        {habit.longestStreak > 0 && (
                          <View style={styles.longestStreak}>
                            <Ionicons name="trophy" size={14} color="#FFD700" />
                            <Text style={[styles.streakText, { color: t.textLight }]}>
                              {habit.longestStreak}
                            </Text>
                          </View>
                        )}
                      </View>
                      
                      <View style={styles.habitMenu}>
                        <TouchableOpacity
                          onPress={() => handleEditHabit(habit)}
                          style={[styles.menuButton, { backgroundColor: t.primary + '20' }]}
                        >
                          <Ionicons name="create" size={16} color={t.primary} />
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                          onPress={() => handleDeleteHabit(habit)}
                          style={[styles.menuButton, { backgroundColor: t.error + '20' }]}
                        >
                          <Ionicons name="trash" size={16} color={t.error} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Weekly Overview */}
        <View style={[styles.weeklyCard, { backgroundColor: t.card }]}>
          <Text style={[styles.sectionTitle, { color: t.text }]}>
            Esta Semana
          </Text>
          
          <View style={styles.weeklyGrid}>
            {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((day, index) => {
              const isToday = index === new Date().getDay();
              const isCompleted = index < new Date().getDay(); // Mock completed days
              
              return (
                <View key={index} style={styles.weeklyDay}>
                  <Text style={[styles.weeklyDayLabel, { color: t.textLight }]}>
                    {day}
                  </Text>
                  <View 
                    style={[
                      styles.weeklyDayCircle,
                      { backgroundColor: t.background },
                      isToday && { backgroundColor: t.primary },
                      isCompleted && { backgroundColor: t.success }
                    ]}
                  >
                    <Text style={[
                      styles.weeklyDayText,
                      { color: t.textLight },
                      (isToday || isCompleted) && { color: '#fff' }
                    ]}>
                      {isCompleted ? '✓' : index + 1}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Modais */}
      <WellnessCheckin
        visible={showCheckin}
        onClose={() => setShowCheckin(false)}
      />

      <ProductivityCorrelations
        visible={showCorrelations}
        onClose={() => setShowCorrelations(false)}
      />
    </View>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  periodSelector: {
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  periodButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  progressSubtitle: {
    fontSize: 14,
  },
  progressStats: {
    alignItems: 'flex-end',
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  progressTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  progressTrendText: {
    fontSize: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  checkinCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  checkinHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkinInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkinTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  checkinButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  checkinButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  checkinData: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  checkinMetric: {
    alignItems: 'center',
    flex: 1,
  },
  checkinLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  checkinValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  streakCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  streakGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  streakItem: {
    alignItems: 'center',
    flex: 1,
  },
  streakIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  streakValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  streakLabel: {
    fontSize: 12,
  },
  habitsSection: {
    marginBottom: 16,
  },
  habitsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  habitsList: {
    gap: 12,
  },
  habitCard: {
    borderRadius: 12,
    padding: 16,
  },
  habitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  habitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  habitIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  habitIconText: {
    fontSize: 24,
  },
  habitDetails: {
    flex: 1,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  habitCategory: {
    fontSize: 14,
  },
  habitActions: {
    flexDirection: 'row',
    gap: 8,
  },
  habitToggle: {
    padding: 4,
  },
  habitProgress: {
    marginBottom: 12,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
  },
  progressActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  progressButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  habitStats: {
    flexDirection: 'row',
    gap: 16,
  },
  streakInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  longestStreak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakText: {
    fontSize: 12,
  },
  habitMenu: {
    flexDirection: 'row',
    gap: 8,
  },
  menuButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weeklyCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  weeklyGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weeklyDay: {
    alignItems: 'center',
  },
  weeklyDayLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  weeklyDayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weeklyDayText: {
    fontSize: 12,
    fontWeight: '600',
  },
});