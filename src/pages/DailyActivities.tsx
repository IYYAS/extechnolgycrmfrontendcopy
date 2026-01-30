import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDailyActivities, deleteDailyActivity } from '../api/services';
import type { EmployeeDailyActivity } from '../types';
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/Table';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const DailyActivities = () => {
    const navigate = useNavigate();
    const [activities, setActivities] = useState<EmployeeDailyActivity[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchActivities = async () => {
        try {
            const data = await getDailyActivities();
            setActivities(data);
        } catch (error) {
            console.error("Failed to fetch activities", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivities();
    }, []);

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this activity?')) {
            try {
                await deleteDailyActivity(id);
                setActivities(activities.filter(a => a.id !== id));
            } catch (error) {
                console.error("Failed to delete activity", error);
            }
        }
    };

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 className="page-title">Daily Activities</h1>
                <button
                    className="btn btn-primary"
                    onClick={() => navigate('/daily-activities/add')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        backgroundColor: 'var(--color-primary)',
                        color: 'var(--color-text-on-primary)',
                        border: 'none',
                        borderRadius: '0.375rem',
                        cursor: 'pointer'
                    }}
                >
                    <Plus size={18} />
                    Add Activity
                </button>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <Table>
                    <Thead>
                        <Tr>
                            <Th>ID</Th>
                            <Th>Employee</Th>
                            <Th>Role</Th>
                            <Th>Project</Th>
                            <Th>Project Start Date</Th>
                            <Th>Description</Th>
                            <Th>Date</Th>
                            <Th>Actions</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {activities.map((activity) => (
                            <Tr key={activity.id}>
                                <Td>#{activity.id}</Td>
                                <Td>{activity.employee_name}</Td>
                                <Td>{activity.role || '-'}</Td>
                                <Td>{activity.project_name || '-'}</Td>
                                <Td>{activity.project_start_date ? new Date(activity.project_start_date).toLocaleDateString() : '-'}</Td>
                                <Td>{activity.description}</Td>
                                <Td>{new Date(activity.date).toLocaleDateString()}</Td>
                                <Td>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => navigate(`/daily-activities/edit/${activity.id}`)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: 'var(--color-primary)'
                                            }}
                                            title="Edit"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(activity.id)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: 'var(--color-danger)'
                                            }}
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            )}
        </div>
    );
};

export default DailyActivities;
