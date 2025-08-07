"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQueueStats = exports.getRegistrations = exports.getJobStatus = exports.registerChildrenBulk = void 0;
const childRegistration_schema_1 = require("../schemas/childRegistration.schema");
const childRegistrationQueue_1 = require("../queues/childRegistrationQueue");
const zod_1 = require("zod");
const prisma_1 = require("../utils/prisma");
// Bulk registration endpoint (for offline sync)
const registerChildrenBulk = async (req, res) => {
    try {
        const validatedData = childRegistration_schema_1.bulkRegistrationSchema.parse(req.body);
        // Add the entire bulk payload to queue as a single job
        const job = await childRegistrationQueue_1.bulkChildRegistrationQueue.add('child-registration', validatedData, // Send entire payload with registrations array
        {
            priority: 2,
            jobId: `bulk-${Date.now()}-${Math.random()}`,
        });
        res.status(202).json({
            success: true,
            message: `${validatedData.registrations.length} registrations queued for processing`,
            jobId: job.id,
            totalRegistrations: validatedData.registrations.length,
        });
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: error.issues,
            });
        }
        console.error('Error queuing bulk child registrations:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.registerChildrenBulk = registerChildrenBulk;
const getJobStatus = async (req, res) => {
    try {
        const { jobId } = req.params;
        const job = await childRegistrationQueue_1.bulkChildRegistrationQueue.getJob(jobId);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found',
            });
        }
        const state = await job.getState();
        res.json({
            success: true,
            job: {
                id: job.id,
                state,
                progress: job.progress,
                data: job.data,
                returnvalue: job.returnvalue,
                failedReason: job.failedReason,
                processedOn: job.processedOn,
                finishedOn: job.finishedOn,
            },
        });
    }
    catch (error) {
        console.error('Error getting job status:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.getJobStatus = getJobStatus;
const getRegistrations = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const [registrations, total] = await Promise.all([
            prisma_1.prisma.childRegistration.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma_1.prisma.childRegistration.count(),
        ]);
        res.json({
            success: true,
            data: registrations,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        console.error('Error getting registrations:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.getRegistrations = getRegistrations;
const getQueueStats = async (req, res) => {
    try {
        const [waiting, active, completed, failed] = await Promise.all([
            childRegistrationQueue_1.bulkChildRegistrationQueue.getWaiting(),
            childRegistrationQueue_1.bulkChildRegistrationQueue.getActive(),
            childRegistrationQueue_1.bulkChildRegistrationQueue.getCompleted(),
            childRegistrationQueue_1.bulkChildRegistrationQueue.getFailed(),
        ]);
        res.json({
            success: true,
            stats: {
                waiting: waiting.length,
                active: active.length,
                completed: completed.length,
                failed: failed.length,
            },
        });
    }
    catch (error) {
        console.error('Error getting queue stats:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.getQueueStats = getQueueStats;
