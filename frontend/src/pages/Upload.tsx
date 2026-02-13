import { useState, useContext, type FormEvent } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, CheckCircle, AlertCircle, FileVideo, X, Image as ImageIcon } from 'lucide-react';
import { BACKEND_URL } from '../config';

// Shadcn Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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

    const removeFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index));
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
        <div className="max-w-3xl mx-auto mt-10 px-4">
            <Card className="bg-zinc-950 border-zinc-800 text-zinc-50 shadow-xl">
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-3">
                        <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800">
                            <UploadIcon className="text-zinc-100" />
                        </div>
                        Upload Video{isBatch ? 's' : ''}
                    </CardTitle>
                    <CardDescription className="text-zinc-400">
                        Upload and share your videos with the world.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="bg-red-500/10 text-red-500 p-4 rounded-md text-sm mb-6 flex items-center gap-3 border border-red-500/20">
                            <AlertCircle size={20} />
                            {error}
                        </div>
                    )}

                    {uploading ? (
                        <div className="py-12 text-center space-y-6">
                            <div className="space-y-2">
                                <h3 className="text-xl font-semibold">
                                    {isBatch ? `Uploading ${currentFileIndex + 1} of ${files.length}` : 'Uploading...'}
                                </h3>
                                <p className="text-zinc-400 text-sm font-medium truncate max-w-sm mx-auto">
                                    {files[currentFileIndex]?.name}
                                </p>
                            </div>

                            <div className="max-w-md mx-auto space-y-2">
                                <div className="h-3 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                                    <div
                                        className="h-full bg-zinc-50 transition-all duration-300 ease-out"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <div className="text-right text-xs text-zinc-500 font-mono">
                                    {progress}%
                                </div>
                            </div>

                            {currentFileIndex === files.length - 1 && progress === 100 && (
                                <div className="text-green-500 flex items-center justify-center gap-2 font-medium animate-in fade-in slide-in-from-bottom-2">
                                    <CheckCircle size={20} /> Upload Complete! Redirecting...
                                </div>
                            )}
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* File Drop Zone */}
                            <div className="relative group">
                                <div className="border-2 border-dashed border-zinc-800 rounded-xl p-10 text-center hover:border-zinc-500 hover:bg-zinc-900/50 transition-all cursor-pointer relative">
                                    <input
                                        type="file"
                                        accept="video/*"
                                        multiple
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="space-y-4 pointer-events-none">
                                        <div className="mx-auto w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800 group-hover:border-zinc-600 transition-colors">
                                            <UploadIcon size={24} className="text-zinc-400 group-hover:text-zinc-200" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-medium text-zinc-200">
                                                Click to upload or drag and drop
                                            </p>
                                            <p className="text-sm text-zinc-500">
                                                MP4, WebM or Ogg (Max 10GB)
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* File List */}
                                {files.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        <div className="text-sm font-medium text-zinc-400 px-1">Selected Files ({files.length})</div>
                                        <div className="bg-zinc-900/50 rounded-lg border border-zinc-800 divide-y divide-zinc-800/50 max-h-48 overflow-y-auto">
                                            {files.map((f, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 text-sm group/item hover:bg-zinc-900 transition-colors">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <FileVideo size={16} className="text-zinc-500 shrink-0" />
                                                        <span className="truncate text-zinc-300">{f.name}</span>
                                                        <span className="text-xs text-zinc-600 shrink-0">
                                                            {(f.size / (1024 * 1024)).toFixed(2)} MB
                                                        </span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile(i)}
                                                        className="text-zinc-600 hover:text-red-400 p-1 rounded-md transition-colors"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="grid gap-6">
                                {/* Thumbnail - Single File Only */}
                                {!isBatch && files.length > 0 && (
                                    <div className="space-y-2">
                                        <Label className="text-zinc-200">Thumbnail (Optional)</Label>
                                        <div className="flex items-center gap-4 p-4 border border-zinc-800 rounded-lg bg-zinc-900/30">
                                            <div className="shrink-0 p-3 bg-zinc-900 rounded border border-zinc-800">
                                                <ImageIcon size={20} className="text-zinc-500" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleThumbnailChange}
                                                    className="block w-full text-sm text-zinc-400 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-zinc-100 file:text-zinc-900 hover:file:bg-zinc-200 cursor-pointer"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Metadata Fields */}
                                <div className="space-y-4">
                                    {!isBatch && (
                                        <div className="space-y-2">
                                            <Label htmlFor="title" className="text-zinc-200">Title</Label>
                                            <Input
                                                id="title"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                placeholder={files.length === 1 ? files[0].name.replace(/\.[^/.]+$/, "") : "Video Title"}
                                                className="bg-zinc-900 border-zinc-800 text-zinc-50 focus-visible:ring-zinc-700"
                                                required={!isBatch}
                                                disabled={files.length === 0}
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label htmlFor="description" className="text-zinc-200">
                                            Description {isBatch && <span className="text-zinc-500 font-normal">(Applied to all videos)</span>}
                                        </Label>
                                        <Textarea
                                            id="description"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Tell viewers about your video..."
                                            className="bg-zinc-900 border-zinc-800 text-zinc-50 min-h-[120px] focus-visible:ring-zinc-700 resize-none"
                                            disabled={files.length === 0}
                                        />
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-zinc-100 text-zinc-900 hover:bg-white font-semibold py-6 text-base shadow-lg shadow-zinc-900/20"
                                disabled={files.length === 0}
                            >
                                {files.length > 0 ? (
                                    <>Upload {files.length} Video{files.length > 1 ? 's' : ''}</>
                                ) : (
                                    'Select Videos to Upload'
                                )}
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default Upload;
