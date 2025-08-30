import mongoose, { Schema, Document } from 'mongoose';

export interface IAttachment {
  id: string;
  type: 'image' | 'audio' | 'file';
  url: string;
  name: string;
  size: number;
  createdAt: Date;
}

export interface ITranscription {
  text: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'not_applicable';
  confidence: number;
  language: string;
  processedAt: Date;
  error: string | null;
}

export interface ISharing {
  userId: string;
  permission: 'view' | 'edit' | 'comment';
  sharedAt: Date;
}

export interface INote extends Document {
  userId: string;
  title: string;
  content: string;
  type: 'text' | 'voice' | 'image';
  notebook: string;
  tags: string[];
  attachments: IAttachment[];
  aiSummary: string;
  transcription: ITranscription;
  isPinned: boolean;
  isArchived: boolean;
  versionHistory: Array<{
    content: string;
    updatedAt: Date;
  }>;
  syncStatus: {
    synced: boolean;
    lastSynced: Date | null;
    syncVersion: number;
  };
  sharing: {
    isShared: boolean;
    sharedWith: ISharing[];
    publicLink: string | null;
    linkExpires: Date | null;
  };
  createdAt: Date;
  updatedAt: Date;
}

const AttachmentSchema = new Schema({
  id: { type: String },
  type: { type: String, enum: ['image', 'audio', 'file'] },
  url: { type: String },
  name: { type: String },
  size: { type: Number },
  createdAt: { type: Date }
});

const TranscriptionSchema = new Schema({
  text: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed', 'not_applicable'], 
    default: 'not_applicable' 
  },
  confidence: { type: Number, default: 0 },
  language: { type: String, default: 'pt-BR' },
  processedAt: { type: Date },
  error: { type: String, default: null }
});

const SharingSchema = new Schema({
  userId: { type: String },
  permission: { type: String, enum: ['view', 'edit', 'comment'], default: 'view' },
  sharedAt: { type: Date, default: Date.now }
});

export const NoteSchema = new Schema({
  userId: { type: String, index: true },
  title: { type: String, required: true },
  content: { type: String, default: '' },
  type: { type: String, enum: ['text', 'voice', 'image'], default: 'text' },
  notebook: { type: String, default: 'Geral' },
  tags: [{ type: String }],
  attachments: [AttachmentSchema],
  aiSummary: { type: String, default: '' },
  transcription: TranscriptionSchema,
  isPinned: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false },
  versionHistory: [{
    content: { type: String },
    updatedAt: { type: Date, default: Date.now }
  }],
  syncStatus: {
    synced: { type: Boolean, default: false },
    lastSynced: { type: Date },
    syncVersion: { type: Number, default: 0 }
  },
  sharing: {
    isShared: { type: Boolean, default: false },
    sharedWith: [SharingSchema],
    publicLink: { type: String },
    linkExpires: { type: Date }
  }
}, { timestamps: true });

export const Note = mongoose.model<INote>('Note', NoteSchema);
