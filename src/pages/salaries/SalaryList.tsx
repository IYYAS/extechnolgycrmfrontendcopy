import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSalaries, deleteSalary, type Salary } from './salaryService';
import { getUsers } from '../user/userService';
import {
    Search, Plus, Loader2, Edit2, Trash2, AlertCircle,
    ChevronLeft, ChevronRight, User, DollarSign, TrendingUp, MinusCircle,
    Filter, Calendar, UserCheck, X
} from 'lucide-react';

const SalaryList: React.FC = () => {
    const [salaries, setSalaries] = useState<Salary[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [filterEmployee, setFilterEmployee] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const navigate = useNavigate();

    const ITEMS_PER_PAGE = 10;
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    const fetchData = async (page: number = 1, search: string = '') => {
        setLoading(true);
        setError(null);
        try {
            const salaryData = await getSalaries(page, search, {
                start_date: filterStartDate,
                end_date: filterEndDate,
                employee: filterEmployee
            });
            setSalaries(salaryData.results);
            setTotalCount(salaryData.count);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to load salaries.');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const userData = await getUsers(1, '');
            setUsers(userData.results || []);
        } catch (err) {
            console.error('Failed to load users for filter', err);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => fetchData(currentPage, searchTerm), 500);
        return () => clearTimeout(timer);
    }, [searchTerm, currentPage]);

    const handleApplyFilters = () => {
        fetchData(1, searchTerm);
        setCurrentPage(1);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Delete this salary record?')) return;
        try {
            await deleteSalary(id);
            fetchData(currentPage, searchTerm);
        } catch (err: any) {
            alert(err.response?.data?.detail || 'Failed to delete.');
        }
    };

    const getUserName = (salary: Salary) => {
        return salary.employee_name || `User #${salary.employee}`;
    };

    const getStatusStyle = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'paid': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'unpaid': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
            default: return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
        }
    };

    const fmt = (val: string) => parseFloat(val || '0').toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 });
    const fmtDate = (dateStr: string) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    // Summary
    const totalBasic = salaries.reduce((a, s) => a + parseFloat(s.basic || '0'), 0);
    const paidCount = salaries.filter(s => s.status?.toLowerCase() === 'paid').length;
    const unpaidCount = salaries.filter(s => s.status?.toLowerCase() === 'unpaid').length;

    if (loading && salaries.length === 0) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <Loader2 className="animate-spin text-primary" size={48} />
            <p className="text-muted font-medium italic">Loading salary records...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 text-sm font-bold">
                    <AlertCircle size={20} />{error}
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Salaries</h1>
                    <p className="text-muted font-bold text-sm uppercase tracking-widest mt-1">Employee Payroll Management</p>
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
                    <p className="text-[10px] font-black uppercase text-muted tracking-[0.2em]">Total Basic (This View)</p>
                    <h2 className="text-3xl font-black mt-2 text-primary">₹{totalBasic.toLocaleString()}</h2>
                    <p className="text-xs text-muted font-bold mt-1">Gross payroll</p>
                </div>
                <div className="bg-card border border-border p-6 rounded-[2.5rem] shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 text-emerald-500/5 group-hover:text-emerald-500/10 transition-colors"><TrendingUp size={80} /></div>
                    <p className="text-[10px] font-black uppercase text-muted tracking-[0.2em]">Paid</p>
                    <h2 className="text-4xl font-black mt-2 text-emerald-500">{paidCount}</h2>
                    <p className="text-xs text-emerald-500 font-bold mt-1 uppercase">Records cleared</p>
                </div>
                <div className="bg-card border border-border p-6 rounded-[2.5rem] shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 text-rose-500/5 group-hover:text-rose-500/10 transition-colors"><MinusCircle size={80} /></div>
                    <p className="text-[10px] font-black uppercase text-muted tracking-[0.2em]">Unpaid</p>
                    <h2 className="text-4xl font-black mt-2 text-rose-500">{unpaidCount}</h2>
                    <p className="text-xs text-rose-500 font-bold mt-1 uppercase">Pending disbursement</p>
                </div>
            </div>

            {/* Table */}
            <div className="bg-card border border-border rounded-[3rem] shadow-sm overflow-hidden min-h-[400px]">
                <div className="p-8 border-b border-border bg-muted/5 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                            <input
                                type="text"
                                placeholder="Search by period, employee..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm"
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all border ${showFilters ? 'bg-primary text-white border-primary' : 'bg-background text-muted border-border hover:border-primary/30'}`}
                        >
                            <Filter size={18} />
                            <span>Filters</span>
                            {(filterStartDate || filterEndDate || filterEmployee) && (
                                <span className="flex items-center justify-center w-5 h-5 bg-white text-primary rounded-full text-[10px] font-black">!</span>
                            )}
                        </button>
                    </div>

                    {showFilters && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-background border border-border rounded-3xl animate-in fade-in slide-in-from-top-4 duration-300">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-muted tracking-widest flex items-center gap-2"><Calendar size={12} /> Start Date</label>
                                <input
                                    type="date"
                                    value={filterStartDate}
                                    onChange={e => setFilterStartDate(e.target.value)}
                                    className="w-full px-4 py-2 bg-muted/10 border border-border rounded-xl text-xs font-bold"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-muted tracking-widest flex items-center gap-2"><Calendar size={12} /> End Date</label>
                                <input
                                    type="date"
                                    value={filterEndDate}
                                    onChange={e => setFilterEndDate(e.target.value)}
                                    className="w-full px-4 py-2 bg-muted/10 border border-border rounded-xl text-xs font-bold"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-muted tracking-widest flex items-center gap-2"><UserCheck size={12} /> Employee</label>
                                <div className="flex gap-2">
                                    <select
                                        value={filterEmployee}
                                        onChange={e => setFilterEmployee(e.target.value)}
                                        className="w-full px-4 py-2 bg-muted/10 border border-border rounded-xl text-xs font-bold"
                                    >
                                        <option value="">All Employees</option>
                                        {users.map(u => (
                                            <option key={u.id} value={u.id}>{u.username}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={handleApplyFilters}
                                        className="px-6 py-2 bg-primary text-white font-black rounded-xl text-xs hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
                                    >
                                        Apply
                                    </button>
                                    {(filterStartDate || filterEndDate || filterEmployee) && (
                                        <button
                                            onClick={() => {
                                                setFilterStartDate('');
                                                setFilterEndDate('');
                                                setFilterEmployee('');
                                                setTimeout(() => fetchData(1, searchTerm), 10);
                                            }}
                                            className="p-2 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500/20 transition-all border border-rose-500/20"
                                            title="Clear Filters"
                                        >
                                            <X size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted/5 border-b border-border">
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-muted tracking-widest">Employee</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-muted tracking-widest">Period</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-muted tracking-widest">Attendance</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-muted tracking-widest">Basic</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-muted tracking-widest text-emerald-500">OT Pay</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-muted tracking-widest text-rose-500">Late Ded.</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-muted tracking-widest">Bonus</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-muted tracking-widest">Deductions</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-muted tracking-widest">Total</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-muted tracking-widest">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-muted tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {salaries.map(salary => (
                                <tr key={salary.id} className="hover:bg-muted/5 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-primary/10 text-primary rounded-xl"><User size={18} /></div>
                                            <div>
                                                <p className="text-sm font-black text-foreground">{getUserName(salary)}</p>
                                                <p className="text-[10px] text-muted font-bold uppercase tracking-widest mt-0.5">ID: {salary.employee}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-black text-foreground whitespace-nowrap">{fmtDate(salary.start_date)}</p>
                                        <p className="text-[10px] text-muted font-bold uppercase mt-1 tracking-tight text-primary/60">to {fmtDate(salary.end_date)}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-black text-foreground">{parseFloat(salary.present_days).toFixed(1)}</span>
                                            <span className="text-muted text-[10px] font-bold">/ {salary.working_days}</span>
                                        </div>
                                        <p className="text-[10px] text-muted font-bold uppercase mt-1 tracking-tight">Days Present</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-black text-foreground">{fmt(salary.basic)}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-bold text-emerald-500">{fmt(salary.overtime_pay)}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-bold text-rose-500">{fmt(salary.late_deduction)}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-bold text-emerald-500">+{fmt(salary.bonus)}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-bold text-rose-500">-{fmt(salary.deductions)}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-black text-primary">{fmt(salary.total_salary)}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`inline-flex items-center px-3 py-1 text-[10px] font-black rounded-full border uppercase ${getStatusStyle(salary.status)}`}>
                                            {salary.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                            <button onClick={() => navigate(`/salaries/edit/${salary.id}`)} className="p-2 hover:bg-primary/10 text-primary rounded-xl transition-colors border border-transparent hover:border-primary/20"><Edit2 size={16} /></button>
                                            <button onClick={() => handleDelete(salary.id)} className="p-2 hover:bg-rose-500/10 text-rose-500 rounded-xl transition-colors border border-transparent hover:border-rose-500/20"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {salaries.length === 0 && (
                    <div className="py-20 text-center">
                        <div className="inline-flex p-6 bg-muted/20 rounded-[2rem] text-muted mb-4"><DollarSign size={48} /></div>
                        <h3 className="text-lg font-bold text-foreground">No salary records found</h3>
                        <p className="text-muted text-sm">Try a different search or add a new salary record.</p>
                    </div>
                )}

                {totalCount > ITEMS_PER_PAGE && (
                    <div className="px-8 py-6 bg-muted/5 border-t border-border flex items-center justify-between">
                        <p className="text-xs text-muted font-bold uppercase tracking-widest">Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount}</p>
                        <div className="flex items-center gap-2">
                            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 hover:bg-primary/10 text-primary rounded-xl disabled:opacity-30 transition-all border border-border hover:border-primary/20"><ChevronLeft size={20} /></button>
                            <span className="px-4 py-2 bg-primary/5 text-primary text-sm font-black rounded-xl border border-primary/20">{currentPage} / {totalPages}</span>
                            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2 hover:bg-primary/10 text-primary rounded-xl disabled:opacity-30 transition-all border border-border hover:border-primary/20"><ChevronRight size={20} /></button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SalaryList;
