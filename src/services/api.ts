import AsyncStorage from '@react-native-async-storage/async-storage';

let TOKEN: string | null = null;
export async function setAuth(token: string | null) {
  TOKEN = token;
  if (token) await AsyncStorage.setItem('token', token); else await AsyncStorage.removeItem('token');
}

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

async function http(path: string, opts: RequestInit = {}): Promise<any> {
  const headers: any = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  if (!TOKEN) TOKEN = await AsyncStorage.getItem('token');
  if (TOKEN) headers['Authorization'] = `Bearer ${TOKEN}`;
  const res = await fetch(`${BASE_URL}${path}`, { ...opts, headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  if (res.status === 204) return undefined;
  return await res.json();
}

export const api = {
  register: (payload: { email: string; password: string; name?: string }) => http('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload: { email: string; password: string }) => http('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  listTasks: () => http('/tasks'),
  createTask: (data: any) => http('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id: string, data: any) => http(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteTask: (id: string) => http(`/tasks/${id}`, { method: 'DELETE' }),
  listNotes: () => http('/notes'),
  createNote: (data: any) => http('/notes', { method: 'POST', body: JSON.stringify(data) }),
  updateNote: (id: string, data: any) => http(`/notes/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteNote: (id: string) => http(`/notes/${id}`, { method: 'DELETE' }),
  listSuggestions: () => http('/ai/suggestions'),
  scorePlanning: (payload: any) => http('/ai/score-planning', { method: 'POST', body: JSON.stringify(payload) }),

  // Voice commands
  voiceCommand: (payload: { text: string; locale?: string }) => http('/assistant/voice/command', { method: 'POST', body: JSON.stringify(payload) }),
  
  // Timeline unificada
  listTodayItems: () => http('/today/items'),
  
  // Events
  listEvents: () => http('/events'),
  createEvent: (data: any) => http('/events', { method: 'POST', body: JSON.stringify(data) }),
  updateEvent: (id: string, data: any) => http(`/events/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteEvent: (id: string) => http(`/events/${id}`, { method: 'DELETE' }),

  // Integrations - Trello
  trelloBoards: () => http('/integrations/trello/boards'),
  trelloLists: (boardId: string) => http(`/integrations/trello/boards/${boardId}/lists`),
  trelloImport: (payload: { boardId: string; listId?: string }) => http('/integrations/trello/import', { method: 'POST', body: JSON.stringify(payload) }),

  // Integrations - Asana
  asanaWorkspaces: () => http('/integrations/asana/workspaces'),
  asanaProjects: (workspaceId: string) => http(`/integrations/asana/workspaces/${workspaceId}/projects`),
  asanaImport: (payload: { workspaceId: string; projectId?: string; includeSubtasks?: boolean }) => http('/integrations/asana/import', { method: 'POST', body: JSON.stringify(payload) }),

  // OAuth2 stubs
  oauthAuthorizeUrl: (provider: string) => http(`/oauth/${provider}/authorize`),
  oauthCallback: (provider: string, payload: { code: string }) => http(`/oauth/${provider}/callback`, { method: 'POST', body: JSON.stringify(payload) }),
};

