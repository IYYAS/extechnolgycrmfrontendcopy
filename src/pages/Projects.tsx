import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProjects, deleteProject } from '../api/services';
import type { Project } from '../types';
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/Table';
import { Plus, Pencil, Trash2, Users, Eye, ChevronLeft, ChevronRight, Search, Filter, X } from 'lucide-react';

const ProjectsPage = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasNext, setHasNext] = useState(false);
    const [hasPrevious, setHasPrevious] = useState(false);

    // Filter states
    const [filters, setFilters] = useState({
        search: '',
        client: '',
        domain: '',
        server: ''
    });
    const [debouncedFilters, setDebouncedFilters] = useState(filters);
    const [showFilters, setShowFilters] = useState(false);

    // Get user role from localStorage
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const is_superuser = user?.is_superuser;
    const is_admin = user?.is_admin;
    const is_billing = user?.role === 'Billing';

    // Only admins and superusers can delete projects
    const canDeleteProjects = is_superuser || is_admin;
    // Admins, Superusers, and Billing can edit projects
    const canEditProjects = is_superuser || is_admin || is_billing;

    const fetchProjects = async (page: number, currentFilters: typeof filters) => {
        setLoading(true);
        try {
            const data = await getProjects(page, currentFilters);
            setProjects(data.results);
            setHasNext(!!data.next);
            setHasPrevious(!!data.previous);
        } catch (error) {
            console.error("Failed to fetch projects", error);
        } finally {
            setLoading(false);
        }
    };

    // Debounce filters
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedFilters(filters);
            setCurrentPage(1); // Reset to first page on filter change
        }, 500);

        return () => clearTimeout(timer);
    }, [filters]);

    useEffect(() => {
        fetchProjects(currentPage, debouncedFilters);
    }, [currentPage, debouncedFilters]);

    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure?")) {
            try {
                await deleteProject(id);
                fetchProjects(currentPage, filters);
            } catch (error) {
                console.error("Failed to delete project", error);
            }
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed': return 'var(--color-success)';
            case 'In Progress': return 'var(--color-primary)';
            case 'Pending': return 'var(--color-warning)';
            case 'On Hold': return 'var(--color-danger)';
            default: return 'var(--color-text-muted)';
        }
    };

    const getStatusSubtleColor = (status: string) => {
        switch (status) {
            case 'Completed': return 'var(--color-success-subtle)';
            case 'In Progress': return 'var(--color-primary-subtle)';
            case 'Pending': return 'var(--color-warning-subtle)';
            case 'On Hold': return 'var(--color-danger-subtle)';
            default: return 'var(--color-bg)';
        }
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Projects</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        className={`btn ${showFilters ? 'btn-primary' : ''}`}
                        onClick={() => setShowFilters(!showFilters)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        {showFilters ? <X size={18} /> : <Filter size={18} />}
                        {showFilters ? 'Hide Filters' : 'Filters'}
                    </button>
                    {canEditProjects && (
                        <button className="btn btn-primary" onClick={() => navigate('/projects/add')}>
                            <Plus size={18} />
                            New Project
                        </button>
                    )}
                </div>
            </div>

            {showFilters && (
                <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem', backgroundColor: 'var(--color-bg-subtle)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <div>
                            <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Search size={14} /> Search
                            </label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Name, Client, Domain..."
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="label">Client</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Filter by Client"
                                value={filters.client}
                                onChange={(e) => setFilters(prev => ({ ...prev, client: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="label">Domain</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Filter by Domain"
                                value={filters.domain}
                                onChange={(e) => setFilters(prev => ({ ...prev, domain: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="label">Server</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Filter by Server"
                                value={filters.server}
                                onChange={(e) => setFilters(prev => ({ ...prev, server: e.target.value }))}
                            />
                        </div>
                    </div>
                    <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                            className="btn"
                            style={{ fontSize: '0.875rem', padding: '0.4rem 0.8rem' }}
                            onClick={() => setFilters({ search: '', client: '', domain: '', server: '' })}
                        >
                            Reset Filters
                        </button>
                    </div>
                </div>
            )}

            {loading ? (
                <p>Loading...</p>
            ) : (
                <>
                    <Table>
                        <Thead>
                            <Tr>
                                <Th>Project Name</Th>
                                <Th>Client</Th>
                                <Th>Status</Th>
                                <Th>Employees</Th>
                                <Th>Start Date</Th>
                                <Th>Domain Expiry</Th>
                                <Th>Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {projects.map((proj) => (
                                <Tr key={proj.id}>
                                    <Td>{proj.name}</Td>
                                    <Td>
                                        {proj.client_details?.name || proj.client_name || '-'}
                                        {(proj.client_details?.country || proj.client_country) ? ` (${proj.client_details?.country || proj.client_country})` : ''}
                                    </Td>
                                    <Td>
                                        <span style={{
                                            color: getStatusColor(proj.status),
                                            backgroundColor: getStatusSubtleColor(proj.status),
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '1rem',
                                            fontSize: '0.75rem',
                                            border: `1px solid ${getStatusColor(proj.status)}`
                                        }}>
                                            {proj.status}
                                        </span>
                                    </Td>
                                    <Td>
                                        {proj.assignments && proj.assignments.length > 0 ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Users size={16} />
                                                <span>{proj.assignments.length} assigned</span>
                                            </div>
                                        ) : (
                                            <span style={{ color: 'var(--color-text-muted)' }}>No assignments</span>
                                        )}
                                    </Td>
                                    <Td>{proj.start_date || '-'}</Td>
                                    <Td>{proj.domain?.expiration_date || proj.domain_expiration_date || '-'}</Td>
                                    <Td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button className="btn" style={{ padding: '0.25rem', color: 'var(--color-primary)' }} onClick={() => navigate(`/projects/view/${proj.id}`)} title="View Project">
                                                <Eye size={16} />
                                            </button>
                                            {canEditProjects && (
                                                <button className="btn" style={{ padding: '0.25rem', color: 'var(--color-primary)' }} onClick={() => navigate(`/projects/edit/${proj.id}`)} title="Edit Project">
                                                    <Pencil size={16} />
                                                </button>
                                            )}
                                            {canDeleteProjects && (
                                                <button className="btn" style={{ padding: '0.25rem', color: 'var(--color-danger)' }} onClick={() => handleDelete(proj.id)} title="Delete Project">
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>

                    {/* Pagination Controls */}
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
                        <button
                            className="btn"
                            disabled={!hasPrevious}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            style={{
                                opacity: !hasPrevious ? 0.5 : 1,
                                cursor: !hasPrevious ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', gap: '0.5rem'
                            }}
                        >
                            <ChevronLeft size={16} /> Previous
                        </button>
                        <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>
                            Page {currentPage}
                        </span>
                        <button
                            className="btn"
                            disabled={!hasNext}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            style={{
                                opacity: !hasNext ? 0.5 : 1,
                                cursor: !hasNext ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', gap: '0.5rem'
                            }}
                        >
                            Next <ChevronRight size={16} />
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default ProjectsPage;
