// models/show.model.ts
import { Schema, Types, model } from "mongoose";

interface IShow {
  movieId: Types.ObjectId;
  date: string;
  time: string;
  ticketPrice: number;
  hallNumber: string;
}

const showSchema = new Schema<IShow>(
  {
    movieId: { type: Schema.Types.ObjectId, ref: "Movie", required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    ticketPrice: { type: Number, required: true },
    hallNumber: { type: String, required: true },

  },
  {
    timestamps: true,
  },
);

export const showModel = model<IShow>("Show", showSchema);
