import express from "express";
import { authMiddleware } from "../middleware/userAuth.js";
import { getUser, getPublicMovies } from "../controllers/userControllers.js";

const userRouters = express.Router();

userRouters.get('/profile', authMiddleware, getUser );
userRouters.get('/movies', getPublicMovies);

export default userRouters;