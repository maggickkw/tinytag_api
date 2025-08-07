"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkChildRegistrationQueue = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("../utils/redis");
exports.bulkChildRegistrationQueue = new bullmq_1.Queue("child-registration", {
    connection: redis_1.redis,
    defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 1000 },
        removeOnComplete: 100,
        removeOnFail: 50,
    },
});
