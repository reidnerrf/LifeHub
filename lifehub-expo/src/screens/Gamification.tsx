import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { useGamification, Medal } from '../store/gamification';
import AchievementsModal from '../components/AchievementsModal';
import QuestsModal from '../components/QuestsModal';

const { width } = Dimensions.get('window');

export default function Gamification() {
  const t = useTheme();
  const {
    userProfile,
    achievements,
    medals,
    quests,
    streaks,
    leaderboard,
    getGamificationStats,
    getUnlockedAchievements,
    getUnlockedMedals,
    getActiveQuests,
    getTopUsers,
    getUserRank,
  } = useGamification();

  const [showAchievements, setShowAchievements] = useState(false);
  const [showQuests, setShowQuests] = useState(false);

  const stats = getGamificationStats();
  const unlockedAchievements = getUnlockedAchievements();
  const unlockedMedals = getUnlockedMedals();
  const activeQuests = getActiveQuests();
  const topUsers = getTopUsers(5);
  const userRank = getUserRank();

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return '#CD7F32';
      case 'rare': return '#C0C0C0';
      case 'epic': return '#FFD700';
      case 'legendary': return '#FF6B6B';
      default: return t.textLight;
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'medal';
      case 'rare': return 'star';
      case 'epic': return 'diamond';
      case 'legendary': return 'trophy';
      default: return 'help';
    }
  };

  const getStreakIcon = (type: string) => {
    switch (type) {
      case 'consistency': return 'flame';
      case 'tasks': return 'checkmark-circle';
      case 'habits': return 'repeat';
      case 'focus': return 'timer';
      default: return 'trending-up';
    }
  };

  const getStreakColor = (type: string) => {
    switch (type) {
      case 'consistency': return '#FF6B6B';
      case 'tasks': return '#4ECDC4';
      case 'habits': return '#45B7D1';
      case 'focus': return '#96CEB4';
      default: return t.primary;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    }).format(date);
  };

  const getLevelProgress = () => {
    const progress = (stats.experience / stats.experienceToNextLevel) * 100;
    return Math.min(progress, 100);
  };

  const renderMedalCard = (medal: Medal) => {
    const rarityColor = getRarityColor(medal.rarity);
    const progressPercentage = (medal.progress / medal.maxProgress) * 100;
    
    return (
      <View key={medal.id} style={[styles.medalCard, { backgroundColor: t.card }]}>
        <View style={styles.medalHeader}>
          <View style={[styles.medalIcon, { backgroundColor: medal.color + '20' }]}>
            <Ionicons name={medal.icon as any} size={24} color={medal.color} />
          </View>
          <View style={styles.medalInfo}>
            <Text style={[styles.medalName, { color: t.text }]}>
              {medal.name}
            </Text>
            <Text style={[styles.medalDescription, { color: t.textLight }]}>
              {medal.description}
            </Text>
          </View>
          <View style={styles.medalRarity}>
            <Ionicons name={getRarityIcon(medal.rarity) as any} size={16} color={rarityColor} />
            <Text style={[styles.rarityText, { color: rarityColor }]}>
              {medal.rarity}
            </Text>
          </View>
        </View>

        <View style={styles.medalProgress}>
          <View style={styles.progressInfo}>
            <Text style={[styles.progressText, { color: t.textLight }]}>
              {medal.progress}/{medal.maxProgress}
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
                  backgroundColor: medal.isUnlocked ? medal.color : rarityColor,
                  width: `${progressPercentage}%`
                }
              ]} 
            />
          </View>
        </View>

        {medal.isUnlocked && medal.unlockedAt && (
          <Text style={[styles.unlockedDate, { color: t.textLight }]}>
            Desbloqueada em {formatDate(medal.unlockedAt)}
          </Text>
        )}
      </View>
    );
  };

  const renderStreakCard = (streak: any) => {
    const streakColor = getStreakColor(streak.type);
    
    return (
      <View key={streak.id} style={[styles.streakCard, { backgroundColor: t.card }]}>
        <View style={styles.streakHeader}>
          <View style={[styles.streakIcon, { backgroundColor: streakColor + '20' }]}>
            <Ionicons name={getStreakIcon(streak.type) as any} size={20} color={streakColor} />
          </View>
          <View style={styles.streakInfo}>
            <Text style={[styles.streakType, { color: t.text }]}>
              {streak.type === 'consistency' ? 'Consistência' :
               streak.type === 'tasks' ? 'Tarefas' :
               streak.type === 'habits' ? 'Hábitos' :
               streak.type === 'focus' ? 'Foco' : 'Geral'}
            </Text>
            <Text style={[styles.streakCurrent, { color: streakColor }]}>
              {streak.currentStreak} dias atuais
            </Text>
          </View>
        </View>
        
        <View style={styles.streakStats}>
          <View style={styles.streakStat}>
            <Text style={[styles.streakStatValue, { color: t.primary }]}>
              {streak.currentStreak}
            </Text>
            <Text style={[styles.streakStatLabel, { color: t.textLight }]}>
              Atual
            </Text>
          </View>
          <View style={styles.streakStat}>
            <Text style={[styles.streakStatValue, { color: t.success }]}>
              {streak.longestStreak}
            </Text>
            <Text style={[styles.streakStatLabel, { color: t.textLight }]}>
              Recorde
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: t.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: t.card }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerInfo}>
            <Text style={[styles.title, { color: t.text }]}>Gamificação</Text>
            <Text style={[styles.subtitle, { color: t.textLight }]}>
              Complete desafios e ganhe recompensas
            </Text>
          </View>
          <View style={[styles.levelBadge, { backgroundColor: t.primary + '20' }]}>
            <Text style={[styles.levelText, { color: t.primary }]}>
              Nível {stats.level}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Perfil do Usuário */}
        <View style={[styles.profileCard, { backgroundColor: t.card }]}>
          <View style={styles.profileHeader}>
            <View style={styles.profileInfo}>
              <Text style={[styles.username, { color: t.text }]}>
                {userProfile.username}
              </Text>
              <Text style={[styles.joinDate, { color: t.textLight }]}>
                Membro desde {formatDate(userProfile.joinDate)}
              </Text>
            </View>
            <View style={styles.profileStats}>
              <View style={styles.profileStat}>
                <Text style={[styles.profileStatValue, { color: t.primary }]}>
                  {stats.totalPoints}
                </Text>
                <Text style={[styles.profileStatLabel, { color: t.textLight }]}>
                  Pontos
                </Text>
              </View>
              <View style={styles.profileStat}>
                <Text style={[styles.profileStatValue, { color: t.success }]}>
                  {stats.currentStreak}
                </Text>
                <Text style={[styles.profileStatLabel, { color: t.textLight }]}>
                  Sequência
                </Text>
              </View>
            </View>
          </View>

          {/* Barra de Progresso do Nível */}
          <View style={styles.levelProgress}>
            <View style={styles.levelProgressInfo}>
              <Text style={[styles.levelProgressText, { color: t.textLight }]}>
                {stats.experience}/{stats.experienceToNextLevel} XP
              </Text>
              <Text style={[styles.levelProgressPercentage, { color: t.textLight }]}>
                {Math.round(getLevelProgress())}%
              </Text>
            </View>
            <View style={[styles.levelProgressBar, { backgroundColor: t.background }]}>
              <View 
                style={[
                  styles.levelProgressFill, 
                  { 
                    backgroundColor: t.primary,
                    width: `${getLevelProgress()}%`
                  }
                ]} 
              />
            </View>
          </View>
        </View>

        {/* Estatísticas Gerais */}
        <View style={[styles.statsSection, { backgroundColor: t.card }]}>
          <Text style={[styles.sectionTitle, { color: t.text }]}>Estatísticas</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statItem, { backgroundColor: t.background }]}>
              <Ionicons name="trophy" size={24} color={t.warning} />
              <Text style={[styles.statValue, { color: t.text }]}>
                {stats.achievementsUnlocked}/{stats.totalAchievements}
              </Text>
              <Text style={[styles.statLabel, { color: t.textLight }]}>
                Conquistas
              </Text>
            </View>
            <View style={[styles.statItem, { backgroundColor: t.background }]}>
              <Ionicons name="medal" size={24} color={t.success} />
              <Text style={[styles.statValue, { color: t.text }]}>
                {stats.medalsUnlocked}/{stats.totalMedals}
              </Text>
              <Text style={[styles.statLabel, { color: t.textLight }]}>
                Medalhas
              </Text>
            </View>
            <View style={[styles.statItem, { backgroundColor: t.background }]}>
              <Ionicons name="star" size={24} color={t.primary} />
              <Text style={[styles.statValue, { color: t.text }]}>
                {stats.questsCompleted}/{stats.totalQuests}
              </Text>
              <Text style={[styles.statLabel, { color: t.textLight }]}>
                Quests
              </Text>
            </View>
            <View style={[styles.statItem, { backgroundColor: t.background }]}>
              <Ionicons name="trending-up" size={24} color={t.error} />
              <Text style={[styles.statValue, { color: t.text }]}>
                {stats.longestStreak}
              </Text>
              <Text style={[styles.statLabel, { color: t.textLight }]}>
                Recorde
              </Text>
            </View>
          </View>
        </View>

        {/* Medalhas Recentes */}
        <View style={[styles.section, { backgroundColor: t.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: t.text }]}>Medalhas</Text>
            <TouchableOpacity onPress={() => Alert.alert('Medalhas', 'Visualizar todas as medalhas')}>
              <Ionicons name="chevron-forward" size={20} color={t.textLight} />
            </TouchableOpacity>
          </View>
          
          {unlockedMedals.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {unlockedMedals.slice(0, 3).map(renderMedalCard)}
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="medal-outline" size={32} color={t.textLight} />
              <Text style={[styles.emptyStateText, { color: t.textLight }]}>
                Nenhuma medalha desbloqueada
              </Text>
            </View>
          )}
        </View>

        {/* Sequências Ativas */}
        <View style={[styles.section, { backgroundColor: t.card }]}>
          <Text style={[styles.sectionTitle, { color: t.text }]}>Sequências Ativas</Text>
          
          {streaks.length > 0 ? (
            <View style={styles.streaksGrid}>
              {streaks.map(renderStreakCard)}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="flame-outline" size={32} color={t.textLight} />
              <Text style={[styles.emptyStateText, { color: t.textLight }]}>
                Nenhuma sequência ativa
              </Text>
            </View>
          )}
        </View>

        {/* Quests Ativas */}
        <View style={[styles.section, { backgroundColor: t.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: t.text }]}>Quests Ativas</Text>
            <TouchableOpacity onPress={() => setShowQuests(true)}>
              <Ionicons name="chevron-forward" size={20} color={t.textLight} />
            </TouchableOpacity>
          </View>
          
          {activeQuests.length > 0 ? (
            <View style={styles.questsList}>
              {activeQuests.slice(0, 2).map((quest) => (
                <View key={quest.id} style={[styles.questItem, { backgroundColor: t.background }]}>
                  <View style={styles.questInfo}>
                    <Text style={[styles.questTitle, { color: t.text }]}>
                      {quest.title}
                    </Text>
                    <Text style={[styles.questProgress, { color: t.textLight }]}>
                      {quest.objective.current}/{quest.objective.target} {quest.objective.unit}
                    </Text>
                  </View>
                  <View style={styles.questReward}>
                    <Text style={[styles.questPoints, { color: t.warning }]}>
                      +{quest.rewards.points}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="star-outline" size={32} color={t.textLight} />
              <Text style={[styles.emptyStateText, { color: t.textLight }]}>
                Nenhuma quest ativa
              </Text>
            </View>
          )}
        </View>

        {/* Leaderboard */}
        <View style={[styles.section, { backgroundColor: t.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: t.text }]}>Ranking</Text>
            <View style={styles.userRank}>
              <Text style={[styles.rankText, { color: t.primary }]}>
                #{userRank}
              </Text>
            </View>
          </View>
          
          {topUsers.length > 0 ? (
            <View style={styles.leaderboardList}>
              {topUsers.map((user, index) => (
                <View key={user.id} style={[styles.leaderboardItem, { backgroundColor: t.background }]}>
                  <View style={styles.rankPosition}>
                    <Text style={[styles.rankNumber, { color: t.textLight }]}>
                      #{user.rank}
                    </Text>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={[styles.userName, { color: t.text }]}>
                      {user.username}
                    </Text>
                    <Text style={[styles.userLevel, { color: t.textLight }]}>
                      Nível {user.level}
                    </Text>
                  </View>
                  <View style={styles.userScore}>
                    <Text style={[styles.userPoints, { color: t.warning }]}>
                      {user.totalPoints}
                    </Text>
                    <Text style={[styles.userPointsLabel, { color: t.textLight }]}>
                      pts
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={32} color={t.textLight} />
              <Text style={[styles.emptyStateText, { color: t.textLight }]}>
                Ranking não disponível
              </Text>
            </View>
          )}
        </View>

        {/* Ações Rápidas */}
        <View style={[styles.section, { backgroundColor: t.card }]}>
          <Text style={[styles.sectionTitle, { color: t.text }]}>Ações Rápidas</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: t.primary + '20' }]}
              onPress={() => setShowAchievements(true)}
            >
              <Ionicons name="trophy" size={24} color={t.primary} />
              <Text style={[styles.quickActionText, { color: t.primary }]}>
                Conquistas
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: t.success + '20' }]}
              onPress={() => setShowQuests(true)}
            >
              <Ionicons name="star" size={24} color={t.success} />
              <Text style={[styles.quickActionText, { color: t.success }]}>
                Quests
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: t.warning + '20' }]}
              onPress={() => Alert.alert('Medalhas', 'Visualizar todas as medalhas')}
            >
              <Ionicons name="medal" size={24} color={t.warning} />
              <Text style={[styles.quickActionText, { color: t.warning }]}>
                Medalhas
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: t.error + '20' }]}
              onPress={() => Alert.alert('Ranking', 'Visualizar ranking completo')}
            >
              <Ionicons name="trending-up" size={24} color={t.error} />
              <Text style={[styles.quickActionText, { color: t.error }]}>
                Ranking
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modais */}
      <AchievementsModal
        visible={showAchievements}
        onClose={() => setShowAchievements(false)}
      />

      <QuestsModal
        visible={showQuests}
        onClose={() => setShowQuests(false)}
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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  levelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  profileCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileInfo: {
    flex: 1,
  },
  username: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  joinDate: {
    fontSize: 12,
  },
  profileStats: {
    flexDirection: 'row',
    gap: 16,
  },
  profileStat: {
    alignItems: 'center',
  },
  profileStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileStatLabel: {
    fontSize: 12,
  },
  levelProgress: {
    gap: 8,
  },
  levelProgressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  levelProgressText: {
    fontSize: 12,
  },
  levelProgressPercentage: {
    fontSize: 12,
    fontWeight: '600',
  },
  levelProgressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  levelProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  statsSection: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  medalCard: {
    width: 200,
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
  },
  medalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  medalIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  medalInfo: {
    flex: 1,
  },
  medalName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  medalDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  medalRarity: {
    alignItems: 'center',
  },
  rarityText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  medalProgress: {
    marginBottom: 8,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressText: {
    fontSize: 10,
  },
  progressPercentage: {
    fontSize: 10,
    fontWeight: '600',
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  unlockedDate: {
    fontSize: 10,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyStateText: {
    fontSize: 14,
    marginTop: 8,
  },
  streaksGrid: {
    gap: 12,
  },
  streakCard: {
    borderRadius: 12,
    padding: 12,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  streakIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  streakInfo: {
    flex: 1,
  },
  streakType: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  streakCurrent: {
    fontSize: 12,
    fontWeight: '600',
  },
  streakStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  streakStat: {
    alignItems: 'center',
  },
  streakStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  streakStatLabel: {
    fontSize: 12,
  },
  questsList: {
    gap: 8,
  },
  questItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 8,
    padding: 12,
  },
  questInfo: {
    flex: 1,
  },
  questTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  questProgress: {
    fontSize: 12,
  },
  questReward: {
    alignItems: 'center',
  },
  questPoints: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  questPointsLabel: {
    fontSize: 10,
  },
  userRank: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  rankText: {
    fontSize: 12,
    fontWeight: '600',
  },
  leaderboardList: {
    gap: 8,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    padding: 12,
  },
  rankPosition: {
    width: 40,
    alignItems: 'center',
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  userLevel: {
    fontSize: 12,
  },
  userScore: {
    alignItems: 'center',
  },
  userPoints: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userPointsLabel: {
    fontSize: 10,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickAction: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    minWidth: 80,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});