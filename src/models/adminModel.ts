// import { Schema, model } from 'mongoose';

// interface IAdmin {
//     name: string;
//     email: string;
//     password: string;
//     createdAt: Date;
//     updatedAt: Date;
// }

// const adminSchema = new Schema<IAdmin>({
//     name: { 
//         type: String, 
//         required: true 
//     },
//     email: { 
//         type: String, 
//         required: true, 
//         unique: true,
//         lowercase: true
//     },
//     password: { 
//         type: String, 
//         required: true 
//     }
// }, {
//     timestamps: true
// });

// export const adminModel = model<IAdmin>('Admin', adminSchema);