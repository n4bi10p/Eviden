import { createClient, RedisClientType } from 'redis';
import config from '../config';

export class RedisService {
  private static instance: RedisService;
  private client: RedisClientType;
  private isConnected: boolean = false;

  private constructor() {
    this.client = createClient({
      url: config.REDIS_URL,
      password: config.REDIS_PASSWORD,
      socket: {
        connectTimeout: 5000,
      },
    });

    this.setupEventListeners();
  }

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  private setupEventListeners(): void {
    this.client.on('connect', () => {
      console.log('Redis client connecting...');
    });

    this.client.on('ready', () => {
      console.log('Redis client connected and ready');
      this.isConnected = true;
    });

    this.client.on('error', (error) => {
      console.error('Redis client error:', error);
      this.isConnected = false;
    });

    this.client.on('end', () => {
      console.log('Redis client disconnected');
      this.isConnected = false;
    });

    this.client.on('reconnecting', () => {
      console.log('Redis client reconnecting...');
    });
  }

  public async connect(): Promise<void> {
    try {
      if (!this.isConnected) {
        await this.client.connect();
      }
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      if (this.isConnected) {
        await this.client.disconnect();
      }
    } catch (error) {
      console.error('Failed to disconnect from Redis:', error);
      throw error;
    }
  }

  public getClient(): RedisClientType {
    return this.client;
  }

  public isClientConnected(): boolean {
    return this.isConnected;
  }

  // Basic Redis operations
  public async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      console.error(`Redis GET error for key ${key}:`, error);
      return null;
    }
  }

  public async set(key: string, value: string, ttl?: number): Promise<boolean> {
    try {
      if (ttl) {
        await this.client.setEx(key, ttl, value);
      } else {
        await this.client.set(key, value);
      }
      return true;
    } catch (error) {
      console.error(`Redis SET error for key ${key}:`, error);
      return false;
    }
  }

  public async setex(key: string, seconds: number, value: string): Promise<boolean> {
    try {
      await this.client.setEx(key, seconds, value);
      return true;
    } catch (error) {
      console.error(`Redis SETEX error for key ${key}:`, error);
      return false;
    }
  }

  public async del(key: string): Promise<boolean> {
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error(`Redis DEL error for key ${key}:`, error);
      return false;
    }
  }

  public async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Redis EXISTS error for key ${key}:`, error);
      return false;
    }
  }

  public async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      console.error(`Redis TTL error for key ${key}:`, error);
      return -1;
    }
  }

  public async expire(key: string, seconds: number): Promise<boolean> {
    try {
      await this.client.expire(key, seconds);
      return true;
    } catch (error) {
      console.error(`Redis EXPIRE error for key ${key}:`, error);
      return false;
    }
  }

  // Hash operations
  public async hget(key: string, field: string): Promise<string | null> {
    try {
      const result = await this.client.hGet(key, field);
      return result || null;
    } catch (error) {
      console.error(`Redis HGET error for key ${key}, field ${field}:`, error);
      return null;
    }
  }

  public async hset(key: string, field: string, value: string): Promise<boolean> {
    try {
      await this.client.hSet(key, field, value);
      return true;
    } catch (error) {
      console.error(`Redis HSET error for key ${key}, field ${field}:`, error);
      return false;
    }
  }

  public async hgetall(key: string): Promise<Record<string, string> | null> {
    try {
      return await this.client.hGetAll(key);
    } catch (error) {
      console.error(`Redis HGETALL error for key ${key}:`, error);
      return null;
    }
  }

  public async hmset(key: string, hash: Record<string, string>): Promise<boolean> {
    try {
      await this.client.hSet(key, hash);
      return true;
    } catch (error) {
      console.error(`Redis HMSET error for key ${key}:`, error);
      return false;
    }
  }

  public async hdel(key: string, field: string): Promise<boolean> {
    try {
      await this.client.hDel(key, field);
      return true;
    } catch (error) {
      console.error(`Redis HDEL error for key ${key}, field ${field}:`, error);
      return false;
    }
  }

  // List operations
  public async lpush(key: string, value: string): Promise<boolean> {
    try {
      await this.client.lPush(key, value);
      return true;
    } catch (error) {
      console.error(`Redis LPUSH error for key ${key}:`, error);
      return false;
    }
  }

  public async rpush(key: string, value: string): Promise<boolean> {
    try {
      await this.client.rPush(key, value);
      return true;
    } catch (error) {
      console.error(`Redis RPUSH error for key ${key}:`, error);
      return false;
    }
  }

  public async lpop(key: string): Promise<string | null> {
    try {
      return await this.client.lPop(key);
    } catch (error) {
      console.error(`Redis LPOP error for key ${key}:`, error);
      return null;
    }
  }

  public async rpop(key: string): Promise<string | null> {
    try {
      return await this.client.rPop(key);
    } catch (error) {
      console.error(`Redis RPOP error for key ${key}:`, error);
      return null;
    }
  }

  public async lrange(key: string, start: number, stop: number): Promise<string[]> {
    try {
      return await this.client.lRange(key, start, stop);
    } catch (error) {
      console.error(`Redis LRANGE error for key ${key}:`, error);
      return [];
    }
  }

  public async llen(key: string): Promise<number> {
    try {
      return await this.client.lLen(key);
    } catch (error) {
      console.error(`Redis LLEN error for key ${key}:`, error);
      return 0;
    }
  }

  // Set operations
  public async sadd(key: string, member: string): Promise<boolean> {
    try {
      await this.client.sAdd(key, member);
      return true;
    } catch (error) {
      console.error(`Redis SADD error for key ${key}:`, error);
      return false;
    }
  }

  public async srem(key: string, member: string): Promise<boolean> {
    try {
      await this.client.sRem(key, member);
      return true;
    } catch (error) {
      console.error(`Redis SREM error for key ${key}:`, error);
      return false;
    }
  }

  public async smembers(key: string): Promise<string[]> {
    try {
      return await this.client.sMembers(key);
    } catch (error) {
      console.error(`Redis SMEMBERS error for key ${key}:`, error);
      return [];
    }
  }

  public async sismember(key: string, member: string): Promise<boolean> {
    try {
      return await this.client.sIsMember(key, member);
    } catch (error) {
      console.error(`Redis SISMEMBER error for key ${key}:`, error);
      return false;
    }
  }

  // Cache helpers
  public async cache<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    ttl: number = 3600
  ): Promise<T> {
    try {
      // Try to get from cache first
      const cached = await this.get(key);
      if (cached) {
        return JSON.parse(cached);
      }

      // Fetch fresh data
      const freshData = await fetchFunction();
      
      // Cache the result
      await this.setex(key, ttl, JSON.stringify(freshData));
      
      return freshData;
    } catch (error) {
      console.error(`Cache error for key ${key}:`, error);
      // If cache fails, still return the fresh data
      return await fetchFunction();
    }
  }

  public async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } catch (error) {
      console.error(`Error invalidating pattern ${pattern}:`, error);
    }
  }

  // Health check
  public async healthCheck(): Promise<boolean> {
    try {
      await this.client.ping();
      return true;
    } catch (error) {
      console.error('Redis health check failed:', error);
      return false;
    }
  }
}
