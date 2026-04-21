import express from "express";
import { authMiddleware } from "../middleware/userAuth.js";
import { getUser } from "../controllers/userControllers.js";

const userRouters = express.Router();

userRouters.get('/profile', authMiddleware, getUser );

export default userRouters;