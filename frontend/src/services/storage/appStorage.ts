import { Platform } from 'react-native';

/**
 * Minimal async-capable key/value storage used by zustand `persist`.
 *  - Web: window.localStorage
 *  - Native: expo-file-system (JSON file per key) so settings survive restarts
 *  - Fallback (tests / unsupported): in-memory
 */
export interface KeyValueStorage {
  getItem: (key: string) => string | null | Promise<string | null>;
  setItem: (key: string, value: string) => void | Promise<void>;
  removeItem: (key: string) => void | Promise<void>;
}

const memory: Record<string, string> = {};

const memoryStorage: KeyValueStorage = {
  getItem: (key) => memory[key] ?? null,
  setItem: (key, value) => {
    memory[key] = value;
  },
  removeItem: (key) => {
    delete memory[key];
  },
};

function createFileStorage(): KeyValueStorage | null {
  try {
    // Lazy require so web / test environments never load the native module.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const FileSystem = require('expo-file-system');
    const dir: string | null | undefined = FileSystem?.documentDirectory;
    if (!dir || typeof FileSystem.readAsStringAsync !== 'function') return null;

    const pathFor = (key: string) => `${dir}${key.replace(/[^a-zA-Z0-9_-]/g, '_')}.json`;

    return {
      getItem: async (key) => {
        try {
          const path = pathFor(key);
          const info = await FileSystem.getInfoAsync(path);
          if (!info.exists) return null;
          return await FileSystem.readAsStringAsync(path);
        } catch {
          return null;
        }
      },
      setItem: async (key, value) => {
        try {
          await FileSystem.writeAsStringAsync(pathFor(key), value);
        } catch {
          // best-effort persistence
        }
      },
      removeItem: async (key) => {
        try {
          await FileSystem.deleteAsync(pathFor(key), { idempotent: true });
        } catch {
          // ignore
        }
      },
    };
  } catch {
    return null;
  }
}

export function getAppStorage(): KeyValueStorage {
  if (typeof window !== 'undefined' && (window as any).localStorage) {
    return (window as any).localStorage as KeyValueStorage;
  }
  if (Platform.OS !== 'web') {
    const fileStorage = createFileStorage();
    if (fileStorage) return fileStorage;
  }
  return memoryStorage;
}
