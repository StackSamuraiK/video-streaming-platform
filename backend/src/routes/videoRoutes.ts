import express from 'express';

import path from 'path';
import { uploadVideo, getVideos, streamVideo, deleteVideo, updateVideo } from '../controllers/videoController';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();

import { upload } from '../middleware/uploadMiddleware';

router.post('/upload', authenticate, upload.fields([{ name: 'video', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), uploadVideo);
router.get('/', authenticate, getVideos);
router.get('/:id/stream', streamVideo);
router.delete('/:id', authenticate, deleteVideo);
router.put('/:id', authenticate, updateVideo);

export default router;
