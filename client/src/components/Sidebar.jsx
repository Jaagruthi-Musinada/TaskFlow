import { LayoutDashboard, CheckSquare, Clock, Calendar, Moon, Sun, LogOut, User as UserIcon, Sparkles, BarChart3, Palette, Zap } from 'lucide-react';
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = ({ activeFilter, setActiveFilter, isOpen, toggleSidebar, logout, user }) => {
    const { api, refreshProfile } = useContext(AuthContext);
    const [isDark, setIsDark] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') === 'dark' || 
                   (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
        }
        return false;
    });

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    const filters = [
        { id: 'all', label: 'Everything', icon: <LayoutDashboard size={18} /> },
        { id: 'today', label: 'Today', icon: <Calendar size={18} /> },
        { id: 'upcoming', label: 'Upcoming', icon: <Clock size={18} /> },
        { id: 'completed', label: 'Done', icon: <CheckSquare size={18} /> },
    ];

    const premiumFeatures = [
        { id: 'focus', label: 'Focus Mode', icon: <Sparkles size={16} /> },
        { id: 'stats', label: 'Insight Hub', icon: <BarChart3 size={16} /> },
        { id: 'priority', label: 'Priority Engine', icon: <Zap size={16} /> },
    ];

    const handlePayment = async () => {
        const keyId = import.meta.env.VITE_RAZORPAY_KEYID;
        
        if (!keyId || keyId.includes("YourActually")) {
            alert("Please provide a valid Razorpay Test Key ID in client/.env to use the official UI.");
            return;
        }

        if (!window.Razorpay) {
            alert("Razorpay checkout script not loaded. Please wait or refresh the page.");
            return;
        }

        try {
            const options = {
                key: keyId,
                amount: 10000, 
                currency: "INR",
                name: "DailyList Pro",
                description: "Unlock Premium Features",
                handler: async (response) => {
                    // Non-blocking success flow
                    api.put('/auth/unlock-pro')
                        .then(() => refreshProfile())
                        .then(() => {
                            console.log("Pro Unlocked Successfully");
                        })
                        .catch(err => console.error("Unlock error:", err));
                },
                prefill: {
                    name: user?.name || "User",
                    email: user?.email || "user@example.com",
                },
                theme: { color: "#c026d3" }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                console.error("Payment failed:", response.error);
                // Avoid blocking alerts that might crash the background state
            });
            rzp.open();
        } catch (err) {
            console.error("Razorpay Error:", err);
            alert("Critical Error opening Razorpay UI. Check if your Key ID is correct.");
        }
    };

    return (
        <aside className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-all duration-700 ease-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="h-[calc(100vh-2rem)] bg-white/70 dark:bg-slate-900/60 backdrop-blur-3xl border border-white/50 dark:border-white/5 flex flex-col m-4 rounded-[3rem] shadow-2xl shadow-purple-500/5 overflow-hidden">
                
                {/* Logo & Profile */}
                <div className="p-8 pb-4">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 bg-brand-primary rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-brand-primary/20">D</div>
                        <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-widest uppercase text-xs">DailyList</h1>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-white/5 rounded-3xl border border-white/50 dark:border-white/5 mb-8">
                        <img 
                            src={user?.avatar || "/assets/avatar.png"} 
                            className="w-10 h-10 rounded-2xl object-cover shadow-sm bg-pastel-lavender" 
                            alt="User" 
                        />
                        <div className="min-w-0">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-tighter truncate leading-none mb-1">User Profile</p>
                            <h2 className="text-sm font-bold text-slate-800 dark:text-white truncate">
                                {user?.name || user?.email?.split('@')[0] || 'Planer'}
                            </h2>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                    <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Navigation</p>
                    {filters.map((filter) => (
                        <button
                            key={filter.id}
                            onClick={() => setActiveFilter(filter.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 relative group ${
                                activeFilter === filter.id 
                                ? 'bg-white dark:bg-slate-800 text-brand-primary shadow-sm border border-brand-primary/10' 
                                : 'text-slate-500 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-white/5'
                            }`}
                        >
                            <div className={`transition-colors ${activeFilter === filter.id ? 'text-brand-primary' : 'text-slate-400 group-hover:text-slate-600'}`}>
                                {filter.icon}
                            </div>
                            <span className="font-bold text-sm tracking-tight">{filter.label}</span>
                            {activeFilter === filter.id && (
                                <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-brand-primary" />
                            )}
                        </button>
                    ))}

                    <div className="pt-6">
                        <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex justify-between items-center">
                            Pro Features <span className="bg-brand-primary text-white scale-75 rounded-md px-1 py-0.5 font-black">PRO</span>
                        </p>
                        {premiumFeatures.map((feature) => (
                            <div 
                                key={feature.id} 
                                className={`w-full flex items-center justify-between px-4 py-3 transition-all cursor-pointer ${
                                    user?.isPro 
                                    ? 'text-slate-600 dark:text-slate-300 hover:text-brand-primary group' 
                                    : 'text-slate-300 dark:text-slate-600 grayscale opacity-40 cursor-not-allowed'
                                }`}
                                onClick={() => {
                                    if (user?.isPro) {
                                        // Trigger feature action - logic will be in Dashboard usually
                                        alert(`${feature.label} activated!`);
                                    } else {
                                        handlePayment();
                                    }
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-1 px-1.5 rounded-lg ${user?.isPro ? 'bg-slate-100 dark:bg-white/5 group-hover:bg-brand-primary/10' : 'bg-slate-50'}`}>
                                        {feature.icon}
                                    </div>
                                    <span className="font-bold text-xs">{feature.label}</span>
                                </div>
                                {user?.isPro ? (
                                    <Zap size={12} className="text-brand-primary" />
                                ) : (
                                    <Zap size={12} className="text-slate-200" />
                                )}
                            </div>
                        ))}
                    </div>
                </nav>

                <div className="p-4 pt-0">
                    <button 
                        id="sidebar-pro-btn"
                        onClick={user?.isPro ? () => alert("You are already PRO!") : handlePayment}
                        className={`w-full p-4 bg-gradient-to-br transition-all ${user?.isPro ? 'from-pastel-green to-green-500/80 shadow-green-500/10' : 'from-brand-primary/90 to-brand-secondary/90 shadow-purple-500/20'} rounded-3xl text-left relative overflow-hidden group shadow-lg active:scale-95`}
                    >
                        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg text-white text-[10px] font-black z-20">
                            ₹100
                        </div>
                        <img 
                            src="/assets/pro-banner.png" 
                            className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay group-hover:scale-110 transition-transform duration-1000" 
                            alt="Pro" 
                        />
                        <div className="relative z-10">
                            <p className="text-white font-black text-[10px] uppercase tracking-widest mb-1 opacity-70 text-shadow-sm">
                                {user?.isPro ? 'Active' : 'Upgrade'}
                            </p>
                            <h3 className="text-white font-bold text-sm mb-3">
                                {user?.isPro ? 'Welcome Pro!' : 'Go Pro Today'}
                            </h3>
                            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white">
                                {user?.isPro ? 'All Features Unlocked' : 'Unlock 4 Features'}
                            </div>
                        </div>
                    </button>
                </div>

                <div className="p-6 pt-0 flex gap-2">
                    <button onClick={() => setIsDark(!isDark)} className="flex-1 h-12 flex items-center justify-center bg-slate-100 dark:bg-white/5 rounded-2xl text-slate-500 transition-all hover:bg-pastel-blue hover:text-blue-600">
                        {isDark ? <Moon size={20} /> : <Sun size={20} />}
                    </button>
                    <button 
                        onClick={() => {
                            console.log("Logout triggered from Sidebar");
                            logout();
                        }} 
                        className="flex-1 h-12 flex items-center justify-center bg-slate-100 dark:bg-white/5 rounded-2xl text-slate-500 transition-all hover:bg-pastel-pink hover:text-pink-600"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
