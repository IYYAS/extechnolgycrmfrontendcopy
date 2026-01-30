import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getEmployees } from '../api/services';
import type { Employee } from '../types';

const EmployeeProjects = () => {
    const { id } = useParams<{ id: string }>();
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadEmployee = async () => {
            if (!id) return;
            try {
                const response = await getEmployees();
                const found = response.results.find((e: Employee) => e.id === Number(id));
                setEmployee(found || null);
            } catch (error) {
                console.error("Failed to load employee projects", error);
            } finally {
                setLoading(false);
            }
        };
        loadEmployee();
    }, [id]);

    if (loading) return <p>Loading...</p>;
    if (!employee) return <p>Employee not found.</p>;

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Projects Assigned to {employee.name}</h1>
                <Link
                    to="/employees"
                    style={{
                        color: 'var(--color-text-muted)',
                        textDecoration: 'none',
                        fontSize: '0.875rem'
                    }}
                >
                    &larr; Back to Employees
                </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                {employee.projects_assigned.length === 0 ? (
                    <p>No projects assigned.</p>
                ) : (
                    employee.projects_assigned.map((project, index) => (
                        <div key={index} style={{
                            padding: '1.5rem',
                            backgroundColor: 'var(--color-surface)',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px solid var(--color-border)',
                        }}>
                            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>
                                {project}
                            </h3>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default EmployeeProjects;
