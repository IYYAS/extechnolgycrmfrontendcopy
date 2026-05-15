import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProjects, deleteProject } from './projectService';
import Pagination from '../../components/Pagination';
import { usePermission } from '../../hooks/usePermission';
import type { Project } from './projectService';
import {
    LayoutGrid,
    List,
    Search,
    Plus,
    Briefcase,
    Calendar,
    Clock,
    ChevronRight,
    Loader2,
    Eye,
    Edit2,
    Trash2,
    ClipboardList,
    Filter,
    Layers,
    UserCircle,
    Check,
    AlertCircle
} from 'lucide-react';
import { getProjectNatures, getClients } from './projectService';

interface FilterDropdownProps {
    label: string;
    value: string;
    options: { label: string, value: string }[];
    onChange: (value: string) => void;
    icon?: React.ReactNode;
    align?: 'left' | 'right';
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({ label, value, options, onChange, icon, align = 'left' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownSearch, setDropdownSearch] = useState('');
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!isOpen) setDropdownSearch('');
    }, [isOpen]);

    const selectedOption = options.find(opt => opt.value === value);
    const filteredOptions = options.filter(opt => 
        opt.label.toLowerCase().includes(dropdownSearch.toLowerCase())
    );

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-4 py-2.5 bg-background border rounded-xl text-sm font-medium transition-all min-w-[160px] justify-between
                    ${isOpen ? 'border-primary ring-2 ring-primary/20 shadow-lg' : 'border-border hover:border-primary/50'}`}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    {icon && <span className="text-muted shrink-0">{icon}</span>}
                    <span className={`truncate ${value ? 'text-foreground' : 'text-muted'}`}>
                        {selectedOption ? selectedOption.label : label}
                    </span>
                </div>
                <div className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                    <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>

            {isOpen && (
                <div className={`absolute z-50 w-full mt-2 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 min-w-[220px] ${align === 'right' ? 'right-0' : 'left-0'}`}>
                    <div className="p-2 border-b border-border">
                        <div className="relative">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-muted" size={14} />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Search..."
                                value={dropdownSearch}
                                onChange={(e) => setDropdownSearch(e.target.value)}
                                className="w-full pl-8 pr-3 py-1.5 bg-muted/5 border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
                            />
                        </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto p-1.5 custom-scrollbar">
                        <button
                            onClick={() => { onChange(''); setIsOpen(false); }}
                            className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all hover:bg-muted/10 
                                ${!value ? 'bg-primary/10 text-primary font-bold' : 'text-muted hover:text-foreground'}`}
                        >
                            {label}
                        </button>
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => { onChange(opt.value); setIsOpen(false); }}
                                    className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all hover:bg-muted/10 mt-0.5
                                        ${value === opt.value ? 'bg-primary/10 text-primary font-bold' : 'text-foreground/80 hover:text-foreground'}`}
                                >
                                    {opt.label}
                                </button>
                            ))
                        ) : (
                            <div className="px-3 py-4 text-center text-xs text-muted">No results found</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const ProjectList: React.FC = () => {
    const { hasPermission } = usePermission();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [statusFilter, setStatusFilter] = useState('');
    const [natureFilter, setNatureFilter] = useState('');
    const [clientFilter, setClientFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [datePreset, setDatePreset] = useState('');
    const [stats, setStats] = useState({ total: 0, pending: 0, progressing: 0, completed: 0 });
    const [natures, setNatures] = useState<{ label: string, value: string }[]>([]);
    const [clients, setClients] = useState<{ label: string, value: string }[]>([]);
    const navigate = useNavigate();

    const ITEMS_PER_PAGE = 10;
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    const fetchProjects = async (page: number = 1, search: string = '', filters?: { status?: string; nature?: string; client?: string; start_date?: string; end_date?: string }) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getProjects(page, search, filters);
            setProjects(data.results);
            setTotalCount(data.count);
            if (data.stats) {
                setStats(data.stats);
            }
        } catch (error: any) {
            console.error('Failed to fetch projects:', error);
            setError(error.response?.data?.detail || 'Failed to load projects. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (projectId: number, projectName: string) => {
        if (!window.confirm(`Are you sure you want to delete project "${projectName}"? This action cannot be undone.`)) {
            return;
        }

        try {
            await deleteProject(projectId);
            // Refresh list
            fetchProjects(currentPage, searchTerm);
        } catch (error: any) {
            console.error('Failed to delete project:', error);
            alert(error.response?.data?.detail || 'Failed to delete project. Please try again.');
        }
    };

    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const [natureData, clientData] = await Promise.all([
                    getProjectNatures(),
                    getClients()
                ]);
                setNatures(natureData.map(n => ({ label: n.name, value: n.name })));
                setClients(clientData.map(c => ({ label: c.company_name, value: c.company_name })));
            } catch (error) {
                console.error('Failed to fetch filter options:', error);
            }
        };
        fetchFilters();
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (currentPage !== 1) {
                setCurrentPage(1);
            } else {
                fetchProjects(1, searchTerm, { 
                    status: statusFilter, 
                    nature: natureFilter, 
                    client: clientFilter,
                    start_date: startDate,
                    end_date: endDate
                });
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, statusFilter, natureFilter, clientFilter, startDate, endDate]);

    useEffect(() => {
        fetchProjects(currentPage, searchTerm, { 
            status: statusFilter, 
            nature: natureFilter, 
            client: clientFilter,
            start_date: startDate,
            end_date: endDate
        });
    }, [currentPage]);

    const getStatusStyles = (status: string) => {
        switch (status.toLowerCase()) {
            case 'progressing':
                return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'completed':
                return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'pending':
                return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            default:
                return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const toYMD = (d: Date) => d.toISOString().split('T')[0];

    const applyDatePreset = (preset: string) => {
        setDatePreset(preset);
        const today = new Date();
        if (preset === 'today') {
            const ymd = toYMD(today);
            setStartDate(ymd); setEndDate(ymd);
        } else if (preset === 'week') {
            const mon = new Date(today);
            mon.setDate(today.getDate() - today.getDay() + 1);
            const sun = new Date(mon);
            sun.setDate(mon.getDate() + 6);
            setStartDate(toYMD(mon)); setEndDate(toYMD(sun));
        } else if (preset === 'month') {
            const first = new Date(today.getFullYear(), today.getMonth(), 1);
            const last = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            setStartDate(toYMD(first)); setEndDate(toYMD(last));
        } else if (preset === 'custom') {
            // keep existing dates, just switch to custom mode
        } else {
            setStartDate(''); setEndDate('');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Projects</h1>
                    <p className="text-muted mt-1">Monitor and manage your active project portfolio.</p>
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
                    {hasPermission('add_project') && (
                        <button
                            onClick={() => navigate('/projects/new')}
                            className="flex items-center space-x-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary/20"
                        >
                            <Plus size={20} />
                            <span>Create Project</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-card border border-border rounded-2xl shadow-sm">
                    <p className="text-muted text-xs font-semibold uppercase tracking-wider">Total Projects</p>
                    <div className="flex items-end justify-between mt-1">
                        <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                        <Briefcase className="text-primary/20" size={24} />
                    </div>
                </div>
                <div className="p-4 bg-card border border-border rounded-2xl shadow-sm">
                    <p className="text-muted text-xs font-semibold uppercase tracking-wider">Progressing</p>
                    <div className="flex items-end justify-between mt-1">
                        <p className="text-2xl font-bold text-amber-500">{stats.progressing}</p>
                        <Clock className="text-amber-500/20" size={24} />
                    </div>
                </div>
                <div className="p-4 bg-card border border-border rounded-2xl shadow-sm">
                    <p className="text-muted text-xs font-semibold uppercase tracking-wider">Completed</p>
                    <div className="flex items-end justify-between mt-1">
                        <p className="text-2xl font-bold text-emerald-500">{stats.completed}</p>
                        <Check className="text-emerald-500/20" size={24} />
                    </div>
                </div>
                <div className="p-4 bg-card border border-border rounded-2xl shadow-sm">
                    <p className="text-muted text-xs font-semibold uppercase tracking-wider">Pending</p>
                    <div className="flex items-end justify-between mt-1">
                        <p className="text-2xl font-bold text-blue-500">{stats.pending}</p>
                        <AlertCircle className="text-blue-500/20" size={24} />
                    </div>
                </div>
            </div>

            {/* Filter & Search */}
            <div className="bg-card border border-border rounded-2xl shadow-sm">
                <div className="p-4 flex flex-col lg:flex-row items-center justify-between gap-4">
                    <div className="relative w-full lg:max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                        <FilterDropdown
                            label="All Status"
                            value={statusFilter}
                            options={[
                                { label: 'Pending', value: 'Pending' },
                                { label: 'Progressing', value: 'Progressing' },
                                { label: 'Completed', value: 'Completed' }
                            ]}
                            onChange={setStatusFilter}
                            icon={<Filter size={16} />}
                        />
                        <FilterDropdown
                            label="All Natures"
                            value={natureFilter}
                            options={natures}
                            onChange={setNatureFilter}
                            icon={<Layers size={16} />}
                        />
                        <FilterDropdown
                            label="All Clients"
                            value={clientFilter}
                            options={clients}
                            onChange={setClientFilter}
                            icon={<UserCircle size={16} />}
                            align="right"
                        />

                        {/* Date Filter */}
                        <div className="flex items-center gap-2">
                            <FilterDropdown
                                label="All Dates"
                                value={datePreset}
                                options={[
                                    { label: 'Today', value: 'today' },
                                    { label: 'This Week', value: 'week' },
                                    { label: 'This Month', value: 'month' },
                                    { label: 'Custom', value: 'custom' },
                                ]}
                                onChange={applyDatePreset}
                                icon={<Calendar size={16} />}
                            />

                            {datePreset === 'custom' && (
                                <div className="flex items-center gap-1.5 bg-background border border-border rounded-xl px-3 py-2.5 shadow-sm">
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={e => setStartDate(e.target.value)}
                                        className="bg-transparent border-none outline-none text-xs font-bold focus:ring-0 w-[108px] cursor-pointer"
                                        title="Start Date"
                                    />
                                    <span className="text-muted text-[9px] font-black px-1">TO</span>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={e => setEndDate(e.target.value)}
                                        className="bg-transparent border-none outline-none text-xs font-bold focus:ring-0 w-[108px] cursor-pointer"
                                        title="End Date"
                                    />
                                </div>
                            )}
                        </div>

                        {(statusFilter || natureFilter || clientFilter || datePreset || startDate || endDate || searchTerm) && (
                            <button
                                onClick={() => {
                                    setStatusFilter('');
                                    setNatureFilter('');
                                    setClientFilter('');
                                    setStartDate('');
                                    setEndDate('');
                                    setDatePreset('');
                                    setSearchTerm('');
                                }}
                                className="text-sm font-bold text-primary hover:text-primary-hover transition-colors px-2"
                            >
                                Clear All
                            </button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="px-6 py-24 text-center">
                        <div className="flex flex-col items-center space-y-4">
                            <div className="relative">
                                <Loader2 className="animate-spin text-primary" size={48} />
                                <div className="absolute inset-0 blur-xl bg-primary/20 rounded-full animate-pulse"></div>
                            </div>
                            <p className="text-muted font-medium">Fetching your projects...</p>
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
                            onClick={() => fetchProjects(currentPage, searchTerm)}
                            className="mt-6 px-6 py-2 bg-primary text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary/20"
                        >
                            Try Again
                        </button>
                    </div>
                ) : projects.length > 0 ? (
                    viewMode === 'table' ? (
                        /* Table View */
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-muted/5 text-muted text-xs font-semibold uppercase tracking-wider">
                                        <th className="px-6 py-4 w-12">#</th>
                                        <th className="px-6 py-4">Project Details</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Nature</th>
                                        <th className="px-6 py-4">Client</th>
                                        <th className="px-6 py-4">Created Date</th>
                                        <th className="px-6 py-4">Updated At</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {projects.map((project, index) => {
                                        const baseInfo = project.project_base_informations?.[0];
                                        const clientInfo = project.project_clients?.[0];
                                        const serialNumber = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
                                        return (
                                            <tr key={project.id} className="group hover:bg-muted/5 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="w-8 h-8 rounded-lg bg-muted/20 flex items-center justify-center text-[10px] font-black text-muted group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                                        {String(serialNumber).padStart(2, '0')}
                                                    </div>
                                                </td>
                                                <td
                                                    className="px-6 py-4 cursor-pointer"
                                                    onClick={() => navigate(`/projects/${project.id}`)}
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-12 h-12 rounded-xl bg-primary-subtle flex items-center justify-center text-primary font-bold border border-primary/20 group-hover:scale-105 transition-transform">
                                                            <Briefcase size={24} />
                                                        </div>
                                                        <div>
                                                            <p className="text-foreground group-hover:text-primary transition-colors font-semibold text-lg">{baseInfo?.name || project.description}</p>
                                                            <p className="text-muted text-sm line-clamp-1">{project.description}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusStyles(project.status)}`}>
                                                        {project.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center text-muted text-sm">
                                                        <LayoutGrid size={14} className="mr-1.5 opacity-60" />
                                                        {project.project_nature_detail?.name || 'Standard'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="text-foreground font-medium text-sm">
                                                            {project.project_business_addresses?.[0]?.legal_name || clientInfo?.company_name || 'N/A'}
                                                        </p>
                                                        <p className="text-muted text-xs">
                                                            {project.project_business_addresses?.[0]?.attention_name || clientInfo?.contact_person}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center text-muted text-sm whitespace-nowrap">
                                                        <Calendar size={14} className="mr-1.5 opacity-60" />
                                                        {formatDate(project.created_at)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center text-muted text-sm whitespace-nowrap">
                                                        <Clock size={14} className="mr-1.5 opacity-60" />
                                                        {formatDate(project.updated_at)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => navigate(`/projects/${project.id}`)}
                                                            className="p-2 text-muted hover:text-primary hover:bg-primary-subtle rounded-lg transition-all"
                                                            title="View Details"
                                                        >
                                                            <Eye size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => navigate(`/activities/new?project=${project.id}`)}
                                                            className="p-2 text-muted hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all"
                                                            title="Add Activity"
                                                        >
                                                            <ClipboardList size={18} />
                                                        </button>
                                                        {hasPermission('change_project') && (
                                                            <button
                                                                onClick={() => navigate(`/projects/edit/${project.id}`)}
                                                                className="p-2 text-muted hover:text-primary hover:bg-primary-subtle rounded-lg transition-all"
                                                                title="Edit"
                                                            >
                                                                <Edit2 size={18} />
                                                            </button>
                                                        )}
                                                        {hasPermission('delete_project') && (
                                                            <button
                                                                onClick={() => handleDelete(project.id, baseInfo?.name || project.description)}
                                                                className="p-2 text-muted hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                                                                title="Delete"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        /* Grid View */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                            {projects.map((project) => {
                                const baseInfo = project.project_base_informations?.[0];
                                const clientInfo = project.project_clients?.[0];
                                const finance = project.project_finances?.[0];
                                return (
                                    <div
                                        key={project.id}
                                        onClick={() => navigate(`/projects/${project.id}`)}
                                        className="group bg-background border border-border rounded-2xl p-5 hover:border-primary/50 transition-all hover:shadow-xl hover:shadow-primary/5 relative overflow-hidden cursor-pointer"
                                    >
                                        <div className="absolute top-0 right-0 p-4 flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusStyles(project.status)}`}>
                                                {project.status}
                                            </span>
                                            {hasPermission('delete_project') && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(project.id, baseInfo?.name || project.description);
                                                    }}
                                                    className="p-1.5 text-muted hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>

                                        <div className="flex items-start space-x-4 mb-4">
                                            <div className="w-12 h-12 min-w-[48px] rounded-xl bg-primary-subtle flex items-center justify-center text-primary border border-primary/20">
                                                <Briefcase size={24} />
                                            </div>
                                            <div className="pr-12">
                                                <h3 className="text-foreground font-bold text-lg group-hover:text-primary transition-colors line-clamp-1">{baseInfo?.name || 'Untitled Project'}</h3>
                                                <p className="text-muted text-xs">{project.project_nature_detail?.name || 'Project Portfolio'}</p>
                                            </div>
                                        </div>

                                        <p className="text-muted text-sm line-clamp-2 mb-6 min-h-[40px]">
                                            {project.description}
                                        </p>

                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                            <div className="space-y-1">
                                                <p className="text-[10px] uppercase font-bold text-muted tracking-wider">Client</p>
                                                <p className="text-foreground text-sm font-medium line-clamp-1">{clientInfo?.company_name || 'Personal Client'}</p>
                                            </div>
                                            <div className="space-y-1 text-right">
                                                <p className="text-[10px] uppercase font-bold text-muted tracking-wider">Budget</p>
                                                <p className="text-emerald-500 text-sm font-bold">₹{finance?.project_cost || '0.00'}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-border">
                                            <div className="flex items-center text-muted text-xs">
                                                <Calendar size={14} className="mr-1.5" />
                                                {formatDate(project.created_at)}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); navigate(`/activities/new?project=${project.id}`); }}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded-xl text-xs font-bold border border-emerald-500/20 transition-all"
                                                    title="Add Activity"
                                                >
                                                    <ClipboardList size={13} />
                                                    <span>Activity</span>
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/projects/${project.id}`)}
                                                    className="flex items-center space-x-1 text-primary text-sm font-bold hover:translate-x-1 transition-transform"
                                                >
                                                    <span>View</span>
                                                    <ChevronRight size={16} />
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
                            <Briefcase className="text-muted/40" size={40} />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">No projects found</h3>
                        <p className="text-muted max-w-xs mx-auto mt-2">
                            {searchTerm ? 'We couldn\'t find any projects matching your search terms.' : 'You haven\'t created any projects yet. Start by creating your first one!'}
                        </p>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="mt-6 text-primary font-semibold hover:underline"
                            >
                                Clear Search
                            </button>
                        )}
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
                itemName="projects"
            />
        </div>
    );
};

export default ProjectList;
