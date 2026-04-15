// utils/initAdmin.ts
import bcrypt from 'bcryptjs';
import { adminModel } from '../models/adminModel.js';

export const initializeAdmin = async () => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        const adminName = process.env.ADMIN_NAME || 'Admin';

        if (!adminEmail || !adminPassword) {
            console.error('Admin credentials not found in environment variables');
            return;
        }

        // Check if admin already exists
        const existingAdmin = await adminModel.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('Admin already exists');
            return;
        }

        // Create admin with hashed password
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        
        const admin = new adminModel({
            name: adminName,
            email: adminEmail,
            password: hashedPassword
        });

        await admin.save();
        console.log('✅ Admin initialized successfully');
        console.log(`Email: ${adminEmail}`);

    } catch (error) {
        console.error('Error initializing admin:', error);
    }
};