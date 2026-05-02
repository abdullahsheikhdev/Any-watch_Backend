
import { model, Schema, Types } from "mongoose";

interface ISEAT {
    shoeId: Types.ObjectId;
    seatNumber: string;
    isBooked: boolean;
}

const seatSchema = new Schema<ISEAT>(
    {
        shoeId: {type: Schema.Types.ObjectId, ref:"Show", required:true},
        seatNumber: {type:String, default:""},
        isBooked: {type:Boolean, default:false}
    },
    {
        timestamps: true
    }
)

export const seatSelectMidel = model<ISEAT>("seat", seatSchema)