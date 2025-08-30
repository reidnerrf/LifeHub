import { PlannedTask, PlannedEvent, WeeklyPlan, AIInsight } from '../store/assistant';

// Mock ML API endpoints (replace with actual ML service URLs)
const ML_API_BASE = process.env.REACT_APP_ML_API_URL || 'http://localhost:5000/api';

export interface MLTask {
  id: string;
  title: string;
  description?: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  estimatedDuration: number;
  dueDate: string;
  category: string;
  tags: string[];
  isFlexible: boolean;
  dependencies: string[];
}

export interface MLEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  type: 'work' | 'personal' | 'health' | 'social' | 'learning';
  priority: 'high' | 'medium' | 'low';
  isRecurring: boolean;
}

export interface MLUserPreferences {
  preferredWorkingHours: {
    start: string; // "09:00"
    end: string;   // "17:00"
  };
  productivityPeaks: string[]; // ["09:00-11:00", "14:00-16:00"]
  breakPreferences: {
    frequency: number; // minutes between breaks
    duration: number;  // break duration in minutes
  };
  energyLevels: {
    morning: number;   // 0-100
    afternoon: number; // 0-100
    evening: number;   // 0-100
  };
}

export interface MLOptimizationRequest {
  tasks: MLTask[];
  events: MLEvent[];
  userPreferences: MLUserPreferences;
  constraints: {
    startDate: string;
    endDate: string;
    workingDays: number[]; // [1,2,3,4,5] for Mon-Fri
  };
}

export interface MLOptimizationResult {
  optimizedSchedule: {
    taskId: string;
    suggestedStartTime: string;
    suggestedEndTime: string;
    confidence: number;
  }[];
  conflicts: {
    type: 'time' | 'energy' | 'priority';
    description: string;
    severity: 'low' | 'medium' | 'high';
    suggestedResolution: string;
  }[];
  insights: {
    type: 'efficiency' | 'wellness' | 'productivity';
    message: string;
    impact: number; // 0-100
  }[];
  overallScore: number;
  improvement: number;
}

export interface MLProductivityAnalysis {
  score: number;
  trends: {
    tasksCompleted: number[];
    focusTime: number[];
    habitConsistency: number[];
    productivityScore: number[];
  };
  patterns: {
    bestWorkingHours: string[];
    mostProductiveDays: string[];
    commonDistractions: string[];
  };
  recommendations: {
    type: 'schedule' | 'habits' | 'environment';
    priority: 'high' | 'medium' | 'low';
    description: string;
    expectedImpact: number;
  }[];
}

