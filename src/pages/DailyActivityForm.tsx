import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createDailyActivity, updateDailyActivity, getDailyActivities, getProjects } from '../api/services';
import type { Project } from '../types';

const DailyActivityForm = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;


    const [projects, setProjects] = useState<Project[]>([]);

    // Store IDs in formData
    const [formData, setFormData] = useState({
        employee: '',
        project: '',
        project_start_date: '',
        role: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });

    // Store display text for inputs

    const [projectInput, setProjectInput] = useState('');

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);



    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await getProjects();
                setProjects(response.results);

                // Get logged-in user's ID from localStorage
                const userStr = localStorage.getItem('user');
                const userData = userStr ? JSON.parse(userStr) : null;
                const loggedInUserId = userData?.user?.id || userData?.id;

                if (isEditMode) {
                    const activities = await getDailyActivities();
                    const activity = activities.find(a => a.id === Number(id));
                    if (activity) {
                        setFormData({
                            employee: activity.employee?.toString() || '',
                            project: activity.project?.toString() || '',
                            project_start_date: activity.project_start_date || '',
                            role: activity.role || '',
                            description: activity.description,
                            date: activity.date
                        });

                        // Set initial display values


                        if (activity.project) {
                            const proj = response.results.find(p => p.id === activity.project);
                            if (proj) setProjectInput(proj.name);
                        }
                    }
                } else {
                    // For new activity, set the logged-in user as employee
                    if (loggedInUserId) {
                        setFormData(prev => ({
                            ...prev,
                            employee: loggedInUserId.toString()
                        }));
                    }
                }
            } catch (error) {
                console.error("Failed to load data", error);
            } finally {
                setInitialLoading(false);
            }
        };
        loadData();
    }, [id, isEditMode]);



    const handleProjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setProjectInput(value);

        const match = projects.find(proj => proj.name === value);
        setFormData(prev => ({
            ...prev,
            project: match ? match.id.toString() : '',
            project_start_date: match?.start_date || prev.project_start_date
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();





        setLoading(true);

        const data = {
            ...formData,
            project_name: projectInput,
            employee: formData.employee ? Number(formData.employee) : undefined,
            project: formData.project ? Number(formData.project) : null
        };

        try {
            if (isEditMode) {
                await updateDailyActivity(Number(id), data);
            } else {
                await createDailyActivity(data);
            }
            navigate('/daily-activities');
        } catch (error) {
            console.error("Failed to save activity", error);
            alert("Failed to save activity");
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) return <p>Loading...</p>;

    return (
        <div style={{ width: '100%' }}>
            <div className="page-header">
                <h1 className="page-title">{isEditMode ? 'Edit Activity' : 'Add Activity'}</h1>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>



                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 500 }}>Project</label>
                    <input
                        list="project-list"
                        type="text"
                        value={projectInput}
                        onChange={handleProjectChange}
                        placeholder="Type to search project..."
                        style={{
                            padding: '0.75rem',
                            borderRadius: '0.375rem',
                            border: '1px solid var(--color-border)',
                            backgroundColor: 'var(--color-bg)',
                            color: 'var(--color-text)'
                        }}
                    />
                    <datalist id="project-list">
                        {projects.map(proj => (
                            <option key={proj.id} value={proj.name} />
                        ))}
                    </datalist>
                </div>


                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 500 }}>Project Start Date</label>
                    <input
                        type="date"
                        value={formData.project_start_date}
                        onChange={(e) => setFormData({ ...formData, project_start_date: e.target.value })}
                        style={{
                            padding: '0.75rem',
                            borderRadius: '0.375rem',
                            border: '1px solid var(--color-border)',
                            backgroundColor: 'var(--color-bg)',
                            color: 'var(--color-text)'
                        }}
                    />
                </div>


                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 500 }}>Role</label>
                    <input
                        type="text"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        placeholder="Enter role (optional)"
                        style={{
                            padding: '0.75rem',
                            borderRadius: '0.375rem',
                            border: '1px solid var(--color-border)',
                            backgroundColor: 'var(--color-bg)',
                            color: 'var(--color-text)'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 500 }}>Date</label>
                    <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                        style={{
                            padding: '0.75rem',
                            borderRadius: '0.375rem',
                            border: '1px solid var(--color-border)',
                            backgroundColor: 'var(--color-bg)',
                            color: 'var(--color-text)'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 500 }}>Description</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                        rows={4}
                        style={{
                            padding: '0.75rem',
                            borderRadius: '0.375rem',
                            border: '1px solid var(--color-border)',
                            backgroundColor: 'var(--color-bg)',
                            color: 'var(--color-text)',
                            resize: 'vertical'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button
                        type="button"
                        onClick={() => navigate('/daily-activities')}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            borderRadius: '0.375rem',
                            border: '1px solid var(--color-border)',
                            backgroundColor: 'transparent',
                            color: 'var(--color-text)',
                            cursor: 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            borderRadius: '0.375rem',
                            border: 'none',
                            backgroundColor: 'var(--color-primary)',
                            color: 'var(--color-text-on-primary)',
                            fontWeight: 500,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Saving...' : 'Save Activity'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default DailyActivityForm;
