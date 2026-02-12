import { useState, useContext, type FormEvent } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, CheckCircle, AlertCircle, FileVideo } from 'lucide-react';
import { BACKEND_URL } from '../config';

const Upload = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [thumbnail, setThumbnail] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    // Upload State
    const [uploading, setUploading] = useState(false);
    const [currentFileIndex, setCurrentFileIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');

    const auth = useContext(AuthContext);
    const navigate = useNavigate();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFiles(Array.from(e.target.files));
        }
    };

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setThumbnail(e.target.files[0]);
        }
    };

    const calculateProgress = (loaded: number, total: number | undefined) => {
        if (!total) return 0;
        return Math.round((loaded * 100) / total);
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (files.length === 0) {
            setError('Please select at least one video file');
            return;
        }

        setUploading(true);
        setError('');
        setCurrentFileIndex(0);

        try {
            for (let i = 0; i < files.length; i++) {
                setCurrentFileIndex(i);
                setProgress(0);
                const file = files[i];

                const formData = new FormData();
                formData.append('video', file);

                // Only allow custom thumbnail if single file
                if (files.length === 1 && thumbnail) {
                    formData.append('thumbnail', thumbnail);
                }

                // Use custom title for single file, or filename for batch
                const videoTitle = files.length === 1 && title ? title : file.name.replace(/\.[^/.]+$/, "");
                formData.append('title', videoTitle);
                formData.append('description', description); // Same description for all

                await axios.post(`${BACKEND_URL}/videos/upload`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${auth?.token}`,
                    },
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = calculateProgress(progressEvent.loaded, progressEvent.total);
                        setProgress(percentCompleted);
                    },
                });
            }

            // All done
            setTimeout(() => navigate('/'), 1000);

        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Upload failed');
            setUploading(false);
            setProgress(0);
        }
    };

    const isBatch = files.length > 1;

    return (
        <div className="max-w-2xl mx-auto mt-10 p-6 bg-gray-800 rounded-lg shadow-xl">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <UploadIcon className="text-indigo-400" />
                Upload Video{isBatch ? 's' : ''}
            </h2>

            {error && (
                <div className="bg-red-500/20 text-red-200 p-3 rounded mb-4 flex items-center gap-2">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            {uploading ? (
                <div className="text-center py-10">
                    <div className="mb-2 text-xl font-semibold">
                        {isBatch ? `Uploading ${currentFileIndex + 1} of ${files.length}` : 'Uploading...'}
                    </div>
                    <div className="text-gray-400 mb-4 text-sm truncate">
                        {files[currentFileIndex]?.name}
                    </div>

                    <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden mb-2">
                        <div
                            className="bg-indigo-500 h-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <div className="text-right text-xs text-gray-400">{progress}%</div>

                    {currentFileIndex === files.length - 1 && progress === 100 && (
                        <div className="mt-4 text-green-400 flex items-center justify-center gap-2">
                            <CheckCircle /> Upload Complete! Redirecting...
                        </div>
                    )}
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-indigo-500 transition cursor-pointer relative">
                        <input
                            type="file"
                            accept="video/*"
                            multiple
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <UploadIcon size={48} className="mx-auto mb-2 text-gray-400" />
                        <p className="text-gray-300">
                            {files.length > 0
                                ? `${files.length} file${files.length > 1 ? 's' : ''} selected`
                                : "Drag & drop or click to select video(s)"}
                        </p>
                        {files.length > 0 && (
                            <div className="mt-4 text-sm text-gray-400 text-left max-h-32 overflow-y-auto">
                                {files.map((f, i) => (
                                    <div key={i} className="flex items-center gap-2 py-1">
                                        <FileVideo size={14} /> {f.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {!isBatch && (
                        <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center hover:border-indigo-500 transition cursor-pointer relative">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleThumbnailChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="text-gray-400">
                                <p className="text-sm">{thumbnail ? thumbnail.name : "Optional: Upload Thumbnail (Image)"}</p>
                            </div>
                        </div>
                    )}

                    {!isBatch && (
                        <div>
                            <label className="block text-sm font-medium mb-1">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-gray-700 rounded p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                required={!isBatch}
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium mb-1">Description {isBatch && "(Applied to all videos)"}</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-gray-700 rounded p-2 h-24 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 py-3 rounded font-bold transition flex items-center justify-center gap-2"
                        disabled={files.length === 0}
                    >
                        Upload {files.length > 1 ? `${files.length} Videos` : 'Video'}
                    </button>
                </form>
            )}
        </div>
    );
};

export default Upload;
