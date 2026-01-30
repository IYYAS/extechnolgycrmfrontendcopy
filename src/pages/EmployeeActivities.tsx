import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getEmployeeActivities, getEmployee } from '../api/services';
import type { EmployeeDailyActivity, Employee } from '../types';

const EmployeeActivities = () => {
    const { id } = useParams<{ id: string }>();
    const [activities, setActivities] = useState<EmployeeDailyActivity[]>([]);
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            if (!id) return;
            try {
                const [activitiesData, employeeData] = await Promise.all([
                    getEmployeeActivities(Number(id)),
                    getEmployee(Number(id))
                ]);
                setActivities(activitiesData);
                setEmployee(employeeData);
            } catch (error) {
                console.error("Failed to load employee activities", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    if (loading) return <p>Loading...</p>;

    return (
        <div style={{ padding: '2rem' }}>
            <h1 className="page-title">
                Activities for {employee ? employee.name : `Employee #${id}`}
            </h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                {activities.length === 0 ? (
                    <p>No activities found.</p>
                ) : (
                    activities.map(activity => (
                        <div key={activity.id} style={{
                            padding: '1.5rem',
                            backgroundColor: 'var(--color-surface)',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px solid var(--color-border)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.75rem'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>
                                    {activity.project_name || 'No Project'}
                                </h3>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{
                                        color: 'var(--color-text-primary)',
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        display: 'block'
                                    }}>
                                        {new Date(activity.date).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            {activity.role && (
                                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                                    <span style={{ fontWeight: 500 }}>Role:</span> {activity.role}
                                </p>
                            )}

                            <div style={{
                                backgroundColor: 'var(--color-background)',
                                padding: '1rem',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '0.95rem'
                            }}>
                                <div style={{
                                    fontSize: '0.75rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    color: 'var(--color-text-muted)',
                                    marginBottom: '0.5rem',
                                    fontWeight: 600
                                }}>
                                    Work Contribution
                                </div>
                                {activity.description}
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '0.5rem',
                                marginTop: '0.25rem',
                                paddingTop: '0.75rem',
                                borderTop: '1px solid var(--color-border)',
                                fontSize: '0.75rem',
                                color: 'var(--color-text-muted)'
                            }}>
                                {activity.project_start_date && (
                                    <div>
                                        <span style={{ fontWeight: 600 }}>Project Start:</span> {new Date(activity.project_start_date).toLocaleDateString()}
                                    </div>
                                )}
                                <div>
                                    <span style={{ fontWeight: 600 }}>Created:</span> {new Date(activity.created_at).toLocaleString()}
                                </div>
                                <div>
                                    <span style={{ fontWeight: 600 }}>Last Updated:</span> {new Date(activity.updated_at).toLocaleString()}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default EmployeeActivities;
