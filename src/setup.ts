import { sql } from "./lib/postgres";

export const setup = async () => {
  await sql`
    CREATE TABLE IF NOT EXISTS short_links(
        id SERIAL PRIMARY KEY,
        code TEXT UNIQUE,
        original_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    `;

  await sql.end();

  console.log("SETUP complete");
};
