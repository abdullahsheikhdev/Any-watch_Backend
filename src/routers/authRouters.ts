import express from 'express';
import { login, logout, passwordResetOtp, registration, resendVerificationCode, resetPassword, verifyEmail } from '../controllers/authControllers.js';
import { authMiddleware } from '../middleware/userAuth.js';


const authRouter = express.Router();

authRouter.post('/register', registration);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.post('/verify-email',authMiddleware,verifyEmail);
authRouter.post('/resend-verification-code', authMiddleware, resendVerificationCode);
authRouter.post('/password-reset-otp', passwordResetOtp);
authRouter.post('/reset-password', resetPassword);


export default authRouter;