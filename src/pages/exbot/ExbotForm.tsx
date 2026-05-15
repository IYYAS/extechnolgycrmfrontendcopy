import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { getExbot, createExbot, updateExbot } from './exbotService';
import { 
    X, 
    Loader2, 
    MessageSquare, 
    Smartphone, 
    Calendar, 
    IndianRupee, 
    CheckCircle2, 
    AlertCircle,
    Layout
} from 'lucide-react';
import ProviderSelect from '../../components/ProviderSelect';
import SearchableProjectSelect from '../../components/SearchableProjectSelect';
import { getProject } from '../projects/projectService';

const ExbotForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEdit = !!id;
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEdit);
    const [error, setError] = useState<string | null>(null);
    const [noClientWarning, setNoClientWarning] = useState<{ projectId: number } | null>(null);
    const lastAutoProject = React.useRef<number | null>(null);

    const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm();
    const watchProject = watch('project');
    const watchPlanCategory = watch('plan_category');
    const watchPaymentStatus = watch('payment_status');

    useEffect(() => {
        const fetchExbotData = async () => {
            if (!id) return;
            try {
                const data = await getExbot(parseInt(id));
                reset({
                    project: data.project,
                    whatsapp_number: data.whatsapp_number,
                    plan_category: data.plan_category,
                    plan_active_date: data.plan_active_date,
                    plan_deactive_date: data.plan_deactive_date,
                    plan_rate: data.plan_rate,
                    payment_status: data.payment_status,
                    description: data.description
                });
            } catch (err) {
                console.error('Failed to fetch exbot data', err);
                navigate('/infrastructure/exbots');
            } finally {
                setFetching(false);
            }
        };

        if (isEdit) fetchExbotData();
    }, [id, isEdit, reset, navigate]);

    // Auto-warn when project has no client address
    useEffect(() => {
        const syncClient = async () => {
            const projId = watchProject ? Number(watchProject) : null;
            if (!projId) {
                setNoClientWarning(null);
                return;
            }
            if (lastAutoProject.current !== projId) {
                lastAutoProject.current = projId;
                try {
                    const project = await getProject(projId);
                    if (!project.project_business_addresses || project.project_business_addresses.length === 0) {
                        setNoClientWarning({ projectId: projId });
                    } else {
                        setNoClientWarning(null);
                    }
                } catch (err) {
                    console.error('Failed to check project client:', err);
                }
            }
        };
        syncClient();
    }, [watchProject]);

    const onSubmit = async (data: any) => {
        setLoading(true);
        setError(null);
        try {
            let savedExbot: any;
            if (isEdit && id) {
                savedExbot = await updateExbot(parseInt(id), data);
            } else {
                savedExbot = await createExbot(data);
            }

            // Background Auto-Invoice Logic
            if (!isEdit && data.project) {
                try {
                    const selectedProject = await getProject(parseInt(data.project));
                    const bizAddrId = selectedProject?.project_business_addresses?.[0]?.id;

                    if (bizAddrId) {
                        const { createInvoice } = await import('../invoices/invoiceService');
                        
                        const invoiceData = {
                            client_company: { id: bizAddrId },
                            invoice_date: new Date().toISOString().split('T')[0],
                            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                            items: [{
                                service_type: 'Exbot',
                                description: `Exbot - ${savedExbot.whatsapp_number} (${(savedExbot.plan_category || '').toUpperCase()})`,
                                rate: savedExbot.plan_rate,
                                quantity: 1,
                                purchase_date: savedExbot.plan_active_date,
                                expairy_date: savedExbot.plan_deactive_date,
                                project_exbot: savedExbot.id
                            }],
                            status: 'UNPAID',
                            tax_rate: 0,
                            discount_amount: 0
                        };

                        await createInvoice(bizAddrId, invoiceData);
                    }
                } catch (invoiceErr) {
                    console.error('Failed to create background invoice:', invoiceErr);
                }
            }

            navigate('/infrastructure/exbots');
        } catch (err: any) {
            console.error('Failed to save exbot', err);
            setError(err.response?.data?.detail || 'Failed to save Exbot. Please check your inputs.');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex flex-col items-center justify-center h-full py-20 space-y-4">
                <Loader2 className="animate-spin text-primary" size={48} />
                <p className="text-muted font-bold animate-pulse">Loading Exbot details...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="bg-card border border-border rounded-[3rem] shadow-2xl overflow-hidden backdrop-blur-xl animate-in zoom-in duration-500">
                <div className="p-10 border-b border-border bg-muted/5 flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-xl text-primary">
                                <MessageSquare size={28} />
                            </div>
                            {isEdit ? 'Edit Exbot' : 'Register New Exbot'}
                        </h2>
                        <p className="text-muted mt-1 font-medium italic">
                            {isEdit ? 'Update subscription and bot details' : 'Link a new WhatsApp bot to a project'}
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/infrastructure/exbots')}
                        className="p-3 text-muted hover:text-foreground hover:bg-muted/10 rounded-2xl transition-all"
                    >
                        <X size={28} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-10 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Project & WhatsApp */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <SearchableProjectSelect
                                    label="Target Project"
                                    value={watchProject}
                                    onChange={(val) => setValue('project', val)}
                                    placeholder="Select a Project"
                                    icon={<Layout size={18} />}
                                />
                                <input type="hidden" {...register('project', { required: 'Project is required' })} />

                                {/* No client warning */}
                                {noClientWarning && (
                                    <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl mt-1">
                                        <span className="text-amber-500 text-lg">⚠️</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-black text-amber-600 dark:text-amber-400">
                                                No Client Address linked to this project.
                                            </p>
                                            <p className="text-[11px] text-amber-500/80 mt-0.5">
                                                Add a Business Address for automated billing.
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => navigate(`/projects/edit/${noClientWarning.projectId}#section-client-address`)}
                                                className="mt-2 text-[11px] font-black text-amber-600 dark:text-amber-400 underline underline-offset-2 hover:text-amber-700 transition-colors"
                                            >
                                                → Go to Project &amp; Add Client Address
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] px-1">WhatsApp Number</label>
                                <div className="relative group">
                                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={18} />
                                    <input
                                        {...register('whatsapp_number', { required: 'WhatsApp number is required' })}
                                        className="w-full pl-12 pr-4 py-4 bg-background border border-border rounded-2xl text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold"
                                        placeholder="+91 98765 43210"
                                    />
                                </div>
                                {errors.whatsapp_number && <p className="text-rose-500 text-xs font-bold mt-1 px-1">{errors.whatsapp_number.message as string}</p>}
                            </div>
                        </div>

                        {/* Plan Details */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] px-1">Plan Category</label>
                                <ProviderSelect
                                    value={watchPlanCategory || ''}
                                    onChange={(val) => setValue('plan_category', val)}
                                    options={['Standard', 'Premium', 'Basic']}
                                    placeholder="Select or type category..."
                                    className="w-full pl-12 pr-4 py-4 bg-background border border-border rounded-2xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold"
                                />
                                <CheckCircle2 className="absolute left-4 top-[50px] text-muted group-focus-within:text-primary transition-colors pointer-events-none" size={18} />
                                <input type="hidden" {...register('plan_category', { required: 'Plan category is required' })} />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] px-1">Plan Rate (Monthly/Yearly)</label>
                                <div className="relative group">
                                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={18} />
                                    <input
                                        {...register('plan_rate', { required: 'Plan rate is required' })}
                                        type="number"
                                        step="0.01"
                                        className="w-full pl-12 pr-4 py-4 bg-background border border-border rounded-2xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold"
                                        placeholder="1500.00"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] px-1">Activation Date</label>
                            <div className="relative group">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={18} />
                                <input
                                    {...register('plan_active_date', { required: true })}
                                    type="date"
                                    className="w-full pl-12 pr-4 py-4 bg-background border border-border rounded-2xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] px-1">Deactivation Date</label>
                            <div className="relative group">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={18} />
                                <input
                                    {...register('plan_deactive_date', { required: true })}
                                    type="date"
                                    className="w-full pl-12 pr-4 py-4 bg-background border border-border rounded-2xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] px-1">Payment Status</label>
                            <div className="flex gap-4 p-2 bg-background border border-border rounded-[1.5rem]">
                                {['PAID', 'UNPAID'].map(status => (
                                    <button
                                        key={status}
                                        type="button"
                                        onClick={() => setValue('payment_status', status)}
                                        className={`flex-1 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                            watchPaymentStatus === status 
                                            ? status === 'PAID' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-rose-500 text-white shadow-lg'
                                            : 'hover:bg-muted/10 text-muted'
                                        }`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                            <input type="hidden" {...register('payment_status')} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] px-1">Bot Description</label>
                            <textarea
                                {...register('description')}
                                rows={4}
                                className="w-full px-6 py-4 bg-background border border-border rounded-[1.5rem] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold"
                                placeholder="Main customer support bot..."
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-3xl text-rose-500 text-sm font-bold flex items-center gap-3 animate-shake">
                            <AlertCircle size={20} />
                            {error}
                        </div>
                    )}

                    <div className="pt-10 flex items-center justify-end space-x-6">
                        <button
                            type="button"
                            onClick={() => navigate('/infrastructure/exbots')}
                            className="px-8 py-4 text-muted font-black uppercase tracking-widest hover:text-foreground hover:bg-muted/10 rounded-2xl transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-12 py-4 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-2xl shadow-primary/30 flex items-center space-x-3 hover:scale-105"
                        >
                            {loading && <Loader2 className="animate-spin" size={20} />}
                            <span>{isEdit ? 'Update Exbot' : 'Register Exbot'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ExbotForm;
