import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getExbot, deleteExbot } from './exbotService';
import { usePermission } from '../../hooks/usePermission';
import type { Exbot } from './exbotService';
import { 
    MessageSquare, 
    Smartphone, 
    Calendar, 
    IndianRupee, 
    CheckCircle2, 
    AlertCircle, 
    ArrowLeft,
    Edit2,
    Trash2,
    Loader2,
    ShieldCheck,
    Clock,
    FileText
} from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';

const ExbotDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { hasPermission } = usePermission();
    const [bot, setBot] = useState<Exbot | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBot = async () => {
            if (!id) return;
            try {
                const data = await getExbot(parseInt(id));
                setBot(data);
            } catch (err) {
                console.error('Failed to fetch exbot details', err);
                navigate('/infrastructure/exbots');
            } finally {
                setLoading(false);
            }
        };
        fetchBot();
    }, [id, navigate]);

    const handleDelete = async () => {
        if (bot && window.confirm('Are you sure you want to delete this Exbot?')) {
            try {
                await deleteExbot(bot.id);
                navigate('/infrastructure/exbots');
            } catch (error) {
                console.error('Failed to delete exbot', error);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full py-20 space-y-4">
                <Loader2 className="animate-spin text-primary" size={48} />
                <p className="text-muted font-bold animate-pulse uppercase tracking-widest">Loading details...</p>
            </div>
        );
    }

    if (!bot) return null;

    const daysLeft = differenceInDays(parseISO(bot.plan_deactive_date), new Date());
    const isExpired = daysLeft < 0;

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-12">
            {/* Header / Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/infrastructure/exbots')}
                        className="p-4 bg-card border border-border rounded-2xl text-muted hover:text-foreground transition-all shadow-sm"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-foreground">{bot.whatsapp_number}</h1>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-muted font-bold uppercase text-xs tracking-widest">Exbot Profile</span>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${isExpired ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                {isExpired ? 'Expired' : 'Active'}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {hasPermission('change_projectexbot') && (
                        <button
                            onClick={() => navigate(`/infrastructure/exbots/edit/${bot.id}`)}
                            className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-6 py-3.5 bg-primary/10 text-primary hover:bg-primary hover:text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-primary/5"
                        >
                            <Edit2 size={20} />
                            <span>Edit</span>
                        </button>
                    )}
                    {hasPermission('delete_projectexbot') && (
                        <button
                            onClick={handleDelete}
                            className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-6 py-3.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-rose-500/5"
                        >
                            <Trash2 size={20} />
                            <span>Delete</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Core Info */}
                <div className="md:col-span-2 space-y-8">
                    {/* Bot Overview Card */}
                    <div className="bg-card border border-border rounded-[3rem] p-10 shadow-xl shadow-primary/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12">
                            <MessageSquare size={160} />
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">WhatsApp Identity</p>
                                    <div className="flex items-center gap-3 text-2xl font-black text-foreground">
                                        <Smartphone size={24} className="text-primary" />
                                        {bot.whatsapp_number}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">Project Mapping</p>
                                    <div className="flex items-center gap-3 text-xl font-bold text-foreground">
                                        <ShieldCheck size={20} className="text-primary" />
                                        Project ID: {bot.project}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-6 text-right sm:text-left">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">Subscription Plan</p>
                                    <div className="text-2xl font-black text-foreground uppercase tracking-tight italic">
                                        {bot.plan_category}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">Monthly Rate</p>
                                    <div className="flex items-center gap-2 text-3xl font-black text-primary sm:justify-start justify-end">
                                        <IndianRupee size={28} />
                                        {bot.plan_rate}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 pt-10 border-t border-border flex flex-col sm:flex-row gap-8 items-center justify-between">
                            <div className="flex items-center gap-4">
                                {bot.payment_status === 'PAID' ? (
                                    <div className="px-6 py-3 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center gap-3 border border-emerald-500/20">
                                        <CheckCircle2 size={24} />
                                        <span className="font-black uppercase tracking-widest text-sm">Payment Paid</span>
                                    </div>
                                ) : (
                                    <div className="px-6 py-3 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center gap-3 border border-rose-500/20">
                                        <AlertCircle size={24} />
                                        <span className="font-black uppercase tracking-widest text-sm">Payment Pending</span>
                                    </div>
                                )}
                            </div>
                            <div className="text-center sm:text-right">
                                <p className="text-muted text-[10px] font-black uppercase tracking-[0.2em]">Current Status</p>
                                <p className={`text-xl font-black uppercase italic ${isExpired ? 'text-rose-500' : 'text-emerald-500'}`}>
                                    {bot.status}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Description Card */}
                    <div className="bg-card border border-border rounded-[3rem] p-10 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <FileText size={20} className="text-primary" />
                            <h3 className="text-xl font-black tracking-tight uppercase">Description / Notes</h3>
                        </div>
                        <p className="text-foreground/80 leading-relaxed font-medium bg-muted/5 p-8 rounded-[2rem] border border-border/50 italic">
                            {bot.description || 'No description provided for this Exbot.'}
                        </p>
                    </div>
                </div>

                {/* Right Column: Timeline & Health */}
                <div className="space-y-8">
                    <div className="bg-card border border-border rounded-[3rem] p-8 shadow-xl shadow-primary/5">
                        <h3 className="text-lg font-black uppercase tracking-widest mb-8 text-muted flex items-center gap-2">
                            <Clock size={18} className="text-primary" />
                            Plan Timeline
                        </h3>
                        
                        <div className="space-y-10 relative">
                            <div className="absolute left-4 top-2 bottom-2 w-px bg-border group"></div>
                            
                            <div className="relative pl-12">
                                <div className="absolute left-0 top-1.5 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                                    <Calendar size={14} />
                                </div>
                                <p className="text-[10px] font-black text-muted uppercase tracking-widest">Active Since</p>
                                <p className="text-lg font-bold text-foreground">{format(parseISO(bot.plan_active_date), 'MMMM d, yyyy')}</p>
                            </div>

                            <div className="relative pl-12">
                                <div className={`absolute left-0 top-1.5 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg ${isExpired ? 'bg-rose-500 shadow-rose-500/20' : 'bg-amber-500 shadow-amber-500/20'}`}>
                                    <Calendar size={14} />
                                </div>
                                <p className="text-[10px] font-black text-muted uppercase tracking-widest">Deactivation Date</p>
                                <p className="text-lg font-bold text-foreground">{format(parseISO(bot.plan_deactive_date), 'MMMM d, yyyy')}</p>
                            </div>
                        </div>

                        <div className={`mt-10 p-6 rounded-[1.5rem] border text-center ${isExpired ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-primary/10 border-primary/20 text-primary'}`}>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1">Time Remaining</p>
                            <p className="text-3xl font-black">{isExpired ? 'EXPIRED' : `${daysLeft} Days`}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExbotDetail;
