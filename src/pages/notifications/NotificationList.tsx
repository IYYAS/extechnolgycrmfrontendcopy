import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markAsRead, type Notification } from './notificationService';
import { Bell, Check, Clock, MessageSquare, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

const NotificationList: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const data = await getNotifications();
            setNotifications(data.results);
        } catch (err) {
            setError('Failed to load notifications.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkAsRead = async (n: Notification) => {
        if (!n.is_read) {
            try {
                await markAsRead(n.id);
                setNotifications(prev => prev.map(notif => 
                    notif.id === n.id ? { ...notif, is_read: true } : notif
                ));
            } catch (err) {
                console.error('Failed to mark as read', err);
            }
        }
    };

    const handleNotifClick = async (n: Notification) => {
        await handleMarkAsRead(n);
        if (n.activity) {
            navigate(`/activities/${n.activity}/comments`);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <Loader2 className="animate-spin text-primary" size={48} />
            <p className="text-muted font-medium italic">Loading notifications...</p>
        </div>
    );


    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <button onClick={() => navigate(-1)} className="p-3 bg-muted/20 text-muted rounded-2xl hover:bg-primary/10 hover:text-primary transition-all active:scale-95 border border-transparent hover:border-primary/20">
                        <ArrowLeft size={22} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-foreground text-primary">Notifications</h1>
                        <p className="text-muted font-bold text-xs uppercase tracking-widest mt-0.5">Stay updated with your activities</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-lg border border-primary/20 uppercase">
                        {notifications.filter(n => !n.is_read).length} Unread
                    </span>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 text-sm font-bold">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            {/* List */}
            <div className="space-y-4">
                {notifications.length === 0 ? (
                    <div className="py-20 text-center bg-card border border-border rounded-[2.5rem]">
                        <Bell size={48} className="mx-auto text-muted/20 mb-4" />
                        <h3 className="text-lg font-bold text-muted">No notifications found</h3>
                        <p className="text-sm text-muted/60 mt-1 uppercase tracking-widest font-bold text-[10px]">Everything is quiet here</p>
                    </div>
                ) : (
                    notifications.map((n) => (
                        <div 
                            key={n.id} 
                            onClick={() => handleNotifClick(n)}
                            className={`group relative bg-card border transition-all duration-300 p-6 rounded-[2rem] cursor-pointer hover:shadow-xl ${!n.is_read ? 'border-primary/30 ring-1 ring-primary/10 shadow-lg shadow-primary/5' : 'border-border hover:border-primary/20'}`}
                        >
                            {!n.is_read && (
                                <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" />
                            )}
                            
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-2xl transition-all ${!n.is_read ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-muted/10 text-muted'}`}>
                                        <MessageSquare size={20} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className={`text-sm tracking-tight ${!n.is_read ? 'font-black text-foreground' : 'font-medium text-muted-foreground'}`}>
                                            {n.message}
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted uppercase tracking-widest">
                                                <Clock size={12} />
                                                {new Date(n.created_at).toLocaleString()}
                                            </div>
                                            {!n.is_read && (
                                                <span className="flex items-center gap-1 text-[9px] font-black text-primary uppercase bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                                                    <Check size={10} /> New Notification
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                    <div className="p-2 bg-primary/10 text-primary rounded-xl">
                                        <ArrowLeft className="rotate-180" size={16} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationList;
