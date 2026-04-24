import type { Response } from 'express';
import userModel from '../models/userModel.js';
import type { AuthRequest } from '../middleware/userAuth.js';

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