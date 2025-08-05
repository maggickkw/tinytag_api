"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
// import { authenticate } from '../middleware/auth';
const authController_1 = require("../controllers/authController");
const router = (0, express_1.Router)();
// Validation rules
// const registerValidation = [
//   body('email')
//     .isEmail()
//     .normalizeEmail()
//     .withMessage('Please provide a valid email'),
//   body('password')
//     .isLength({ min: 6 })
//     .withMessage('Password must be at least 6 characters long'),
// ];
const loginValidation = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('Password is required'),
];
// Routes
// router.post('/register', registerValidation, register);
router.post('/login', loginValidation, authController_1.login);
// router.get('/profile', authenticate, getProfile);
// router.post('/refresh', authenticate, refreshToken);
exports.default = router;
