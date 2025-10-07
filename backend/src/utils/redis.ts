import { createClient } from "redis";

const redis = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redis.on("error", (err) => console.error("Redis Error:", err));
redis.on("connect", () => console.log("Redis connected"));

(async () => {
  try {
    await redis.connect();
  } catch (err) {
    console.error("Redis connection failed:", err);
  }
})();

export default redis;
