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
};

