"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const childRegistrationController_1 = require("../controllers/childRegistrationController");
const router = (0, express_1.Router)();
console.log("Calling here");
console.log("✅ childRegistration file loaded");
router.get('/test', (req, res) => {
    res.json({ message: 'Volunteer routes are working!' });
});
router.post('/bulk', childRegistrationController_1.registerChildrenBulk);
router.get('/jobs/:jobId/status', childRegistrationController_1.getJobStatus);
router.get('/queue/stats', childRegistrationController_1.getQueueStats);
router.get('/registrations', childRegistrationController_1.getRegistrations);
exports.default = router;
