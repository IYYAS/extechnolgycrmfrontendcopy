import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getTeam, createTeam, updateTeam, type Team } from './teamService';
import { getUsers, type User } from '../user/userService';
import {
    Loader2,
    Save,
    ArrowLeft,
    Users,
    BadgeCheck,
    ChevronDown,
    AlertCircle,
    Search,
    Check
} from 'lucide-react';
import { api } from '../../api/api';
import SearchableUserSelect from '../../components/SearchableUserSelect';

const TeamForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<Partial<Team>>({
        name: '',
        team_lead: null,
        members: []
    });

    const [users, setUsers] = useState<User[]>([]);
    const [preloadedUsers, setPreloadedUsers] = useState<User[]>([]);
    const [userSearch, setUserSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    
    const pageRef = useRef(1);
    const loadingRef = useRef(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(userSearch);
        }, 300);
        return () => clearTimeout(timer);
    }, [userSearch]);

    const loadUsers = async (pageNum: number, searchStr: string, reset: boolean) => {
        if (loadingRef.current && !reset) return;
        loadingRef.current = true;
        if (!reset) setLoadingMore(true);

        try {
            const response = await getUsers(pageNum, searchStr);
            const newUsers = response.results || [];
            
            setUsers(prev => {
                let combined;
                if (reset) {
                    combined = [...preloadedUsers, ...newUsers];
                    pageRef.current = 1;
                } else {
                    combined = [...prev, ...newUsers];
                    pageRef.current = pageNum;
                }
                
                // Remove duplicates by ID
                const seen = new Set();
                return combined.filter(u => {
                    if (u.id && !seen.has(u.id)) {
                        seen.add(u.id);
                        return true;
                    }
                    return false;
                });
            });
            
            setHasMore(!!response.next);

            // AUTO-FILL CHECK: If the container isn't full yet, and we have more, load next page
            setTimeout(() => {
                if (scrollContainerRef.current) {
                    const { scrollHeight, clientHeight } = scrollContainerRef.current;
                    if (scrollHeight <= clientHeight + 10 && !!response.next && !loadingRef.current) {
                        loadUsers(pageNum + 1, searchStr, false);
                    }
                }
            }, 100);

        } catch (err) {
            console.error('Failed to load users:', err);
        } finally {
            loadingRef.current = false;
            setLoadingMore(false);
        }
    };

    // Load on mount and on search
    useEffect(() => {
        loadUsers(1, debouncedSearch, true);
    }, [debouncedSearch]);

    useEffect(() => {
        const loadInitialTeam = async () => {
            if (isEdit) {
                try {
                    const teamData = await getTeam(parseInt(id!));
                    setFormData({
                        name: teamData.name,
                        team_lead: teamData.team_lead,
                        members: teamData.members || []
                    });

                    // Fetch details of selected members and lead to ensure they are in the list
                    const memberIds = teamData.members || [];
                    const leadId = teamData.team_lead;
                    const allTargetIds = Array.from(new Set([...memberIds, ...(leadId ? [leadId] : [])]));
                    
                    if (allTargetIds.length > 0) {
                        const detailPromises = allTargetIds.map(uid => api.get<User>(`/users/${uid}/`).then((r: any) => r.data).catch(() => null));
                        const details = (await Promise.all(detailPromises)).filter(Boolean) as User[];
                        setPreloadedUsers(details);
                        setUsers(prev => {
                            const combined = [...details, ...prev];
                            const seen = new Set();
                            return combined.filter(u => {
                                if (u.id && !seen.has(u.id)) {
                                    seen.add(u.id);
                                    return true;
                                }
                                return false;
                            });
                        });
                    }

                } catch (err: any) {
                    console.error('Failed to load team:', err);
                    setError('Failed to load team data.');
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        loadInitialTeam();
    }, [id, isEdit]);

    // Keep users synced with preloaded ones if we reset
    useEffect(() => {
        if (debouncedSearch === '') {
            setUsers(prev => {
                const combined = [...preloadedUsers, ...prev];
                const seen = new Set();
                return combined.filter(u => {
                    if (u.id && !seen.has(u.id)) {
                        seen.add(u.id);
                        return true;
                    }
                    return false;
                });
            });
        }
    }, [preloadedUsers, debouncedSearch]);

    const handleMemberToggle = (userId: number) => {
        setFormData(prev => {
            const currentMembers = prev.members || [];
            if (currentMembers.includes(userId)) {
                return { ...prev, members: currentMembers.filter(mid => mid !== userId) };
            } else {
                return { ...prev, members: [...currentMembers, userId] };
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) {
            setError('Team name is required.');
            return;
        }

        setSaving(true);
        setError(null);
        try {
            if (isEdit) {
                await updateTeam(parseInt(id!), formData);
            } else {
                await createTeam(formData);
            }
            navigate('/teams');
        } catch (err: any) {
            console.error('Failed to save team:', err);
            setError(err.response?.data?.detail || 'Failed to save team.');
        } finally {
            setSaving(false);
        }
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight + 50 && hasMore && !loadingRef.current) {
            loadUsers(pageRef.current + 1, debouncedSearch, false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <Loader2 className="animate-spin text-primary" size={48} />
            <p className="text-muted font-medium italic">Preparing form...</p>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/teams')}
                        className="p-3 rounded-2xl bg-muted/20 hover:bg-muted/40 text-muted transition-all"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter text-foreground bg-gradient-to-r from-blue-500 to-indigo-400 bg-clip-text text-transparent italic">
                            {isEdit ? 'Configure Team' : 'Establish New Team'}
                        </h1>
                        <p className="text-muted font-bold text-sm uppercase tracking-widest mt-1">
                            {isEdit ? `Editing details for ${formData.name}` : 'Define team structure and leadership'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="flex items-center gap-2 px-8 py-3 bg-blue-500 text-white font-black rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                >
                    {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    <span>{isEdit ? 'Update Team' : 'Commit Team'}</span>
                </button>
            </div>

            {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 text-sm font-bold animate-in shake duration-300">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Basic Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-card border border-border p-8 rounded-[3rem] shadow-sm space-y-6">
                        <div className="p-4 bg-blue-500/5 rounded-3xl inline-flex text-blue-500 mb-2">
                            <Users size={32} />
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase text-muted tracking-widest mb-1.5 block">Team Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Tactical Design Group"
                                    className="w-full bg-muted/20 border border-border rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-muted tracking-widest mb-1.5 block">Team Lead</label>
                                <SearchableUserSelect
                                    value={formData.team_lead ?? null}
                                    onChange={val => setFormData({ ...formData, team_lead: val })}
                                    placeholder="Select Command Lead..."
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-500 p-8 rounded-[3rem] shadow-xl text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 text-white/10 group-hover:text-white/20 transition-all"><BadgeCheck size={100} /></div>
                        <h4 className="text-lg font-black italic relative z-10">Team Summary</h4>
                        <div className="mt-4 space-y-2 relative z-10">
                            <div className="flex justify-between text-xs font-bold opacity-80 uppercase">
                                <span>Members Assigned</span>
                                <span>{formData.members?.length || 0}</span>
                            </div>
                            <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-white transition-all duration-500" 
                                    style={{ width: `${Math.min(100, (formData.members?.length || 0) * 10)}%` }}
                                />
                            </div>
                            <p className="text-[10px] italic opacity-70">Define groups to enable bulk assignment in project workflows.</p>
                        </div>
                    </div>
                </div>

                {/* Member Selection */}
                <div className="lg:col-span-2">
                    <div className="bg-card border border-border rounded-[3rem] shadow-sm overflow-hidden flex flex-col h-full min-h-[500px]">
                        <div className="p-8 border-b border-border bg-muted/5">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-black text-foreground italic">Enlist Members</h3>
                                    <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Select collaborators for this operational unit</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-black text-blue-500">{formData.members?.length || 0}</span>
                                    <p className="text-[10px] font-bold text-muted uppercase">Selected</p>
                                </div>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                                <input
                                    type="text"
                                    placeholder="Quick search by name or username..."
                                    value={userSearch}
                                    onChange={e => setUserSearch(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm"
                                />
                            </div>
                        </div>

                        <div 
                            ref={scrollContainerRef}
                            onScroll={handleScroll}
                            className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-3 content-start custom-scrollbar max-h-[500px]"
                        >
                            {users.map((user) => {
                                const isSelected = formData.members?.includes(user.id);
                                return (
                                    <button
                                        key={user.id}
                                        type="button"
                                        onClick={() => handleMemberToggle(user.id)}
                                        className={`flex items-center justify-between p-4 rounded-2xl transition-all border text-left group
                                            ${isSelected 
                                                ? 'bg-blue-500/10 border-blue-500/30' 
                                                : 'bg-muted/5 border-border hover:border-blue-500/20 hover:bg-muted/10'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs transition-all flex-shrink-0
                                                ${isSelected ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-muted/20 text-muted group-hover:bg-blue-500/20 group-hover:text-blue-500'}
                                            `}>
                                                {user.profile_pic ? (
                                                    <img src={user.profile_pic} alt="" className="w-full h-full rounded-full object-cover" />
                                                ) : (
                                                    (user.first_name?.[0] || user.username?.[0] || 'U').toUpperCase()
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className={`text-sm font-bold truncate ${isSelected ? 'text-blue-500' : 'text-foreground'}`}>
                                                    {user.first_name || user.last_name ? `${user.first_name} ${user.last_name}` : user.username}
                                                </p>
                                                <div className="flex items-center gap-1.5 truncate">
                                                    <p className="text-[10px] text-muted truncate">@{user.username}</p>
                                                    {user.designation && (
                                                        <>
                                                            <span className="w-0.5 h-0.5 rounded-full bg-muted/30" />
                                                            <p className="text-[9px] font-black text-blue-500/60 uppercase truncate">{user.designation}</p>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all border flex-shrink-0
                                            ${isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'border-border text-transparent'}
                                        `}>
                                            <Check size={14} />
                                        </div>
                                    </button>
                                );
                            })}
                            
                            {hasMore && !loadingMore && users.length > 0 && (
                                <div className="col-span-full py-6 flex flex-col items-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] italic">Scroll for more</p>
                                    <ChevronDown size={14} className="animate-bounce" />
                                </div>
                            )}

                            {loadingMore && (
                                <div className="col-span-full py-4 flex justify-center">
                                    <Loader2 className="animate-spin text-blue-500" size={24} />
                                </div>
                            )}

                            {users.length === 0 && !loadingRef.current && (
                                <div className="col-span-full py-20 text-center opacity-50">
                                    <Search size={32} className="mx-auto mb-2 text-muted" />
                                    <p className="text-sm font-bold">No commanders match your search</p>
                                </div>
                            )}
                        </div>
                        
                        <div className="p-6 bg-muted/5 border-t border-border flex items-center justify-center gap-2">
                             <p className="text-[10px] font-black italic text-muted uppercase">Selection updates are staged until save.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamForm;
