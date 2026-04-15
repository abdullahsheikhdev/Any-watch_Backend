// models/booking.model.ts
import { Schema, model } from 'mongoose';

interface IBooking {
    user: Schema.Types.ObjectId;
    show: Schema.Types.ObjectId;
    seats: string[];
    totalAmount: number;
    bookingDate: Date;
    status: 'pending' | 'confirmed' | 'cancelled';
    paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
    createdAt: Date;
    updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>({
    user: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    show: { 
        type: Schema.Types.ObjectId, 
        ref: 'Show', 
        required: true 
    },
    seats: [{ 
        type: String, 
        required: true 
    }],
    totalAmount: { 
        type: Number, 
        required: true 
    },
    bookingDate: { 
        type: Date, 
        default: Date.now 
    },
    status: { 
        type: String, 
        enum: ['pending', 'confirmed', 'cancelled'], 
        default: 'pending' 
    },
    paymentStatus: { 
        type: String, 
        enum: ['pending', 'completed', 'failed', 'refunded'], 
        default: 'pending' 
    }
}, {
    timestamps: true
});

export const bookingModel = model<IBooking>('Booking', bookingSchema);