import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Play, Trash2, Edit2, X, MoreVertical, ShieldAlert, ShieldCheck, Loader2, Search } from 'lucide-react';
import io from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';
import ConfirmationModal from '../components/ConfirmationModal';
import { BACKEND_URL } from '../config';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDebounce } from '../hooks/useDebounce';
import { Progress } from "@/components/ui/progress";

interface Video {
    _id: string;
    title: string;
    description: string;
    sensitivityStatus: 'pending' | 'safe' | 'flagged';
    thumbnailPath?: string;
    owner: {
        _id: string;
        username: string;
    };
    createdAt: string;
}

const Dashboard = () => {
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const auth = useContext(AuthContext);

    const [searchQuery, setSearchQuery] = useState('');
    const debouncedQuery = useDebounce(searchQuery, 300);

    const [editingVideo, setEditingVideo] = useState<Video | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [videoToDelete, setVideoToDelete] = useState<string | null>(null);
    const [showUpdateModal, setShowUpdateModal] = useState(false);

    const [processingState, setProcessingState] = useState<{ [key: string]: { progress: number, message: string } }>({});

    useEffect(() => {
        fetchVideos();

        const socket = io(BACKEND_URL.replace('/api', ''));

        socket.on('videoStatusUpdate', (data: { videoId: string, status: 'safe' | 'flagged' }) => {
            setVideos(prevVideos => prevVideos.map(video =>
                video._id === data.videoId ? { ...video, sensitivityStatus: data.status } : video
            ));
            // clear processing state when done
            setProcessingState(prev => {
                const newState = { ...prev };
                delete newState[data.videoId];
                return newState;
            });
        });

        socket.on('videoProgress', (data: { videoId: string, progress: number, message: string }) => {
            setProcessingState(prev => ({
                ...prev,
                [data.videoId]: { progress: data.progress, message: data.message }
            }));
        });

        return () => {
            socket.disconnect();
        }
    }, [auth?.token]); // Added dependency

    const fetchVideos = async () => {
        try {
            const res = await axios.get(`${BACKEND_URL}/videos`, {
                headers: { Authorization: `Bearer ${auth?.token}` }
            });
            setVideos(res.data);
            setLoading(false);
        } catch (error: any) {
            console.error("Error fetching videos", error);
            if (error.response?.status === 401) {
                auth?.logout();
            }
            setLoading(false);
        }
    };

    const confirmDelete = (id: string) => {
        setVideoToDelete(id);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (!videoToDelete) return;

        try {
            await axios.delete(`${BACKEND_URL}/videos/${videoToDelete}`, {
                headers: { Authorization: `Bearer ${auth?.token}` }
            });
            setVideos(videos.filter(v => v._id !== videoToDelete));
            setVideoToDelete(null);
        } catch (error: any) {
            console.error("Error deleting video", error);
            alert(error.response?.data?.message || 'Failed to delete video');
        }
    };

    const openEditModal = (video: Video) => {
        setEditingVideo(video);
        setEditTitle(video.title);
        setEditDescription(video.description);
    };

    const closeEditModal = () => {
        setEditingVideo(null);
        setEditTitle('');
        setEditDescription('');
    };

    const initiateUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        setShowUpdateModal(true);
    };

    const handleUpdate = async () => {
        if (!editingVideo) return;

        try {
            const res = await axios.put(`${BACKEND_URL}/videos/${editingVideo._id}`, {
                title: editTitle,
                description: editDescription
            }, {
                headers: { Authorization: `Bearer ${auth?.token}` }
            });

            setVideos(videos.map(v => v._id === editingVideo._id ? res.data : v));
            closeEditModal();
        } catch (error: any) {
            console.error("Error updating video", error);
            alert(error.response?.data?.message || 'Failed to update video');
        }
    };

    const canManage = (_video: Video) => {
        if (!auth?.user) return false;
        return auth.user.role === 'admin' || auth.user.role === 'editor';
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    const filteredVideos = videos.filter(video =>
        video.title.toLowerCase().includes(debouncedQuery.toLowerCase())
    );

    if (loading) return (
        <div className="flex h-[50vh] items-center justify-center text-zinc-400">
            <Loader2 className="animate-spin mr-2" /> Loading videos...
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-100">All Videos</h1>
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input
                        placeholder="Search videos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-zinc-700"
                    />
                </div>
            </div>

            {filteredVideos.length === 0 && searchQuery ? (
                <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
                    <p className="text-lg font-medium">No videos found</p>
                    <p className="text-sm">Try exploring other search terms</p>
                </div>
            ) : filteredVideos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-zinc-500 bg-zinc-900/50 rounded-xl border border-zinc-800 border-dashed">
                    <p className="text-lg font-medium mb-2">No videos uploaded yet</p>
                    <p className="text-sm mb-6">Upload a video to get started</p>
                    <Link to="/upload">
                        <Button variant="outline" className="border-zinc-700 hover:bg-zinc-800 text-zinc-200">
                            Upload Video
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVideos.map((video) => (
                        <div key={video._id} className="group flex flex-col gap-3 rounded-xl p-2 -m-2 transition-all duration-300 hover:bg-zinc-800/40 hover:scale-[1.02] hover:shadow-xl hover:ring-1 hover:ring-zinc-700/50">
                            <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-900 ring-1 ring-zinc-800">
                                {video.thumbnailPath ? (
                                    <img
                                        src={video.thumbnailPath.startsWith('http') ? video.thumbnailPath : `${BACKEND_URL.replace('/api', '')}/${video.thumbnailPath}`}
                                        alt={video.title}
                                        className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${video.sensitivityStatus === 'flagged' ? 'opacity-50 grayscale' : ''}`}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-700 bg-zinc-900">
                                        <Play size={40} className="opacity-20" />
                                    </div>
                                )}

                                {video.sensitivityStatus === 'pending' && (
                                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300 z-30">
                                        <Loader2 size={24} className="animate-spin text-zinc-400 mb-3" />
                                        <p className="text-zinc-200 text-sm font-medium mb-1">Processing</p>
                                        <p className="text-zinc-500 text-xs mb-3">{processingState[video._id]?.message || 'Initializing...'}</p>
                                        <Progress value={processingState[video._id]?.progress || 0} className="h-1.5 w-full bg-zinc-800" />
                                    </div>
                                )}

                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                                    {video.sensitivityStatus === 'safe' && (
                                        <div className="bg-black/20 backdrop-blur-sm rounded-full p-4 transform scale-75 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300">
                                            <Play className="text-white drop-shadow-lg fill-white" size={32} />
                                        </div>
                                    )}
                                </div>

                                {video.sensitivityStatus !== 'flagged' && (
                                    <Link to={`/video/${video._id}`} className="absolute inset-0 z-10" />
                                )}
                                <div className="absolute top-2 right-2 z-20 flex flex-col gap-2">
                                    {video.sensitivityStatus === 'flagged' && (
                                        <div className="bg-red-600/90 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg flex items-center gap-1 backdrop-blur-sm border border-red-500/50">
                                            <ShieldAlert size={12} fill="currentColor" />
                                            FLAGGED
                                        </div>
                                    )}
                                </div>
                                {video.sensitivityStatus === 'safe' && (
                                    <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="bg-green-500/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1 backdrop-blur-sm">
                                            <ShieldCheck size={10} fill="currentColor" />
                                            SAFE
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 items-start px-0.5">
                                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-semibold text-xs border border-zinc-700 select-none">
                                    {video.owner?.username?.substring(0, 2).toUpperCase() || '??'}
                                </div>

                                <div className="flex-1 min-w-0 flex flex-col gap-1">
                                    <div className="flex justify-between items-start gap-2">
                                        <h3 className={`text-base font-semibold leading-tight line-clamp-2 ${video.sensitivityStatus === 'flagged' ? 'text-zinc-500' : 'text-zinc-100 group-hover:text-white'}`}>
                                            {video.title}
                                        </h3>
                                        {canManage(video) && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="text-zinc-400 hover:text-zinc-200 p-0.5 rounded-full hover:bg-zinc-800 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                                                        <MoreVertical size={16} />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-200">
                                                    <DropdownMenuItem onClick={() => openEditModal(video)} className="hover:bg-zinc-800 cursor-pointer focus:bg-zinc-800 focus:text-zinc-100">
                                                        <Edit2 size={14} className="mr-2" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => confirmDelete(video._id)} className="text-red-400 hover:bg-zinc-800 hover:text-red-300 cursor-pointer focus:bg-zinc-800 focus:text-red-300">
                                                        <Trash2 size={14} className="mr-2" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </div>

                                    <div className="text-sm text-zinc-400 flex flex-col">
                                        <span className="hover:text-zinc-300 transition-colors">{video.owner?.username || 'Unknown User'}</span>
                                        <div className="flex items-center">
                                            <span>{formatTimeAgo(video.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {editingVideo && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <Card className="w-full max-w-lg bg-zinc-950 border-zinc-800 shadow-xl ring-1 ring-zinc-800">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold text-zinc-100 block">Edit Video</h2>
                                <Button variant="ghost" size="icon" onClick={closeEditModal} className="h-8 w-8 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-full">
                                    <X size={18} />
                                </Button>
                            </div>
                            <form onSubmit={initiateUpdate} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-300">Title</label>
                                    <Input
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-300">Description</label>
                                    <Textarea
                                        value={editDescription}
                                        onChange={(e) => setEditDescription(e.target.value)}
                                        className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-700 text-zinc-100 placeholder:text-zinc-500 min-h-[120px] resize-none"
                                    />
                                </div>
                                <div className="flex justify-end gap-3 pt-4">
                                    <Button type="button" variant="ghost" onClick={closeEditModal} className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800">
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="bg-zinc-100 text-zinc-950 hover:bg-white font-semibold">
                                        Save Changes
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </Card>
                </div>
            )}

            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Delete Video"
                message="Are you sure you want to delete this video permanently? This action cannot be undone."
                confirmText="Delete"
                isDanger={true}
            />

            <ConfirmationModal
                isOpen={showUpdateModal}
                onClose={() => setShowUpdateModal(false)}
                onConfirm={handleUpdate}
                title="Update Video"
                message="Are you sure you want to update the video details?"
                confirmText="Update"
            />
        </div>
    );
};

export default Dashboard;
