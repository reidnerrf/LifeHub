import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose, { Schema, model } from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pino from 'pino';

dotenv.config();
const logger = pino({ transport: { target: 'pino-pretty' } });
const app = express();
app.use(cors());
app.use(express.json());

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
  completed: { type: Boolean, default: false },
  dueDate: { type: Date },
  priority: { type: String },
  tags: [{ type: String }],
}, { timestamps: true });
const NoteSchema = new Schema({
  userId: { type: String, index: true },
  title: { type: String, required: true },
  content: { type: String, default: '' },
  tags: [{ type: String }],
}, { timestamps: true });

const User = model('User', UserSchema);
const Task = model('Task', TaskSchema);
const Note = model('Note', NoteSchema);

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
  for (const task of tasks) {
    const block = freeBlocks[0];
    if (!block) break;
    const start = new Date(block.start || new Date());
    const dur = (task.durationMin || 30) * 60000;
    const end = new Date(start.getTime() + dur);
    suggestions.push({ taskId: String(task.id), suggestedStart: start.toISOString(), suggestedEnd: end.toISOString(), reason: 'Primeiro bloco livre disponível' });
  }
  res.json({ suggestions });
});

// Google Calendar import stub
app.post('/integrations/google/import', async (req, res) => {
  // Stub: pretend we imported 3 events
  res.json({ imported: 3, status: 'ok' });
});

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
app.listen(port, () => logger.info(`api on ${port}`));
