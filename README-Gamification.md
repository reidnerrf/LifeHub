# Gamificação - LifeHub

## 🎮 Funcionalidades Implementadas

### 🏆 Pontos por Consistência
- **Sistema de pontos** baseado em atividades completadas
- **Experiência (XP)** para progressão de níveis
- **Sequências (streaks)** para manter consistência
- **Recompensas** por conquistas e objetivos atingidos
- **Progressão de níveis** com benefícios desbloqueáveis

### 🏅 Medalhas
- **Medalhas de Consistência**: 7, 15, 30 dias consecutivos
- **Medalhas de Produtividade**: Bronze (25 tarefas), Prata (100 tarefas)
- **Medalhas de Saúde**: Bronze (3 hábitos diferentes)
- **Medalhas de Foco**: Bronze (5 sessões de foco)
- **Sistema de raridade**: Comum, Raro, Épico, Lendário
- **Progresso visual** para cada medalha

### ⭐ Quests Semanais Sugeridas pela IA
- **Geração automática** de quests personalizadas
- **Diferentes dificuldades**: Fácil, Médio, Difícil, Épico
- **Recompensas variadas**: Pontos, Experiência, Itens especiais
- **Objetivos específicos**: Tarefas, hábitos, foco, eventos
- **Sistema de expiração** com tempo limitado
- **Sugestões inteligentes** baseadas no comportamento do usuário

## 🏗️ Arquitetura Técnica

### Zustand Store (`src/store/gamification.ts`)
```typescript
interface GamificationStore {
  // Dados
  userProfile: UserProfile;
  achievements: Achievement[];
  medals: Medal[];
  quests: Quest[];
  streaks: Streak[];
  leaderboard: LeaderboardEntry[];
  
  // Estado atual
  isLoading: boolean;
  showAchievementModal: boolean;
  showQuestModal: boolean;
  showLeaderboardModal: boolean;
  selectedAchievement: Achievement | null;
  selectedQuest: Quest | null;
  
  // Ações para Perfil do Usuário
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  addExperience: (amount: number) => void;
  addPoints: (amount: number) => void;
  updateStreak: (type: Streak['type'], increment: boolean) => void;
  getGamificationStats: () => GamificationStats;
  
  // Ações para Conquistas
  unlockAchievement: (achievementId: string) => void;
  updateAchievementProgress: (achievementId: string, progress: number) => void;
  getUnlockedAchievements: () => Achievement[];
  getLockedAchievements: () => Achievement[];
  getAchievementsByCategory: (category: Achievement['category']) => Achievement[];
  
  // Ações para Medalhas
  unlockMedal: (medalId: string) => void;
  updateMedalProgress: (medalId: string, progress: number) => void;
  getUnlockedMedals: () => Medal[];
  getLockedMedals: () => Medal[];
  getMedalsByRarity: (rarity: Medal['rarity']) => Medal[];
  
  // Ações para Quests
  addQuest: (quest: Omit<Quest, 'id' | 'createdAt'>) => void;
  updateQuest: (questId: string, updates: Partial<Quest>) => void;
  completeQuest: (questId: string) => void;
  generateAIQuests: () => Promise<Quest[]>;
  getActiveQuests: () => Quest[];
  getCompletedQuests: () => Quest[];
  getQuestsByCategory: (category: Quest['category']) => Quest[];
  
  // Ações para Streaks
  updateStreak: (type: Streak['type'], increment: boolean) => void;
  getStreakByType: (type: Streak['type']) => Streak | null;
  getAllStreaks: () => Streak[];
  
  // Ações para Leaderboard
  updateLeaderboard: () => void;
  getUserRank: () => number;
  getTopUsers: (limit: number) => LeaderboardEntry[];
  
  // Configurações
  setShowAchievementModal: (show: boolean) => void;
  setShowQuestModal: (show: boolean) => void;
  setShowLeaderboardModal: (show: boolean) => void;
  setSelectedAchievement: (achievement: Achievement | null) => void;
  setSelectedQuest: (quest: Quest | null) => void;
  setIsLoading: (loading: boolean) => void;
}
```

### Componentes Principais

