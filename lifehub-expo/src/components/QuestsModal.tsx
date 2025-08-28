import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { useGamification, Quest } from '../store/gamification';

const { width } = Dimensions.get('window');

interface QuestsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function QuestsModal({ visible, onClose }: QuestsModalProps) {
  const t = useTheme();
  const {
    quests,
    getActiveQuests,
    getCompletedQuests,
    getQuestsByCategory,
    generateAIQuests,
    completeQuest,
    selectedQuest,
    setSelectedQuest,
    isLoading,
  } = useGamification();

  const [selectedCategory, setSelectedCategory] = useState<'all' | Quest['category']>('all');

  const categories = [
    { key: 'all', label: 'Todas', icon: 'grid' },
    { key: 'daily', label: 'Diárias', icon: 'sunny' },
    { key: 'weekly', label: 'Semanais', icon: 'calendar' },
    { key: 'monthly', label: 'Mensais', icon: 'calendar-outline' },
    { key: 'special', label: 'Especiais', icon: 'star' },
  ];

  const filteredQuests = selectedCategory === 'all'
    ? quests
    : getQuestsByCategory(selectedCategory as Quest['category']);

  const activeQuests = getActiveQuests();
  const completedQuests = getCompletedQuests();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return t.success;
      case 'medium': return t.warning;
      case 'hard': return t.error;
      case 'epic': return '#8A2BE2';
      default: return t.textLight;
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'leaf';
      case 'medium': return 'flash';
      case 'hard': return 'flame';
      case 'epic': return 'diamond';
      default: return 'help';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'tasks': return 'checkmark-circle';
      case 'habits': return 'repeat';
      case 'focus': return 'timer';
      case 'events': return 'calendar';
      case 'consistency': return 'flame';
      case 'productivity': return 'trending-up';
      default: return 'star';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getTimeRemaining = (expiresAt: Date) => {
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h restantes`;
    } else if (hours > 0) {
      return `${hours}h restantes`;
    } else {
      return 'Expira em breve';
    }
  };

  const handleGenerateAIQuests = async () => {
    try {
      const aiQuests = await generateAIQuests();
      Alert.alert('Sucesso', `${aiQuests.length} novas quests geradas pela IA!`);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao gerar quests pela IA');
    }
  };

  const handleCompleteQuest = (quest: Quest) => {
    Alert.alert(
      'Completar Quest',
      `Deseja marcar "${quest.title}" como completa?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Completar',
          onPress: () => {
            completeQuest(quest.id);
            Alert.alert('Sucesso', `Quest "${quest.title}" completada! +${quest.rewards.points} pontos`);
          }
        }
      ]
    );
  };

  const renderQuestCard = (quest: Quest) => {
    const difficultyColor = getDifficultyColor(quest.difficulty);
    const progressPercentage = (quest.objective.current / quest.objective.target) * 100;
    const isExpired = new Date() > quest.expiresAt;
    
    return (
      <TouchableOpacity
        key={quest.id}
        style={[styles.questCard, { backgroundColor: t.card }]}
        onPress={() => setSelectedQuest(quest)}
      >
        <View style={styles.questHeader}>
          <View style={styles.questInfo}>
            <View style={[styles.questIcon, { backgroundColor: difficultyColor + '20' }]}>
              <Ionicons name={getTypeIcon(quest.type)} size={20} color={difficultyColor} />
            </View>
            <View style={styles.questDetails}>
              <Text style={[styles.questTitle, { color: t.text }]}>
                {quest.title}
              </Text>
              <Text style={[styles.questDescription, { color: t.textLight }]}>
                {quest.description}
              </Text>
            </View>
          </View>
          
          <View style={styles.questStatus}>
            {quest.isCompleted ? (
              <View style={[styles.completedBadge, { backgroundColor: t.success + '20' }]}>
                <Ionicons name="checkmark" size={16} color={t.success} />
              </View>
            ) : isExpired ? (
              <View style={[styles.expiredBadge, { backgroundColor: t.error + '20' }]}>
                <Ionicons name="time" size={16} color={t.error} />
              </View>
            ) : (
              <View style={[styles.activeBadge, { backgroundColor: t.primary + '20' }]}>
                <Ionicons name="play" size={16} color={t.primary} />
              </View>
            )}
          </View>
        </View>

        <View style={styles.questObjective}>
          <Text style={[styles.objectiveText, { color: t.text }]}>
            {quest.objective.action}: {quest.objective.current}/{quest.objective.target} {quest.objective.unit}
          </Text>
          <View style={[styles.progressBar, { backgroundColor: t.background }]}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  backgroundColor: quest.isCompleted ? t.success : difficultyColor,
                  width: `${progressPercentage}%`
                }
              ]} 
            />
          </View>
        </View>

        <View style={styles.questFooter}>
          <View style={styles.questMeta}>
            <View style={styles.metaItem}>
              <Ionicons name={getDifficultyIcon(quest.difficulty)} size={14} color={difficultyColor} />
              <Text style={[styles.metaText, { color: t.textLight }]}>
                {quest.difficulty}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="trophy" size={14} color={t.warning} />
              <Text style={[styles.metaText, { color: t.textLight }]}>
                {quest.rewards.points} pts
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="star" size={14} color={t.primary} />
              <Text style={[styles.metaText, { color: t.textLight }]}>
                {quest.rewards.experience} XP
              </Text>
            </View>
          </View>
          
          <View style={styles.questActions}>
            <Text style={[styles.timeRemaining, { color: isExpired ? t.error : t.textLight }]}>
              {getTimeRemaining(quest.expiresAt)}
            </Text>
            
            {!quest.isCompleted && !isExpired && (
              <TouchableOpacity
                style={[styles.completeButton, { backgroundColor: t.success }]}
                onPress={() => handleCompleteQuest(quest)}
              >
                <Ionicons name="checkmark" size={14} color="#fff" />
                <Text style={[styles.completeButtonText, { color: '#fff' }]}>
                  Completar
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (!visible) return null;

  return (
    <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
      <View style={[styles.modal, { backgroundColor: t.card }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: t.text }]}>Quests</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={t.text} />
          </TouchableOpacity>
        </View>

        {/* Estatísticas */}
        <View style={styles.statsSection}>
          <View style={[styles.statCard, { backgroundColor: t.background }]}>
            <Text style={[styles.statValue, { color: t.primary }]}>
              {activeQuests.length}
            </Text>
            <Text style={[styles.statLabel, { color: t.textLight }]}>
              Ativas
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: t.background }]}>
            <Text style={[styles.statValue, { color: t.success }]}>
              {completedQuests.length}
            </Text>
            <Text style={[styles.statLabel, { color: t.textLight }]}>
              Completadas
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: t.background }]}>
            <Text style={[styles.statValue, { color: t.warning }]}>
              {quests.length}
            </Text>
            <Text style={[styles.statLabel, { color: t.textLight }]}>
              Total
            </Text>
          </View>
        </View>

        {/* Botão de Gerar Quests IA */}
        <TouchableOpacity
          style={[styles.aiButton, { backgroundColor: t.primary }]}
          onPress={handleGenerateAIQuests}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="sparkles" size={16} color="#fff" />
              <Text style={[styles.aiButtonText, { color: '#fff' }]}>
                Gerar Quests IA
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Filtros por Categoria */}
        <View style={styles.filtersSection}>
          <Text style={[styles.sectionTitle, { color: t.text }]}>Filtrar por Categoria</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.key}
                onPress={() => setSelectedCategory(category.key as any)}
                style={[
                  styles.filterChip,
                  { backgroundColor: t.background },
                  selectedCategory === category.key && { backgroundColor: t.primary + '20' }
                ]}
              >
                <Ionicons 
                  name={category.icon as any} 
                  size={16} 
                  color={selectedCategory === category.key ? t.primary : t.textLight} 
                />
                <Text style={[
                  styles.filterText,
                  { color: t.text },
                  selectedCategory === category.key && { color: t.primary, fontWeight: '600' }
                ]}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Lista de Quests */}
        <ScrollView style={styles.questsList} showsVerticalScrollIndicator={false}>
          {filteredQuests.length > 0 ? (
            filteredQuests.map(renderQuestCard)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="star-outline" size={64} color={t.textLight} />
              <Text style={[styles.emptyTitle, { color: t.text }]}>
                Nenhuma Quest Encontrada
              </Text>
              <Text style={[styles.emptyDescription, { color: t.textLight }]}>
                {selectedCategory === 'all' 
                  ? 'Use o botão "Gerar Quests IA" para criar novas missões'
                  : `Nenhuma quest da categoria "${categories.find(c => c.key === selectedCategory)?.label}" encontrada`
                }
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Modal de Detalhes da Quest */}
        {selectedQuest && (
          <View style={[styles.detailModal, { backgroundColor: t.background }]}>
            <View style={styles.detailHeader}>
              <View style={[styles.detailIcon, { backgroundColor: getDifficultyColor(selectedQuest.difficulty) + '20' }]}>
                <Ionicons 
                  name={getTypeIcon(selectedQuest.type)} 
                  size={32} 
                  color={getDifficultyColor(selectedQuest.difficulty)} 
                />
              </View>
              <View style={styles.detailInfo}>
                <Text style={[styles.detailTitle, { color: t.text }]}>
                  {selectedQuest.title}
                </Text>
                <Text style={[styles.detailDescription, { color: t.textLight }]}>
                  {selectedQuest.description}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedQuest(null)}>
                <Ionicons name="close" size={20} color={t.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.detailContent}>
              <View style={styles.detailStats}>
                <View style={styles.detailStat}>
                  <Text style={[styles.detailStatLabel, { color: t.textLight }]}>
                    Dificuldade
                  </Text>
                  <Text style={[styles.detailStatValue, { color: getDifficultyColor(selectedQuest.difficulty) }]}>
                    {selectedQuest.difficulty}
                  </Text>
                </View>
                <View style={styles.detailStat}>
                  <Text style={[styles.detailStatLabel, { color: t.textLight }]}>
                    Recompensa
                  </Text>
                  <Text style={[styles.detailStatValue, { color: t.warning }]}>
                    {selectedQuest.rewards.points} pts
                  </Text>
                </View>
                <View style={styles.detailStat}>
                  <Text style={[styles.detailStatLabel, { color: t.textLight }]}>
                    Experiência
                  </Text>
                  <Text style={[styles.detailStatValue, { color: t.primary }]}>
                    {selectedQuest.rewards.experience} XP
                  </Text>
                </View>
              </View>
              
              <View style={styles.objectiveDetail}>
                <Text style={[styles.objectiveTitle, { color: t.text }]}>
                  Objetivo
                </Text>
                <Text style={[styles.objectiveDetailText, { color: t.textLight }]}>
                  {selectedQuest.objective.action}: {selectedQuest.objective.current}/{selectedQuest.objective.target} {selectedQuest.objective.unit}
                </Text>
              </View>
              
              <View style={styles.timeInfo}>
                <Ionicons name="time" size={16} color={t.textLight} />
                <Text style={[styles.timeText, { color: t.textLight }]}>
                  Expira em: {formatDate(selectedQuest.expiresAt)}
                </Text>
              </View>
              
              {selectedQuest.suggestedBy === 'ai' && (
                <View style={styles.aiInfo}>
                  <Ionicons name="sparkles" size={16} color={t.primary} />
                  <Text style={[styles.aiText, { color: t.primary }]}>
                    Sugerida pela IA
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
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
  statsSection: {
    flexDirection: 'row',
    marginBottom: 16,
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
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  aiButtonText: {
    fontSize: 14,
    fontWeight: '600',
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
  questsList: {
    flex: 1,
  },
  questCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  questHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  questInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  questIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  questDetails: {
    flex: 1,
  },
  questTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  questDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  questStatus: {
    alignItems: 'flex-end',
  },
  completedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expiredBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questObjective: {
    marginBottom: 12,
  },
  objectiveText: {
    fontSize: 14,
    marginBottom: 6,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  questFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questMeta: {
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
  questActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  timeRemaining: {
    fontSize: 12,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  completeButtonText: {
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
  detailModal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: 12,
    padding: 20,
    margin: 20,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailInfo: {
    flex: 1,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  detailDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  detailContent: {
    gap: 16,
  },
  detailStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  detailStat: {
    alignItems: 'center',
  },
  detailStatLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  detailStatValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  objectiveDetail: {
    gap: 8,
  },
  objectiveTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  objectiveDetailText: {
    fontSize: 14,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    fontSize: 14,
  },
  aiInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiText: {
    fontSize: 14,
    fontWeight: '600',
  },
});