"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sql = void 0;
const postgres_1 = __importDefault(require("postgres"));
const dotenv_1 = __importDefault(require("dotenv"));
const ENV = dotenv_1.default.config().parsed;
exports.sql = (0, postgres_1.default)(`postgresql://docker:docker@localhost:${ENV.DB_POSTGRES_PORT}/shortlinks`);
