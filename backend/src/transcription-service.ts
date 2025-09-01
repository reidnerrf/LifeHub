import { Note, IAttachment } from './models/Note';
import { googleSpeechService, TranscriptionResult } from './google-speech-service';
import { TranscriptionStatus } from './types';
import pino from 'pino';

const logger = pino({ transport: { target: 'pino-pretty' } });

export class TranscriptionService {
  private static instance: TranscriptionService;
  private processingQueue: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {}

  static getInstance(): TranscriptionService {
    if (!TranscriptionService.instance) {
      TranscriptionService.instance = new TranscriptionService();
    }
    return TranscriptionService.instance;
  }

  /**
   * Process voice note transcription using Google Speech-to-Text
   */
  async processVoiceNote(noteId: string, audioUrl: string, language: string = 'pt-BR'): Promise<void> {
    try {
      // Update note status to processing
      await Note.findByIdAndUpdate(noteId, {
        'transcription.status': 'processing',
        'transcription.processedAt': new Date(),
        'transcription.language': language
      });

      logger.info(`Starting Google Speech-to-Text transcription for note ${noteId}, language: ${language}`);

      // Check if Google Speech service is configured
      if (!googleSpeechService.isConfigured()) {
        throw new Error('Google Speech-to-Text service is not properly configured. Please check your Google Cloud credentials.');
      }

      // Process transcription asynchronously
      const processTranscription = async () => {
        try {
          const result: TranscriptionResult = await googleSpeechService.transcribeAudio(audioUrl, language);

          await Note.findByIdAndUpdate(noteId, {
            'transcription.text': result.text,
            'transcription.status': 'completed',
            'transcription.confidence': result.confidence,
            'transcription.processedAt': new Date(),
            'transcription.error': null
          });

          logger.info(`Google Speech-to-Text transcription completed for note ${noteId} with confidence: ${result.confidence}`);
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown transcription error';
          logger.error(`Google Speech-to-Text transcription failed for note ${noteId}: ${errorMessage}`);

          await Note.findByIdAndUpdate(noteId, {
            'transcription.status': 'failed',
            'transcription.error': errorMessage
          });
        } finally {
          this.processingQueue.delete(noteId);
        }
      };

      // Start transcription process
      processTranscription();

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      logger.error(`Error starting Google Speech-to-Text transcription for note ${noteId}: ${errorMessage}`);
      await Note.findByIdAndUpdate(noteId, {
        'transcription.status': 'failed',
        'transcription.error': errorMessage
      });
    }
  }

  /**
   * Cancel ongoing transcription
   */
  async cancelTranscription(noteId: string): Promise<void> {
    const timeout = this.processingQueue.get(noteId);
    if (timeout) {
      clearTimeout(timeout);
      this.processingQueue.delete(noteId);
      await Note.findByIdAndUpdate(noteId, {
        'transcription.status': 'failed',
        'transcription.error': 'Transcription cancelled by user'
      });
    }
  }

  /**
   * Get transcription status
   */
  async getTranscriptionStatus(noteId: string): Promise<TranscriptionStatus | null> {
    const note = await Note.findById(noteId);
    if (!note) return null;

    // Map status values and handle type conversions
    const status = note.transcription.status === 'not_applicable' ? 'pending' : note.transcription.status as 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

    const result: TranscriptionStatus = { status };

    if (note.transcription.text) result.text = note.transcription.text;
    if (note.transcription.confidence) result.confidence = note.transcription.confidence;
    if (note.transcription.language) result.language = note.transcription.language;
    if (note.transcription.error) result.error = note.transcription.error;
    if (note.transcription.processedAt) result.processedAt = note.transcription.processedAt;

    return result;
  }

  /**
   * Manual transcription retry
   */
  async retryTranscription(noteId: string): Promise<void> {
    const note = await Note.findById(noteId);
    if (!note) {
      throw new Error('Note not found');
    }

    // Find audio attachment
    const audioAttachment = note.attachments.find((att: IAttachment) => att.type === 'audio');
    if (!audioAttachment) {
      throw new Error('No audio attachment found');
    }

    await this.processVoiceNote(noteId, audioAttachment.url, note.transcription?.language || 'pt-BR');
  }

  /**
   * Bulk process pending transcriptions
   */
  async processPendingTranscriptions(): Promise<void> {
    const pendingNotes = await Note.find({
      'transcription.status': 'pending',
      type: 'voice'
    });

    logger.info(`Found ${pendingNotes.length} pending transcriptions`);

    for (const note of pendingNotes) {
      const audioAttachment = note.attachments.find((att: IAttachment) => att.type === 'audio');
      if (audioAttachment) {
        await this.processVoiceNote((note._id as any).toString(), audioAttachment.url, note.transcription?.language || 'pt-BR');
      }
    }
  }
}

export const transcriptionService = TranscriptionService.getInstance();
