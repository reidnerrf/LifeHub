import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { useGamification, Achievement } from '../store/gamification';

const { width } = Dimensions.get('window');

interface AchievementsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AchievementsModal({ visible, onClose }: AchievementsModalProps) {
  const t = useTheme();
  const {
    achievements,
    getUnlockedAchievements,
    getLockedAchievements,
    getAchievementsByCategory,
    selectedAchievement,
    setSelectedAchievement,
  } = useGamification();

  const [selectedCategory, setSelectedCategory] = useState<'all' | Achievement['category']>('all');

  const categories = [
    { key: 'all', label: 'Todas', icon: 'grid' },
    { key: 'consistency', label: 'Consistência', icon: 'flame' },
    { key: 'productivity', label: 'Produtividade', icon: 'checkmark-circle' },
    { key: 'health', label: 'Saúde', icon: 'heart' },
    { key: 'learning', label: 'Aprendizado', icon: 'school' },
    { key: 'social', label: 'Social', icon: 'people' },
    { key: 'special', label: 'Especiais', icon: 'star' },
  ];

  const filteredAchievements = selectedCategory === 'all'
    ? achievements
    : getAchievementsByCategory(selectedCategory as Achievement['category']);

  const unlockedAchievements = getUnlockedAchievements();
  const lockedAchievements = getLockedAchievements();

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'consistency': return '#FF6B6B';
      case 'productivity': return '#4ECDC4';
      case 'health': return '#45B7D1';
      case 'learning': return '#96CEB4';
      case 'social': return '#FFEAA7';
      case 'special': return '#DDA0DD';
      default: return t.primary;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'consistency': return 'flame';
      case 'productivity': return 'checkmark-circle';
      case 'health': return 'heart';
      case 'learning': return 'school';
      case 'social': return 'people';
      case 'special': return 'star';
      default: return 'trophy';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    }).format(date);
  };

  const renderAchievementCard = (achievement: Achievement) => {
    const categoryColor = getCategoryColor(achievement.category);
    const progressPercentage = (achievement.progress / achievement.maxProgress) * 100;
    
    return (
      <TouchableOpacity
        key={achievement.id}
        style={[styles.achievementCard, { backgroundColor: t.card }]}
        onPress={() => setSelectedAchievement(achievement)}
      >
        <View style={styles.achievementHeader}>
          <View style={[styles.achievementIcon, { backgroundColor: categoryColor + '20' }]}>
            <Ionicons 
              name={achievement.icon as any} 
              size={24} 
              color={achievement.isUnlocked ? categoryColor : t.textLight} 
            />
          </View>
          <View style={styles.achievementInfo}>
            <Text style={[styles.achievementName, { color: t.text }]}>
              {achievement.name}
            </Text>
            <Text style={[styles.achievementDescription, { color: t.textLight }]}>
              {achievement.description}
            </Text>
          </View>
          <View style={styles.achievementStatus}>
            {achievement.isUnlocked ? (
              <View style={[styles.unlockedBadge, { backgroundColor: t.success + '20' }]}>
                <Ionicons name="checkmark" size={16} color={t.success} />
              </View>
            ) : (
              <View style={[styles.lockedBadge, { backgroundColor: t.textLight + '20' }]}>
                <Ionicons name="lock-closed" size={16} color={t.textLight} />
              </View>
            )}
          </View>
        </View>

        <View style={styles.achievementProgress}>
          <View style={styles.progressInfo}>
            <Text style={[styles.progressText, { color: t.textLight }]}>
              {achievement.progress}/{achievement.maxProgress}
            </Text>
            <Text style={[styles.progressPercentage, { color: t.textLight }]}>
              {Math.round(progressPercentage)}%
            </Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: t.background }]}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  backgroundColor: achievement.isUnlocked ? t.success : categoryColor,
                  width: `${progressPercentage}%`
                }
              ]} 
            />
          </View>
        </View>

        <View style={styles.achievementFooter}>
          <View style={styles.achievementMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="trophy" size={14} color={t.warning} />
              <Text style={[styles.metaText, { color: t.textLight }]}>
                {achievement.points} pts
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name={getCategoryIcon(achievement.category)} size={14} color={categoryColor} />
              <Text style={[styles.metaText, { color: t.textLight }]}>
                {categories.find(c => c.key === achievement.category)?.label}
              </Text>
            </View>
          </View>
          
          {achievement.isUnlocked && achievement.unlockedAt && (
            <Text style={[styles.unlockedDate, { color: t.textLight }]}>
              Desbloqueada em {formatDate(achievement.unlockedAt)}
            </Text>
          )}
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
          <Text style={[styles.title, { color: t.text }]}>Conquistas</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={t.text} />
          </TouchableOpacity>
        </View>

        {/* Estatísticas */}
        <View style={styles.statsSection}>
          <View style={[styles.statCard, { backgroundColor: t.background }]}>
            <Text style={[styles.statValue, { color: t.primary }]}>
              {unlockedAchievements.length}
            </Text>
            <Text style={[styles.statLabel, { color: t.textLight }]}>
              Desbloqueadas
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: t.background }]}>
            <Text style={[styles.statValue, { color: t.success }]}>
              {achievements.length}
            </Text>
            <Text style={[styles.statLabel, { color: t.textLight }]}>
              Total
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: t.background }]}>
            <Text style={[styles.statValue, { color: t.warning }]}>
              {Math.round((unlockedAchievements.length / achievements.length) * 100)}%
            </Text>
            <Text style={[styles.statLabel, { color: t.textLight }]}>
              Progresso
            </Text>
          </View>
        </View>

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

        {/* Lista de Conquistas */}
        <ScrollView style={styles.achievementsList} showsVerticalScrollIndicator={false}>
          {filteredAchievements.length > 0 ? (
            filteredAchievements.map(renderAchievementCard)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="trophy-outline" size={64} color={t.textLight} />
              <Text style={[styles.emptyTitle, { color: t.text }]}>
                Nenhuma Conquista Encontrada
              </Text>
              <Text style={[styles.emptyDescription, { color: t.textLight }]}>
                {selectedCategory === 'all' 
                  ? 'Complete atividades para desbloquear conquistas'
                  : `Nenhuma conquista da categoria "${categories.find(c => c.key === selectedCategory)?.label}" encontrada`
                }
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Modal de Detalhes da Conquista */}
        {selectedAchievement && (
          <View style={[styles.detailModal, { backgroundColor: t.background }]}>
            <View style={styles.detailHeader}>
              <View style={[styles.detailIcon, { backgroundColor: getCategoryColor(selectedAchievement.category) + '20' }]}>
                <Ionicons 
                  name={selectedAchievement.icon as any} 
                  size={32} 
                  color={getCategoryColor(selectedAchievement.category)} 
                />
              </View>
              <View style={styles.detailInfo}>
                <Text style={[styles.detailTitle, { color: t.text }]}>
                  {selectedAchievement.name}
                </Text>
                <Text style={[styles.detailDescription, { color: t.textLight }]}>
                  {selectedAchievement.description}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedAchievement(null)}>
                <Ionicons name="close" size={20} color={t.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.detailContent}>
              <View style={styles.detailStats}>
                <View style={styles.detailStat}>
                  <Text style={[styles.detailStatLabel, { color: t.textLight }]}>
                    Pontos
                  </Text>
                  <Text style={[styles.detailStatValue, { color: t.warning }]}>
                    {selectedAchievement.points}
                  </Text>
                </View>
                <View style={styles.detailStat}>
                  <Text style={[styles.detailStatLabel, { color: t.textLight }]}>
                    Progresso
                  </Text>
                  <Text style={[styles.detailStatValue, { color: t.primary }]}>
                    {selectedAchievement.progress}/{selectedAchievement.maxProgress}
                  </Text>
                </View>
                <View style={styles.detailStat}>
                  <Text style={[styles.detailStatLabel, { color: t.textLight }]}>
                    Status
                  </Text>
                  <Text style={[
                    styles.detailStatValue, 
                    { color: selectedAchievement.isUnlocked ? t.success : t.textLight }
                  ]}>
                    {selectedAchievement.isUnlocked ? 'Desbloqueada' : 'Bloqueada'}
                  </Text>
                </View>
              </View>
              
              {selectedAchievement.isUnlocked && selectedAchievement.unlockedAt && (
                <View style={styles.unlockInfo}>
                  <Ionicons name="checkmark-circle" size={16} color={t.success} />
                  <Text style={[styles.unlockText, { color: t.success }]}>
                    Desbloqueada em {formatDate(selectedAchievement.unlockedAt)}
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
  achievementsList: {
    flex: 1,
  },
  achievementCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  achievementStatus: {
    alignItems: 'flex-end',
  },
  unlockedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementProgress: {
    marginBottom: 12,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressText: {
    fontSize: 12,
  },
  progressPercentage: {
    fontSize: 12,
    fontWeight: '600',
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
  achievementFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  achievementMeta: {
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
  unlockedDate: {
    fontSize: 12,
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
  unlockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  unlockText: {
    fontSize: 14,
    fontWeight: '600',
  },
});