const lastRequestTime = new Map<string, number>();

// Test helper function to clear rate limiting state
export const clearRateLimitState = () => {
  lastRequestTime.clear();
};

export const checkRateLimit = (username: string, limitMs: number = 10_000): boolean => {
  const lastTime = lastRequestTime.get(username);
  if (lastTime && Date.now() - lastTime < limitMs) {
    return false; // Rate limited
  }
  lastRequestTime.set(username, Date.now());
  return true; // Not rate limited
}; 