import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose, { Schema, model } from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pino from 'pino';
import * as Sentry from '@sentry/node';

dotenv.config();
const logger = pino({ transport: { target: 'pino-pretty' } });
const app = express();
app.use(cors());
app.use(express.json());

// Sentry (Observability)
if (process.env.SENTRY_DSN) {
  Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 0.1 });
  app.use(Sentry.Handlers.requestHandler());
}

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/lifehub';
mongoose.connect(MONGO_URL).then(() => logger.info('Mongo connected')).catch((err) => {
  logger.error(err);
  process.exit(1);
});

// Models
const UserSchema = new Schema({
  email: { type: String, unique: true, index: true },
  passwordHash: { type: String, required: true },
  name: { type: String }
}, { timestamps: true });
const TaskSchema = new Schema({
  userId: { type: String, index: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'in_progress', 'completed', 'cancelled'], default: 'pending' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  tags: [{ type: String }],
  subtasks: [{
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],
  dueDate: { type: Date },
  estimatedDuration: { type: Number }, // em minutos
  actualDuration: { type: Number }, // em minutos
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });
const NoteSchema = new Schema({
  userId: { type: String, index: true },
  title: { type: String, required: true },
  content: { type: String, default: '' },
  tags: [{ type: String }],
}, { timestamps: true });
const SuggestionSchema = new Schema({
  userId: { type: String, index: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  kind: { type: String, default: 'generic' },
  metadata: { type: Schema.Types.Mixed },
}, { timestamps: true });

// Additional core models
const EventSchema = new Schema({
  userId: { type: String, index: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  location: { type: String },
  type: { type: String, enum: ['event', 'task', 'meeting', 'reminder'], default: 'event' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  tags: [{ type: String }],
  isAllDay: { type: Boolean, default: false },
  recurrence: {
    type: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly'] },
    interval: { type: Number, default: 1 },
    endDate: { type: Date }
  },
  reminders: [{
    type: { type: String, enum: ['push', 'email', 'sms'], default: 'push' },
    minutesBefore: { type: Number, required: true },
    message: { type: String }
  }],
  externalId: { type: String }, // Para sincronização com Google/Outlook
  externalSource: { type: String, enum: ['google', 'outlook', 'local'], default: 'local' },

  source: { type: String, default: 'local' }
}, { timestamps: true });

const HabitSchema = new Schema({
  userId: { type: String, index: true },
  name: { type: String, required: true },
  schedule: { type: String, default: 'daily' },
  target: { type: Number, default: 1 }
}, { timestamps: true });


const PomodoroSessionSchema = new Schema({
  userId: { type: String, index: true },
  taskTitle: { type: String, default: '' },
  status: { type: String, enum: ['active', 'paused', 'completed'], default: 'active' },
  duration: { type: Number, default: 25 }, // minutos
  remainingTime: { type: Number, default: 25 },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const CheckinSchema = new Schema({
  userId: { type: String, index: true },
  habitId: { type: String, index: true },
  date: { type: Date, required: true },
  mood: { type: Number },
  energy: { type: Number },
  sleepHours: { type: Number }
}, { timestamps: true });

const TransactionSchema = new Schema({
  userId: { type: String, index: true },
  type: { type: String, enum: ['payable','receivable'], required: true },
  amount: { type: Number, required: true },
  dueDate: { type: Date },
  description: { type: String }
}, { timestamps: true });

const UserStatsSchema = new Schema({
  userId: { type: String, index: true },
  points: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  streakDays: { type: Number, default: 0 },
  achievements: [{ type: String }],
  lastActivity: { type: Date, default: Date.now }
}, { timestamps: true });

const AchievementSchema = new Schema({
  userId: { type: String, index: true },
  type: { type: String, required: true }, // 'task_completion', 'habit_streak', 'focus_session', etc.
  title: { type: String, required: true },
  description: { type: String, required: true },
  points: { type: Number, required: true },
  unlockedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const User = model('User', UserSchema);
const Task = model('Task', TaskSchema);
const Note = model('Note', NoteSchema);
const Suggestion = model('Suggestion', SuggestionSchema);
const Event = model('Event', EventSchema);
const Habit = model('Habit', HabitSchema);

const PomodoroSession = model('PomodoroSession', PomodoroSessionSchema);

const Checkin = model('Checkin', CheckinSchema);
const Transaction = model('Transaction', TransactionSchema);
const UserStats = model('UserStats', UserStatsSchema);
const Achievement = model('Achievement', AchievementSchema);

// Google OAuth token storage
const GoogleAuthSchema = new Schema({
  userId: { type: String, index: true, unique: true },
  accessToken: { type: String },
  refreshToken: { type: String },
  expiryDate: { type: Date },
  scope: { type: String }
}, { timestamps: true });
const GoogleAuth = model('GoogleAuth', GoogleAuthSchema);

// Weekly Quests
const WeeklyQuestSchema = new Schema({
  userId: { type: String, index: true },
  title: { type: String, required: true },
  target: { type: Number, default: 1 },
  progress: { type: Number, default: 0 },
  rewardPoints: { type: Number, default: 50 },
  weekStart: { type: Date, required: true },
  completed: { type: Boolean, default: false }
}, { timestamps: true });
const WeeklyQuest = model('WeeklyQuest', WeeklyQuestSchema);


// Auth
const authMiddleware = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization as string | undefined;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
  try {
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'devsecret') as any;
      req.userId = decoded.sub;
    }
  } catch {}
  // fallback X-User-Id header
  if (!req.userId && req.headers['x-user-id']) {
    req.userId = String(req.headers['x-user-id']);
  }
  if (!req.userId) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  next();
};

app.post('/auth/register', async (req, res) => {
  const { email, password, name } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ error: 'email already registered' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, passwordHash, name });
  const token = jwt.sign({}, process.env.JWT_SECRET || 'devsecret', { subject: String(user._id) });
  res.status(201).json({ token, user: { id: user._id, email: user.email, name: user.name } });
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'invalid credentials' });
  const token = jwt.sign({}, process.env.JWT_SECRET || 'devsecret', { subject: String(user._id) });
  res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
});

app.use(authMiddleware);

// Routes
app.get('/health', (_req, res) => res.json({ ok: true }));

// Tasks CRUD
app.get('/tasks', async (req: any, res) => {
  const userId = String(req.userId);
  res.json(await Task.find({ userId }).sort({ createdAt: -1 }));
});
app.post('/tasks', async (req: any, res) => {
  const userId = String(req.userId);
  const t = await Task.create({ ...req.body, userId });
  res.status(201).json(t);
});
app.patch('/tasks/:id', async (req, res) => {
  const t = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(t);
});
app.delete('/tasks/:id', async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

// Notes CRUD
app.get('/notes', async (req: any, res) => {
  const userId = String(req.userId);
  res.json(await Note.find({ userId }).sort({ createdAt: -1 }));
});
app.post('/notes', async (req: any, res) => {
  const userId = String(req.userId);
  const n = await Note.create({ ...req.body, userId });
  res.status(201).json(n);
});
app.patch('/notes/:id', async (req, res) => {
  const n = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(n);
});
app.delete('/notes/:id', async (req, res) => {
  await Note.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

// Suggestions CRUD
app.get('/suggestions', async (req: any, res) => {
  const userId = String(req.userId);
  res.json(await Suggestion.find({ userId }).sort({ createdAt: -1 }));
});
app.post('/suggestions', async (req: any, res) => {
  const userId = String(req.userId);
  const s = await Suggestion.create({ ...req.body, userId });
  res.status(201).json(s);
});
app.patch('/suggestions/:id', async (req, res) => {
  const s = await Suggestion.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(s);
});
app.delete('/suggestions/:id', async (req, res) => {
  await Suggestion.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

// Check-ins CRUD
app.get('/checkins', async (req: any, res) => {
  const userId = String(req.userId);
  res.json(await Checkin.find({ userId }).sort({ createdAt: -1 }));
});
app.post('/checkins', async (req: any, res) => {
  const userId = String(req.userId);
  const c = await Checkin.create({ ...req.body, userId });
  
  // Award points for daily check-in
  await awardPoints(userId, 10, 'Daily check-in completed');
  
  res.status(201).json(c);
});

// Gamification functions
async function awardPoints(userId: string, points: number, reason: string) {
  let stats = await UserStats.findOne({ userId });
  if (!stats) {
    stats = await UserStats.create({ userId, points: 0, level: 1, streakDays: 0 });
  }
  
  stats.points += points;
  stats.lastActivity = new Date();
  
  // Level up logic
  const newLevel = Math.floor(stats.points / 100) + 1;
  if (newLevel > stats.level) {
    stats.level = newLevel;
    await Achievement.create({
      userId,
      type: 'level_up',
      title: `Nível ${newLevel}`,
      description: `Parabéns! Você alcançou o nível ${newLevel}`,
      points: 50
    });
  }
  
  await stats.save();
  return stats;
}

async function checkAchievements(userId: string) {
  const stats = await UserStats.findOne({ userId });
  if (!stats) return;
  
  // Check for various achievements
  const achievements = [];
  
  // Task completion achievements
  const completedTasks = await Task.countDocuments({ userId, completed: true });
  if (completedTasks >= 10 && !stats.achievements.includes('task_master_10')) {
    achievements.push({
      type: 'task_completion',
      title: 'Mestre das Tarefas',
      description: 'Completou 10 tarefas',
      points: 25
    });
    stats.achievements.push('task_master_10');
  }
  
  // Habit streak achievements
  if (stats.streakDays >= 7 && !stats.achievements.includes('habit_streak_7')) {
    achievements.push({
      type: 'habit_streak',
      title: 'Semana Consistente',
      description: 'Manteve hábitos por 7 dias seguidos',
      points: 50
    });
    stats.achievements.push('habit_streak_7');
  }
  
  // Create achievements
  for (const achievement of achievements) {
    await Achievement.create({ userId, ...achievement });
  }
  
  if (achievements.length > 0) {
    await stats.save();
  }
  
  return achievements;
}

// AI suggestions (stub)
app.get('/ai/suggestions', (_req, res) => {
  res.json([
    { id: 's1', title: 'Você tem 30min livres', description: 'Deseja adiantar a tarefa X?' },
    { id: 's2', title: 'Bloco de foco recomendado', description: 'Seu pico de energia é agora.' }
  ]);
});

// AI planning score
app.post('/ai/score-planning', (req, res) => {
  const { totalTasks = 0, conflictingEvents = 0, overbookedMinutes = 0, freeBlocks = [] } = req.body || {};
  const insights: string[] = [];
  let score = 100;
  if (conflictingEvents > 0) {
    score -= Math.min(30, conflictingEvents * 10);
    insights.push('Há conflitos na agenda. Considere mover eventos.');
  }
  if (overbookedMinutes > 30) {
    score -= Math.min(40, Math.floor(overbookedMinutes / 15) * 5);
    insights.push('Dia superlotado. Adicione folgas.');
  }
  if (!freeBlocks || freeBlocks.length === 0) {
    score -= 20;
    insights.push('Sem blocos livres planejados.');
  }
  if (totalTasks > 12) {
    score -= 10;
    insights.push('Muitas tarefas no dia. Priorize as críticas.');
  }
  score = Math.max(0, Math.min(100, score));
  res.json({ score, insights });
});

// AI reschedule (very simple heuristic)
app.post('/ai/reschedule', (req, res) => {
  const { tasks = [], freeBlocks = [] } = req.body || {};
  const suggestions = [] as Array<{ taskId: string; suggestedStart: string; suggestedEnd: string; reason: string }>;
  const paddingPct = 0.15; // padding inteligente 15%
  const now = new Date();
  for (const task of tasks) {
    const block = freeBlocks[0];
    if (!block) break;
    const start = new Date(block.start || now);
    const baseDurMin = task.durationMin || 30;
    const durWithPadding = Math.round(baseDurMin * (1 + paddingPct));
    const end = new Date(start.getTime() + durWithPadding * 60000);
    let reason = 'Alocado no primeiro bloco livre';
    // Explainable factors: energy and free time
    reason += ` • padding ${Math.round(paddingPct*100)}%`;
    reason += ` • energia: média recente`;
    reason += ` • tempo livre: ${Math.round((new Date(block.end || end).getTime() - start.getTime())/60000)}min`;
    suggestions.push({ taskId: String(task.id), suggestedStart: start.toISOString(), suggestedEnd: end.toISOString(), reason });
  }
  res.json({ suggestions });
});

// Google OAuth endpoints
app.get('/integrations/google/auth-url', async (req: any, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (!clientId || !redirectUri) return res.status(500).json({ error: 'google oauth not configured' });
  const scope = encodeURIComponent('https://www.googleapis.com/auth/calendar.readonly');
  const state = Math.random().toString(36).slice(2);
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&access_type=offline&include_granted_scopes=true&prompt=consent&state=${state}`;
  res.json({ url, state });
});

app.post('/integrations/google/oauth/callback', async (req: any, res) => {
  const { code, redirectUri } = req.body || {};
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const finalRedirect = redirectUri || process.env.GOOGLE_REDIRECT_URI;
  if (!code || !clientId || !clientSecret || !finalRedirect) return res.status(400).json({ error: 'missing oauth config or code' });
  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: finalRedirect,
        grant_type: 'authorization_code'
      }) as any
    } as any);
    if (!tokenRes.ok) {
      const t = await tokenRes.text();
      return res.status(400).json({ error: 'token_exchange_failed', details: t });
    }
    const json = await tokenRes.json() as any;
    const expiresIn = json.expires_in ? Number(json.expires_in) : 3600;
    const expiryDate = new Date(Date.now() + expiresIn * 1000);
    await GoogleAuth.findOneAndUpdate(
      { userId: String(req.userId) },
      { accessToken: json.access_token, refreshToken: json.refresh_token, expiryDate, scope: json.scope },
      { upsert: true, new: true }
    );
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: 'oauth_callback_error', details: String(e?.message || e) });
  }
});

// Optional GET callback to finalize OAuth via browser redirect
app.get('/oauth/google/callback', async (req: any, res) => {
  const { code } = req.query || {};
  if (!code) return res.status(400).send('Missing code');
  // Store code temporarily in memory is not ideal; better to exchange here if user-bound.
  // For demo, redirect front with code in hash for client to POST to backend.
  const frontend = process.env.FRONTEND_URL || 'http://localhost:5173';
  res.redirect(`${frontend}/#google_code=${encodeURIComponent(String(code))}`);
});

async function getValidAccessToken(userId: string) {
  const doc = await GoogleAuth.findOne({ userId });
  if (!doc) return null;
  const clientId = process.env.GOOGLE_CLIENT_ID as string;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET as string;
  if (!doc.expiryDate || doc.expiryDate.getTime() - Date.now() > 60 * 1000) {
    return doc.accessToken;
  }
  if (!doc.refreshToken) return doc.accessToken;
  const refreshRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: doc.refreshToken,
      grant_type: 'refresh_token'
    }) as any
  } as any);
  if (!refreshRes.ok) return doc.accessToken;
  const json = await refreshRes.json() as any;
  const expiresIn = json.expires_in ? Number(json.expires_in) : 3600;
  doc.accessToken = json.access_token || doc.accessToken;
  doc.expiryDate = new Date(Date.now() + expiresIn * 1000);
  await doc.save();
  return doc.accessToken;
}

app.get('/integrations/google/events', async (req: any, res) => {
  try {
    const token = await getValidAccessToken(String(req.userId));
    if (!token) return res.status(400).json({ error: 'not_connected' });
    const timeMin = new Date().toISOString();
    const timeMax = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime`;
    const resp = await fetch(url, { headers: { Authorization: `Bearer ${token}` } } as any);
    if (!resp.ok) {
      const txt = await resp.text();
      return res.status(400).json({ error: 'google_api_error', details: txt });
    }
    const json = await resp.json() as any;
    const events = (json.items || []).map((it: any) => ({ id: it.id, title: it.summary, start: it.start?.dateTime || it.start?.date, end: it.end?.dateTime || it.end?.date, location: it.location }));
    res.json({ events });
  } catch (e: any) {
    res.status(500).json({ error: 'list_events_error', details: String(e?.message || e) });
  }
});

app.post('/integrations/google/import', async (req: any, res) => {
  try {
    const token = await getValidAccessToken(String(req.userId));
    if (!token) return res.status(400).json({ error: 'not_connected' });
    const timeMin = new Date().toISOString();
    const timeMax = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime`;
    const resp = await fetch(url, { headers: { Authorization: `Bearer ${token}` } } as any);
    if (!resp.ok) {
      const txt = await resp.text();
      return res.status(400).json({ error: 'google_api_error', details: txt });
    }
    const json = await resp.json() as any;
    const items = (json.items || []).map((it: any) => ({
      userId: String(req.userId),
      title: it.summary || 'Evento',
      start: new Date(it.start?.dateTime || it.start?.date || Date.now()),
      end: new Date(it.end?.dateTime || it.end?.date || Date.now()),
      location: it.location,
      source: 'google'
    }));
    await Event.insertMany(items, { ordered: false }).catch(() => {});
    res.json({ imported: items.length, status: 'ok' });
  } catch (e: any) {
    res.status(500).json({ error: 'import_error', details: String(e?.message || e) });
  }
});

// Outlook (stub)
app.get('/integrations/outlook/auth-url', async (_req: any, res) => {
  res.json({ url: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize?...' });
});
app.post('/integrations/outlook/import', async (_req: any, res) => {
  res.json({ imported: 3, status: 'ok' });
});

// Trello / CSV import (stub)
app.post('/integrations/trello/import', async (req: any, res) => {
  const { csvUrl, items } = req.body || {};
  const imported = items ? items.length : (csvUrl ? 10 : 0);
  res.json({ imported, status: 'ok' });
});

// Gamification: Weekly Quests endpoints
function getWeekStart(d = new Date()) {
  const date = new Date(d);
  const day = date.getDay();
  date.setHours(0,0,0,0);
  date.setDate(date.getDate() - day); // sunday start
  return date;
}

app.get('/gamification/quests', async (req: any, res) => {
  const userId = String(req.userId);
  const weekStart = getWeekStart();
  let quests = await WeeklyQuest.find({ userId, weekStart });
  if (quests.length === 0) {
    quests = await WeeklyQuest.insertMany([
      { userId, title: 'Concluir 5 tarefas', target: 5, progress: 0, rewardPoints: 50, weekStart },
      { userId, title: '3 sessões de foco', target: 3, progress: 0, rewardPoints: 40, weekStart },
      { userId, title: 'Check-ins 4 dias', target: 4, progress: 0, rewardPoints: 30, weekStart },
    ]);
  }
  res.json(quests);
});

app.post('/gamification/quests/:id/progress', async (req: any, res) => {
  const userId = String(req.userId);
  const q = await WeeklyQuest.findOne({ _id: req.params.id, userId });
  if (!q) return res.status(404).json({ error: 'not_found' });
  q.progress = Math.min(q.target, q.progress + (Number(req.body.delta) || 1));
  if (q.progress >= q.target && !q.completed) {
    q.completed = true;
    await awardPoints(userId, q.rewardPoints, 'Quest complete');
  }
  await q.save();
  res.json(q);
});

app.post('/gamification/quests/refresh', async (req: any, res) => {
  const userId = String(req.userId);
  const weekStart = getWeekStart();
  await WeeklyQuest.deleteMany({ userId, weekStart });
  const quests = await WeeklyQuest.insertMany([
    { userId, title: 'Concluir 5 tarefas', target: 5, progress: 0, rewardPoints: 50, weekStart },
    { userId, title: '3 sessões de foco', target: 3, progress: 0, rewardPoints: 40, weekStart },
    { userId, title: 'Check-ins 4 dias', target: 4, progress: 0, rewardPoints: 30, weekStart },
  ]);
  res.json(quests);
});

// Sentry error handler
if (process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.errorHandler());
}

// Enhanced Orchestrator with better heuristics
app.post('/orchestrator/schedule', async (req: any, res) => {
  const { tasks = [], events = [], freeBlocks = [], userPreferences = {} } = req.body || {};
  
  // Get recent check-ins for energy/mood patterns
  const recentCheckins = await Checkin.find({ userId: req.userId })
    .sort({ createdAt: -1 })
    .limit(7);
  
  const avgEnergy = recentCheckins.length > 0 
    ? recentCheckins.reduce((sum, c) => sum + (c.energy || 3), 0) / recentCheckins.length 
    : 3;
  
  const avgMood = recentCheckins.length > 0
    ? recentCheckins.reduce((sum, c) => sum + (c.mood || 3), 0) / recentCheckins.length
    : 3;

  // Score each task based on priority, energy requirements, and user patterns
  const scoredTasks = tasks.map((task: any) => {
    let score = 0;
    
    // Priority scoring
    if (task.priority === 'high') score += 30;
    else if (task.priority === 'medium') score += 20;
    else score += 10;
    
    // Energy alignment (complex tasks when energy is high)
    const taskComplexity = task.durationMin > 60 ? 'high' : task.durationMin > 30 ? 'medium' : 'low';
    if (taskComplexity === 'high' && avgEnergy >= 4) score += 20;
    else if (taskComplexity === 'medium' && avgEnergy >= 3) score += 15;
    else if (taskComplexity === 'low') score += 10;
    
    // Time of day preferences (morning person vs night owl)
    const hour = new Date().getHours();
    const isMorningPerson = userPreferences.morningPerson || false;
    if (isMorningPerson && hour < 12) score += 15;
    else if (!isMorningPerson && hour >= 14) score += 15;
    
    return { ...task, score };
  }).sort((a: any, b: any) => b.score - a.score);

  // Allocate tasks to best available slots
  const allocations = scoredTasks.map((task: any, idx: number) => {
    const block = freeBlocks[idx % Math.max(1, freeBlocks.length)] || {};
    const start = new Date(block.start || new Date());
    const end = new Date(start.getTime() + ((task.durationMin || 30) * 60000));
    
    let reason = 'Alocação otimizada';
    if (task.score >= 50) reason = 'Alta prioridade + energia ideal';
    else if (task.score >= 35) reason = 'Prioridade média + bom momento';
    else reason = 'Slot disponível';

    reason += ' • sono/energia considerados';
    reason += ' • padding 15%';
    return { 
      taskId: task.id, 
      start: start.toISOString(), 
      end: end.toISOString(), 
      reason,
      score: task.score
    };
  });
  
  res.json({ allocations, insights: { avgEnergy, avgMood } });
});

app.post('/orchestrator/reschedule', async (req, res) => {
  const { impactedTasks = [], nextBlocks = [] } = req.body || {};
  const suggestions = impactedTasks.slice(0, nextBlocks.length).map((t: any, i: number) => {
    const s = new Date(nextBlocks[i].start || new Date());
    const e = new Date(s.getTime() + ((t.durationMin || 30) * 60000));
    return { taskId: t.id, suggestedStart: s.toISOString(), suggestedEnd: e.toISOString(), reason: 'Reagendamento automático' };
  });
  res.json({ suggestions });
});

// AI: duration prediction + padding
app.post('/ai/predict-duration', async (req: any, res) => {
  const { task } = req.body || {};
  // naive: base on title length and historical average from completed tasks
  const hist = await Task.find({ userId: req.userId, completed: true }).limit(50);
  const avg = hist.length ? Math.round(hist.reduce((s: number, t: any) => s + (t.durationMin || 30), 0) / hist.length) : 30;
  const titleFactor = Math.min(60, Math.max(15, (task?.title?.length || 10)));
  const predicted = Math.round((avg + titleFactor) / 2);
  const withPadding = Math.round(predicted * 1.15);
  res.json({ predictedMin: predicted, withPaddingMin: withPadding, paddingPct: 0.15 });
});

// Rituals (transition)
app.get('/rituals/suggestions', (_req, res) => {
  res.json({
    postLunch: ['Respirar 2 min', 'Revisar 3 tarefas', 'Água + alongar'],
    endOfDay: ['Revisar conquistas', 'Planejar amanhã', 'Desconectar 30min']
  });
});

// Transit/Routes stub
app.post('/integrations/routes/estimate', (req, res) => {
  const { from, to, mode = 'driving' } = req.body || {};
  res.json({ from, to, mode, etaMin: mode === 'transit' ? 28 : 18 });
});

// Ideal Week stub
app.post('/ai/ideal-week', (req, res) => {
  const blocks = [
    { day: 'Seg', start: '09:00', end: '11:00', type: 'deep_work' },
    { day: 'Seg', start: '14:00', end: '15:00', type: 'meetings' }
  ];
  res.json({ blocks, guidance: 'Proteja 2 blocos de foco diários' });
});

// Digital health
app.get('/health/digital', async (req: any, res) => {
  const todayTasks = await Task.countDocuments({ userId: req.userId, completed: false });
  const overload = todayTasks > 12;
  res.json({ overload, suggestion: overload ? 'Agende descanso 15min e renegocie prazos' : 'Tudo sob controle' });
});

// Automations stub
app.post('/automations/hooks', (_req, res) => {
  res.json({ ok: true });
});

// Modes presets
app.get('/modes/presets', (_req, res) => {
  res.json({
    student: { focusBlocks: 3, reports: ['estudos'], widgets: ['iniciar foco'] },
    freelancer: { focusBlocks: 2, reports: ['clientes'], widgets: ['adicionar tarefa'] }
  });
});

// Integrations expand stubs
app.post('/integrations/notion/sync', (_req, res) => res.json({ synced: 5 }));
app.post('/integrations/slack/status', (_req, res) => res.json({ status: 'focusing', ok: true }));
app.get('/integrations/wearables/summary', (_req, res) => res.json({ steps: 8200, focusMinutes: 90 }));

// Referral
app.post('/referrals/create', (_req, res) => res.json({ code: 'LIFEHUB-FRIEND-123' }));
app.post('/referrals/redeem', (_req, res) => res.json({ ok: true, bonusDays: 30 }));

// Weekly summary stub
app.post('/reports/weekly/dispatch', (_req, res) => res.json({ sent: true }));

// Best day/time for scheduling (stub)
app.post('/ai/best-slot', async (req: any, res) => {
  const { durationMin = 30 } = req.body || {};
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()+1, 10, 0, 0);
  const end = new Date(start.getTime() + durationMin * 60000);
  res.json({ suggestedStart: start.toISOString(), suggestedEnd: end.toISOString(), reason: 'Menos conflitos + energia média alta' });
});

// Subscription cancel with pro-rated refund for annual (stub)
app.post('/billing/cancel', (req: any, res) => {
  const { plan, startedAt, amountAnnual } = req.body || {};
  if (plan !== 'annual') return res.json({ cancelled: true, refund: 0 });
  const start = new Date(startedAt || Date.now());
  const end = new Date(start.getFullYear()+1, start.getMonth(), start.getDate());
  const totalMs = end.getTime() - start.getTime();
  const remainingMs = Math.max(0, end.getTime() - Date.now());
  const ratio = remainingMs / totalMs;
  const refund = Math.round((amountAnnual || 14990) * ratio);
  res.json({ cancelled: true, refund });
});

// Voice Assistants Integration Stubs
function parseVoiceCommand(text: string) {
  const t = (text || '').toLowerCase();
  
  // Intents existentes
  if (t.includes('iniciar foco') || t.includes('start focus')) return { intent: 'start_focus' };
  if (t.startsWith('adicionar tarefa') || t.startsWith('add task')) {
    const title = t.replace(/^(adicionar tarefa|add task)/, '').trim();
    return { intent: 'add_task', title: title || 'Tarefa' };
  }
  if (t.includes('próximo evento') || t.includes('next event')) return { intent: 'next_event' };
  
  // Novos intents solicitados
  if (t.startsWith('adicionar nota') || t.startsWith('add note')) {
    const content = t.replace(/^(adicionar nota|add note)/, '').trim();
    return { intent: 'add_note', content: content || 'Nova nota' };
  }
  if (t.includes('iniciar pausa') || t.includes('start break')) return { intent: 'start_break' };
  if (t.includes('próxima tarefa') || t.includes('next task')) return { intent: 'next_task' };
  if (t.startsWith('adicionar evento') || t.startsWith('add event')) {
    const title = t.replace(/^(adicionar evento|add event)/, '').trim();
    return { intent: 'add_event', title: title || 'Novo evento' };
  }
  if (t.startsWith('adicionar hábito') || t.startsWith('add habit')) {
    const title = t.replace(/^(adicionar hábito|add habit)/, '').trim();
    return { intent: 'add_habit', title: title || 'Novo hábito' };
  }
  if (t.includes('pausar pomodoro') || t.includes('pause pomodoro')) return { intent: 'pause_pomodoro' };
  if (t.includes('resumir pomodoro') || t.includes('resume pomodoro')) return { intent: 'resume_pomodoro' };
  if (t.includes('finalizar pomodoro') || t.includes('finish pomodoro')) return { intent: 'finish_pomodoro' };
  
  return { intent: 'unknown' };
}

app.post('/assistant/voice/command', async (req: any, res) => {
  const { text = '', locale = 'pt-BR' } = req.body || {};
  const parsed = parseVoiceCommand(text);
  
  // Executar ação baseada no intent
  try {
    let result = null;
    const userId = String(req.userId || 'user1'); // Fallback para desenvolvimento
    
    switch (parsed.intent) {
      case 'add_task':
        result = await Task.create({
          userId,
          title: parsed.title,
          description: '',
          priority: 'medium',
          status: 'pending',
          dueDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        });
        break;
        
      case 'add_note':
        result = await Note.create({
          userId,
          title: parsed.content.substring(0, 50),
          content: parsed.content,
          type: 'text',
          createdAt: new Date(),
          updatedAt: new Date()
        });
        break;
        
      case 'add_event':
        result = await Event.create({
          userId,
          title: parsed.title,
          description: '',
          startTime: new Date(),
          endTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hora
          location: '',
          createdAt: new Date(),
          updatedAt: new Date()
        });
        break;
        
      case 'add_habit':
        result = await Habit.create({
          userId,
          title: parsed.title,
          description: '',
          frequency: 'daily',
          targetCount: 1,
          currentCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        break;
        
      case 'start_focus':
        result = { message: 'Sessão de foco iniciada', duration: 25 };
        break;
        
      case 'start_break':
        result = { message: 'Pausa iniciada', duration: 5 };
        break;
        
      case 'next_task':
        const nextTask = await Task.findOne({ userId, status: 'pending' }).sort({ priority: -1, createdAt: 1 });
        result = nextTask || { message: 'Nenhuma tarefa pendente encontrada' };
        break;
        
      case 'pause_pomodoro':
        result = { message: 'Pomodoro pausado' };
        break;
        
      case 'resume_pomodoro':
        result = { message: 'Pomodoro resumido' };
        break;
        
      case 'finish_pomodoro':
        result = { message: 'Pomodoro finalizado' };
        break;
        
      default:
        result = { message: 'Comando não reconhecido' };
    }
    
    res.json({ 
      ok: true, 
      parsed, 
      locale, 
      result,
      feedback: `Ação executada: ${parsed.intent}` 
    });
  } catch (error) {
    console.error('Error executing voice command:', error);
    res.json({ 
      ok: false, 
      parsed, 
      locale, 
      error: error.message,
      feedback: 'Erro ao executar comando' 
    });
  }
});

// Alexa webhook (ASK)
app.post('/integrations/alexa/webhook', async (req: any, res) => {
  // Minimal handler stub
  const text = String(req.body?.request?.intent?.slots?.utterance?.value || '');
  const parsed = parseVoiceCommand(text);
  res.json({ version: '1.0', response: { outputSpeech: { type: 'PlainText', text: `Intent ${parsed.intent}` }, shouldEndSession: true } });
});

// Google Assistant (Dialogflow) webhook
app.post('/integrations/google-assistant/webhook', async (req: any, res) => {
  const text = String(req.body?.queryResult?.queryText || '');
  const parsed = parseVoiceCommand(text);
  res.json({ fulfillmentText: `Intent ${parsed.intent}` });
});

// Siri Shortcuts (via HTTP shortcut)
app.get('/integrations/siri/shortcut', (req: any, res) => {
  const text = String(req.query.text || '');
  const parsed = parseVoiceCommand(text);
  res.json({ ok: true, parsed });
});


app.get('/orchestrator/opportunities', async (req: any, res) => {
  const { minutes = 30 } = req.query as any;
  res.json([{ id: 'opp1', title: `Você tem ${minutes}min livres`, suggestion: 'Adiantar tarefa de alta prioridade' }]);
});


// Timeline unificada de hoje
app.get('/today/items', async (req: any, res) => {
  try {
    const userId = String(req.userId || 'user1');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Buscar tarefas de hoje
    const tasks = await Task.find({
      userId,
      dueDate: { $gte: today, $lt: tomorrow },
      status: { $ne: 'completed' }
    }).sort({ priority: -1, createdAt: 1 });
    
    // Buscar eventos de hoje
    const events = await Event.find({
      userId,
      startTime: { $gte: today, $lt: tomorrow }
    }).sort({ startTime: 1 });
    
    // Buscar hábitos do dia
    const habits = await Habit.find({
      userId,
      frequency: 'daily'
    });
    
    // Buscar sessão de Pomodoro ativa
    const activePomodoro = await PomodoroSession.findOne({
      userId,
      status: 'active'
    });
    
    // Combinar todos os itens em uma timeline
    const timelineItems = [];
    
    // Adicionar tarefas
    tasks.forEach(task => {
      timelineItems.push({
        id: `task_${task._id}`,
        type: 'task',
        title: task.title,
        time: task.dueDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        description: task.description,
        priority: task.priority,
        status: task.status
      });
    });
    
    // Adicionar eventos
    events.forEach(event => {
      timelineItems.push({
        id: `event_${event._id}`,
        type: 'event',
        title: event.title,
        time: event.startTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        description: event.description,
        location: event.location
      });
    });
    
    // Adicionar hábitos
    habits.forEach(habit => {
      timelineItems.push({
        id: `habit_${habit._id}`,
        type: 'habit',
        title: habit.title,
        time: 'Hoje',
        description: `${habit.currentCount}/${habit.targetCount} completos`,
        progress: habit.currentCount / habit.targetCount
      });
    });
    
    // Adicionar Pomodoro ativo
    if (activePomodoro) {
      timelineItems.push({
        id: `pomodoro_${activePomodoro._id}`,
        type: 'pomodoro',
        title: 'Sessão de Foco Ativa',
        time: `${activePomodoro.remainingTime}min restantes`,
        description: activePomodoro.taskTitle || 'Foco geral'
      });
    }
    
    // Ordenar por hora (se disponível) ou por tipo
    timelineItems.sort((a, b) => {
      if (a.time !== 'Hoje' && b.time !== 'Hoje') {
        return a.time.localeCompare(b.time);
      }
      return 0;
    });
    
    res.json(timelineItems);
  } catch (error) {
    console.error('Error fetching today items:', error);
    res.status(500).json({ error: 'Erro ao buscar itens de hoje' });
  }
});


// Enhanced Notifications targeting with smart timing
app.post('/notifications/next-window', async (req: any, res) => {
  const { candidateWindows = [] } = req.body || {};
  const userId = String(req.userId);
  
  // Get user's recent activity patterns
  const recentCheckins = await Checkin.find({ userId })
    .sort({ createdAt: -1 })
    .limit(7);
  
  const recentTasks = await Task.find({ userId })
    .sort({ createdAt: -1 })
    .limit(10);
  
  // Calculate optimal notification timing
  const now = new Date();
  const currentHour = now.getHours();
  
  // Base scoring on time of day preferences
  let bestWindow = candidateWindows[0] || { start: now, end: new Date(now.getTime() + 30 * 60000) };
  let bestScore = 0;
  
  for (const window of candidateWindows) {
    let score = 0;
    const windowStart = new Date(window.start);
    const windowHour = windowStart.getHours();
    
    // Time of day scoring (avoid early morning and late night)
    if (windowHour >= 8 && windowHour <= 10) score += 30; // Morning peak
    else if (windowHour >= 14 && windowHour <= 16) score += 25; // Afternoon peak
    else if (windowHour >= 19 && windowHour <= 21) score += 20; // Evening
    else if (windowHour >= 6 && windowHour <= 22) score += 10; // Acceptable hours
    else score -= 20; // Avoid late night/early morning
    
    // Energy-based scoring
    if (recentCheckins.length > 0) {
      const avgEnergy = recentCheckins.reduce((sum: number, c: any) => sum + (c.energy || 3), 0) / recentCheckins.length;
      if (avgEnergy >= 4) score += 15; // High energy = good time for notifications
      else if (avgEnergy <= 2) score -= 10; // Low energy = avoid notifications
    }
    
    // Task completion pattern
    const completedToday = recentTasks.filter((t: any) => t.completed && 
      new Date(t.createdAt).toDateString() === now.toDateString()).length;
    if (completedToday >= 3) score += 10; // User is productive today
    else if (completedToday === 0) score -= 5; // User hasn't completed anything today
    
      // Avoid notification fatigue (don't notify too frequently)
  const userStats = await UserStats.findOne({ userId });
  const timeSinceLastActivity = userStats?.lastActivity ? 
    (now.getTime() - new Date(userStats.lastActivity).getTime()) / (1000 * 60) : 0;
  if (timeSinceLastActivity < 30) score -= 20; // Too recent
    
    if (score > bestScore) {
      bestScore = score;
      bestWindow = window;
    }
  }
  
  // Normalize score to 0-1 range
  const normalizedScore = Math.max(0, Math.min(1, bestScore / 100));
  
  res.json({ 
    window: bestWindow, 
    score: normalizedScore,
    reason: bestScore >= 50 ? 'Momento ideal baseado em seus padrões' :
            bestScore >= 30 ? 'Bom momento para notificação' :
            'Momento aceitável'
  });
});

// Gamification endpoints
app.get('/gamification/stats', async (req: any, res) => {
  const userId = String(req.userId);
  let stats = await UserStats.findOne({ userId });
  if (!stats) {
    stats = await UserStats.create({ userId, points: 0, level: 1, streakDays: 0 });
  }
  res.json(stats);
});

app.get('/gamification/achievements', async (req: any, res) => {
  const userId = String(req.userId);
  const achievements = await Achievement.find({ userId }).sort({ unlockedAt: -1 });
  res.json(achievements);
});

app.post('/gamification/complete-task', async (req: any, res) => {
  const userId = String(req.userId);
  const { taskId } = req.body;
  
  // Award points for task completion
  await awardPoints(userId, 15, 'Task completed');
  
  // Check for new achievements
  const newAchievements = await checkAchievements(userId);
  
  res.json({ 
    pointsAwarded: 15, 
    newAchievements: newAchievements || [],
    message: 'Tarefa completada! +15 pontos'
  });
});

// RAG stubs on notes
app.post('/rag/notes/search', async (req: any, res) => {
  const { query = '' } = req.body || {};
  res.json({ query, results: [] });
});
app.post('/rag/notes/summarize', async (req: any, res) => {
  const { noteId } = req.body || {};
  res.json({ noteId, summary: 'Resumo indisponível (stub).' });
});

// Enhanced Reports with cross-metrics analysis
app.get('/reports/weekly-insights', async (req: any, res) => {
  const userId = String(req.userId);
  
  // Get last 7 days of data
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const checkins = await Checkin.find({ 
    userId, 
    createdAt: { $gte: weekAgo } 
  }).sort({ createdAt: -1 });
  
  const tasks = await Task.find({ 
    userId, 
    createdAt: { $gte: weekAgo } 
  }).sort({ createdAt: -1 });
  
  const insights = [];
  
  // Sleep analysis
  const sleepData = checkins.filter(c => c.sleepHours && c.sleepHours > 0).map(c => c.sleepHours!);
  if (sleepData.length > 0) {
    const avgSleep = sleepData.reduce((sum: number, h: number) => sum + h, 0) / sleepData.length;
    const lowSleepDays = sleepData.filter(h => h < 6).length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const totalTasks = tasks.length;
    
    if (lowSleepDays > 0 && totalTasks > 0) {
      const completionRate = (completedTasks / totalTasks) * 100;
      insights.push({
        id: 'sleep-productivity',
        type: 'correlation',
        title: 'Sono vs Produtividade',
        text: `Nos ${lowSleepDays} dias com <6h de sono, você completou ${completionRate.toFixed(0)}% das tarefas.`,
        recommendation: 'Priorize 7-8h de sono para melhor produtividade.',
        impact: 'high'
      });
    }
  }
  
  // Energy patterns
  const energyData = checkins.filter(c => c.energy && c.energy > 0).map(c => c.energy!);
  if (energyData.length > 0) {
    const avgEnergy = energyData.reduce((sum: number, e: number) => sum + e, 0) / energyData.length;
    const highEnergyDays = energyData.filter(e => e >= 4).length;
    
    insights.push({
      id: 'energy-pattern',
      type: 'pattern',
      title: 'Padrão de Energia',
      text: `Sua energia média foi ${avgEnergy.toFixed(1)}/5. ${highEnergyDays} dias com alta energia.`,
      recommendation: highEnergyDays > 3 ? 'Agende tarefas complexas nos dias de alta energia.' : 'Considere melhorar hábitos de sono e exercício.',
      impact: 'medium'
    });
  }
  
  // Mood trends
  const moodData = checkins.filter(c => c.mood && c.mood > 0).map(c => c.mood!);
  if (moodData.length > 0) {
    const avgMood = moodData.reduce((sum: number, m: number) => sum + m, 0) / moodData.length;
    const lowMoodDays = moodData.filter(m => m <= 2).length;
    
    if (lowMoodDays > 0) {
      insights.push({
        id: 'mood-insight',
        type: 'trend',
        title: 'Tendência de Humor',
        text: `Humor médio: ${avgMood.toFixed(1)}/5. ${lowMoodDays} dias com humor baixo.`,
        recommendation: 'Considere atividades de autocuidado e pausas mais frequentes.',
        impact: 'medium'
      });
    }
  }
  
  // Task completion patterns
  if (tasks.length > 0) {
    const completedTasks = tasks.filter(t => t.completed);
    const completionRate = (completedTasks.length / tasks.length) * 100;
    
    insights.push({
      id: 'task-completion',
      type: 'performance',
      title: 'Taxa de Conclusão',
      text: `Você completou ${completionRate.toFixed(0)}% das ${tasks.length} tarefas da semana.`,
      recommendation: completionRate < 70 ? 'Considere reduzir o número de tarefas ou melhorar o planejamento.' : 'Excelente! Mantenha o ritmo.',
      impact: 'high'
    });
  }
  
  res.json({
    period: 'last_7_days',
    insights,
    summary: {
      totalCheckins: checkins.length,
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.completed).length,
      avgEnergy: energyData.length > 0 ? (energyData.reduce((sum: number, e: number) => sum + e, 0) / energyData.length).toFixed(1) : 'N/A',
      avgMood: moodData.length > 0 ? (moodData.reduce((sum: number, m: number) => sum + m, 0) / moodData.length).toFixed(1) : 'N/A'
    }
  });
});

// Assistant endpoints
app.post('/assistant/plan-week', async (req, res) => {
  res.json({ message: 'Plano semanal gerado (stub)', actions: [] });
});
app.post('/assistant/ritual/pre-deep-work', async (req, res) => {
  res.json({ steps: ['Respiração 2min', 'Preparar ambiente', 'Definir objetivo da sessão'] });
});

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
app.listen(port, () => logger.info(`api on ${port}`));