#### 1. **Gamification.tsx** - Tela Principal
- **Dashboard gamificado** com perfil do usuário
- **Barra de progresso** de nível com XP
- **Estatísticas gerais** de conquistas, medalhas e quests
- **Medalhas recentes** com progresso visual
- **Sequências ativas** por tipo de atividade
- **Quests ativas** com recompensas
- **Leaderboard** com ranking dos usuários
- **Ações rápidas** para acessar funcionalidades

#### 2. **AchievementsModal.tsx** - Modal de Conquistas
- **Lista de conquistas** com filtros por categoria
- **Progresso visual** para cada conquista
- **Detalhes completos** com pontos e status
- **Estatísticas** de conquistas desbloqueadas
- **Categorias**: Consistência, Produtividade, Saúde, Aprendizado, Social, Especiais

#### 3. **QuestsModal.tsx** - Modal de Quests
- **Lista de quests** com filtros por categoria
- **Geração de quests IA** com botão dedicado
- **Progresso de objetivos** com barras visuais
- **Sistema de dificuldade** com cores diferenciadas
- **Recompensas detalhadas** (pontos, XP, itens)
- **Tempo restante** para cada quest

### Modelos de Dados

#### UserProfile
```typescript
interface UserProfile {
  id: string;
  username: string;
  level: number;
  experience: number;
  totalPoints: number;
  streakDays: number;
  longestStreak: number;
  currentStreak: number;
  joinDate: Date;
  lastActive: Date;
}
```

#### Achievement
```typescript
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'consistency' | 'productivity' | 'health' | 'learning' | 'social' | 'special';
  type: 'daily' | 'weekly' | 'monthly' | 'milestone' | 'special';
  requirement: {
    type: 'streak' | 'tasks' | 'habits' | 'focus' | 'events' | 'custom';
    value: number;
    period?: 'days' | 'weeks' | 'months';
  };
  points: number;
  isUnlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
}
```

#### Medal
```typescript
interface Medal {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: 'consistency' | 'productivity' | 'health' | 'learning' | 'social';
  requirement: {
    type: 'streak' | 'tasks' | 'habits' | 'focus' | 'events';
    value: number;
    period: 'days' | 'weeks' | 'months';
  };
  isUnlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}
```

#### Quest
```typescript
interface Quest {
  id: string;
  title: string;
  description: string;
  category: 'daily' | 'weekly' | 'monthly' | 'special';
  type: 'tasks' | 'habits' | 'focus' | 'events' | 'consistency' | 'productivity';
  objective: {
    action: string;
    target: number;
    current: number;
    unit: string;
  };
  rewards: {
    points: number;
    experience: number;
    items?: string[];
  };
  difficulty: 'easy' | 'medium' | 'hard' | 'epic';
  isCompleted: boolean;
  isActive: boolean;
  expiresAt: Date;
  createdAt: Date;
  completedAt?: Date;
  suggestedBy: 'ai' | 'system' | 'user';
}
```

#### Streak
```typescript
interface Streak {
  id: string;
  type: 'tasks' | 'habits' | 'focus' | 'consistency';
  currentStreak: number;
  longestStreak: number;
  lastActivity: Date;
  startDate: Date;
}
```

#### GamificationStats
```typescript
interface GamificationStats {
  totalPoints: number;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  achievementsUnlocked: number;
  totalAchievements: number;
  medalsUnlocked: number;
  totalMedals: number;
  currentStreak: number;
  longestStreak: number;
  questsCompleted: number;
  totalQuests: number;
}
```

## 📱 Como Usar

### 1. **Visualização do Perfil**
- Acesse a tela de Gamificação
- Visualize seu nível atual e progresso
- Acompanhe pontos totais e sequência atual
- Veja estatísticas de conquistas e medalhas

### 2. **Sistema de Conquistas**
- Toque em "Conquistas" nas ações rápidas
- Visualize todas as conquistas disponíveis
- Filtre por categoria (Consistência, Produtividade, etc.)
- Acompanhe o progresso de cada conquista
- Veja detalhes ao tocar em uma conquista

### 3. **Medalhas**
- Visualize medalhas desbloqueadas na tela principal
- Acompanhe progresso para medalhas bloqueadas
- Veja raridade e requisitos de cada medalha
- Toque em "Medalhas" para ver todas

### 4. **Quests**
- Toque em "Quests" nas ações rápidas
- Visualize quests ativas e completadas
- Use "Gerar Quests IA" para criar novas missões
- Complete objetivos para ganhar recompensas
- Filtre por categoria (Diárias, Semanais, etc.)

