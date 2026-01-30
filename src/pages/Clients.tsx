import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClients, deleteClient } from '../api/services';
import type { Client } from '../types';
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/Table';
import { Plus, Pencil, Trash2, Mail, Phone, Briefcase, ChevronLeft, ChevronRight, Search, Filter, X } from 'lucide-react';

const ClientsPage = () => {
    const navigate = useNavigate();
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasNext, setHasNext] = useState(false);
    const [hasPrevious, setHasPrevious] = useState(false);

    // Filter states
    const [filters, setFilters] = useState({
        search: '',
        name: '',
        email: '',
        phone: '',
        company_name: ''
    });
    const [debouncedFilters, setDebouncedFilters] = useState(filters);
    const [showFilters, setShowFilters] = useState(false);

    // Get user role from localStorage
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const is_superuser = user?.is_superuser;
    const is_admin = user?.is_admin;

    // Only admins and superusers can edit/delete clients
    const canManageClients = is_superuser || is_admin;

    const fetchClients = async (page: number, currentFilters: typeof filters) => {
        setLoading(true);
        try {
            const data = await getClients(page, currentFilters);
            setClients(data.results);
            setHasNext(!!data.next);
            setHasPrevious(!!data.previous);
        } catch (error) {
            console.error("Failed to fetch clients", error);
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
        fetchClients(currentPage, debouncedFilters);
    }, [currentPage, debouncedFilters]);

    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this client?")) {
            try {
                await deleteClient(id);
                fetchClients(currentPage, filters);
            } catch (error) {
                console.error("Failed to delete client", error);
                alert("Failed to delete client. It might be linked to existing projects.");
            }
        }
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Clients</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        className={`btn ${showFilters ? 'btn-primary' : ''}`}
                        onClick={() => setShowFilters(!showFilters)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        {showFilters ? <X size={18} /> : <Filter size={18} />}
                        {showFilters ? 'Hide Filters' : 'Filters'}
                    </button>
                    {canManageClients && (
                        <button className="btn btn-primary" onClick={() => navigate('/clients/add')}>
                            <Plus size={18} />
                            New Client
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
                                placeholder="Name, Email, Phone..."
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="label">Company</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Filter by Company"
                                value={filters.company_name}
                                onChange={(e) => setFilters(prev => ({ ...prev, company_name: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="label">Email</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Filter by Email"
                                value={filters.email}
                                onChange={(e) => setFilters(prev => ({ ...prev, email: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="label">Phone</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Filter by Phone"
                                value={filters.phone}
                                onChange={(e) => setFilters(prev => ({ ...prev, phone: e.target.value }))}
                            />
                        </div>
                    </div>
                    <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                            className="btn"
                            style={{ fontSize: '0.875rem', padding: '0.4rem 0.8rem' }}
                            onClick={() => setFilters({ search: '', name: '', email: '', phone: '', company_name: '' })}
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
                                <Th>Client Name</Th>
                                <Th>Company</Th>
                                <Th>Email</Th>
                                <Th>Phone</Th>
                                <Th>Created At</Th>
                                <Th>Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {clients.length > 0 ? (
                                clients.map((client) => (
                                    <Tr key={client.id}>
                                        <Td>
                                            <div style={{ fontWeight: 500 }}>{client.name}</div>
                                        </Td>
                                        <Td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Briefcase size={16} color="var(--color-text-dim)" />
                                                <span style={{ color: 'var(--color-text)' }}>{client.company_name || '-'}</span>
                                            </div>
                                        </Td>
                                        <Td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Mail size={16} color="var(--color-text-dim)" />
                                                <span style={{ color: 'var(--color-text)' }}>{client.email || '-'}</span>
                                            </div>
                                        </Td>
                                        <Td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Phone size={16} color="var(--color-text-dim)" />
                                                <span style={{ color: 'var(--color-text)' }}>{client.phone || '-'}</span>
                                            </div>
                                        </Td>
                                        <Td>{client.created_at ? new Date(client.created_at).toLocaleDateString() : '-'}</Td>
                                        <Td>
                                            {canManageClients && (
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button className="btn" style={{ padding: '0.25rem', color: 'var(--color-primary)' }} onClick={() => navigate(`/clients/edit/${client.id}`)}>
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button className="btn" style={{ padding: '0.25rem', color: 'var(--color-danger)' }} onClick={() => handleDelete(client.id)}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </Td>
                                    </Tr>
                                ))
                            ) : (
                                <Tr>
                                    <Td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                                        No clients found.
                                    </Td>
                                </Tr>
                            )}
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

export default ClientsPage;
