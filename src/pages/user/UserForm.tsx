import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { X, Loader2, User as UserIcon, Mail, Phone, Briefcase, ShieldCheck, KeyRound, Plus } from 'lucide-react';
import type { User, Role } from '../login/auth';
import { createUser, updateUser, getUser, adminChangePassword, getRoles, createRole } from './userService';

interface UserFormProps {
    // Props are now optional as we use URL params
    user?: User;
    onClose?: () => void;
    onSuccess?: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user: initialUser, onSuccess }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<User | undefined>(initialUser);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(!!id && !initialUser);
    const [error, setError] = useState<string | null>(null);
    const [pwdLoading, setPwdLoading] = useState(false);
    const [pwdError, setPwdError] = useState<string | null>(null);
    const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);
    const [newAdminPassword, setNewAdminPassword] = useState('');
    const [newRoleName, setNewRoleName] = useState('');
    const [roleLoading, setRoleLoading] = useState(false);
    const isEdit = !!id || !!initialUser;
    const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
    const isSuperAdmin = loggedInUser.is_superuser || loggedInUser.roles?.some((role: any) =>
        typeof role === 'string' ? role === 'SuperAdmin' : role.name === 'SuperAdmin'
    );

    const { register, handleSubmit, setValue, watch, reset } = useForm<any>({
        defaultValues: {
            role_id: null
        }
    });

    useEffect(() => {
        if (id && !initialUser) {
            const fetchUser = async () => {
                setFetching(true);
                try {
                    const data = await getUser(parseInt(id));
                    setUser(data);
                    reset({
                        username: data.username,
                        email: data.email,
                        first_name: data.first_name,
                        last_name: data.last_name,
                        phone_number: data.phone_number || '',
                        designation: data.designation || '',
                        role_id: data.role?.id || null
                    } as any);
                } catch (error) {
                    console.error('Failed to fetch user for editing:', error);
                    navigate('/users');
                } finally {
                    setFetching(false);
                }
            };
            fetchUser();
        } else if (initialUser) {
            reset({
                username: initialUser.username,
                email: initialUser.email,
                first_name: initialUser.first_name,
                last_name: initialUser.last_name,
                phone_number: initialUser.phone_number || '',
                designation: initialUser.designation || '',
                role_id: initialUser.role?.id || null
            } as any);
        }
    }, [id, initialUser, reset, navigate]);
    const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
    const selectedRoleId = watch('role_id');

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const data = await getRoles();
                setAvailableRoles(data);
            } catch (err) {
                console.error('Failed to fetch roles:', err);
                setAvailableRoles([
                    { id: 1, name: 'SuperAdmin' },
                    { id: 2, name: 'Admin' },
                    { id: 3, name: 'Billing' },
                    { id: 4, name: 'TeamHead' }
                ]);
            }
        };
        fetchRoles();
    }, []);

    const onSubmit = async (data: any) => {
        setLoading(true);
        setError(null);
        try {
            if (isEdit && user) {
                await updateUser(user.id, data);
            } else {
                await createUser({ ...data, password: 'defaultPassword123' });
            }
            if (onSuccess) onSuccess();
            navigate('/users');
        } catch (error: any) {
            console.error('Failed to save user:', error);

            let message = 'An unexpected error occurred.';
            if (error.response) {
                const serverError = error.response.data;
                if (typeof serverError === 'string' && !serverError.includes('<!DOCTYPE html>')) {
                    message = serverError;
                } else if (serverError.detail) {
                    message = serverError.detail;
                } else if (typeof serverError === 'object') {
                    const errors = Object.entries(serverError).map(([field, msgs]) => {
                        const label = field.charAt(0).toUpperCase() + field.slice(1);
                        const cleanMsgs = Array.isArray(msgs) ? msgs.join(' ') : msgs;
                        return `${label}: ${cleanMsgs}`;
                    });
                    if (errors.length > 0) {
                        message = errors.join(' | ');
                    }
                }
            }
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddRole = async () => {
        if (!newRoleName.trim()) return;
        setRoleLoading(true);
        try {
            const createdRole = await createRole(newRoleName.trim());
            setAvailableRoles(prev => [...prev, createdRole]);
            setValue('role_id', createdRole.id);
            setNewRoleName('');
        } catch (err) {
            console.error('Failed to create role:', err);
            setError('Failed to create role. It might already exist.');
        } finally {
            setRoleLoading(false);
        }
    };

    const toggleRole = (roleId: number) => {
        setValue('role_id', selectedRoleId === roleId ? null : roleId);
    };

    const handleAdminPasswordChange = async () => {
        if (!id || !newAdminPassword) return;
        setPwdLoading(true);
        setPwdError(null);
        setPwdSuccess(null);
        try {
            await adminChangePassword(parseInt(id), { new_password: newAdminPassword });
            setPwdSuccess('User password updated successfully!');
            setNewAdminPassword('');
        } catch (err: any) {
            console.error('Failed to update user password:', err);
            setPwdError(err.response?.data?.detail || 'Failed to update password.');
        } finally {
            setLoading(false);
            setPwdLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
                <Loader2 className="animate-spin text-primary" size={40} />
                <p className="text-muted">Loading user details...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="bg-card border border-border rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl animate-in zoom-in duration-500">
                <div className="p-8 border-b border-border bg-muted/5 flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-foreground tracking-tight">
                            {isEdit ? 'Edit User Profile' : 'Create New User'}
                        </h2>
                        <p className="text-muted mt-1 text-sm font-medium">
                            {isEdit ? 'Update user details and access levels' : 'Add a new member to your organization'}
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/users')}
                        className="p-3 text-muted hover:text-foreground hover:bg-muted/10 rounded-2xl transition-all"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Form Fields */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted uppercase tracking-widest px-1">Username</label>
                                <div className="relative group">
                                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={18} />
                                    <input
                                        {...register('username', { required: true })}
                                        className="w-full pl-12 pr-4 py-3.5 bg-background border border-border rounded-2xl text-foreground placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                        placeholder="Enter username"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted uppercase tracking-widest px-1">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={18} />
                                    <input
                                        {...register('email', { required: true })}
                                        type="email"
                                        className="w-full pl-12 pr-4 py-3.5 bg-background border border-border rounded-2xl text-foreground placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                        placeholder="john.doe@example.com"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted uppercase tracking-widest px-1">First Name</label>
                                    <input
                                        {...register('first_name')}
                                        className="w-full px-4 py-3.5 bg-background border border-border rounded-2xl text-foreground placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                        placeholder="John"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted uppercase tracking-widest px-1">Last Name</label>
                                    <input
                                        {...register('last_name')}
                                        className="w-full px-4 py-3.5 bg-background border border-border rounded-2xl text-foreground placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted uppercase tracking-widest px-1">Phone Number</label>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={18} />
                                    <input
                                        {...register('phone_number')}
                                        className="w-full pl-12 pr-4 py-3.5 bg-background border border-border rounded-2xl text-foreground placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                        placeholder="+1 234 567 8900"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted uppercase tracking-widest px-1">Designation</label>
                                <div className="relative group">
                                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={18} />
                                    <input
                                        {...register('designation')}
                                        className="w-full pl-12 pr-4 py-3.5 bg-background border border-border rounded-2xl text-foreground placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                        placeholder="Lead Developer"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-bold text-muted uppercase tracking-widest px-1 flex items-center gap-2">
                                    <ShieldCheck size={14} className="text-primary" />
                                    Assign Roles
                                </label>
                                <div className="flex flex-wrap gap-2 p-4 bg-background border border-border rounded-2xl">
                                    {availableRoles.map((role) => (
                                        <button
                                            key={role.id}
                                            type="button"
                                            onClick={() => toggleRole(role.id)}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedRoleId === role.id
                                                ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105'
                                                : 'bg-muted/5 text-muted hover:bg-muted/10 border border-border'
                                                }`}
                                        >
                                            {role.name}
                                        </button>
                                    ))}
                                    
                                    <div className="flex items-center gap-2 mt-2 w-full">
                                        <input
                                            type="text"
                                            value={newRoleName}
                                            onChange={(e) => setNewRoleName(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleAddRole();
                                                }
                                            }}
                                            placeholder="New Role..."
                                            className="flex-1 px-3 py-2 bg-muted/5 border border-border rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddRole}
                                            disabled={roleLoading || !newRoleName.trim()}
                                            className="p-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl transition-all disabled:opacity-50"
                                            title="Add New Role"
                                        >
                                            {roleLoading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-sm font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
                            <span className="text-lg">⚠️</span>
                            {error}
                        </div>
                    )}

                    <div className="pt-8 border-t border-border flex items-center justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => navigate('/users')}
                            className="px-6 py-3 text-muted font-bold hover:text-foreground hover:bg-muted/10 rounded-2xl transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3.5 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all shadow-xl shadow-primary/20 flex items-center space-x-2"
                        >
                            {loading && <Loader2 className="animate-spin" size={18} />}
                            <span>{isEdit ? 'Update User' : 'Create User'}</span>
                        </button>
                    </div>
                </form>

                {isEdit && isSuperAdmin && (
                    <div className="mt-8 bg-card border border-border rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-top-8 duration-700">
                        <div className="p-8 border-b border-border bg-rose-500/5">
                            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                                <KeyRound size={20} className="text-rose-500" />
                                Admin Password Reset
                            </h3>
                            <p className="text-muted text-sm mt-1">Force update this user's password. The user will need this new password for their next login.</p>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1 space-y-2">
                                    <label className="text-xs font-bold text-muted uppercase tracking-widest px-1">New Password</label>
                                    <input
                                        type="password"
                                        value={newAdminPassword}
                                        onChange={(e) => setNewAdminPassword(e.target.value)}
                                        placeholder="Enter new password"
                                        className="w-full px-4 py-3.5 bg-background border border-border rounded-2xl text-foreground placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all font-medium"
                                    />
                                </div>
                                <div className="sm:self-end">
                                    <button
                                        type="button"
                                        onClick={handleAdminPasswordChange}
                                        disabled={pwdLoading || !newAdminPassword}
                                        className="h-[52px] px-8 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-bold rounded-2xl transition-all shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2"
                                    >
                                        {pwdLoading ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
                                        Update Password
                                    </button>
                                </div>
                            </div>

                            {pwdError && (
                                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-sm font-medium flex items-center gap-3">
                                    <span className="text-lg">⚠️</span>
                                    {pwdError}
                                </div>
                            )}

                            {pwdSuccess && (
                                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500 text-sm font-medium flex items-center gap-3">
                                    <span className="text-lg">✅</span>
                                    {pwdSuccess}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserForm;
