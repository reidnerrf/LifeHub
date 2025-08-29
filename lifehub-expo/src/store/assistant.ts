import { create } from 'zustand';

export interface WeeklyPlan {
  id: string;
  weekStart: Date;
  weekEnd: Date;
  tasks: PlannedTask[];
  events: PlannedEvent[];
  habits: PlannedHabit[];
  focusSessions: PlannedFocusSession[];
  score: number;
  insights: string[];
  isOptimized: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlannedTask {
  id: string;
  title: string;
  description?: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  estimatedDuration: number; // em minutos
  dueDate: Date;
  suggestedTime: Date;
  category: string;
  tags: string[];
  isFlexible: boolean;
  dependencies: string[]; // IDs de outras tarefas
}

export interface PlannedEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  type: 'work' | 'personal' | 'health' | 'social' | 'learning';
  priority: 'high' | 'medium' | 'low';
  isRecurring: boolean;
  recurrence?: {
    type: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: Date;
  };
}

export interface PlannedHabit {
  id: string;
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  targetCount: number;
  suggestedTime: Date;
  category: string;
  isFlexible: boolean;
}

export interface PlannedFocusSession {
  id: string;
  title: string;
  type: 'pomodoro' | 'flowtime' | 'deep-work';
  duration: number; // em minutos
  suggestedTime: Date;
  priority: 'high' | 'medium' | 'low';
  isFlexible: boolean;
}

