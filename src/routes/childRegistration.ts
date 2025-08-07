import { Router } from "express";
import { getJobStatus, getQueueStats, getRegistrations, registerChildrenBulk } from "../controllers/childRegistrationController";

const router = Router()
console.log("Calling here")
console.log("✅ childRegistration file loaded");

router.get('/test', (req, res) => {
  res.json({ message: 'Volunteer routes are working!' });
});

router.post('/bulk', registerChildrenBulk);

router.get('/jobs/:jobId/status', getJobStatus);
router.get('/queue/stats', getQueueStats);

router.get('/registrations', getRegistrations);

export default router;