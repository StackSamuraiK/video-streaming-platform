import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';
import { BACKEND_URL } from '../config';
import { AuthContext } from '../context/AuthContext';

interface Video {
    _id: string;
    title: string;
    description: string;
    owner: {
        username: string;
    };
}

const VideoPlayer = () => {
    const { id } = useParams<{ id: string }>();
    const [video, setVideo] = useState<Video | null>(null);
    const auth = useContext(AuthContext);

    useEffect(() => {
        const fetchVideo = async () => {
            try {
                // Fetch list to find specific video metadata (naive but works for now as we don't have single video endpoint)
                const res = await axios.get(`${BACKEND_URL}/videos`, {
                    headers: { Authorization: `Bearer ${auth?.token}` }
                });
                const found = res.data.find((v: Video) => v._id === id);
                if (found) setVideo(found);
            } catch (error) {
                console.error("Error fetching video", error);
            }
        };
        if (auth?.token) {
            fetchVideo();
        }
    }, [id, auth?.token]);

    if (!video) return <div className="text-center mt-20">Loading video...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition">
                <ArrowLeft size={20} /> Back to Library
            </Link>

            <div className="bg-black rounded-lg overflow-hidden shadow-2xl aspect-video mb-6">
                <video
                    controls
                    autoPlay
                    className="w-full h-full"
                    src={`${BACKEND_URL}/videos/${id}/stream`}
                >
                    Your browser does not support the video tag.
                </video>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
                <h1 className="text-3xl font-bold mb-2">{video.title}</h1>
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-6">
                    <span>Uploaded by {video.owner?.username || 'Unknown User'}</span>
                </div>
                <div className="prose prose-invert max-w-none">
                    <p className="text-gray-300">{video.description}</p>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;
