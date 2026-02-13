import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

export interface IVideo extends Document {
    title: string;
    description: string;
    filename: string;
    filepath: string;
    owner: IUser['_id'];
    sensitivityStatus: 'pending' | 'safe' | 'flagged';
    thumbnailPath?: string;
    views: number;
    createdAt: Date;
}

const VideoSchema: Schema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    filename: {
        type: String,
        required: true,
    },
    filepath: {
        type: String,
        required: true,
    },
    thumbnailPath: {
        type: String,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    sensitivityStatus: {
        type: String,
        enum: ['pending', 'safe', 'flagged'],
        default: 'pending',
    },
    views: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});

export default mongoose.model<IVideo>('Video', VideoSchema);
