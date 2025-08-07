"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const volunteer_1 = __importDefault(require("./routes/volunteer"));
require("./workers/childRegistrationWorker");
const prisma_1 = require("./utils/prisma");
const childRegistration_1 = __importDefault(require("./routes/childRegistration"));
const ioredis_1 = __importDefault(require("ioredis"));
exports.redis = new ioredis_1.default({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    maxRetriesPerRequest: null,
});
dotenv_1.default.config();
const PORT = process.env.PORT || 8000;
const NODE_ENV = process.env.NODE_ENV || 'development';
async function connectDB() {
    try {
        await prisma_1.prisma.$connect();
        console.log('✅ Connected to MongoDB (via Prisma)');
    }
    catch (error) {
        console.error('❌ Failed to connect to MongoDB:', error);
        process.exit(1);
    }
}
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)("tiny"));
app.use((0, cors_1.default)({
    origin: '*',
    credentials: false
}));
app.use((0, cookie_parser_1.default)());
// app.get("/api", (_, res: Response) => {
//     return res.status(200).json({
//         status: "healthy"
//     })
// })
app.use('/api/auth', auth_1.default);
app.use('/api/volunteer', volunteer_1.default);
app.use('/api/register', childRegistration_1.default);
async function startServer() {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT} (${NODE_ENV})`);
    });
}
startServer();
