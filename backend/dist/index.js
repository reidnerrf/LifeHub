"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importStar(require("mongoose"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const pino_1 = __importDefault(require("pino"));
dotenv_1.default.config();
const logger = (0, pino_1.default)({ transport: { target: 'pino-pretty' } });
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/lifehub';
mongoose_1.default.connect(MONGO_URL).then(() => logger.info('Mongo connected')).catch((err) => {
    logger.error(err);
    process.exit(1);
});
// Models
const UserSchema = new mongoose_1.Schema({
    email: { type: String, unique: true, index: true },
    passwordHash: { type: String, required: true },
    name: { type: String }
}, { timestamps: true });
const TaskSchema = new mongoose_1.Schema({
    userId: { type: String, index: true },
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
    dueDate: { type: Date },
    priority: { type: String },
    tags: [{ type: String }],
}, { timestamps: true });
const NoteSchema = new mongoose_1.Schema({
    userId: { type: String, index: true },
    title: { type: String, required: true },
    content: { type: String, default: '' },
    tags: [{ type: String }],
}, { timestamps: true });
const SuggestionSchema = new mongoose_1.Schema({
    userId: { type: String, index: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    kind: { type: String, default: 'generic' },
    metadata: { type: mongoose_1.Schema.Types.Mixed },
}, { timestamps: true });
// Additional core models
const EventSchema = new mongoose_1.Schema({
    userId: { type: String, index: true },
    title: { type: String, required: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    location: { type: String },
    source: { type: String, default: 'local' }
}, { timestamps: true });
const HabitSchema = new mongoose_1.Schema({
    userId: { type: String, index: true },
    name: { type: String, required: true },
    schedule: { type: String, default: 'daily' },
    target: { type: Number, default: 1 }
}, { timestamps: true });
const CheckinSchema = new mongoose_1.Schema({
    userId: { type: String, index: true },
    habitId: { type: String, index: true },
    date: { type: Date, required: true },
    mood: { type: Number },
    energy: { type: Number },
    sleepHours: { type: Number }
}, { timestamps: true });
const TransactionSchema = new mongoose_1.Schema({
    userId: { type: String, index: true },
    type: { type: String, enum: ['payable', 'receivable'], required: true },
    amount: { type: Number, required: true },
    dueDate: { type: Date },
    description: { type: String }
}, { timestamps: true });
const User = (0, mongoose_1.model)('User', UserSchema);
const Task = (0, mongoose_1.model)('Task', TaskSchema);
const Note = (0, mongoose_1.model)('Note', NoteSchema);
const Suggestion = (0, mongoose_1.model)('Suggestion', SuggestionSchema);
const Event = (0, mongoose_1.model)('Event', EventSchema);
const Habit = (0, mongoose_1.model)('Habit', HabitSchema);
const Checkin = (0, mongoose_1.model)('Checkin', CheckinSchema);
const Transaction = (0, mongoose_1.model)('Transaction', TransactionSchema);
// Auth
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    try {
        if (token) {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'devsecret');
            req.userId = decoded.sub;
        }
    }
    catch { }
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
    if (!email || !password)
        return res.status(400).json({ error: 'email and password required' });
    const exists = await User.findOne({ email });
    if (exists)
        return res.status(409).json({ error: 'email already registered' });
    const passwordHash = await bcryptjs_1.default.hash(password, 10);
    const user = await User.create({ email, passwordHash, name });
    const token = jsonwebtoken_1.default.sign({}, process.env.JWT_SECRET || 'devsecret', { subject: String(user._id) });
    res.status(201).json({ token, user: { id: user._id, email: user.email, name: user.name } });
});
app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body || {};
    const user = await User.findOne({ email });
    if (!user)
        return res.status(401).json({ error: 'invalid credentials' });
    const ok = await bcryptjs_1.default.compare(password, user.passwordHash);
    if (!ok)
        return res.status(401).json({ error: 'invalid credentials' });
    const token = jsonwebtoken_1.default.sign({}, process.env.JWT_SECRET || 'devsecret', { subject: String(user._id) });
    res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
});
app.use(authMiddleware);
// Routes
app.get('/health', (_req, res) => res.json({ ok: true }));
// Tasks CRUD
app.get('/tasks', async (req, res) => {
    const userId = String(req.userId);
    res.json(await Task.find({ userId }).sort({ createdAt: -1 }));
});
app.post('/tasks', async (req, res) => {
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
app.get('/notes', async (req, res) => {
    const userId = String(req.userId);
    res.json(await Note.find({ userId }).sort({ createdAt: -1 }));
});
app.post('/notes', async (req, res) => {
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
app.get('/suggestions', async (req, res) => {
    const userId = String(req.userId);
    res.json(await Suggestion.find({ userId }).sort({ createdAt: -1 }));
});
app.post('/suggestions', async (req, res) => {
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
app.get('/checkins', async (req, res) => {
    const userId = String(req.userId);
    res.json(await Checkin.find({ userId }).sort({ createdAt: -1 }));
});
app.post('/checkins', async (req, res) => {
    const userId = String(req.userId);
    const c = await Checkin.create({ ...req.body, userId });
    res.status(201).json(c);
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
    const insights = [];
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
    const suggestions = [];
    for (const task of tasks) {
        const block = freeBlocks[0];
        if (!block)
            break;
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
// Enhanced Orchestrator with better heuristics
app.post('/orchestrator/schedule', async (req, res) => {
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
    const scoredTasks = tasks.map((task) => {
        let score = 0;
        // Priority scoring
        if (task.priority === 'high')
            score += 30;
        else if (task.priority === 'medium')
            score += 20;
        else
            score += 10;
        // Energy alignment (complex tasks when energy is high)
        const taskComplexity = task.durationMin > 60 ? 'high' : task.durationMin > 30 ? 'medium' : 'low';
        if (taskComplexity === 'high' && avgEnergy >= 4)
            score += 20;
        else if (taskComplexity === 'medium' && avgEnergy >= 3)
            score += 15;
        else if (taskComplexity === 'low')
            score += 10;
        // Time of day preferences (morning person vs night owl)
        const hour = new Date().getHours();
        const isMorningPerson = userPreferences.morningPerson || false;
        if (isMorningPerson && hour < 12)
            score += 15;
        else if (!isMorningPerson && hour >= 14)
            score += 15;
        return { ...task, score };
    }).sort((a, b) => b.score - a.score);
    // Allocate tasks to best available slots
    const allocations = scoredTasks.map((task, idx) => {
        const block = freeBlocks[idx % Math.max(1, freeBlocks.length)] || {};
        const start = new Date(block.start || new Date());
        const end = new Date(start.getTime() + ((task.durationMin || 30) * 60000));
        let reason = 'Alocação otimizada';
        if (task.score >= 50)
            reason = 'Alta prioridade + energia ideal';
        else if (task.score >= 35)
            reason = 'Prioridade média + bom momento';
        else
            reason = 'Slot disponível';
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
    const suggestions = impactedTasks.slice(0, nextBlocks.length).map((t, i) => {
        const s = new Date(nextBlocks[i].start || new Date());
        const e = new Date(s.getTime() + ((t.durationMin || 30) * 60000));
        return { taskId: t.id, suggestedStart: s.toISOString(), suggestedEnd: e.toISOString(), reason: 'Reagendamento automático' };
    });
    res.json({ suggestions });
});
app.get('/orchestrator/opportunities', async (req, res) => {
    const { minutes = 30 } = req.query;
    res.json([{ id: 'opp1', title: `Você tem ${minutes}min livres`, suggestion: 'Adiantar tarefa de alta prioridade' }]);
});
// Notifications targeting (stub)
app.post('/notifications/next-window', (req, res) => {
    const { candidateWindows = [] } = req.body || {};
    const best = candidateWindows[0] || { start: new Date(), end: new Date(Date.now() + 30 * 60000) };
    res.json({ window: best, score: 0.7 });
});
// RAG stubs on notes
app.post('/rag/notes/search', async (req, res) => {
    const { query = '' } = req.body || {};
    res.json({ query, results: [] });
});
app.post('/rag/notes/summarize', async (req, res) => {
    const { noteId } = req.body || {};
    res.json({ noteId, summary: 'Resumo indisponível (stub).' });
});
// Enhanced Reports with cross-metrics analysis
app.get('/reports/weekly-insights', async (req, res) => {
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
    const sleepData = checkins.filter(c => c.sleepHours && c.sleepHours > 0).map(c => c.sleepHours);
    if (sleepData.length > 0) {
        const avgSleep = sleepData.reduce((sum, h) => sum + h, 0) / sleepData.length;
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
    const energyData = checkins.filter(c => c.energy && c.energy > 0).map(c => c.energy);
    if (energyData.length > 0) {
        const avgEnergy = energyData.reduce((sum, e) => sum + e, 0) / energyData.length;
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
    const moodData = checkins.filter(c => c.mood && c.mood > 0).map(c => c.mood);
    if (moodData.length > 0) {
        const avgMood = moodData.reduce((sum, m) => sum + m, 0) / moodData.length;
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
            avgEnergy: energyData.length > 0 ? (energyData.reduce((sum, e) => sum + e, 0) / energyData.length).toFixed(1) : 'N/A',
            avgMood: moodData.length > 0 ? (moodData.reduce((sum, m) => sum + m, 0) / moodData.length).toFixed(1) : 'N/A'
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
//# sourceMappingURL=index.js.map