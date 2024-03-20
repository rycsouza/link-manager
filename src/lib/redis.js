"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
const redis_1 = require("redis");
const dotenv_1 = __importDefault(require("dotenv"));
const ENV = dotenv_1.default.config().parsed;
exports.redis = (0, redis_1.createClient)({
    url: `redis://:docker@localhost:${ENV.DB_REDIS_PORT}`,
});
exports.redis.connect();
