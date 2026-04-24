import mongoose, { Schema, Document } from "mongoose";

export interface IAdmin extends Document {
    name: string;
    email: string;
    password: string;
}

const adminSchema = new Schema<IAdmin>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
}, { timestamps: true });

export const adminModel = mongoose.model<IAdmin>('admins', adminSchema);
