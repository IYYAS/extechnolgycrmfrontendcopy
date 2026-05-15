import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getExbots, deleteExbot } from './exbotService';
import type { Exbot } from './exbotService';
import { usePermission } from '../../hooks/usePermission';
import { 
    MessageSquare, 
    Plus, 
    Search, 
    Loader2, 
    Edit2, 
    Trash2, 
    Eye, 
    Calendar, 
    Smartphone,
    AlertCircle,
    CheckCircle2,
    Clock,
    Receipt,
    LayoutGrid,
    List,
    Filter,
    X,
    ChevronDown,
    ChevronUp,
    ChevronRight
} from 'lucide-react';
import CustomSelect from '../../components/CustomSelect';
import { format, differenceInDays, parseISO } from 'date-fns';
import { getProject } from '../projects/projectService';

const ExbotList: React.FC = () => {
    const { hasPermission } = usePermission();
    const [exbots, setExbots] = useState<Exbot[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        status: '',
        payment_status: '',
        invoice_status: '',
        plan_category: '',
        min_rate: '',
        max_rate: '',
        start_date: '',
        end_date: ''
    });
    const [statistics, setStatistics] = useState<any>(null);
    const [, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const ITEMS_PER_PAGE = 10;
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    const fetchExbots = async (page: number = 1, search: string = '', currentFilters = filters) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getExbots(page, search, currentFilters);
            setExbots(data.results);
            setTotalCount(data.count);
            setStatistics(data.statistics);
        } catch (error: any) {
            console.error('Failed to fetch exbots:', error);
            setError(error.response?.data?.detail || 'Failed to load exbots. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (currentPage !== 1) {
                setCurrentPage(1);
            } else {
                fetchExbots(1, searchTerm, filters);
            }
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, filters]);

    useEffect(() => {
        fetchExbots(currentPage, searchTerm, filters);
    }, [currentPage]);

    const handleBillItem = async (bot: Exbot) => {
        try {
            const project = await getProject(bot.project);
            const bizAddrId = project.project_business_addresses?.[0]?.id;

            const params = new URLSearchParams();
            params.append('type', 'exbot');
            params.append('name', `Exbot: ${bot.whatsapp_number}`);
            params.append('rate', (bot.plan_rate || 0).toString());
            params.append('purchase_date', bot.plan_active_date || '');
            params.append('expiry_date', bot.plan_deactive_date || '');
            params.append('exbot_id', bot.id!.toString());
            if (bizAddrId) params.append('business_address', bizAddrId.toString());

            navigate(`/invoices/new?${params.toString()}`);
        } catch (err) {
            console.error('Failed to prepare bill:', err);
            alert('Failed to prepare billing information. Please ensure the project has a business address.');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this Exbot?')) {
            try {
                await deleteExbot(id);
                fetchExbots(currentPage, searchTerm);
            } catch (error) {
                console.error('Failed to delete exbot:', error);
            }
        }
    };

    const getExpiryStatus = (date: string) => {
        const days = differenceInDays(parseISO(date), new Date());
        if (days < 0) return { label: 'Expired', color: 'text-rose-500', bg: 'bg-rose-500/10' };
        if (days <= 30) return { label: `Expires in ${days} days`, color: 'text-amber-500', bg: 'bg-amber-500/10' };
        return { label: 'Active', color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
    };

    const getInvoiceStatusStyles = (status?: string) => {
        if (status?.toUpperCase() === 'INVOICED') {
            return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
        }
        return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl text-primary">
                            <MessageSquare size={28} />
                        </div>
                        WhatsApp Exbots
                    </h1>
                    <p className="text-muted mt-1 font-medium italic">Manage project bots, subscription plans, and status.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-card border border-border rounded-2xl p-1 shadow-sm">
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-2.5 rounded-xl transition-all ${viewMode === 'table' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted hover:text-foreground'}`}
                            title="Table View"
                        >
                            <List size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted hover:text-foreground'}`}
                            title="Grid View"
                        >
                            <LayoutGrid size={20} />
                        </button>
                    </div>
                    {hasPermission('add_projectexbot') && (
                        <button
                            onClick={() => navigate('/infrastructure/exbots/new')}
                            className="flex items-center space-x-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-2xl transition-all shadow-xl shadow-primary/20 hover:scale-105 active:scale-95"
                        >
                            <Plus size={20} />
                            <span>Add New Exbot</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-top-4 duration-500 delay-150">
                <div className="bg-card border border-border p-6 rounded-[2rem] shadow-sm flex items-center gap-5 hover:border-primary/30 transition-colors">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                        <Smartphone size={28} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-0.5">Total Exbots</p>
                        <h3 className="text-2xl font-black text-foreground">{statistics?.total || 0}</h3>
                    </div>
                </div>
                <div className="bg-card border border-border p-6 rounded-[2rem] shadow-sm flex items-center gap-5 hover:border-emerald-500/30 transition-colors">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        <CheckCircle2 size={28} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-0.5">Active</p>
                        <h3 className="text-2xl font-black text-foreground">{statistics?.active || 0}</h3>
                    </div>
                </div>
                <div className="bg-card border border-border p-6 rounded-[2rem] shadow-sm flex items-center gap-5 hover:border-amber-500/30 transition-colors">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                        <Clock size={28} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-0.5">Pending</p>
                        <h3 className="text-2xl font-black text-foreground">{statistics?.pending || 0}</h3>
                    </div>
                </div>
                <div className="bg-card border border-border p-6 rounded-[2rem] shadow-sm flex items-center gap-5 hover:border-rose-500/30 transition-colors">
                    <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                        <AlertCircle size={28} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-0.5">Expired</p>
                        <h3 className="text-2xl font-black text-foreground">{statistics?.expired || 0}</h3>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-2xl shadow-primary/5">
                <div className="p-6 border-b border-border flex items-center justify-between gap-4 bg-muted/5">
                    <div className="relative flex-1 w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                        <input
                            type="text"
                            placeholder="Search exbots by number, category..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all font-semibold ${
                                showFilters 
                                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                                    : 'bg-background text-foreground border-border hover:border-primary/50'
                            }`}
                        >
                            <Filter size={18} />
                            <span>Filters</span>
                            {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                        {(filters.status || filters.payment_status || filters.invoice_status || filters.plan_category || filters.min_rate || filters.max_rate || filters.start_date || filters.end_date) && (
                            <button
                                onClick={() => setFilters({
                                    status: '',
                                    payment_status: '',
                                    invoice_status: '',
                                    plan_category: '',
                                    min_rate: '',
                                    max_rate: '',
                                    start_date: '',
                                    end_date: ''
                                })}
                                className="p-2.5 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all border border-transparent hover:border-rose-500/20"
                                title="Clear all filters"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>
                </div>

                {showFilters && (
                    <div className="p-4 border-t border-border bg-muted/5 animate-in slide-in-from-top-4 duration-300">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Status Filter */}
                            <CustomSelect
                                label="Exbot Status"
                                value={filters.status}
                                onChange={(val) => setFilters({ ...filters, status: val })}
                                options={[
                                    { label: 'All Statuses', value: '' },
                                    { label: 'Active', value: 'Active' },
                                    { label: 'Pending', value: 'Pending' },
                                    { label: 'Expired', value: 'Expired' },
                                ]}
                            />

                            {/* Payment Status Filter */}
                            <CustomSelect
                                label="Payment Status"
                                value={filters.payment_status}
                                onChange={(val) => setFilters({ ...filters, payment_status: val })}
                                options={[
                                    { label: 'All Payments', value: '' },
                                    { label: 'Paid', value: 'PAID' },
                                    { label: 'Unpaid', value: 'UNPAID' },
                                ]}
                            />

                            {/* Invoice Status Filter */}
                            <CustomSelect
                                label="Invoice Status"
                                value={filters.invoice_status}
                                onChange={(val) => setFilters({ ...filters, invoice_status: val })}
                                options={[
                                    { label: 'All Invoiced', value: '' },
                                    { label: 'Invoiced', value: 'INVOICED' },
                                    { label: 'Not Invoiced', value: 'NOT_INVOICED' },
                                ]}
                            />

                            {/* Plan Category Filter */}
                            <CustomSelect
                                label="Plan Category"
                                value={filters.plan_category}
                                onChange={(val) => setFilters({ ...filters, plan_category: val })}
                                options={[
                                    { label: 'All Plans', value: '' },
                                    { label: 'Basic', value: 'Basic' },
                                    { label: 'Standard', value: 'Standard' },
                                    { label: 'Premium', value: 'Premium' },
                                ]}
                            />

                            {/* Amount Range */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Rate Range (Min - Max)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={filters.min_rate}
                                        onChange={(e) => setFilters({ ...filters, min_rate: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={filters.max_rate}
                                        onChange={(e) => setFilters({ ...filters, max_rate: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                            </div>

                            {/* Expiration Date Range */}
                            <div className="sm:col-span-2 lg:col-span-2 space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Deactive Date Range</label>
                                <div className="flex gap-4">
                                    <div className="relative flex-1">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
                                        <input
                                            type="date"
                                            value={filters.start_date}
                                            onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>
                                    <div className="relative flex-1">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
                                        <input
                                            type="date"
                                            value={filters.end_date}
                                            onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {viewMode === 'table' ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-muted/5 text-muted text-xs font-semibold uppercase tracking-wider">
                                    <th className="px-6 py-4 w-12 text-center">#</th>
                                    <th className="px-6 py-4">Exbot Details</th>
                                    <th className="px-6 py-4">Plan</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Payment</th>
                                    <th className="px-6 py-4 text-center">Invoiced</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4 text-center">Billing</th>
                                    <th className="px-6 py-4">Expiration</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center text-muted">
                                            <div className="flex flex-col items-center space-y-4">
                                                <Loader2 className="animate-spin text-primary" size={40} />
                                                <p className="font-bold">Fetching Exbot directory...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : exbots.length > 0 ? (
                                    exbots.map((bot, index) => {
                                        const daysLeft = bot.plan_deactive_date ? differenceInDays(parseISO(bot.plan_deactive_date), new Date()) : null;
                                        const isExpiringYellow = daysLeft !== null && daysLeft > 15 && daysLeft <= 30;
                                        const isExpiringRed = daysLeft !== null && daysLeft <= 15;
                                        const rowClass = isExpiringRed ? 'border-l-2 border-l-rose-500 hover:bg-rose-500/5' : isExpiringYellow ? 'border-l-2 border-l-amber-500 hover:bg-amber-500/5' : 'hover:bg-muted/5 border-l-2 border-l-transparent';
                                        
                                        return (
                                            <tr key={bot.id} className={`group transition-colors ${rowClass}`}>
                                                <td className="px-6 py-4">
                                                    <div className="w-8 h-8 rounded-lg bg-muted/20 flex items-center justify-center text-[10px] font-black text-muted group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                                        {String((currentPage - 1) * ITEMS_PER_PAGE + index + 1).padStart(2, '0')}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 cursor-pointer" onClick={() => navigate(`/infrastructure/exbots/${bot.id}`)}>
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-10 h-10 rounded-xl bg-primary-subtle flex items-center justify-center text-primary font-bold border border-primary/20 group-hover:scale-105 transition-transform">
                                                            <Smartphone size={20} />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-foreground group-hover:text-primary transition-colors font-semibold text-sm uppercase tracking-tight">{bot.project_name || 'N/A'}</p>
                                                                {(daysLeft !== null && daysLeft <= 30) && (
                                                                    <span className={`px-1.5 py-0.5 text-[7px] rounded font-black uppercase tracking-widest ${
                                                                        daysLeft <= 15 ? 'bg-rose-500/20 text-rose-600' : 'bg-amber-500/20 text-amber-600'
                                                                    }`}>
                                                                        {daysLeft < 0 ? 'Expired' : 'Expiring Soon'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-muted text-xs font-bold uppercase tracking-tight">WA: {bot.whatsapp_number}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-foreground font-bold text-xs">{bot.plan_category}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${bot.status?.toLowerCase() === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : bot.status?.toLowerCase() === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                                                        {bot.status || 'Active'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {bot.payment_status === 'PAID' ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-full text-[9px] font-black uppercase tracking-wider border border-emerald-500/20">
                                                            <CheckCircle2 size={10} /> PAID
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-rose-500/10 text-rose-500 rounded-full text-[9px] font-black uppercase tracking-wider border border-rose-500/20">
                                                            <AlertCircle size={10} /> UNPAID
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border whitespace-nowrap ${getInvoiceStatusStyles(bot.invoice_status)}`}>
                                                        {bot.invoice_status === 'INVOICED' ? 'Invoiced' : 'Not Billed'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-foreground font-bold text-sm">₹{bot.plan_rate}</p>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => handleBillItem(bot)}
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${
                                                            bot.invoice_status === 'INVOICED'
                                                                ? 'bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20'
                                                                : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20'
                                                        }`}
                                                        title={bot.invoice_status === 'INVOICED' ? 'Already Invoiced' : 'Generate Invoice'}
                                                    >
                                                        <Receipt size={12} />
                                                        {bot.invoice_status === 'INVOICED' ? 'Billed' : 'Bill'}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-medium text-foreground">
                                                            {bot.plan_deactive_date ? format(parseISO(bot.plan_deactive_date), 'MMM d, yyyy') : 'N/A'}
                                                        </span>
                                                        <span className="text-[10px] text-muted opacity-60 uppercase font-bold tracking-tighter">Deadline</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end space-x-1">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); navigate(`/infrastructure/exbots/${bot.id}`); }}
                                                            className="p-2 text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                                            title="View Details"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                        {hasPermission('change_projectexbot') && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); navigate(`/infrastructure/exbots/edit/${bot.id}`); }}
                                                                className="p-2 text-muted hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-all"
                                                                title="Edit Exbot"
                                                            >
                                                                <Edit2 size={16} />
                                                            </button>
                                                        )}
                                                        {hasPermission('delete_projectexbot') && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleDelete(bot.id); }}
                                                                className="p-2 text-muted hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                                                                title="Delete Exbot"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center text-muted italic font-bold">
                                            No Exbots found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-muted/5">
                        {loading ? (
                            <div className="col-span-full py-20 flex flex-col items-center space-y-4 text-muted">
                                <Loader2 className="animate-spin text-primary" size={40} />
                                <p className="font-bold">Fetching Exbots...</p>
                            </div>
                        ) : exbots.length > 0 ? (
                            exbots.map((bot) => {
                                const expiry = getExpiryStatus(bot.plan_deactive_date);
                                return (
                                    <div 
                                        key={bot.id} 
                                        onClick={() => navigate(`/infrastructure/exbots/${bot.id}`)}
                                        className="bg-background border border-border rounded-[2rem] p-6 hover:shadow-2xl hover:shadow-primary/10 transition-all cursor-pointer group relative overflow-hidden"
                                    >
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="p-4 bg-primary/5 rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                                <Smartphone size={24} />
                                            </div>
                                            <div className="flex flex-col gap-2 items-end">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getInvoiceStatusStyles(bot.invoice_status)}`}>
                                                    {bot.invoice_status === 'INVOICED' ? 'Invoiced' : 'Pending'}
                                                </span>
                                                {bot.payment_status === 'PAID' ? (
                                                    <span className="flex items-center gap-1 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                                                        <CheckCircle2 size={12} /> Paid
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-rose-500 text-[10px] font-black uppercase tracking-widest">
                                                        <AlertCircle size={12} /> Unpaid
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-1 mb-6">
                                            <h3 className="text-xl font-black text-foreground group-hover:text-primary transition-colors line-clamp-1 uppercase tracking-tight">
                                                {bot.project_name || 'Project N/A'}
                                            </h3>
                                            <p className="text-muted text-xs font-bold uppercase tracking-widest">WA: {bot.whatsapp_number}</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 py-4 border-y border-border/50 mb-6">
                                            <div>
                                                <p className="text-[9px] font-black text-muted uppercase tracking-[0.2em] mb-1">Plan</p>
                                                <p className="text-sm font-black text-foreground">{bot.plan_category}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] font-black text-muted uppercase tracking-[0.2em] mb-1">Rate</p>
                                                <p className="text-lg font-black text-primary">₹{bot.plan_rate}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${expiry.bg} ${expiry.color}`}>
                                                <Clock size={12} />
                                                {expiry.label}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleBillItem(bot); }}
                                                    className={`p-2 rounded-xl border transition-all ${
                                                        bot.invoice_status === 'INVOICED'
                                                            ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                                            : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20'
                                                    }`}
                                                    title="Generate Invoice"
                                                >
                                                    <Receipt size={18} />
                                                </button>
                                                <div className="p-2 text-primary group-hover:translate-x-1 transition-transform">
                                                    <ChevronRight size={20} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="col-span-full py-20 text-center text-muted italic font-bold">
                                No Exbots found matching your search.
                            </div>
                        )}
                    </div>
                )}

                {/* Pagination */}
                {!loading && totalCount > ITEMS_PER_PAGE && (
                    <div className="p-6 border-t border-border flex items-center justify-between bg-muted/5">
                        <p className="text-muted text-xs font-bold uppercase tracking-widest">
                            Page {currentPage} of {totalPages}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 bg-background border border-border rounded-xl text-sm font-bold text-foreground hover:bg-muted/10 disabled:opacity-50 transition-all"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 bg-background border border-border rounded-xl text-sm font-bold text-foreground hover:bg-muted/10 disabled:opacity-50 transition-all"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExbotList;
