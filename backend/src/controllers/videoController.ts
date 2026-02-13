import { Request, Response } from 'express';
import Video from '../models/Video';
import { processVideo } from '../services/processingService';

interface AuthRequest extends Request {
    user?: any;
}

export const uploadVideo = async (req: AuthRequest, res: Response): Promise<void> => {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    if (!files || !files['video']) {
        res.status(400).json({ message: 'No video file uploaded' });
        return;
    }

    const videoFile = files['video'][0];
    const { title, description } = req.body;
    let thumbnailPath = '';

    if (files['thumbnail']) {
        thumbnailPath = files['thumbnail'][0].path;
    } else {
        thumbnailPath = videoFile.path.replace(/\.[^/.]+$/, ".jpg");
    }

    try {
        const newVideo = new Video({
            title,
            description,
            filename: videoFile.filename,
            filepath: videoFile.path,
            thumbnailPath,
            owner: req.user.id,
            sensitivityStatus: 'pending',
        });

        await newVideo.save();

        processVideo(newVideo._id.toString());

        res.status(201).json(newVideo);
    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ message: 'Server error during upload' });
    }
};

export const getVideos = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { sensitivity } = req.query;
        let query: any = {};

        if (req.user.role !== 'admin' && req.user.role !== 'editor') {
            query.owner = req.user.id;
        }

        if (sensitivity) {
            query.sensitivityStatus = sensitivity;
        }

        const videos = await Video.populate(await Video.find(query), { path: 'owner', select: 'username' });
        res.json(videos);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const streamVideo = async (req: Request, res: Response): Promise<void> => {
    try {
        const video = await Video.findById(req.params.id);
        if (!video) {
            res.status(404).json({ message: 'Video not found' });
            return;
        }

        res.redirect(video.filepath);
    } catch (error) {
        res.status(500).json({ message: 'Error streaming video' });
    }
};

export const deleteVideo = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const video = await Video.findById(req.params.id);
        if (!video) {
            res.status(404).json({ message: 'Video not found' });
            return;
        }

        if (req.user.role !== 'admin' && req.user.role !== 'editor') {
            res.status(403).json({ message: 'Only admins and editors can perform this action' });
            return;
        }

        const cloudinary = require('../config/cloudinary').default;
        await cloudinary.uploader.destroy(video.filename, { resource_type: 'video' });

        await Video.findByIdAndDelete(req.params.id);
        res.json({ message: 'Video removed' });
    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateVideo = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { title, description } = req.body;
        const video = await Video.findById(req.params.id);

        if (!video) {
            res.status(404).json({ message: 'Video not found' });
            return;
        }

        if (video.owner.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'editor') {
            res.status(403).json({ message: 'Not authorized to update this video' });
            return;
        }

        video.title = title || video.title;
        video.description = description || video.description;

        await video.save();
        await video.populate('owner', 'username');
        res.json(video);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
