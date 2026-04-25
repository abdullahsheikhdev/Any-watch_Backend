import { model, Schema } from "mongoose";

interface IMovie extends Document {
  title: string;
  description: string;
  posterUrl: string;
  rating: string;
  catagory: object;
  isActiveShow: boolean;
  status: "available" | "coming_soon";
  releaseDate: Date;
}

const movieSchema = new Schema<IMovie>({
  title: { type: String, required: true },
  description: { type: String },
  posterUrl: { type: String },
  rating: { type: String },
  catagory: { type: Object },
  isActiveShow: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ["available", "coming_soon"],
    default: "coming_soon",
  },
  releaseDate: { type: Date },
});

export const Movie = model<IMovie>("Movie", movieSchema);
