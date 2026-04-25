import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    userId?: string;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Authentication required' 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
        
        req.userId = decoded.userId;
        next();

    } catch (error) {
        return res.status(401).json({ 
            success: false, 
            message: 'Invalid or expired token' 
        });
    }
};