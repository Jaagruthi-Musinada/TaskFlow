import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Sparkles, KeyRound, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { api } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/auth/forgot-password', { email });
            navigate('/reset-password', { state: { email } });
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to send OTP';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl p-10 rounded-[3.5rem] shadow-2xl shadow-brand-primary/10 w-full max-w-md border border-white/50 dark:border-white/5 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-8 text-pastel-pink rotate-12 opacity-40">
                    <Sparkles size={100} />
                </div>

                <div className="relative z-10">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-pastel-yellow text-yellow-600 rounded-[1.8rem] flex items-center justify-center mx-auto mb-6 shadow-sm border border-white">
                            <KeyRound size={28} />
                        </div>
                        <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">Recover</h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Get back into your DailyList</p>
                    </div>

                    {error && (
                        <div className="bg-pastel-pink/50 text-pink-600 p-4 mb-8 rounded-2xl text-xs font-bold border border-pink-100 flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-pink-600 animate-pulse"></div>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                <input
                                    type="email"
                                    className="w-full h-14 pl-12 pr-4 bg-white/50 dark:bg-slate-800 border border-white/50 rounded-2xl focus:outline-none focus:border-brand-primary transition-all text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-200"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-brand-primary/20 hover:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {loading ? 'Sending...' : 'Send Reset Code'}
                        </button>
                    </form>

                    <div className="mt-10 text-center">
                        <Link to="/login" className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-brand-primary transition-colors">
                            <ChevronLeft size={14} /> Back to Login
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
