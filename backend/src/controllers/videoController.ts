import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import Video from '../models/Video';
import { processVideo } from '../services/processingService';

interface AuthRequest extends Request {
    user?: any;
}

// Upload Video
export const uploadVideo = async (req: AuthRequest, res: Response): Promise<void> => {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    if (!files || !files['video']) {
        res.status(400).json({ message: 'No video file uploaded' });
        return;
    }

    const videoFile = files['video'][0];
    const { title, description } = req.body;
    let thumbnailPath = '';

    // Check for custom thumbnail
    if (files['thumbnail']) {
        thumbnailPath = files['thumbnail'][0].path;
    } else {
        // Use Cloudinary's auto-generated thumbnail URL
        // Cloudinary stores video at videoFile.path (secure_url)
        // To get a jpg thumbnail, we replace the extension
        // Note: usage of 'path' here refers to the Cloudinary URL
        thumbnailPath = videoFile.path.replace(/\.[^/.]+$/, ".jpg");
    }

    try {
        const newVideo = new Video({
            title,
            description,
            filename: videoFile.filename, // Cloudinary Public ID
            filepath: videoFile.path, // Cloudinary URL
            thumbnailPath,
            owner: req.user.id,
            sensitivityStatus: 'pending', // Default to pending
        });

        await newVideo.save();

        // Trigger async processing
        processVideo(newVideo._id.toString());

        res.status(201).json(newVideo);
    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ message: 'Server error during upload' });
    }
};

// Get All Videos (User Isolated)
export const getVideos = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { sensitivity } = req.query;
        let query: any = {};

        // Regular users can only see their own videos
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

// Stream Video (Redirect to Cloudinary)
export const streamVideo = async (req: Request, res: Response): Promise<void> => {
    try {
        const video = await Video.findById(req.params.id);
        if (!video) {
            res.status(404).json({ message: 'Video not found' });
            return;
        }

        // Redirect to Cloudinary URL
        res.redirect(video.filepath);
    } catch (error) {
        res.status(500).json({ message: 'Error streaming video' });
    }
};

// Delete Video
export const deleteVideo = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const video = await Video.findById(req.params.id);
        if (!video) {
            res.status(404).json({ message: 'Video not found' });
            return;
        }

        // Check permissions: Admin OR Editor ONLY
        if (req.user.role !== 'admin' && req.user.role !== 'editor') {
            res.status(403).json({ message: 'Only admins and editors can perform this action' });
            return;
        }

        // Delete from Cloudinary
        // filename stores the public_id
        const cloudinary = require('../config/cloudinary').default;
        await cloudinary.uploader.destroy(video.filename, { resource_type: 'video' });

        // Also delete thumbnail? If it's stored in Cloudinary with a public_id, yes.
        // But our current logic set thumbnailPath to a URL derived from video, so it might not have a separate ID if auto-generated.
        // If custom uploaded, we should ideally store its public_id too.
        // For now, focusing on video deletion.

        await Video.findByIdAndDelete(req.params.id);
        res.json({ message: 'Video removed' });
    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update Video
export const updateVideo = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { title, description } = req.body;
        const video = await Video.findById(req.params.id);

        if (!video) {
            res.status(404).json({ message: 'Video not found' });
            return;
        }

        // Check permissions: Owner OR Admin OR Editor
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
