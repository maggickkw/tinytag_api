"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const prisma_1 = require("../utils/prisma");
const redis_1 = require("../utils/redis");
const childRegistration_schema_1 = require("../schemas/childRegistration.schema");
const helper_1 = require("../utils/helper");
const bulkChildRegistrationWorker = new bullmq_1.Worker('child-registration', async (job) => {
    console.log(`🔄 Processing bulk job ${job.id}...`);
    try {
        const result = childRegistration_schema_1.bulkRegistrationSchema.safeParse(job.data);
        if (!result.success) {
            console.error(` Bulk job ${job.id} validation failed:`, result.error.flatten());
            throw new Error(`Validation failed: ${result.error.issues.map(i => i.message).join(', ')}`);
        }
        const { registrations } = result.data;
        console.log(`📝 Creating ${registrations.length} child registrations...`);
        await job.updateProgress(25);
        let createdCount = 0;
        for (const reg of registrations) {
            try {
                await prisma_1.prisma.childRegistration.create({
                    data: {
                        ...reg,
                        registrationDate: (0, helper_1.ensureValidISODate)(reg.registrationDate),
                        ...(reg.dateOfBirth && { dateOfBirth: (0, helper_1.ensureValidISODate)(reg.dateOfBirth) }),
                    },
                });
                createdCount++;
            }
            catch (err) {
                console.error(`❌ Failed to create registration for ${reg.firstName} ${reg.lastName}:`, err);
                // Optionally: track failed entries
            }
        }
        await job.updateProgress(75);
        console.log(`✅ Bulk job ${job.id} processed successfully`);
        console.log(`📊 Created ${createdCount} new registrations`);
        await job.updateProgress(100);
        return {
            success: true,
            totalProcessed: registrations.length,
            totalCreated: createdCount,
            processedAt: new Date().toISOString(),
        };
    }
    catch (error) {
        console.error(`❌ Error processing bulk job ${job.id}:`, error);
        throw error;
    }
}, {
    connection: redis_1.redis,
    concurrency: 5,
});
// Event handlers remain unchanged
bulkChildRegistrationWorker.on('failed', (job, err) => {
    console.error(`❌ Bulk job ${job?.id} failed:`, err.message);
});
bulkChildRegistrationWorker.on('completed', (job) => {
    console.log(`✅ Bulk job ${job.id} completed successfully`);
    if (job.returnvalue) {
        console.log(`📊 Summary:`, job.returnvalue);
    }
});
bulkChildRegistrationWorker.on('stalled', (jobId) => {
    console.warn(`⚠️  Job ${jobId} stalled`);
});
bulkChildRegistrationWorker.on('error', (err) => {
    console.error('❌ Worker error:', err);
});
exports.default = bulkChildRegistrationWorker;
