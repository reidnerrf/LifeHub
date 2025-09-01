import React, { useEffect, useState } from 'react';
import { Plus, MoreVertical, Clock, Flag } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { storage } from '../services/storage';
import { api } from '../services/api';
import { SegmentedControl } from './ui/segmented-control';
import { Tag } from './ui/tag';
import { EmptyState } from './ui/empty-state';

import { t } from '../i18n';


const TasksView: React.FC = () => {
  const [selectedBoard, setSelectedBoard] = useState('kanban');

  const [tasks, setTasks] = useState({
    todo: [
      {
        id: 1,
        title: 'Revisar código do projeto',
        description: 'Fazer code review das últimas mudanças',
        priority: 'high',
        dueDate: '2025-08-27',
        tags: ['desenvolvimento', 'urgente'],
      },
      {
        id: 2,
        title: 'Planejar reunião semanal',
        description: 'Preparar agenda e pontos importantes',
        priority: 'medium',
        dueDate: '2025-08-28',
        tags: ['reunião'],
      },
    ],
    inProgress: [
      {
        id: 3,
        title: 'Criar apresentação Q3',
        description: 'Slides para apresentação de resultados',
        priority: 'high',
        dueDate: '2025-08-29',
        tags: ['apresentação', 'importante'],
      },
    ],
    done: [
      {
        id: 4,
        title: 'Responder emails',
        description: 'Verificar e responder emails pendentes',
        priority: 'low',
        dueDate: '2025-08-26',
        tags: ['email'],
      },
    ],
  });

  useEffect(() => {
    (async () => {
      try {
        const list = await api.listTasks();
        const mapped = {
          todo: list.filter(t => !t.completed).map(t => ({ id: t._id, title: t.title, description: '', priority: 'medium', dueDate: '', tags: [] })),
          inProgress: [],
          done: list.filter(t => t.completed).map(t => ({ id: t._id, title: t.title, description: '', priority: 'low', dueDate: '', tags: [] })),
        } as any;
        setTasks(mapped);
      } catch {
        const saved = storage.get<typeof tasks>('tasks');
        if (saved) setTasks(saved);
      }
    })();
  }, []);

  useEffect(() => {
    storage.set('tasks', tasks);
  }, [tasks]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'var(--app-yellow)';
      case 'medium':
        return 'var(--app-blue)';
      case 'low':
        return 'var(--app-green)';
      default:
        return 'var(--app-gray)';
    }
  };

  const columns = [
    { id: 'todo', title: 'A Fazer', color: 'var(--app-gray)', tasks: tasks.todo },
    { id: 'inProgress', title: 'Em Progresso', color: 'var(--app-blue)', tasks: tasks.inProgress },
    { id: 'done', title: 'Concluído', color: 'var(--app-green)', tasks: tasks.done },
  ];

  const createQuickTask = async () => {
    const title = prompt('Nova tarefa');
    if (!title) return;
    try {
      const created = await api.createTask({ title, completed: false });
      setTasks(prev => ({ ...prev, todo: [{ id: created._id, title: created.title, description: '', priority: 'medium', dueDate: '', tags: [] }, ...prev.todo] }));
    } catch {
      setTasks(prev => ({ ...prev, todo: [{ id: Date.now(), title, description: '', priority: 'medium', dueDate: '', tags: [] }, ...prev.todo] }));
    }
  };

  const toggleComplete = async (task: any) => {
    try {
      const id = String(task.id);
      const updated = await api.updateTask(id, { completed: !task.completed });
      setTasks(prev => ({
        ...prev,
        todo: prev.todo.filter(t => String(t.id) !== id),
        inProgress: prev.inProgress.filter(t => String(t.id) !== id),
        done: prev.done.filter(t => String(t.id) !== id),
      }));
      if (updated && updated._id) {
        const mapped = { id: updated._id, title: updated.title, description: '', priority: 'medium', dueDate: '', tags: [], completed: updated.completed };
        setTasks(prev => ({
          ...prev,
          ...(updated.completed ? { done: [mapped, ...prev.done] } : { todo: [mapped, ...prev.todo] })
        }));
      }
    } catch {}
  };

  const deleteTask = async (task: any) => {
    const id = String(task.id);
    try { await api.deleteTask(id); } catch {}
    setTasks(prev => ({
      ...prev,
      todo: prev.todo.filter(t => String(t.id) !== id),
      inProgress: prev.inProgress.filter(t => String(t.id) !== id),
      done: prev.done.filter(t => String(t.id) !== id),
    }));
  };

  const editTask = async (task: any) => {
    const title = prompt('Editar título', task.title);
    if (!title) return;
    const id = String(task.id);
    try { await api.updateTask(id, { title }); } catch {}
    setTasks(prev => ({
      ...prev,
      todo: prev.todo.map(t => String(t.id) === id ? { ...t, title } : t),
      inProgress: prev.inProgress.map(t => String(t.id) === id ? { ...t, title } : t),
      done: prev.done.map(t => String(t.id) === id ? { ...t, title } : t),
    }));
  };

  const TaskCard = ({ task }: { task: any }) => (
    <Card className="p-4 bg-white rounded-xl border-0 shadow-sm mb-3">
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-900 line-clamp-2">{task.title}</h4>
        <div className="flex items-center space-x-2">
          <button className="text-xs px-2 py-1 rounded-lg bg-[var(--app-light-gray)]" onClick={() => toggleComplete(task)}>
            {task.completed ? 'Reabrir' : 'Concluir'}
          </button>
          <button className="text-xs px-2 py-1 rounded-lg bg-[var(--app-light-gray)]" onClick={() => editTask(task)}>Editar</button>
          <button className="text-xs px-2 py-1 rounded-lg bg-[var(--app-red)] text-white" onClick={() => deleteTask(task)}>Excluir</button>
        </div>
      </div>
      
      {task.description && (
        <p className="text-xs text-[var(--app-gray)] mb-3 line-clamp-2">{task.description}</p>
      )}

      {Array.isArray(task.subtasks) && task.subtasks.length > 0 && (
        <div className="mb-3">
          <div className="w-full h-2 bg-[var(--app-light-gray)] rounded-full mb-2">
            <div
              className="h-2 rounded-full bg-[var(--app-blue)]"
              style={{ width: `${Math.round((task.subtasks.filter((s: any) => s.completed).length / task.subtasks.length) * 100)}%` }}
            />
          </div>
          <div className="space-y-1">
            {task.subtasks.slice(0, 3).map((s: any) => (
              <div key={s.id} className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!s.completed}
                    onChange={() => {
                      setTasks(prev => ({
                        ...prev,
                        todo: prev.todo.map(t => t.id === task.id ? { ...t, subtasks: t.subtasks.map((x: any) => x.id === s.id ? { ...x, completed: !x.completed } : x) } : t),
                        inProgress: prev.inProgress.map(t => t.id === task.id ? { ...t, subtasks: t.subtasks.map((x: any) => x.id === s.id ? { ...x, completed: !x.completed } : x) } : t),
                        done: prev.done.map(t => t.id === task.id ? { ...t, subtasks: t.subtasks.map((x: any) => x.id === s.id ? { ...x, completed: !x.completed } : x) } : t),
                      }));
                    }}
                  />
                  <span className={s.completed ? 'line-through text-[var(--app-gray)]' : ''}>{s.title}</span>
                </label>
                <button
                  className="px-2 py-0.5 rounded bg-[var(--app-light-gray)]"
                  onClick={() => {
                    const title = prompt('Editar sub-tarefa', s.title);
                    if (!title) return;
                    setTasks(prev => ({
                      ...prev,
                      todo: prev.todo.map(t => t.id === task.id ? { ...t, subtasks: t.subtasks.map((x: any) => x.id === s.id ? { ...x, title } : x) } : t),
                      inProgress: prev.inProgress.map(t => t.id === task.id ? { ...t, subtasks: t.subtasks.map((x: any) => x.id === s.id ? { ...x, title } : x) } : t),
                      done: prev.done.map(t => t.id === task.id ? { ...t, subtasks: t.subtasks.map((x: any) => x.id === s.id ? { ...x, title } : x) } : t),
                    }));
                  }}
                >Editar</button>
              </div>
            ))}
          </div>
          <button
            className="mt-2 text-xs px-2 py-1 rounded-lg bg-[var(--app-light-gray)]"
            onClick={() => {
              const title = prompt('Nova sub-tarefa');
              if (!title) return;
              const sub = { id: Date.now(), title, completed: false };
              setTasks(prev => ({
                ...prev,
                todo: prev.todo.map(t => t.id === task.id ? { ...t, subtasks: [...(t.subtasks || []), sub] } : t),
                inProgress: prev.inProgress.map(t => t.id === task.id ? { ...t, subtasks: [...(t.subtasks || []), sub] } : t),
                done: prev.done.map(t => t.id === task.id ? { ...t, subtasks: [...(t.subtasks || []), sub] } : t),
              }));
            }}
          >+ Sub-tarefa</button>
        </div>
      )}
      
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Flag size={12} style={{ color: getPriorityColor(task.priority) }} />
          <span className="text-xs text-[var(--app-gray)] capitalize">{task.priority}</span>
        </div>
        <div className="flex items-center space-x-1 text-xs text-[var(--app-gray)]">
          <Clock size={12} />
          <span>{new Date(task.dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-1">
        {task.tags.map((tag: string, index: number) => (
          <Tag key={index}>{tag}</Tag>
        ))}
      </div>
    </Card>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">

        <h1 className="text-2xl font-semibold text-gray-900">{t('tasks')}</h1>

        <SegmentedControl
          options={[
            { label: 'Lista', value: 'list' },
            { label: 'Kanban', value: 'kanban' }
          ]}
          value={selectedBoard}
          onChange={setSelectedBoard}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {columns.map((column) => (
          <Card key={column.id} className="p-4 bg-white rounded-xl border-0 shadow-sm text-center">
            <div 
              className="w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center"
              style={{ backgroundColor: `${column.color}15` }}
            >
              <span 
                className="text-sm font-semibold"
                style={{ color: column.color }}
              >
                {column.tasks.length}
              </span>
            </div>
            <p className="text-xs text-[var(--app-gray)]">{column.title}</p>
          </Card>
        ))}
      </div>

      {/* Kanban Board */}
      {selectedBoard === 'kanban' && (
        <div className="flex-1 overflow-hidden">
          <div className="flex space-x-4 overflow-x-auto pb-4" style={{ minHeight: '400px' }}>
            {columns.map((column) => (
              <div key={column.id} className="flex-shrink-0 w-72">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: column.color }}
                    />
                    <h3 className="font-medium text-gray-900">{column.title}</h3>
                    <span className="text-sm text-[var(--app-gray)]">({column.tasks.length})</span>
                  </div>
                  <button className="text-[var(--app-gray)]" onClick={createQuickTask}>
                    <Plus size={16} />
                  </button>
                </div>
                
                {column.tasks.length === 0 ? (
                  <EmptyState title="Sem itens" description="Adicione uma tarefa para começar" />
                ) : (
                  <div className="space-y-3">
                    {column.tasks.map((task) => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* List View */}
      {selectedBoard === 'list' && (
        <div className="flex-1 space-y-3">
          {[...tasks.todo, ...tasks.inProgress, ...tasks.done].length === 0 ? (
            <EmptyState title="Nenhuma tarefa" description="Crie sua primeira tarefa" />
          ) : (
            [...tasks.todo, ...tasks.inProgress, ...tasks.done].map((task) => (
              <TaskCard key={task.id} task={task} />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default TasksView;