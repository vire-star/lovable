import { createClient } from "redis";

let redisClient = null;

export const getRedisClient = async () => {
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  redisClient = createClient({
    socket: {
      host: "redis",
      port: 6379,
    },
  });

  redisClient.on("connect", () => {
    console.log("✅ Redis connected");
  });

  redisClient.on("error", (err) => {
    console.error("❌ Redis error", err);
  });

  await redisClient.connect();
  return redisClient;
};

// Optional: Export direct client for immediate use after first initialization
export { redisClient };
