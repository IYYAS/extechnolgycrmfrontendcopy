import { useState, useEffect } from 'react';
import { Save, Lock } from 'lucide-react';

const UserProfile = () => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const [userData, setUserData] = useState({
        username: '',
        email: '',
        phone_number: '',
        designation: '',
        role: ''
    });

    const [passwords, setPasswords] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            setUserData({
                username: user.username || '',
                email: user.email || '',
                phone_number: user.phone_number || '',
                designation: user.designation || '',
                role: user.role || ''
            });
        }
    }, []);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setError('');

        // Validate passwords
        if (!passwords.oldPassword) {
            setError('Please enter your current password');
            return;
        }
        if (!passwords.newPassword) {
            setError('Please enter a new password');
            return;
        }
        if (passwords.newPassword.length < 6) {
            setError('New password must be at least 6 characters');
            return;
        }
        if (passwords.newPassword !== passwords.confirmPassword) {
            setError('New password and confirmation do not match');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/api/change-password/', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    old_password: passwords.oldPassword,
                    new_password: passwords.newPassword
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || data.error || 'Failed to change password');
            }

            setMessage('Password changed successfully!');
            setPasswords({
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (err: any) {
            setError(err.message || 'Failed to change password. Please check your current password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">My Profile</h1>
            </div>

            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                {/* User Information Section */}
                <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 'bold' }}>Account Information</h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Username</label>
                            <input
                                type="text"
                                className="input-field"
                                value={userData.username}
                                disabled
                                style={{ opacity: 0.6, cursor: 'not-allowed' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Email</label>
                            <input
                                type="email"
                                className="input-field"
                                value={userData.email}
                                disabled
                                style={{ opacity: 0.6, cursor: 'not-allowed' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Designation</label>
                            <input
                                type="text"
                                className="input-field"
                                value={userData.designation || '-'}
                                disabled
                                style={{ opacity: 0.6, cursor: 'not-allowed' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Phone Number</label>
                            <input
                                type="text"
                                className="input-field"
                                value={userData.phone_number || '-'}
                                disabled
                                style={{ opacity: 0.6, cursor: 'not-allowed' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Role</label>
                            <input
                                type="text"
                                className="input-field"
                                value={userData.role}
                                disabled
                                style={{ opacity: 0.6, cursor: 'not-allowed' }}
                            />
                        </div>
                    </div>

                    <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                        Your account information is read-only. Contact your administrator to make changes.
                    </p>
                </div>

                {/* Change Password Section */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Lock size={20} />
                        Change Password
                    </h2>

                    <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {message && (
                            <div style={{
                                color: 'var(--color-success)',
                                backgroundColor: 'var(--color-success-subtle)',
                                padding: '0.75rem',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem',
                                border: '1px solid var(--color-success)'
                            }}>
                                {message}
                            </div>
                        )}

                        {error && (
                            <div style={{
                                color: 'var(--color-danger)',
                                backgroundColor: 'var(--color-danger-subtle)',
                                padding: '0.75rem',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem',
                                border: '1px solid var(--color-danger)'
                            }}>
                                {error}
                            </div>
                        )}

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Current Password</label>
                            <input
                                type="password"
                                className="input-field"
                                value={passwords.oldPassword}
                                onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
                                placeholder="Enter your current password"
                                required
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>New Password</label>
                            <input
                                type="password"
                                className="input-field"
                                value={passwords.newPassword}
                                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                placeholder="Enter a new password"
                                required
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Confirm New Password</label>
                            <input
                                type="password"
                                className="input-field"
                                value={passwords.confirmPassword}
                                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                placeholder="Confirm your new password"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                            style={{ justifyContent: 'center', marginTop: '1rem' }}
                        >
                            <Save size={18} />
                            {loading ? 'Changing Password...' : 'Change Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
