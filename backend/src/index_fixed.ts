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
  type: { type: String, enum: ['text', 'voice', 'image'], default: 'text' },
  notebook: { type: String, default: 'Geral' },
  tags: [{ type: String }],
  attachments: [{
    id: { type: String },
    type: { type: String, enum: ['image', 'audio', 'file'] },
    url: { type: String },
    name: { type: String },
    size: { type: Number },
    createdAt: { type: Date }
  }],
  aiSummary: { type: String, default: '' },
  transcription: { 
    text: { type: String, default: '' },
    status: { 
      type: String, 
      enum: ['pending', 'processing', 'completed', 'failed', 'not_applicable'], 
      default: 'not_applicable' 
    },
    confidence: { type: Number, default: 0 },
    language: { type: String, default: 'pt-BR' },
    processedAt: { type: Date },
    error: { type: String }
  },
  isPinned: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false },
  versionHistory: [{
    content: { type: String },
    updatedAt: { type: Date, default: Date.now }
  }],
  // Sync and sharing fields
  syncStatus: {
    synced: { type: Boolean, default: false },
    lastSynced: { type: Date },
    syncVersion: { type: Number, default: 0 }
  },
  sharing: {
    isShared: { type: Boolean, default: false },
    sharedWith: [{
      userId: { type: String },
      permission: { type: String, enum: ['view', 'edit', 'comment'], default: 'view' },
      sharedAt: { type: Date, default: Date.now }
    }],
    publicLink: { type: String },
    linkExpires: { type: Date }
  }
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
  const { notebook, type, isPinned, isArchived, search } = req.query;
  
  let query: any = { userId };
  
  if (notebook) query.notebook = notebook;
  if (type) query.type = type;
  if (isPinned !== undefined) query.isPinned = isPinned === 'true';
  if (isArchived !== undefined) query.isArchived = isArchived === 'true';
  
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
  }
  
  res.json(await Note.find(query).sort({ isPinned: -1, createdAt: -1 }));
});

app.get('/notes/notebooks', async (req: any, res) => {
  const userId = String(req.userId);
  const notebooks = await Note.distinct('notebook', { userId });
  res.json(notebooks);
});

app.get('/notes/:id', async (req: any, res) => {
  const note = await Note.findById(req.params.id);
  if (!note) return res.status(404).json({ error: 'Note not found' });
  res.json(note);
});

app.post('/notes', async (req: any, res) => {
  const userId = String(req.userId);
  const n = await Note.create({ ...req.body, userId });
  res.status(201).json(n);
});

app.patch('/notes/:id', async (req, res) => {
  const note = await Note.findById(req.params.id);
  if (!note) return res.status(404).json({ error: 'Note not found' });
  
  // Save current content to version history before updating
  if (req.body.content && req.body.content !== note.content) {
    note.versionHistory.push({
      content: note.content,
      updatedAt: new Date()
    });
    await note.save();
  }
  
  const updatedNote = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updatedNote);
});

app.delete('/notes/:id', async (req, res) => {
  await Note.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

// Enhanced Notes Features
app.post('/notes/:id/pin', async (req, res) => {
  const note = await Note.findByIdAndUpdate(
    req.params.id,
    { isPinned: true },
    { new: true }
  );
  res.json(note);
});

app.post('/notes/:id/unpin', async (req, res) => {
  const note = await Note.findByIdAndUpdate(
    req.params.id,
    { isPinned: false },
    { new: true }
  );
  res.json(note);
});

app.post('/notes/:id/archive', async (req, res) => {
  const note = await Note.findByIdAndUpdate(
    req.params.id,
    { isArchived: true },
    { new: true }
  );
  res.json(note);
});

app.post('/notes/:id/unarchive', async (req, res) => {
  const note = await Note.findByIdAndUpdate(
    req.params.id,
    { isArchived: false },
    { new: true }
  );
  res.json(note);
});

app.get('/notes/:id/versions', async (req, res) => {
  const note = await Note.findById(req.params.id);
  if (!note) return res.status(404).json({ error: 'Note not found' });
  res.json(note.versionHistory);
});

app.post('/notes/:id/restore/:versionIndex', async (req, res) => {
  const note = await Note.findById(req.params.id);
  if (!note) return res.status(404).json({ error: 'Note not found' });
  
  const versionIndex = parseInt(req.params.versionIndex);
  if (versionIndex < 0 || versionIndex >= note.versionHistory.length) {
    return res.status(400).json({ error: 'Invalid version index' });
  }
  
  const version = note.versionHistory[versionIndex];
  note.content = version.content;
  note.versionHistory.push({
    content: note.content,
    updatedAt: new Date()
  });
  
  await note.save();
  res.json(note);
});

// Notes search with RAG-like functionality
app.get('/notes/search/advanced', async (req: any, res) => {
  const userId = String(req.userId);
  const { q, notebook, type, tags, dateFrom, dateTo } = req.query;
  
  let query: any = { userId };
  
  if (q) {
    query.$or = [
      { title: { $regex: q, $options: 'i' } },
      { content: { $regex: q, $options: 'i' } },
      { aiSummary: { $regex: q, $options: 'i' } }
    ];
  }
  
  if (notebook) query.notebook = notebook;
  if (type) query.type = type;
  if (tags) query.tags = { $in: tags.split(',') };
  
  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
    if (dateTo) query.createdAt.$lte = new Date(dateTo);
  }
  
  const notes = await Note.find(query).sort({ createdAt: -1 });
  res.json(notes);
});

// AI Summary generation (stub - would integrate with actual AI service)
app.post('/notes/:id/summarize', async (req, res) => {
  const note = await Note.findById(req.params.id);
  if (!note) return res.status(404).json({ error: 'Note not found' });
  
  // Simulate AI summary generation
  const summary = `Resumo gerado para: ${note.title}. ${note.content.substring(0, 100)}...`;
  note.aiSummary = summary;
  await note.save();
  
  res.json({ summary });
});

// Notes statistics
app.get('/notes/stats', async (req: any, res) => {
  const userId = String(req.userId);
  
  const totalNotes = await Note.countDocuments({ userId });
  const pinnedNotes = await Note.countDocuments({ userId, isPinned: true });
  const archivedNotes = await Note.countDocuments({ userId, isArchived: true });
  const notebooks = await Note.distinct('notebook', { userId });
  const noteTypes = await Note.aggregate([
    { $match: { userId } },
    { $group: { _id: '$type', count: { $sum: 1 } } }
  ]);
  
  res.json({
    totalNotes,
    pinnedNotes,
    archivedNotes,
    notebookCount: notebooks.length,
    noteTypes
  });
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
  const completedTasks = await Task.countDocuments({ userId, status: 'completed' });
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
    { id: 's2', title: 'Bloco de foco recomendado', description: 'Seu pico de energia is agora.' }
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
      { userId, title: '3 sessões de foco', target: 3, progress: 0, rewardPoints: 40, week
