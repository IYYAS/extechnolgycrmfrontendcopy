import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAdvances, deleteAdvance, type AdvancePayment } from './advanceService';
import {
    ArrowLeft, Loader2, Wallet, AlertCircle, Trash2,
    Calendar, Hash, FileText, TrendingUp, CreditCard, RefreshCw, Plus, Edit2
} from 'lucide-react';

const AdvanceList: React.FC = () => {
    const { clientId: clientIdParam } = useParams<{ clientId: string }>();
    const clientId = clientIdParam ? parseInt(clientIdParam) : undefined;
    const navigate = useNavigate();

    const [advances, setAdvances] = useState<AdvancePayment[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const fetchAdvances = useCallback(async () => {
        if (!clientId) return;
        setLoading(true);
        setError(null);
        try {
            const data = await getAdvances(clientId);
            setAdvances(data.results);
            setTotalCount(data.count);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to load advance payments.');
        } finally {
            setLoading(false);
        }
    }, [clientId]);

    useEffect(() => { fetchAdvances(); }, [fetchAdvances]);

    const handleDelete = async (advance: AdvancePayment) => {
        if (!clientId) return;
        if (!window.confirm(`Delete advance #${advance.id} (₹${advance.amount})? This cannot be undone.`)) return;
        setDeletingId(advance.id);
        try {
            await deleteAdvance(clientId, advance.id);
            setAdvances(prev => prev.filter(a => a.id !== advance.id));
            setTotalCount(prev => prev - 1);
        } catch (err: any) {
            alert(err.response?.data?.detail || 'Failed to delete advance payment.');
        } finally {
            setDeletingId(null);
        }
    };

    const formatCurrency = (amount: string | number) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(amount));

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric', month: 'short', day: 'numeric'
        });

    const formatTime = (dateString: string) =>
        new Date(dateString).toLocaleTimeString('en-IN', {
            hour: '2-digit', minute: '2-digit'
        });

    const totalAdvance = advances.reduce((sum, a) => sum + Number(a.amount), 0);
    const totalRemaining = advances.reduce((sum, a) => sum + Number(a.remaining_amount), 0);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Advance Payments</h1>
                    <p className="text-muted mt-1 text-sm">
                        Client #{clientId} · Advance balance ledger
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchAdvances}
                        className="p-2.5 bg-card border border-border rounded-xl text-muted hover:text-primary transition-all"
                        title="Refresh"
                    >
                        <RefreshCw size={18} />
                    </button>
                    <button
                        onClick={() => navigate(`/advances/client/${clientId}/new`)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-2xl font-black hover:scale-[1.02] transition-all shadow-lg shadow-primary/20 text-sm"
                    >
                        <Plus size={18} /> Record Advance
                    </button>
                    <button
                        onClick={() => navigate(`/invoices/client/${clientId}`)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-2xl font-bold text-muted hover:text-foreground hover:border-primary/30 transition-all text-sm"
                    >
                        <FileText size={16} /> View Invoices
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-card border border-border rounded-2xl font-bold text-muted hover:text-foreground hover:border-primary/30 transition-all text-sm"
                    >
                        <ArrowLeft size={16} /> Back
                    </button>
                </div>
            </div>

            {/* ── Summary Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 bg-card border border-border rounded-2xl shadow-sm">
                    <p className="text-muted text-[10px] font-black uppercase tracking-wider">Total Transactions</p>
                    <div className="flex items-end justify-between mt-2">
                        <p className="text-2xl font-black text-foreground">{totalCount}</p>
                        <CreditCard className="text-primary/20" size={24} />
                    </div>
                </div>
                <div className="p-5 bg-card border border-border rounded-2xl shadow-sm">
                    <p className="text-muted text-[10px] font-black uppercase tracking-wider">Total Remaining Balance</p>
                    <div className="flex items-end justify-between mt-2">
                        <p className="text-2xl font-black text-emerald-500">{formatCurrency(totalRemaining)}</p>
                        <TrendingUp className="text-emerald-500/20" size={24} />
                    </div>
                </div>
                <div className="p-5 bg-card border border-border rounded-2xl shadow-sm">
                    <p className="text-muted text-[10px] font-black uppercase tracking-wider">Latest Advance</p>
                    <div className="flex items-end justify-between mt-2">
                        <p className="text-xl font-black text-foreground">
                            {advances.length > 0 ? formatCurrency(advances[advances.length - 1].amount) : '—'}
                        </p>
                        <Wallet className="text-primary/20" size={24} />
                    </div>
                </div>
            </div>

            {/* ── Main Table Card ── */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="px-6 py-5 border-b border-border bg-muted/5 flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl text-primary">
                        <Wallet size={18} />
                    </div>
                    <div>
                        <h2 className="text-base font-black text-foreground">Advance Payment Ledger</h2>
                        <p className="text-[10px] text-muted uppercase font-bold tracking-widest mt-0.5">
                            All recorded advance transactions
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="py-24 flex flex-col items-center gap-4">
                        <Loader2 className="animate-spin text-primary" size={40} />
                        <p className="text-muted font-medium">Loading advance payments...</p>
                    </div>
                ) : error ? (
                    <div className="py-16 text-center space-y-4 px-6">
                        <AlertCircle size={48} className="text-rose-500/30 mx-auto" />
                        <h3 className="text-lg font-bold text-foreground">Failed to load</h3>
                        <p className="text-muted text-sm">{error}</p>
                        <button
                            onClick={fetchAdvances}
                            className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl text-sm shadow-lg shadow-primary/20"
                        >
                            Try Again
                        </button>
                    </div>
                ) : advances.length === 0 ? (
                    <div className="py-24 text-center space-y-3">
                        <Wallet size={48} className="text-muted/20 mx-auto" />
                        <h3 className="text-lg font-bold text-foreground">No advance payments found</h3>
                        <p className="text-muted text-sm">No advance transactions have been recorded for this client.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-muted/5 text-muted text-[10px] font-black uppercase tracking-wider">
                                    <th className="px-6 py-4">
                                        <div className="flex items-center gap-2"><Hash size={12} /> ID</div>
                                    </th>
                                    <th className="px-6 py-4">Total Amount</th>
                                    <th className="px-6 py-4">Balance</th>
                                    <th className="px-6 py-4">Note</th>
                                    <th className="px-6 py-4 text-center">Source</th>
                                    <th className="px-6 py-4">
                                        <div className="flex items-center gap-2"><Calendar size={12} /> Recorded Date</div>
                                    </th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {advances.map((advance, idx) => (
                                    <tr
                                        key={advance.id}
                                        className="group hover:bg-muted/5 transition-colors"
                                    >
                                        {/* Index & ID */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs font-black border border-primary/10">
                                                    {idx + 1}
                                                </div>
                                                <span className="text-muted text-xs font-bold">#{advance.id}</span>
                                            </div>
                                        </td>

                                        {/* Amount */}
                                        <td className="px-6 py-4">
                                            <span className="text-foreground font-black text-sm">
                                                {formatCurrency(advance.amount)}
                                            </span>
                                        </td>

                                        {/* Balance */}
                                        <td className="px-6 py-4">
                                            <span className={`font-black text-base ${Number(advance.remaining_amount) > 0 ? 'text-emerald-500' : 'text-muted'}`}>
                                                {formatCurrency(advance.remaining_amount)}
                                            </span>
                                            <p className="text-[10px] text-muted font-bold mt-0.5 lowercase tracking-tighter">Remaining</p>
                                        </td>

                                        {/* Note */}
                                        <td className="px-6 py-4">
                                            {advance.note ? (
                                                <p className="text-foreground text-xs font-medium max-w-[200px] line-clamp-2">{advance.note}</p>
                                            ) : (
                                                <span className="text-muted italic text-[10px]">No remarks</span>
                                            )}
                                        </td>

                                        {/* Source / Manual */}
                                        <td className="px-6 py-4 text-center">
                                            {advance.is_manual ? (
                                                <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-blue-500 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20">
                                                    Manual
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded border border-primary/20">
                                                    System
                                                </span>
                                            )}
                                        </td>

                                        {/* Date & Time */}
                                        <td className="px-6 py-4">
                                            <p className="text-foreground font-bold text-xs">{formatDate(advance.created_at)}</p>
                                            <p className="text-muted text-[10px] font-bold mt-0.5">{formatTime(advance.created_at)}</p>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 text-right">
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-1">
                                                <button
                                                    onClick={() => navigate(`/advances/client/${clientId}/edit/${advance.id}`)}
                                                    className="p-2 text-muted hover:text-primary rounded-lg transition-all"
                                                    title="Edit advance"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(advance)}
                                                    disabled={deletingId === advance.id}
                                                    className="p-2 text-muted hover:text-rose-500 rounded-lg transition-all disabled:opacity-50"
                                                    title="Delete advance"
                                                >
                                                    {deletingId === advance.id
                                                        ? <Loader2 size={16} className="animate-spin" />
                                                        : <Trash2 size={16} />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>

                            {/* Footer total row */}
                            <tfoot>
                                <tr className="bg-muted/10 border-t-2 border-border">
                                    <td className="px-6 py-4 text-[10px] font-black uppercase text-muted tracking-wider" colSpan={2}>
                                        Summary ({totalCount} transaction{totalCount !== 1 ? 's' : ''})
                                    </td>
                                    {/* Total Amount column */}
                                    <td className="px-6 py-4">
                                        <span className="text-muted font-bold text-sm">
                                            {formatCurrency(totalAdvance)}
                                        </span>
                                        <p className="text-[10px] text-muted font-bold uppercase tracking-tighter opacity-50">Total Adv</p>
                                    </td>
                                    {/* Remaining Balance column */}
                                    <td className="px-6 py-4">
                                        <span className="text-emerald-500 font-black text-lg">
                                            {formatCurrency(totalRemaining)}
                                        </span>
                                        <p className="text-[10px] text-emerald-500 font-black uppercase tracking-tighter">Total Remaining</p>
                                    </td>
                                    <td className="px-6 py-4 text-right" colSpan={3}>
                                        <div className="flex flex-col items-end">
                                            <span className="text-foreground font-black text-xs uppercase tracking-widest opacity-30">Client Ledger Total</span>
                                        </div>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdvanceList;
