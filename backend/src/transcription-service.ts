import { Note, IAttachment } from './models/Note';
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
   * Process voice note transcription
   */
  async processVoiceNote(noteId: string, audioUrl: string, language: string = 'pt-BR'): Promise<void> {
    try {
      // Update note status to processing
      await Note.findByIdAndUpdate(noteId, {
        'transcription.status': 'processing',
        'transcription.processedAt': new Date(),
        'transcription.language': language
      });

      // Simulate transcription processing (would integrate with actual speech-to-text service)
      logger.info(`Starting transcription for note ${noteId}, language: ${language}`);
      
      // Add to processing queue with timeout
      const timeout = setTimeout(async () => {
        try {
          // Simulate transcription result
          const transcriptions = [
            "Esta é uma nota de voz transcrita automaticamente pelo sistema.",
            "Reunião importante com cliente sobre novos requisitos do projeto.",
            "Lembrar de comprar leite, pão e ovos no supermercado.",
            "Ideias para implementar no próximo sprint de desenvolvimento.",
            "Gravação da reunião de equipe sobre planejamento estratégico."
          ];
          
          const randomText = transcriptions[Math.floor(Math.random() * transcriptions.length)];
          const confidence = Math.random() * 0.3 + 0.7; // 70-100% confidence

          await Note.findByIdAndUpdate(noteId, {
            'transcription.text': randomText,
            'transcription.status': 'completed',
            'transcription.confidence': confidence,
            'transcription.processedAt': new Date(),
            'transcription.error': null
          });

          logger.info(`Transcription completed for note ${noteId} with confidence: ${confidence}`);
        } catch (error: any) {
          logger.error(`Transcription failed for note ${noteId}:`, error);
          await Note.findByIdAndUpdate(noteId, {
            'transcription.status': 'failed',
            'transcription.error': error.message
          });
        } finally {
          this.processingQueue.delete(noteId);
        }
      }, 5000); // Simulate 5 second processing time

      this.processingQueue.set(noteId, timeout);
    } catch (error: any) {
      logger.error(`Error starting transcription for note ${noteId}:`, error);
      await Note.findByIdAndUpdate(noteId, {
        'transcription.status': 'failed',
        'transcription.error': error.message
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
  async getTranscriptionStatus(noteId: string): Promise<any> {
    const note = await Note.findById(noteId);
    return note?.transcription || null;
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
        await this.processVoiceNote(note._id.toString(), audioAttachment.url, note.transcription?.language || 'pt-BR');
      }
    }
  }
}

export const transcriptionService = TranscriptionService.getInstance();
