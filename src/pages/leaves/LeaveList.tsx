import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLeaves, deleteLeave, type EmployeeLeave } from './leaveService';
import { getUsers } from '../user/userService';
import {
    Search,
    Plus,
    Calendar,
    Clock,
    Loader2,
    Edit2,
    Trash2,
    AlertCircle,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    User,
    FileText
} from 'lucide-react';

const LeaveList: React.FC = () => {
    const [leaves, setLeaves] = useState<EmployeeLeave[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    // Mapping states
    const [users, setUsers] = useState<any[]>([]);

    const ITEMS_PER_PAGE = 10;
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    const fetchData = async (page: number = 1, search: string = '') => {
        setLoading(true);
        setError(null);
        try {
            const [leaveData, userData] = await Promise.all([
                getLeaves(page, search),
                getUsers(1, '') // Simple fetch for mapping
            ]);
            setLeaves(leaveData.results);
            setTotalCount(leaveData.count);
            setUsers(userData.results || []);
        } catch (err: any) {
            console.error('Failed to fetch leaves:', err);
            setError(err.response?.data?.detail || 'Failed to load leaves.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData(currentPage, searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, currentPage]);

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this leave request?')) return;
        try {
            await deleteLeave(id);
            fetchData(currentPage, searchTerm);
        } catch (err: any) {
            alert(err.response?.data?.detail || 'Failed to delete leave request.');
        }
    };

    const getUserName = (id: number) => {
        const u = users.find(u => u.id === id);
        if (u) return u.username;
        return `User #${id}`;
    };

    const getStatusStyles = (status: string | null) => {
        switch (status?.toLowerCase()) {
            case 'approved':
                return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'rejected':
                return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
            case 'cancelled':
                return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
            case 'pending':
            default:
                return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
        }
    };

    // Summary Calculations
    const pendingCount = leaves.filter(l => !l.status || l.status.toLowerCase() === 'pending').length;
    const approvedCount = leaves.filter(l => l.status?.toLowerCase() === 'approved').length;

    if (loading && leaves.length === 0) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <Loader2 className="animate-spin text-primary" size={48} />
            <p className="text-muted font-medium italic">Loading leave requests...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 text-sm font-bold">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-foreground bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Employee Leaves</h1>
                    <p className="text-muted font-bold text-sm uppercase tracking-widest mt-1">Leave Management & Tracking</p>
                </div>
                <button onClick={() => navigate('/leaves/new')} className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all hover:scale-[1.02] active:scale-95">
                    <Plus size={20} strokeWidth={3} />
                    <span>Request Leave</span>
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card border border-border p-6 rounded-[2.5rem] shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 text-primary/5 group-hover:text-primary/10 transition-colors"><FileText size={80} /></div>
                    <p className="text-[10px] font-black uppercase text-muted tracking-[0.2em]">Total Requests</p>
                    <h2 className="text-4xl font-black mt-2 text-primary">{totalCount}</h2>
                    <p className="text-xs text-muted font-bold mt-1">All time</p>
                </div>
                <div className="bg-card border border-border p-6 rounded-[2.5rem] shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 text-amber-500/5 group-hover:text-amber-500/10 transition-colors"><Clock size={80} /></div>
                    <p className="text-[10px] font-black uppercase text-muted tracking-[0.2em]">Pending Approval</p>
                    <h2 className="text-4xl font-black mt-2 text-amber-500">{pendingCount}</h2>
                    <p className="text-xs text-amber-500 font-bold mt-1">Action required</p>
                </div>
                <div className="bg-card border border-border p-6 rounded-[2.5rem] shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 text-emerald-500/5 group-hover:text-emerald-500/10 transition-colors"><CheckCircle2 size={80} /></div>
                    <p className="text-[10px] font-black uppercase text-muted tracking-[0.2em]">Approved Leaves</p>
                    <h2 className="text-4xl font-black mt-2 text-emerald-500">{approvedCount}</h2>
                    <p className="text-xs text-emerald-500 font-bold mt-1 uppercase tracking-wider">Confirmed</p>
                </div>
            </div>

            {/* Filters & Content */}
            <div className="bg-card border border-border rounded-[3rem] shadow-sm overflow-hidden min-h-[400px]">
                <div className="p-8 border-b border-border bg-muted/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                        <input
                            type="text"
                            placeholder="Search descriptions, employees..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted/5 border-b border-border">
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-muted tracking-widest">Employee</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-muted tracking-widest">Dates</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-muted tracking-widest">Description</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-muted tracking-widest">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-muted tracking-widest">Approved By</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-muted tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {leaves.map((leave) => (
                                <tr key={leave.id} className="hover:bg-muted/5 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-primary/10 text-primary rounded-xl"><User size={18} /></div>
                                            <div>
                                                <p className="text-sm font-black text-foreground">{getUserName(leave.employee)}</p>
                                                <p className="text-[10px] text-muted font-bold uppercase tracking-widest mt-0.5">ID: {leave.employee}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <div className="text-xs font-black text-foreground">{leave.start_date}</div>
                                            <div className="h-px w-3 bg-muted"></div>
                                            <div className="text-xs font-black text-foreground">{leave.end_date}</div>
                                        </div>
                                        <p className="text-[10px] text-muted font-bold uppercase mt-1 tracking-tight">Period</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm text-foreground/80 line-clamp-2 max-w-xs font-medium">{leave.description || '—'}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-black rounded-full border uppercase ${getStatusStyles(leave.status)}`}>
                                            {leave.status || 'Pending'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        {leave.approved_by ? (
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-muted/10 text-muted rounded-lg"><User size={14} /></div>
                                                <span className="text-xs font-bold text-foreground">{getUserName(leave.approved_by)}</span>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] text-muted font-bold uppercase tracking-widest italic">Not Set</span>
                                        )}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                            <button onClick={() => navigate(`/leaves/edit/${leave.id}`)} className="p-2 hover:bg-primary/10 text-primary rounded-xl transition-colors border border-transparent hover:border-primary/20"><Edit2 size={16} /></button>
                                            <button onClick={() => handleDelete(leave.id)} className="p-2 hover:bg-rose-500/10 text-rose-500 rounded-xl transition-colors border border-transparent hover:border-rose-500/20"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {leaves.length === 0 && (
                    <div className="py-20 text-center">
                        <div className="inline-flex p-6 bg-muted/20 rounded-[2rem] text-muted mb-4"><Calendar size={48} /></div>
                        <h3 className="text-lg font-bold text-foreground">No leave requests found</h3>
                        <p className="text-muted text-sm max-w-xs mx-auto">Try adjusting your search term or request a new leave.</p>
                    </div>
                )}

                {/* Pagination */}
                {totalCount > ITEMS_PER_PAGE && (
                    <div className="px-8 py-6 bg-muted/5 border-t border-border flex items-center justify-between">
                        <p className="text-xs text-muted font-bold uppercase tracking-widest">Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} records</p>
                        <div className="flex items-center gap-2">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => p - 1)}
                                className="p-2 hover:bg-primary/10 text-primary rounded-xl disabled:opacity-30 transition-all border border-border hover:border-primary/20"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <span className="px-4 py-2 bg-primary/5 text-primary text-sm font-black rounded-xl border border-primary/20">{currentPage} / {totalPages}</span>
                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(p => p + 1)}
                                className="p-2 hover:bg-primary/10 text-primary rounded-xl disabled:opacity-30 transition-all border border-border hover:border-primary/20"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeaveList;
