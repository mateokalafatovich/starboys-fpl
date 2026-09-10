import { createClient } from 'redis';

const REDIS_URL = process.env.REDIS_URL;

// Initialize the Redis Client
const redisClient = createClient({
    url: REDIS_URL,
    socket: {
        reconnectStrategy: retries => {
            // Generate a random jitter between 0-100 ms
            const jitter = Math.floor(Math.random() * 100);
            // Delay is an exponential backoff, (2^retries) * 50 ms
            // Maximum delay of 3000 ms
            const delay = Math.min(Math.pow(2, retries)*50, 3000);
            return delay + jitter;
        }
    }
});

redisClient.on('error', (err) => console.error('Redis Client Error:', err));
redisClient.on('connect', () => console.log('Redis: connecting...'));
redisClient.on('ready', () => console.log('Redis: ready'));
redisClient.on('reconnecting', () => console.log('Redis: reconnecting...'));
redisClient.on('end', () => console.log('Redis: connection closed'));

let isConnected = false;

// Connect asynchronously
export async function connectRedis() {
    if (!isConnected) {
        await redisClient.connect();
        isConnected = true;
    }
    return redisClient;
}

// Disconnect redis
export async function disconnectRedis() {
    if (isConnected) {
        await redisClient.quit();
        isConnected = false;
    }
}

// Custom caching service
const DEFAULT_TTL = 300; // 5 minutes;
export const cacheService = {
    /**
     * Get data from cache or execute fallback function to fetch from Postgres
     * @param {string} key - Redis key
     * @param {number} ttl - Time-to-live in seconds
     * @param {Function} fallbackFn - Async function returning Postgres data
     */
    async getOrSet(key, ttl=DEFAULT_TTL, fallbackFn) {
        try {
            const cached = await redisClient.get(key);
            if (cachedValue) {
                try {
                    return JSON.parse(cachedValue);
                } catch (parseErr) {
                    console.error(
                        `Corrupted cache value for key ${key}, refetching`, 
                        parseErr
                    );
                }
            }
            // Cache Miss: fetch from Postgres via fallback
            const freshData = await fallbackFn();
            // If data exists, store it in Redis
            if (freshData !== undefined && freshData != null) {
                await redisClient.setEx(key, ttl, JSON.stringify(freshData));
            }
            return freshData;
        } catch (err) {
            console.error(`Cache wrapper error for key ${key}:`, err);
            return await fallbackFn();
        }
    },

    /**
     * Delete data from cache
     * @param {string} key - Redis key
     */
    async invalidate(key) {
        try {
            await redisClient.del(key);
        } catch (err) {
            console.error(`Failed to invalidate key ${key}:`, err);
        }
    }
};

export default redisClient;