"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const fastify_1 = __importDefault(require("fastify"));
const zod_1 = require("zod");
const postgres_1 = require("./src/lib/postgres");
const redis_1 = require("./src/lib/redis");
const Handler_1 = require("./src/exceptions/Handler");
const ENV = dotenv_1.default.config().parsed;
const app = (0, fastify_1.default)();
app.get("/:code", async (request, reply) => {
    const getLinkSchema = zod_1.z.object({
        code: zod_1.z.string().min(3),
    });
    const { code } = getLinkSchema.parse(request.params);
    try {
        const link = (await (0, postgres_1.sql) `
    SELECT id, original_url
    FROM short_links
    WHERE code = ${code}
  `)[0];
        if (!link)
            return reply.status(400).send({ message: "Link NOT FOUND" });
        await redis_1.redis.zIncrBy("metrics", 1, String(link.id));
        return reply.redirect(301, link.original_url);
    }
    catch (error) {
        throw (0, Handler_1.handler)(error);
    }
});
app.get("/api/links", async () => {
    try {
        const result = await (0, postgres_1.sql) `
    SELECT id, code, original_url, created_at
    FROM short_links
    ORDER BY created_at DESC
   `;
        return result;
    }
    catch (error) {
        throw (0, Handler_1.handler)(error);
    }
});
app.post("/api/links", async (request, reply) => {
    const createLinkSchema = zod_1.z.object({
        code: zod_1.z.string().min(3),
        url: zod_1.z.string().url(),
    });
    const { code, url } = createLinkSchema.parse(request.body);
    try {
        const link = (await (0, postgres_1.sql) `INSERT INTO short_links (code, original_url) VALUES (${code}, ${url}) RETURNING code`)[0];
        return reply.status(201).send({ shortLink: link.code });
    }
    catch (error) {
        throw (0, Handler_1.handler)(error);
    }
});
app.delete("/api/links", async (request) => {
    const deleteLinkSchema = zod_1.z.object({
        code: zod_1.z.string().min(3),
    });
    const { code } = deleteLinkSchema.parse(request.body);
    try {
        await (0, postgres_1.sql) `DELETE FROM short_links WHERE code = ${code};`;
        return true;
    }
    catch (error) {
        throw (0, Handler_1.handler)(error);
    }
});
app.get("/api/metrics", async () => {
    const result = await redis_1.redis.zRangeByScoreWithScores("metrics", 0, 50);
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
const HOST = ENV.HOST;
const PORT = Number(ENV.PORT);
app
    .listen({
    host: HOST,
    port: PORT,
})
    .then(async () => {
    console.log(`Server is running | ${PORT}`);
});
