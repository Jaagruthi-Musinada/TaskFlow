import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, Chrome, Shield, Sparkles } from 'lucide-react';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { signup } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await signup(email, password);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Signup failed');
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:5000/auth/google';
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl p-10 rounded-[3.5rem] shadow-2xl shadow-brand-primary/10 w-full max-w-md border border-white/50 dark:border-white/5 relative overflow-hidden">
                
                {/* Decorative Elements */}
                <div className="absolute bottom-0 left-0 p-8 text-pastel-lavender -rotate-12 opacity-40">
                    <Sparkles size={100} />
                </div>

                <div className="relative z-10">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-pastel-green text-green-600 rounded-[1.8rem] flex items-center justify-center mx-auto mb-6 shadow-sm border border-white">
                            <UserPlus size={28} />
                        </div>
                        <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">Create Account</h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Join the DailyList community</p>
                    </div>

                    {error && (
                        <div className="bg-pastel-pink/50 text-pink-600 p-4 mb-8 rounded-2xl text-xs font-bold border border-pink-100 flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-pink-600 animate-pulse"></div>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                <input
                                    type="email"
                                    className="w-full h-14 pl-12 pr-4 bg-white/50 border border-white/50 rounded-2xl focus:outline-none focus:border-brand-primary transition-all text-sm font-bold placeholder:text-slate-200"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Set Password</label>
                            <div className="relative">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                <input
                                    type="password"
                                    className="w-full h-14 pl-12 pr-4 bg-white/50 border border-white/50 rounded-2xl focus:outline-none focus:border-brand-primary transition-all text-sm font-bold placeholder:text-slate-200"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 px-4 py-2 text-[10px] text-slate-400 font-bold">
                            <Shield size={12} className="text-brand-primary" />
                            <span>8+ characters required</span>
                        </div>

                        <button
                            type="submit"
                            className="w-full h-14 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-brand-primary/20 hover:scale-[0.98] transition-all"
                        >
                            Get Started
                        </button>

                        <div className="relative flex items-center gap-4 py-2">
                            <div className="flex-1 h-px bg-slate-100"></div>
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">or</span>
                            <div className="flex-1 h-px bg-slate-100"></div>
                        </div>

                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            className="w-full h-14 bg-white border border-slate-100 text-slate-800 rounded-2xl font-black text-[10px] hover:bg-slate-50 transition-all flex items-center justify-center gap-4 shadow-sm group"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" className="group-hover:scale-110 transition-transform">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                            <span className="uppercase tracking-[0.2em]">Continue with Google</span>
                        </button>
                    </form>

                    <p className="mt-10 text-center text-[10px] text-slate-400 font-black uppercase tracking-widest">
                        Already have an account? <Link to="/login" className="text-brand-primary underline underline-offset-4">Sign in here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
