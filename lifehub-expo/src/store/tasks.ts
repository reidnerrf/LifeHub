import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

export interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  estimatedDuration: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  subtasks: Omit<SubTask, 'id' | 'createdAt'>[];
  isPublic: boolean;
  createdBy: string;
  usageCount: number;
  createdAt: Date;
}

export interface TaskDependency {
  id: string;
  taskId: string;
  dependsOnTaskId: string;
  type: 'blocks' | 'requires' | 'suggests';
  createdAt: Date;
}

export interface TimeEntry {
  id: string;
  taskId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // em minutos
  notes?: string;
  isActive: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  subtasks: SubTask[];
  dueDate?: Date;
  estimatedDuration?: number; // em minutos
  actualDuration?: number; // em minutos
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  // Novos campos
  templateId?: string;
  dependencies: TaskDependency[];
  timeEntries: TimeEntry[];
  isShared: boolean;
  sharedWith: string[];
  externalCalendarId?: string;
  externalEventId?: string;
  notifications: {
    enabled: boolean;
    reminderTime: number; // minutos antes do vencimento
    repeatInterval?: 'daily' | 'weekly' | 'monthly';
  };
  aiSuggestions: {
    bestTimeToStart?: Date;
    estimatedCompletionTime?: Date;
    suggestedDuration?: number;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
  };
}

export interface ProductivityReport {
  id: string;
  period: 'daily' | 'weekly' | 'monthly';
  startDate: Date;
  endDate: Date;
  totalTasks: number;
  completedTasks: number;
  totalTimeSpent: number;
  averageTaskDuration: number;
  mostProductiveDay: string;
  mostProductiveHour: number;
  priorityDistribution: Record<string, number>;
  tagDistribution: Record<string, number>;
  completionRate: number;
  overdueTasks: number;
  generatedAt: Date;
}

export type TaskView = 'list' | 'calendar' | 'kanban';

interface TasksStore {
  // Dados
  tasks: Task[];
  templates: TaskTemplate[];
  timeEntries: TimeEntry[];
  productivityReports: ProductivityReport[];
  
  // Estado atual
  view: TaskView;
  filter: {
    priority?: string;
    tags?: string[];
    status?: string;
    search?: string;
    dateRange?: { start: Date; end: Date };
    assignee?: string;
  };
  isOffline: boolean;
  pendingSync: {
    tasks: Task[];
    timeEntries: TimeEntry[];
  };
  
  // Drag & Drop
  draggedTask: Task | null;
  dropTarget: { view: TaskView; status?: string; date?: Date } | null;
  
  // Time Tracking
  activeTimeEntry: TimeEntry | null;
  
  // Ações básicas
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  addSubtask: (taskId: string, subtask: Omit<SubTask, 'id' | 'createdAt'>) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  
  // Templates
  addTemplate: (template: Omit<TaskTemplate, 'id' | 'createdAt' | 'usageCount'>) => void;
  updateTemplate: (id: string, updates: Partial<TaskTemplate>) => void;
  deleteTemplate: (id: string) => void;
  createTaskFromTemplate: (templateId: string, customizations?: Partial<Task>) => void;
  getTemplatesByCategory: (category: string) => TaskTemplate[];
  getPopularTemplates: (limit?: number) => TaskTemplate[];
  
  // Dependências
  addDependency: (taskId: string, dependsOnTaskId: string, type: TaskDependency['type']) => void;
  removeDependency: (dependencyId: string) => void;
  getDependencies: (taskId: string) => TaskDependency[];
  getBlockedTasks: (taskId: string) => Task[];
  canCompleteTask: (taskId: string) => boolean;
  
  // Time Tracking
  startTimeTracking: (taskId: string, notes?: string) => void;
  stopTimeTracking: (taskId: string) => void;
  pauseTimeTracking: (taskId: string) => void;
  resumeTimeTracking: (taskId: string) => void;
  addTimeEntry: (timeEntry: Omit<TimeEntry, 'id'>) => void;
  updateTimeEntry: (id: string, updates: Partial<TimeEntry>) => void;
  deleteTimeEntry: (id: string) => void;
  getTimeEntriesForTask: (taskId: string) => TimeEntry[];
  getTotalTimeForTask: (taskId: string) => number;
  
