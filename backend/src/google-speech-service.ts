import { SpeechClient } from '@google-cloud/speech';
import { promises as fs } from 'fs';
import fetch from 'node-fetch';
import pino from 'pino';

const logger = pino({ transport: { target: 'pino-pretty' } });

export interface TranscriptionResult {
  text: string;
  confidence: number;
  language: string;
}

export class GoogleSpeechService {
  private static instance: GoogleSpeechService;
  private speechClient: SpeechClient | null = null;

  private constructor() {
    this.initializeClient();
  }

  static getInstance(): GoogleSpeechService {
    if (!GoogleSpeechService.instance) {
      GoogleSpeechService.instance = new GoogleSpeechService();
    }
    return GoogleSpeechService.instance;
  }

  private initializeClient() {
    try {
      // Initialize Google Cloud Speech client
      // This will use GOOGLE_APPLICATION_CREDENTIALS environment variable
      // or service account key file
      this.speechClient = new SpeechClient();
      logger.info('Google Speech-to-Text client initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Google Speech client:', error);
      this.speechClient = null;
    }
  }

  /**
   * Download audio file from URL to local temporary file
   */
  private async downloadAudioFile(audioUrl: string): Promise<string> {
    try {
      const response = await fetch(audioUrl);
      if (!response.ok) {
        throw new Error(`Failed to download audio file: ${response.statusText}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      const tempFilePath = `/tmp/audio_${Date.now()}.wav`;

      await fs.writeFile(tempFilePath, buffer);
      logger.info(`Audio file downloaded to: ${tempFilePath}`);

      return tempFilePath;
    } catch (error) {
      logger.error('Error downloading audio file:', error);
      throw error;
    }
  }

  /**
   * Transcribe audio file using Google Speech-to-Text API
   */
  async transcribeAudio(audioUrl: string, languageCode: string = 'pt-BR'): Promise<TranscriptionResult> {
    if (!this.speechClient) {
      throw new Error('Google Speech client not initialized');
    }

    try {
      // Download audio file
      const audioFilePath = await this.downloadAudioFile(audioUrl);

      // Read audio file
      const audioBytes = await fs.readFile(audioFilePath).catch(async (error) => {
        logger.error('Error reading audio file:', error);
        throw new Error('Failed to read audio file');
      });

      // Configure the request
      const request = {
        audio: {
          content: audioBytes.toString('base64'),
        },
        config: {
          encoding: 'LINEAR16' as const, // Assuming WAV format, adjust based on your audio format
          sampleRateHertz: 16000, // Adjust based on your audio sample rate
          languageCode: languageCode,
          enableAutomaticPunctuation: true,
          enableWordTimeOffsets: false,
          model: 'default', // Use 'phone_call' for phone audio, 'video' for video, etc.
        },
      };

      logger.info(`Starting transcription for language: ${languageCode}`);

      // Perform the transcription
      const [response] = await this.speechClient.recognize(request);

      // Clean up temporary file
      await fs.unlink(audioFilePath).catch((error) => {
        logger.warn('Failed to clean up temporary audio file:', error);
      });

      if (!response.results || response.results.length === 0) {
        throw new Error('No transcription results received');
      }

      // Extract the transcription text and confidence
      const transcription = response.results
        .map(result => result.alternatives?.[0]?.transcript || '')
        .join(' ');

      const confidence = response.results[0]?.alternatives?.[0]?.confidence || 0;

      logger.info(`Transcription completed with confidence: ${confidence}`);

      return {
        text: transcription,
        confidence: confidence,
        language: languageCode,
      };

    } catch (error: any) {
      logger.error('Error during transcription:', error);

      // Clean up temporary file if it exists
      try {
        const tempFilePath = `/tmp/audio_${Date.now()}.wav`;
        await fs.unlink(tempFilePath);
      } catch {
        // Ignore cleanup errors
      }

      throw new Error(`Transcription failed: ${error.message}`);
    }
  }

  /**
   * Check if the service is properly configured
   */
  isConfigured(): boolean {
    return this.speechClient !== null;
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages(): string[] {
    return [
      'pt-BR', // Portuguese (Brazil)
      'en-US', // English (US)
      'es-ES', // Spanish (Spain)
      'fr-FR', // French (France)
      'de-DE', // German (Germany)
      'it-IT', // Italian (Italy)
      'ja-JP', // Japanese (Japan)
      'ko-KR', // Korean (South Korea)
      'zh-CN', // Chinese (Simplified)
      'ru-RU', // Russian (Russia)
    ];
  }
}

export const googleSpeechService = GoogleSpeechService.getInstance();
