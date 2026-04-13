import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTeams, deleteTeam, type Team } from './teamService';
import {
    Search,
    Plus,
    Loader2,
    Edit2,
    Trash2,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Users,
    UserCircle,
    Layers
} from 'lucide-react';

const TeamList: React.FC = () => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const ITEMS_PER_PAGE = 10;
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    const fetchTeamsData = async (page: number = 1, search: string = '') => {
        setLoading(true);
        setError(null);
        try {
            const data = await getTeams(page, search);
            setTeams(data.results);
            setTotalCount(data.count);
        } catch (err: any) {
            console.error('Failed to fetch teams:', err);
            setError(err.response?.data?.detail || 'Failed to load teams.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchTeamsData(currentPage, searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, currentPage]);

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this team?')) return;
        try {
            await deleteTeam(id);
            fetchTeamsData(currentPage, searchTerm);
        } catch (err: any) {
            alert(err.response?.data?.detail || 'Failed to delete team.');
        }
    };

    if (loading && teams.length === 0) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <Loader2 className="animate-spin text-primary" size={48} />
            <p className="text-muted font-medium italic">Loading teams...</p>
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
                    <h1 className="text-4xl font-black tracking-tighter text-foreground bg-gradient-to-r from-blue-500 to-indigo-400 bg-clip-text text-transparent italic">Project Teams</h1>
                    <p className="text-muted font-bold text-sm uppercase tracking-widest mt-1">Manage team groups and memberships</p>
                </div>
                <button onClick={() => navigate('/teams/new')} className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white font-black rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all hover:scale-[1.02] active:scale-95">
                    <Plus size={20} strokeWidth={3} />
                    <span>New Team</span>
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card border border-border p-6 rounded-[2.5rem] shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 text-blue-500/5 group-hover:text-blue-500/10 transition-colors"><Layers size={80} /></div>
                    <p className="text-[10px] font-black uppercase text-muted tracking-[0.2em]">Total Teams</p>
                    <h2 className="text-4xl font-black mt-2 text-blue-500">{totalCount}</h2>
                    <p className="text-xs text-muted font-bold mt-1 uppercase">Active team groups</p>
                </div>
                <div className="bg-card border border-border p-6 rounded-[2.5rem] shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 text-emerald-500/5 group-hover:text-emerald-500/10 transition-colors"><Users size={80} /></div>
                    <p className="text-[10px] font-black uppercase text-muted tracking-[0.2em]">Total Members</p>
                    <h2 className="text-4xl font-black mt-2 text-emerald-500">{teams.reduce((acc, t) => acc + (t.members?.length || 0), 0)}</h2>
                    <p className="text-xs text-muted font-bold mt-1 uppercase">Assigned to current view</p>
                </div>
            </div>

            {/* Filter & Content */}
            <div className="bg-card border border-border rounded-[3rem] shadow-sm overflow-hidden min-h-[400px]">
                <div className="p-8 border-b border-border bg-muted/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                        <input
                            type="text"
                            placeholder="Search teams by name..."
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
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-muted tracking-widest">Team Group</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-muted tracking-widest">Team Lead</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-muted tracking-widest text-center">Members</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-muted tracking-widest text-center">Created At</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-muted tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {teams.map((team) => (
                                <tr key={team.id} className="hover:bg-muted/5 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                                <Layers size={18} />
                                            </div>
                                            <p className="text-sm font-black text-foreground">{team.name}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <UserCircle size={14} className="text-muted" />
                                            <p className="text-sm font-bold text-foreground">{team.team_lead_name || 'No Lead Assigned'}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className="inline-flex px-3 py-1 bg-blue-500/10 text-blue-500 text-xs font-black rounded-lg uppercase tracking-wider">
                                            {team.members?.length || 0} Members
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <p className="text-xs font-bold text-muted">
                                            {team.created_at ? new Date(team.created_at).toLocaleDateString('en-GB') : '-'}
                                        </p>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                            <button onClick={() => navigate(`/teams/edit/${team.id}`)} className="p-2 hover:bg-blue-500/10 text-blue-500 rounded-xl transition-colors border border-transparent hover:border-blue-500/20"><Edit2 size={16} /></button>
                                            <button onClick={() => handleDelete(team.id)} className="p-2 hover:bg-rose-500/10 text-rose-500 rounded-xl transition-colors border border-transparent hover:border-rose-500/20"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {teams.length === 0 && (
                    <div className="py-20 text-center">
                        <div className="inline-flex p-6 bg-muted/20 rounded-[2rem] text-muted mb-4"><Users size={48} /></div>
                        <h3 className="text-lg font-bold text-foreground">No teams found</h3>
                        <p className="text-muted text-sm max-w-xs mx-auto italic">Create your first team group to start assigning them to projects.</p>
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
                                className="p-2 hover:bg-blue-500/10 text-blue-500 rounded-xl disabled:opacity-30 transition-all border border-border hover:border-blue-500/20"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <span className="px-4 py-2 bg-blue-500/5 text-blue-500 text-sm font-black rounded-xl border border-blue-500/20">{currentPage} / {totalPages}</span>
                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(p => p + 1)}
                                className="p-2 hover:bg-blue-500/10 text-blue-500 rounded-xl disabled:opacity-30 transition-all border border-border hover:border-blue-500/20"
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

export default TeamList;
