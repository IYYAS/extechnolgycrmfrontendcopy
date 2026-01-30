import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createUser, updateUser, getUser } from '../api/services';

import { ArrowLeft, Save, Eye, EyeOff } from 'lucide-react';

const UserForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    // If editing (id exists), we are fetching. If adding, not fetching.
    const [fetching, setFetching] = useState(!!id);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phone_number: '',
        designation: '',
        role: 'Developer',
        password: ''
    });

    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const loadUser = async () => {
            if (id) {
                try {
                    // Fetch all users and find the one we need (since we don't have getUserById yet)
                    // Fetch specific user
                    const user = await getUser(Number(id));

                    if (user) {
                        setFormData({
                            username: user.username,
                            email: user.email,
                            phone_number: user.phone_number,
                            designation: user.designation,
                            role: user.role,
                            password: '' // Don't populate password
                        });
                    }
                } catch (error) {
                    console.error("Failed to load user", error);
                    alert("Failed to load user details.");
                    navigate('/users');
                } finally {
                    setFetching(false);
                }
            } else {
                setFetching(false);
            }
        };
        loadUser();
    }, [id, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (id) {
                // Remove password from update payload if it's empty (assuming backend handles this)
                // If backend requires password always, this needs adjustment. 
                // Based on Users.tsx logic: "Don't populate password on edit" implies it might be optional or handled separately.
                // But AddUser sends it. I'll send it if providing a new one, else maybe omit?
                // For now, I'll pass formData as is. If password is empty string, hopefully backend ignores or handles it.
                // However, Users.tsx Modal edit didn't have password field populated.

                // Let's assume standard behavior: update what's changed.
                await updateUser(Number(id), formData);
            } else {
                await createUser(formData);
            }
            navigate('/users');
        } catch (error) {
            console.error("Failed to save user", error);
            alert("Failed to save user. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div style={{ padding: '2rem' }}>Loading...</div>;

    return (
        <div>
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        onClick={() => navigate('/users')}
                        className="btn"
                        style={{ padding: '0.5rem', background: 'var(--color-bg)' }}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="page-title">{id ? 'Edit User' : 'Add New User'}</h1>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Username</label>
                            <input
                                type="text"
                                className="input-field"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                                placeholder="jdoe"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Email</label>
                            <input
                                type="email"
                                className="input-field"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                placeholder="john@example.com"
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="input-field"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required // Always required now
                                    placeholder="••••••••"
                                    style={{ paddingRight: '2.5rem' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '0.75rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--color-text-muted)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: 0
                                    }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Phone Number</label>
                            <input
                                type="text"
                                className="input-field"
                                value={formData.phone_number}
                                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                placeholder="+1 234 567 8900"
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Designation</label>
                            <input
                                type="text"
                                className="input-field"
                                value={formData.designation}
                                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                placeholder="Software Engineer"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Role</label>
                            <select
                                className="input-field"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            >
                                <option value="Developer">Developer</option>
                                <option value="Admin">Admin</option>
                                <option value="SuperAdmin">SuperAdmin</option>
                                <option value="Billing">Billing</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                        <button
                            type="button"
                            className="btn"
                            onClick={() => navigate('/users')}
                            style={{ background: 'transparent', border: '1px solid var(--color-border-light)' }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                            style={{ minWidth: '120px', justifyContent: 'center' }}
                        >
                            {loading ? 'Saving...' : (
                                <>
                                    <Save size={18} />
                                    {id ? 'Save Changes' : 'Create User'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserForm;
