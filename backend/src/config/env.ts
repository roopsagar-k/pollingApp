import dotenv from "dotenv";

dotenv.config();

export const ENV = {
  socketPort: process.env.SOCKET_PORT || 3000,
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
};
