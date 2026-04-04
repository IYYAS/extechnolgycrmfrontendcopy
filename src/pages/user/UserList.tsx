import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers, deleteUser } from './userService';
import type { User } from '../login/auth';
import { Edit2, Trash2, UserPlus, Search, Loader2, Eye, FileBarChart } from 'lucide-react';

const UserList: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const ITEMS_PER_PAGE = 10;
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    const fetchUsers = async (page: number = 1, search: string = '') => {
        setLoading(true);
        setError(null);
        try {
            const data = await getUsers(page, search);
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
        const delayDebounceFn = setTimeout(() => {
            if (currentPage !== 1) {
                setCurrentPage(1);
            } else {
                fetchUsers(1, searchTerm);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    useEffect(() => {
        fetchUsers(currentPage, searchTerm);
    }, [currentPage]);

    const handleAdd = () => navigate('/users/new');
    const handleEdit = (u: User) => navigate(`/users/edit/${u.id}`);
    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await deleteUser(id);
                fetchUsers(currentPage, searchTerm);
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
                        onClick={() => fetchUsers(currentPage, searchTerm)}
                        className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-sm font-semibold rounded-xl transition-all border border-rose-500/20"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* Table */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-border flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted/5 text-muted text-xs font-semibold uppercase tracking-wider">
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Designation</th>
                                <th className="px-6 py-4">Roles</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted">
                                        <div className="flex flex-col items-center space-y-3">
                                            <Loader2 className="animate-spin text-primary" size={32} />
                                            <p>Loading user directory...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : users.length > 0 ? (
                                users.map((u) => (
                                    <tr key={u.id} className="group hover:bg-muted/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-xl bg-primary-subtle flex items-center justify-center text-primary font-bold border border-primary/20">
                                                    {u?.username?.charAt(0)?.toUpperCase() || '?'}
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
                                                {(u?.roles || []).map(role => (
                                                    <span key={role.id} className="px-2 py-0.5 rounded-full bg-muted/10 text-muted text-[10px] font-bold border border-border">
                                                        {role.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="flex items-center space-x-1.5 text-primary text-xs font-medium">
                                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                                                <span>Active</span>
                                            </span>
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
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted">
                                        No users found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {!loading && totalCount > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4">
                    <p className="text-muted text-sm">
                        Showing <span className="text-foreground font-medium">{Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, totalCount)}</span> to{' '}
                        <span className="text-foreground font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, totalCount)}</span> of{' '}
                        <span className="text-foreground font-medium">{totalCount}</span> results
                    </p>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${currentPage === 1
                                    ? 'bg-muted/5 border-border text-muted/50 cursor-not-allowed'
                                    : 'bg-card border-border text-foreground hover:bg-muted/10'
                                }`}
                        >
                            Previous
                        </button>
                        <div className="flex items-center space-x-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                                .map((page, index, array) => (
                                    <React.Fragment key={page}>
                                        {index > 0 && array[index - 1] !== page - 1 && (
                                            <span className="text-muted px-1">...</span>
                                        )}
                                        <button
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${currentPage === page
                                                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                                    : 'bg-card text-muted hover:bg-muted/10 hover:text-primary border border-border'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    </React.Fragment>
                                ))}
                        </div>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${currentPage === totalPages
                                    ? 'bg-muted/5 border-border text-muted/50 cursor-not-allowed'
                                    : 'bg-card border-border text-foreground hover:bg-muted/10'
                                }`}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserList;