  // Drag & Drop
  setDraggedTask: (task: Task | null) => void;
  setDropTarget: (target: { view: TaskView; status?: string; date?: Date } | null) => void;
  moveTask: (taskId: string, targetView: TaskView, targetStatus?: string, targetDate?: Date) => void;
  
  // Views e Filtros
  setView: (view: TaskView) => void;
  setFilter: (filter: Partial<TasksStore['filter']>) => void;
  getFilteredTasks: () => Task[];
  getTasksByStatus: (status: Task['status']) => Task[];
  getTasksByPriority: (priority: Task['priority']) => Task[];
  getTasksByTag: (tag: string) => Task[];
  getTasksByDate: (date: Date) => Task[];
  
  // Integração com Calendário
  syncWithExternalCalendar: (calendarId: string) => Promise<boolean>;
  createExternalEvent: (taskId: string, calendarId: string) => Promise<boolean>;
  updateExternalEvent: (taskId: string) => Promise<boolean>;
  deleteExternalEvent: (taskId: string) => Promise<boolean>;
  
  // Notificações
  scheduleNotification: (taskId: string, reminderTime: number) => void;
  cancelNotification: (taskId: string) => void;
  getOverdueTasks: () => Task[];
  getTasksDueSoon: (hours: number) => Task[];
  
  // Relatórios de Produtividade
  generateProductivityReport: (period: ProductivityReport['period'], startDate: Date, endDate: Date) => ProductivityReport;
  getProductivityReports: (period?: ProductivityReport['period']) => ProductivityReport[];
  getProductivityStats: () => {
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
    totalTimeSpent: number;
    averageTaskDuration: number;
  };
  
  // Sincronização Offline
  setOfflineMode: (isOffline: boolean) => void;
  syncOfflineChanges: () => Promise<boolean>;
  getPendingSync: () => TasksStore['pendingSync'];
  
  // Compartilhamento
  shareTask: (taskId: string, users: string[]) => void;
  unshareTask: (taskId: string, user: string) => void;
  getSharedTasks: () => Task[];
  getTasksSharedWithMe: () => Task[];
  
  // IA para Sugestões
  generateAISuggestions: (taskId: string) => Promise<void>;
  getAISuggestions: (taskId: string) => Task['aiSuggestions'];
  applyAISuggestion: (taskId: string, suggestion: keyof Task['aiSuggestions']) => void;
  
  // Utilitários
  estimateTaskDuration: (task: Task) => number;
  rescheduleTask: (taskId: string, newDueDate: Date) => void;
  duplicateTask: (taskId: string) => void;
  archiveTask: (taskId: string) => void;
  
  // Persistência
  saveTasks: () => Promise<void>;
  loadTasks: () => Promise<void>;
  exportTasks: (format: 'json' | 'csv') => Promise<string>;
  importTasks: (data: string, format: 'json' | 'csv') => Promise<boolean>;
}

