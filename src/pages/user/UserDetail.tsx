import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUser } from './userService';
import type { User } from '../login/auth';
import { ArrowLeft, Mail, Phone, Shield, Calendar, User as UserIcon, Loader2, Edit2 } from 'lucide-react';
import UserForm from './UserForm';

const UserDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);

    console.log('UserDetail: Rendering for ID', id, 'User state:', user);

    const fetchUser = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const data = await getUser(parseInt(id));
            setUser(data);
        } catch (error) {
            console.error('Failed to fetch user:', error);
            navigate('/users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, [id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
                <Loader2 className="animate-spin text-emerald-500" size={40} />
                <p className="text-slate-400">Loading user profile...</p>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500 pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/users')}
                    className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Back to Users</span>
                </button>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="flex items-center space-x-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-semibold transition-all"
                >
                    <Edit2 size={18} />
                    <span>Edit Profile</span>
                </button>
            </div>

            {/* Profile Overview Card */}
            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-md">
                <div className="h-32 bg-gradient-to-r from-emerald-600/20 to-blue-600/20 px-8 flex items-end">
                    <div className="translate-y-12 flex items-end space-x-6">
                        <div className="w-32 h-32 rounded-3xl bg-slate-900 border-4 border-slate-950 flex items-center justify-center text-emerald-500 font-bold text-4xl shadow-2xl">
                            {user?.username?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="mb-4">
                            <h1 className="text-3xl font-bold text-white tracking-tight">{user?.first_name} {user?.last_name || user?.username || ''}</h1>
                            <p className="text-emerald-400 font-medium">{user?.designation || 'Team Member'}</p>
                        </div>
                    </div>
                </div>

                <div className="pt-20 px-8 pb-10 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Contact Info */}
                    <div className="col-span-1 space-y-6">
                        <h2 className="text-slate-500 text-xs font-bold uppercase tracking-widest border-b border-white/5 pb-2">Contact Details</h2>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3 text-slate-300">
                                <Mail size={18} className="text-slate-500" />
                                <span className="text-sm">{user.email}</span>
                            </div>
                            <div className="flex items-center space-x-3 text-slate-300">
                                <Phone size={18} className="text-slate-500" />
                                <span className="text-sm">{user.phone_number || 'No phone provided'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Middle Column: Roles & Access */}
                    <div className="col-span-1 space-y-6">
                        <h2 className="text-slate-500 text-xs font-bold uppercase tracking-widest border-b border-white/5 pb-2">Permissions & Roles</h2>
                        <div className="flex flex-wrap gap-2">
                            {(user?.roles || []).map(role => (
                                <div key={role.id} className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                                    <Shield size={12} />
                                    <span>{role.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Meta Info */}
                    <div className="col-span-1 space-y-6">
                        <h2 className="text-slate-500 text-xs font-bold uppercase tracking-widest border-b border-white/5 pb-2">Account Meta</h2>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3 text-slate-300">
                                <UserIcon size={18} className="text-slate-500" />
                                <span className="text-sm">@{user?.username || 'unknown'}</span>
                            </div>
                            <div className="flex items-center space-x-3 text-slate-300">
                                <Calendar size={18} className="text-slate-500" />
                                <span className="text-sm italic">Member since Feb 2024</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Sections (Placeholder) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-8 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                    <h3 className="text-lg font-bold text-white">Recent Activity</h3>
                    <div className="space-y-4">
                        {[1, 2].map(i => (
                            <div key={i} className="flex items-start space-x-3 text-sm">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shadow-lg shadow-emerald-500/50"></div>
                                <div className="space-y-1">
                                    <p className="text-slate-300">Updated project status for "CRM Upgrade"</p>
                                    <p className="text-slate-500 text-xs text-secondary-text">2 hours ago</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="p-8 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                    <h3 className="text-lg font-bold text-white">Project Assignments</h3>
                    <div className="flex flex-wrap gap-2">
                        {['Sales', 'Marketing', 'CRM'].map(tag => (
                            <span key={tag} className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 text-xs font-medium border border-white/5">
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {isFormOpen && (
                <UserForm
                    user={user}
                    onClose={() => setIsFormOpen(false)}
                    onSuccess={() => {
                        setIsFormOpen(false);
                        fetchUser();
                    }}
                />
            )}
        </div>
    );
};

export default UserDetail;