### 5. **Sequências (Streaks)**
- Visualize sequências ativas na tela principal
- Acompanhe sequência atual vs. recorde
- Mantenha consistência para aumentar sequências
- Veja diferentes tipos: Consistência, Tarefas, Hábitos, Foco

### 6. **Leaderboard**
- Visualize ranking dos usuários
- Veja sua posição atual no ranking
- Compare pontos e níveis com outros usuários
- Acompanhe progresso para subir no ranking

## 🧮 Algoritmos Implementados

### 1. **Sistema de Níveis**
```typescript
const addExperience = (amount) => {
  const newExperience = userProfile.experience + amount;
  const experienceToNextLevel = userProfile.level * 100;
  
  if (newExperience >= experienceToNextLevel) {
    return {
      userProfile: {
        ...userProfile,
        level: userProfile.level + 1,
        experience: newExperience - experienceToNextLevel,
        lastActive: new Date(),
      },
    };
  }
  
  return {
    userProfile: {
      ...userProfile,
      experience: newExperience,
      lastActive: new Date(),
    },
  };
}
```

### 2. **Sistema de Streaks**
```typescript
const updateStreak = (type, increment) => {
  const streak = streaks.find(s => s.type === type);
  if (!streak) return state;

  const newStreak = increment ? streak.currentStreak + 1 : 0;
  const newLongestStreak = Math.max(streak.longestStreak, newStreak);

  return {
    streaks: streaks.map(s =>
      s.type === type
        ? {
            ...s,
            currentStreak: newStreak,
            longestStreak: newLongestStreak,
            lastActivity: new Date(),
          }
        : s
    ),
    userProfile: {
      ...userProfile,
      currentStreak: newStreak,
      longestStreak: Math.max(userProfile.longestStreak, newStreak),
      lastActive: new Date(),
    },
  };
}
```

### 3. **Geração de Quests IA**
```typescript
const generateAIQuests = async () => {
  // Simular geração de quests pela IA
  const aiQuests: Omit<Quest, 'id' | 'createdAt'>[] = [
    {
      title: 'Desafio da Produtividade',
      description: 'Complete 20 tarefas em 7 dias',
      category: 'weekly',
      type: 'tasks',
      objective: {
        action: 'Complete tarefas',
        target: 20,
        current: 0,
        unit: 'tarefas',
      },
      rewards: {
        points: 150,
        experience: 75,
      },
      difficulty: 'hard',
      isCompleted: false,
      isActive: true,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      suggestedBy: 'ai',
    },
    {
      title: 'Mestre do Foco',
      description: 'Complete 5 sessões de foco de 30 minutos',
      category: 'weekly',
      type: 'focus',
      objective: {
        action: 'Sessões completadas',
        target: 5,
        current: 0,
        unit: 'sessões',
      },
      rewards: {
        points: 200,
        experience: 100,
      },
      difficulty: 'epic',
      isCompleted: false,
      isActive: true,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      suggestedBy: 'ai',
    },
  ];

  return aiQuests;
}
```

### 4. **Cálculo de Estatísticas**
```typescript
const getGamificationStats = () => {
  const unlockedAchievements = achievements.filter(a => a.isUnlocked);
  const unlockedMedals = medals.filter(m => m.isUnlocked);
  const completedQuests = quests.filter(q => q.isCompleted);
  const experienceToNextLevel = userProfile.level * 100;

  return {
    totalPoints: userProfile.totalPoints,
    level: userProfile.level,
    experience: userProfile.experience,
    experienceToNextLevel,
    achievementsUnlocked: unlockedAchievements.length,
    totalAchievements: achievements.length,
    medalsUnlocked: unlockedMedals.length,
    totalMedals: medals.length,
    currentStreak: userProfile.currentStreak,
    longestStreak: userProfile.longestStreak,
    questsCompleted: completedQuests.length,
    totalQuests: quests.length,
  };
}
```

## 📊 Exemplos de Uso

### Exemplo 1: Sistema de Pontos
```
1. Usuário completa uma tarefa
2. Sistema adiciona 10 pontos ao total
3. Sistema adiciona 5 XP à experiência
4. Se XP suficiente, usuário sobe de nível
5. Sistema atualiza sequência de tarefas
6. Verifica se conquistas/medalhas foram desbloqueadas
```

