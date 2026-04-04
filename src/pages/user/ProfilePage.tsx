import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { changePassword } from './userService';
import { Briefcase, KeyRound, ShieldCheck, Loader2, Mail, Phone } from 'lucide-react';

const ProfilePage: React.FC = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const onSubmit = async (data: any) => {
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            await changePassword(data);
            setSuccess('Password updated successfully!');
            reset();
        } catch (err: any) {
            console.error('Failed to change password:', err);
            setError(err.response?.data?.detail || 'Failed to update password. Please check your current password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="flex flex-col md:flex-row gap-8">
                {/* User Info Sidebar */}
                <div className="w-full md:w-1/3 space-y-6">
                    <div className="bg-card border border-border rounded-3xl p-8 text-center shadow-xl">
                        <div className="w-24 h-24 rounded-3xl bg-primary-subtle flex items-center justify-center text-primary text-4xl font-black mx-auto mb-4 border-2 border-primary/20 shadow-inner">
                            {user.username?.charAt(0).toUpperCase()}
                        </div>
                        <h2 className="text-2xl font-bold text-foreground">{user.first_name} {user.last_name || user.username}</h2>
                        <p className="text-muted text-sm font-medium">{user.designation || 'Extechnology Member'}</p>

                        <div className="mt-8 pt-8 border-t border-border space-y-4 text-left">
                            <div className="flex items-center gap-3 text-sm text-muted">
                                <Mail size={16} className="text-primary" />
                                <span>{user.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted">
                                <Phone size={16} className="text-primary" />
                                <span>{user.phone_number || 'No phone set'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted">
                                <Briefcase size={16} className="text-primary" />
                                <span>{user.designation || 'Employee'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-primary/5 border border-primary/10 rounded-3xl p-6">
                        <div className="flex items-center gap-3 text-primary mb-2">
                            <ShieldCheck size={20} />
                            <h3 className="font-bold">Active Roles</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {user.roles?.map((role: any, idx: number) => (
                                <span key={idx} className="px-3 py-1 bg-background border border-border rounded-lg text-xs font-bold text-muted">
                                    {typeof role === 'string' ? role : role.name}
                                </span>
                            )) || 'No roles assigned'}
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="w-full md:w-2/3 space-y-8">
                    <div className="bg-card border border-border rounded-3xl shadow-xl overflow-hidden">
                        <div className="p-8 border-b border-border bg-muted/5">
                            <div className="flex items-center gap-3 text-foreground mb-1">
                                <KeyRound size={24} className="text-primary" />
                                <h2 className="text-2xl font-black tracking-tight italic">Security Settings</h2>
                            </div>
                            <p className="text-muted text-sm font-medium">Update your account password to keep it secure.</p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted uppercase tracking-widest px-1">Current Password</label>
                                    <input
                                        {...register('old_password', { required: 'Current password is required' })}
                                        type="password"
                                        placeholder="Enter your current password"
                                        className="w-full px-4 py-3.5 bg-background border border-border rounded-2xl text-foreground placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                    />
                                    {errors.old_password && <p className="text-rose-500 text-xs mt-1 px-1 font-medium">{errors.old_password.message as string}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted uppercase tracking-widest px-1">New Password</label>
                                    <input
                                        {...register('new_password', {
                                            required: 'New password is required',
                                            minLength: { value: 6, message: 'Password must be at least 6 characters' }
                                        })}
                                        type="password"
                                        placeholder="Create a strong new password"
                                        className="w-full px-4 py-3.5 bg-background border border-border rounded-2xl text-foreground placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                    />
                                    {errors.new_password && <p className="text-rose-500 text-xs mt-1 px-1 font-medium">{errors.new_password.message as string}</p>}
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-sm font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                                    <span className="text-lg">⚠️</span>
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500 text-sm font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                                    <span className="text-lg">✅</span>
                                    {success}
                                </div>
                            )}

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-bold rounded-2xl transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
                                >
                                    {loading && <Loader2 className="animate-spin" size={20} />}
                                    <span>Update Password</span>
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="bg-card border border-border rounded-3xl p-8 flex items-center justify-between shadow-sm">
                        <div className="space-y-1">
                            <h3 className="font-bold text-foreground">Account Status</h3>
                            <p className="text-muted text-sm font-medium">Your account is active and verified.</p>
                        </div>
                        <div className="flex items-center gap-2 text-primary font-bold bg-primary/10 px-4 py-2 rounded-xl">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                            Active
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
