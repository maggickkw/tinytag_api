import { Queue } from "bullmq";
import { redis } from "../utils/redis";


export const bulkChildRegistrationQueue = new Queue("child-registration", {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 1000 },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});