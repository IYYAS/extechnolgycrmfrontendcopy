import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { LogIn, Lock, User as UserIcon, Loader2, Sun, Moon } from 'lucide-react';
import { login } from './auth';
import { useTheme, type AccentColor } from '../../context/ThemeContext';

const LoginPage: React.FC = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { mode, toggleMode, accentColor, setAccentColor } = useTheme();

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await login(data.username, data.password);
            localStorage.setItem('access_token', response.access);
            localStorage.setItem('refresh_token', response.refresh);
            
            // Store comprehensive user data
            const userData = {
                ...response.user,
                is_superuser: response.is_superuser,
                role: response.role
            };
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('user_role', response.role || '');
            localStorage.setItem('permissions', JSON.stringify(response.permissions || []));
            
            navigate('/welcome');
        } catch (error: any) {
            console.error('Login failed:', error);
            let message = 'Login failed. Please check your credentials.';

            if (error.response) {
                const serverError = error.response.data;
                if (typeof serverError === 'string' && !serverError.includes('<!DOCTYPE html>')) {
                    message = serverError;
                } else if (serverError.detail) {
                    message = serverError.detail;
                } else if (serverError.non_field_errors) {
                    message = Array.isArray(serverError.non_field_errors)
                        ? serverError.non_field_errors.join(' ')
                        : serverError.non_field_errors;
                } else if (typeof serverError === 'object') {
                    const fieldErrors = Object.entries(serverError).map(([field, msgs]) => {
                        const label = field.charAt(0).toUpperCase() + field.slice(1);
                        const cleanMsgs = Array.isArray(msgs) ? msgs.join(' ') : msgs;
                        return `${label}: ${cleanMsgs}`;
                    });
                    if (fieldErrors.length > 0) {
                        message = fieldErrors.join(' | ');
                    }
                }
            } else if (error.request) {
                message = 'Network error: No response from server. Please check your connection.';
            } else {
                message = error.message;
            }
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground transition-colors duration-300 p-4 overflow-hidden relative">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-20">
                <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/20 blur-[120px] rounded-full animate-pulse"></div>
                <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-primary/20 blur-[120px] rounded-full animate-pulse [animation-delay:2s]"></div>
            </div>

            {/* Theme Toggle - Floating */}
            <div className="absolute top-8 right-8 flex items-center gap-3 bg-card border border-border p-2 rounded-2xl shadow-xl backdrop-blur-md animate-in slide-in-from-top-4 duration-700">
                <button
                    onClick={toggleMode}
                    className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all"
                >
                    {mode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <div className="flex gap-1.5 px-2 border-l border-border">
                    {(['green', 'red', 'blue', 'purple'] as AccentColor[]).map((color) => (
                        <button
                            key={color}
                            onClick={() => setAccentColor(color)}
                            className={`w-5 h-5 rounded-full border-2 transition-all ${accentColor === color ? 'border-foreground scale-110' : 'border-transparent opacity-50'
                                }`}
                            style={{
                                backgroundColor: color === 'green' ? '#10b981' :
                                    color === 'red' ? '#ef4444' :
                                        color === 'blue' ? '#3b82f6' : '#a855f7'
                            }}
                        />
                    ))}
                </div>
            </div>

            <div className="w-full max-w-md">
                <div className="bg-card backdrop-blur-xl border border-border rounded-3xl shadow-2xl overflow-hidden p-10 space-y-10 animate-in fade-in zoom-in duration-500">
                    <div className="text-center space-y-3">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary-subtle text-primary mb-2 shadow-inner">
                            <LogIn size={40} />
                        </div>
                        <h1 className="text-4xl font-black text-foreground tracking-tight italic">Extechnology</h1>
                        <p className="text-muted font-medium">Please enter your details to sign in</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted group-focus-within:text-primary transition-colors">
                                        <UserIcon size={20} />
                                    </div>
                                    <input
                                        {...register('username', { required: 'Username is required' })}
                                        type="text"
                                        placeholder="Username"
                                        className="block w-full pl-12 pr-4 py-4 bg-background border border-border rounded-2xl text-foreground placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-medium"
                                    />
                                </div>
                                {errors.username && <p className="text-sm text-rose-500 px-2">{errors.username.message as string}</p>}
                            </div>

                            <div className="space-y-1">
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted group-focus-within:text-primary transition-colors">
                                        <Lock size={20} />
                                    </div>
                                    <input
                                        {...register('password', { required: 'Password is required' })}
                                        type="password"
                                        placeholder="Password"
                                        className="block w-full pl-12 pr-4 py-4 bg-background border border-border rounded-2xl text-foreground placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-medium"
                                    />
                                </div>
                                {errors.password && <p className="text-sm text-rose-500 px-2">{errors.password.message as string}</p>}
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm font-medium text-center animate-in shake duration-300">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 px-6 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all shadow-xl shadow-primary/20 flex items-center justify-center space-x-3 scale-100 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin" size={24} />
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                <span>Sign In</span>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-muted text-sm font-medium">
                        Don't have an account? <a href="#" className="text-primary hover:text-primary-hover font-bold transition-colors">Contact management</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
