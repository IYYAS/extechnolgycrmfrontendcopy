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
    Receipt
} from 'lucide-react';

const ServerList: React.FC = () => {
    const [servers, setServers] = useState<ProjectServer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const navigate = useNavigate();

    const ITEMS_PER_PAGE = 10;
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    const fetchServers = async (page: number = 1, search: string = '') => {
        setLoading(true);
        setError(null);
        try {
            const data = await getProjectServers(page, search);
            setServers(data.results);
            setTotalCount(data.count);
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
        fetchServers(currentPage, searchTerm);
    }, [currentPage]);

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
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Infrastructure Servers</h1>
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

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-card border border-border rounded-2xl shadow-sm">
                    <p className="text-muted text-xs font-semibold uppercase tracking-wider">Total Servers</p>
                    <div className="flex items-end justify-between mt-1">
                        <p className="text-2xl font-bold text-foreground">{totalCount}</p>
                        <Server className="text-primary/20" size={24} />
                    </div>
                </div>
                <div className="p-4 bg-card border border-border rounded-2xl shadow-sm">
                    <p className="text-muted text-xs font-semibold uppercase tracking-wider">Active</p>
                    <div className="flex items-end justify-between mt-1">
                        <p className="text-2xl font-bold text-emerald-500">{servers.filter(s => s.status.toLowerCase() === 'active').length}</p>
                        <Clock className="text-emerald-500/20" size={24} />
                    </div>
                </div>
            </div>

            {/* Filter & Search */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="relative flex-1 w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                        <input
                            type="text"
                            placeholder="Search servers by name, type, provider, status..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        />
                    </div>
                </div>

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
                                        <th className="px-6 py-4">Server Details</th>
                                        <th className="px-6 py-4">Type</th>
                                        <th className="px-6 py-4">Accrued By</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Payment</th>
                                        <th className="px-6 py-4">Expiration</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {servers.map((server) => (
                                        <tr key={server.id} className="group hover:bg-muted/5 transition-colors">
                                            <td className="px-6 py-4 cursor-pointer" onClick={() => navigate(`/infrastructure/servers/${server.id}`)}>
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 rounded-xl bg-primary-subtle flex items-center justify-center text-primary font-bold border border-primary/20 group-hover:scale-105 transition-transform">
                                                        <Server size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-foreground group-hover:text-primary transition-colors font-semibold text-sm uppercase tracking-tight">{server.name}</p>
                                                        <p className="text-muted text-xs opacity-60">ID: {server.id}</p>
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
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${getPaymentStyles(server.payment_status)}`}>
                                                            {server.payment_status}
                                                        </span>
                                                        <span className="text-xs font-bold text-foreground">₹{server.cost}</span>
                                                        <button
                                                            onClick={() => handleBillItem(server)}
                                                            className="p-1 px-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded-lg transition-all border border-emerald-500/20 flex items-center gap-1.5 ml-1"
                                                            title="Generate Invoice"
                                                        >
                                                            <Receipt size={14} />
                                                            <span className="text-[9px] font-black uppercase">Bill</span>
                                                        </button>
                                                    </div>
                                                    {server.client_address && (
                                                        <span className="text-[8px] text-muted font-bold uppercase tracking-tighter">
                                                            ID: {server.client_address}
                                                        </span>
                                                    )}
                                                </div>
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
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                            {servers.map((server) => (
                                <div key={server.id} onClick={() => navigate(`/infrastructure/servers/${server.id}`)} className="group bg-background border border-border rounded-2xl p-5 hover:border-primary/50 transition-all hover:shadow-xl hover:shadow-primary/5 relative overflow-hidden cursor-pointer">
                                    <div className="absolute top-0 right-0 p-4 flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${getStatusStyles(server.status)}`}>
                                            {server.status}
                                        </span>
                                    </div>
                                    <div className="flex items-start space-x-4 mb-4">
                                        <div className="w-12 h-12 min-w-[48px] rounded-xl bg-primary-subtle flex items-center justify-center text-primary border border-primary/20">
                                            <Server size={24} />
                                        </div>
                                        <div className="pr-12">
                                            <h3 className="text-foreground font-bold text-base group-hover:text-primary transition-colors line-clamp-1 uppercase tracking-tight">{server.name}</h3>
                                            <p className="text-muted text-xs font-medium">{server.server_type}</p>
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
                            ))}
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
            {!loading && totalCount > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4">
                    <p className="text-muted text-sm font-medium">
                        Showing <span className="text-foreground">{Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, totalCount)}</span> to{' '}
                        <span className="text-foreground">{Math.min(currentPage * ITEMS_PER_PAGE, totalCount)}</span> of{' '}
                        <span className="text-foreground">{totalCount}</span> servers
                    </p>
                    <div className="flex items-center space-x-2">
                        <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${currentPage === 1 ? 'bg-muted/5 border-border text-muted/30 cursor-not-allowed' : 'bg-card border-border text-foreground hover:bg-muted/10'}`}>
                            Previous
                        </button>
                        <div className="flex items-center space-x-1.5">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button key={page} onClick={() => setCurrentPage(page)} className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${currentPage === page ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-105' : 'bg-card text-muted hover:bg-muted/10 hover:text-primary border border-border'}`}>
                                    {page}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${currentPage === totalPages ? 'bg-muted/5 border-border text-muted/30 cursor-not-allowed' : 'bg-card border-border text-foreground hover:bg-muted/10'}`}>
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServerList;
