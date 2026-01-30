import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getProject, getInvoice, getLatestProjectInvoice, downloadInvoicePdf } from '../api/services';
import type { Project, Invoice } from '../types';
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/Table';
import { Mail, ChevronLeft, Download, FileText, Edit, History } from 'lucide-react';
// InvoiceMaker removed

const InvoiceDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const invoiceIdParam = queryParams.get('invoice_id');

    const [project, setProject] = useState<Project | null>(null);
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(true);



    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                // Always fetch the project based on the ID in the URL
                const foundProj = await getProject(Number(id));
                setProject(foundProj || null);

                // Fetch specific invoice or latest project billing
                try {
                    let inv: Invoice | null = null;
                    if (invoiceIdParam) {
                        inv = await getInvoice(Number(invoiceIdParam));
                    } else {
                        inv = await getLatestProjectInvoice(Number(id));
                    }

                    if (inv && inv.id) {
                        setInvoice(inv);
                    } else {
                        setInvoice(null);
                    }
                } catch (err) {
                    console.log("No specific invoice data found for this context.");
                    setInvoice(null);
                }
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, [id, invoiceIdParam]);

    const formatCurrency = (amount: string | number | null | undefined) => {
        const val = typeof amount === 'string' ? parseFloat(amount) : (amount || 0);
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(Number(val) || 0);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PAID': return 'var(--color-success)';
            case 'PARTIAL': return 'var(--color-primary)';
            case 'UNPAID': return 'var(--color-text-muted)';
            case 'OVERDUE': return 'var(--color-danger)';
            default: return 'var(--color-text-muted)';
        }
    };





    const handleDownloadPdf = async () => {
        // Use invoiceId from query param if available, otherwise fallback to invoice ID from state or project ID (guarded by backend redirect)
        const downloadId = invoiceIdParam || (invoice ? invoice.id : (project ? project.id : null));

        if (!downloadId) return;
        try {
            await downloadInvoicePdf(Number(downloadId));
        } catch (error) {
            console.error("Failed to download PDF", error);
            alert("Failed to download PDF. Please check the backend.");
        }
    };





    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading invoice details...</div>;
    }

    if (!project && !invoice) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h2 style={{ color: 'var(--color-text)' }}>Invoice not found</h2>
                <button className="btn" onClick={() => navigate('/billing')} style={{ marginTop: '1rem' }}>
                    Back to Billing
                </button>
            </div>
        );
    }

    const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="stagger-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button
                    onClick={() => navigate(-1)}
                    className="btn"
                    style={{
                        background: 'var(--color-bg)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text)',
                        display: 'flex', alignItems: 'center', gap: '0.5rem'
                    }}
                >
                    <ChevronLeft size={18} />
                    Back
                </button>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    {invoice && (
                        <>
                            <button
                                className="btn"
                                onClick={() => navigate(`/billing/project/${id}/invoices/edit/${invoice.id}`)}
                                style={{
                                    background: 'var(--color-primary-subtle)',
                                    border: '1px solid var(--color-primary)',
                                    color: 'var(--color-primary)',
                                    display: 'flex', alignItems: 'center', gap: '0.5rem'
                                }}
                            >
                                <Edit size={18} />
                                Edit
                            </button>
                        </>
                    )}

                    <button
                        className="btn"
                        onClick={handleDownloadPdf}
                        disabled={!invoice}
                        style={{
                            background: !invoice ? 'var(--color-bg)' : 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                            color: !invoice ? 'var(--color-text-muted)' : 'white',
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            boxShadow: !invoice ? 'none' : '0 4px 15px var(--color-primary-subtle)',
                            cursor: !invoice ? 'not-allowed' : 'pointer',
                            opacity: !invoice ? 0.5 : 1
                        }}
                    >
                        <FileText size={18} />
                        Download PDF
                    </button>

                </div>
            </div>



            <div id="invoice-render" className="glass-panel" style={{ padding: '4rem 3rem', position: 'relative', overflow: 'hidden' }}>
                {/* Decoration */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '300px',
                    height: '300px',
                    background: 'var(--color-primary)',
                    filter: 'blur(150px)',
                    opacity: 0.1,
                    zIndex: 0
                }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4rem' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <div style={{
                                    width: '40px', height: '40px',
                                    background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)',
                                    borderRadius: '10px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <Download size={24} color="white" />
                                </div>
                                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Extenology CRM</h1>
                            </div>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                                support@extenology.com
                            </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <h2 style={{
                                fontSize: '2.5rem',
                                fontWeight: 900,
                                margin: 0,
                                background: 'linear-gradient(to right, var(--color-text), var(--color-text-dim))',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                letterSpacing: '-0.02em',
                                textTransform: 'uppercase'
                            }}>INVOICE</h2>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                                <span style={{
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '50px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    background: `var(--color-${(invoice?.status || 'UNPAID').toLowerCase()}-subtle)`,
                                    color: getStatusColor(invoice?.status || 'UNPAID'),
                                    border: `1px solid var(--color-${(invoice?.status || 'UNPAID').toLowerCase()})`,
                                    textTransform: 'uppercase',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.4rem'
                                }}>
                                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: getStatusColor(invoice?.status || 'UNPAID') }} />
                                    {invoice?.status || 'UNPAID'}
                                </span>
                            </div>
                            <p style={{
                                fontSize: '1.25rem',
                                fontWeight: 700,
                                color: 'var(--color-primary)',
                                margin: '0.5rem 0 0.25rem 0',
                                letterSpacing: '0.05em'
                            }}>
                                Invoice #: {invoice ? invoice.invoice_number : (project ? `INV-${project.unique_id || project.id}` : 'INV-...')}
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>
                                    Date: {invoice ? (invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString() : new Date(invoice.created_at).toLocaleDateString()) : today}
                                </p>
                                {invoice && invoice.due_date && (
                                    <p style={{ color: 'var(--color-danger)', fontSize: '0.875rem', fontWeight: 600 }}>
                                        Due: {new Date(invoice.due_date).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '4rem' }}>
                        <div>
                            <h4 style={{ color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem', marginBottom: '1rem' }}>To</h4>
                            <p style={{ fontSize: '1.125rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>{invoice?.client_details?.name || project?.client_name || 'N/A'}</p>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                                {(invoice?.client_details?.email || project?.client_email) && (
                                    <><Mail size={14} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} /> {invoice?.client_details?.email || project?.client_email}<br /></>
                                )}
                            </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <h4 style={{ color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem', marginBottom: '1rem' }}>Project</h4>
                            <p style={{ fontSize: '1.125rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>{project?.name || 'N/A'}</p>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}> {project?.project_nature || 'N/A'}</p>
                        </div>
                    </div>

                    <Table style={{ background: 'transparent', marginBottom: '6rem' }}>
                        <Thead style={{ background: 'var(--color-bg)' }}>
                            <Tr>
                                <Th>Service Type</Th>
                                <Th>Description</Th>
                                <Th>Purchase Date</Th>
                                <Th>Expiration Date</Th>
                                <Th style={{ textAlign: 'right' }}>Rate</Th>
                                <Th style={{ textAlign: 'right' }}>Qty</Th>
                                <Th style={{ textAlign: 'right' }}>Total</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {invoice && invoice.items && Array.isArray(invoice.items) ? (
                                invoice.items.map((item, index) => (
                                    <Tr key={index}>
                                        <Td style={{ padding: '1.5rem 1rem', fontWeight: 600 }}>{item.service_type}</Td>
                                        <Td style={{ padding: '1.5rem 1rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{item.description}</Td>
                                        <Td style={{ padding: '1.5rem 1rem', fontSize: '0.875rem' }}>{item.purchase_date ? new Date(item.purchase_date).toLocaleDateString() : '-'}</Td>
                                        <Td style={{ padding: '1.5rem 1rem', fontSize: '0.875rem' }}>{item.expiration_date ? new Date(item.expiration_date).toLocaleDateString() : '-'}</Td>
                                        <Td style={{ padding: '1.5rem 1rem', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(item.rate)}</Td>
                                        <Td style={{ padding: '1.5rem 1rem', textAlign: 'right', fontWeight: 600 }}>{item.quantity || 1}</Td>
                                        <Td style={{ padding: '1.5rem 1rem', textAlign: 'right', fontWeight: 700, color: 'var(--color-text)' }}>
                                            {formatCurrency(item.total_price || (Number(item.rate) * (item.quantity || 1)))}
                                        </Td>
                                    </Tr>
                                ))
                            ) : project ? (
                                <>
                                    <Tr>
                                        <Td style={{ padding: '1.5rem 1rem', fontWeight: 600 }}>Manpower</Td>
                                        <Td style={{ padding: '1.5rem 1rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Development and management</Td>
                                        <Td style={{ padding: '1.5rem 1rem' }}>-</Td>
                                        <Td style={{ padding: '1.5rem 1rem' }}>-</Td>
                                        <Td style={{ padding: '1.5rem 1rem', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(project.manpower_cost)}</Td>
                                        <Td style={{ padding: '1.5rem 1rem', textAlign: 'right', fontWeight: 600 }}>1</Td>
                                        <Td style={{ padding: '1.5rem 1rem', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(project.manpower_cost)}</Td>
                                    </Tr>
                                    <Tr>
                                        <Td style={{ padding: '1.5rem 1rem', fontWeight: 600 }}>Server</Td>
                                        <Td style={{ padding: '1.5rem 1rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Infrastructure and hosting</Td>
                                        <Td style={{ padding: '1.5rem 1rem', fontSize: '0.875rem' }}>{project.server_purchase_date ? new Date(project.server_purchase_date).toLocaleDateString() : '-'}</Td>
                                        <Td style={{ padding: '1.5rem 1rem', fontSize: '0.875rem' }}>{project.server_expiration_date ? new Date(project.server_expiration_date).toLocaleDateString() : '-'}</Td>
                                        <Td style={{ padding: '1.5rem 1rem', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(project.server_cost)}</Td>
                                        <Td style={{ padding: '1.5rem 1rem', textAlign: 'right', fontWeight: 600 }}>1</Td>
                                        <Td style={{ padding: '1.5rem 1rem', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(project.server_cost)}</Td>
                                    </Tr>
                                    <Tr>
                                        <Td style={{ padding: '1.5rem 1rem', fontWeight: 600 }}>Domain</Td>
                                        <Td style={{ padding: '1.5rem 1rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>License and security</Td>
                                        <Td style={{ padding: '1.5rem 1rem', fontSize: '0.875rem' }}>{project.domain_purchase_date ? new Date(project.domain_purchase_date).toLocaleDateString() : '-'}</Td>
                                        <Td style={{ padding: '1.5rem 1rem', fontSize: '0.875rem' }}>{project.domain_expiration_date ? new Date(project.domain_expiration_date).toLocaleDateString() : '-'}</Td>
                                        <Td style={{ padding: '1.5rem 1rem', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(project.domain_cost)}</Td>
                                        <Td style={{ padding: '1.5rem 1rem', textAlign: 'right', fontWeight: 600 }}>1</Td>
                                        <Td style={{ padding: '1.5rem 1rem', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(project.domain_cost)}</Td>
                                    </Tr>
                                </>
                            ) : null}
                        </Tbody>
                    </Table>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4rem' }}>
                        <div style={{
                            width: '400px',
                            padding: '2.5rem',
                            borderRadius: '1.5rem',
                            background: 'var(--color-bg)',
                            border: '1px solid var(--color-border)',
                            boxShadow: 'var(--shadow-xl)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.25rem 0', borderBottom: '1px solid var(--color-border-light)' }}>
                                <span style={{ color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.9rem' }}>Subtotal</span>
                                <span style={{ fontWeight: 700, fontSize: '1rem' }}>{formatCurrency(invoice ? invoice.subtotal : (project ? project.actual_cost : 0))}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.25rem 0', borderBottom: '1px solid var(--color-border-light)' }}>
                                <span style={{ color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.9rem' }}>Tax ({invoice ? invoice.tax_rate : '0'}%)</span>
                                <span style={{ fontWeight: 700, fontSize: '1rem' }}>{formatCurrency(invoice ? invoice.tax_amount : 0)}</span>
                            </div>
                            {invoice && Number(invoice.discount_amount) > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--color-border-light)' }}>
                                    <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>Discount</span>
                                    <span style={{ fontWeight: 700, color: 'var(--color-danger)' }}>-{formatCurrency(invoice.discount_amount)}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.25rem 0', borderBottom: '1px solid var(--color-border-light)' }}>
                                <span style={{ color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.9rem' }}>Amount Paid</span>
                                <span style={{ fontWeight: 700, color: 'var(--color-success)', fontSize: '1rem' }}>{formatCurrency(invoice ? invoice.amount_paid : 0)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.25rem 0', borderBottom: '1px solid var(--color-border-light)' }}>
                                <span style={{ color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.9rem' }}>Balance Due</span>
                                <span style={{ fontWeight: 700, color: Number(invoice?.balance_due || 0) > 0 ? 'var(--color-danger)' : 'var(--color-success)', fontSize: '1rem' }}>
                                    {formatCurrency(invoice ? invoice.balance_due : (project ? project.actual_cost : 0))}
                                </span>
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                paddingTop: '3rem',
                                marginTop: '2rem',
                                borderTop: '2px solid var(--color-border)',
                                alignItems: 'center'
                            }}>
                                <span style={{ fontSize: '1.25rem', fontWeight: 900 }}>Grand Total</span>
                                <span style={{
                                    fontSize: '2rem',
                                    fontWeight: 900,
                                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    textShadow: '0 0 30px var(--color-primary-subtle)'
                                }}>
                                    {formatCurrency(invoice ? invoice.grand_total : (project ? project.actual_cost : 0))}
                                </span>
                            </div>
                        </div>
                    </div>

                    {invoice && invoice.payments && invoice.payments.length > 0 && (
                        <div style={{ marginTop: '4rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                <History size={20} color="var(--color-primary)" />
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Payment History</h3>
                            </div>
                            <Table style={{ background: 'transparent' }}>
                                <Thead style={{ background: 'var(--color-bg)' }}>
                                    <Tr>
                                        <Th>Date</Th>
                                        <Th>Method</Th>
                                        <Th>Transaction ID</Th>
                                        <Th style={{ textAlign: 'right' }}>Amount</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {invoice.payments.map((payment) => (
                                        <Tr key={payment.id}>
                                            <Td style={{ fontSize: '0.875rem' }}>{new Date(payment.payment_date).toLocaleDateString()}</Td>
                                            <Td style={{ fontWeight: 600 }}>{payment.payment_method}</Td>
                                            <Td style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>{payment.transaction_id || '-'}</Td>
                                            <Td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--color-success)' }}>{formatCurrency(payment.amount)}</Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </div>
                    )}

                </div>
            </div>

            {/* InvoiceMaker removed */}
            {/* Record Payment Modal */}

        </div>
    );
};

export default InvoiceDetail;
