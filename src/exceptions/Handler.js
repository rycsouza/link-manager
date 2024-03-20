"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const postgres_1 = __importDefault(require("postgres"));
let thisCode;
let thisStatus;
let thisMessage;
const handler = (error, code = null, message = null) => {
    thisCode = code ? code : error.code;
    thisStatus = error.status;
    thisMessage = message ? message : error.message;
    if (!thisCode || !thisStatus || !thisMessage)
        handleError(error);
    return {
        status: thisStatus,
        message: thisCode + thisMessage,
    };
};
exports.handler = handler;
const handleError = (error) => {
    if (error.status === 400)
        thisCode = "BAD_REQUEST";
    else if (error.status === 500) {
        thisCode = "INTERNAL_ERROR";
        thisMessage = "Ocorreu um erro inesperado!";
    }
    if (error instanceof postgres_1.default.PostgresError) {
        if (error.code === "23505") {
            thisMessage = "Duplicated CODE.";
        }
    }
};
