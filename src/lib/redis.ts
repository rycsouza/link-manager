import { createClient } from "redis";
import Env from "dotenv";

const ENV = Env.config().parsed;

export const redis = createClient({
  url: `redis://:docker@localhost:${ENV!.DB_REDIS_PORT}`,
});

redis.connect();
