import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
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
        <div className="max-w-7xl mx-auto px-4 py-6">
            <Link to="/" className="inline-block mb-6">
                <Button variant="ghost" className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 gap-2 pl-2 pr-4 rounded-full transition-all duration-300 hover:scale-105">
                    <ArrowLeft size={20} /> <span className="font-medium">Back to Library</span>
                </Button>
            </Link>

            <div className="bg-black rounded-xl overflow-hidden shadow-2xl aspect-video mb-8 ring-1 ring-zinc-800">
                <video
                    controls
                    autoPlay
                    className="w-full h-full"
                    src={`${BACKEND_URL}/videos/${id}/stream`}
                >
                    Your browser does not support the video tag.
                </video>
            </div>

            <div className="bg-zinc-950/50 p-6 rounded-xl border border-zinc-800/50 backdrop-blur-sm">
                <h1 className="text-3xl font-bold mb-3 text-zinc-100 tracking-tight">{video.title}</h1>
                <div className="flex items-center gap-3 text-zinc-400 text-sm mb-6 border-b border-zinc-800 pb-4">
                    <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-semibold text-xs">
                        {video.owner?.username?.substring(0, 2).toUpperCase() || '?'}
                    </div>
                    <span className="font-medium">Uploaded by <span className="text-zinc-200">{video.owner?.username || 'Unknown User'}</span></span>
                </div>
                <div className="prose prose-invert max-w-none">
                    <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">{video.description}</p>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;
