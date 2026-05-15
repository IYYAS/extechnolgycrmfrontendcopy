import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers, deleteUser, getDesignations, getRoles, type Role, type User } from './userService';
import { Edit2, Trash2, UserPlus, Search, Loader2, Eye, FileBarChart, Calendar } from 'lucide-react';
import Pagination from '../../components/Pagination';

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

const UserList: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [designationFilter, setDesignationFilter] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [roles, setRoles] = useState<Role[]>([]);
    const [designations, setDesignations] = useState<string[]>([]);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const ITEMS_PER_PAGE = 10;

    const fetchUsers = async (p: number = 1) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getUsers(
                p, 
                searchTerm, 
                designationFilter, 
                roleFilter, 
                statusFilter, 
                startDate, 
                endDate
            );
            setUsers(data.results);
            setTotalCount(data.count);
        } catch (error: any) {
            console.error('Failed to fetch users:', error);
            setError(error.response?.data?.detail || 'Failed to load user directory. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [rolesData, designationsData] = await Promise.all([
                    getRoles(),
                    getDesignations()
                ]);
                setRoles(rolesData);
                setDesignations(designationsData);
            } catch (err) {
                console.error('Failed to fetch initial data', err);
            }
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setPage(1);
            fetchUsers(1);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, designationFilter, roleFilter, statusFilter, startDate, endDate]);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        fetchUsers(newPage);
    };

    const handleAdd = () => navigate('/users/new');
    const handleEdit = (u: User) => navigate(`/users/edit/${u.id}`);
    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await deleteUser(id);
                fetchUsers(page);
            } catch (error) {
                console.error('Failed to delete user:', error);
            }
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">User Management</h1>
                    <p className="text-muted mt-1">Manage, monitor, and update your team members.</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center space-x-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary/20"
                >
                    <UserPlus size={20} />
                    <span>Add New User</span>
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-card border border-border rounded-2xl">
                    <p className="text-muted text-xs font-semibold uppercase tracking-wider">Total Users</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{totalCount}</p>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center space-x-3 text-rose-500">
                        <span className="text-xl">⚠️</span>
                        <p className="font-medium">{error}</p>
                    </div>
                    <button
                        onClick={() => fetchUsers(page)}
                        className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-sm font-semibold rounded-xl transition-all border border-rose-500/20"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* Table */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-border space-y-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="relative flex-1 min-w-[240px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            />
                        </div>
                        
                        <FilterDropdown
                            label="All Designations"
                            value={designationFilter}
                            options={designations.map(d => ({ label: d.charAt(0).toUpperCase() + d.slice(1), value: d }))}
                            onChange={setDesignationFilter}
                            icon={<FileBarChart size={16} />}
                        />

                        <FilterDropdown
                            label="All Roles"
                            value={roleFilter}
                            options={roles.map(r => ({ label: r.name, value: r.name }))}
                            onChange={setRoleFilter}
                            icon={<Eye size={16} />}
                        />

                        <FilterDropdown
                            label="All Status"
                            value={statusFilter}
                            options={[
                                { label: 'Active', value: 'active' },
                                { label: 'Inactive', value: 'inactive' }
                            ]}
                            onChange={setStatusFilter}
                            icon={<Loader2 size={16} />}
                            align="right"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-4 pt-2">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/10 rounded-lg border border-border">
                                <Calendar size={12} className="text-muted" />
                                <span className="text-[10px] font-bold text-muted uppercase tracking-tighter">Join Date Range</span>
                            </div>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="px-3 py-1.5 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            />
                            <span className="text-muted text-xs font-bold">TO</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="px-3 py-1.5 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            />
                        </div>
                        
                        {(searchTerm || designationFilter || roleFilter || statusFilter || startDate || endDate) && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setDesignationFilter('');
                                    setRoleFilter('');
                                    setStatusFilter('');
                                    setStartDate('');
                                    setEndDate('');
                                }}
                                className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors"
                            >
                                Clear All Filters
                            </button>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted/5 text-muted text-xs font-semibold uppercase tracking-wider">
                                <th className="px-6 py-4">#</th>
                                <th className="px-6 py-4">User ID</th>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Designation</th>
                                <th className="px-6 py-4">Roles</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Created Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-muted">
                                        <div className="flex flex-col items-center space-y-3">
                                            <Loader2 className="animate-spin text-primary" size={32} />
                                            <p>Loading user directory...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : users.length > 0 ? (
                                users.map((u, index) => (
                                    <tr key={u.id} className="group hover:bg-muted/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="w-8 h-8 rounded-lg bg-muted/20 flex items-center justify-center text-[10px] font-black text-muted group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                                {String((page - 1) * ITEMS_PER_PAGE + index + 1).padStart(2, '0')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-black text-primary/80 uppercase tracking-tighter bg-primary/5 px-2 py-1 rounded-md border border-primary/10">
                                                USR-{u.id.toString().padStart(4, '0')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-xl bg-primary-subtle flex items-center justify-center text-primary font-bold border border-primary/20 overflow-hidden">
                                                    {u.profile_pic ? (
                                                        <img src={u.profile_pic} alt="Profile" className="w-full h-full object-cover" />
                                                    ) : (
                                                        u?.username?.charAt(0)?.toUpperCase() || '?'
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-foreground font-medium">{u?.first_name} {u?.last_name || u?.username || ''}</p>
                                                    <p className="text-muted text-sm">{u?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-foreground/80">
                                            {u.designation || 'Not set'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1.5">
                                                {u.role ? (
                                                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold border border-primary/20">
                                                        {u.role.name}
                                                    </span>
                                                ) : (
                                                    (u?.roles || []).map(role => (
                                                        <span key={role.id} className="px-2 py-0.5 rounded-full bg-muted/10 text-muted text-[10px] font-bold border border-border">
                                                            {role.name}
                                                        </span>
                                                    ))
                                                )}
                                                {!u.role && (!u.roles || u.roles.length === 0) && (
                                                    <span className="text-muted text-[10px] italic">No roles</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="flex items-center space-x-1.5 text-primary text-xs font-medium">
                                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                                                <span>Active</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-muted text-sm">
                                            {u.date_joined ? new Date(u.date_joined).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end space-x-1">
                                                <button
                                                    onClick={() => handleEdit(u)}
                                                    className="p-2 text-muted hover:text-primary hover:bg-primary-subtle rounded-lg transition-all"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/users/${u.id}`)}
                                                    className="p-2 text-muted hover:text-primary hover:bg-primary-subtle rounded-lg transition-all"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/employees/${u.id}/activities`)}
                                                    className="p-2 text-muted hover:text-indigo-500 hover:bg-indigo-500/10 rounded-lg transition-all"
                                                    title="View Activities"
                                                >
                                                    <FileBarChart size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(u.id)}
                                                    className="p-2 text-muted hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-muted">
                                        No users found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            <div className="px-6 pb-10">
                <Pagination 
                    currentPage={page}
                    totalPages={Math.ceil(totalCount / ITEMS_PER_PAGE)}
                    totalCount={totalCount}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={handlePageChange}
                    itemName="users"
                />
            </div>
        </div>
    );
};

export default UserList;
