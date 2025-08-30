import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationService } from './notificationService';
import * as Notifications from 'expo-notifications';

export interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entityType: 'event' | 'task' | 'note' | 'habit';
  entityId: string;
  data: any;
  timestamp: Date;
  retryCount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

export interface ConflictResolution {
  strategy: 'server' | 'client' | 'manual' | 'newest' | 'oldest';
  resolvedAt?: Date;
  resolvedBy?: string;
}

export interface SyncStatus {
  isOnline: boolean;
  lastSync: Date | null;
  pendingOperations: number;
  processing: boolean;
  error?: string;
}

class OfflineSyncService {
  private static instance: OfflineSyncService;
  private operations: SyncOperation[] = [];
  private isProcessing = false;
  private syncStatus: SyncStatus = {
    isOnline: true,
    lastSync: null,
    pendingOperations: 0,
    processing: false,
  };

  private constructor() {
    this.initialize();
  }

  static getInstance(): OfflineSyncService {
    if (!OfflineSyncService.instance) {
      OfflineSyncService.instance = new OfflineSyncService();
    }
    return OfflineSyncService.instance;
  }

  private async initialize() {
    await this.loadOperations();
    this.startSyncMonitor();
    this.detectNetworkStatus();
  }

  private async loadOperations() {
    try {
      const stored = await AsyncStorage.getItem('offline_sync_operations');
      if (stored) {
        this.operations = JSON.parse(stored).map((op: any) => ({
          ...op,
          timestamp: new Date(op.timestamp),
        }));
        this.syncStatus.pendingOperations = this.operations.filter(
          op => op.status === 'pending'
        ).length;
      }
    } catch (error) {
      console.error('Failed to load offline operations:', error);
    }
  }

  private async saveOperations() {
    try {
      await AsyncStorage.setItem(
        'offline_sync_operations',
        JSON.stringify(this.operations)
      );
      this.syncStatus.pendingOperations = this.operations.filter(
        op => op.status === 'pending'
      ).length;
    } catch (error) {
      console.error('Failed to save offline operations:', error);
    }
  }

  private startSyncMonitor() {
    // Check for pending operations every 30 seconds
    setInterval(() => {
      if (this.syncStatus.isOnline && this.operations.length > 0) {
        this.processPendingOperations();
      }
    }, 30000);
  }

  private detectNetworkStatus() {
    // Simple network detection - in a real app, use NetInfo from react-native
    const originalFetch = global.fetch;
    
    global.fetch = async (url, options) => {
      try {
        const response = await originalFetch(url, options);
        this.syncStatus.isOnline = true;
        return response;
      } catch (error) {
        this.syncStatus.isOnline = false;
        throw error;
      }
    };

    // Also check periodically
    setInterval(async () => {
      try {
        await fetch('https://www.google.com', { method: 'HEAD' });
        this.syncStatus.isOnline = true;
      } catch {
        this.syncStatus.isOnline = false;
      }
    }, 10000);
  }

  async addOperation(operation: Omit<SyncOperation, 'id' | 'timestamp' | 'retryCount' | 'status'>) {
    const newOperation: SyncOperation = {
      ...operation,
      id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      retryCount: 0,
      status: 'pending',
    };

    this.operations.push(newOperation);
    await this.saveOperations();

    // Show offline notification if not online
    if (!this.syncStatus.isOnline) {
      await notificationService.scheduleNotification(
        {
          title: 'Modo Offline',
          body: 'Sua ação será sincronizada quando a conexão voltar',
          data: { type: 'offline-mode' },
          sound: false,
        },
        { 
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: new Date(Date.now() + 1000)
        }
      );
    }

    // Try to process immediately if online
    if (this.syncStatus.isOnline) {
      this.processPendingOperations();
    }

    return newOperation.id;
  }

