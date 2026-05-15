import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Target,
    Plus,
    Search,
    Loader2,
    Edit2,
    Trash2,
    Eye,
    Calendar,
    LayoutGrid,
    List,
    ChevronRight,
    User as UserIcon,
    Briefcase,
    Filter,
    RefreshCw,
    AlertCircle
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { leadService } from './leadService';
import type { Lead } from './lead';
import { usePermission } from '../../hooks/usePermission';
import SearchableUserSelect from '../../components/SearchableUserSelect';
import Pagination from '../../components/Pagination';

const LeadList: React.FC = () => {
    const { hasPermission } = usePermission();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [showFilters, setShowFilters] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const [filters, setFilters] = useState({
        interest_level: searchParams.get('interest_level') || '',
        conversion_status: searchParams.get('conversion_status') || '',
        assigned_to: searchParams.get('assigned_to') ? parseInt(searchParams.get('assigned_to')!) : null as number | null,
        start_date: searchParams.get('start_date') || '',
        end_date: searchParams.get('end_date') || '',
        upcoming: searchParams.get('upcoming') === 'true',
        overdue: searchParams.get('overdue') === 'true'
    });
    const navigate = useNavigate();

    const ITEMS_PER_PAGE = 10;
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    const fetchLeads = async (page: number = 1, search: string = '', activeFilters = filters) => {
        setLoading(true);
        try {
            const params = {
                page,
                search,
                interest_level: activeFilters.interest_level || undefined,
                conversion_status: activeFilters.conversion_status || undefined,
                assigned_to: activeFilters.assigned_to || undefined,
                start_date: activeFilters.start_date || undefined,
                end_date: activeFilters.end_date || undefined,
                upcoming: activeFilters.upcoming || undefined,
                overdue: activeFilters.overdue || undefined
            };
            const data = await leadService.getLeads(params);
            setLeads(data.results);
            setTotalCount(data.count);
        } catch (error) {
            console.error('Failed to fetch leads:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Sync URL params to filter state whenever URL changes
        const interest = searchParams.get('interest_level') || '';
        const status = searchParams.get('conversion_status') || '';
        const assigned = searchParams.get('assigned_to') ? parseInt(searchParams.get('assigned_to')!) : null;
        const start = searchParams.get('start_date') || '';
        const end = searchParams.get('end_date') || '';
        const upcoming = searchParams.get('upcoming') === 'true';
        const overdue = searchParams.get('overdue') === 'true';

        // Check if state actually needs updating to prevent loops
        const hasChanged = 
            interest !== filters.interest_level ||
            status !== filters.conversion_status ||
            assigned !== filters.assigned_to ||
            start !== filters.start_date ||
            end !== filters.end_date ||
            upcoming !== filters.upcoming ||
            overdue !== filters.overdue;

        if (hasChanged) {
            setFilters({
                interest_level: interest,
                conversion_status: status,
                assigned_to: assigned,
                start_date: start,
                end_date: end,
                upcoming,
                overdue
            });
            if (interest || status || assigned || start || end || upcoming || overdue) {
                setShowFilters(true);
            }
        }
    }, [searchParams]);

    useEffect(() => {
        if (currentPage === 1) {
            fetchLeads(1, searchTerm, filters);
        } else {
            setCurrentPage(1);
        }
        
        // Update URL params when filters change from UI
        const newParams: any = {};
        if (filters.interest_level) newParams.interest_level = filters.interest_level;
        if (filters.conversion_status) newParams.conversion_status = filters.conversion_status;
        if (filters.assigned_to) newParams.assigned_to = filters.assigned_to.toString();
        if (filters.start_date) newParams.start_date = filters.start_date;
        if (filters.end_date) newParams.end_date = filters.end_date;
        if (filters.upcoming) newParams.upcoming = 'true';
        if (filters.overdue) newParams.overdue = 'true';
        
        // Only set if different to avoid loop
        const currentParams = Object.fromEntries(searchParams.entries());
        if (JSON.stringify(newParams) !== JSON.stringify(currentParams)) {
            setSearchParams(newParams, { replace: true });
        }
    }, [filters]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (currentPage !== 1) {
                setCurrentPage(1);
            } else {
                fetchLeads(1, searchTerm, filters);
            }
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    useEffect(() => {
        fetchLeads(currentPage, searchTerm);
    }, [currentPage]);

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this lead?')) {
            try {
                await leadService.deleteLead(id);
                fetchLeads(currentPage, searchTerm);
            } catch (error) {
                console.error('Failed to delete lead:', error);
            }
        }
    };

    const getInterestStyle = (level: string) => {
        switch (level.toLowerCase()) {
            case 'hot': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
            case 'warm': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'cold': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status.toLowerCase()) {
            case 'closed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'denied': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
            case 'negotiation': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
            case 'approved': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            default: return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
        }
    };

    const resetFilters = () => {
        setFilters({
            interest_level: '',
            conversion_status: '',
            assigned_to: null,
            start_date: '',
            end_date: '',
            upcoming: false,
            overdue: false
        });
        setSearchTerm('');
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                        <Target size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-foreground uppercase">
                            Lead Directory
                        </h1>
                        <p className="text-muted text-[10px] font-medium italic">Track & manage business opportunities.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-card border border-border rounded-xl p-0.5 shadow-sm">
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-1.5 rounded-lg transition-all ${viewMode === 'table' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-muted hover:text-foreground'}`}
                        >
                            <List size={16} />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-muted hover:text-foreground'}`}
                        >
                            <LayoutGrid size={16} />
                        </button>
                    </div>
                    {hasPermission('add_lead') && (
                        <button
                            onClick={() => navigate('/leads/new')}
                            className="flex items-center space-x-2 px-5 py-2 bg-primary hover:bg-primary-hover text-white font-black rounded-xl transition-all shadow-lg active:scale-95 text-sm"
                        >
                            <Plus size={16} />
                            <span>New Lead</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Content Card */}
            <div className="bg-card border border-border rounded-[1.5rem] overflow-hidden shadow-xl shadow-primary/5">
                <div className="p-4 border-b border-border space-y-4 bg-muted/5">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="relative flex-1 w-full max-w-sm group">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={16} />
                            <input
                                type="text"
                                placeholder="Search leads..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold shadow-sm text-sm"
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black transition-all border text-sm ${showFilters ? 'bg-primary text-white border-primary shadow-md' : 'bg-background text-foreground border-border hover:border-primary/50'}`}
                            >
                                <Filter size={16} />
                                <span>Filters</span>
                                {Object.values(filters).some(v => v !== '' && v !== null) && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse ml-0.5" />
                                )}
                            </button>
                            <button
                                onClick={resetFilters}
                                className="p-2 text-muted hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all border border-transparent hover:border-rose-500/20"
                                title="Reset All"
                            >
                                <RefreshCw size={16} />
                            </button>
                        </div>
                    </div>

                    {showFilters && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-border/50 animate-in slide-in-from-top-4 duration-300">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Interest Level</label>
                                <select
                                    value={filters.interest_level}
                                    onChange={(e) => setFilters(f => ({ ...f, interest_level: e.target.value }))}
                                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer"
                                >
                                    <option value="">All Interest</option>
                                    <option value="hot">🔥 Hot</option>
                                    <option value="warm">✨ Warm</option>
                                    <option value="cold">❄️ Cold</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Conversion Status</label>
                                <select
                                    value={filters.conversion_status}
                                    onChange={(e) => setFilters(f => ({ ...f, conversion_status: e.target.value }))}
                                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="new">New</option>
                                    <option value="contacted">Contacted</option>
                                    <option value="proposal_sent">Proposal Sent</option>
                                    <option value="negotiation">Negotiation</option>
                                    <option value="approved">Approved</option>
                                    <option value="closed">Closed</option>
                                    <option value="denied">Denied</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Assigned Employee</label>
                                <SearchableUserSelect
                                    value={filters.assigned_to}
                                    onChange={(val) => setFilters(f => ({ ...f, assigned_to: val }))}
                                    placeholder="Filter by user..."
                                    className="!py-0"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Follow-up Date Range</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="date"
                                        value={filters.start_date}
                                        onChange={(e) => setFilters(f => ({ ...f, start_date: e.target.value }))}
                                        className="flex-1 min-w-0 px-3 py-2 bg-background border border-border rounded-xl text-[11px] font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                                    />
                                    <span className="text-muted text-[10px] font-black">TO</span>
                                    <input
                                        type="date"
                                        value={filters.end_date}
                                        onChange={(e) => setFilters(f => ({ ...f, end_date: e.target.value }))}
                                        className="flex-1 min-w-0 px-3 py-2 bg-background border border-border rounded-xl text-[11px] font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                                    />
                                </div>
                            </div>
                            {/* Upcoming toggle spans full row on small, 1 col on large */}
                            <div className="space-y-1.5 lg:col-span-4">
                                <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Quick Filters</label>
                                <div className="flex flex-wrap items-center gap-3">
                                    <button
                                        onClick={() => setFilters(f => ({ ...f, upcoming: !f.upcoming, overdue: false }))}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-sm border transition-all ${
                                            filters.upcoming
                                                ? 'bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/20'
                                                : 'bg-background text-foreground border-border hover:border-blue-500/50'
                                        }`}
                                    >
                                        <Calendar size={14} />
                                        Upcoming Follow-ups
                                        {filters.upcoming && (
                                            <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-md text-[10px] font-black">ON</span>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setFilters(f => ({ ...f, overdue: !f.overdue, upcoming: false }))}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-sm border transition-all ${
                                            filters.overdue
                                                ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20'
                                                : 'bg-background text-foreground border-border hover:border-rose-500/50'
                                        }`}
                                    >
                                        <AlertCircle size={14} className={filters.overdue ? 'text-white' : 'text-rose-500'} />
                                        Overdue Follow-ups
                                        {filters.overdue && (
                                            <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-md text-[10px] font-black">ON</span>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {viewMode === 'table' ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-muted/5 text-muted text-[10px] font-black uppercase tracking-widest">
                                    <th className="px-6 py-4 w-[60px]">#</th>
                                    <th className="px-6 py-4">Company & Contact</th>
                                    <th className="px-6 py-4">Assigned Employee</th>
                                    <th className="px-6 py-4">Interest</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Next Follow-up</th>
                                    <th className="px-6 py-4">Created</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {loading ? (
                                    <tr>
                                        <td colSpan={8} className="px-8 py-20 text-center text-muted">
                                            <Loader2 className="animate-spin text-primary mx-auto mb-4" size={40} />
                                            <p className="font-bold">Syncing leads...</p>
                                        </td>
                                    </tr>
                                ) : leads.length > 0 ? (
                                    leads.map((lead, index) => {
                                        const serialNumber = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
                                        return (
                                            <tr key={lead.id} className="group hover:bg-primary/[0.02] transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="w-8 h-8 rounded-lg bg-muted/20 flex items-center justify-center text-[10px] font-black text-muted group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                                        {String(serialNumber).padStart(2, '0')}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2.5 bg-primary/5 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                                            <Briefcase size={16} />
                                                        </div>
                                                        <div>
                                                            <p className="text-foreground font-black text-sm">{lead.company_name}</p>
                                                            <p className="text-muted text-[10px] font-bold uppercase tracking-tight">{lead.contact_person} • {lead.contact_number}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-foreground font-bold bg-muted/20 px-3 py-1.5 rounded-xl w-fit">
                                                        <UserIcon size={12} className="text-indigo-500" />
                                                        <span className="text-xs uppercase tracking-tight">{lead.assigned_to_name || 'Unassigned'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border ${getInterestStyle(lead.interest_level)}`}>
                                                        {lead.interest_level}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border ${getStatusStyle(lead.conversion_status)}`}>
                                                        {lead.conversion_status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {lead.next_followup_date ? (
                                                        <div className={`flex items-center gap-2 font-bold ${
                                                            new Date(lead.next_followup_date + 'T00:00:00') < new Date(new Date().setHours(0,0,0,0))
                                                                ? 'text-rose-500'
                                                                : 'text-foreground'
                                                        }`}>
                                                            <Calendar size={14} className={new Date(lead.next_followup_date + 'T00:00:00') < new Date(new Date().setHours(0,0,0,0)) ? 'text-rose-500' : 'text-primary'} />
                                                            {format(parseISO(lead.next_followup_date), 'MMM d, yyyy')}
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted text-xs italic">No date set</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5 text-muted font-bold text-xs">
                                                        <Calendar size={12} className="text-muted/60" />
                                                        {format(parseISO(lead.created_at), 'MMM d, yyyy')}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        <button onClick={() => navigate(`/leads/${lead.id}`)} className="p-2 text-muted hover:text-primary hover:bg-primary/10 rounded-xl transition-all"><Eye size={16} /></button>
                                                        {hasPermission('change_lead') && <button onClick={() => navigate(`/leads/edit/${lead.id}`)} className="p-2 text-muted hover:text-amber-500 hover:bg-amber-500/10 rounded-xl transition-all"><Edit2 size={16} /></button>}
                                                        {hasPermission('delete_lead') && <button onClick={() => handleDelete(lead.id)} className="p-2 text-muted hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"><Trash2 size={16} /></button>}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr><td colSpan={8} className="px-8 py-20 text-center text-muted italic font-bold">No leads found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-muted/5">
                        {leads.map((lead) => (
                            <div
                                key={lead.id}
                                onClick={() => navigate(`/leads/${lead.id}`)}
                                className="bg-background border border-border rounded-[2rem] p-6 hover:shadow-2xl hover:shadow-primary/10 transition-all cursor-pointer group relative overflow-hidden"
                            >
                                <div className="flex items-start justify-between mb-6">
                                    <div className="p-4 bg-primary/5 rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                        <Briefcase size={24} />
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getInterestStyle(lead.interest_level)}`}>
                                        {lead.interest_level}
                                    </span>
                                </div>
                                <div className="space-y-1 mb-6">
                                    <h3 className="text-xl font-black text-foreground group-hover:text-primary transition-colors line-clamp-1 uppercase tracking-tight">{lead.company_name}</h3>
                                    <div className="flex flex-col gap-1.5">
                                        <p className="text-muted text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5"><UserIcon size={12} className="text-primary" /> {lead.contact_person}</p>
                                        <p className="text-muted text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5"><Briefcase size={12} className="text-indigo-500" /> {lead.assigned_to_name || 'Unassigned'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mt-auto">
                                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border ${getStatusStyle(lead.conversion_status)}`}>
                                        {lead.conversion_status.replace('_', ' ')}
                                    </span>
                                    <div className="p-2 text-primary group-hover:translate-x-1 transition-transform">
                                        <ChevronRight size={20} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                <div className="px-4">
                    <Pagination 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalCount={totalCount}
                        itemsPerPage={ITEMS_PER_PAGE}
                        onPageChange={setCurrentPage}
                        itemName="leads"
                    />
                </div>
            </div>
        </div>
    );
};

export default LeadList;
