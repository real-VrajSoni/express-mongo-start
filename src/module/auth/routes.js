import { Router } from 'express';
import * as authController from './controller.js';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/logout', authController.logout);
router.post('/reset-password', authController.resetPassword);

export default router;
