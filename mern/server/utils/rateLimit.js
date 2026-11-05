// Tiny in-memory limiter used to slow down guessing of passwords / access codes.
function createLimiter({ max = 5, windowMs = 15 * 60 * 1000 } = {}) {
  const store = new Map();

  const live = (key) => {
    const entry = store.get(key);
    if (entry && entry.reset <= Date.now()) {
      store.delete(key);
      return null;
    }
    return entry || null;
  };

  setInterval(() => {
    for (const key of store.keys()) live(key);
  }, 10 * 60 * 1000).unref();

  return {
    // seconds until the next attempt is allowed (0 = allowed now)
    retryAfter(key) {
      const e = live(key);
      return e && e.count >= max ? Math.ceil((e.reset - Date.now()) / 1000) : 0;
    },
    fail(key) {
      const e = live(key) || { count: 0, reset: Date.now() + windowMs };
      e.count += 1;
      store.set(key, e);
    },
    clear(key) {
      store.delete(key);
    },
  };
}

module.exports = { createLimiter };
