import mongoose from "mongoose";

const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => console.log('MongoDB connected successfully'));
        
        await mongoose.connect(`${process.env.MONGODB_URL}/meam_stack`, {
            autoSelectFamily: false,
        });
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1); // Exit if connection fails
    }
}

export default connectDB;