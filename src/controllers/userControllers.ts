import type { Request, Response } from 'express';
import userModel from '../models/userModel.js';
import type { AuthRequest } from '../middleware/userAuth.js';
import { Movie } from '../models/movieModel.js';

export const getUser =  async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const user = await userModel.findById(userId)
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        res.json({
            success: true,
            user: {
                name: user.name,
                email: user.email,
                isVerified: user.isVerified
            }
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}

export const getPublicMovies = async (req: Request, res: Response) => {
    try {
        const movies = await Movie.find({});
        res.json({
            success: true,
            movies
        });
    } catch (error) {
        console.error('Error fetching public movies:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}