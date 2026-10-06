import { workoutsApi, runsApi } from '../api';

export interface QueuedItem {
  id: string;
  type: 'WORKOUT_SESSION' | 'RUN_SESSION';
  payload: any;
  createdAt: number;
  retryCount: number;
}

class SyncQueue {
  private queue: QueuedItem[] = [];
  private isSyncing: boolean = false;

  public enqueue(type: 'WORKOUT_SESSION' | 'RUN_SESSION', payload: any) {
    const item: QueuedItem = {
      id: `sync-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      type,
      payload,
      createdAt: Date.now(),
      retryCount: 0,
    };
    this.queue.push(item);
    this.flush();
  }

  public getPendingCount(): number {
    return this.queue.length;
  }

  public async flush(): Promise<{ success: number; failed: number }> {
    if (this.isSyncing || this.queue.length === 0) {
      return { success: 0, failed: 0 };
    }

    this.isSyncing = true;
    let success = 0;
    let failed = 0;

    const remaining: QueuedItem[] = [];

    for (const item of this.queue) {
      try {
        if (item.type === 'WORKOUT_SESSION') {
          await workoutsApi.createSession(item.payload);
        } else if (item.type === 'RUN_SESSION') {
          await runsApi.createRun(item.payload);
        }
        success++;
      } catch (err) {
        item.retryCount += 1;
        // Keep in queue if fewer than 5 retries
        if (item.retryCount < 5) {
          remaining.push(item);
        }
        failed++;
      }
    }

    this.queue = remaining;
    this.isSyncing = false;
    return { success, failed };
  }

  public clearQueue() {
    this.queue = [];
  }
}

export const syncQueue = new SyncQueue();
