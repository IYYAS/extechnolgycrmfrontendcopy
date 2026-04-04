import React, { useState, useEffect } from 'react';
import { 
    getBalanceSheet, 
    getCashFlow, 
    getIncomeStatement,
    downloadBalanceSheetPdf, 
    downloadCashFlowPdf, 
    downloadIncomeStatementPdf,
    type BalanceSheetData, 
    type CashFlowData, 
    type IncomeStatementData,
    type ReportFilter 
} from './reportService';
import { 
    DownloadCloud, 
    Calendar, 
    TrendingUp, 
    TrendingDown, 
    Wallet,
    Landmark,
    Banknote,
    FileText,
    Loader2,
    AlertCircle
} from 'lucide-react';

const ReportsPage: React.FC = () => {
    const [balanceSheet, setBalanceSheet] = useState<BalanceSheetData | null>(null);
    const [cashFlow, setCashFlow] = useState<CashFlowData | null>(null);
    const [incomeStatement, setIncomeStatement] = useState<IncomeStatementData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [downloadingBS, setDownloadingBS] = useState(false);
    const [downloadingCF, setDownloadingCF] = useState(false);
    const [downloadingIS, setDownloadingIS] = useState(false);

    const [filterType, setFilterType] = useState<string>('this_month');
    const [month, setMonth] = useState<string>((new Date().getMonth() + 1).toString());
    const [year, setYear] = useState<string>(new Date().getFullYear().toString());
    const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);

    const fetchReports = async () => {
        setLoading(true);
        setError(null);
        try {
            const filter: ReportFilter = { filter_type: filterType };
            
            if (filterType === 'custom') {
                filter.month = month;
                filter.year = year;
                filter.start_date = startDate;
                filter.end_date = endDate;
            }

            const [bsData, cfData, isData] = await Promise.all([
                getBalanceSheet(filter),
                getCashFlow(filter),
                getIncomeStatement(filter)
            ]);
            
            setBalanceSheet(bsData);
            setCashFlow(cfData);
            setIncomeStatement(isData);
        } catch (err: any) {
            console.error('Failed to fetch reports:', err);
            setError(err.response?.data?.detail || 'Failed to load financial reports.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchReports();
        }, 300);
        return () => clearTimeout(timer);
    }, [filterType, month, year, startDate, endDate]);

    const handleDownloadBS = async () => {
        setDownloadingBS(true);
        try {
            const filter: ReportFilter = { filter_type: filterType };
            if (filterType === 'custom') {
                filter.month = month; filter.year = year; filter.start_date = startDate; filter.end_date = endDate;
            }
            await downloadBalanceSheetPdf(filter);
        } catch (err) {
            alert('Failed to download Balance Sheet PDF');
        } finally {
            setDownloadingBS(false);
        }
    };

    const handleDownloadCF = async () => {
        setDownloadingCF(true);
        try {
            const filter: ReportFilter = { filter_type: filterType };
            if (filterType === 'custom') {
                filter.month = month; filter.year = year; filter.start_date = startDate; filter.end_date = endDate;
            }
            await downloadCashFlowPdf(filter);
        } catch (err) {
            alert('Failed to download Cash Flow PDF');
        } finally {
            setDownloadingCF(false);
        }
    };

    const handleDownloadIS = async () => {
        setDownloadingIS(true);
        try {
            const filter: ReportFilter = { filter_type: filterType };
            if (filterType === 'custom') {
                filter.month = month; filter.year = year; filter.start_date = startDate; filter.end_date = endDate;
            }
            await downloadIncomeStatementPdf(filter);
        } catch (err) {
            alert('Failed to download Income Statement PDF');
        } finally {
            setDownloadingIS(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black tracking-tighter text-foreground bg-gradient-to-r from-purple-500 to-indigo-400 bg-clip-text text-transparent">Financial Reports</h1>
                <p className="text-muted font-bold text-sm uppercase tracking-widest mt-1">Income Statement, Balance Sheet & Cash Flow</p>
            </div>

            {/* Filters */}
            <div className="bg-card border border-border rounded-[2.5rem] p-6 shadow-sm flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/10 text-primary rounded-xl"><Calendar size={18} /></div>
                    <span className="text-sm font-black text-foreground uppercase tracking-widest">Filter By</span>
                </div>
                
                <div className="flex-1 flex flex-wrap gap-4 items-center">
                    <select 
                        value={filterType} 
                        onChange={e => setFilterType(e.target.value)}
                        className="px-5 py-3 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm"
                    >
                        <option value="today">Today</option>
                        <option value="this_month">This Month</option>
                        <option value="this_year">This Year</option>
                        <option value="custom">Custom Date Range</option>
                    </select>

                    {filterType === 'custom' && (
                        <div className="flex flex-wrap items-center gap-4 animate-in fade-in slide-in-from-left-4">
                            <input 
                                type="date" 
                                value={startDate} 
                                onChange={e => setStartDate(e.target.value)}
                                className="px-5 py-3 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm"
                            />
                            <span className="text-muted font-bold block md:inline">to</span>
                            <input 
                                type="date" 
                                value={endDate} 
                                onChange={e => setEndDate(e.target.value)}
                                className="px-5 py-3 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm"
                            />
                            <select 
                                value={month} 
                                onChange={e => setMonth(e.target.value)}
                                className="px-5 py-3 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm"
                            >
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                    <option key={m} value={m}>Month {m}</option>
                                ))}
                            </select>
                            <input 
                                type="number" 
                                value={year} 
                                onChange={e => setYear(e.target.value)}
                                className="px-5 py-3 bg-background border border-border rounded-2xl w-24 focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm"
                                placeholder="Year"
                            />
                        </div>
                    )}
                </div>
            </div>

            {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 text-sm font-bold animate-in zoom-in duration-300">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
                    <Loader2 className="animate-spin text-primary" size={48} />
                    <p className="text-muted font-medium italic">Generating reports...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    
                    {/* Left Col: Balance Sheet */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl"><Landmark size={24} /></div>
                                <h2 className="text-2xl font-black text-foreground tracking-tight">Balance Sheet</h2>
                            </div>
                            <button 
                                onClick={handleDownloadBS}
                                disabled={downloadingBS}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-500 font-bold text-sm rounded-xl hover:bg-indigo-500 hover:text-white transition-all disabled:opacity-50"
                            >
                                {downloadingBS ? <Loader2 size={16} className="animate-spin" /> : <DownloadCloud size={16} />}
                                Download PDF
                            </button>
                        </div>
                        
                        {balanceSheet && (
                            <div className="bg-card border border-border rounded-[2.5rem] p-8 space-y-8 shadow-sm">
                                {/* Assets */}
                                <div>
                                    <h3 className="text-[11px] font-black uppercase text-muted tracking-[0.2em] mb-4">Assets</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-4 bg-muted/5 rounded-2xl border border-transparent hover:border-border transition-colors">
                                            <span className="text-sm font-bold text-foreground">Cash on Hand</span>
                                            <span className="text-sm font-black text-foreground">{formatCurrency(balanceSheet.assets.cash_on_hand)}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-muted/5 rounded-2xl border border-transparent hover:border-border transition-colors">
                                            <span className="text-sm font-bold text-foreground">Accounts Receivable</span>
                                            <span className="text-sm font-black text-foreground">{formatCurrency(balanceSheet.assets.accounts_receivable)}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/20">
                                            <span className="text-sm font-black text-indigo-500 uppercase tracking-widest">Total Assets</span>
                                            <span className="text-lg font-black text-indigo-500">{formatCurrency(balanceSheet.assets.total_assets)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Liabilities */}
                                <div>
                                    <h3 className="text-[11px] font-black uppercase text-muted tracking-[0.2em] mb-4">Liabilities</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-4 bg-muted/5 rounded-2xl border border-transparent hover:border-border transition-colors">
                                            <span className="text-sm font-bold text-foreground">Accounts Payable</span>
                                            <span className="text-sm font-black text-foreground">{formatCurrency(balanceSheet.liabilities.accounts_payable)}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-muted/5 rounded-2xl border border-transparent hover:border-border transition-colors">
                                            <span className="text-sm font-bold text-foreground">Client Advances</span>
                                            <span className="text-sm font-black text-foreground">{formatCurrency(balanceSheet.liabilities.client_advances)}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-rose-500/5 rounded-2xl border border-rose-500/20">
                                            <span className="text-sm font-black text-rose-500 uppercase tracking-widest">Total Liabilities</span>
                                            <span className="text-lg font-black text-rose-500">{formatCurrency(balanceSheet.liabilities.total_liabilities)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Equity */}
                                <div>
                                    <h3 className="text-[11px] font-black uppercase text-muted tracking-[0.2em] mb-4">Equity</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-4 bg-muted/5 rounded-2xl border border-transparent hover:border-border transition-colors">
                                            <span className="text-sm font-bold text-foreground">Retained Earnings</span>
                                            <span className={`text-sm font-black ${balanceSheet.equity.retained_earnings < 0 ? 'text-rose-500' : 'text-foreground'}`}>{formatCurrency(balanceSheet.equity.retained_earnings)}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/20">
                                            <span className="text-sm font-black text-emerald-500 uppercase tracking-widest">Total Equity</span>
                                            <span className={`text-lg font-black ${balanceSheet.equity.total_equity < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>{formatCurrency(balanceSheet.equity.total_equity)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Col: Cash Flow */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl"><Banknote size={24} /></div>
                                <h2 className="text-2xl font-black text-foreground tracking-tight">Cash Flow</h2>
                            </div>
                            <button 
                                onClick={handleDownloadCF}
                                disabled={downloadingCF}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 font-bold text-sm rounded-xl hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-50"
                            >
                                {downloadingCF ? <Loader2 size={16} className="animate-spin" /> : <DownloadCloud size={16} />}
                                Download PDF
                            </button>
                        </div>

                        {cashFlow && (
                            <div className="bg-card border border-border rounded-[2.5rem] p-8 space-y-8 shadow-sm">
                                {/* Cash In */}
                                <div>
                                    <h3 className="text-[11px] flex items-center gap-2 font-black uppercase text-emerald-500 tracking-[0.2em] mb-4">
                                        <TrendingUp size={14} /> Cash Inflow
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-4 bg-muted/5 rounded-2xl border border-transparent hover:border-border transition-colors">
                                            <span className="text-sm font-bold text-foreground">Invoice Payments</span>
                                            <span className="text-sm font-black text-foreground">{formatCurrency(cashFlow.cash_in.invoice_payments)}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-muted/5 rounded-2xl border border-transparent hover:border-border transition-colors">
                                            <span className="text-sm font-bold text-foreground">Other Income</span>
                                            <span className="text-sm font-black text-foreground">{formatCurrency(cashFlow.cash_in.other_income)}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-muted/5 rounded-2xl border border-transparent hover:border-border transition-colors">
                                            <span className="text-sm font-bold text-foreground">Client Advances</span>
                                            <span className="text-sm font-black text-foreground">{formatCurrency(cashFlow.cash_in.client_advances)}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/20">
                                            <span className="text-sm font-black text-emerald-500 uppercase tracking-widest">Total Cash In</span>
                                            <span className="text-lg font-black text-emerald-500">{formatCurrency(cashFlow.cash_in.total_cash_in)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Cash Out */}
                                <div>
                                    <h3 className="text-[11px] flex items-center gap-2 font-black uppercase text-rose-500 tracking-[0.2em] mb-4">
                                        <TrendingDown size={14} /> Cash Outflow
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-4 bg-muted/5 rounded-2xl border border-transparent hover:border-border transition-colors">
                                            <span className="text-sm font-bold text-foreground">Salaries Paid</span>
                                            <span className="text-sm font-black text-foreground">{formatCurrency(cashFlow.cash_out.salaries_paid)}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-muted/5 rounded-2xl border border-transparent hover:border-border transition-colors">
                                            <span className="text-sm font-bold text-foreground">Other Expenses</span>
                                            <span className="text-sm font-black text-foreground">{formatCurrency(cashFlow.cash_out.other_expenses)}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-muted/5 rounded-2xl border border-transparent hover:border-border transition-colors">
                                            <span className="text-sm font-bold text-foreground">Domains / Servers</span>
                                            <span className="text-sm font-black text-foreground">{formatCurrency(cashFlow.cash_out.domains_servers_paid)}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-rose-500/5 rounded-2xl border border-rose-500/20">
                                            <span className="text-sm font-black text-rose-500 uppercase tracking-widest">Total Cash Out</span>
                                            <span className="text-lg font-black text-rose-500">{formatCurrency(cashFlow.cash_out.total_cash_out)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Net Cash Flow */}
                                <div className="pt-4 border-t border-border mt-4">
                                    <div className={`flex items-center justify-between p-6 rounded-3xl border-2 ${cashFlow.net_cash_flow >= 0 ? 'bg-emerald-500/10 border-emerald-500/30 shadow-lg shadow-emerald-500/10' : 'bg-rose-500/10 border-rose-500/30 shadow-lg shadow-rose-500/10'}`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-2xl text-white ${cashFlow.net_cash_flow >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                                                <Wallet size={24} />
                                            </div>
                                            <span className={`text-sm font-black uppercase tracking-widest ${cashFlow.net_cash_flow >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>Net Cash Flow</span>
                                        </div>
                                        <span className={`text-3xl font-black ${cashFlow.net_cash_flow >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {formatCurrency(cashFlow.net_cash_flow)}
                                        </span>
                                    </div>
                                </div>
                                
                            </div>
                        )}
                    </div>

                    {/* Right Col: Income Statement */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl"><FileText size={24} /></div>
                                <h2 className="text-2xl font-black text-foreground tracking-tight">Income Statement</h2>
                            </div>
                            <button 
                                onClick={handleDownloadIS}
                                disabled={downloadingIS}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-500 font-bold text-sm rounded-xl hover:bg-blue-500 hover:text-white transition-all disabled:opacity-50"
                            >
                                {downloadingIS ? <Loader2 size={16} className="animate-spin" /> : <DownloadCloud size={16} />}
                                Download PDF
                            </button>
                        </div>

                        {incomeStatement && (
                            <div className="bg-card border border-border rounded-[2.5rem] p-8 space-y-8 shadow-sm">
                                {/* Revenue */}
                                <div>
                                    <h3 className="text-[11px] flex items-center gap-2 font-black uppercase text-emerald-500 tracking-[0.2em] mb-4">
                                        <TrendingUp size={14} /> Revenue
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-4 bg-muted/5 rounded-2xl border border-transparent hover:border-border transition-colors">
                                            <span className="text-sm font-bold text-foreground">Invoices</span>
                                            <span className="text-sm font-black text-foreground">{formatCurrency(incomeStatement.revenue.invoices)}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-muted/5 rounded-2xl border border-transparent hover:border-border transition-colors">
                                            <span className="text-sm font-bold text-foreground">Other Income</span>
                                            <span className="text-sm font-black text-foreground">{formatCurrency(incomeStatement.revenue.other_income)}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/20">
                                            <span className="text-sm font-black text-emerald-500 uppercase tracking-widest">Total Revenue</span>
                                            <span className="text-lg font-black text-emerald-500">{formatCurrency(incomeStatement.revenue.total_revenue)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Expenses */}
                                <div>
                                    <h3 className="text-[11px] flex items-center gap-2 font-black uppercase text-rose-500 tracking-[0.2em] mb-4">
                                        <TrendingDown size={14} /> Expenses
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-4 bg-muted/5 rounded-2xl border border-transparent hover:border-border transition-colors">
                                            <span className="text-sm font-bold text-foreground">Salaries</span>
                                            <span className="text-sm font-black text-foreground">{formatCurrency(incomeStatement.expenses.salaries)}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-muted/5 rounded-2xl border border-transparent hover:border-border transition-colors">
                                            <span className="text-sm font-bold text-foreground">Other Expenses</span>
                                            <span className="text-sm font-black text-foreground">{formatCurrency(incomeStatement.expenses.other_expenses)}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-muted/5 rounded-2xl border border-transparent hover:border-border transition-colors">
                                            <span className="text-sm font-bold text-foreground">Domains & Servers</span>
                                            <span className="text-sm font-black text-foreground">{formatCurrency(incomeStatement.expenses.domains_and_servers)}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-rose-500/5 rounded-2xl border border-rose-500/20">
                                            <span className="text-sm font-black text-rose-500 uppercase tracking-widest">Total Expenses</span>
                                            <span className="text-lg font-black text-rose-500">{formatCurrency(incomeStatement.expenses.total_expenses)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Net Income */}
                                <div className="pt-4 border-t border-border mt-4">
                                    <div className={`flex items-center justify-between p-6 rounded-3xl border-2 ${incomeStatement.net_income >= 0 ? 'bg-emerald-500/10 border-emerald-500/30 shadow-lg shadow-emerald-500/10' : 'bg-rose-500/10 border-rose-500/30 shadow-lg shadow-rose-500/10'}`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-2xl text-white ${incomeStatement.net_income >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                                                <Wallet size={24} />
                                            </div>
                                            <span className={`text-sm font-black uppercase tracking-widest ${incomeStatement.net_income >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>Net Income</span>
                                        </div>
                                        <span className={`text-3xl font-black ${incomeStatement.net_income >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {formatCurrency(incomeStatement.net_income)}
                                        </span>
                                    </div>
                                </div>
                                
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportsPage;
