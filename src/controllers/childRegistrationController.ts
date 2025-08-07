import { Request, Response } from "express";
import { bulkRegistrationSchema } from "../schemas/childRegistration.schema";
import { bulkChildRegistrationQueue } from "../queues/childRegistrationQueue";
import { ZodError } from "zod";
import { prisma } from "../utils/prisma";

// Bulk registration endpoint (for offline sync)
export const registerChildrenBulk = async (req: Request, res: Response) => {
  try {
    const validatedData = bulkRegistrationSchema.parse(req.body);
    
    // Add the entire bulk payload to queue as a single job
    const job = await bulkChildRegistrationQueue.add(
      'child-registration',
      validatedData, // Send entire payload with registrations array
      {
        priority: 2,
        jobId: `bulk-${Date.now()}-${Math.random()}`,
      }
    );

    res.status(202).json({
      success: true,
      message: `${validatedData.registrations.length} registrations queued for processing`,
      jobId: job.id,
      totalRegistrations: validatedData.registrations.length,
    });
  } catch (error) {
    if (error instanceof ZodError) {
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

export const getJobStatus = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    
    const job = await bulkChildRegistrationQueue.getJob(jobId);
    
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
  } catch (error) {
    console.error('Error getting job status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const getRegistrations = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [registrations, total] = await Promise.all([
      prisma.childRegistration.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.childRegistration.count(),
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
  } catch (error) {
    console.error('Error getting registrations:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const getQueueStats = async (req: Request, res: Response) => {
  try {
    const [waiting, active, completed, failed] = await Promise.all([
      bulkChildRegistrationQueue.getWaiting(),
      bulkChildRegistrationQueue.getActive(),
      bulkChildRegistrationQueue.getCompleted(),
      bulkChildRegistrationQueue.getFailed(),
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
  } catch (error) {
    console.error('Error getting queue stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};