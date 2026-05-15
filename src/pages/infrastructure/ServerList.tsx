import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProjectServers, deleteProjectServer } from './serverService';
import type { ProjectServer } from './serverService';
import {
    LayoutGrid,
    List,
    Search,
    Plus,
    Server,
    Clock,
    ChevronRight,
    Loader2,
    Eye,
    Calendar,
    Edit2,
    Trash2,
    HardDrive,
    Receipt,
    Filter,
    X,
    ChevronDown,
    ChevronUp,
    ShieldCheck,
    AlertCircle
} from 'lucide-react';
import Pagination from '../../components/Pagination';
import CustomSelect from '../../components/CustomSelect';

const ServerList: React.FC = () => {
    const [servers, setServers] = useState<ProjectServer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [statistics, setStatistics] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        status: '',
        payment_status: '',
        invoice_status: '',
        min_cost: '',
        max_cost: '',
        start_date: '',
        end_date: ''
    });
    const navigate = useNavigate();

    const ITEMS_PER_PAGE = 10;
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    const fetchServers = async (page: number = 1, search: string = '', currentFilters = filters) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getProjectServers(page, search, currentFilters);
            setServers(data.results);
            setTotalCount(data.count);
            setStatistics(data.statistics);
        } catch (error: any) {
            console.error('Failed to fetch servers:', error);
            setError(error.response?.data?.detail || 'Failed to load servers. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (serverId: number, serverName: string) => {
        if (!window.confirm(`Are you sure you want to delete server "${serverName}"? This action cannot be undone.`)) {
            return;
        }

        try {
            await deleteProjectServer(serverId);
            fetchServers(currentPage, searchTerm);
        } catch (error: any) {
            console.error('Failed to delete server:', error);
            alert(error.response?.data?.detail || 'Failed to delete server. Please try again.');
        }
    };

    const handleBillItem = (server: ProjectServer) => {
        const params = new URLSearchParams({
            type: 'server',
            name: server.name || 'Server',
            rate: server.cost?.toString() || '0',
            purchase_date: server.purchase_date || '',
            expiry_date: server.expiration_date || '',
            server_id: server.id.toString(),
            business_address: server.client_address?.toString() || ''
        });

        const url = server.client_address
            ? `/invoices/client/${server.client_address}/new?${params.toString()}`
            : `/invoices/new?${params.toString()}`;

        window.open(url, '_blank');
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (currentPage !== 1) {
                setCurrentPage(1);
            } else {
                fetchServers(1, searchTerm);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    useEffect(() => {
        fetchServers(currentPage, searchTerm, filters);
    }, [currentPage, filters]);

    const getStatusStyles = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active':
                return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'expired':
                return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
            case 'pending':
                return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            default:
                return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
        }
    };

    const getPaymentStyles = (status: string) => {
        if (status.toUpperCase() === 'PAID') {
            return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
        }
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
    };

    const getInvoiceStatusStyles = (status?: string) => {
        if (status?.toUpperCase() === 'INVOICED') {
            return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
        }
        return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Servers</h1>
                    <p className="text-muted mt-1">Manage virtual and physical servers for all projects.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-card border border-border rounded-xl p-1 shadow-sm">
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-foreground'}`}
                        >
                            <List size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-foreground'}`}
                        >
                            <LayoutGrid size={18} />
                        </button>
                    </div>
                    <button
                        onClick={() => navigate('/infrastructure/servers/new')}
                        className="flex items-center space-x-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary/20"
                    >
                        <Plus size={20} />
                        <span>Add Server</span>
                    </button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-top-4 duration-500 delay-150">
                <div className="bg-card border border-border p-6 rounded-[2rem] shadow-sm flex items-center gap-5 hover:border-primary/30 transition-colors">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                        <Server size={28} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-0.5">Total Servers</p>
                        <h3 className="text-2xl font-black text-foreground">{statistics?.total || 0}</h3>
                    </div>
                </div>
                <div className="bg-card border border-border p-6 rounded-[2rem] shadow-sm flex items-center gap-5 hover:border-emerald-500/30 transition-colors">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        <ShieldCheck size={28} />
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

            {/* Filter & Search */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="relative flex-1 w-full max-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                        <input
                            type="text"
                            placeholder="Search servers by name, type, provider, status..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all font-semibold ${showFilters
                                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                    : 'bg-background text-foreground border-border hover:border-primary/50'
                                }`}
                        >
                            <Filter size={18} />
                            <span>Filters</span>
                            {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                        {(filters.status || filters.payment_status || filters.invoice_status || filters.min_cost || filters.max_cost || filters.start_date || filters.end_date) && (
                            <button
                                onClick={() => setFilters({
                                    status: '',
                                    payment_status: '',
                                    invoice_status: '',
                                    min_cost: '',
                                    max_cost: '',
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
                                label="Server Status"
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

                            {/* Amount Range */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Cost Range (Min - Max)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={filters.min_cost}
                                        onChange={(e) => setFilters({ ...filters, min_cost: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={filters.max_cost}
                                        onChange={(e) => setFilters({ ...filters, max_cost: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                            </div>

                            {/* Expiration Date Range */}
                            <div className="sm:col-span-2 lg:col-span-2 space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Expiration Date Range</label>
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

                {loading ? (
                    <div className="px-6 py-24 text-center">
                        <div className="flex flex-col items-center space-y-4">
                            <div className="relative">
                                <Loader2 className="animate-spin text-primary" size={48} />
                                <div className="absolute inset-0 blur-xl bg-primary/20 rounded-full animate-pulse"></div>
                            </div>
                            <p className="text-muted font-medium">Fetching infrastructure servers...</p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="px-6 py-12 text-center">
                        <div className="inline-flex items-center justify-center p-4 bg-rose-500/10 rounded-full text-rose-500 mb-4">
                            <span className="text-3xl">⚠️</span>
                        </div>
                        <h3 className="text-lg font-bold text-foreground">Something went wrong</h3>
                        <p className="text-muted max-w-xs mx-auto mt-2">{error}</p>
                        <button
                            onClick={() => fetchServers(currentPage, searchTerm)}
                            className="mt-6 px-6 py-2 bg-primary text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary/20"
                        >
                            Try Again
                        </button>
                    </div>
                ) : servers.length > 0 ? (
                    viewMode === 'table' ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-muted/5 text-muted text-xs font-semibold uppercase tracking-wider">
                                        <th className="px-6 py-4 w-12 text-center">#</th>
                                        <th className="px-6 py-4">Server Details</th>
                                        <th className="px-6 py-4">Type</th>
                                        <th className="px-6 py-4">Accrued By</th>
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
                                    {servers.map((server, index) => {
                                        const daysLeft = server.expiration_date ? Math.ceil((new Date(server.expiration_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;
                                        const isExpiringYellow = daysLeft !== null && daysLeft > 15 && daysLeft <= 30;
                                        const isExpiringRed = daysLeft !== null && daysLeft <= 15;
                                        const rowClass = isExpiringRed ? 'border-l-2 border-l-rose-500 hover:bg-rose-500/5' : isExpiringYellow ? 'border-l-2 border-l-amber-500 hover:bg-amber-500/5' : 'hover:bg-muted/5 border-l-2 border-l-transparent';

                                        return (
                                            <tr key={server.id} className={`group transition-colors ${rowClass}`}>
                                                <td className="px-6 py-4">
                                                    <div className="w-8 h-8 rounded-lg bg-muted/20 flex items-center justify-center text-[10px] font-black text-muted group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                                        {String((currentPage - 1) * ITEMS_PER_PAGE + index + 1).padStart(2, '0')}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 cursor-pointer" onClick={() => navigate(`/infrastructure/servers/${server.id}`)}>
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-10 h-10 rounded-xl bg-primary-subtle flex items-center justify-center text-primary font-bold border border-primary/20 group-hover:scale-105 transition-transform">
                                                            <Server size={20} />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-foreground group-hover:text-primary transition-colors font-semibold text-sm uppercase tracking-tight">{server.project_name || 'N/A'}</p>
                                                                {(daysLeft !== null && daysLeft <= 30) && (
                                                                    <span className={`px-1.5 py-0.5 text-[7px] rounded font-black uppercase tracking-widest ${daysLeft <= 15 ? 'bg-rose-500/20 text-rose-600' : 'bg-amber-500/20 text-amber-600'
                                                                        }`}>
                                                                        {daysLeft < 0 ? 'Expired' : 'Expiring Soon'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-muted text-xs opacity-60">{server.name}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center text-muted text-xs font-medium">
                                                        <HardDrive size={14} className="mr-1.5 opacity-60" />
                                                        {server.server_type}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-foreground font-medium text-xs">{server.accrued_by}</p>
                                                    <p className="text-muted text-[10px] uppercase font-bold opacity-50">{server.purchased_from}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${getStatusStyles(server.status)}`}>
                                                        {server.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1">
                                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${getPaymentStyles(server.payment_status)}`}>
                                                            {server.payment_status}
                                                        </span>
                                                        {server.client_address && (
                                                            <span className="text-[8px] text-muted font-bold uppercase tracking-tighter">
                                                                ID: {server.client_address}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border whitespace-nowrap ${getInvoiceStatusStyles(server.invoice_status)}`}>
                                                        {server.invoice_status?.replace('_', ' ') || 'NOT INVOICED'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-bold text-foreground">₹{server.cost}</span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => handleBillItem(server)}
                                                        className={`p-1 px-3 rounded-lg transition-all border inline-flex items-center gap-1.5 ${server.invoice_status === 'INVOICED'
                                                                ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                                                : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20'
                                                            }`}
                                                        title={server.invoice_status === 'INVOICED' ? 'Already Invoiced' : 'Generate Invoice'}
                                                    >
                                                        <Receipt size={14} />
                                                        <span className="text-[9px] font-black uppercase">
                                                            {server.invoice_status === 'INVOICED' ? 'Billed' : 'Bill'}
                                                        </span>
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-medium text-foreground">{formatDate(server.expiration_date)}</span>
                                                        <span className="text-[10px] text-muted opacity-60 uppercase font-bold tracking-tighter">Deadline</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => navigate(`/infrastructure/servers/${server.id}`)} className="p-2 text-muted hover:text-primary hover:bg-primary-subtle rounded-lg transition-all" title="View Details">
                                                            <Eye size={18} />
                                                        </button>
                                                        <button onClick={() => navigate(`/infrastructure/servers/edit/${server.id}`)} className="p-2 text-muted hover:text-primary hover:bg-primary-subtle rounded-lg transition-all" title="Edit">
                                                            <Edit2 size={18} />
                                                        </button>
                                                        <button onClick={() => handleDelete(server.id, server.name)} className="p-2 text-muted hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all" title="Delete">
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                            {servers.map((server) => {
                                const daysLeft = server.expiration_date ? Math.ceil((new Date(server.expiration_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;
                                const isExpiringYellow = daysLeft !== null && daysLeft > 15 && daysLeft <= 30;
                                const isExpiringRed = daysLeft !== null && daysLeft <= 15;
                                const cardClass = isExpiringRed ? 'bg-background border-rose-500/50 hover:border-rose-500' : isExpiringYellow ? 'bg-background border-amber-500/50 hover:border-amber-500' : 'bg-background border-border hover:border-primary/50';

                                return (
                                    <div key={server.id} onClick={() => navigate(`/infrastructure/servers/${server.id}`)} className={`group rounded-2xl p-5 transition-all hover:shadow-xl hover:shadow-primary/5 relative overflow-hidden cursor-pointer border ${cardClass}`}>
                                        {(daysLeft !== null && daysLeft <= 30) && (
                                            <div className={`absolute top-0 left-0 w-full text-center py-0.5 text-[8px] font-black uppercase tracking-widest ${daysLeft <= 15
                                                    ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                                                    : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                                                }`}>
                                                {daysLeft < 0 ? 'Expired' : 'Expiring Soon'}
                                            </div>
                                        )}
                                        <div className={`absolute top-0 right-0 p-4 flex items-center gap-2 ${daysLeft !== null && daysLeft <= 30 ? 'mt-2' : ''}`}>
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${getStatusStyles(server.status)}`}>
                                                {server.status}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${getInvoiceStatusStyles(server.invoice_status)}`}>
                                                {server.invoice_status === 'INVOICED' ? 'Invoiced' : 'Pending Bill'}
                                            </span>
                                        </div>
                                        <div className={`flex items-start space-x-4 mb-4 ${daysLeft !== null && daysLeft <= 30 ? 'mt-3' : ''}`}>
                                            <div className="w-12 h-12 min-w-[48px] rounded-xl bg-primary-subtle flex items-center justify-center text-primary border border-primary/20">
                                                <Server size={24} />
                                            </div>
                                            <div className="pr-12">
                                                <h3 className="text-foreground font-bold text-base group-hover:text-primary transition-colors line-clamp-1 uppercase tracking-tight">{server.project_name || 'N/A'}</h3>
                                                <p className="text-muted text-xs font-medium">{server.name}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 mb-6 pt-2">
                                            <div className="space-y-1">
                                                <p className="text-[9px] uppercase font-black text-muted tracking-widest">Accrued By</p>
                                                <p className="text-foreground text-xs font-bold truncate">{server.accrued_by}</p>
                                            </div>
                                            <div className="space-y-1 text-right">
                                                <p className="text-[9px] uppercase font-black text-muted tracking-widest">Cost</p>
                                                <p className="text-emerald-500 text-sm font-black">₹{server.cost}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between pt-4 border-t border-border">
                                            <div className="flex items-center text-muted text-xs font-bold gap-1.5">
                                                <Calendar size={14} className="opacity-60" />
                                                {formatDate(server.expiration_date)}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleBillItem(server); }}
                                                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded-xl transition-all border border-emerald-500/20"
                                                    title="Generate Invoice"
                                                >
                                                    <Receipt size={14} />
                                                    <span className="text-[10px] font-black uppercase">Bill</span>
                                                </button>
                                                <button className="flex items-center space-x-1 text-primary text-xs font-black uppercase tracking-wider hover:translate-x-1 transition-transform">
                                                    <span>Manage</span>
                                                    <ChevronRight size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )
                ) : (
                    <div className="px-6 py-24 text-center">
                        <div className="w-20 h-20 bg-muted/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Server className="text-muted/40" size={40} />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">No servers found</h3>
                        <p className="text-muted max-w-xs mx-auto mt-2">
                            {searchTerm ? 'We couldn\'t find any servers matching your search terms.' : 'You haven\'t added any servers yet. Start by adding your first one!'}
                        </p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={totalCount}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
                itemName="servers"
            />
        </div>
    );
};

export default ServerList;
