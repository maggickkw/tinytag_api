import { Worker, Job } from 'bullmq';
import { prisma } from '../utils/prisma';
import { redis } from '../utils/redis';
import { bulkRegistrationSchema } from '../schemas/childRegistration.schema';
import { ensureValidISODate } from '../utils/helper';

const bulkChildRegistrationWorker = new Worker(
  'child-registration',
  async (job: Job) => {
    console.log(`🔄 Processing bulk job ${job.id}...`);
    
    try {
      const result = bulkRegistrationSchema.safeParse(job.data);
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
          await prisma.childRegistration.create({
            data: {
              ...reg,
              registrationDate: ensureValidISODate(reg.registrationDate),
              ...(reg.dateOfBirth && { dateOfBirth: ensureValidISODate(reg.dateOfBirth) }),
            },
          });
          createdCount++;
        } catch (err) {
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

    } catch (error) {
      console.error(`❌ Error processing bulk job ${job.id}:`, error);
      throw error;
    }
  },
  {
    connection: redis,
    concurrency: 5,
  }
);

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

export default bulkChildRegistrationWorker;
