import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Sparkles, ArrowLeft } from 'lucide-react';

const VerifyEmail = () => {
    const { verifyEmail } = useContext(AuthContext);
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();
    const location = useLocation();
    
    // Get email from previous page state or prompt user
    const [email, setEmail] = useState(location.state?.email || '');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await verifyEmail(email, otp);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed. Please check your code.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl p-10 rounded-[3.5rem] shadow-2xl shadow-brand-primary/10 w-full max-w-md border border-white/50 dark:border-white/5 relative overflow-hidden">
                
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 p-8 text-brand-primary rotate-45 opacity-20">
                    <Sparkles size={80} />
                </div>

                <div className="relative z-10">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-pastel-lavender text-brand-primary rounded-[1.8rem] flex items-center justify-center mx-auto mb-6 shadow-sm border border-white">
                            <ShieldCheck size={28} />
                        </div>
                        <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">Verify Your Account</h2>
                        <p className="text-xs font-bold text-slate-400 tracking-widest">We sent a code to <span className="text-brand-primary">{email || 'your email'}</span></p>
                    </div>

                    {error && (
                        <div className="bg-pastel-pink/50 text-pink-600 p-4 mb-8 rounded-2xl text-xs font-bold border border-pink-100 flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-pink-600 animate-pulse"></div>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {!email && (
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Confirm Email</label>
                                <input
                                    type="email"
                                    className="w-full h-14 px-6 bg-white/50 border border-white/50 rounded-2xl focus:outline-none focus:border-brand-primary transition-all text-sm font-bold"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        )}

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center block">Enter 6-Digit Code</label>
                            <input
                                type="text"
                                className="w-full h-20 bg-white/50 border border-white/50 rounded-2xl focus:outline-none focus:border-brand-primary transition-all font-black text-center text-3xl tracking-[0.6em] placeholder:text-slate-100"
                                placeholder="000000"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || otp.length < 6}
                            className="w-full h-14 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-brand-primary/20 hover:scale-[0.98] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                        >
                            {loading ? 'Verifying...' : 'Unlock Account'}
                        </button>
                    </form>

                    <button 
                        onClick={() => navigate('/login')}
                        className="mt-10 w-full flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest hover:text-brand-primary transition-colors"
                    >
                        <ArrowLeft size={12} />
                        Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
