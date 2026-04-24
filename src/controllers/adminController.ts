import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { adminModel } from '../models/adminModel.js';

// Admin Login (Using database and bcrypt)
export const adminLogin = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ 
            success: false,
            message: 'Email and password are required' 
        });
    }

    try {
        // Find admin by email
        const admin = await adminModel.findOne({ email });

        if (!admin) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid credentials' 
            });
        }

        // Compare password with hashed password in database
        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid credentials' 
            });
        }

        // Sign token with adminId
        const token = jwt.sign(
            { adminId: admin._id }, 
            process.env.JWT_ADMIN_SECRET as string,
            { expiresIn: '8h' }
        );

        // Set cookie with consistent settings
        res.cookie('adminToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 8 * 60 * 60 * 1000 // 8 hours
        });

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            token
        });

    } catch (error) {
        console.error('Admin login error:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

// Admin Logout
export const adminLogout = async (req: Request, res: Response) => {
    try {
        res.clearCookie('adminToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        });
        
        return res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            message: 'Error during logout' 
        });
    }
};