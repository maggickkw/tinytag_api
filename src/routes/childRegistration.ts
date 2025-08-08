import { Router } from "express";
import { getJobStatus, getQueueStats, getRegistrations, registerChildrenBulk } from "../controllers/childRegistrationController";
import { authenticateToken } from "../middleware/auth";

const router = Router()
console.log("Calling here")
console.log("✅ childRegistration file loaded");

router.get('/test', (req, res) => {
  res.json({ message: 'Volunteer routes are working!' });
});

router.post('/bulk', authenticateToken,  registerChildrenBulk);

router.get('/jobs/:jobId/status', authenticateToken, getJobStatus);
router.get('/queue/stats', authenticateToken, getQueueStats);

router.get('/registrations', authenticateToken, getRegistrations);

export default router;