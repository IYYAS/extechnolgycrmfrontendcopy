import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markAsRead, markAllAsRead, type Notification } from './notificationService';
import { Bell, Check, Clock, MessageSquare, ArrowLeft, Loader2, AlertCircle, Server, Globe, AlertTriangle, CheckCheck } from 'lucide-react';

const NotificationList: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [isMarkingAll, setIsMarkingAll] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const navigate = useNavigate();

    const fetchNotifications = async (p: number, append: boolean = false) => {
        if (append) setLoadingMore(true);
        else setLoading(true);
        try {
            const data = await getNotifications(p);
            if (append) {
                setNotifications(prev => [...prev, ...data.results]);
            } else {
                setNotifications(data.results);
            }
            setHasMore(!!data.next);
        } catch (err) {
            setError('Failed to load notifications.');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchNotifications(1);
    }, []);

    const handleLoadMore = () => {
        if (hasMore && !loadingMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchNotifications(nextPage, true);
        }
    };

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

    const handleMarkAllAsRead = async () => {
        const unreadNotifications = notifications.filter(n => !n.is_read);
        if (unreadNotifications.length === 0) return;

        setIsMarkingAll(true);
        try {
            await markAllAsRead();
            await fetchNotifications(1);
        } catch (err) {
            console.error('Failed to mark all as read', err);
            setError('Failed to mark all notifications as read.');
        } finally {
            setIsMarkingAll(false);
        }
    };

    const handleNotifClick = async (n: Notification) => {
        await handleMarkAsRead(n);
        if (n.activity) {
            navigate(`/activities/${n.activity}/comments`);
        } else if (n.notification_type === 'server_alert' || n.notification_type === 'domain_alert' || 
                   n.message.includes('Server Expiry Alert') || n.message.includes('Domain Expiry Alert')) {
            if (n.project) {
                navigate(`/projects/edit/${n.project}`);
            } else {
                // Fallback if project ID is missing
                navigate(n.message.includes('Server') ? '/infrastructure/servers' : '/infrastructure/domains');
            }
        } else if (n.project) {
            navigate(`/projects/${n.project}`);
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
                    <button 
                        onClick={handleMarkAllAsRead}
                        disabled={isMarkingAll || notifications.filter(n => !n.is_read).length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary text-[11px] font-black rounded-xl border border-primary/20 hover:bg-primary hover:text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary/10 disabled:hover:text-primary"
                    >
                        {isMarkingAll ? <Loader2 size={14} className="animate-spin" /> : <CheckCheck size={14} />}
                        Mark All Read
                    </button>
                    <span className="px-3 py-2 bg-muted/10 text-muted-foreground text-[10px] font-black rounded-lg border border-border uppercase">
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
                    notifications.map((n) => {
                        // Attempt to parse message if explicit fields are missing
                        let type = n.notification_type;
                        let projectName = n.project_name;
                        let expiryDate = n.expiry_date;

                        if (type === 'server_alert' || (!type && n.message.includes('Server Expiry Alert'))) {
                            type = 'server_alert';
                            const projectMatch = n.message.match(/project '(.*?)'/);
                            const dateMatch = n.message.match(/expiring on (\d{4}-\d{2}-\d{2})/);
                            if (projectMatch) projectName = projectMatch[1];
                            if (dateMatch) expiryDate = dateMatch[1];
                        } else if (type === 'domain_alert' || (!type && n.message.includes('Domain Expiry Alert'))) {
                            type = 'domain_alert';
                            const projectMatch = n.message.match(/project '(.*?)'/);
                            const dateMatch = n.message.match(/expiring on (\d{4}-\d{2}-\d{2})/);
                            if (projectMatch) projectName = projectMatch[1];
                            if (dateMatch) expiryDate = dateMatch[1];
                        }

                        const isExpiry = type === 'server_alert' || type === 'domain_alert';
                        
                        if (isExpiry) {
                            return (
                                <div 
                                    key={n.id} 
                                    onClick={() => handleNotifClick(n)}
                                    className={`group relative overflow-hidden bg-card border transition-all duration-500 p-0 rounded-3xl cursor-pointer hover:shadow-xl ${!n.is_read ? 'border-amber-500/30 ring-1 ring-amber-500/10 shadow-lg shadow-amber-500/5' : 'border-border hover:border-amber-500/20'}`}
                                >
                                    {/* Glassmorphism Background Accent */}
                                    <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-br ${type === 'server_alert' ? 'from-amber-500/10 to-orange-500/5' : 'from-blue-500/10 to-indigo-500/5'} blur-2xl -mr-16 -mt-16 opacity-40 group-hover:opacity-80 transition-opacity duration-500`} />
                                    
                                    {!n.is_read && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-amber-500 to-orange-500 shadow-[1px_0_10px_rgba(245,158,11,0.3)]" />
                                    )}

                                    <div className="relative p-4 flex flex-col md:flex-row md:items-center gap-4">
                                        {/* Icon Section */}
                                        <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${!n.is_read ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20 scale-105' : 'bg-muted/10 text-muted group-hover:bg-amber-500/10 group-hover:text-amber-500'}`}>
                                            {type === 'server_alert' ? <Server size={24} /> : <Globe size={24} />}
                                        </div>

                                        {/* Content Section */}
                                        <div className="flex-grow space-y-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${type === 'server_alert' ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' : 'bg-blue-500/10 text-blue-600 border border-blue-500/20'}`}>
                                                    {type === 'server_alert' ? 'Server Alert' : 'Domain Alert'}
                                                </span>
                                                {projectName && (
                                                    <span className="px-2 py-0.5 bg-foreground/5 text-foreground/70 rounded-full text-[9px] font-bold border border-foreground/10">
                                                        Project: {projectName}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="space-y-0.5">
                                                <h3 className={`text-sm leading-tight tracking-tight ${!n.is_read ? 'font-bold text-foreground' : 'font-semibold text-muted-foreground'}`}>
                                                    {n.message}
                                                </h3>
                                                {expiryDate && (
                                                    <div className="flex items-center gap-1.5 text-rose-500 font-bold text-[11px]">
                                                        <AlertTriangle size={12} />
                                                        <span>Expires on: {new Date(expiryDate).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted uppercase tracking-widest">
                                                    <Clock size={10} />
                                                    {new Date(n.created_at).toLocaleString()}
                                                </div>
                                                {!n.is_read && (
                                                    <span className="flex items-center gap-1 text-[8px] font-black text-amber-600 uppercase bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-500/20">
                                                        <Check size={8} /> Urgent
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action Icon */}
                                        <div className="md:block hidden opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                            <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl border border-amber-500/20">
                                                <ArrowLeft className="rotate-180" size={18} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        return (
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
                        );
                    })
                )}
            </div>

            {hasMore && (
                <div className="flex justify-center pt-4 pb-10">
                    <button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="group relative flex items-center gap-3 px-8 py-3 bg-card border border-border rounded-2xl hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <div className={`p-2 rounded-xl bg-primary/10 text-primary transition-all group-hover:bg-primary group-hover:text-white ${loadingMore ? 'animate-spin' : ''}`}>
                            {loadingMore ? <Loader2 size={18} /> : <Clock size={18} />}
                        </div>
                        <span className="text-sm font-black text-foreground uppercase tracking-wider">
                            {loadingMore ? 'Loading More...' : 'Load More Notifications'}
                        </span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default NotificationList;
