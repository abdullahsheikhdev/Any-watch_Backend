import type { Request, Response } from "express";
import userModel from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken'
import transporter from "../config/nodemailer.js";


export const registration = async (req : Request, res : Response) => {

    const {name, email, password} = req.body;

    if(!name || !email || !password){
        return res.status(400).json({message: 'All fields are required'})
    }

    try {
        const existingUser = await userModel.findOne({ email });

        if( existingUser ){
            return res.status(400).json({message: 'User already exists'})
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new userModel({ name, email, password: hashedPassword });
        await newUser.save();

        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET as string, { expiresIn: '4h' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 4 * 60 * 60 * 1000 // 4 hours   
        });

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Welcome to Move Seat Booking',
            text: `Hello ${name},\n\nThank you for registering at Move Seat Booking! We're excited to have you on board. If you have any questions or need assistance, feel free to reach out to our support team.\n\nBest regards,\nThe Move Seat Booking Team`
        };
        
        await transporter.sendMail(mailOptions);

        return res.status(201).json({success: true, message: 'User registered successfully'})

    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({success: false, message: 'Internal server error'})
    }
}

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

export const sendRegisterOtp = async (req : Request, res : Response) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        
    } catch (error) {
        return res.json({ success: false, message: (error as Error).message });
    }
}