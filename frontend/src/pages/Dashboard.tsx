import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Play, Clock, AlertTriangle, CheckCircle, Trash2, Edit2, X } from 'lucide-react';
import io from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';
import ConfirmationModal from '../components/ConfirmationModal';
import { BACKEND_URL } from '../config';

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

    // Edit State
    const [editingVideo, setEditingVideo] = useState<Video | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');

    // Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [videoToDelete, setVideoToDelete] = useState<string | null>(null);
    const [showUpdateModal, setShowUpdateModal] = useState(false);

    useEffect(() => {
        fetchVideos();

        const socket = io(BACKEND_URL.replace('/api', ''));

        socket.on('videoStatusUpdate', (data: { videoId: string, status: 'safe' | 'flagged' }) => {
            setVideos(prevVideos => prevVideos.map(video =>
                video._id === data.videoId ? { ...video, sensitivityStatus: data.status } : video
            ));
        });

        return () => {
            socket.disconnect();
        }
    }, []);

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
            // Ideally replace with Toast
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
        // Strict Mode: Only Admins and Editors can manage videos
        return auth.user.role === 'admin' || auth.user.role === 'editor';
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'safe': return <CheckCircle size={16} className="text-green-400" />;
            case 'flagged': return <AlertTriangle size={16} className="text-red-400" />;
            default: return <Clock size={16} className="text-yellow-400 animate-pulse" />;
        }
    };

    if (loading) return <div className="text-center mt-20">Loading videos...</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Video Library</h1>

            {videos.length === 0 ? (
                <div className="text-center text-gray-400 mt-20">
                    <p>No videos uploaded yet.</p>
                    <Link to="/upload" className="text-indigo-400 hover:underline mt-2 inline-block">Upload your first video</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {videos.map((video) => (
                        <div key={video._id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg group relative">
                            {/* Media Container */}
                            <div className="relative bg-gray-900 h-48 flex items-center justify-center overflow-hidden">
                                {video.sensitivityStatus === 'safe' ? (
                                    <Link to={`/video/${video._id}`} className="absolute inset-0 flex items-center justify-center group-hover:bg-black/40 transition z-10">
                                        <Play size={48} className="text-white drop-shadow-lg opacity-0 group-hover:opacity-100 transition duration-300" fill="currentColor" />
                                    </Link>
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
                                        <span className="text-gray-300 font-medium">
                                            {video.sensitivityStatus === 'flagged' ? 'Content Flagged' : 'Processing...'}
                                        </span>
                                    </div>
                                )}
                                {video.thumbnailPath ? (
                                    <img
                                        src={
                                            video.thumbnailPath.startsWith('http')
                                                ? video.thumbnailPath
                                                : `${BACKEND_URL.replace('/api', '')}/${video.thumbnailPath}`
                                        }
                                        alt={video.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="text-gray-600">No Thumbnail</div>
                                )}
                            </div>

                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg truncate flex-1 mr-2">{video.title}</h3>
                                    <div className="flex items-center gap-1 bg-gray-900/50 px-2 py-1 rounded text-xs whitespace-nowrap">
                                        {getStatusIcon(video.sensitivityStatus)}
                                        <span className="capitalize">{video.sensitivityStatus}</span>
                                    </div>
                                </div>

                                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{video.description}</p>

                                <div className="flex justify-between items-center text-xs text-gray-500 mt-auto">
                                    <span>By {video.owner?.username || 'Unknown User'}</span>
                                    <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                                </div>

                                {/* Management Actions */}
                                {canManage(video) && (
                                    <div className="mt-4 pt-4 border-t border-gray-700 flex justify-end gap-3">
                                        <button
                                            onClick={() => openEditModal(video)}
                                            className="p-2 text-blue-400 hover:bg-blue-500/10 rounded transition"
                                            title="Edit"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => confirmDelete(video._id)}
                                            className="p-2 text-red-400 hover:bg-red-500/10 rounded transition"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit Modal */}
            {editingVideo && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-2xl relative">
                        <button
                            onClick={closeEditModal}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <X size={24} />
                        </button>
                        <h2 className="text-2xl font-bold mb-6">Edit Video</h2>
                        <form onSubmit={initiateUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Title</label>
                                <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="w-full bg-gray-700 rounded p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    className="w-full bg-gray-700 rounded p-2 h-24 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={closeEditModal}
                                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded font-bold transition"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirmation Modals */}
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
