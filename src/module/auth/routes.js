import { Router } from 'express';
import * as authController from './controller.js';
import requireAuth from './middleware.js';
import authLimiter from '../../common/middleware/authLimiter.js';

const router = Router();
router.use(authLimiter);

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/logout', requireAuth, authController.logout);
router.get('/me', requireAuth, authController.me);

export default router;
