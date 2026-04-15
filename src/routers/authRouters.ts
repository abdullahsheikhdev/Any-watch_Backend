import express from 'express';
import { login, logout, registration, verifyEmail } from '../controllers/authControllers.js';


const authRouter = express.Router();

authRouter.post('/register', registration);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.post('/verify-email', verifyEmail);

export default authRouter;