export interface Routine {
  id: string;
  name: string;
  description: string;
  type: 'morning' | 'evening' | 'deep-work' | 'study' | 'custom';
  icon: string;
  color: string;
  duration: number; // em minutos
  activities: RoutineActivity[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoutineActivity {
  id: string;
  title: string;
  description?: string;
  duration: number; // em minutos
  type: 'task' | 'habit' | 'focus' | 'break' | 'custom';
  order: number;
  isOptional: boolean;
  icon: string;
}

export interface AIInsight {
  id: string;
  type: 'optimization' | 'suggestion' | 'warning' | 'achievement';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: 'productivity' | 'health' | 'learning' | 'social' | 'general';
  actionable: boolean;
  action?: {
    type: 'reschedule' | 'optimize' | 'add' | 'remove' | 'modify';
    targetId?: string;
    suggestion: string;
  };
  createdAt: Date;
  isRead: boolean;
}

export interface OptimizationResult {
  originalPlan: WeeklyPlan;
  optimizedPlan: WeeklyPlan;
  changes: {
    type: 'reschedule' | 'add' | 'remove' | 'modify';
    itemId: string;
    description: string;
    impact: 'positive' | 'negative' | 'neutral';
  }[];
  scoreImprovement: number;
  insights: string[];
}

interface AssistantStore {
  // Dados
  weeklyPlans: WeeklyPlan[];
  routines: Routine[];
  insights: AIInsight[];
  currentWeekPlan: WeeklyPlan | null;
  
  // Estado atual
  isLoading: boolean;
  isOptimizing: boolean;
  selectedRoutine: Routine | null;
  showOptimizationModal: boolean;
  showRoutinesModal: boolean;
  
  // Ações para Planejamento Semanal
  generateWeeklyPlan: (weekStart: Date) => Promise<WeeklyPlan>;
  optimizeWeeklyPlan: (planId: string) => Promise<OptimizationResult>;
  updateWeeklyPlan: (planId: string, updates: Partial<WeeklyPlan>) => void;
  deleteWeeklyPlan: (planId: string) => void;
  getCurrentWeekPlan: () => WeeklyPlan | null;
  getWeekPlanByDate: (date: Date) => WeeklyPlan | null;
  
  // Ações para Rotinas
  addRoutine: (routine: Omit<Routine, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRoutine: (id: string, updates: Partial<Routine>) => void;
  deleteRoutine: (id: string) => void;
  activateRoutine: (id: string) => void;
  deactivateRoutine: (id: string) => void;
  executeRoutine: (routineId: string, date: Date) => Promise<void>;
  getRoutinesByType: (type: Routine['type']) => Routine[];
  getActiveRoutines: () => Routine[];
  
  // Ações para Insights IA
  addInsight: (insight: Omit<AIInsight, 'id' | 'createdAt'>) => void;
  updateInsight: (id: string, updates: Partial<AIInsight>) => void;
  deleteInsight: (id: string) => void;
  markInsightAsRead: (id: string) => void;
  getUnreadInsights: () => AIInsight[];
  getInsightsByCategory: (category: AIInsight['category']) => AIInsight[];
  
  // Análises e Otimizações
  analyzeProductivity: (days: number) => {
    score: number;
    trends: {
      tasks: number[];
      focus: number[];
      habits: number[];
      productivity: number[];
    };
    insights: string[];
  };
  suggestOptimizations: (planId: string) => AIInsight[];
  calculateOptimalSchedule: (tasks: PlannedTask[], events: PlannedEvent[]) => {
    schedule: { taskId: string; suggestedTime: Date }[];
    conflicts: string[];
    efficiency: number;
  };
  
  // Configurações
  setSelectedRoutine: (routine: Routine | null) => void;
  setShowOptimizationModal: (show: boolean) => void;
  setShowRoutinesModal: (show: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setIsOptimizing: (optimizing: boolean) => void;
}

export const useAssistant = create<AssistantStore>((set, get) => ({
  // Estado inicial
  weeklyPlans: [],
  routines: [
    {
      id: 'morning-routine',
      name: 'Rotina da Manhã',
      description: 'Rotina matinal para começar o dia com energia e foco',
      type: 'morning',
      icon: 'sunny',
      color: '#FF9500',
      duration: 60,
      isActive: true,
      activities: [
        {
          id: 'wake-up',
          title: 'Acordar',
          description: 'Levantar da cama e alongar',
          duration: 5,
          type: 'custom',
          order: 1,
          isOptional: false,
          icon: 'bed',
        },
        {
          id: 'hydration',
          title: 'Hidratação',
          description: 'Beber água e preparar café/chá',
          duration: 10,
          type: 'custom',
          order: 2,
          isOptional: false,
          icon: 'water',
        },
        {
          id: 'meditation',
          title: 'Meditação',
          description: '5 minutos de meditação ou respiração',
          duration: 5,
          type: 'focus',
          order: 3,
          isOptional: true,
          icon: 'leaf',
        },
        {
          id: 'planning',
          title: 'Planejamento',
          description: 'Revisar agenda e prioridades do dia',
          duration: 10,
          type: 'task',
          order: 4,
          isOptional: false,
          icon: 'calendar',
        },
        {
          id: 'exercise',
          title: 'Exercício',
          description: 'Atividade física leve (yoga, caminhada)',
          duration: 20,
          type: 'custom',
          order: 5,
          isOptional: true,
          icon: 'fitness',
        },
        {
          id: 'breakfast',
          title: 'Café da Manhã',
          description: 'Refeição nutritiva e equilibrada',
          duration: 10,
          type: 'custom',
          order: 6,
          isOptional: false,
          icon: 'restaurant',
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'evening-routine',
      name: 'Rotina da Noite',
      description: 'Rotina noturna para relaxar e preparar para o sono',
      type: 'evening',
      icon: 'moon',
      color: '#5856D6',
      duration: 45,
      isActive: true,
      activities: [
        {
          id: 'dinner',
          title: 'Jantar',
          description: 'Refeição leve e nutritiva',
          duration: 20,
          type: 'custom',
          order: 1,
          isOptional: false,
          icon: 'restaurant',
        },
        {
          id: 'review',
          title: 'Revisão do Dia',
          description: 'Refletir sobre conquistas e aprendizados',
          duration: 10,
          type: 'task',
          order: 2,
          isOptional: true,
          icon: 'checkmark-circle',
        },
        {
          id: 'planning-tomorrow',
          title: 'Planejamento do Amanhã',
          description: 'Preparar agenda e prioridades',
          duration: 5,
          type: 'task',
          order: 3,
          isOptional: false,
          icon: 'calendar',
        },
        {
          id: 'relaxation',
          title: 'Relaxamento',
          description: 'Atividade relaxante (leitura, música)',
          duration: 10,
          type: 'custom',
          order: 4,
          isOptional: true,
          icon: 'book',
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'deep-work-routine',
      name: 'Rotina Deep Work',
      description: 'Sessão focada para trabalho profundo e produtivo',
      type: 'deep-work',
      icon: 'bulb',
      color: '#34C759',
      duration: 120,
      isActive: true,
      activities: [
        {
          id: 'preparation',
          title: 'Preparação',
          description: 'Organizar ambiente e definir objetivo',
          duration: 5,
          type: 'custom',
          order: 1,
          isOptional: false,
          icon: 'settings',
        },
        {
          id: 'deep-work-session',
          title: 'Sessão Deep Work',
          description: 'Trabalho focado sem interrupções',
          duration: 90,
          type: 'focus',
          order: 2,
          isOptional: false,
          icon: 'timer',
        },
        {
          id: 'break',
          title: 'Pausa',
          description: 'Descanso e hidratação',
          duration: 15,
          type: 'break',
          order: 3,
          isOptional: false,
          icon: 'cafe',
        },
        {
          id: 'review',
          title: 'Revisão',
          description: 'Avaliar progresso e ajustar se necessário',
          duration: 10,
          type: 'task',
          order: 4,
          isOptional: true,
          icon: 'checkmark-circle',
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'study-routine',
      name: 'Rotina de Estudos',
      description: 'Sessão estruturada para aprendizado eficiente',
      type: 'study',
      icon: 'school',
      color: '#007AFF',
      duration: 90,
      isActive: true,
      activities: [
        {
          id: 'goal-setting',
          title: 'Definir Objetivo',
          description: 'Estabelecer o que será estudado',
          duration: 5,
          type: 'task',
          order: 1,
          isOptional: false,
          icon: 'target',
        },
        {
          id: 'study-session',
          title: 'Sessão de Estudo',
          description: 'Estudo focado com técnica Pomodoro',
          duration: 60,
          type: 'focus',
          order: 2,
          isOptional: false,
          icon: 'book',
        },
        {
          id: 'break-study',
          title: 'Pausa',
          description: 'Descanso para assimilação',
          duration: 10,
          type: 'break',
          order: 3,
          isOptional: false,
          icon: 'cafe',
        },
        {
          id: 'review-study',
          title: 'Revisão',
          description: 'Revisar pontos principais aprendidos',
          duration: 15,
          type: 'task',
          order: 4,
          isOptional: true,
          icon: 'refresh',
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  insights: [],
  currentWeekPlan: null,
  isLoading: false,
  isOptimizing: false,
  selectedRoutine: null,
  showOptimizationModal: false,
  showRoutinesModal: false,

  // Implementações das ações
  generateWeeklyPlan: async (weekStart: Date) => {
    set({ isLoading: true });
    
    try {
      // Simular geração de plano semanal
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      const plan: WeeklyPlan = {
        id: `plan-${weekStart.getTime()}`,
        weekStart,
        weekEnd,
        tasks: [],
        events: [],
        habits: [],
        focusSessions: [],
        score: 75,
        insights: [
          'Plano equilibrado entre trabalho e descanso',
          'Horários otimizados para produtividade',
          'Inclui tempo para hábitos importantes',
        ],
        isOptimized: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      set(state => ({
        weeklyPlans: [...state.weeklyPlans, plan],
        currentWeekPlan: plan,
        isLoading: false,
      }));
      
      return plan;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  optimizeWeeklyPlan: async (planId: string) => {
    set({ isOptimizing: true });
    
    try {
      const state = get();
      const originalPlan = state.weeklyPlans.find(p => p.id === planId);
      
      if (!originalPlan) {
        throw new Error('Plano não encontrado');
      }
      
      // Simular otimização
      const optimizedPlan: WeeklyPlan = {
        ...originalPlan,
        score: Math.min(100, originalPlan.score + 15),
        insights: [
          ...originalPlan.insights,
          'Horários reorganizados para melhor fluxo',
          'Conflitos de agenda resolvidos',
          'Tempo de foco otimizado',
        ],
        isOptimized: true,
        updatedAt: new Date(),
      };
      
      const changes = [
        {
          type: 'reschedule' as const,
          itemId: 'task-1',
          description: 'Tarefa importante movida para horário de maior produtividade',
          impact: 'positive' as const,
        },
        {
          type: 'add' as const,
          itemId: 'break-1',
          description: 'Pausa adicionada para evitar burnout',
          impact: 'positive' as const,
        },
      ];
      
      const result: OptimizationResult = {
        originalPlan,
        optimizedPlan,
        changes,
        scoreImprovement: 15,
        insights: [
          'Produtividade aumentará em 15%',
          'Melhor distribuição de energia ao longo do dia',
          'Menos conflitos de agenda',
        ],
      };
      
      // Atualizar o plano otimizado
      set(state => ({
        weeklyPlans: state.weeklyPlans.map(p => 
          p.id === planId ? optimizedPlan : p
        ),
        currentWeekPlan: state.currentWeekPlan?.id === planId ? optimizedPlan : state.currentWeekPlan,
        isOptimizing: false,
      }));
      
      return result;
    } catch (error) {
      set({ isOptimizing: false });
      throw error;
    }
  },

  updateWeeklyPlan: (planId: string, updates: Partial<WeeklyPlan>) => {
    set(state => ({
      weeklyPlans: state.weeklyPlans.map(p => 
        p.id === planId ? { ...p, ...updates, updatedAt: new Date() } : p
      ),
      currentWeekPlan: state.currentWeekPlan?.id === planId 
        ? { ...state.currentWeekPlan, ...updates, updatedAt: new Date() }
        : state.currentWeekPlan,
    }));
  },

  deleteWeeklyPlan: (planId: string) => {
    set(state => ({
      weeklyPlans: state.weeklyPlans.filter(p => p.id !== planId),
      currentWeekPlan: state.currentWeekPlan?.id === planId ? null : state.currentWeekPlan,
    }));
  },

  getCurrentWeekPlan: () => {
    const state = get();
    if (state.currentWeekPlan) return state.currentWeekPlan;
    
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    return state.weeklyPlans.find(p => 
      p.weekStart.getTime() === weekStart.getTime()
    ) || null;
  },

  getWeekPlanByDate: (date: Date) => {
    const state = get();
    const weekStart = new Date(date);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    return state.weeklyPlans.find(p => 
      p.weekStart.getTime() === weekStart.getTime()
    ) || null;
  },

  addRoutine: (routine) => {
    const newRoutine: Routine = {
      ...routine,
      id: `routine-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    set(state => ({
      routines: [...state.routines, newRoutine],
    }));
  },

  updateRoutine: (id: string, updates: Partial<Routine>) => {
    set(state => ({
      routines: state.routines.map(r => 
        r.id === id ? { ...r, ...updates, updatedAt: new Date() } : r
      ),
    }));
  },

  deleteRoutine: (id: string) => {
    set(state => ({
      routines: state.routines.filter(r => r.id !== id),
    }));
  },

  activateRoutine: (id: string) => {
    set(state => ({
      routines: state.routines.map(r => 
        r.id === id ? { ...r, isActive: true, updatedAt: new Date() } : r
      ),
    }));
  },

  deactivateRoutine: (id: string) => {
    set(state => ({
      routines: state.routines.map(r => 
        r.id === id ? { ...r, isActive: false, updatedAt: new Date() } : r
      ),
    }));
  },

  executeRoutine: async (routineId: string, date: Date) => {
    const state = get();
    const routine = state.routines.find(r => r.id === routineId);
    
    if (!routine) {
      throw new Error('Rotina não encontrada');
    }
    
    // Simular execução da rotina
    console.log(`Executando rotina: ${routine.name} em ${date.toLocaleDateString()}`);
    
    // Aqui você pode integrar com outros stores para criar tarefas/hábitos
    // baseado nas atividades da rotina
  },

  getRoutinesByType: (type: Routine['type']) => {
    const state = get();
    return state.routines.filter(r => r.type === type);
  },

  getActiveRoutines: () => {
    const state = get();
    return state.routines.filter(r => r.isActive);
  },

  addInsight: (insight) => {
    const newInsight: AIInsight = {
      ...insight,
      id: `insight-${Date.now()}`,
      createdAt: new Date(),
    };
    
    set(state => ({
      insights: [newInsight, ...state.insights],
    }));
  },

  updateInsight: (id: string, updates: Partial<AIInsight>) => {
    set(state => ({
      insights: state.insights.map(i => 
        i.id === id ? { ...i, ...updates } : i
      ),
    }));
  },

  deleteInsight: (id: string) => {
    set(state => ({
      insights: state.insights.filter(i => i.id !== id),
    }));
  },

  markInsightAsRead: (id: string) => {
    set(state => ({
      insights: state.insights.map(i => 
        i.id === id ? { ...i, isRead: true } : i
      ),
    }));
  },

  getUnreadInsights: () => {
    const state = get();
    return state.insights.filter(i => !i.isRead);
  },

  getInsightsByCategory: (category: AIInsight['category']) => {
    const state = get();
    return state.insights.filter(i => i.category === category);
  },

  analyzeProductivity: (days: number) => {
    // Simular análise de produtividade
    const score = Math.floor(Math.random() * 40) + 60; // 60-100
    
    const trends = {
      tasks: Array.from({ length: days }, () => Math.floor(Math.random() * 10) + 5),
      focus: Array.from({ length: days }, () => Math.floor(Math.random() * 120) + 60),
      habits: Array.from({ length: days }, () => Math.floor(Math.random() * 5) + 3),
      productivity: Array.from({ length: days }, () => Math.floor(Math.random() * 40) + 60),
    };
    
    const insights = [
      'Produtividade melhorou 15% esta semana',
      'Horário de maior foco: 9h-11h',
      'Hábitos matinais estão consistentes',
    ];
    
    return { score, trends, insights };
  },

  suggestOptimizations: (planId: string) => {
    const state = get();
    const plan = state.weeklyPlans.find(p => p.id === planId);
    
    if (!plan) return [];
    
    const suggestions: AIInsight[] = [
      {
        id: `suggestion-${Date.now()}-1`,
        type: 'optimization',
        title: 'Otimizar Horários',
        description: 'Reorganizar tarefas para horários de maior produtividade',
        priority: 'high',
        category: 'productivity',
        actionable: true,
        action: {
          type: 'optimize',
          suggestion: 'Mover tarefas importantes para 9h-11h',
        },
        createdAt: new Date(),
        isRead: false,
      },
      {
        id: `suggestion-${Date.now()}-2`,
        type: 'suggestion',
        title: 'Adicionar Pausas',
        description: 'Incluir pausas regulares para manter energia',
        priority: 'medium',
        category: 'health',
        actionable: true,
        action: {
          type: 'add',
          suggestion: 'Adicionar pausa de 15min a cada 2h de trabalho',
        },
        createdAt: new Date(),
        isRead: false,
      },
    ];
    
    return suggestions;
  },

  calculateOptimalSchedule: (tasks: PlannedTask[], events: PlannedEvent[]) => {
    // Simular cálculo de agenda otimizada
    const schedule = tasks.map(task => ({
      taskId: task.id,
      suggestedTime: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000),
    }));
    
    const conflicts: string[] = [];
    const efficiency = Math.floor(Math.random() * 30) + 70; // 70-100%
    
    return { schedule, conflicts, efficiency };
  },

  setSelectedRoutine: (routine) => {
    set({ selectedRoutine: routine });
  },

  setShowOptimizationModal: (show) => {
    set({ showOptimizationModal: show });
  },

  setShowRoutinesModal: (show) => {
    set({ showRoutinesModal: show });
  },

  setIsLoading: (loading) => {
    set({ isLoading: loading });
  },

  setIsOptimizing: (optimizing) => {
    set({ isOptimizing: optimizing });
  },
}));