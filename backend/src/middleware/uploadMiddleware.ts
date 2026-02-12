import multer from 'multer';
import { storage } from '../config/cloudinary';
import path from 'path';

export const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'video') {
            const filetypes = /mp4|mov|avi|mkv/;
            const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
            const mimetype = filetypes.test(file.mimetype);
            if (mimetype && extname) {
                return cb(null, true);
            } else {
                cb(new Error('Error: Videos Only!'));
            }
        } else if (file.fieldname === 'thumbnail') {
            const filetypes = /jpeg|jpg|png/;
            const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
            const mimetype = filetypes.test(file.mimetype);
            if (mimetype && extname) {
                return cb(null, true);
            } else {
                cb(new Error('Error: Images Only!'));
            }
        } else {
            cb(new Error('Error: Unexpected field'));
        }
    }
});
