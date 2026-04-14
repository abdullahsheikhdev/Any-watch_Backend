import express from 'express';
import { registration } from '../controllers/authControllers.js';


const authRouter = express.Router();

authRouter.post('/register', registration);

export default authRouter;