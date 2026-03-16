import { RateLimiterMemory } from "rate-limiter-flexible";
const limiter = new RateLimiterMemory({ points: 100, duration: 60 });
const aiLimiter = new RateLimiterMemory({ points: 20, duration: 60 });
export async function rateLimiter(req, res, next) {
  try {
    await limiter.consume(req.ip);
    next();
  } catch {
    res.status(429).json({ message: "Too many requests, please try again later" });
  }
}
export async function aiRateLimiter(req, res, next) {
  try {
    await aiLimiter.consume(req.ip);
    next();
  } catch {
    res.status(429).json({ message: "AI rate limit exceeded, please wait a moment" });
  }
}
