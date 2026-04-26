import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { adminModel } from '../models/adminModel.js';
import { Movie } from '../models/movieModel.js';

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


export const adminAddMovie = async (req: Request, res: Response) => {
    const { title, description, posterUrl, rating, catagory, releaseDate } = req.body;

    if (!title || !description || !posterUrl || !rating || !catagory || !releaseDate) {
        return res.status(400).json({ 
            success: false, 
            message: 'All fields are required' 
        });
    }

    try {
        
        const newMovie = new Movie({
            title,
            description,
            posterUrl,
            rating,
            catagory,
            releaseDate
        })
        await newMovie.save();

        return res.status(201).json({
            success: true,
            message: 'Movie added successfully',
            movie: newMovie
        });

    } catch (error) {
        console.error('Error adding movie:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Error adding movie' 
        });
    }
};

export const moviesList = async (req: Request, res: Response) => {
    try {
        const allMovies = await Movie.find({}); 

        // ৩. রেসপন্স পাঠানো
        res.status(200).json({
            success: true,
            message: 'All data is available',
            data: allMovies
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};

export const deleteMovie = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;


        const deletedMovie = await Movie.findByIdAndDelete(id);


        if (!deletedMovie) {
            return res.status(404).json({
                success: false,
                message: "Movie not found with this ID"
            });
        }


        res.status(200).json({
            success: true,
            message: "Movie deleted successfully",
            data: deletedMovie 
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete movie",
            error: error instanceof Error ? error.message : "Internal Server Error"
        });
    }
};