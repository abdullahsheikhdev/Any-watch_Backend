// models/booking.model.ts
import { Schema, Types, model } from 'mongoose';

interface IBooking extends Document {
  userId: Types.ObjectId;
  showId: Types.ObjectId;
  seatId: Types.ObjectId;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
}

const bookingSchema = new Schema<IBooking>({
  userId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  showId: { type: Schema.Types.ObjectId, ref: 'Show', required: true },
  seatId: { type: Schema.Types.ObjectId, ref: 'Show', required: true },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'confirmed' },
  createdAt: { type: Date, default: Date.now }
});

export const Booking = model<IBooking>('Booking', bookingSchema);