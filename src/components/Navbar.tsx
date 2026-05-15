import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Bell, 
    User, 
    LogOut, 
    ChevronDown,
    UserCircle
} from 'lucide-react';
import { getUnreadCount } from '../pages/notifications/notificationService';

const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [user, setUser] = useState<any>(() => {
        try {
            const storedUser = localStorage.getItem('user');
            return storedUser ? JSON.parse(storedUser) : {};
        } catch (e) {
            return {};
        }
    });

    const fetchUnreadCount = async () => {
        try {
            const count = await getUnreadCount();
            setUnreadCount(count);
        } catch (error) {
            console.error('Navbar: Failed to fetch unread count', error);
        }
    };

    const fetchUserData = async () => {
        try {
            const { getMe } = await import('../pages/user/userService');
            const userData = await getMe();
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
            console.error('Navbar: Failed to fetch user data', error);
        }
    };

    React.useEffect(() => {
        fetchUnreadCount();
        fetchUserData();
        const interval = setInterval(fetchUnreadCount, 30000); // Update every 30s
        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        localStorage.removeItem('active_role');
        navigate('/login');
    };

    return (
        <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between transition-all duration-300">
            {/* Left Side: Empty or Title */}
            <div className="flex-1" />

            {/* Right Side: Actions & Profile */}
            <div className="flex items-center gap-3">
                {/* Notifications */}
                <button 
                    onClick={() => navigate('/notifications')}
                    className="p-2.5 rounded-xl hover:bg-muted/30 text-muted hover:text-primary transition-all relative"
                >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-rose-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-card px-1 shadow-lg shadow-rose-500/20">
                            {unreadCount}
                        </span>
                    )}
                </button>

                {/* Vertical Divider */}
                <div className="w-px h-6 bg-border mx-1" />

                {/* Profile Dropdown */}
                <div className="relative">
                    <button 
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className={`flex items-center gap-3 p-1.5 pr-3 rounded-2xl hover:bg-muted/30 transition-all ${isProfileOpen ? 'bg-muted/30 ring-1 ring-primary/20' : ''}`}
                    >
                        <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold shadow-sm border border-primary/20 overflow-hidden">
                            {user.profile_pic ? (
                                <img src={user.profile_pic} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                user.username ? user.username[0].toUpperCase() : <User size={20} />
                            )}
                        </div>
                        <div className="hidden sm:block text-left">
                            <p className="text-xs font-black text-foreground truncate max-w-[100px]">{user.username || 'User'}</p>
                        </div>
                        <ChevronDown size={14} className={`text-muted transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {isProfileOpen && (
                        <>
                            <div 
                                className="fixed inset-0 z-10" 
                                onClick={() => setIsProfileOpen(false)}
                            />
                            <div className="absolute right-0 mt-3 w-56 bg-card border border-border rounded-[1.5rem] shadow-2xl shadow-primary/10 z-20 py-2 animate-in fade-in zoom-in-95 duration-200">
                                <div className="px-4 py-3 border-b border-border mb-2">
                                    <p className="text-xs font-bold text-muted uppercase tracking-widest">Account</p>
                                    <p className="text-sm font-black text-foreground mt-1 truncate">{user.email || 'user@extechnology.com'}</p>
                                </div>
                                
                                <button 
                                    onClick={() => { navigate('/profile'); setIsProfileOpen(false); }}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-muted hover:text-primary hover:bg-primary/5 transition-all font-bold"
                                >
                                    <UserCircle size={18} />
                                    My Profile
                                </button>

                                
                                <div className="h-px bg-border my-2 mx-4" />
                                
                                <button 
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-rose-500 hover:bg-rose-500/5 transition-all font-black"
                                >
                                    <LogOut size={18} />
                                    Logout
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
