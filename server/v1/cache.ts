import Redis, { type Redis as RedisClient } from 'ioredis';

export interface CacheClient {
  getJson<T>(key: string): Promise<T | null>;
  setJson<T>(key: string, value: T, ttlSeconds: number): Promise<void>;
  rpushJson<T>(key: string, value: T): Promise<void>;
  lrangeJson<T>(key: string, start: number, stop: number): Promise<T[]>;
  incrWithTtl(key: string, ttlSeconds: number): Promise<number>;
  incrByWithTtl(key: string, amount: number, ttlSeconds: number): Promise<number>;
  close(): Promise<void>;
}

export class MemoryCache implements CacheClient {
  private values = new Map<string, { value: unknown; expiresAt: number }>();
  private lists = new Map<string, unknown[]>();
  private counters = new Map<string, { value: number; expiresAt: number }>();

  async getJson<T>(key: string): Promise<T | null> {
    const item = this.values.get(key);
    if (!item || item.expiresAt < Date.now()) return null;
    return item.value as T;
  }

  async setJson<T>(key: string, value: T, ttlSeconds: number) {
    this.values.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  }

  async rpushJson<T>(key: string, value: T) {
    const list = this.lists.get(key) || [];
    list.push(value);
    this.lists.set(key, list.slice(-500));
  }

  async lrangeJson<T>(key: string, start: number, stop: number) {
    const list = this.lists.get(key) || [];
    const end = stop < 0 ? undefined : stop + 1;
    return list.slice(start, end) as T[];
  }

  async incrWithTtl(key: string, ttlSeconds: number) {
    return this.incrByWithTtl(key, 1, ttlSeconds);
  }

  async incrByWithTtl(key: string, amount: number, ttlSeconds: number) {
    const current = this.counters.get(key);
    if (!current || current.expiresAt < Date.now()) {
      this.counters.set(key, { value: amount, expiresAt: Date.now() + ttlSeconds * 1000 });
      return amount;
    }
    current.value += amount;
    return current.value;
  }

  async close() {}
}

export class RedisCache implements CacheClient {
  private redis: RedisClient;

  constructor(url: string) {
    this.redis = new Redis(url, { lazyConnect: true, maxRetriesPerRequest: 1 });
  }

  async getJson<T>(key: string) {
    const raw = await this.redis.get(key);
    return raw ? JSON.parse(raw) as T : null;
  }

  async setJson<T>(key: string, value: T, ttlSeconds: number) {
    await this.redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  }

  async rpushJson<T>(key: string, value: T) {
    await this.redis.rpush(key, JSON.stringify(value));
    await this.redis.ltrim(key, -500, -1);
  }

  async lrangeJson<T>(key: string, start: number, stop: number) {
    const rows: string[] = await this.redis.lrange(key, start, stop);
    return rows.map((row) => JSON.parse(row) as T);
  }

  async incrWithTtl(key: string, ttlSeconds: number) {
    return this.incrByWithTtl(key, 1, ttlSeconds);
  }

  async incrByWithTtl(key: string, amount: number, ttlSeconds: number) {
    const value = await this.redis.incrby(key, amount);
    if (value === amount) await this.redis.expire(key, ttlSeconds);
    return value;
  }

  async close() {
    this.redis.disconnect();
  }
}

export function createCache() {
  return process.env.REDIS_URL ? new RedisCache(process.env.REDIS_URL) : new MemoryCache();
}
