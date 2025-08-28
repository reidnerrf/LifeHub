import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Flag, Trash2, CheckCircle2, Circle, Route } from 'lucide-react';

type Milestone = {
  id: string;
  title: string;
  done: boolean;
};

type Roadmap = {
  id: string;
  title: string;
  description?: string;
  milestones: Milestone[];
  createdAt: string;
};

const generateId = () => Math.random().toString(36).slice(2, 10);

const initialRoadmaps: Roadmap[] = [
  {
    id: 'm1',
    title: 'M1: Fundações + MVP',
    description: 'Infra, backend básico, telas principais e IA heurística',
    createdAt: new Date().toISOString(),
    milestones: [
      { id: 'm1-1', title: 'Infra & DevX (.gitignore, scripts, CI)', done: false },
      { id: 'm1-2', title: 'Backend Node + Mongo: User, Task, Note, Suggestion', done: false },
      { id: 'm1-3', title: 'Auth básica (JWT) + fallback X-User-Id', done: false },
      { id: 'm1-4', title: 'Onboarding + Login + Import stub', done: false },
      { id: 'm1-5', title: 'Dashboard: timeline, FAB, sugestões IA (stub)', done: false },
      { id: 'm1-6', title: 'Tarefas: lista/Kanban CRUD, tags/prioridade (UI)', done: false },
      { id: 'm1-7', title: 'Notas: CRUD + busca simples', done: false },
      { id: 'm1-8', title: 'Foco: Pomodoro 25/5 + sessões do dia', done: false },
      { id: 'm1-9', title: 'Configurações: usuário, import Google (stub), premium modal', done: false },
      { id: 'm1-10', title: 'IA v1: /ai/suggestions, /ai/score-planning, /ai/reschedule', done: false },
      { id: 'm1-11', title: 'Web+backend local; persistência por usuário', done: false },
      { id: 'm1-12', title: 'Métricas: latência API, erros, uso IA', done: false }
    ]
  },
  {
    id: 'm2',
    title: 'M2: Agenda, Hábitos, Finanças leves',
    description: 'Agenda completa, hábitos, finanças e IA melhorada',
    createdAt: new Date().toISOString(),
    milestones: [
      { id: 'm2-1', title: 'Agenda: mês/semana/dia (UI)', done: false },
      { id: 'm2-2', title: 'Sync Google leitura (OAuth stub→real)', done: false },
      { id: 'm2-3', title: 'Alertas “sair em 20min” (simulado)', done: false },
      { id: 'm2-4', title: 'Hábitos: CRUD + check-ins humor/energia/sono', done: false },
      { id: 'm2-5', title: 'Relatórios hábitos x produtividade', done: false },
      { id: 'm2-6', title: 'Finanças: pagar/receber, lembretes, resumo mensal', done: false },
      { id: 'm2-7', title: 'IA v2: rescheduler melhorado e justificativas', done: false },
      { id: 'm2-8', title: 'Entregas: fluxos completos agenda/hábitos/finanças', done: false }
    ]
  },
  {
    id: 'm3',
    title: 'M3: IA avançada + Assistente',
    description: 'Time Orchestrator, RAG nas notas e assistente conversacional',
    createdAt: new Date().toISOString(),
    milestones: [
      { id: 'm3-1', title: 'Time Orchestrator: cruzar tarefas/eventos/hábitos/energia', done: false },
      { id: 'm3-2', title: 'Sugestão de horários ótimos + auto-rescheduler 1-toque', done: false },
      { id: 'm3-3', title: '“Você tem 30min livres → adiantar X?”', done: false },
      { id: 'm3-4', title: 'Aprendizado contínuo de preferências e variação semanal', done: false },
      { id: 'm3-5', title: 'RAG nas notas: embeddings, busca semântica, links e resumos', done: false },
      { id: 'm3-6', title: 'Assistente conversacional: criar/planejar por texto/voz', done: false },
      { id: 'm3-7', title: 'Entregas: IA com justificativas; insights semanais', done: false }
    ]
  },
  {
    id: 'm4',
    title: 'M4: Gamificação, i18n e polimento',
    description: 'Gamificação, internacionalização, notificações e observabilidade',
    createdAt: new Date().toISOString(),
    milestones: [
      { id: 'm4-1', title: 'Gamificação: pontos, medalhas, quests semanais', done: false },
      { id: 'm4-2', title: 'Internacionalização e multi-idioma', done: false },
      { id: 'm4-3', title: 'Notificações inteligentes (pontaria de horário)', done: false },
      { id: 'm4-4', title: 'Integrações adicionais (Outlook, Trello/CSV)', done: false },
      { id: 'm4-5', title: 'Paywall/vitalício, trial 7–14 dias, bundle anual', done: false },
      { id: 'm4-6', title: 'Observabilidade (Sentry, OTel), privacidade local-first', done: false }
    ]
  }
];

