import * as FileSystem from 'expo-file-system';

export interface OfflineCacheStats {
  totalFiles: number;
  totalSizeBytes: number;
  totalSizeMB: number;
}

export class ExerciseOfflineMediaService {
  private static instance: ExerciseOfflineMediaService;
  private pendingDownloads = new Map<string, Promise<string>>();

  private constructor() {}

  public static getInstance(): ExerciseOfflineMediaService {
    if (!ExerciseOfflineMediaService.instance) {
      ExerciseOfflineMediaService.instance = new ExerciseOfflineMediaService();
    }
    return ExerciseOfflineMediaService.instance;
  }

  /**
   * Returns base cache directory path if file system is available.
   */
  public getCacheDir(): string | null {
    if (!FileSystem || !FileSystem.documentDirectory) {
      return null;
    }
    return `${FileSystem.documentDirectory}exercise_media/`;
  }

  /**
   * Ensure local exercise media cache directory exists on disk.
   */
  public async ensureCacheDir(): Promise<string | null> {
    const cacheDir = this.getCacheDir();
    if (!cacheDir) return null;

    try {
      const dirInfo = await FileSystem.getInfoAsync(cacheDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true });
      }
      return cacheDir;
    } catch (e) {
      console.warn('[ExerciseOfflineMediaService] Failed to create cache dir:', e);
      return null;
    }
  }

  /**
   * Derive a clean, deterministic cache file name from remote URL.
   */
  public getCacheFilename(remoteUrl: string): string {
    if (!remoteUrl) return 'unknown.gif';
    try {
      const parsed = remoteUrl.split('?')[0].split('#')[0];
      const parts = parsed.split('/');
      const lastPart = parts[parts.length - 1];
      if (
        lastPart &&
        (lastPart.endsWith('.gif') ||
          lastPart.endsWith('.mp4') ||
          lastPart.endsWith('.jpg') ||
          lastPart.endsWith('.png'))
      ) {
        return lastPart;
      }
    } catch {
      // fallback
    }
    // Simple hash fallback
    let hash = 0;
    for (let i = 0; i < remoteUrl.length; i++) {
      hash = (hash << 5) - hash + remoteUrl.charCodeAt(i);
      hash |= 0;
    }
    const ext = remoteUrl.includes('.mp4') ? '.mp4' : remoteUrl.includes('.jpg') ? '.jpg' : '.gif';
    return `ex_media_${Math.abs(hash)}${ext}`;
  }

  /**
   * Get target local file URI for given remote URL.
   */
  public getLocalFileUri(remoteUrl: string): string | null {
    const cacheDir = this.getCacheDir();
    if (!cacheDir) return null;
    return `${cacheDir}${this.getCacheFilename(remoteUrl)}`;
  }

  /**
   * Check if a remote media file has already been downloaded to local device cache.
   */
  public async isMediaCached(remoteUrl: string): Promise<boolean> {
    if (!remoteUrl) return false;
    if (remoteUrl.startsWith('/') || remoteUrl.startsWith('file://')) return true;

    const localUri = this.getLocalFileUri(remoteUrl);
    if (!localUri) return false;

    try {
      const info = await FileSystem.getInfoAsync(localUri);
      return info.exists && info.size > 0;
    } catch {
      return false;
    }
  }

  /**
   * Resolves media URI for the player:
   * 1. Returns local file:// URI immediately if already cached.
   * 2. If not cached, triggers background download and returns remote URL for immediate streaming.
   */
  public async resolveOfflineMediaUri(remoteUrl: string): Promise<string> {
    if (!remoteUrl) return '';
    if (remoteUrl.startsWith('/') || remoteUrl.startsWith('file://')) {
      return remoteUrl;
    }

    const localUri = this.getLocalFileUri(remoteUrl);
    if (!localUri) return remoteUrl;

    try {
      const info = await FileSystem.getInfoAsync(localUri);
      if (info.exists && info.size > 0) {
        return localUri;
      }

      // Not cached yet: trigger background download without blocking playback
      this.downloadToCache(remoteUrl).catch((err) => {
        console.warn(`[ExerciseOfflineMediaService] Background caching failed for ${remoteUrl}:`, err);
      });

      return remoteUrl;
    } catch {
      return remoteUrl;
    }
  }

  /**
   * Download a single media asset to local cache. Deduplicates concurrent downloads.
   */
  public async downloadToCache(remoteUrl: string): Promise<string> {
    if (!remoteUrl) return remoteUrl;
    if (remoteUrl.startsWith('/') || remoteUrl.startsWith('file://')) return remoteUrl;

    const localUri = this.getLocalFileUri(remoteUrl);
    if (!localUri) return remoteUrl;

    if (this.pendingDownloads.has(remoteUrl)) {
      return this.pendingDownloads.get(remoteUrl)!;
    }

    const downloadPromise = (async () => {
      try {
        await this.ensureCacheDir();
        const info = await FileSystem.getInfoAsync(localUri);
        if (info.exists && info.size > 0) {
          return localUri;
        }

        const res = await FileSystem.downloadAsync(remoteUrl, localUri);
        if (res.status === 200) {
          return localUri;
        }
        return remoteUrl;
      } catch (err) {
        console.warn(`[ExerciseOfflineMediaService] Download error for ${remoteUrl}:`, err);
        return remoteUrl;
      } finally {
        this.pendingDownloads.delete(remoteUrl);
      }
    })();

    this.pendingDownloads.set(remoteUrl, downloadPromise);
    return downloadPromise;
  }

  /**
   * Pre-fetch all media for an entire workout session or routine.
   */
  public async prefetchWorkoutMedia(
    urls: string[],
    onProgress?: (completed: number, total: number) => void
  ): Promise<void> {
    if (!urls || urls.length === 0) return;

    const validUrls = Array.from(new Set(urls.filter((u) => u && !u.startsWith('/') && !u.startsWith('file://'))));
    let completed = 0;
    const total = validUrls.length;

    const BATCH_SIZE = 3;
    for (let i = 0; i < validUrls.length; i += BATCH_SIZE) {
      const batch = validUrls.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map(async (url) => {
          try {
            await this.downloadToCache(url);
          } catch {
            // continue
          } finally {
            completed++;
            onProgress?.(completed, total);
          }
        })
      );
    }
  }

  /**
   * Get disk usage statistics for cached exercise media.
   */
  public async getOfflineCacheStats(): Promise<OfflineCacheStats> {
    const cacheDir = this.getCacheDir();
    if (!cacheDir) {
      return { totalFiles: 0, totalSizeBytes: 0, totalSizeMB: 0 };
    }

    try {
      await this.ensureCacheDir();
      const files = await FileSystem.readDirectoryAsync(cacheDir);
      let totalBytes = 0;

      for (const file of files) {
        const fileInfo = await FileSystem.getInfoAsync(`${cacheDir}${file}`);
        if (fileInfo.exists && fileInfo.size) {
          totalBytes += fileInfo.size;
        }
      }

      const totalSizeMB = Math.round((totalBytes / (1024 * 1024)) * 100) / 100;
      return {
        totalFiles: files.length,
        totalSizeBytes: totalBytes,
        totalSizeMB,
      };
    } catch {
      return { totalFiles: 0, totalSizeBytes: 0, totalSizeMB: 0 };
    }
  }

  /**
   * Clear all locally cached exercise media to free disk space.
   */
  public async clearOfflineCache(): Promise<void> {
    const cacheDir = this.getCacheDir();
    if (!cacheDir) return;

    try {
      const dirInfo = await FileSystem.getInfoAsync(cacheDir);
      if (dirInfo.exists) {
        await FileSystem.deleteAsync(cacheDir, { idempotent: true });
        await this.ensureCacheDir();
      }
    } catch (e) {
      console.warn('[ExerciseOfflineMediaService] Failed to clear offline cache:', e);
    }
  }
}

export const exerciseOfflineMediaService = ExerciseOfflineMediaService.getInstance();
