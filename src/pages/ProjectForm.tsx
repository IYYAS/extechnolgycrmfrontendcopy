import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createProject, updateProject, getProject, getClients, getEmployees } from '../api/services';
import { ArrowLeft, Save, Globe, Server, Users, Wallet, Calendar, Shield, CreditCard, Plus, Trash2 } from 'lucide-react';

const ProjectForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(!!id);
    const [clients, setClients] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);

    const [formData, setFormData] = useState<any>({
        name: '',
        unique_id: '',
        project_nature: 'Software',
        status: 'Pending',
        description: '',
        client: '',
        start_date: '',
        confirmed_end_date: '',
        end_date: '',
        project_approach_date: '',
        work_assigned_date: '',
        assigned_delivery_date: '',
        creator_name: '',
        creator_designation: '',
        domain: {
            name: '',
            accrued_by: 'Client',
            purchased_from: '',
            purchase_date: '',
            expiration_date: '',
            status: 'Active',
            cost: '0',
            payment_status: 'Unpaid'
        },
        server: {
            name: '',
            server_type: '',
            accrued_by: 'Extechnology',
            purchase_date: '',
            expiration_date: '',
            status: 'Active',
            cost: '0',
            payment_status: 'Unpaid'
        },
        finance: {
            project_cost: '0',
            manpower_cost: '0',
            total_invoiced: '0',
            total_paid: '0'
        },
        assignments: []
    });



    useEffect(() => {
        const fetchData = async () => {
            try {
                const [clientsRes, employeesRes] = await Promise.all([
                    getClients(),
                    getEmployees()
                ]);
                setClients(clientsRes.results || []);
                setEmployees(employeesRes.results || []);

                if (id) {
                    const project = await getProject(Number(id));
                    if (project) {
                        setFormData({
                            name: project.name || '',
                            unique_id: project.unique_id || '',
                            project_nature: project.project_nature || 'Software',
                            status: project.status || 'Pending',
                            description: project.description || '',
                            client: project.client ? String(project.client) : '',
                            start_date: project.start_date || '',
                            confirmed_end_date: project.confirmed_end_date || '',
                            end_date: project.end_date || '',
                            project_approach_date: project.project_approach_date || '',
                            work_assigned_date: project.work_assigned_date || '',
                            assigned_delivery_date: project.assigned_delivery_date || '',
                            creator_name: project.creator_name || '',
                            creator_designation: project.creator_designation || '',
                            domain: project.domain || { name: '', accrued_by: 'Client', purchased_from: '', purchase_date: '', expiration_date: '', status: 'Active', cost: '0', payment_status: 'Unpaid' },
                            server: project.server || { name: '', server_type: '', accrued_by: 'Extechnology', purchase_date: '', expiration_date: '', status: 'Active', cost: '0', payment_status: 'Unpaid' },
                            finance: project.finance || { project_cost: '0', manpower_cost: '0', total_invoiced: '0', total_paid: '0' },
                            assignments: project.assignments || []
                        });
                    }
                }
            } catch (error) {
                console.error("Failed to load data", error);
            } finally {
                setFetching(false);
            }
        };
        fetchData();
    }, [id]);

    const handleNestedChange = (section: string, field: string, value: any) => {
        setFormData((prev: any) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleAssignmentChange = (index: number, field: string, value: any) => {
        const newAssignments = [...formData.assignments];
        newAssignments[index] = { ...newAssignments[index], [field]: value };
        setFormData({ ...formData, assignments: newAssignments });
    };

    const addAssignment = () => {
        setFormData({
            ...formData,
            assignments: [
                ...formData.assignments,
                { employee: '', role: '', cost: '0', allocated_days: 0, actual_days_spent: 0, start_date: '', end_date: '', status: 'Active' }
            ]
        });
    };

    const removeAssignment = (index: number) => {
        const newAssignments = formData.assignments.filter((_: any, i: number) => i !== index);
        setFormData({ ...formData, assignments: newAssignments });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const submitData = {
                ...formData,
                client: formData.client ? Number(formData.client) : undefined,
            };

            if (id) {
                await updateProject(Number(id), submitData);
            } else {
                await createProject(submitData);
            }
            navigate('/projects');
        } catch (error) {
            console.error("Failed to save project", error);
            alert("Failed to save project. Please check if all fields are correctly formatted.");
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: any) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(Number(amount) || 0);
    };

    if (fetching) return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-primary)', fontWeight: 600 }}>Gathering Project Intelligence...</div>;

    const SectionHeader = ({ icon: Icon, title, color }: any) => (
        <h3 style={{
            fontSize: '1.1rem',
            fontWeight: 700,
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: color || 'inherit'
        }}>
            <Icon size={20} />
            {title}
        </h3>
    );

    return (
        <div className="stagger-in" style={{ paddingBottom: '4rem' }}>
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <button
                        onClick={() => navigate('/projects')}
                        className="btn"
                        style={{ padding: '0.6rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                    >
                        <ArrowLeft size={22} />
                    </button>
                    <div>
                        <h1 className="page-title">{id ? 'Refine Project' : 'Initiate Project'}</h1>
                        <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: '0.9rem' }}>
                            {id ? `Tracking progress for ${formData.unique_id || 'ID Pending'}` : 'Establish a new project framework'}
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        type="button"
                        className="btn"
                        onClick={() => navigate('/projects')}
                        style={{ background: 'transparent', border: '1px solid var(--color-border)', padding: '0.7rem 1.5rem' }}
                    >
                        Discard Changes
                    </button>
                    <button
                        form="project-form"
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ padding: '0.7rem 2rem', gap: '0.75rem' }}
                    >
                        {loading ? 'Processing...' : <><Save size={18} /> {id ? 'Commit Updates' : 'Launch Project'}</>}
                    </button>
                </div>
            </div>

            <form id="project-form" onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Section 1: Identity & Core Details */}
                    <div className="glass-panel" style={{ padding: '2rem' }}>
                        <SectionHeader icon={Shield} title="Core Project Identity" color="var(--color-primary)" />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label className="label">Project Workspace Name</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="e.g. StudentGig Enterprise"
                                />
                            </div>
                            <div>
                                <label className="label">Unique Identifier</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={formData.unique_id}
                                    onChange={(e) => setFormData({ ...formData, unique_id: e.target.value })}
                                    placeholder="EXT-2026-000"
                                />
                            </div>
                            <div>
                                <label className="label">Project Nature</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={formData.project_nature}
                                    onChange={(e) => setFormData({ ...formData, project_nature: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="label">Client Principal</label>
                                <select
                                    className="input-field"
                                    value={formData.client}
                                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                                    required
                                >
                                    <option value="">Select a Client</option>
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="label">Current Vital Status</label>
                                <select
                                    className="input-field"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    {['Pending', 'In Progress', 'Completed', 'On Hold', 'Live'].map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label className="label">Strategic Description</label>
                                <textarea
                                    className="input-field"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    placeholder="Detail the project's core objectives..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Timeline Milestones */}
                    <div className="glass-panel" style={{ padding: '2rem' }}>
                        <SectionHeader icon={Calendar} title="Execution Timeline" color="var(--color-warning)" />
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                            <div>
                                <label className="label">Approach Date</label>
                                <input type="date" className="input-field" value={formData.project_approach_date} onChange={(e) => setFormData({ ...formData, project_approach_date: e.target.value })} />
                            </div>
                            <div>
                                <label className="label">Work Assigned</label>
                                <input type="date" className="input-field" value={formData.work_assigned_date} onChange={(e) => setFormData({ ...formData, work_assigned_date: e.target.value })} />
                            </div>
                            <div>
                                <label className="label">Assigned Delivery</label>
                                <input type="date" className="input-field" value={formData.assigned_delivery_date} onChange={(e) => setFormData({ ...formData, assigned_delivery_date: e.target.value })} />
                            </div>
                            <div>
                                <label className="label">Start Date</label>
                                <input type="date" className="input-field" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} />
                            </div>
                            <div>
                                <label className="label">Confirmed End Date</label>
                                <input type="date" className="input-field" value={formData.confirmed_end_date} onChange={(e) => setFormData({ ...formData, confirmed_end_date: e.target.value })} />
                            </div>
                            <div>
                                <label className="label">Actual End Date</label>
                                <input type="date" className="input-field" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Governance & Creator */}
                    <div className="glass-panel" style={{ padding: '2rem' }}>
                        <SectionHeader icon={Users} title="Governance & Attribution" color="var(--color-success)" />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <label className="label">Strategic Creator</label>
                                <input type="text" className="input-field" value={formData.creator_name} onChange={(e) => setFormData({ ...formData, creator_name: e.target.value })} />
                            </div>
                            <div>
                                <label className="label">Creator Designation</label>
                                <input type="text" className="input-field" value={formData.creator_designation} onChange={(e) => setFormData({ ...formData, creator_designation: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Operational Assets */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="glass-panel" style={{ padding: '1.5rem' }}>
                            <SectionHeader icon={Globe} title="Domain Assets" color="var(--color-primary)" />
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <input type="text" className="input-field" placeholder="Domain Name" value={formData.domain.name} onChange={(e) => handleNestedChange('domain', 'name', e.target.value)} />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <select className="input-field" value={formData.domain.accrued_by} onChange={(e) => handleNestedChange('domain', 'accrued_by', e.target.value)}>
                                        <option value="Client">Client</option>
                                        <option value="Extechnology">Extechnology</option>
                                    </select>
                                    <input type="date" className="input-field" value={formData.domain.expiration_date} onChange={(e) => handleNestedChange('domain', 'expiration_date', e.target.value)} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <input type="text" className="input-field" placeholder="Cost" value={formData.domain.cost} onChange={(e) => handleNestedChange('domain', 'cost', e.target.value)} />
                                    <select className="input-field" value={formData.domain.payment_status} onChange={(e) => handleNestedChange('domain', 'payment_status', e.target.value)}>
                                        <option value="Paid">Paid</option>
                                        <option value="Unpaid">Unpaid</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="glass-panel" style={{ padding: '1.5rem' }}>
                            <SectionHeader icon={Server} title="Server Infrastructure" color="var(--color-success)" />
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <input type="text" className="input-field" placeholder="Provider Name" value={formData.server.name} onChange={(e) => handleNestedChange('server', 'name', e.target.value)} />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <input type="text" className="input-field" placeholder="Type (VPS/Dedicated)" value={formData.server.server_type} onChange={(e) => handleNestedChange('server', 'server_type', e.target.value)} />
                                    <input type="date" className="input-field" value={formData.server.expiration_date} onChange={(e) => handleNestedChange('server', 'expiration_date', e.target.value)} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <input type="text" className="input-field" placeholder="Cost" value={formData.server.cost} onChange={(e) => handleNestedChange('server', 'cost', e.target.value)} />
                                    <select className="input-field" value={formData.server.payment_status} onChange={(e) => handleNestedChange('server', 'payment_status', e.target.value)}>
                                        <option value="Paid">Paid</option>
                                        <option value="Unpaid">Unpaid</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 5: Human Capital Assignments */}
                    <div className="glass-panel" style={{ padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <SectionHeader icon={Plus} title="Resource Allocations" color="var(--color-primary)" />
                            <button type="button" onClick={addAssignment} className="btn" style={{ fontSize: '0.8rem', padding: '0.4rem 1rem', background: 'var(--color-primary-subtle)', color: 'var(--color-primary)', border: 'none' }}>
                                <Plus size={14} /> Add Resource
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {formData.assignments.map((as: any, index: number) => (
                                <div key={as.id || index} style={{ padding: '1.5rem', background: 'var(--color-bg)', border: '1px solid var(--color-border-light)', borderRadius: 'var(--radius-lg)' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr auto', gap: '1rem', marginBottom: '1rem' }}>
                                        <div>
                                            <label className="label">Resource</label>
                                            <select className="input-field" value={as.employee} onChange={(e) => handleAssignmentChange(index, 'employee', e.target.value)}>
                                                <option value="">Select Resource</option>
                                                {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="label">Strategic Role</label>
                                            <input type="text" className="input-field" value={as.role} onChange={(e) => handleAssignmentChange(index, 'role', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="label">Status</label>
                                            <select className="input-field" value={as.status} onChange={(e) => handleAssignmentChange(index, 'status', e.target.value)}>
                                                <option value="Active">Active</option>
                                                <option value="Completed">Completed</option>
                                                <option value="On Hold">On Hold</option>
                                            </select>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                                            <button type="button" onClick={() => removeAssignment(index)} className="btn" style={{ padding: '0.75rem', color: 'var(--color-danger)', background: 'var(--color-danger-subtle)', border: 'none' }}>
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                                        <div>
                                            <label className="label">Allocation (Days)</label>
                                            <input type="number" className="input-field" value={as.allocated_days} onChange={(e) => handleAssignmentChange(index, 'allocated_days', Number(e.target.value))} />
                                        </div>
                                        <div>
                                            <label className="label">Utilized (Days)</label>
                                            <input type="number" className="input-field" value={as.actual_days_spent} onChange={(e) => handleAssignmentChange(index, 'actual_days_spent', Number(e.target.value))} />
                                        </div>
                                        <div>
                                            <label className="label">From</label>
                                            <input type="date" className="input-field" value={as.start_date} onChange={(e) => handleAssignmentChange(index, 'start_date', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="label">Until</label>
                                            <input type="date" className="input-field" value={as.end_date} onChange={(e) => handleAssignmentChange(index, 'end_date', e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {formData.assignments.length === 0 && <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem', background: 'var(--color-bg)', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-lg)' }}>No resources allocated yet.</p>}
                        </div>
                    </div>
                </div>

                {/* Sidebar: Financial Metrics */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'sticky', top: '2rem' }}>
                    <div className="glass-panel" style={{ padding: '2rem', borderTop: '4px solid var(--color-success)' }}>
                        <SectionHeader icon={Wallet} title="Financial Performance" color="var(--color-success)" />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label className="label">TOTAL PROJECT VALUE</label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 800, color: 'var(--color-text-dim)' }}>$</span>
                                    <input
                                        type="text"
                                        className="input-field"
                                        style={{ paddingLeft: '2rem', fontSize: '1.25rem', fontWeight: 800 }}
                                        value={formData.finance.project_cost}
                                        onChange={(e) => handleNestedChange('finance', 'project_cost', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div style={{ height: '1px', background: 'var(--color-border-light)' }} />

                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-dim)', fontWeight: 600 }}>Total Invoiced</span>
                                    <input
                                        type="text"
                                        className="input-field"
                                        style={{ width: '120px', padding: '0.4rem', textAlign: 'right', fontWeight: 700 }}
                                        value={formData.finance.total_invoiced}
                                        onChange={(e) => handleNestedChange('finance', 'total_invoiced', e.target.value)}
                                    />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-dim)', fontWeight: 600 }}>Total Collected</span>
                                    <input
                                        type="text"
                                        className="input-field"
                                        style={{ width: '120px', padding: '0.4rem', textAlign: 'right', fontWeight: 700, color: 'var(--color-success)' }}
                                        value={formData.finance.total_paid}
                                        onChange={(e) => handleNestedChange('finance', 'total_paid', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div style={{ padding: '1.25rem', background: 'var(--color-danger-subtle)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-danger)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <IconLabel icon={CreditCard} label="Outstanding Balance" color="var(--color-danger)" />
                                </div>
                                <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 900, color: 'var(--color-danger)', letterSpacing: '-0.03em' }}>
                                    {formatCurrency(Number(formData.finance.total_invoiced) - Number(formData.finance.total_paid))}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <label className="label" style={{ marginBottom: 0 }}>OPEX ESTIMATE (MANPOWER COST)</label>
                        <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--color-text-dim)' }}>$</span>
                            <input
                                type="text"
                                className="input-field"
                                style={{ paddingLeft: '1.8rem', fontWeight: 700 }}
                                value={formData.finance.manpower_cost}
                                onChange={(e) => handleNestedChange('finance', 'manpower_cost', e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </form>

            <style>{`
                .label { display: block; margin-bottom: 0.6rem; color: var(--color-text-dim); font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
                .input-field { background: var(--color-bg); border: 1px solid var(--color-border); }
                .input-field:focus { border-color: var(--color-primary); box-shadow: 0 0 0 4px var(--color-primary-subtle); }
            `}</style>
        </div>
    );
};

const IconLabel = ({ icon: Icon, label, color }: any) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: color || 'var(--color-text-muted)' }}>
        <Icon size={14} />
        <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
    </div>
);

export default ProjectForm;
