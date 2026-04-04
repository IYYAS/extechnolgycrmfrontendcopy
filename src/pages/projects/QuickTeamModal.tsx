import React, { useState, useEffect } from 'react';
import {
    Loader2,
    Save,
    Users,
    UserCircle,
    Search,
    Check,
    AlertCircle,
    X
} from 'lucide-react';
import { createTeam, type Team } from '../teams/teamService';
import { getUsers, type User } from '../user/userService';

interface QuickTeamModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (newTeam: Team) => void;
}

const QuickTeamModal: React.FC<QuickTeamModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<Partial<Team>>({
        name: '',
        team_lead: null,
        members: []
    });

    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [userSearch, setUserSearch] = useState('');

    useEffect(() => {
        if (isOpen) {
            const loadUsers = async () => {
                try {
                    setLoading(true);
                    const usersResponse = await getUsers(1, '');
                    setAllUsers(usersResponse.results || []);
                } catch (err: any) {
                    console.error('Failed to load users:', err);
                    setError('Failed to load users.');
                } finally {
                    setLoading(false);
                }
            };
            loadUsers();
        } else {
            // Reset form when modal closes
            setFormData({
                name: '',
                team_lead: null,
                members: []
            });
            setError(null);
            setUserSearch('');
        }
    }, [isOpen]);

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
            const response = await createTeam(formData);
            onSuccess(response);
            onClose();
        } catch (err: any) {
            console.error('Failed to save team:', err);
            setError(err.response?.data?.detail || 'Failed to save team.');
        } finally {
            setSaving(false);
        }
    };

    const filteredUsers = allUsers.filter(u => 
        u.username?.toLowerCase().includes(userSearch.toLowerCase()) ||
        (`${u.first_name || ''} ${u.last_name || ''}`).toLowerCase().includes(userSearch.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-background/80 backdrop-blur-md animate-in fade-in duration-300" 
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-card border border-border w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-8 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                            <Users size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight italic">Quick Team Creation</h2>
                            <p className="text-[10px] font-bold text-muted uppercase tracking-widest mt-0.5">Define a new operational unit on the fly</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-muted/20 rounded-xl text-muted transition-all"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 pt-6">
                    {error && (
                        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 text-sm font-bold">
                            <AlertCircle size={20} />
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                        {/* Basic Config */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-muted tracking-widest block">Team Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Tactical Design Unit"
                                        className="w-full bg-muted/20 border border-border rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-muted tracking-widest block">Team Lead</label>
                                    <select
                                        value={formData.team_lead || ''}
                                        onChange={e => setFormData({ ...formData, team_lead: e.target.value ? parseInt(e.target.value) : null })}
                                        className="w-full bg-muted/20 border border-border rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none"
                                    >
                                        <option value="">Select Command Lead...</option>
                                        {allUsers.map(u => (
                                            <option key={u.id} value={u.id}>
                                                {u.first_name || u.last_name ? `${u.first_name} ${u.last_name}` : u.username} (@{u.username})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="p-6 bg-primary/5 border border-primary/10 rounded-3xl space-y-4">
                                <h4 className="text-xs font-black uppercase text-primary tracking-widest">Enlistment Status</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-bold text-muted uppercase">
                                        <span>Selected Members</span>
                                        <span>{formData.members?.length || 0}</span>
                                    </div>
                                    <div className="h-1 bg-primary/20 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-primary transition-all duration-500" 
                                            style={{ width: `${Math.min(100, (formData.members?.length || 0) * 10)}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Member Grid */}
                        <div className="lg:col-span-3 flex flex-col gap-4">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search commanders..."
                                    value={userSearch}
                                    onChange={e => setUserSearch(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-muted/20 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-bold text-sm"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {loading ? (
                                    <div className="col-span-2 py-10 flex flex-col items-center justify-center text-muted">
                                        <Loader2 className="animate-spin mb-2" size={24} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Loading Commanders...</span>
                                    </div>
                                ) : filteredUsers.map((user) => {
                                    const isSelected = formData.members?.includes(user.id);
                                    return (
                                        <button
                                            key={user.id}
                                            type="button"
                                            onClick={() => handleMemberToggle(user.id)}
                                            className={`flex items-center justify-between p-3 rounded-2xl transition-all border text-left group
                                                ${isSelected 
                                                    ? 'bg-primary/10 border-primary/30' 
                                                    : 'bg-muted/5 border-border hover:border-primary/20 hover:bg-muted/10'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-1.5 rounded-lg
                                                    ${isSelected ? 'bg-primary text-white' : 'bg-muted/20 text-muted'}
                                                `}>
                                                    <UserCircle size={14} />
                                                </div>
                                                <div className="leading-tight">
                                                    <p className="text-xs font-black text-foreground">{user.first_name || user.username}</p>
                                                    <p className="text-[9px] font-bold text-muted uppercase">@{user.username}</p>
                                                </div>
                                            </div>
                                            {isSelected && <Check size={14} className="text-primary" />}
                                        </button>
                                    );
                                })}

                                {!loading && filteredUsers.length === 0 && (
                                    <div className="col-span-2 py-10 text-center opacity-50">
                                        <p className="text-[10px] font-bold uppercase">No commanders found</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-border bg-muted/5 flex items-center justify-end gap-4">
                    <button 
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 text-sm font-bold text-muted hover:text-foreground transition-all"
                    >
                        Abort
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={saving || !formData.name}
                        className="flex items-center gap-2 px-10 py-3 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        <span>Establish Team</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuickTeamModal;
