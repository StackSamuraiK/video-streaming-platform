import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Video, LogOut, Upload as UploadIcon, User, ShieldCheck } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
    const auth = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        auth?.logout();
        navigate('/login');
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'admin': return <ShieldCheck size={12} className="text-green-400" />;
            case 'editor': return <ShieldCheck size={12} className="text-blue-400" />;
            default: return <User size={12} className="text-zinc-400" />;
        }
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
                        <div className="flex items-center gap-4">
                            <Link to="/upload">
                                <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 gap-2 font-medium">
                                    <UploadIcon size={18} />
                                    Upload
                                </Button>
                            </Link>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-10 w-10 rounded-full overflow-hidden bg-zinc-800 hover:ring-2 hover:ring-zinc-700 transition-all p-0">
                                        <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-zinc-400">
                                            <span className="font-semibold text-sm">{auth.user.username.substring(0, 2).toUpperCase()}</span>
                                        </div>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 bg-zinc-950 border-zinc-800 shadow-xl ring-1 ring-zinc-800">
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none text-zinc-100">{auth.user.username}</p>
                                            <p className="text-xs leading-none text-zinc-400 truncate">{auth.user.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-zinc-800" />

                                    <div className="px-2 py-2 flex items-center justify-between">
                                        <span className="text-xs text-zinc-400 font-medium">Role</span>
                                        <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${auth.user.role === 'admin' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                            auth.user.role === 'editor' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                'bg-zinc-800 text-zinc-300 border-zinc-700'
                                            }`}>
                                            {getRoleIcon(auth.user.role)}
                                            {auth.user.role}
                                        </span>
                                    </div>

                                    <DropdownMenuSeparator className="bg-zinc-800" />
                                    <DropdownMenuItem onClick={handleLogout} className="text-red-400 focus:text-red-300 focus:bg-zinc-900 cursor-pointer">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Log out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
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