const RoadmapsView: React.FC = () => {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>(() => {
    try {
      const saved = localStorage.getItem('roadmaps');
      if (saved) return JSON.parse(saved) as Roadmap[];
    } catch {}
    return initialRoadmaps;
  });
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const handleAddRoadmap = () => {
    if (!newTitle.trim()) return;
    const next: Roadmap = {
      id: generateId(),
      title: newTitle.trim(),
      description: newDescription.trim() || undefined,
      milestones: [],
      createdAt: new Date().toISOString(),
    };
    setRoadmaps(prev => [next, ...prev]);
    setNewTitle('');
    setNewDescription('');
  };

  const handleDeleteRoadmap = (id: string) => {
    setRoadmaps(prev => prev.filter(r => r.id !== id));
  };

  const handleAddMilestone = (roadmapId: string, title: string) => {
    if (!title.trim()) return;
    setRoadmaps(prev => prev.map(r => {
      if (r.id !== roadmapId) return r;
      const milestone: Milestone = { id: generateId(), title: title.trim(), done: false };
      return { ...r, milestones: [...r.milestones, milestone] };
    }));
  };

  const handleToggleMilestone = (roadmapId: string, milestoneId: string) => {
    setRoadmaps(prev => prev.map(r => {
      if (r.id !== roadmapId) return r;
      return {
        ...r,
        milestones: r.milestones.map(m => m.id === milestoneId ? { ...m, done: !m.done } : m)
      };
    }));
  };

  const handleDeleteMilestone = (roadmapId: string, milestoneId: string) => {
    setRoadmaps(prev => prev.map(r => {
      if (r.id !== roadmapId) return r;
      return { ...r, milestones: r.milestones.filter(m => m.id !== milestoneId) };
    }));
  };

  // persist
  useEffect(() => {
    try {
      localStorage.setItem('roadmaps', JSON.stringify(roadmaps));
    } catch {}
  }, [roadmaps]);

  const ProgressBar: React.FC<{ value: number }> = ({ value }) => (
    <div className="w-full h-2 bg-[var(--app-light-gray)] rounded-full overflow-hidden">
      <div
        className="h-full bg-[var(--app-blue)] transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );

  return (
    <div className="mobile-container pb-28">
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--app-blue)', color: 'white' }}>
            <Route size={20} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-[var(--app-text)]">Roadmaps</h1>
            <p className="text-[var(--app-text-light)] text-sm">Planeje metas e acompanhe o progresso</p>
          </div>
        </div>
      </div>

      <div className="px-4">
        <div className="p-4 border border-[var(--app-light-gray)] bg-[var(--app-card)] rounded-2xl space-y-3">
          <input
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="Título do roadmap"
            className="w-full p-3 rounded-xl border border-[var(--app-light-gray)] bg-transparent outline-none focus:ring-2 focus:ring-[var(--app-blue)]"
          />
          <textarea
            value={newDescription}
            onChange={e => setNewDescription(e.target.value)}
            placeholder="Descrição (opcional)"
            rows={2}
            className="w-full p-3 rounded-xl border border-[var(--app-light-gray)] bg-transparent outline-none focus:ring-2 focus:ring-[var(--app-blue)] resize-none"
          />
          <button
            onClick={handleAddRoadmap}
            className="w-full flex items-center justify-center space-x-2 p-3 rounded-xl bg-[var(--app-blue)] text-white hover:opacity-95 transition"
          >
            <Plus size={18} />
            <span>Adicionar Roadmap</span>
          </button>
        </div>
      </div>

      <div className="px-4 mt-6 space-y-4">
        {roadmaps.length === 0 && (
          <div className="text-center text-[var(--app-text-light)] text-sm">
            Nenhum roadmap ainda. Crie o primeiro para começar.
          </div>
        )}

        {roadmaps.map((r) => {
          const total = r.milestones.length || 1;
          const done = r.milestones.filter(m => m.done).length;
          const progress = Math.round((done / total) * 100);
          const [milestoneTitle, setMilestoneTitle] = useState('');

          return (
            <div key={r.id} className="p-4 border border-[var(--app-light-gray)] bg-[var(--app-card)] rounded-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-[var(--app-text)]">{r.title}</h3>
                  {r.description && (
                    <p className="text-sm text-[var(--app-text-light)] mt-1">{r.description}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteRoadmap(r.id)}
                  className="p-2 rounded-xl text-[var(--app-text-light)] hover:bg-[var(--app-light-gray)]"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--app-text-light)]">Progresso</span>
                  <span className="text-[var(--app-text)] font-medium">{progress}%</span>
                </div>
                <ProgressBar value={progress} />
              </div>

              <div className="mt-4">
                {r.milestones.length === 0 && (
                  <div className="text-sm text-[var(--app-text-light)]">Sem marcos ainda</div>
                )}
                <div className="space-y-2">
                  {r.milestones.map(m => (
                    <div key={m.id} className="flex items-center justify-between p-2 rounded-xl border border-[var(--app-light-gray)]">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleToggleMilestone(r.id, m.id)}
                          className="p-2 rounded-lg hover:bg-[var(--app-light-gray)]"
                        >
                          {m.done ? (
                            <CheckCircle2 size={18} className="text-[var(--app-green)]" />
                          ) : (
                            <Circle size={18} className="text-[var(--app-gray)]" />
                          )}
                        </button>
                        <span className={`text-sm ${m.done ? 'line-through opacity-70' : ''}`}>{m.title}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteMilestone(r.id, m.id)}
                        className="p-2 rounded-lg hover:bg-[var(--app-light-gray)]"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <MilestoneAdder onAdd={(title) => handleAddMilestone(r.id, title)} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

const MilestoneAdder: React.FC<{ onAdd: (title: string) => void }> = ({ onAdd }) => {
  const [title, setTitle] = useState('');
  const canAdd = title.trim().length > 0;

  const handleSubmit = () => {
    if (!canAdd) return;
    onAdd(title.trim());
    setTitle('');
  };

  return (
    <div className="mt-3 flex items-center space-x-2">
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Novo marco"
        className="flex-1 p-2 rounded-xl border border-[var(--app-light-gray)] bg-transparent outline-none focus:ring-2 focus:ring-[var(--app-blue)]"
      />
      <button
        onClick={handleSubmit}
        className={`px-3 py-2 rounded-xl text-sm text-white transition ${canAdd ? 'bg-[var(--app-blue)] hover:opacity-95' : 'bg-[var(--app-gray)] opacity-60 cursor-not-allowed'}`}
        disabled={!canAdd}
      >
        <Plus size={16} />
      </button>
    </div>
  );
};

export default RoadmapsView;

