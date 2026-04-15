import type { Request, Response } from "express";
import userModel from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken'
import transporter from "../config/nodemailer.js";
import type { AuthRequest } from "../middleware/userAuth.js";


export const registration = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const existingUser = await userModel.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Generate 6-digit verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Set expiration time (15 minutes from now)
        const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000);

        const newUser = new userModel({
            name,
            email,
            password: hashedPassword,
            verifiOtp: verificationCode,
            verifiOtpExpire: verificationCodeExpires,
            isVerified: false
        });
        
        await newUser.save();

        // Issue token immediately after registration
        const token = jwt.sign(
            { userId: newUser._id }, 
            process.env.JWT_SECRET as string, 
            { expiresIn: '4h' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 4 * 60 * 60 * 1000
        });

        // Send verification email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Verify Your Email - Move Seat Booking',
            html: `
                <h2>Welcome to Move Seat Booking!</h2>
                <p>Hello ${name},</p>
                <p>Thank you for registering. Please use the verification code below to verify your email address:</p>
                <h1 style="color: #4CAF50; font-size: 32px; letter-spacing: 5px;">${verificationCode}</h1>
                <p>This code will expire in 15 minutes.</p>
                <p>If you didn't create an account, please ignore this email.</p>
                <br>
                <p>Best regards,<br>The Move Seat Booking Team</p>
            `
        };

        await transporter.sendMail(mailOptions);

        return res.status(201).json({
            success: true,
            message: 'Registration successful. Please check your email for verification code.'
        });

    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const login = async (req : Request, res : Response) => {
    const {email, password} = req.body;

    if(!email || !password){
        return res.status(400).json({message: 'All fields are required'})
    }

    try {
        
        const user = await userModel.findOne({ email });
        
        if( !user ){
            return res.status(400).json({message: 'Invalid email or password'})
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if( !isPasswordValid ){
            return res.status(400).json({message: 'Invalid email or password'})
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET as string, { expiresIn: '4h' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 4 * 60 * 60 * 1000 // 4 hours   
        });

        return res.status(200).json({success: true, message: 'Login successful'})

    } catch (error) {
        return res.json({ success: false, message: (error as Error).message });
    }
}

export const logout = (req : Request, res : Response) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        });
        return res.status(200).json({success: true, message: 'Logout successful'})
    } catch (error) {
        return res.json({ success: false, message: (error as Error).message });
    }
}

export const verifyEmail = async (req: AuthRequest, res: Response) => {
    const { code } = req.body;
    const userId = req.userId; // From middleware

    if (!code) {
        return res.status(400).json({ message: 'Verification code is required' });
    }

    try {
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'Email already verified' });
        }

        // Check if code has expired
        if (user.verifiOtpExpire && new Date(user.verifiOtpExpire) < new Date()) {
            return res.status(400).json({ 
                success: false,
                message: 'Verification code has expired',
                expired: true
            });
        }

        // Check if code matches
        if (user.verifiOtp !== code) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid verification code' 
            });
        }

        // Update user as verified
        user.isVerified = true;
        user.verifiOtp = '';
        user.verifiOtpExpire = 0;
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Email verified successfully'
        });

    } catch (error) {
        console.error('Verification error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const resendVerificationCode = async (req: AuthRequest, res: Response) => {
    const userId = req.userId; // From middleware

    try {
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'Email already verified' });
        }

        // Generate new verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000);

        user.verifiOtp = verificationCode;
        user.verifiOtpExpire = verificationCodeExpires.getTime();
        await user.save();

        // Send email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'New Verification Code - Move Seat Booking',
            html: `
                <h2>New Verification Code</h2>
                <p>Hello ${user.name},</p>
                <p>Your new verification code is:</p>
                <h1 style="color: #4CAF50; font-size: 32px; letter-spacing: 5px;">${verificationCode}</h1>
                <p>This code will expire in 15 minutes.</p>
            `
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({
            success: true,
            message: 'Verification code resent successfully'
        });

    } catch (error) {
        console.error('Resend code error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};