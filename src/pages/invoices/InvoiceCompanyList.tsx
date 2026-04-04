import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAddressSummaries, type BusinessAddressSummary } from '../projects/projectService';
import {
    FileText,
    Loader2,
    Search,
    AlertCircle,
    Wallet,
    MapPin
} from 'lucide-react';

const InvoiceCompanyList: React.FC = () => {
    const navigate = useNavigate();
    const [summaries, setSummaries] = useState<BusinessAddressSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await getAddressSummaries();
            setSummaries(data);
        } catch (err) {
            setError('Failed to load billing summaries.');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: string | number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(Number(amount));
    };

    const filteredSummaries = summaries.filter(s =>
        (s.legal_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        s.id.toString().includes(searchTerm)
    );

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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-foreground">Billing Summaries</h1>
                    <p className="text-muted font-medium mt-1">Direct billing and collection data from the project summaries.</p>
                </div>
                <div className="relative group min-w-[300px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search project or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-6 py-3 bg-card border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                    />
                </div>
            </div>

            {error && (
                <div className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-3xl text-rose-500 text-sm font-bold flex items-center gap-3">
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            {/* Summaries List */}
            <div className="grid grid-cols-1 gap-6">
                {filteredSummaries.length === 0 ? (
                    <div className="py-20 bg-card border border-border rounded-[2.5rem] text-center space-y-4">
                        <FileText size={64} className="mx-auto text-muted/20" />
                        <h2 className="text-xl font-bold text-foreground">No Records Found</h2>
                        <p className="text-muted">No project summaries found matching your search.</p>
                    </div>
                ) : (
                    filteredSummaries.map((summary) => {
                        const totalInvoiced = Number(summary.total_invoiced);
                        const totalPaid = Number(summary.total_paid);
                        const balanceDue = Number(summary.total_balance_due);

                        return (
                            <div
                                key={summary.id}
                                onClick={() => navigate(`/invoices/client/${summary.id}`)}
                                className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-md transition-all group cursor-pointer hover:border-primary/30"
                            >
                                <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center flex-shrink-0">
                                            <MapPin size={32} />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black tracking-tight text-foreground group-hover:text-primary transition-colors">
                                                {summary.legal_name || `Client Address #${summary.id}`}
                                            </h2>
                                            <div className="flex items-center gap-3 mt-1">
                                                <p className="text-xs font-bold text-muted uppercase tracking-widest">
                                                    Address ID: {summary.id}
                                                </p>
                                                <span className="w-1 h-1 bg-muted rounded-full opacity-30" />
                                                <p className="text-xs font-bold text-primary uppercase tracking-widest">
                                                    {summary.invoice_count} Invoices
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8">
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Invoiced</p>
                                            <p className="text-lg font-bold text-foreground">{formatCurrency(totalInvoiced)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Paid</p>
                                            <p className="text-lg font-black text-emerald-500">{formatCurrency(totalPaid)}</p>
                                        </div>
                                        <div className="text-right pl-6 border-l border-border">
                                            <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Balance Due</p>
                                            <p className="text-lg font-black text-rose-500">{formatCurrency(balanceDue)}</p>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); navigate(`/advances/client/${summary.id}`); }}
                                            className="flex items-center gap-2 px-4 py-2.5 bg-primary/5 border border-primary/20 text-primary rounded-2xl font-bold text-xs hover:bg-primary/10 transition-all whitespace-nowrap"
                                        >
                                            <Wallet size={14} /> Advances
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div >
    );
};

export default InvoiceCompanyList;
