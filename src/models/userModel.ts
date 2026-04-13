import mongoose, { Schema } from "mongoose";

interface userDocument extends mongoose.Document {
    name: string,
    email: string,
    password: string,
    verifiOtp: string,
    verifiOtpExpire: number,
    passwordResetOtp: string,
    passwordResetOtpExpire: number
}

const userSchema = new Schema <userDocument> ({
    name: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    verifiOtp: {type: String},
    verifiOtpExpire: {type: Number},
    passwordResetOtp: {type: String},
    passwordResetOtpExpire: {type: Number},
    

},{timestamps: true})

const userModel = mongoose.model<userDocument>('users', userSchema);
export default userModel;