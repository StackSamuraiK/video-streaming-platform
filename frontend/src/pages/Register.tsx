import { useState, useContext, type FormEvent } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_URL } from '../config';

// Shadcn Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const auth = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${BACKEND_URL}/auth/register`, {
                username,
                email,
                password
            });
            auth?.login(res.data.token, res.data.user);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh] px-4">
            <Card className="w-full max-w-sm bg-zinc-950 border-zinc-800 text-zinc-50 shadow-xl">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Register</CardTitle>
                    <CardDescription className="text-center text-zinc-400">
                        Create a new account to join the platform
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="bg-red-500/10 text-red-500 p-3 rounded-md text-sm mb-4 border border-red-500/20">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-zinc-200">Username</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="johndoe"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="bg-zinc-900 border-zinc-800 text-zinc-50 placeholder:text-zinc-500 focus-visible:ring-zinc-700"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-zinc-200">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-zinc-900 border-zinc-800 text-zinc-50 placeholder:text-zinc-500 focus-visible:ring-zinc-700"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-zinc-200">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-zinc-900 border-zinc-800 text-zinc-50 focus-visible:ring-zinc-700"
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full bg-zinc-50 text-zinc-900 hover:bg-zinc-200 font-semibold">
                            Sign Up
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="justify-center">
                    <p className="text-sm text-zinc-500">
                        Already have an account?{" "}
                        <Link to="/login" className="text-zinc-50 hover:underline">
                            Login
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
};

export default Register;
