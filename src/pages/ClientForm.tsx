import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createClient, updateClient, getClient } from '../api/services';
import type { Client } from '../types';
import { ArrowLeft, Save } from 'lucide-react';

const ClientForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(id ? true : false);

    const [formData, setFormData] = useState<Partial<Client>>({
        name: '',
        email: '',
        phone: '',
        company_name: '',
        address: '',
        country: '',
        about: '',
    });

    useEffect(() => {
        if (id) {
            const fetchClientData = async () => {
                try {
                    const data = await getClient(Number(id));
                    setFormData(data);
                } catch (error) {
                    console.error("Failed to fetch client data", error);
                    alert("Client not found");
                    navigate('/clients');
                } finally {
                    setFetching(false);
                }
            };
            fetchClientData();
        }
    }, [id, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (id) {
                await updateClient(Number(id), formData);
            } else {
                await createClient(formData);
            }
            navigate('/clients');
        } catch (error) {
            console.error("Failed to save client", error);
            alert("Failed to save client data.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (fetching) return <div style={{ padding: '2rem' }}>Loading Client Data...</div>;

    return (
        <div>
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        onClick={() => navigate('/clients')}
                        className="btn"
                        style={{ padding: '0.5rem', background: 'var(--color-bg)' }}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="page-title">{id ? 'Edit Client' : 'Add New Client'}</h1>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label className="label">Client Name</label>
                            <input
                                name="name"
                                className="input-field"
                                value={formData.name || ''}
                                onChange={handleChange}
                                required
                                placeholder="e.g. John Doe"
                            />
                        </div>
                        <div>
                            <label className="label">Company Name</label>
                            <input
                                name="company_name"
                                className="input-field"
                                value={formData.company_name || ''}
                                onChange={handleChange}
                                placeholder="e.g. Acme Corp"
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label className="label">Email Address</label>
                            <input
                                name="email"
                                type="email"
                                className="input-field"
                                value={formData.email || ''}
                                onChange={handleChange}
                                placeholder="e.g. client@example.com"
                            />
                        </div>
                        <div>
                            <label className="label">Phone Number</label>
                            <input
                                name="phone"
                                className="input-field"
                                value={formData.phone || ''}
                                onChange={handleChange}
                                placeholder="e.g. +123456789"
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label className="label">Country</label>
                            <input
                                name="country"
                                className="input-field"
                                value={formData.country || ''}
                                onChange={handleChange}
                                placeholder="e.g. USA"
                            />
                        </div>
                        <div>
                            <label className="label">Address</label>
                            <input
                                name="address"
                                className="input-field"
                                value={formData.address || ''}
                                onChange={handleChange}
                                placeholder="e.g. 123 Street, City"
                            />
                        </div>
                    </div>



                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                        <button
                            type="button"
                            className="btn"
                            onClick={() => navigate('/clients')}
                            style={{ background: 'transparent', border: '1px solid var(--color-border-light)' }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                            style={{ minWidth: '120px', justifyContent: 'center' }}
                        >
                            {loading ? 'Saving...' : (
                                <>
                                    <Save size={18} />
                                    Save Client
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
            <style>{`
                .label {
                    display: block;
                    margin-bottom: 0.5rem;
                    color: var(--color-text-muted);
                    font-size: 0.875rem;
                }
            `}</style>
        </div>
    );
};

export default ClientForm;
