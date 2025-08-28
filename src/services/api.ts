let TOKEN: string | null = null;
let USER_ID: string | null = null;
export function setAuth(token: string | null) { TOKEN = token; }
export function setUserId(id: string | null) { USER_ID = id; }

const BASE_URL = (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_API_URL) || 'http://localhost:4000';

async function http(path: string, opts: RequestInit = {}): Promise<any> {
  const headers: any = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  if (TOKEN) headers['Authorization'] = `Bearer ${TOKEN}`;
  if (USER_ID && !TOKEN) headers['x-user-id'] = USER_ID;
  const res = await fetch(`${BASE_URL}${path}`, { ...opts, headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  if (res.status === 204) return undefined;
  return await res.json();
}

export const api = {
  // Auth
  register: (payload: { email: string; password: string; name?: string }) => http('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload: { email: string; password: string }) => http('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  // Subscriptions (stubs)
  createCheckout: (payload: { plan: 'monthly'|'annual'|'lifetime'|'trial' }) => Promise.resolve({ url: '#' }),

  // Tasks
  listTasks: () => http('/tasks'),
  createTask: (data: any) => http('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id: string, data: any) => http(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteTask: (id: string) => http(`/tasks/${id}`, { method: 'DELETE' }),

  // Notes
  listNotes: () => http('/notes'),
  createNote: (data: any) => http('/notes', { method: 'POST', body: JSON.stringify(data) }),
  updateNote: (id: string, data: any) => http(`/notes/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteNote: (id: string) => http(`/notes/${id}`, { method: 'DELETE' }),

  // AI
  listSuggestions: () => http('/ai/suggestions'),
  scorePlanning: (payload: any) => http('/ai/score-planning', { method: 'POST', body: JSON.stringify(payload) }),
  reschedule: (payload: any) => http('/ai/reschedule', { method: 'POST', body: JSON.stringify(payload) }),
  predictDuration: (payload: any) => http('/ai/predict-duration', { method: 'POST', body: JSON.stringify(payload) }),

  // Integrations
  importGoogle: () => http('/integrations/google/import', { method: 'POST' }),
  googleAuthUrl: () => http('/integrations/google/auth-url'),
  googleOauthCallback: (payload: { code: string; redirectUri?: string }) => http('/integrations/google/oauth/callback', { method: 'POST', body: JSON.stringify(payload) }),
  googleEvents: () => http('/integrations/google/events'),
  outlookAuthUrl: () => http('/integrations/outlook/auth-url'),
  outlookImport: () => http('/integrations/outlook/import', { method: 'POST' }),
  trelloImport: (payload: { csvUrl?: string; items?: any[] }) => http('/integrations/trello/import', { method: 'POST', body: JSON.stringify(payload) }),

  // Orchestrator
  orchestrateSchedule: (payload: any) => http('/orchestrator/schedule', { method: 'POST', body: JSON.stringify(payload) }),
  orchestrateReschedule: (payload: any) => http('/orchestrator/reschedule', { method: 'POST', body: JSON.stringify(payload) }),
  findOpportunities: (minutes: number) => http(`/orchestrator/opportunities?minutes=${encodeURIComponent(minutes)}`),
  idealWeek: (payload: any) => http('/ai/ideal-week', { method: 'POST', body: JSON.stringify(payload) }),

  // Notifications targeting
  nextNotificationWindow: (payload: any) => http('/notifications/next-window', { method: 'POST', body: JSON.stringify(payload) }),

  // RAG
  notesSemanticSearch: (payload: { query: string }) => http('/rag/notes/search', { method: 'POST', body: JSON.stringify(payload) }),
  notesSummarize: (payload: { noteId: string }) => http('/rag/notes/summarize', { method: 'POST', body: JSON.stringify(payload) }),

  // Reports
  weeklyInsights: () => http('/reports/weekly-insights'),
  weeklyDispatch: () => http('/reports/weekly/dispatch', { method: 'POST' }),

  // Assistant
  planWeek: (payload: any) => http('/assistant/plan-week', { method: 'POST', body: JSON.stringify(payload) }),
  ritualPreDeepWork: (payload: any) => http('/assistant/ritual/pre-deep-work', { method: 'POST', body: JSON.stringify(payload) }),
  ritualsSuggestions: () => http('/rituals/suggestions'),

  // Check-ins
  createCheckin: (data: any) => http('/checkins', { method: 'POST', body: JSON.stringify(data) }),

  // Gamification
  getStats: () => http('/gamification/stats'),
  // Routes/Transit
  estimateRoute: (payload: { from: string; to: string; mode?: 'driving'|'transit' }) => http('/integrations/routes/estimate', { method: 'POST', body: JSON.stringify(payload) }),

  // Health
  digitalHealth: () => http('/health/digital'),

  // Automations
  createAutomationHook: (payload: any) => http('/automations/hooks', { method: 'POST', body: JSON.stringify(payload) }),

  // Modes
  modesPresets: () => http('/modes/presets'),

  // Notion/Slack/Wearables
  notionSync: (payload: any) => http('/integrations/notion/sync', { method: 'POST', body: JSON.stringify(payload) }),
  slackStatus: (payload: { status: string }) => http('/integrations/slack/status', { method: 'POST', body: JSON.stringify(payload) }),
  wearablesSummary: () => http('/integrations/wearables/summary'),

  // Referrals
  createReferral: () => http('/referrals/create', { method: 'POST' }),
  redeemReferral: (payload: { code: string }) => http('/referrals/redeem', { method: 'POST', body: JSON.stringify(payload) }),
  getAchievements: () => http('/gamification/achievements'),
  completeTask: (taskId: string) => http('/gamification/complete-task', { method: 'POST', body: JSON.stringify({ taskId }) }),
  getQuests: () => http('/gamification/quests'),
  progressQuest: (id: string, delta = 1) => http(`/gamification/quests/${id}/progress`, { method: 'POST', body: JSON.stringify({ delta }) }),
  refreshQuests: () => http('/gamification/quests/refresh', { method: 'POST' })
};

