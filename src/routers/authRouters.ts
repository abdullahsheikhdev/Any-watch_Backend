import express from 'express';
import { login, logout, registration } from '../controllers/authControllers.js';


const authRouter = express.Router();

authRouter.post('/register', registration);
authRouter.post('/login', login);
authRouter.post('/logout', logout);

export default authRouter;