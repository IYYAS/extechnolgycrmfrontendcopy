import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers, deleteUser } from '../api/services';
import type { User } from '../types';
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/Table';
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

const UsersPage = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasNext, setHasNext] = useState(false);
    const [hasPrevious, setHasPrevious] = useState(false);

    // Get user role from localStorage
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const is_superuser = user?.is_superuser;
    const is_admin = user?.is_admin;

    // Only admins and superusers can manage users
    const canManageUsers = is_superuser || is_admin;

    const fetchUsers = async (page: number) => {
        setLoading(true);
        try {
            const data = await getUsers(page);
            setUsers(data.results);
            setHasNext(!!data.next);
            setHasPrevious(!!data.previous);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers(currentPage);
    }, [currentPage]);

    const navigate = useNavigate();

    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                await deleteUser(id);
                fetchUsers(currentPage);
            } catch (error) {
                console.error("Failed to delete user", error);
            }
        }
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Users</h1>
                {canManageUsers && (
                    <button className="btn btn-primary" onClick={() => navigate('/users/add')}>
                        <Plus size={18} />
                        Add User
                    </button>
                )}
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <>
                    <Table>
                        <Thead>
                            <Tr>
                                <Th>Username</Th>
                                <Th>Email</Th>
                                <Th>Designation</Th>
                                <Th>Role</Th>
                                <Th>Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {users.map((user) => (
                                <Tr key={user.id}>
                                    <Td>{user.username}</Td>
                                    <Td>{user.email}</Td>
                                    <Td>{user.designation}</Td>
                                    <Td>{user.role}</Td>
                                    <Td>
                                        {canManageUsers && (
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button className="btn" style={{ padding: '0.25rem', color: 'var(--color-primary)' }} onClick={() => navigate(`/users/edit/${user.id}`)}>
                                                    <Pencil size={16} />
                                                </button>
                                                <button className="btn" style={{ padding: '0.25rem', color: 'var(--color-danger)' }} onClick={() => handleDelete(user.id)}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        )}
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
            )
            }
        </div >
    );
};

export default UsersPage;
