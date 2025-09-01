import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export interface JWTPayload {
  sub: string;
  iat?: number;
  exp?: number;
}

export interface TranscriptionStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  text?: string;
  confidence?: number;
  language?: string;
  error?: string;
  processedAt?: Date;
}
