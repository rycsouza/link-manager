import postgres from "postgres";
import Env from "dotenv";

const ENV = Env.config().parsed;

export const sql = postgres(
  `postgresql://docker:docker@localhost:${ENV!.DB_POSTGRES_PORT}/shortlinks`
);
