import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:8000/api/token/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Login failed');
            }

            // Success - user data received with tokens
            if (data && data.access && data.refresh) {
                // Store tokens in localStorage
                localStorage.setItem('token', data.access);
                localStorage.setItem('refresh_token', data.refresh);
                localStorage.setItem('isLoggedIn', 'true');

                // Store complete user information including role and nested user object
                const userInfo = {
                    id: data.user?.id,
                    username: data.user?.username,
                    email: data.user?.email,
                    first_name: data.user?.first_name,
                    last_name: data.user?.last_name,
                    phone_number: data.user?.phone_number,
                    designation: data.user?.designation,
                    role: data.role,
                    is_superuser: data.is_superuser,
                    is_admin: data.is_admin,
                    user: data.user  // Store the complete nested user object
                };
                localStorage.setItem('user', JSON.stringify(userInfo));

                // Role-based redirection
                if (data.role === 'Billing') {
                    navigate('/billing');
                } else {
                    navigate('/');
                }
            } else {
                throw new Error('Invalid response format');
            }
        } catch (err: any) {
            console.error("Login error:", err.message);
            setError('Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: 'var(--color-bg)'
        }}>
            <div className="glass-panel" style={{ padding: '3rem', width: '100%', maxWidth: '400px' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '48px', height: '48px',
                        background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
                        borderRadius: '12px',
                        margin: '0 auto 1rem auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Lock color="var(--color-text-on-primary)" size={24} />
                    </div>
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Welcome Back</h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>Sign in to Extenology CRM</p>
                </div>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {error && (
                        <div style={{ color: 'var(--color-danger)', backgroundColor: 'var(--color-danger-subtle)', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.875rem', border: '1px solid var(--color-danger)' }}>
                            {error}
                        </div>
                    )}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Username</label>
                        <input
                            type="text"
                            className="input-field"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Password</label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="input-field"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{ paddingRight: '2.5rem', width: '100%' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '0.75rem',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '0.25rem'
                                }}
                            >
                                {showPassword ? (
                                    <EyeOff size={20} style={{ color: 'var(--color-text-muted)' }} />
                                ) : (
                                    <Eye size={20} style={{ color: 'var(--color-text-muted)' }} />
                                )}
                            </button>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ justifyContent: 'center', marginTop: '1rem', padding: '0.75rem', opacity: isLoading ? 0.7 : 1 }}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
