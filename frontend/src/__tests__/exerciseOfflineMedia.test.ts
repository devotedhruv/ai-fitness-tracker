import { ExerciseOfflineMediaService } from '../services/exerciseMedia/ExerciseOfflineMediaService';
import { resolveCatalogMedia } from '../services/exerciseMedia/exerciseCatalogMedia';
import { exerciseMediaManager } from '../services/exerciseMedia/ExerciseMediaProvider';

// Mock expo-file-system
const mockFiles: Record<string, { exists: boolean; size: number }> = {};

jest.mock('expo-file-system', () => ({
  documentDirectory: 'file:///mock/data/user/0/fittrack/',
  getInfoAsync: jest.fn(async (uri: string) => {
    if (mockFiles[uri]) {
      return { exists: mockFiles[uri].exists, size: mockFiles[uri].size, isDirectory: false };
    }
    return { exists: false, size: 0, isDirectory: false };
  }),
  makeDirectoryAsync: jest.fn(async () => {}),
  downloadAsync: jest.fn(async (url: string, localUri: string) => {
    mockFiles[localUri] = { exists: true, size: 102400 };
    return { status: 200, uri: localUri };
  }),
  readDirectoryAsync: jest.fn(async () => Object.keys(mockFiles).map((k) => k.split('/').pop()!)),
  deleteAsync: jest.fn(async () => {
    for (const key of Object.keys(mockFiles)) {
      delete mockFiles[key];
    }
  }),
}));

describe('ExerciseOfflineMediaService & Universal Catalog Tests', () => {
  let service: ExerciseOfflineMediaService;

  beforeEach(() => {
    service = ExerciseOfflineMediaService.getInstance();
    for (const key of Object.keys(mockFiles)) {
      delete mockFiles[key];
    }
  });

  describe('resolveCatalogMedia', () => {
    it('resolves Barbell Bench Press from the universal 1,324 catalog', () => {
      const media = resolveCatalogMedia('Barbell Bench Press');
      expect(media).not.toBeNull();
      expect(media?.videoUrl).toContain('0025-EIeI8Vf.gif');
      expect(media?.imageUrl).toContain('0025-EIeI8Vf.jpg');
    });

    it('resolves fraction-named 3/4 sit-up from the universal catalog', () => {
      const media = resolveCatalogMedia('3/4 sit-up');
      expect(media).not.toBeNull();
      expect(media?.videoUrl).toContain('0001-2gPfomN.gif');
    });

    it('resolves by numeric external ID', () => {
      const media = resolveCatalogMedia('0043');
      expect(media).not.toBeNull();
      expect(media?.videoUrl).toContain('0043-qXTaZnJ.gif');
    });
  });

  describe('ExerciseOfflineMediaService', () => {
    it('generates consistent cache filenames', () => {
      const filename = service.getCacheFilename('https://example.com/videos/0025-EIeI8Vf.gif');
      expect(filename).toBe('0025-EIeI8Vf.gif');
    });

    it('identifies un-cached files', async () => {
      const cached = await service.isMediaCached('https://example.com/videos/0025-EIeI8Vf.gif');
      expect(cached).toBe(false);
    });

    it('downloads and caches media locally', async () => {
      const url = 'https://example.com/videos/0025-EIeI8Vf.gif';
      const localUri = await service.downloadToCache(url);
      expect(localUri).toContain('0025-EIeI8Vf.gif');

      const isCached = await service.isMediaCached(url);
      expect(isCached).toBe(true);
    });

    it('resolves cached media directly as file:// URI', async () => {
      const url = 'https://example.com/videos/0025-EIeI8Vf.gif';
      await service.downloadToCache(url);

      const resolved = await service.resolveOfflineMediaUri(url);
      expect(resolved).toContain('file://');
      expect(resolved).toContain('0025-EIeI8Vf.gif');
    });

    it('pre-fetches all media for a workout routine', async () => {
      const urls = [
        'https://example.com/videos/0025-EIeI8Vf.gif',
        'https://example.com/videos/0043-qXTaZnJ.gif',
        'https://example.com/videos/0662-I4hDWkc.gif',
      ];

      let completedCount = 0;
      await service.prefetchWorkoutMedia(urls, (completed, total) => {
        completedCount = completed;
      });

      expect(completedCount).toBe(3);
      for (const u of urls) {
        expect(await service.isMediaCached(u)).toBe(true);
      }
    });

    it('reports cache disk statistics correctly', async () => {
      await service.downloadToCache('https://example.com/videos/0001.gif');
      await service.downloadToCache('https://example.com/videos/0002.gif');

      const stats = await service.getOfflineCacheStats();
      expect(stats.totalFiles).toBeGreaterThanOrEqual(2);
      expect(stats.totalSizeBytes).toBeGreaterThan(0);
    });
  });

  describe('exerciseMediaManager integration with Universal Catalog', () => {
    it('automatically attaches 3D animation video for any catalog exercise', () => {
      const media = exerciseMediaManager.getMedia({
        name: 'Air Bike',
        primaryMuscle: 'Abs',
      });

      expect(media.videoUrl).toContain('0003-1ZFqTDN.gif');
      expect(media.mediaType).toBe('GIF');
      expect(media.mediaSource).toBe('hasaneyldrm/exercises-dataset');
    });
  });
});
