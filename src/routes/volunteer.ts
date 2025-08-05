import {Router} from "express";
import {
  registerVolunteer,
  getPendingVolunteers,
  updateApplicationStatus,
  getApplicationById,
} from '../controllers/volunteerController';
import { authenticateToken, requireAdmin } from "../middleware/auth";

const router = Router()

router.post('/register', registerVolunteer);
console.log("✅ volunteerRoutes file loaded");

// router.get('/test', (req, res) => {
//   res.json({ message: 'Volunteer routes are working!' });
// });


// Protected admin routes
router.get('/pending', authenticateToken, requireAdmin, getPendingVolunteers);
router.put('/application/status', authenticateToken, requireAdmin, updateApplicationStatus);
router.get('/application/:id', authenticateToken, requireAdmin, getApplicationById);

export default router;