import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Video, LogOut, Upload as UploadIcon, User } from 'lucide-react';
import { Button } from "@/components/ui/button";

const Navbar = () => {
    const auth = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        auth?.logout();
        navigate('/login');
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md supports-[backdrop-filter]:bg-zinc-950/60">
            <div className="container mx-auto px-4 h-16 flex justify-between items-center">
                <Link to="/" className="text-xl font-bold flex items-center gap-2 text-zinc-100 hover:text-white transition-colors">
                    <Video size={24} className="text-zinc-100" />
                    StreamTube
                </Link>

                <div className="flex items-center gap-6">
                    {auth?.user ? (
                        <>
                            <Link to="/upload">
                                <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 gap-2">
                                    <UploadIcon size={18} />
                                    Upload
                                </Button>
                            </Link>
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-2 text-sm text-zinc-400">
                                    <User size={16} />
                                    {auth.user.username}
                                </span>
                                <Button
                                    onClick={handleLogout}
                                    variant="destructive"
                                    size="sm"
                                    className="h-8 px-2"
                                >
                                    <LogOut size={16} />
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="flex gap-4">
                            <Link to="/login">
                                <Button variant="ghost" className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800">
                                    Login
                                </Button>
                            </Link>
                            <Link to="/register">
                                <Button className="bg-zinc-100 text-zinc-900 hover:bg-white">
                                    Register
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