### Exemplo 2: Desbloqueio de Medalha
```
1. Usuário mantém sequência de 7 dias
2. Sistema verifica requisitos da medalha "Consistência Bronze"
3. Atualiza progresso: 7/7 dias
4. Desbloqueia medalha automaticamente
5. Adiciona pontos de recompensa
6. Exibe notificação de conquista
```

### Exemplo 3: Geração de Quest IA
```
1. Usuário toca "Gerar Quests IA"
2. Sistema analisa padrões de comportamento
3. Gera quests personalizadas:
   - "Complete 20 tarefas em 7 dias" (baseado em histórico)
   - "Mantenha 3 hábitos por 5 dias" (baseado em hábitos ativos)
4. Define recompensas apropriadas
5. Define dificuldade baseada no nível do usuário
6. Adiciona quests à lista ativa
```

### Exemplo 4: Progressão de Nível
```
1. Usuário tem nível 5 com 1250 XP
2. XP necessário para próximo nível: 5 * 100 = 500
3. Usuário completa quest que dá 100 XP
4. Novo XP: 1250 + 100 = 1350
5. Como 1350 > 500, usuário sobe para nível 6
6. XP restante: 1350 - 500 = 850
7. Sistema atualiza interface e notifica usuário
```

## 🎨 Interface Responsiva

### Design System
- **Cards organizados** com bordas arredondadas
- **Cores temáticas** para diferentes tipos de funcionalidades
- **Ícones intuitivos** para ações rápidas
- **Modais especializados** para funcionalidades avançadas
- **Indicadores visuais** de status e progresso

### Estados Visuais
- **Primário**: Azul para ações principais e nível
- **Sucesso**: Verde para conquistas desbloqueadas e sequências
- **Atenção**: Amarelo para recompensas e pontos
- **Erro**: Vermelho para quests expiradas
- **Especiais**: Roxo para quests épicas

### Interações
- **Tap simples** para acessar funcionalidades
- **Modais** para conquistas e quests
- **Indicadores de loading** durante processamento
- **Confirmações** para ações importantes
- **Feedback visual** para todas as ações

## 🚀 Próximos Passos Sugeridos

### Funcionalidades Avançadas
1. **Sistema de badges** personalizados
2. **Conquistas em tempo real** com notificações push
3. **Quests colaborativas** entre usuários
4. **Sistema de clãs** para competição em grupo
5. **Eventos sazonais** com quests especiais
6. **Sistema de moeda virtual** para compras

### Melhorias de UX
1. **Animações** para desbloqueios de conquistas
2. **Sons e efeitos** para feedback gamificado
3. **Temas personalizáveis** para o perfil
4. **Compartilhamento** de conquistas em redes sociais
5. **Histórico detalhado** de atividades
6. **Metas personalizadas** definidas pelo usuário

### Integrações
1. **APIs de jogos** para sincronização de dados
2. **Sistemas de recompensas** externos
3. **Plataformas de gamificação** (Badgr, Credly)
4. **APIs de IA** para quests mais inteligentes
5. **Sistemas de ranking** globais
6. **APIs de notificações** para lembretes

### Análises Avançadas
1. **Predição de comportamento** para quests personalizadas
2. **Análise de engajamento** por funcionalidade
3. **Sistema de recomendação** de atividades
4. **Relatórios de progresso** detalhados
5. **Insights de gamificação** para melhorias
6. **A/B testing** para otimização

## 📝 Notas Técnicas

### Performance
- **Lazy loading** de conquistas e medalhas
- **Cache inteligente** para dados de usuário
- **Processamento em background** para cálculos
- **Debounce** em ações de atualização

### Segurança
- **Validação** de conquistas e medalhas
- **Proteção contra** manipulação de dados
- **Auditoria** de ações do usuário
- **Backup** de progresso gamificado

### Acessibilidade
- **Screen readers** para todas as funcionalidades
- **Navegação por teclado** completa
- **Contraste adequado** de cores
- **Tamanhos de fonte** ajustáveis

---

**Versão**: 1.0.0  
**Última atualização**: Dezembro 2024  
**Compatibilidade**: React Native 0.72+, Expo SDK 49+