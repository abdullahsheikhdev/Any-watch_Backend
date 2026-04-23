import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
// import { adminModel } from '../models/adminModel.js';
import  userModel  from '../models/userModel.js';
import { bookingModel } from '../models/bookingModel.js';
import { showModel } from '../models/showModel.js';
import type { AdminRequest } from '../middleware/adminMiddleware.js';

// Admin Login (Only with predefined credentials)
export const adminLogin = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        // Verify email matches the admin email from env
        if (email !== process.env.ADMIN_EMAIL) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid credentials' 
            });
        }

        if (password !== process.env.ADMIN_PASSWORD) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid credentials' 
            });
        }

        const token = jwt.sign(
            { adminId: 'admin' }, 
            process.env.JWT_ADMIN_SECRET as string,
            { expiresIn: '8h' }
        );

        res.cookie('adminToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 8 * 60 * 60 * 1000 // 8 hours
        });

        return res.status(200).json({
            success: true,
            message: 'Login successful',
        });

    } catch (error) {
        console.error('Admin login error:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

// Get Dashboard Statistics
export const getDashboardStats = async (req: AdminRequest, res: Response) => {
    try {
        // Total Bookings
        const totalBookings = await bookingModel.countDocuments();

        // Total Revenue (only completed payments)
        const revenueResult = await bookingModel.aggregate([
            { $match: { paymentStatus: 'completed' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        // Active Shows
        const activeShows = await showModel.countDocuments({ isActive: true });

        // Total Users
        const totalUsers = await userModel.countDocuments();

        // Additional Stats
        const verifiedUsers = await userModel.countDocuments({ isVerified: true });
        const pendingBookings = await bookingModel.countDocuments({ status: 'pending' });
        const completedBookings = await bookingModel.countDocuments({ paymentStatus: 'completed' });
        const cancelledBookings = await bookingModel.countDocuments({ status: 'cancelled' });

        // Recent Bookings (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentBookings = await bookingModel.countDocuments({
            createdAt: { $gte: sevenDaysAgo }
        });

        // Revenue for last 7 days
        const recentRevenueResult = await bookingModel.aggregate([
            { 
                $match: { 
                    paymentStatus: 'completed',
                    createdAt: { $gte: sevenDaysAgo }
                } 
            },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const recentRevenue = recentRevenueResult.length > 0 ? recentRevenueResult[0].total : 0;

        // Top shows by bookings
        const topShows = await bookingModel.aggregate([
            { $match: { paymentStatus: 'completed' } },
            { 
                $group: { 
                    _id: '$show', 
                    bookingCount: { $sum: 1 },
                    revenue: { $sum: '$totalAmount' }
                } 
            },
            { $sort: { bookingCount: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'shows',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'showDetails'
                }
            },
            { $unwind: '$showDetails' }
        ]);

        return res.status(200).json({
            success: true,
            data: {
                overview: {
                    totalBookings,
                    totalRevenue,
                    activeShows,
                    totalUsers
                },
                users: {
                    totalUsers,
                    verifiedUsers,
                    unverifiedUsers: totalUsers - verifiedUsers
                },
                bookings: {
                    total: totalBookings,
                    pending: pendingBookings,
                    completed: completedBookings,
                    cancelled: cancelledBookings
                },
                recentActivity: {
                    recentBookings,
                    recentRevenue
                },
                topShows
            }
        });

    } catch (error) {
        console.error('Dashboard stats error:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

// Get Detailed Revenue Stats
export const getRevenueStats = async (req: AdminRequest, res: Response) => {
    try {
        const { period = 'monthly', limit = 12 } = req.query;

        let groupBy: any;
        let sortBy: any;

        switch (period) {
            case 'daily':
                groupBy = {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                    day: { $dayOfMonth: '$createdAt' }
                };
                sortBy = { '_id.year': -1, '_id.month': -1, '_id.day': -1 };
                break;
            case 'weekly':
                groupBy = {
                    year: { $year: '$createdAt' },
                    week: { $week: '$createdAt' }
                };
                sortBy = { '_id.year': -1, '_id.week': -1 };
                break;
            case 'monthly':
                groupBy = {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' }
                };
                sortBy = { '_id.year': -1, '_id.month': -1 };
                break;
            case 'yearly':
                groupBy = {
                    year: { $year: '$createdAt' }
                };
                sortBy = { '_id.year': -1 };
                break;
            default:
                groupBy = {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' }
                };
                sortBy = { '_id.year': -1, '_id.month': -1 };
        }

        const revenueByPeriod = await bookingModel.aggregate([
            { $match: { paymentStatus: 'completed' } },
            {
                $group: {
                    _id: groupBy,
                    totalRevenue: { $sum: '$totalAmount' },
                    bookingCount: { $sum: 1 },
                    averageBookingValue: { $avg: '$totalAmount' }
                }
            },
            { $sort: sortBy },
            { $limit: parseInt(limit as string) }
        ]);

        return res.status(200).json({
            success: true,
            data: revenueByPeriod
        });

    } catch (error) {
        console.error('Revenue stats error:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

// Get All Users (with pagination and search)
export const getAllUsers = async (req: AdminRequest, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search as string;

        const filter: any = {};
        
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await userModel
            .find(filter)
            .select('-password -verificationCode -passwordResetOtp')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalUsers = await userModel.countDocuments(filter);

        return res.status(200).json({
            success: true,
            data: users,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalUsers / limit),
                totalUsers,
                limit
            }
        });

    } catch (error) {
        console.error('Get users error:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

// Get All Bookings (with pagination and filters)
export const getAllBookings = async (req: AdminRequest, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;
        const status = req.query.status as string;
        const paymentStatus = req.query.paymentStatus as string;

        const filter: any = {};
        if (status) filter.status = status;
        if (paymentStatus) filter.paymentStatus = paymentStatus;

        const bookings = await bookingModel
            .find(filter)
            .populate('user', 'name email')
            .populate('show', 'title posterUrl')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalBookings = await bookingModel.countDocuments(filter);

        return res.status(200).json({
            success: true,
            data: bookings,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalBookings / limit),
                totalBookings,
                limit
            }
        });

    } catch (error) {
        console.error('Get bookings error:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

// Get Single User Details
export const getUserDetails = async (req: AdminRequest, res: Response) => {
    try {
        const { userId } = req.params;

        const user = await userModel
            .findById(userId)
            .select('-password -verificationCode -passwordResetOtp');

        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        // Get user's bookings
        const bookings = await bookingModel
            .find({ users: userId })
            .populate('show', 'title')
            .sort({ createdAt: -1 });

        // Calculate user stats
        const totalSpent = await bookingModel.aggregate([
            { $match: { user: user._id, paymentStatus: 'completed' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        return res.status(200).json({
            success: true,
            data: {
                user,
                bookings,
                stats: {
                    totalBookings: bookings.length,
                    totalSpent: totalSpent.length > 0 ? totalSpent[0].total : 0
                }
            }
        });

    } catch (error) {
        console.error('Get user details error:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};
// Admin Logout
export const adminLogout = async (req: Request, res: Response) => {
    res.clearCookie('adminToken');
    return res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
};