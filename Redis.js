import Redis from 'ioredis';

const redis = new Redis({
  host: '127.0.0.1',
  port: 6379,
});

export const setValue = async (key, value, expiry = 60) => {
  return await redis.set(key, JSON.stringify(value), 'EX', expiry);
};

export const getValue = async (key) => {
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
};

process.on('SIGINT', async () => {
  await redis.quit();
  console.log('Redis connection closed.');
  process.exit(0);
});
