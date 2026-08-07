"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const pino_http_1 = __importDefault(require("pino-http"));
const v1_1 = require("./routes/v1");
const app = (0, express_1.default)();
// Middlewares
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);
// Logging
app.use((0, pino_http_1.default)({
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true
        }
    }
}));
// Routes
app.use('/api/v1', v1_1.v1Router);
// Global Error Handler
app.use((err, req, res, next) => {
    req.log.error(err);
    res.status(err.status || 500).json({
        success: false,
        data: null,
        error: {
            message: err.message || 'Internal Server Error',
            details: err.details || null
        },
        meta: null
    });
});
exports.default = app;
