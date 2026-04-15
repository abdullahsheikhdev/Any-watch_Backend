import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { adminModel } from '../models/adminModel.js';

export interface AdminRequest extends Request {
    adminId?: string;
}

export const adminAuthMiddleware = async (req: AdminRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.adminToken;

        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Admin authentication required' 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { 
            adminId: string;
        };
        
        const admin = await adminModel.findById(decoded.adminId);

        if (!admin) {
            return res.status(401).json({ 
                success: false, 
                message: 'Admin not found' 
            });
        }

        // Verify it's the correct admin email from env
        if (admin.email !== process.env.ADMIN_EMAIL) {
            return res.status(403).json({ 
                success: false, 
                message: 'Unauthorized admin access' 
            });
        }

        req.adminId = decoded.adminId;
        next();

    } catch (error) {
        return res.status(401).json({ 
            success: false, 
            message: 'Invalid or expired admin token' 
        });
    }
};