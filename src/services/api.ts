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

  // Integrations
  importGoogle: () => http('/integrations/google/import', { method: 'POST' })
};

