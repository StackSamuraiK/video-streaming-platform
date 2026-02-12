import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Video, LogOut, Upload as UploadIcon, User } from 'lucide-react';

const Navbar = () => {
    const auth = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        auth?.logout();
        navigate('/login');
    };

    return (
        <nav className="bg-gray-800 p-4 shadow-lg">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-xl font-bold flex items-center gap-2 text-indigo-400">
                    <Video size={24} />
                    StreamPlatform
                </Link>

                <div className="flex items-center gap-6">
                    {auth?.user ? (
                        <>
                            <Link to="/upload" className="flex items-center gap-2 hover:text-indigo-400 transition">
                                <UploadIcon size={20} />
                                Upload
                            </Link>
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-2 text-gray-300">
                                    <User size={18} />
                                    {auth.user.username}
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm transition"
                                >
                                    <LogOut size={18} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex gap-4">
                            <Link to="/login" className="hover:text-indigo-400 transition">Login</Link>
                            <Link to="/register" className="bg-indigo-600 hover:bg-indigo-700 px-4 py-1 rounded transition">Register</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
