"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const volunteerController_1 = require("../controllers/volunteerController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/register', volunteerController_1.registerVolunteer);
console.log("✅ volunteerRoutes file loaded");
// router.get('/test', (req, res) => {
//   res.json({ message: 'Volunteer routes are working!' });
// });
// Protected admin routes
router.get('/pending', auth_1.authenticateToken, auth_1.requireAdmin, volunteerController_1.getPendingVolunteers);
router.put('/application/status', auth_1.authenticateToken, auth_1.requireAdmin, volunteerController_1.updateApplicationStatus);
router.get('/application/:id', auth_1.authenticateToken, auth_1.requireAdmin, volunteerController_1.getApplicationById);
exports.default = router;
