import { useEffect, useState } from 'react';
import { getEmployees } from '../api/services';
import type { Employee } from '../types';
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/Table';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search, Filter, X } from 'lucide-react';

const Employees = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasNext, setHasNext] = useState(false);
    const [hasPrevious, setHasPrevious] = useState(false);

    // Filter states
    const [filters, setFilters] = useState({
        search: '',
        name: '',
        role: '',
        phone: '',
        email: ''
    });
    const [debouncedFilters, setDebouncedFilters] = useState(filters);
    const [showFilters, setShowFilters] = useState(false);

    const fetchEmployees = async (page: number, currentFilters: typeof filters) => {
        setLoading(true);
        try {
            const data = await getEmployees(page, currentFilters);
            setEmployees(data.results);
            setHasNext(!!data.next);
            setHasPrevious(!!data.previous);
        } catch (error) {
            console.error("Failed to fetch employees", error);
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
        fetchEmployees(currentPage, debouncedFilters);
    }, [currentPage, debouncedFilters]);

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Employees</h1>
                <button
                    className={`btn ${showFilters ? 'btn-primary' : ''}`}
                    onClick={() => setShowFilters(!showFilters)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    {showFilters ? <X size={18} /> : <Filter size={18} />}
                    {showFilters ? 'Hide Filters' : 'Filters'}
                </button>
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
                                placeholder="Name, Email, Phone, Role..."
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="label">Role</label>
                            <select
                                className="input-field"
                                value={filters.role}
                                onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                            >
                                <option value="">All</option>
                                <option value="SuperAdmin">SuperAdmin</option>
                                <option value="Admin">Admin</option>
                                <option value="Billing">Billing</option>
                                <option value="Developer">Developer</option>
                            </select>
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
                            onClick={() => setFilters({ search: '', name: '', role: '', phone: '', email: '' })}
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
                                <Th>Name</Th>
                                <Th>Email</Th>
                                <Th>Phone</Th>
                                <Th>Designation</Th>
                                <Th>Role</Th>
                                <Th>Projects</Th>
                                <Th>Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {employees.map((emp) => (
                                <Tr key={emp.id}>
                                    <Td>{emp.name || emp.username}</Td>
                                    <Td>{emp.email}</Td>
                                    <Td>{emp.phone_number || 'N/A'}</Td>
                                    <Td>{emp.designation || 'N/A'}</Td>
                                    <Td>{emp.role}</Td>
                                    <Td>
                                        {emp.project_count > 0 ? (
                                            <Link
                                                to={`/employees/${emp.id}/projects`}
                                                style={{
                                                    color: 'var(--color-primary)',
                                                    textDecoration: 'underline',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {emp.project_count}
                                            </Link>
                                        ) : (
                                            emp.project_count
                                        )}
                                    </Td>
                                    <Td>
                                        <Link
                                            to={`/employees/${emp.id}/activities`}
                                            style={{ color: 'var(--color-primary)', textDecoration: 'none' }}
                                        >
                                            View Activities
                                        </Link>
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

export default Employees;
