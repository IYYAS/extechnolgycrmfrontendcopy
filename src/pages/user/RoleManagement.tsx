import React, { useState, useEffect } from 'react';
import { api } from '../../api/api';
import { motion } from 'framer-motion';
import { Shield, ChevronRight, CheckCircle2, Plus, X, Search } from 'lucide-react';

interface Role {
    id: number;
    name: string;
    permissions: string[];
}

const RoleManagement: React.FC = () => {
    const [permissions, setPermissions] = useState<string[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [selectedRole, setSelectedRole] = useState<string>('');
    const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [permRes, roleRes] = await Promise.all([
                api.get('/permissions/'),
                api.get('/roles/')
            ]);
            setPermissions(permRes.data);
            // Assuming /roles/ returns detailed roles with nested permission names
            const rolesData = roleRes.data.results || roleRes.data;
            setRoles(rolesData);
        } catch (error) {
            console.error('Failed to fetch RBAC data', error);
        }
    };

    const handleTogglePermission = (perm: string) => {
        setSelectedPermissions(prev => 
            prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
        );
    };

    const handleDelete = async () => {
        if (!selectedRoleId || !window.confirm(`Are you sure you want to delete the role "${selectedRole}"?`)) return;

        setIsSubmitting(true);
        setMessage(null);
        try {
            await api.delete(`/roles/${selectedRoleId}/`);
            setMessage({ type: 'success', text: `Role ${selectedRole} deleted successfully!` });
            setSelectedRole('');
            setSelectedRoleId(null);
            setSelectedPermissions([]);
            fetchData();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to delete role' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRole) return;

        setIsSubmitting(true);
        setMessage(null);
        try {
            await api.post('/roles/create/', {
                name: selectedRole.toUpperCase(),
                permissions: selectedPermissions
            });
            setMessage({ type: 'success', text: `Role ${selectedRole} saved successfully!` });
            fetchData();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to save role' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-8">
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                        <Shield size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-foreground tracking-tight">Role Management</h1>
                        <p className="text-sm text-slate-500 font-medium">Configure dynamic access control for your team</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Role List */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
                        <div className="p-4 border-b border-border bg-muted/5 flex items-center justify-between">
                            <h2 className="text-xs font-black uppercase tracking-widest text-slate-500">Existing Roles</h2>
                            <span className="bg-indigo-500/10 text-indigo-500 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                {roles.length}
                            </span>
                        </div>
                        <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
                            {roles.map((r: any) => (
                                <button
                                    key={r.id}
                                    onClick={() => {
                                        setSelectedRoleId(r.id);
                                        setSelectedRole(r.name);
                                        setSelectedPermissions(r.permissions?.map((p: any) => p.codename || p) || []);
                                    }}
                                    className={`w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-all text-left ${selectedRoleId === r.id ? 'bg-indigo-500/5' : ''}`}
                                >
                                    <div>
                                        <p className={`text-sm font-black uppercase ${selectedRoleId === r.id ? 'text-indigo-500' : 'text-foreground'}`}>{r.name}</p>
                                        <p className="text-[10px] font-bold text-slate-500 mt-0.5">{r.permissions?.length || 0} permissions</p>
                                    </div>
                                    <ChevronRight size={16} className={selectedRoleId === r.id ? 'text-indigo-500' : 'text-slate-400'} />
                                </button>
                            ))}
                            <button 
                                onClick={() => { setSelectedRole(''); setSelectedRoleId(null); setSelectedPermissions([]); }}
                                className="w-full p-4 flex items-center gap-2 text-indigo-500 hover:bg-indigo-500/5 transition-all outline-none"
                            >
                                <Plus size={16} />
                                <span className="text-xs font-black uppercase">Create New Role</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Permission Editor */}
                <div className="lg:col-span-2 space-y-6">
                    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-3xl pointer-events-none" />
                        
                        <div className="space-y-6 relative">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Role Name</label>
                                <input 
                                    type="text"
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    placeholder="e.g. MANAGER, SUPPORT_LEAD"
                                    className="bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all uppercase"
                                    required
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Assign Permissions</label>
                                    <div className="flex gap-2">
                                        <button 
                                            type="button" 
                                            onClick={() => setSelectedPermissions(permissions)}
                                            className="text-[9px] font-black text-indigo-400 hover:underline uppercase"
                                        >
                                            Select All
                                        </button>
                                        <span className="text-slate-800">/</span>
                                        <button 
                                            type="button" 
                                            onClick={() => setSelectedPermissions([])}
                                            className="text-[9px] font-black text-rose-400 hover:underline uppercase"
                                        >
                                            Clear All
                                        </button>
                                    </div>
                                </div>

                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                    <input
                                        type="text"
                                        placeholder="Search permissions..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 bg-muted/20 border border-border/50 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all font-medium"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {permissions.filter(p => p.toLowerCase().includes(searchQuery.toLowerCase())).map((perm) => (
                                        <button
                                            type="button"
                                            key={perm}
                                            onClick={() => handleTogglePermission(perm)}
                                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left group ${
                                                selectedPermissions.includes(perm)
                                                    ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-500'
                                                    : 'bg-muted/20 border-border/50 text-slate-500 hover:border-indigo-500/30'
                                            }`}
                                        >
                                            <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                                                selectedPermissions.includes(perm) ? 'bg-indigo-500 text-white' : 'bg-muted border border-border'
                                            }`}>
                                                {selectedPermissions.includes(perm) && <CheckCircle2 size={12} />}
                                            </div>
                                            <span className="text-[11px] font-bold font-mono tracking-tight break-all">{perm}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-6 flex flex-wrap items-center justify-between border-t border-border gap-4">
                                <p className="text-[10px] font-bold text-slate-500 uppercase">
                                    {selectedPermissions.length} Permissions Selected
                                </p>
                                <div className="flex items-center gap-3">
                                    {selectedRoleId && (
                                        <button
                                            type="button"
                                            onClick={handleDelete}
                                            disabled={isSubmitting}
                                            className="px-6 py-3 bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white disabled:opacity-50 text-xs font-black uppercase rounded-xl transition-all"
                                        >
                                            {isSubmitting ? 'Deleting...' : 'Delete Role'}
                                        </button>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !selectedRole}
                                        className="px-8 py-3 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-xs font-black uppercase rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
                                    >
                                        {isSubmitting ? 'Saving...' : 'Save Role Configuration'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {message && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`mt-6 p-4 rounded-xl flex items-center gap-3 ${
                                    message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                                }`}
                            >
                                {message.type === 'success' ? <CheckCircle2 size={18} /> : <X size={18} />}
                                <p className="text-xs font-bold">{message.text}</p>
                            </motion.div>
                        )}
                    </form>
                </div>
            </div>
            
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default RoleManagement;
