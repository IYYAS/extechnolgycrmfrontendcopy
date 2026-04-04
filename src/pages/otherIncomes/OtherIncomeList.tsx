import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOtherIncomes, deleteOtherIncome } from './otherIncomeService';
import type { OtherIncome } from './otherIncomeService';
import {
    Search,
    Plus,
    Calendar,
    Loader2,
    Edit2,
    Trash2,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    DollarSign,
    FileText
} from 'lucide-react';

const OtherIncomeList: React.FC = () => {
    const [incomes, setIncomes] = useState<OtherIncome[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const ITEMS_PER_PAGE = 10;
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    const fetchData = async (page: number = 1, search: string = '') => {
        setLoading(true);
        setError(null);
        try {
            const data = await getOtherIncomes(page, search);
            setIncomes(data.results);
            setTotalCount(data.count);
        } catch (err: any) {
            console.error('Failed to fetch other incomes:', err);
            setError(err.response?.data?.detail || 'Failed to load other incomes.');
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
        if (!window.confirm('Are you sure you want to delete this record?')) return;
        try {
            await deleteOtherIncome(id);
            fetchData(currentPage, searchTerm);
        } catch (err: any) {
            alert(err.response?.data?.detail || 'Failed to delete record.');
        }
    };

    const totalAmount = incomes.reduce((acc, inc) => acc + parseFloat(inc.amount), 0).toFixed(2);

    if (loading && incomes.length === 0) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <Loader2 className="animate-spin text-primary" size={48} />
            <p className="text-muted font-medium italic">Loading other incomes...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 text-sm font-bold animate-in zoom-in duration-300">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-foreground bg-gradient-to-r from-emerald-500 to-emerald-400 bg-clip-text text-transparent">Other Incomes</h1>
                    <p className="text-muted font-bold text-sm uppercase tracking-widest mt-1">Manage miscellaneous income</p>
                </div>
                <button onClick={() => navigate('/other-incomes/new')} className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all hover:scale-[1.02] active:scale-95">
                    <Plus size={20} strokeWidth={3} />
                    <span>New Income</span>
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card border border-border p-6 rounded-[2.5rem] shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 text-emerald-500/5 group-hover:text-emerald-500/10 transition-colors"><DollarSign size={80} /></div>
                    <p className="text-[10px] font-black uppercase text-muted tracking-[0.2em]">Total Amount Extracted</p>
                    <h2 className="text-4xl font-black mt-2 text-emerald-500">${totalAmount}</h2>
                    <p className="text-xs text-muted font-bold mt-1">In current view</p>
                </div>
                <div className="bg-card border border-border p-6 rounded-[2.5rem] shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 text-primary/5 group-hover:text-primary/10 transition-colors"><FileText size={80} /></div>
                    <p className="text-[10px] font-black uppercase text-muted tracking-[0.2em]">Total Records</p>
                    <h2 className="text-4xl font-black mt-2 text-primary">{totalCount}</h2>
                    <p className="text-xs text-muted font-bold mt-1">Records in total</p>
                </div>
            </div>

            {/* Filters & Content */}
            <div className="bg-card border border-border rounded-[3rem] shadow-sm overflow-hidden min-h-[400px]">
                <div className="p-8 border-b border-border bg-muted/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                        <input
                            type="text"
                            placeholder="Search title, notes..."
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
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-muted tracking-widest">Date</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-muted tracking-widest">Title</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-muted tracking-widest">Amount</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-muted tracking-widest">Notes</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-muted tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {incomes.map((income) => (
                                <tr key={income.id} className="hover:bg-muted/5 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl"><Calendar size={18} /></div>
                                            <div>
                                                <p className="text-sm font-black text-foreground">{income.date}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-black text-foreground">{income.title}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-black text-emerald-500">${income.amount}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm text-foreground/80 line-clamp-2 max-w-xs font-medium">{income.notes || '—'}</p>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                            <button onClick={() => navigate(`/other-incomes/edit/${income.id}`)} className="p-2 hover:bg-emerald-500/10 text-emerald-500 rounded-xl transition-colors border border-transparent hover:border-emerald-500/20"><Edit2 size={16} /></button>
                                            <button onClick={() => handleDelete(income.id)} className="p-2 hover:bg-rose-500/10 text-rose-500 rounded-xl transition-colors border border-transparent hover:border-rose-500/20"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {incomes.length === 0 && (
                    <div className="py-20 text-center">
                        <div className="inline-flex p-6 bg-muted/20 rounded-[2rem] text-muted mb-4"><DollarSign size={48} /></div>
                        <h3 className="text-lg font-bold text-foreground">No records found</h3>
                        <p className="text-muted text-sm max-w-xs mx-auto">Try adjusting your search term or add a new other income record.</p>
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
                                className="p-2 hover:bg-emerald-500/10 text-emerald-500 rounded-xl disabled:opacity-30 transition-all border border-border hover:border-emerald-500/20"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <span className="px-4 py-2 bg-emerald-500/5 text-emerald-500 text-sm font-black rounded-xl border border-emerald-500/20">{currentPage} / {totalPages}</span>
                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(p => p + 1)}
                                className="p-2 hover:bg-emerald-500/10 text-emerald-500 rounded-xl disabled:opacity-30 transition-all border border-border hover:border-emerald-500/20"
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

export default OtherIncomeList;
