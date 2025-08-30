# Offline Sync Service Guide

## Overview

The Offline Sync Service provides robust offline capabilities for the LifeHub app, allowing users to perform actions while offline and automatically synchronizing them when connectivity is restored.

## Key Features

- **Offline Operation Tracking**: Records all create, update, and delete operations
- **Automatic Retry**: Automatically retries failed operations with exponential backoff
- **Conflict Resolution**: Multiple strategies for handling data conflicts
- **Real-time Status**: Live monitoring of sync status and pending operations
- **Notifications**: User notifications for sync events and errors

## Usage

### Basic Usage

```typescript
import { offlineSyncService } from '../services/offlineSyncService';

// Add an operation to be synced
const operationId = await offlineSyncService.addOperation({
  type: 'create', // 'create' | 'update' | 'delete'
  entityType: 'note', // 'event' | 'task' | 'note' | 'habit'
  entityId: 'unique-id-123',
  data: {
    // Your entity data here
    title: 'My Note',
    content: 'Note content...'
  }
});
```

### Getting Sync Status

```typescript
const status = offlineSyncService.getSyncStatus();
console.log('Online:', status.isOnline);
console.log('Pending operations:', status.pendingOperations);
```

### Managing Operations

```typescript
// Get all operations
const operations = offlineSyncService.getOperations();

// Get only pending operations
const pendingOps = offlineSyncService.getPendingOperations();

// Retry failed operations
offlineSyncService.retryFailedOperations();

// Clear completed operations
offlineSyncService.clearCompletedOperations();
```

### Conflict Resolution

```typescript
// Resolve a conflict
await offlineSyncService.resolveConflict(operationId, {
  strategy: 'server' // 'server' | 'client' | 'manual' | 'newest' | 'oldest'
}, resolvedData);
```

## Integration with Data Services

### Example: Notes Service Integration

```typescript
class NotesService {
  async createNote(noteData: any) {
    try {
      // Try to create online first
      const response = await api.createNote(noteData);
      return response;
    } catch (error) {
      if (error instanceof NetworkError) {
        // Offline - queue for sync
        const operationId = await offlineSyncService.addOperation({
          type: 'create',
          entityType: 'note',
          entityId: `temp_${Date.now()}`,
          data: noteData
        });
        return { id: operationId, status: 'queued' };
      }
      throw error;
    }
  }
}
```

## Testing

Use the `OfflineSyncTester` component to test offline functionality:

```typescript
import { OfflineSyncTester } from '../components/OfflineSyncTester';

// Add to your navigation stack or use as a standalone screen
```

## Notification Types

The service triggers these notification types:
- `offline-mode`: User is working offline
- `sync-success`: Operation successfully synchronized
- `sync-error`: Sync failed after multiple attempts

## Configuration

### Operation Types Supported
- `create`: Create new entities
- `update`: Update existing entities
- `delete`: Delete entities

### Entity Types Supported
- `event`: Calendar events
- `task`: Todo tasks
- `note`: Text notes
- `habit`: Habit tracking

### Retry Strategy
- Exponential backoff up to 5 minutes
- Maximum 5 retry attempts
- Notifications after 3+ failures

## Best Practices

1. **Always try online first**: Attempt online operations before falling back to offline
2. **Use temporary IDs**: Generate temporary IDs for offline-created entities
3. **Handle conflicts**: Implement appropriate conflict resolution strategies
4. **User feedback**: Notify users about offline status and sync progress
5. **Clean up**: Regularly clear completed operations to save storage

## Error Handling

The service provides detailed error information:
- Operation status (`pending`, `processing`, `completed`, `failed`)
- Error messages for failed operations
- Retry count tracking

## Storage

Operations are persisted using AsyncStorage under the key `offline_sync_operations`.