export const useTasks = create<TasksStore>((set, get) => ({
  // Estado inicial
  tasks: [],
  templates: [
    {
      id: 'template-1',
      name: 'Reunião de Planejamento',
      description: 'Template para reuniões de planejamento semanal',
      category: 'Reuniões',
      estimatedDuration: 60,
      priority: 'high',
      tags: ['reunião', 'planejamento', 'semanal'],
      subtasks: [
        { title: 'Preparar agenda', completed: false },
        { title: 'Enviar convites', completed: false },
        { title: 'Revisar documentos', completed: false },
        { title: 'Fazer anotações', completed: false },
      ],
      isPublic: true,
      createdBy: 'system',
      usageCount: 15,
      createdAt: new Date('2024-01-01'),
    },
    {
      id: 'template-2',
      name: 'Desenvolvimento de Feature',
      description: 'Template para desenvolvimento de novas funcionalidades',
      category: 'Desenvolvimento',
      estimatedDuration: 240,
      priority: 'medium',
      tags: ['desenvolvimento', 'feature', 'código'],
      subtasks: [
        { title: 'Análise de requisitos', completed: false },
        { title: 'Design da solução', completed: false },
        { title: 'Implementação', completed: false },
        { title: 'Testes', completed: false },
        { title: 'Documentação', completed: false },
        { title: 'Deploy', completed: false },
      ],
      isPublic: true,
      createdBy: 'system',
      usageCount: 8,
      createdAt: new Date('2024-01-01'),
    },
    {
      id: 'template-3',
      name: 'Rotina Matinal',
      description: 'Template para rotina matinal produtiva',
      category: 'Rotinas',
      estimatedDuration: 30,
      priority: 'medium',
      tags: ['rotina', 'matinal', 'produtividade'],
      subtasks: [
        { title: 'Meditação', completed: false },
        { title: 'Exercícios', completed: false },
        { title: 'Café da manhã', completed: false },
        { title: 'Planejamento do dia', completed: false },
      ],
      isPublic: true,
      createdBy: 'system',
      usageCount: 25,
      createdAt: new Date('2024-01-01'),
    },
  ],
  timeEntries: [],
  productivityReports: [],
  view: 'list',
  filter: {},
  isOffline: false,
  pendingSync: {
    tasks: [],
    timeEntries: [],
  },
  draggedTask: null,
  dropTarget: null,
  activeTimeEntry: null,

  // Implementações das ações básicas
  setTasks: (tasks) => set({ tasks }),

  addTask: (task) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      dependencies: [],
      timeEntries: [],
      isShared: false,
      sharedWith: [],
      notifications: {
        enabled: true,
        reminderTime: 30,
      },
      aiSuggestions: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({ 
      tasks: [newTask, ...state.tasks],
      pendingSync: {
        ...state.pendingSync,
        tasks: [...state.pendingSync.tasks, newTask],
      },
    }));
  },

  updateTask: (id, updates) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id
          ? { ...task, ...updates, updatedAt: new Date() }
          : task
      ),
      pendingSync: {
        ...state.pendingSync,
        tasks: [...state.pendingSync.tasks, { ...state.tasks.find(t => t.id === id)!, ...updates }],
      },
    }));
  },

  deleteTask: (id) => {
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    }));
  },

  toggleTask: (id) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id
          ? { 
              ...task, 
              completed: !task.completed,
              status: !task.completed ? 'completed' : 'pending',
              updatedAt: new Date() 
            }
          : task
      ),
    }));
  },

  addSubtask: (taskId, subtask) => {
    const newSubtask: SubTask = {
      ...subtask,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? { ...task, subtasks: [...task.subtasks, newSubtask] }
          : task
      ),
    }));
  },

  toggleSubtask: (taskId, subtaskId) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              subtasks: task.subtasks.map((subtask) =>
                subtask.id === subtaskId
                  ? { ...subtask, completed: !subtask.completed }
                  : subtask
              ),
            }
          : task
      ),
    }));
  },

  // Templates
  addTemplate: (template) => {
    const newTemplate: TaskTemplate = {
      ...template,
      id: Date.now().toString(),
      usageCount: 0,
      createdAt: new Date(),
    };
    set((state) => ({ templates: [newTemplate, ...state.templates] }));
  },

  updateTemplate: (id, updates) => {
    set((state) => ({
      templates: state.templates.map((template) =>
        template.id === id ? { ...template, ...updates } : template
      ),
    }));
  },

  deleteTemplate: (id) => {
    set((state) => ({
      templates: state.templates.filter((template) => template.id !== id),
    }));
  },

  createTaskFromTemplate: (templateId, customizations = {}) => {
    const template = get().templates.find((t) => t.id === templateId);
    if (!template) return;

    const newTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
      title: customizations.title || template.name,
      description: customizations.description || template.description,
      priority: customizations.priority || template.priority,
      tags: customizations.tags || template.tags,
      subtasks: template.subtasks.map((subtask) => ({
        ...subtask,
        id: Date.now().toString(),
        createdAt: new Date(),
      })),
      estimatedDuration: customizations.estimatedDuration || template.estimatedDuration,
      status: 'pending',
      completed: false,
      dependencies: [],
      timeEntries: [],
      isShared: false,
      sharedWith: [],
      notifications: {
        enabled: true,
        reminderTime: 30,
      },
      aiSuggestions: {},
      templateId: template.id,
    };

    get().addTask(newTask);

    // Incrementar contador de uso
    set((state) => ({
      templates: state.templates.map((t) =>
        t.id === templateId ? { ...t, usageCount: t.usageCount + 1 } : t
      ),
    }));
  },

  getTemplatesByCategory: (category) => {
    return get().templates.filter((template) => template.category === category);
  },

  getPopularTemplates: (limit = 5) => {
    return get().templates
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  },

  // Dependências
  addDependency: (taskId, dependsOnTaskId, type) => {
    const newDependency: TaskDependency = {
      id: Date.now().toString(),
      taskId,
      dependsOnTaskId,
      type,
      createdAt: new Date(),
    };
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? { ...task, dependencies: [...task.dependencies, newDependency] }
          : task
      ),
    }));
  },

  removeDependency: (dependencyId) => {
    set((state) => ({
      tasks: state.tasks.map((task) => ({
        ...task,
        dependencies: task.dependencies.filter((dep) => dep.id !== dependencyId),
      })),
    }));
  },

  getDependencies: (taskId) => {
    const task = get().tasks.find((t) => t.id === taskId);
    return task ? task.dependencies : [];
  },

  getBlockedTasks: (taskId) => {
    return get().tasks.filter((task) =>
      task.dependencies.some((dep) => dep.dependsOnTaskId === taskId && dep.type === 'blocks')
    );
  },

  canCompleteTask: (taskId) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task) return false;

    // Verificar se todas as dependências foram completadas
    const incompleteDependencies = task.dependencies.filter((dep) => {
      const dependsOnTask = get().tasks.find((t) => t.id === dep.dependsOnTaskId);
      return dependsOnTask && !dependsOnTask.completed;
    });

    return incompleteDependencies.length === 0;
  },

  // Time Tracking
  startTimeTracking: (taskId, notes) => {
    const timeEntry: TimeEntry = {
      id: Date.now().toString(),
      taskId,
      startTime: new Date(),
      notes,
      isActive: true,
    };

    set((state) => ({
      timeEntries: [...state.timeEntries, timeEntry],
      activeTimeEntry: timeEntry,
    }));
  },

  stopTimeTracking: (taskId) => {
    const { activeTimeEntry } = get();
    if (!activeTimeEntry || activeTimeEntry.taskId !== taskId) return;

    const endTime = new Date();
    const duration = Math.round((endTime.getTime() - activeTimeEntry.startTime.getTime()) / (1000 * 60));

    set((state) => ({
      timeEntries: state.timeEntries.map((entry) =>
        entry.id === activeTimeEntry.id
          ? { ...entry, endTime, duration, isActive: false }
          : entry
      ),
      activeTimeEntry: null,
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? { ...task, actualDuration: (task.actualDuration || 0) + duration }
          : task
      ),
    }));
  },

  pauseTimeTracking: (taskId) => {
    const { activeTimeEntry } = get();
    if (!activeTimeEntry || activeTimeEntry.taskId !== taskId) return;

    const endTime = new Date();
    const duration = Math.round((endTime.getTime() - activeTimeEntry.startTime.getTime()) / (1000 * 60));

    set((state) => ({
      timeEntries: state.timeEntries.map((entry) =>
        entry.id === activeTimeEntry.id
          ? { ...entry, endTime, duration, isActive: false }
          : entry
      ),
      activeTimeEntry: null,
    }));
  },

  resumeTimeTracking: (taskId) => {
    const timeEntry: TimeEntry = {
      id: Date.now().toString(),
      taskId,
      startTime: new Date(),
      isActive: true,
    };

    set((state) => ({
      timeEntries: [...state.timeEntries, timeEntry],
      activeTimeEntry: timeEntry,
    }));
  },

  addTimeEntry: (timeEntry) => {
    const newTimeEntry: TimeEntry = {
      ...timeEntry,
      id: Date.now().toString(),
    };
    set((state) => ({ timeEntries: [...state.timeEntries, newTimeEntry] }));
  },

  updateTimeEntry: (id, updates) => {
    set((state) => ({
      timeEntries: state.timeEntries.map((entry) =>
        entry.id === id ? { ...entry, ...updates } : entry
      ),
    }));
  },

  deleteTimeEntry: (id) => {
    set((state) => ({
      timeEntries: state.timeEntries.filter((entry) => entry.id !== id),
    }));
  },

  getTimeEntriesForTask: (taskId) => {
    return get().timeEntries.filter((entry) => entry.taskId === taskId);
  },

  getTotalTimeForTask: (taskId) => {
    const entries = get().getTimeEntriesForTask(taskId);
    return entries.reduce((total, entry) => total + (entry.duration || 0), 0);
  },

  // Drag & Drop
  setDraggedTask: (task) => set({ draggedTask: task }),
  setDropTarget: (target) => set({ dropTarget: target }),

  moveTask: (taskId, targetView, targetStatus, targetDate) => {
    const updates: Partial<Task> = {};
    
    if (targetStatus) {
      updates.status = targetStatus as Task['status'];
    }
    
    if (targetDate) {
      updates.dueDate = targetDate;
    }

    get().updateTask(taskId, updates);
    set({ draggedTask: null, dropTarget: null });
  },

  // Views e Filtros
  setView: (view) => set({ view }),
  setFilter: (filter) => set((state) => ({ filter: { ...state.filter, ...filter } })),

  getFilteredTasks: () => {
    const { tasks, filter } = get();
    return tasks.filter((task) => {
      if (filter.priority && task.priority !== filter.priority) return false;
      if (filter.status && task.status !== filter.status) return false;
      if (filter.tags && filter.tags.length > 0) {
        if (!filter.tags.some((tag) => task.tags.includes(tag))) return false;
      }
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        if (!task.title.toLowerCase().includes(searchLower) &&
            !task.description?.toLowerCase().includes(searchLower)) {
          return false;
        }
      }
      if (filter.dateRange) {
        if (task.dueDate) {
          if (task.dueDate < filter.dateRange.start || task.dueDate > filter.dateRange.end) {
            return false;
          }
        }
      }
      return true;
    });
  },

  getTasksByStatus: (status) => {
    return get().tasks.filter((task) => task.status === status);
  },

  getTasksByPriority: (priority) => {
    return get().tasks.filter((task) => task.priority === priority);
  },

  getTasksByTag: (tag) => {
    return get().tasks.filter((task) => task.tags.includes(tag));
  },

  getTasksByDate: (date) => {
    return get().tasks.filter((task) => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate.toDateString() === date.toDateString();
    });
  },

  // Integração com Calendário
  syncWithExternalCalendar: async (calendarId) => {
    // Simular sincronização
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(Math.random() > 0.1);
      }, 2000);
    });
  },

  createExternalEvent: async (taskId, calendarId) => {
    // Simular criação de evento
    return new Promise((resolve) => {
      setTimeout(() => {
        const success = Math.random() > 0.1;
        if (success) {
          get().updateTask(taskId, {
            externalCalendarId: calendarId,
            externalEventId: `event-${Date.now()}`,
          });
        }
        resolve(success);
      }, 1000);
    });
  },

  updateExternalEvent: async (taskId) => {
    // Simular atualização de evento
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(Math.random() > 0.1);
      }, 1000);
    });
  },

  deleteExternalEvent: async (taskId) => {
    // Simular exclusão de evento
    return new Promise((resolve) => {
      setTimeout(() => {
        const success = Math.random() > 0.1;
        if (success) {
          get().updateTask(taskId, {
            externalCalendarId: undefined,
            externalEventId: undefined,
          });
        }
        resolve(success);
      }, 1000);
    });
  },

  // Notificações
  scheduleNotification: (taskId, reminderTime) => {
    get().updateTask(taskId, {
      notifications: {
        enabled: true,
        reminderTime,
      },
    });
  },

  cancelNotification: (taskId) => {
    get().updateTask(taskId, {
      notifications: {
        enabled: false,
        reminderTime: 0,
      },
    });
  },

  getOverdueTasks: () => {
    const now = new Date();
    return get().tasks.filter((task) => {
      if (!task.dueDate || task.completed) return false;
      return task.dueDate < now;
    });
  },

  getTasksDueSoon: (hours) => {
    const now = new Date();
    const soon = new Date(now.getTime() + hours * 60 * 60 * 1000);
    return get().tasks.filter((task) => {
      if (!task.dueDate || task.completed) return false;
      return task.dueDate >= now && task.dueDate <= soon;
    });
  },

  // Relatórios de Produtividade
  generateProductivityReport: (period, startDate, endDate) => {
    const tasks = get().tasks.filter((task) => {
      const taskDate = new Date(task.createdAt);
      return taskDate >= startDate && taskDate <= endDate;
    });

    const completedTasks = tasks.filter((task) => task.completed);
    const totalTimeSpent = tasks.reduce((total, task) => total + (task.actualDuration || 0), 0);
    const averageTaskDuration = completedTasks.length > 0 
      ? totalTimeSpent / completedTasks.length 
      : 0;

    const report: ProductivityReport = {
      id: Date.now().toString(),
      period,
      startDate,
      endDate,
      totalTasks: tasks.length,
      completedTasks: completedTasks.length,
      totalTimeSpent,
      averageTaskDuration,
      mostProductiveDay: 'Segunda-feira', // Simulado
      mostProductiveHour: 9, // Simulado
      priorityDistribution: {
        low: tasks.filter(t => t.priority === 'low').length,
        medium: tasks.filter(t => t.priority === 'medium').length,
        high: tasks.filter(t => t.priority === 'high').length,
        urgent: tasks.filter(t => t.priority === 'urgent').length,
      },
      tagDistribution: {}, // Seria calculado baseado nas tags
      completionRate: tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0,
      overdueTasks: get().getOverdueTasks().length,
      generatedAt: new Date(),
    };

    set((state) => ({
      productivityReports: [report, ...state.productivityReports],
    }));

    return report;
  },

  getProductivityReports: (period) => {
    const reports = get().productivityReports;
    if (period) {
      return reports.filter((report) => report.period === period);
    }
    return reports;
  },

  getProductivityStats: () => {
    const tasks = get().tasks;
    const completedTasks = tasks.filter((task) => task.completed);
    const totalTimeSpent = tasks.reduce((total, task) => total + (task.actualDuration || 0), 0);
    const averageTaskDuration = completedTasks.length > 0 
      ? totalTimeSpent / completedTasks.length 
      : 0;

    return {
      totalTasks: tasks.length,
      completedTasks: completedTasks.length,
      completionRate: tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0,
      totalTimeSpent,
      averageTaskDuration,
    };
  },

  // Sincronização Offline
  setOfflineMode: (isOffline) => set({ isOffline }),
  
  syncOfflineChanges: async () => {
    const { pendingSync } = get();
    
    // Simular sincronização
    return new Promise((resolve) => {
      setTimeout(() => {
        const success = Math.random() > 0.1;
        if (success) {
          set({ 
            pendingSync: { tasks: [], timeEntries: [] },
            isOffline: false,
          });
        }
        resolve(success);
      }, 3000);
    });
  },

  getPendingSync: () => get().pendingSync,

  // Compartilhamento
  shareTask: (taskId, users) => {
    get().updateTask(taskId, {
      isShared: true,
      sharedWith: users,
    });
  },

  unshareTask: (taskId, user) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedSharedWith = task.sharedWith.filter((u) => u !== user);
    get().updateTask(taskId, {
      isShared: updatedSharedWith.length > 0,
      sharedWith: updatedSharedWith,
    });
  },

  getSharedTasks: () => {
    return get().tasks.filter((task) => task.isShared);
  },

  getTasksSharedWithMe: () => {
    // Simulado - em um sistema real, seria baseado no usuário atual
    return get().tasks.filter((task) => task.isShared);
  },

  // IA para Sugestões
  generateAISuggestions: async (taskId) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task) return;

    // Simular análise de IA
    return new Promise((resolve) => {
      setTimeout(() => {
        const suggestions = {
          bestTimeToStart: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 horas
          estimatedCompletionTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 horas
          suggestedDuration: task.estimatedDuration || 120,
          priority: task.priority === 'low' ? 'medium' : task.priority,
        };

        get().updateTask(taskId, { aiSuggestions: suggestions });
        resolve();
      }, 2000);
    });
  },

  getAISuggestions: (taskId) => {
    const task = get().tasks.find((t) => t.id === taskId);
    return task ? task.aiSuggestions : {};
  },

  applyAISuggestion: (taskId, suggestion) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task || !task.aiSuggestions[suggestion]) return;

    const updates: Partial<Task> = {};
    
    switch (suggestion) {
      case 'bestTimeToStart':
        updates.dueDate = task.aiSuggestions.bestTimeToStart;
        break;
      case 'estimatedCompletionTime':
        // Aplicar tempo estimado de conclusão
        break;
      case 'suggestedDuration':
        updates.estimatedDuration = task.aiSuggestions.suggestedDuration;
        break;
      case 'priority':
        updates.priority = task.aiSuggestions.priority;
        break;
    }

    get().updateTask(taskId, updates);
  },

  // Utilitários
  estimateTaskDuration: (task) => {
    // Algoritmo simples baseado em título, descrição e subtarefas
    let duration = 30; // Base de 30 minutos
    
    if (task.title.length > 50) duration += 15;
    if (task.description && task.description.length > 100) duration += 30;
    if (task.subtasks.length > 0) duration += task.subtasks.length * 10;
    if (task.priority === 'high' || task.priority === 'urgent') duration += 15;
    
    return duration;
  },

  rescheduleTask: (taskId, newDueDate) => {
    get().updateTask(taskId, { dueDate: newDueDate });
  },

  duplicateTask: (taskId) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task) return;

    const duplicatedTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
      ...task,
      title: `${task.title} (Cópia)`,
      completed: false,
      status: 'pending',
      dependencies: [],
      timeEntries: [],
      isShared: false,
      sharedWith: [],
      aiSuggestions: {},
    };

    get().addTask(duplicatedTask);
  },

  archiveTask: (taskId) => {
    get().updateTask(taskId, { status: 'cancelled' });
  },

  // Persistência
  saveTasks: async () => {
    const { tasks, templates, timeEntries } = get();
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
      await AsyncStorage.setItem('taskTemplates', JSON.stringify(templates));
      await AsyncStorage.setItem('timeEntries', JSON.stringify(timeEntries));
    } catch (error) {
      console.error('Erro ao salvar tarefas:', error);
    }
  },

  loadTasks: async () => {
    try {
      const tasksData = await AsyncStorage.getItem('tasks');
      const templatesData = await AsyncStorage.getItem('taskTemplates');
      const timeEntriesData = await AsyncStorage.getItem('timeEntries');

      if (tasksData) {
        const tasks = JSON.parse(tasksData);
        set({ tasks });
      }
      if (templatesData) {
        const templates = JSON.parse(templatesData);
        set({ templates });
      }
      if (timeEntriesData) {
        const timeEntries = JSON.parse(timeEntriesData);
        set({ timeEntries });
      }
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
    }
  },

  exportTasks: async (format) => {
    const { tasks } = get();
    
    if (format === 'json') {
      return JSON.stringify(tasks, null, 2);
    } else if (format === 'csv') {
      const headers = ['ID', 'Título', 'Descrição', 'Status', 'Prioridade', 'Data de Vencimento', 'Tags'];
      const rows = tasks.map(task => [
        task.id,
        task.title,
        task.description || '',
        task.status,
        task.priority,
        task.dueDate ? task.dueDate.toISOString() : '',
        task.tags.join(', ')
      ]);
      
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
    
    return '';
  },

  importTasks: async (data, format) => {
    try {
      let tasks: Task[] = [];
      
      if (format === 'json') {
        tasks = JSON.parse(data);
      } else if (format === 'csv') {
        const lines = data.split('\n');
        const headers = lines[0].split(',');
        
        tasks = lines.slice(1).map(line => {
          const values = line.split(',');
          return {
            id: values[0],
            title: values[1],
            description: values[2],
            status: values[3] as Task['status'],
            priority: values[4] as Task['priority'],
            dueDate: values[5] ? new Date(values[5]) : undefined,
            tags: values[6] ? values[6].split(', ') : [],
            completed: values[3] === 'completed',
            subtasks: [],
            dependencies: [],
            timeEntries: [],
            isShared: false,
            sharedWith: [],
            notifications: { enabled: true, reminderTime: 30 },
            aiSuggestions: {},
            createdAt: new Date(),
            updatedAt: new Date(),
          };
        });
      }
      
      set({ tasks });
      return true;
    } catch (error) {
      console.error('Erro ao importar tarefas:', error);
      return false;
    }
  },
}));