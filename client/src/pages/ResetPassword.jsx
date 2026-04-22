import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, Lock, ChevronLeft, Sparkles, KeySquare, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

const ResetPassword = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { api } = useContext(AuthContext);

    const [email, setEmail] = useState(location.state?.email || '');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (newPassword !== confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/reset-password', { email, otp, newPassword });
            setMessage('Success! Redirecting...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl p-10 rounded-[3.5rem] shadow-2xl shadow-brand-primary/10 w-full max-w-md border border-white/50 dark:border-white/5 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-8 text-pastel-lavender -rotate-12 opacity-40">
                    <Sparkles size={100} />
                </div>

                <div className="relative z-10">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-pastel-lavender text-brand-primary rounded-[1.8rem] flex items-center justify-center mx-auto mb-6 shadow-sm border border-white">
                            <KeySquare size={28} />
                        </div>
                        <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">New Password</h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                            {email ? `Verify code sent to ${email}` : 'Secure your account'}
                        </p>
                    </div>

                    {error && (
                        <div className="bg-pastel-pink/50 text-pink-600 p-4 mb-8 rounded-2xl text-xs font-bold border border-pink-100 flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-pink-600 animate-pulse"></div>
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="bg-pastel-green/50 text-green-600 p-4 mb-8 rounded-2xl text-xs font-bold border border-green-100 flex items-center gap-3">
                            <CheckCircle2 size={16} />
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!location.state?.email && (
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Email</label>
                                <input
                                    type="email"
                                    className="w-full h-14 px-6 bg-white/50 dark:bg-slate-800 border border-white/50 rounded-2xl focus:outline-none focus:border-brand-primary transition-all text-sm font-bold text-slate-900 dark:text-white"
                                    placeholder="Confirm email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">6-Digit Code</label>
                            <input
                                type="text"
                                className="w-full h-16 px-6 bg-white/50 dark:bg-slate-800 border border-white/50 rounded-2xl focus:outline-none focus:border-brand-primary transition-all font-black text-center text-2xl tracking-[0.6em] text-slate-900 dark:text-white placeholder:text-slate-100 placeholder:tracking-normal"
                                placeholder="000000"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">New Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-primary transition-colors" size={16} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="w-full h-14 pl-12 pr-12 bg-white/50 dark:bg-slate-800 border border-white/50 rounded-2xl focus:outline-none focus:border-brand-primary transition-all text-sm font-bold text-slate-900 dark:text-white"
                                    placeholder="••••••••"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-primary transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Confirm</label>
                            <div className="relative group">
                                <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-primary transition-colors" size={16} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="w-full h-14 pl-12 pr-12 bg-white/50 dark:bg-slate-800 border border-white/50 rounded-2xl focus:outline-none focus:border-brand-primary transition-all text-sm font-bold text-slate-900 dark:text-white"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-brand-primary/20 hover:scale-[0.98] transition-all disabled:opacity-50 mt-4"
                        >
                            {loading ? 'Processing...' : 'Unlock Account'}
                        </button>
                    </form>

                    <div className="mt-10 text-center">
                        <Link to="/login" className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-brand-primary transition-colors">
                            Cancel
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