  async processPendingOperations() {
    if (this.isProcessing || !this.syncStatus.isOnline) return;

    this.isProcessing = true;
    this.syncStatus.processing = true;

    const pendingOps = this.operations.filter(op => op.status === 'pending');

    for (const operation of pendingOps) {
      try {
        operation.status = 'processing';
        await this.saveOperations();

        // Simulate API call - replace with actual API calls
        await this.executeOperation(operation);

        operation.status = 'completed';
        operation.retryCount = 0;
        this.syncStatus.lastSync = new Date();

        await this.saveOperations();

        // Show sync success notification for important operations
        if (operation.type === 'create' || operation.type === 'delete') {
          await notificationService.scheduleNotification(
            {
              title: '✅ Sincronizado',
              body: `Sua ${operation.entityType} foi sincronizada com sucesso`,
              data: { type: 'sync-success', operationId: operation.id },
              sound: true,
            },
            { 
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: new Date(Date.now() + 1000)
            }
          );
        }

      } catch (error) {
        console.error(`Failed to process operation ${operation.id}:`, error);
        
        operation.status = 'failed';
        operation.error = error instanceof Error ? error.message : 'Unknown error';
        operation.retryCount++;

        // Exponential backoff for retries
        if (operation.retryCount < 5) {
          const delay = Math.min(300000, 1000 * Math.pow(2, operation.retryCount)); // Max 5 minutes
          setTimeout(() => {
            operation.status = 'pending';
            this.saveOperations();
          }, delay);
        }

        await this.saveOperations();

        // Show sync error notification after multiple failures
        if (operation.retryCount >= 3) {
          await notificationService.scheduleNotification(
            {
              title: '⚠️ Erro de Sincronização',
              body: `Falha ao sincronizar ${operation.entityType}. Tentando novamente...`,
              data: { type: 'sync-error', operationId: operation.id },
              sound: true,
            },
            { 
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: new Date(Date.now() + 1000)
            }
          );
        }
      }
    }

    this.isProcessing = false;
    this.syncStatus.processing = false;
  }

  private async executeOperation(operation: SyncOperation): Promise<void> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Simulate occasional failures for testing
    if (Math.random() < 0.1) {
      throw new Error('Simulated API failure');
    }

    // In a real implementation, this would make actual API calls
    console.log(`Executing ${operation.type} operation on ${operation.entityType}:`, operation.entityId);
  }

  async resolveConflict(
    operationId: string,
    resolution: ConflictResolution,
    resolvedData?: any
  ) {
    const operation = this.operations.find(op => op.id === operationId);
    if (!operation) throw new Error('Operation not found');

    // Apply resolution strategy
    switch (resolution.strategy) {
      case 'server':
        // Keep server data, discard local changes
        this.operations = this.operations.filter(op => op.id !== operationId);
        break;
      
      case 'client':
        // Keep local changes, retry operation
        operation.status = 'pending';
        operation.retryCount = 0;
        if (resolvedData) {
          operation.data = resolvedData;
        }
        break;
      
      case 'newest':
        // Use the newest version (could be server or client)
        const isNewer = operation.timestamp > new Date(); // Simplified logic
        if (!isNewer && resolvedData) {
          operation.data = resolvedData;
        }
        operation.status = 'pending';
        break;
      
      case 'manual':
        // Use manually resolved data
        if (resolvedData) {
          operation.data = resolvedData;
        }
        operation.status = 'pending';
        break;
    }

    await this.saveOperations();

    // Retry if operation is pending
    if (operation.status === 'pending') {
      this.processPendingOperations();
    }
  }

  getOperations(): SyncOperation[] {
    return [...this.operations];
  }

  getPendingOperations(): SyncOperation[] {
    return this.operations.filter(op => op.status === 'pending');
  }

  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  async clearCompletedOperations() {
    this.operations = this.operations.filter(op => op.status !== 'completed');
    await this.saveOperations();
  }

  async retryFailedOperations() {
    const failedOps = this.operations.filter(op => op.status === 'failed');
    for (const op of failedOps) {
      op.status = 'pending';
      op.retryCount = 0;
    }
    await this.saveOperations();
    this.processPendingOperations();
  }
}

export const offlineSyncService = OfflineSyncService.getInstance();
