import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

let redis = null;

if (process.env.REDIS_URL) {
  try {
    redis = new Redis(process.env.REDIS_URL);
    redis.on('error', (err) => console.warn('Redis connection error:', err.message));
  } catch (e) {
    console.warn('Failed to initialize Redis:', e.message);
  }
}

/**
 * Cache service wrapper
 */
export const get = async (key) => {
  if (!redis) return null;
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Cache get error:', e.message);
    return null;
  }
};

export const set = async (key, value, ttlSeconds = 3600) => {
  if (!redis) return;
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch (e) {
    console.error('Cache set error:', e.message);
  }
};

export const invalidate = async (key) => {
  if (!redis) return;
  try {
    await redis.del(key);
  } catch (e) {
    console.error('Cache del error:', e.message);
  }
};

/**
 * Get repository data from cache
 * @param {string} url GitHub repository URL
 * @param {string} branch Branch name (default: main)
 */
export const getRepoData = async (url, branch = 'main') => {
  try {
    // Extract owner/repo
    const parts = url.replace('https://github.com/', '').split('/');
    if (parts.length < 2) return null;
    
    const owner = parts[0];
    const repo = parts[1].replace('.git', '');
    const cacheKey = `analysis:${owner}:${repo}:${branch}`;
    
    return await get(cacheKey);
  } catch (e) {
    console.error('getRepoData error:', e.message);
    return null;
  }
};
