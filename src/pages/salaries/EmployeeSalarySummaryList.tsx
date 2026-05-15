import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEmployeeSalarySummaries, type EmployeeSalarySummary } from './salaryService';
import {
    Search, Plus, Loader2, User, DollarSign, TrendingUp, MinusCircle, ArrowRight
} from 'lucide-react';
import Pagination from '../../components/Pagination';

const EmployeeSalarySummaryList: React.FC = () => {
    const [summaries, setSummaries] = useState<EmployeeSalarySummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [statistics, setStatistics] = useState<{
        total_basic: number;
        paid_count: number;
        unpaid_count: number;
    } | null>(null);
    const navigate = useNavigate();

    const ITEMS_PER_PAGE = 10;
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    const fetchData = async (page: number = 1, search: string = '') => {
        setLoading(true);
        try {
            const data = await getEmployeeSalarySummaries(page, search);
            setSummaries(data.results);
            setTotalCount(data.count);
            setStatistics(data.statistics || null);
        } catch (err: any) {
            console.error('Failed to load salary summaries:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => fetchData(currentPage, searchTerm), 500);
        return () => clearTimeout(timer);
    }, [searchTerm, currentPage]);

    const fmt = (val: number) => val.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 });
    const fmtDate = (dateStr: string | null) => {
        if (!dateStr) return 'No records';
        return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    if (loading && summaries.length === 0) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <Loader2 className="animate-spin text-primary" size={48} />
            <p className="text-muted font-medium italic">Loading employee summaries...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Salary Summaries</h1>
                    <p className="text-muted font-bold text-sm uppercase tracking-widest mt-1">Aggregate Payroll Overview</p>
                </div>
                <button
                    onClick={() => navigate('/salaries/new')}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all hover:scale-[1.02] active:scale-95"
                >
                    <Plus size={20} strokeWidth={3} />
                    <span>New Salary</span>
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card border border-border p-6 rounded-[2.5rem] shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 text-primary/5 group-hover:text-primary/10 transition-colors"><DollarSign size={80} /></div>
                    <p className="text-[10px] font-black uppercase text-muted tracking-[0.2em]">Total Basic</p>
                    <h2 className="text-3xl font-black mt-2 text-primary">₹{(statistics?.total_basic || 0).toLocaleString()}</h2>
                    <p className="text-xs text-muted font-bold mt-1 uppercase">Global Payroll</p>
                </div>
                <div className="bg-card border border-border p-6 rounded-[2.5rem] shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 text-emerald-500/5 group-hover:text-emerald-500/10 transition-colors"><TrendingUp size={80} /></div>
                    <p className="text-[10px] font-black uppercase text-muted tracking-[0.2em]">Total Paid Records</p>
                    <h2 className="text-4xl font-black mt-2 text-emerald-500">{statistics?.paid_count || 0}</h2>
                    <p className="text-xs text-emerald-500 font-bold mt-1 uppercase">Records Cleared</p>
                </div>
                <div className="bg-card border border-border p-6 rounded-[2.5rem] shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 text-rose-500/5 group-hover:text-rose-500/10 transition-colors"><MinusCircle size={80} /></div>
                    <p className="text-[10px] font-black uppercase text-muted tracking-[0.2em]">Total Unpaid Records</p>
                    <h2 className="text-4xl font-black mt-2 text-rose-500">{statistics?.unpaid_count || 0}</h2>
                    <p className="text-xs text-rose-500 font-bold mt-1 uppercase">Pending Disbursement</p>
                </div>
            </div>

            {/* Table */}
            <div className="bg-card border border-border rounded-[3rem] shadow-sm overflow-hidden min-h-[400px]">
                <div className="p-8 border-b border-border bg-muted/5">
                    <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                        <input
                            type="text"
                            placeholder="Search employee..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted/5 border-b border-border">
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-muted tracking-widest">Employee</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-muted tracking-widest text-center">Records</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-muted tracking-widest">Total Paid</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-muted tracking-widest">Balance Due</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-muted tracking-widest">Last Salary</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-muted tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {summaries.map(summary => (
                                <tr 
                                    key={summary.id} 
                                    className="hover:bg-muted/5 transition-colors group cursor-pointer"
                                    onClick={() => navigate(`/salaries/history?employee=${summary.id}`)}
                                >
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-primary/10 text-primary rounded-xl"><User size={18} /></div>
                                            <div>
                                                <p className="text-sm font-black text-foreground">{summary.first_name} {summary.last_name || summary.username}</p>
                                                <p className="text-[10px] text-muted font-bold uppercase tracking-widest mt-0.5">ID: {summary.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className="inline-flex items-center px-3 py-1 bg-muted text-foreground text-[10px] font-black rounded-full border border-border uppercase">
                                            {summary.record_count} Records
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-black text-emerald-500">{fmt(summary.total_paid_amount)}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-black text-rose-500">{fmt(summary.total_unpaid_amount)}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-black text-foreground">{fmtDate(summary.last_payment_date)}</p>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                            <span className="text-[10px] font-black uppercase text-primary tracking-widest mr-2">View History</span>
                                            <div className="p-2 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-white transition-all">
                                                <ArrowRight size={16} />
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {summaries.length === 0 && !loading && (
                    <div className="py-20 text-center">
                        <div className="inline-flex p-6 bg-muted/20 rounded-[2rem] text-muted mb-4"><DollarSign size={48} /></div>
                        <h3 className="text-lg font-bold text-foreground">No employee summaries found</h3>
                        <p className="text-muted text-sm">Records will appear once salaries are generated.</p>
                    </div>
                )}

                {summaries.length > 0 && (
                    <div className="px-8 py-4 border-t border-border bg-muted/5">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalCount={totalCount}
                            itemsPerPage={ITEMS_PER_PAGE}
                            onPageChange={setCurrentPage}
                            itemName="employees"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployeeSalarySummaryList;
