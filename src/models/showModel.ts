// models/show.model.ts
import { Schema, model } from 'mongoose';

interface IShow {
    title: string;
    description: string;
    duration: number; // in minutes
    genre: string[];
    language: string;
    rating: number;
    posterUrl: string;
    isActive: boolean;
    releaseDate: Date;
    createdAt: Date;
    updatedAt: Date;
}

const showSchema = new Schema<IShow>({
    title: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    duration: { 
        type: Number, 
        required: true 
    },
    genre: [{ 
        type: String 
    }],
    language: { 
        type: String, 
        required: true 
    },
    rating: { 
        type: Number, 
        min: 0, 
        max: 10 
    },
    posterUrl: { 
        type: String 
    },
    isActive: { 
        type: Boolean, 
        default: true 
    },
    releaseDate: { 
        type: Date, 
        required: true 
    }
}, {
    timestamps: true
});

export const showModel = model<IShow>('Show', showSchema);