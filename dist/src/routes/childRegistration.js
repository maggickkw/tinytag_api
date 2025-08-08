"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const childRegistrationController_1 = require("../controllers/childRegistrationController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
console.log("Calling here");
console.log("✅ childRegistration file loaded");
router.get('/test', (req, res) => {
    res.json({ message: 'Volunteer routes are working!' });
});
router.post('/bulk', auth_1.authenticateToken, childRegistrationController_1.registerChildrenBulk);
router.get('/jobs/:jobId/status', auth_1.authenticateToken, childRegistrationController_1.getJobStatus);
router.get('/queue/stats', auth_1.authenticateToken, childRegistrationController_1.getQueueStats);
router.get('/registrations', auth_1.authenticateToken, childRegistrationController_1.getRegistrations);
exports.default = router;
