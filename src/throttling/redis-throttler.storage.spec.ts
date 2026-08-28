import { RedisThrottlerStorage } from './redis-throttler.storage';

describe('RedisThrottlerStorage (AC-11 wiring)', () => {
  it('blocks after limit in memory fallback', async () => {
    const storage = new RedisThrottlerStorage('');
    const ttl = 60_000;
    const limit = 2;

    const first = await storage.increment('ip:1', ttl, limit, ttl, 'login');
    const second = await storage.increment('ip:1', ttl, limit, ttl, 'login');
    const third = await storage.increment('ip:1', ttl, limit, ttl, 'login');

    expect(first.isBlocked).toBe(false);
    expect(second.isBlocked).toBe(false);
    expect(third.isBlocked).toBe(true);
    expect(third.totalHits).toBe(3);

    await storage.onModuleDestroy();
  });
});
