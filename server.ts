import Env from "dotenv";
import fastify from "fastify";
import postgres from "postgres";
import { z } from "zod";

import { sql } from "./src/lib/postgres";
import { redis } from "./src/lib/redis";

const ENV = Env.config().parsed;

const app = fastify();

app.get("/:code", async (request, reply) => {
  const getLinkSchema = z.object({
    code: z.string().min(3),
  });

  const { code } = getLinkSchema.parse(request.params);

  const link = (
    await sql`
    SELECT id, original_url
    FROM short_links
    WHERE code = ${code}
  `
  )[0];

  if (!link) return reply.status(400).send({ message: "Link NOT FOUND" });

  await redis.zIncrBy("metrics", 1, String(link.id));

  return reply.redirect(301, link.original_url);
});

app.get("/api/links", async () => {
  const result = await sql`
    SELECT id, code, original_url, created_at
    FROM short_links
    ORDER BY created_at DESC
   `;

  return result;
});

app.post("/api/links", async (request, reply) => {
  const createLinkSchema = z.object({
    code: z.string().min(3),
    url: z.string().url(),
  });

  const { code, url } = createLinkSchema.parse(request.body);

  try {
    const link = (
      await sql`INSERT INTO short_links (code, original_url) VALUES (${code}, ${url}) RETURNING code`
    )[0];

    return reply.status(201).send({ shortLink: link.code });
  } catch (error) {
    if (error instanceof postgres.PostgresError) {
      if (error.code === "23505") {
        return reply.status(400).send({ message: "Duplicated CODE." });
      }
    }

    return reply.status(500).send({ message: "Internal error." });
  }
});

app.get("/api/metrics", async () => {
  const result = await redis.zRangeByScoreWithScores("metrics", 0, 50);

  const metrics = result
    .sort((a, b) => b.score - a.score)
    .map((item) => {
      return {
        ShortLinkId: Number(item.value),
        clicks: item.score,
      };
    });

  return metrics;
});

const HOST = ENV!.HOST;
const PORT = Number(ENV!.PORT);

app
  .listen({
    host: HOST,
    port: PORT,
  })
  .then(() => {
    console.log(`Server is running | ${PORT}`);
  });
