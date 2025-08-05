import {Router} from 'express';
import { body } from 'express-validator';
// import { authenticate } from '../middleware/auth';
import { login } from '../controllers/authController';

const router = Router();

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
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// Routes
// router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
// router.get('/profile', authenticate, getProfile);
// router.post('/refresh', authenticate, refreshToken);

export default router;
