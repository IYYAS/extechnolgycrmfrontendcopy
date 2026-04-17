import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getActivity } from './activityService';
import { getComments, createComment, deleteComment, createNotification } from './commentService';
import type { EmployeeDailyActivity } from './activityService';
import type { ActivityExceedComment } from './commentService';
import {
    ArrowLeft,
    Send,
    Loader2,
    User,
    AlertCircle,
    MessageSquare,
    Trash2,
    Clock
} from 'lucide-react';

const ActivityCommentForm: React.FC = () => {
    const { activityId } = useParams<{ activityId: string }>();
    const navigate = useNavigate();
    
    const loggedInUser = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } })();
    
    const [activity, setActivity] = useState<EmployeeDailyActivity | null>(null);
    const [comments, setComments] = useState<ActivityExceedComment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        if (!activityId) return;
        setLoading(true);
        try {
            const [activityData, commentData] = await Promise.all([
                getActivity(parseInt(activityId)),
                getComments(parseInt(activityId))
            ]);
            setActivity(activityData);
            setComments(commentData);
        } catch (err: any) {
            setError('Failed to load activity details or comments.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activityId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !activity || !activityId) return;

        setSubmitting(true);
        setError(null);
        try {
            const commentPayload = {
                activity: parseInt(activityId),
                comment: newComment,
                commented_by: loggedInUser.id
            };
            const createdComment = await createComment(commentPayload);
            
            // Trigger notification for the employee
            await createNotification({
                user: activity.employee,
                message: `New comment on your activity (${activity.date}): "${newComment.substring(0, 50)}${newComment.length > 50 ? '...' : ''}"`,
                activity: activity.id,
                comment: createdComment.id
            });

            setNewComment('');
            fetchData(); // Refresh comments
        } catch (err: any) {
            setError('Failed to post comment.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteComment = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this comment?')) return;
        try {
            await deleteComment(id);
            fetchData();
        } catch (err) {
            alert('Failed to delete comment.');
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <Loader2 className="animate-spin text-primary" size={48} />
            <p className="text-muted font-medium italic">Loading activity and comments...</p>
        </div>
    );

    if (!activity) return (
        <div className="py-20 text-center">
            <AlertCircle size={48} className="mx-auto text-rose-500 mb-4" />
            <h3 className="text-lg font-bold">Activity not found</h3>
            <button onClick={() => navigate('/activities')} className="mt-4 text-primary font-bold underline">Back to Activities</button>
        </div>
    );

    const labelCls = "text-[10px] font-black uppercase text-muted tracking-[0.2em] mb-1 block";

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
            {/* Header */}
            <div className="flex items-center gap-6">
                <button onClick={() => navigate('/activities')} className="p-3 bg-muted/20 text-muted rounded-2xl hover:bg-primary/10 hover:text-primary transition-all active:scale-95 border border-transparent hover:border-primary/20">
                    <ArrowLeft size={22} />
                </button>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-foreground text-primary">Activity Feedback</h1>
                    <p className="text-muted font-bold text-xs uppercase tracking-widest mt-0.5">Communicate and track progress</p>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 text-sm font-bold animate-in zoom-in duration-300">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            {/* Activity Summary Card */}
            <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-8 text-primary/5 group-hover:text-primary/10 transition-colors"><MessageSquare size={80} /></div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <span className={labelCls}>Employee & Date</span>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="p-2 bg-primary/10 text-primary rounded-lg"><User size={14} /></div>
                            <p className="text-sm font-black text-foreground">{activity.employee_name} <span className="text-muted">•</span> {activity.date}</p>
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <span className={labelCls}>Work Description</span>
                        <p className="text-sm font-medium text-foreground/80 leading-relaxed mt-1">{activity.description}</p>
                    </div>
                 </div>
                 {activity.is_timeline_exceeded && (
                    <div className="mt-8 pt-6 border-t border-border/50">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 text-rose-500 text-[10px] font-black rounded-lg border border-rose-500/20 uppercase mb-3">
                            Timeline Exceeded
                        </span>
                        <p className="text-sm font-bold text-rose-500/80 italic">" {activity.delay_reason} "</p>
                    </div>
                 )}
            </div>

            {/* Comments List */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl"><MessageSquare size={18} /></div>
                    <h3 className="text-xl font-black text-foreground tracking-tight">Feedback Loop</h3>
                </div>

                <div className="space-y-4">
                    {comments.length === 0 ? (
                        <div className="py-12 bg-muted/10 rounded-[2.5rem] border border-dashed border-border flex flex-col items-center justify-center text-muted">
                            <MessageSquare className="mb-3 opacity-20" size={40} />
                            <p className="text-sm font-bold uppercase tracking-widest">No feedback yet</p>
                        </div>
                    ) : (
                        comments.map((c) => (
                            <div key={c.id} className={`group flex flex-col p-6 rounded-[2rem] border transition-all ${c.commented_by === loggedInUser.id ? 'bg-indigo-50/30 border-indigo-500/10 ml-12' : 'bg-card border-border mr-12'}`}>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-background border border-border rounded-lg text-muted"><Clock size={12} /></div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-primary uppercase tracking-widest leading-none mb-0.5">
                                                {c.commenter_name || 'Admin'}
                                            </span>
                                            <span className="text-[9px] font-bold text-muted uppercase tracking-widest whitespace-nowrap">
                                                {new Date(c.created_at).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                    {c.commented_by === loggedInUser.id && (
                                        <button onClick={() => handleDeleteComment(c.id)} className="p-2 text-rose-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500/10 rounded-lg">
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                                <p className="text-sm font-medium text-foreground leading-relaxed">{c.comment}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Post Comment Form */}
            <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <span className={labelCls}>Add your feedback</span>
                    <div className="relative">
                        <textarea
                            placeholder="Type your feedback here..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="w-full px-6 py-5 bg-background border border-border rounded-[2rem] focus:ring-4 focus:ring-primary/10 transition-all font-medium text-sm min-h-[120px] resize-none outline-none"
                            required
                        />
                        <button
                            type="submit"
                            disabled={submitting || !newComment.trim()}
                            className="absolute bottom-4 right-4 p-4 bg-primary text-white rounded-2xl shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                        >
                            {submitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ActivityCommentForm;
