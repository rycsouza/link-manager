"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setup = void 0;
const postgres_1 = require("./lib/postgres");
const setup = async () => {
    await (0, postgres_1.sql) `
    CREATE TABLE IF NOT EXISTS short_links(
        id SERIAL PRIMARY KEY,
        code TEXT UNIQUE,
        original_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    `;
    await postgres_1.sql.end();
    console.log("SETUP complete");
};
exports.setup = setup;
