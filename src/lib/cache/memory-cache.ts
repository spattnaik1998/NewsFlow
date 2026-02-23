interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  createdAt: number;
}

class MemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();

  set<T>(key: string, data: T, ttlMs: number): void {
    this.store.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
      createdAt: Date.now(),
    });
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.store.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return false;
    }
    return true;
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  getMetadata(key: string): { createdAt: number; expiresAt: number } | null {
    const entry = this.store.get(key);
    if (!entry || Date.now() > entry.expiresAt) return null;
    return { createdAt: entry.createdAt, expiresAt: entry.expiresAt };
  }

  size(): number {
    // Clean expired entries first
    for (const [key, entry] of this.store.entries()) {
      if (Date.now() > entry.expiresAt) this.store.delete(key);
    }
    return this.store.size;
  }
}

// Singleton — survives between hot-reload requests in dev
declare global {
  // eslint-disable-next-line no-var
  var __memoryCache: MemoryCache | undefined;
}

export const cache: MemoryCache = global.__memoryCache ?? (global.__memoryCache = new MemoryCache());
