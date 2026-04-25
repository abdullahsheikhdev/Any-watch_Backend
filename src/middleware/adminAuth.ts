import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AdminAuthRequest extends Request {
    adminId?: string;
}

export const adminAuthMiddleware = async (req: AdminAuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.adminToken || req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false, 
                message: 'Admin access required' 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_ADMIN_SECRET as string) as { adminId: string };
        
        req.adminId = decoded.adminId;
        next();

    } catch (error) {
        return res.status(401).json({ 
            success: false, 
            message: 'Invalid or expired admin token' 
        });
    }
};
