import { useState, useContext, type FormEvent } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_URL } from '../config';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const auth = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${BACKEND_URL}/auth/login`, { email, password });
            auth?.login(res.data.token, res.data.user);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 bg-gray-800 p-8 rounded-lg shadow-xl">
            <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
            {error && <div className="bg-red-500/20 text-red-200 p-3 rounded mb-4">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-gray-700 rounded p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-gray-700 rounded p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                    />
                </div>
                <button className="w-full bg-indigo-600 hover:bg-indigo-700 py-2 rounded font-bold transition">
                    Sign In
                </button>
            </form>
            <p className="mt-4 text-center text-sm text-gray-400">
                Don't have an account? <Link to="/register" className="text-indigo-400 hover:underline">Register</Link>
            </p>
        </div>
    );
};

export default Login;
