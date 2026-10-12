/** Minimal key-value interface so game state can be tested without a browser. */
export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function memoryStorage(): KeyValueStorage {
  const data = new Map<string, string>();
  return {
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
}

/**
 * localStorage when it works, otherwise an in-memory fallback (private
 * browsing, blocked storage, quota errors). Never throws.
 */
export function browserStorage(): KeyValueStorage {
  const fallback = memoryStorage();
  let ls: Storage | null = null;
  try {
    ls = globalThis.localStorage ?? null;
    ls?.getItem('cd:probe');
  } catch {
    ls = null;
  }
  if (!ls) return fallback;
  const store = ls;
  return {
    getItem: (k) => {
      try {
        return store.getItem(k);
      } catch {
        return fallback.getItem(k);
      }
    },
    setItem: (k, v) => {
      try {
        store.setItem(k, v);
      } catch {
        fallback.setItem(k, v);
      }
    },
    removeItem: (k) => {
      try {
        store.removeItem(k);
      } catch {
        fallback.removeItem(k);
      }
    },
  };
}
