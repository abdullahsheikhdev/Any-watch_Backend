import type { Request, Response } from "express";
import userModel from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken'


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
        return res.status(201).json({message: 'User registered successfully'})

        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET as string, { expiresIn: '4h' });

        res.cookie('__Host-token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            path: '/',
            maxAge: 4 * 60 * 60 * 1000 // 4 hours   
        });

    } catch (error) {
        return res.status(500).json({message: 'Internal server error'})
    }

}