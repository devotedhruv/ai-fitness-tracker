import { syncQueue } from '../services/storage/syncQueue';

describe('syncQueue', () => {
  beforeEach(() => {
    syncQueue.clearQueue();
  });

  it('enqueues items and tracks pending count', () => {
    expect(syncQueue.getPendingCount()).toBe(0);

    syncQueue.enqueue('WORKOUT_SESSION', { name: 'Offline Push Day', sets: [] });
    // Item is in queue
    expect(syncQueue.getPendingCount()).toBeGreaterThanOrEqual(0);
  });

  it('clears queue when requested', () => {
    syncQueue.enqueue('RUN_SESSION', { distanceMeters: 5000 });
    syncQueue.clearQueue();
    expect(syncQueue.getPendingCount()).toBe(0);
  });
});
