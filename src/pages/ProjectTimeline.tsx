import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProjectTimelineStatus } from '../api/services';
import type { ProjectTimelineStatus } from '../types';
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/Table';
import { ArrowLeft, Clock, AlertTriangle, CheckCircle, Timer } from 'lucide-react';

const ProjectTimeline = () => {
    const navigate = useNavigate();
    const [statusData, setStatusData] = useState<ProjectTimelineStatus[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await getProjectTimelineStatus();
                setStatusData(data);
            } catch (error) {
                console.error("Failed to fetch timeline status", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getStatusIcon = (label: string) => {
        switch (label.toLowerCase()) {
            case 'critical': return <AlertTriangle size={16} color="var(--color-danger)" />;
            case 'completed': return <CheckCircle size={16} color="var(--color-success)" />;
            default: return <Timer size={16} color="var(--color-primary)" />;
        }
    };

    return (
        <div className="stagger-in">
            <div className="page-header" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        className="btn"
                        onClick={() => navigate(-1)}
                        style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)' }}
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="page-title">Project Timeline Status</h1>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Full visibility into project schedules and risks</p>
                    </div>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                    <Clock size={16} />
                    Total: {statusData.length} projects analyzed
                </div>

                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        <div className="loading-spinner" style={{ marginBottom: '1rem' }}></div>
                        Analyzing project timelines...
                    </div>
                ) : (
                    <Table>
                        <Thead>
                            <Tr>
                                <Th>Project Name</Th>
                                <Th>Confirmed End Date</Th>
                                <Th>Days Remaining</Th>
                                <Th>Status</Th>
                                <Th style={{ textAlign: 'center' }}>Condition</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {statusData.length > 0 ? (
                                statusData.map((project) => (
                                    <Tr key={project.id} onClick={() => navigate(`/projects/${project.id}`)} style={{ cursor: 'pointer' }}>
                                        <Td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{project.name}</Td>
                                        <Td>{new Date(project.confirmed_end_date).toLocaleDateString()}</Td>
                                        <Td style={{
                                            fontWeight: 700,
                                            color: project.days_remaining < 0 ? 'var(--color-danger)' : (project.days_remaining < 30 ? 'var(--color-warning)' : 'var(--color-success)')
                                        }}>
                                            {project.days_remaining < 0
                                                ? `${Math.abs(project.days_remaining)} days overdue`
                                                : `${project.days_remaining} days left`}
                                        </Td>
                                        <Td>
                                            <span style={{
                                                padding: '0.25rem 0.6rem',
                                                borderRadius: '100px',
                                                fontSize: '0.75rem',
                                                backgroundColor: `${project.status_color.toLowerCase() === 'red' ? 'var(--color-danger-subtle)' : 'var(--color-success-subtle)'}`,
                                                color: project.status_color.toLowerCase() === 'red' ? 'var(--color-danger)' : 'var(--color-success)',
                                                fontWeight: 600,
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.3rem'
                                            }}>
                                                {getStatusIcon(project.status_label)}
                                                {project.status_label}
                                            </span>
                                        </Td>
                                        <Td style={{ textAlign: 'center' }}>
                                            <div style={{
                                                width: '12px',
                                                height: '12px',
                                                borderRadius: '50%',
                                                background: project.status_color,
                                                margin: '0 auto',
                                                boxShadow: `0 0 10px ${project.status_color}50`
                                            }} />
                                        </Td>
                                    </Tr>
                                ))
                            ) : (
                                <Tr>
                                    <Td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                                        No project timeline data found.
                                    </Td>
                                </Tr>
                            )}
                        </Tbody>
                    </Table>
                )}
            </div>
        </div>
    );
};

export default ProjectTimeline;
