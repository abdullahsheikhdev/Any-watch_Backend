import { model, Schema, Types } from "mongoose";

interface IWISH extends Document{
    userId: Types.ObjectId;
    movieId: Types.ObjectId;
}

const wishSchema = new Schema<IWISH>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
        movieId: { type: Schema.Types.ObjectId, ref: 'Movie', required: true },
    },{
        timestamps:true
    }
)

export const wishList = model<IWISH>("wish", wishSchema)