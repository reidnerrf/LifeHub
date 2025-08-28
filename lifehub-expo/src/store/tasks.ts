import { create } from 'zustand';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
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
}

export type TaskView = 'list' | 'calendar' | 'kanban';

interface TasksStore {
  tasks: Task[];
  view: TaskView;
  filter: {
    priority?: string;
    tags?: string[];
    status?: string;
    search?: string;
  };
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  addSubtask: (taskId: string, subtask: Omit<SubTask, 'id' | 'createdAt'>) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  setView: (view: TaskView) => void;
  setFilter: (filter: Partial<TasksStore['filter']>) => void;
  getFilteredTasks: () => Task[];
  getTasksByStatus: (status: Task['status']) => Task[];
  getTasksByPriority: (priority: Task['priority']) => Task[];
  getTasksByTag: (tag: string) => Task[];
  estimateTaskDuration: (task: Task) => number;
  rescheduleTask: (taskId: string, newDueDate: Date) => void;
}

export const useTasks = create<TasksStore>((set, get) => ({
  tasks: [],
  view: 'list',
  filter: {},

  setTasks: (tasks) => set({ tasks }),

  addTask: (task) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({ tasks: [newTask, ...state.tasks] }));
  },

  updateTask: (id, updates) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id
          ? { ...task, ...updates, updatedAt: new Date() }
          : task
      ),
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
          ? { 
              ...task, 
              subtasks: [...task.subtasks, newSubtask],
              updatedAt: new Date() 
            }
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
              updatedAt: new Date(),
            }
          : task
      ),
    }));
  },

  setView: (view) => set({ view }),

  setFilter: (filter) => set((state) => ({ 
    filter: { ...state.filter, ...filter } 
  })),

  getFilteredTasks: () => {
    const { tasks, filter } = get();
    return tasks.filter((task) => {
      // Filtro por prioridade
      if (filter.priority && task.priority !== filter.priority) {
        return false;
      }
      
      // Filtro por tags
      if (filter.tags && filter.tags.length > 0) {
        const hasMatchingTag = filter.tags.some((tag) => 
          task.tags.includes(tag)
        );
        if (!hasMatchingTag) return false;
      }
      
      // Filtro por status
      if (filter.status && task.status !== filter.status) {
        return false;
      }
      
      // Filtro por busca
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(searchLower);
        const matchesDescription = task.description?.toLowerCase().includes(searchLower) || false;
        const matchesTags = task.tags.some((tag) => 
          tag.toLowerCase().includes(searchLower)
        );
        if (!matchesTitle && !matchesDescription && !matchesTags) {
          return false;
        }
      }
      
      return true;
    });
  },

  getTasksByStatus: (status) => {
    const { tasks } = get();
    return tasks.filter((task) => task.status === status);
  },

  getTasksByPriority: (priority) => {
    const { tasks } = get();
    return tasks.filter((task) => task.priority === priority);
  },

  getTasksByTag: (tag) => {
    const { tasks } = get();
    return tasks.filter((task) => task.tags.includes(tag));
  },

  estimateTaskDuration: (task) => {
    // Algoritmo simples de estimativa baseado em:
    // - Número de subtarefas
    // - Prioridade
    // - Tags específicas
    let baseDuration = 30; // 30 minutos base
    
    // Ajuste por subtarefas
    baseDuration += task.subtasks.length * 15;
    
    // Ajuste por prioridade
    switch (task.priority) {
      case 'urgent':
        baseDuration *= 0.8; // Tarefas urgentes tendem a ser mais rápidas
        break;
      case 'high':
        baseDuration *= 1.0;
        break;
      case 'medium':
        baseDuration *= 1.2;
        break;
      case 'low':
        baseDuration *= 1.5; // Tarefas de baixa prioridade podem demorar mais
        break;
    }
    
    // Ajuste por tags específicas
    if (task.tags.includes('reunião')) baseDuration = 60;
    if (task.tags.includes('estudo')) baseDuration *= 1.5;
    if (task.tags.includes('exercício')) baseDuration = 45;
    if (task.tags.includes('email')) baseDuration = 15;
    
    return Math.round(baseDuration);
  },

  rescheduleTask: (taskId, newDueDate) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? { ...task, dueDate: newDueDate, updatedAt: new Date() }
          : task
      ),
    }));
  },
}));