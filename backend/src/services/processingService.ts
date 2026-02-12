import fs from 'fs';
import path from 'path';
import https from 'https';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager, FileState } from '@google/generative-ai/server';
import Video from '../models/Video';
import { io } from '../index';

const API_KEY = process.env.GEMINI_API_KEY;

// Initialize Gemini
const genAI = new GoogleGenerativeAI(API_KEY || '');
const fileManager = new GoogleAIFileManager(API_KEY || '');

// Ensure temp directory exists
const tempDir = path.join(__dirname, '../../temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

export const processVideo = async (videoId: string) => {
    console.log(`Starting analysis for video ${videoId}...`);

    if (!API_KEY || API_KEY === 'your_gemini_api_key_here') {
        console.warn('Skipping analysis: GEMINI_API_KEY is missing or invalid.');
        return;
    }

    try {
        const video = await Video.findById(videoId);
        if (!video) throw new Error('Video not found');

        // 1. Download Video to Temp File
        const tempFilePath = path.join(tempDir, `${videoId}.mp4`);
        await downloadFile(video.filepath, tempFilePath);

        // 2. Upload to Gemini
        console.log('Uploading to Gemini...');
        const uploadResult = await fileManager.uploadFile(tempFilePath, {
            mimeType: 'video/mp4',
            displayName: video.title,
        });
        const fileUri = uploadResult.file.uri;
        let file = await fileManager.getFile(uploadResult.file.name);

        // 3. Wait for Processing
        while (file.state === FileState.PROCESSING) {
            console.log('Waiting for video processing...');
            await new Promise((resolve) => setTimeout(resolve, 5000)); // Poll every 5s
            file = await fileManager.getFile(uploadResult.file.name);
        }

        if (file.state === FileState.FAILED) {
            throw new Error('Video processing failed by Gemini.');
        }

        // 4. Analyze with Gemini 2.5 Flash
        console.log('Analyzing content...');
        // The user specified "gemini-2.5-flash". If it fails, fallback might be needed, but sticking to request.
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `
            Analyze this video for content moderation.
            Check for:
            1. Violence or Gore
            2. Hate Speech or Harassment
            3. Sexually Explicit Content
            4. Dangerous Activities

            Return a strict JSON object with:
            {
                "status": "safe" | "flagged",
                "reason": "Brief explanation if flagged, or 'Content is safe' if safe"
            }
        `;

        const result = await model.generateContent([
            {
                fileData: {
                    mimeType: file.mimeType,
                    fileUri: file.uri
                }
            },
            { text: prompt }
        ]);

        const responseText = result.response.text();
        console.log('Gemini Analysis Result:', responseText);

        // Parse Result
        let status: 'safe' | 'flagged' = 'safe';
        try {
            // Clean markdown usage if present (```json ... ```)
            const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            const analysis = JSON.parse(jsonStr);
            status = analysis.status === 'flagged' ? 'flagged' : 'safe';
        } catch (e) {
            console.error('Failed to parse JSON response, defaulting to safe/manual review needed.');
            // Fallback logic could go here
        }

        // 5. Update Database
        video.sensitivityStatus = status;
        await video.save();

        // 6. Real-time Update
        io.emit('videoStatusUpdate', {
            videoId: video._id,
            status: video.sensitivityStatus
        });

        // 7. Cleanup
        await fileManager.deleteFile(uploadResult.file.name);
        if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }

        console.log(`Video ${videoId} processed. Final Status: ${status}`);

    } catch (error) {
        console.error(`Error processing video ${videoId}:`, error);
    }
};

// Helper: Download File
const downloadFile = (url: string, dest: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => { });
            reject(err);
        });
    });
};
