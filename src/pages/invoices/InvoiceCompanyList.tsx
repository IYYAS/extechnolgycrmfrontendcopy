import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAddressSummaries, type BusinessAddressSummary } from '../projects/projectService';
import {
    FileText,
    Loader2,
    Search,
    AlertCircle,
    Wallet,
    MapPin,
    Filter,
    ChevronDown,
    ChevronUp,
    X,
    Calendar,
    Receipt,
    CreditCard
} from 'lucide-react';
import Pagination from '../../components/Pagination';

const InvoiceCompanyList: React.FC = () => {
    const navigate = useNavigate();
    const [summaries, setSummaries] = useState<BusinessAddressSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [statistics, setStatistics] = useState<{
        total_invoiced: number;
        total_paid: number;
        total_balance: number;
    } | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        balance_status: 'ALL' as 'ALL' | 'HAS_BALANCE' | 'NO_BALANCE',
        min_balance: '',
        max_balance: '',
        min_advance: '',
        max_advance: '',
        min_remaining_advance: '',
        max_remaining_advance: '',
        start_date: '',
        end_date: '',
    });

    const hasActiveFilters = filters.balance_status !== 'ALL' || 
                            filters.min_balance || filters.max_balance || 
                            filters.min_advance || filters.max_advance || 
                            filters.min_remaining_advance || filters.max_remaining_advance ||
                            filters.start_date || filters.end_date;

    const ITEMS_PER_PAGE = 10;
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    const fetchData = async (page: number = 1, search: string = '', currentFilters = filters) => {
        setLoading(true);
        try {
            const data = await getAddressSummaries(
                page,
                search,
                currentFilters.balance_status,
                {
                    min_balance: currentFilters.min_balance,
                    max_balance: currentFilters.max_balance,
                    min_advance: currentFilters.min_advance,
                    max_advance: currentFilters.max_advance,
                    min_remaining_advance: currentFilters.min_remaining_advance,
                    max_remaining_advance: currentFilters.max_remaining_advance,
                    start_date: currentFilters.start_date,
                    end_date: currentFilters.end_date,
                }
            );
            setSummaries(data.results);
            setTotalCount(data.count);
            setStatistics(data.statistics || null);
        } catch (err) {
            setError('Failed to load billing summaries.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (currentPage !== 1) {
                setCurrentPage(1);
            } else {
                fetchData(1, searchTerm, filters);
            }
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, filters]);

    useEffect(() => {
        fetchData(currentPage, searchTerm, filters);
    }, [currentPage]);



    const formatCurrency = (amount: string | number | undefined) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(Number(amount || 0));
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="animate-spin text-primary" size={48} />
                <p className="text-muted font-medium">Loading summaries...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black tracking-tight text-foreground">Billing Summaries</h1>
                <p className="text-muted font-medium mt-1">Direct billing and collection data from the project summaries.</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-500 delay-150">
                <div className="bg-card border border-border p-6 rounded-[2.5rem] shadow-sm flex items-center gap-5 hover:border-primary/30 transition-colors">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                        <FileText size={28} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Total Invoiced</p>
                        <h3 className="text-2xl font-black text-foreground">{formatCurrency(statistics?.total_invoiced)}</h3>
                    </div>
                </div>
                <div className="bg-card border border-border p-6 rounded-[2.5rem] shadow-sm flex items-center gap-5 hover:border-emerald-500/30 transition-colors">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        <CreditCard size={28} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Total Paid</p>
                        <h3 className="text-2xl font-black text-foreground">{formatCurrency(statistics?.total_paid)}</h3>
                    </div>
                </div>
                <div className="bg-card border border-border p-6 rounded-[2.5rem] shadow-sm flex items-center gap-5 hover:border-rose-500/30 transition-colors">
                    <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                        <Receipt size={28} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Balance Due</p>
                        <h3 className="text-2xl font-black text-foreground">{formatCurrency(statistics?.total_balance)}</h3>
                    </div>
                </div>
            </div>

            {/* Search & Filter Card */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                        <input
                            type="text"
                            placeholder="Search project or ID..."
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
                        {hasActiveFilters && (
                            <button
                                onClick={() => setFilters({
                                    balance_status: 'ALL',
                                    min_balance: '',
                                    max_balance: '',
                                    min_advance: '',
                                    max_advance: '',
                                    min_remaining_advance: '',
                                    max_remaining_advance: '',
                                    start_date: '',
                                    end_date: '',
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

                            {/* Balance Status */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Balance Status</label>
                                <div className="relative">
                                    <select
                                        value={filters.balance_status}
                                        onChange={(e) => setFilters({ ...filters, balance_status: e.target.value as any })}
                                        className="w-full appearance-none bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    >
                                        <option value="ALL">All Clients</option>
                                        <option value="HAS_BALANCE">Has Balance Due</option>
                                        <option value="NO_BALANCE">Zero Balance</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" size={16} />
                                </div>
                            </div>

                            {/* Balance Due Range */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Balance Due (Min – Max)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={filters.min_balance}
                                        onChange={(e) => setFilters({ ...filters, min_balance: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={filters.max_balance}
                                        onChange={(e) => setFilters({ ...filters, max_balance: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Total Advance Range */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Total Advance (Min – Max)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={filters.min_advance}
                                        onChange={(e) => setFilters({ ...filters, min_advance: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={filters.max_advance}
                                        onChange={(e) => setFilters({ ...filters, max_advance: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Remaining Advance Range */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Rem. Advance (Min – Max)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={filters.min_remaining_advance}
                                        onChange={(e) => setFilters({ ...filters, min_remaining_advance: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={filters.max_remaining_advance}
                                        onChange={(e) => setFilters({ ...filters, max_remaining_advance: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Invoice Date Range — spans 2 columns on medium screens, all columns on large */}
                            <div className="sm:col-span-2 lg:col-span-4 space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Invoice Date Range</label>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="relative flex-1">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" size={14} />
                                        <input
                                            type="date"
                                            value={filters.start_date}
                                            onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                                            className="w-full pl-9 pr-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                        />
                                    </div>
                                    <div className="relative flex-1">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" size={14} />
                                        <input
                                            type="date"
                                            value={filters.end_date}
                                            onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                                            className="w-full pl-9 pr-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                )}
            </div>

            {error && (
                <div className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-3xl text-rose-500 text-sm font-bold flex items-center gap-3">
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            {/* Summaries List */}
            <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-2xl shadow-primary/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted/5 text-muted text-xs font-semibold uppercase tracking-wider">
                                <th className="px-6 py-4 w-12 text-center">#</th>
                                <th className="px-6 py-4">Company Details</th>
                                <th className="px-6 py-4 text-center">Invoices</th>
                                <th className="px-6 py-4 text-right">Invoiced</th>
                                <th className="px-6 py-4 text-right">Paid</th>
                                <th className="px-6 py-4 text-right">Balance Due</th>
                                <th className="px-6 py-4 text-right">Total Advance</th>
                                <th className="px-6 py-4 text-right">Remaining Advance</th>
                                <th className="px-6 py-4 text-center">Advances</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {summaries.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="px-6 py-20 text-center space-y-4">
                                        <FileText size={64} className="mx-auto text-muted/20" />
                                        <h2 className="text-xl font-bold text-foreground">No Records Found</h2>
                                        <p className="text-muted">No project summaries found matching your search.</p>
                                    </td>
                                </tr>
                            ) : (
                                summaries.map((summary, index) => {
                                    const totalInvoiced = Number(summary.total_invoiced);
                                    const totalPaid = Number(summary.total_paid);
                                    const balanceDue = Number(summary.total_balance_due);
                                    const totalAdvance = Number(summary.total_advance || 0);
                                    const remainingAdvance = Number(summary.remaining_advance || 0);

                                    return (
                                        <tr 
                                            key={summary.id}
                                            onClick={() => navigate(`/invoices/client/${summary.id}`)}
                                            className="group hover:bg-primary/[0.02] transition-colors cursor-pointer border-l-2 border-l-transparent hover:border-l-primary"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="w-8 h-8 rounded-lg bg-muted/20 flex items-center justify-center text-[10px] font-black text-muted group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                                    {String((currentPage - 1) * ITEMS_PER_PAGE + index + 1).padStart(2, '0')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 font-bold border border-rose-500/20 group-hover:scale-105 transition-transform">
                                                        <MapPin size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-foreground group-hover:text-primary transition-colors font-semibold text-sm uppercase tracking-tight">
                                                            {summary.legal_name || `Client Address #${summary.id}`}
                                                        </p>
                                                        <p className="text-muted text-xs font-bold uppercase tracking-tight">ID: {summary.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs">
                                                    {summary.invoice_count}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <p className="text-sm font-bold text-foreground">{formatCurrency(totalInvoiced)}</p>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <p className="text-sm font-black text-emerald-500">{formatCurrency(totalPaid)}</p>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <p className="text-sm font-black text-rose-500">{formatCurrency(balanceDue)}</p>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <p className="text-sm font-black text-emerald-500">{totalAdvance > 0 ? formatCurrency(totalAdvance) : '—'}</p>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <p className="text-sm font-black text-primary">{totalAdvance > 0 ? formatCurrency(remainingAdvance) : '—'}</p>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); navigate(`/advances/client/${summary.id}`); }}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 border border-primary/20 text-primary rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-primary/10 transition-all whitespace-nowrap"
                                                >
                                                    <Wallet size={12} /> Advances
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); navigate(`/invoices/client/${summary.id}`); }}
                                                    className="p-2.5 text-muted hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                                                    title="View Details"
                                                >
                                                    <FileText size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {!loading && totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalCount={totalCount}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setCurrentPage}
                    itemName="clients"
                />
            )}
        </div >
    );
};

export default InvoiceCompanyList;