class MLOptimizationService {
  private async makeMLRequest<T>(endpoint: string, data: any): Promise<T> {
    try {
      // In a real implementation, this would call your ML API
      // For now, we'll simulate the response with enhanced logic
      
      if (process.env.NODE_ENV === 'development' && !process.env.REACT_APP_ML_API_URL) {
        // Simulate API response with improved logic
        return this.simulateMLResponse(endpoint, data) as T;
      }

      const response = await fetch(`${ML_API_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_ML_API_KEY}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`ML API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('ML API request failed:', error);
      // Fallback to simulated response
      return this.simulateMLResponse(endpoint, data) as T;
    }
  }

  private simulateMLResponse(endpoint: string, data: any): any {
    switch (endpoint) {
      case '/optimize-schedule':
        return this.simulateOptimization(data);
      case '/analyze-productivity':
        return this.simulateProductivityAnalysis(data);
      case '/generate-insights':
        return this.simulateInsights(data);
      default:
        throw new Error(`Unknown ML endpoint: ${endpoint}`);
    }
  }

  private simulateOptimization(request: MLOptimizationRequest): MLOptimizationResult {
    const tasks = request.tasks;
    const events = request.events;
    
    // Enhanced simulation with better logic
    const optimizedSchedule = tasks.map(task => {
      const baseTime = new Date(request.constraints.startDate);
      const hours = this.getOptimalHourForTask(task, request.userPreferences);
      
      const suggestedStartTime = new Date(baseTime);
      suggestedStartTime.setHours(hours, 0, 0, 0);
      
      const suggestedEndTime = new Date(suggestedStartTime);
      suggestedEndTime.setMinutes(suggestedStartTime.getMinutes() + task.estimatedDuration);

      return {
        taskId: task.id,
        suggestedStartTime: suggestedStartTime.toISOString(),
        suggestedEndTime: suggestedEndTime.toISOString(),
        confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
      };
    });

    const conflicts = this.identifyConflicts(optimizedSchedule, events);
    const insights = this.generateOptimizationInsights(tasks, events, request.userPreferences);

    return {
      optimizedSchedule,
      conflicts,
      insights,
      overallScore: Math.floor(Math.random() * 30) + 65, // 65-95
      improvement: Math.floor(Math.random() * 20) + 10,  // 10-30% improvement
    };
  }

  private getOptimalHourForTask(task: MLTask, preferences: MLUserPreferences): number {
    // Simple priority-based scheduling
    const preferredHours = preferences.preferredWorkingHours;
    const startHour = parseInt(preferredHours.start.split(':')[0]);
    const endHour = parseInt(preferredHours.end.split(':')[0]);
    
    if (task.priority === 'urgent' || task.priority === 'high') {
      // High priority tasks during peak productivity hours
      const peakHours = preferences.productivityPeaks[0]?.split('-')[0];
      return peakHours ? parseInt(peakHours.split(':')[0]) : startHour + 2;
    }
    
    if (task.priority === 'medium') {
      return startHour + Math.floor((endHour - startHour) / 2);
    }
    
    // Low priority tasks later in the day
    return endHour - 2;
  }

  private identifyConflicts(schedule: any[], events: MLEvent[]): any[] {
    const conflicts: any[] = [];
    
    // Check for time conflicts
    schedule.forEach((item, index) => {
      const itemStart = new Date(item.suggestedStartTime);
      const itemEnd = new Date(item.suggestedEndTime);
      
      // Check against other scheduled items
      for (let i = index + 1; i < schedule.length; i++) {
        const otherItem = schedule[i];
        const otherStart = new Date(otherItem.suggestedStartTime);
        const otherEnd = new Date(otherItem.suggestedEndTime);
        
        if (itemStart < otherEnd && itemEnd > otherStart) {
          conflicts.push({
            type: 'time',
            description: `Conflito de horário entre tarefas`,
            severity: 'high',
            suggestedResolution: 'Reagendar uma das tarefas',
          });
        }
      }
      
      // Check against events
      events.forEach(event => {
        const eventStart = new Date(event.startTime);
        const eventEnd = new Date(event.endTime);
        
        if (itemStart < eventEnd && itemEnd > eventStart) {
          conflicts.push({
            type: 'time',
            description: `Conflito com evento: ${event.title}`,
            severity: 'medium',
            suggestedResolution: 'Ajustar horário da tarefa',
          });
        }
      });
    });
    
    return conflicts.slice(0, 3); // Return top 3 conflicts
  }

  private generateOptimizationInsights(tasks: MLTask[], events: MLEvent[], preferences: MLUserPreferences): any[] {
    const insights: any[] = [];
    
    // Task distribution analysis
    const highPriorityTasks = tasks.filter(t => t.priority === 'high' || t.priority === 'urgent');
    if (highPriorityTasks.length > 5) {
      insights.push({
        type: 'efficiency',
        message: 'Muitas tarefas de alta prioridade. Considere delegar ou reavaliar prioridades.',
        impact: 15,
      });
    }
    
    // Time allocation analysis
    const totalTaskTime = tasks.reduce((sum, task) => sum + task.estimatedDuration, 0);
    const availableHours = (parseInt(preferences.preferredWorkingHours.end.split(':')[0]) - 
                           parseInt(preferences.preferredWorkingHours.start.split(':')[0])) * 60;
    
    if (totalTaskTime > availableHours * 0.8) {
      insights.push({
        type: 'wellness',
        message: 'Agenda muito lotada. Considere redistribuir tarefas ou adicionar pausas.',
        impact: 20,
      });
    }
    
    // Energy level matching
    const morningTasks = tasks.filter(t => {
      const hour = this.getOptimalHourForTask(t, preferences);
      return hour >= 6 && hour < 12;
    }).length;
    
    if (morningTasks / tasks.length > 0.7 && preferences.energyLevels.morning < 70) {
      insights.push({
        type: 'productivity',
        message: 'Muitas tarefas agendadas para a manhã, mas seus níveis de energia são baixos neste período.',
        impact: 25,
      });
    }
    
    return insights;
  }

  private simulateProductivityAnalysis(data: any): MLProductivityAnalysis {
    // Enhanced productivity analysis simulation
    return {
      score: Math.floor(Math.random() * 35) + 65, // 65-100
      trends: {
        tasksCompleted: Array.from({ length: 7 }, () => Math.floor(Math.random() * 8) + 3),
        focusTime: Array.from({ length: 7 }, () => Math.floor(Math.random() * 180) + 60),
        habitConsistency: Array.from({ length: 7 }, () => Math.floor(Math.random() * 40) + 60),
        productivityScore: Array.from({ length: 7 }, () => Math.floor(Math.random() * 35) + 65),
      },
      patterns: {
        bestWorkingHours: ['09:00-11:00', '14:00-16:00'],
        mostProductiveDays: ['Segunda', 'Quarta', 'Sexta'],
        commonDistractions: ['Redes sociais', 'Email', 'Reuniões improdutivas'],
      },
      recommendations: [
        {
          type: 'schedule',
          priority: 'high',
          description: 'Agendar tarefas importantes entre 9h-11h para melhor produtividade',
          expectedImpact: 15,
        },
        {
          type: 'habits',
          priority: 'medium',
          description: 'Implementar pausas de 5 minutos a cada 25 minutos de trabalho',
          expectedImpact: 10,
        },
        {
          type: 'environment',
          priority: 'low',
          description: 'Reduzir notificações durante períodos de foco',
          expectedImpact: 8,
        },
      ],
    };
  }

  private simulateInsights(data: any): AIInsight[] {
    return [
      {
        id: `insight-${Date.now()}-1`,
        type: 'optimization',
        title: 'Otimização de Horários Detectada',
        description: 'Seu horário de maior produtividade é entre 9h-11h. Tarefas importantes foram movidas para este período.',
        priority: 'high',
        category: 'productivity',
        actionable: true,
        action: {
          type: 'optimize',
          suggestion: 'Manter tarefas críticas no horário de pico',
        },
        createdAt: new Date(),
        isRead: false,
      },
      {
        id: `insight-${Date.now()}-2`,
        type: 'suggestion',
        title: 'Melhor Distribuição de Energia',
        description: 'Tarefas cognitivas distribuídas de acordo com seus níveis de energia naturais.',
        priority: 'medium',
        category: 'health',
        actionable: true,
        action: {
          type: 'modify',
          suggestion: 'Ajustar tipos de tarefas por período do dia',
        },
        createdAt: new Date(),
        isRead: false,
      },
    ];
  }

  // Public methods
  async optimizeSchedule(request: MLOptimizationRequest): Promise<MLOptimizationResult> {
    return this.makeMLRequest<MLOptimizationResult>('/optimize-schedule', request);
  }

  async analyzeProductivity(data: any): Promise<MLProductivityAnalysis> {
    return this.makeMLRequest<MLProductivityAnalysis>('/analyze-productivity', data);
  }

  async generateAIInsights(data: any): Promise<AIInsight[]> {
    return this.makeMLRequest<AIInsight[]>('/generate-insights', data);
  }

  // Utility methods for data conversion
  convertToMLTask(task: PlannedTask): MLTask {
    return {
      ...task,
      dueDate: task.dueDate.toISOString(),
    };
  }

  convertToMLEvent(event: PlannedEvent): MLEvent {
    return {
      ...event,
      startTime: event.startTime.toISOString(),
      endTime: event.endTime.toISOString(),
    };
  }

  getDefaultUserPreferences(): MLUserPreferences {
    return {
      preferredWorkingHours: {
        start: "09:00",
        end: "17:00"
      },
      productivityPeaks: ["09:00-11:00", "14:00-16:00"],
      breakPreferences: {
        frequency: 120, // 2 hours
        duration: 15    // 15 minutes
      },
      energyLevels: {
        morning: 85,
        afternoon: 70,
        evening: 60
      }
    };
  }
}

export const mlOptimizationService = new MLOptimizationService();
