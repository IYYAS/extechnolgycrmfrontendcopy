import React, { useState, useEffect } from 'react';
import {
    X,
    Users,
    UserCircle,
    Search,
    Check,
    Loader2,
    Save,
    AlertCircle
} from 'lucide-react';
import { createTeam, type Team } from './teamService';
import { getUsers, type User } from '../user/userService';

interface QuickTeamModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (newTeam: any) => void;
}

const QuickTeamModal: React.FC<QuickTeamModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [saving, setSaving] = useState(false);
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
                    const res = await getUsers(1, '');
                    setAllUsers(res.results || []);
                } catch (err) {
                    console.error('Failed to load users:', err);
                }
            };
            loadUsers();
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
            const newTeam = await createTeam(formData);
            onSuccess(newTeam);
        } catch (err: any) {
            console.error('Failed to create team:', err);
            setError(err.response?.data?.detail || 'Failed to create team.');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    const filteredUsers = allUsers.filter(u => 
        u.username?.toLowerCase().includes(userSearch.toLowerCase()) ||
        (`${u.first_name || ''} ${u.last_name || ''}`).toLowerCase().includes(userSearch.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-card w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-border overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-muted/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                            <Users size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black italic tracking-tight">Quick Team Creation</h2>
                            <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Establish a new unit immediately</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-muted/20 text-muted transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    {error && (
                        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 text-xs font-bold">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-muted tracking-widest block">Team Name</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., UI Squad"
                                className="w-full bg-muted/20 border border-border rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-muted tracking-widest block">Team Lead</label>
                            <select
                                value={formData.team_lead || ''}
                                onChange={e => setFormData({ ...formData, team_lead: e.target.value ? parseInt(e.target.value) : null })}
                                className="w-full bg-muted/20 border border-border rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                            >
                                <option value="">Select Lead...</option>
                                {allUsers.map(u => (
                                    <option key={u.id} value={u.id}>
                                        {u.first_name || u.last_name ? `${u.first_name} ${u.last_name}` : u.username}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black uppercase text-muted tracking-widest mb-1.5 block">Select Members</label>
                            <span className="text-[10px] font-bold bg-primary text-white px-2 py-0.5 rounded-full">{formData.members?.length || 0} Selected</span>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
                            <input
                                type="text"
                                placeholder="Search employees..."
                                value={userSearch}
                                onChange={e => setUserSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 transition-all font-medium text-xs"
                            />
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto p-1">
                            {filteredUsers.map((user) => {
                                const isSelected = formData.members?.includes(user.id);
                                return (
                                    <button
                                        key={user.id}
                                        type="button"
                                        onClick={() => handleMemberToggle(user.id)}
                                        className={`flex items-center justify-between p-3 rounded-xl transition-all border text-left
                                            ${isSelected 
                                                ? 'bg-primary/10 border-primary/30' 
                                                : 'bg-muted/5 border-border hover:border-primary/20'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <div className={`p-1.5 rounded-lg transition-all
                                                ${isSelected ? 'bg-primary text-white' : 'bg-muted/20 text-muted'}
                                            `}>
                                                <UserCircle size={14} />
                                            </div>
                                            <div className="truncate">
                                                <p className="text-xs font-black truncate">
                                                    {user.first_name || user.last_name ? `${user.first_name} ${user.last_name}` : user.username}
                                                </p>
                                            </div>
                                        </div>
                                        {isSelected && <Check size={12} className="text-primary" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </form>

                <div className="p-6 border-t border-border bg-muted/5 flex items-center justify-end gap-3">
                    <button 
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 bg-muted/20 text-muted text-xs font-bold rounded-xl hover:bg-muted/30 transition-all font-bold"
                    >
                        Cancel
                    </button>
                    <button 
                        type="button"
                        onClick={handleSubmit}
                        disabled={saving}
                        className="flex items-center gap-2 px-8 py-2.5 bg-primary text-white font-black rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95 disabled:opacity-50 text-xs"
                    >
                        {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        Save Team
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuickTeamModal;
