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
  points: {
