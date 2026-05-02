// models/show.model.ts
import { Schema, Types, model } from "mongoose";

interface IShow {
  movieId: Types.ObjectId;
  date: string;
  time: string;
  ticketPrice: number;
  totalSeats: number;
  bookedSeats: string[];
}

const showSchema = new Schema<IShow>(
  {
    movieId: { type: Schema.Types.ObjectId, ref: "Movie", required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    ticketPrice: { type: Number, required: true },
    totalSeats: { type: Number, default: 50 },
    bookedSeats: [{ type: String }],
  },
  {
    timestamps: true,
  },
);

export const showModel = model<IShow>("Show", showSchema);
