import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Plus, Search, Filter, Calendar as CalendarIcon, Clock, CheckCircle2, Circle, Trash2, Edit3, ChevronRight, Zap, Target, Star, X, Sparkles } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
    const { user, logout, api } = useContext(AuthContext);
    const [tasks, setTasks] = useState([]);
    const [activeFilter, setActiveFilter] = useState('all');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [focusMode, setFocusMode] = useState(false);
    
    // Add Task State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDeadline, setNewDeadline] = useState('');
    const [newPriority, setNewPriority] = useState('Low');

    // Edit Task State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDeadline, setEditDeadline] = useState('');
    const [editPriority, setEditPriority] = useState('Low');

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const res = await api.get('/tasks');
            setTasks(res.data);
        } catch (err) {
            console.error("Fetch Tasks Error:", err);
        }
    };

    const handleAddTask = async (e) => {
        e.preventDefault();
        try {
            await api.post('/tasks', {
                title: newTitle,
                deadline: newDeadline || new Date().toISOString(),
                priority: newPriority
            });
            setNewTitle('');
            setIsAddModalOpen(false);
            fetchTasks();
        } catch (err) {
            console.error("Add Task Error:", err);
        }
    };

    const openEditModal = (task) => {
        setEditingTask(task);
        setEditTitle(task.title);
        setEditDeadline(task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '');
        setEditPriority(task.priority || 'Low');
        setIsEditModalOpen(true);
    };

    const handleUpdateTask = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/tasks/${editingTask.id}`, {
                ...editingTask,
                title: editTitle,
                deadline: editDeadline,
                priority: editPriority
            });
            setIsEditModalOpen(false);
            fetchTasks();
        } catch (err) {
            console.error("Update Task Error:", err);
        }
    };

    const toggleTask = async (task) => {
        try {
            await api.put(`/tasks/${task.id}`, { ...task, completed: !task.completed });
            fetchTasks();
        } catch (err) {
            console.error("Toggle Task Error:", err);
        }
    };

    const deleteTask = async (id) => {
        try {
            await api.delete(`/tasks/${id}`);
            setTasks(prev => prev.filter(t => t.id !== id));
        } catch (err) {
            console.error("Delete Task Error:", err);
        }
    };

    const getPriorityColor = (priority) => {
        if (priority === 'High') return 'bg-pastel-pink text-pink-600';
        if (priority === 'Medium') return 'bg-pastel-yellow text-yellow-600';
        return 'bg-pastel-blue text-blue-600';
    };

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFocus = focusMode ? task.priority === 'High' : true;
        
        if (!matchesFocus) return false;

        if (activeFilter === 'completed') return task.completed && matchesSearch;
        if (activeFilter === 'today') {
            const today = new Date().toDateString();
            return new Date(task.deadline).toDateString() === today && matchesSearch;
        }
        if (activeFilter === 'upcoming') {
            return new Date(task.deadline) > new Date() && !task.completed && matchesSearch;
        }
        return matchesSearch;
    });

    const completionRate = tasks?.length > 0 
        ? Math.round((tasks.filter(t => t?.completed).length / tasks.length) * 100) 
        : 0;


    return (
        <div className="min-h-screen bg-transparent transition-colors duration-500">
            <Sidebar 
                activeFilter={activeFilter} 
                setActiveFilter={setActiveFilter} 
                isOpen={isSidebarOpen}
                toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                logout={logout}
                user={user}
            />

            <main className={`transition-all duration-700 ease-out p-6 lg:p-12 ${isSidebarOpen ? 'lg:ml-80' : 'ml-0'}`}>
                <header className="max-w-4xl mx-auto mb-10 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">My Dashboard</p>
                        <h1 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                            {focusMode ? 'Focus Active' : 'Current Focus'}
                            <div className={`w-2 h-2 rounded-full animate-pulse ${focusMode ? 'bg-pink-500 shadow-lg shadow-pink-500/50' : 'bg-brand-primary'}`} />
                        </h1>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {user?.isPro && (
                            <button 
                                onClick={() => setFocusMode(!focusMode)} 
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${focusMode ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20' : 'bg-white dark:bg-slate-900 border border-white/50 dark:border-white/5 text-slate-400'}`}
                                title="Focus Mode"
                            >
                                <Sparkles size={20} className={focusMode ? 'animate-spin-slow' : ''} />
                            </button>
                        )}
                        <button onClick={() => setIsAddModalOpen(true)} className="pill-button btn-premium text-xs">
                            <Plus size={16} /> New Entry
                        </button>
                    </div>
                </header>

                {user?.isPro && (
                    <div className="max-w-4xl mx-auto mb-10 grid grid-cols-1 gap-6">
                        {/* Insight Hub */}
                        <div className="daily-card p-6 border-brand-primary/10">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Target size={14} className="text-brand-primary" /> Insight Hub
                                </h4>
                                <span className="text-xl font-black text-slate-800 dark:text-white">{completionRate}%</span>
                            </div>
                            <div className="w-full h-3 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${completionRate}%` }}
                                    className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary"
                                />
                            </div>
                            <p className="text-[9px] font-bold text-slate-400 mt-3 uppercase tracking-tighter">Your daily efficiency updated in real-time</p>
                        </div>
                    </div>
                )}

                <div className="max-w-4xl mx-auto mb-8 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 group w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary transition-colors" size={16} />
                        <input 
                            type="text" 
                            placeholder="Find quickly..." 
                            className="w-full h-12 pl-12 pr-4 bg-white/50 dark:bg-slate-900 border border-white/50 dark:border-white/5 rounded-2xl focus:outline-none focus:border-brand-primary transition-all text-sm font-bold shadow-sm text-slate-800 dark:text-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="max-w-4xl mx-auto space-y-3">
                    <AnimatePresence mode="popLayout">
                        {filteredTasks.length > 0 ? (
                            filteredTasks.map((task, index) => (
                                <motion.div
                                    key={task.id}
                                    layout
                                    className={`group daily-card flex items-center gap-5 p-5 ${task.completed ? 'opacity-50' : ''}`}
                                >
                                    <button 
                                        onClick={() => toggleTask(task)}
                                        className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${task.completed ? 'bg-pastel-green text-green-600' : 'bg-slate-100'}`}
                                    >
                                        <CheckCircle2 size={20} />
                                    </button>

                                    <div className="flex-1 min-w-0 pointer-events-none">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tighter ${getPriorityColor(task.priority || 'Low')}`}>
                                                {task.priority || 'Low'}
                                            </span>
                                        </div>
                                        <h3 className={`text-base font-bold truncate ${task.completed ? 'text-slate-400 line-through' : 'text-slate-800 dark:text-white'}`}>
                                            {task.title}
                                        </h3>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <button 
                                            onClick={() => openEditModal(task)}
                                            className="p-2 text-slate-400 hover:text-brand-primary hover:bg-white rounded-xl shadow-sm transition-all"
                                        >
                                            <Edit3 size={16} />
                                        </button>
                                        <button 
                                            onClick={() => deleteTask(task.id)}
                                            className="p-2 text-slate-400 hover:text-pink-500 hover:bg-white rounded-xl shadow-sm transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-12 daily-card">
                                <img src="/assets/empty.png" className="w-48 h-48 mx-auto mb-6 grayscale opacity-20" alt="Empty" />
                                <h3 className="text-xl font-black text-slate-400">Everything is clear</h3>
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Modals for Add and Edit */}
                <AnimatePresence>
                    {(isAddModalOpen || isEditModalOpen) && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-sm bg-slate-900/20">
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8">
                                <div className="flex justify-between items-center mb-8">
                                    <h2 className="text-2xl font-black text-slate-800 dark:text-slate-800">{isAddModalOpen ? 'New Task' : 'Modify Task'}</h2>
                                    <button onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="p-2 hover:bg-slate-100 rounded-xl"><X size={20} className="text-slate-800"/></button>
                                </div>
                                <form onSubmit={isAddModalOpen ? handleAddTask : handleUpdateTask} className="space-y-6">
                                    <input 
                                        type="text" 
                                        className="w-full h-14 px-6 bg-slate-50 rounded-2xl font-bold text-slate-900" 
                                        placeholder="Task Title"
                                        value={isAddModalOpen ? newTitle : editTitle}
                                        onChange={(e) => isAddModalOpen ? setNewTitle(e.target.value) : setEditTitle(e.target.value)}
                                        required 
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <input 
                                            type="date" 
                                            className="w-full h-14 px-6 bg-slate-50 rounded-2xl font-bold text-slate-900"
                                            value={isAddModalOpen ? newDeadline : editDeadline}
                                            onChange={(e) => isAddModalOpen ? setNewDeadline(e.target.value) : setEditDeadline(e.target.value)}
                                        />
                                        <select 
                                            className="w-full h-14 px-6 bg-slate-50 rounded-2xl font-bold text-slate-900"
                                            value={isAddModalOpen ? newPriority : editPriority}
                                            onChange={(e) => isAddModalOpen ? setNewPriority(e.target.value) : setEditPriority(e.target.value)}
                                        >
                                            <option>Low</option><option>Medium</option><option>High</option>
                                        </select>
                                    </div>
                                    <button type="submit" className="w-full h-16 bg-brand-primary text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-lg shadow-brand-primary/20">
                                        {isAddModalOpen ? 'Create Task' : 'Update Task'}
                                    </button>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default Dashboard;
