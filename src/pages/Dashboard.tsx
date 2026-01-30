import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Users,
    Briefcase,
    CheckCircle,
    AlertCircle,
    DollarSign,
    TrendingUp,
    Activity,
    Globe,
    Server,
    Zap,
    Target,
    BarChart3
} from 'lucide-react';
import {
    getExecutiveSummary,
    getProjectStatusChart,
    getProjectDeliveryHealth,
    getProjectNatureBreakdown,
    getCostAnatomy,
    getGeoRevenueMap,
    getRevenueByCreator,
    getProjectsOverview,
    getServerAnalytics,
    getDomainAnalytics
} from '../api/services';
// TODO:
// - [x] Update `getProjectNatureBreakdown` in `src / api / services.ts` to support `period` parameter
// - [/] Update `Dashboard.tsx` to implement time-based filtering for Project Nature Breakdown
import type {
    ExecutiveSummary,
    ProjectPortfolioStatus,
    ProjectDeliveryHealth,
    ProjectNatureBreakdown,
    CostAnatomy,
    GeoRevenue,
    RevenueByCreator,
    ProjectsOverview,
    AssetAnalyticsResponse
} from '../types';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
} from 'chart.js';
import { Doughnut, Bar, Pie, Chart } from 'react-chartjs-2';

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title
);

const StatCard = ({ title, value, icon: Icon, color, prefix = '', trend = '' }: { title: string; value: string | number; icon: any; color: string; prefix?: string; trend?: string }) => (
    <div className="glass-panel" style={{
        padding: '1.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        position: 'relative',
        overflow: 'hidden',
        borderLeft: `none`,
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)'
    }}>
        {/* Ambient Glow */}
        <div style={{
            position: 'absolute',
            top: '-10%',
            right: '-10%',
            width: '140px',
            height: '140px',
            background: color,
            filter: 'blur(70px)',
            opacity: 0.08,
            zIndex: 0
        }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 1 }}>
            <div style={{
                position: 'relative',
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '1rem',
                backgroundColor: 'var(--color-bg)',
                border: '1px solid var(--color-border)'
            }}>
                {/* Inner Glow around Icon */}
                <div style={{
                    position: 'absolute',
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: color,
                    filter: 'blur(15px)',
                    opacity: 0.3
                }} />
                <Icon size={24} color={color} style={{ position: 'relative', zIndex: 1 }} />
            </div>
            {trend && (
                <div style={{
                    fontSize: '0.75rem',
                    color: trend.startsWith('+') ? 'var(--color-success)' : 'var(--color-danger)',
                    fontWeight: 800,
                    padding: '0.4rem 0.8rem',
                    borderRadius: '2rem',
                    background: trend.startsWith('+') ? 'var(--color-success-subtle)' : 'var(--color-danger-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}>
                    <TrendingUp size={12} />
                    {trend}
                </div>
            )}
        </div>

        <div style={{ zIndex: 1 }}>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem', fontWeight: 700, margin: '0 0 0.75rem 0', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{title}</p>
            <h3 style={{ fontSize: '2.75rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                <span style={{ fontSize: '1.75rem', color: color, fontWeight: 700 }}>{prefix}</span>
                <span style={{ color: 'var(--color-text)' }}>{value}</span>
            </h3>
        </div>
    </div>
);

const ChartContainer = ({ title, children, height = '400px', icon: Icon = BarChart3, headerAction, summaryItems }: {
    title: string;
    children: React.ReactNode;
    height?: string;
    icon?: any;
    headerAction?: React.ReactNode;
    summaryItems?: { label: string; value: string | number; color?: string }[];
}) => (
    <div className="glass-panel" style={{ padding: '2rem', height: 'auto', minHeight: height, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                letterSpacing: '-0.02em'
            }}>
                <div style={{ padding: '0.5rem', background: 'var(--color-bg)', borderRadius: '0.75rem' }}>
                    <Icon size={20} color="var(--color-primary)" />
                </div>
                {title}
            </h3>
            {headerAction}
        </div>

        {summaryItems && (
            <div style={{
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                marginBottom: '3rem',
                paddingBottom: '2.5rem',
                borderBottom: '1px solid var(--color-border)',
                position: 'relative'
            }}>
                {summaryItems.map((item, idx) => (
                    <div key={idx} style={{
                        textAlign: 'center',
                        flex: 1,
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        borderRight: idx === summaryItems.length - 1 ? 'none' : '1px dashed var(--color-border)'
                    }}>
                        <h4 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, color: item.color || 'var(--color-text)', letterSpacing: '-0.02em' }}>{item.value}</h4>
                        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.075em' }}>{item.label}</p>
                    </div>
                ))}
            </div>
        )}

        <div style={{ flex: 1, position: 'relative', minHeight: '300px' }}>
            {children}
        </div>
    </div>
);

const Dashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [summary, setSummary] = useState<ExecutiveSummary | null>(null);
    const [portfolio, setPortfolio] = useState<ProjectPortfolioStatus[]>([]);
    const [health, setHealth] = useState<ProjectDeliveryHealth[]>([]);
    const [nature, setNature] = useState<ProjectNatureBreakdown[]>([]);
    const [costAnatomy, setCostAnatomy] = useState<CostAnatomy[]>([]);
    const [geo, setGeo] = useState<GeoRevenue[]>([]);
    const [creators, setCreators] = useState<RevenueByCreator[]>([]);
    const [loading, setLoading] = useState(true);
    const [projectsOverview, setProjectsOverview] = useState<ProjectsOverview | null>(null);
    const [overviewPeriod, setOverviewPeriod] = useState<'ALL' | '1M' | '6M' | '1Y'>('ALL');
    const [costAnatomyPeriod, setCostAnatomyPeriod] = useState<'ALL' | '1M' | '6M' | '1Y'>('ALL');
    const [naturePeriod, setNaturePeriod] = useState<'ALL' | 'WEEK' | 'MONTH' | 'YEAR'>('ALL');
    const [portfolioPeriod, setPortfolioPeriod] = useState<'ALL' | 'WEEK' | 'MONTH' | 'YEAR'>('ALL');
    const [executivePeriod, setExecutivePeriod] = useState<'ALL' | 'WEEK' | 'MONTH' | 'YEAR'>('ALL');
    const [geoPeriod, setGeoPeriod] = useState<'ALL' | 'WEEK' | 'MONTH' | 'YEAR'>('ALL');
    const [healthPeriod, setHealthPeriod] = useState<'ALL' | 'WEEK' | 'MONTH' | 'YEAR'>('ALL');
    const [creatorPeriod, setCreatorPeriod] = useState<'ALL' | 'WEEK' | 'MONTH' | 'YEAR'>('ALL');
    const [serverAnalytics, setServerAnalytics] = useState<AssetAnalyticsResponse | null>(null);
    const [domainAnalytics, setDomainAnalytics] = useState<AssetAnalyticsResponse | null>(null);
    const [serverPeriod, setServerPeriod] = useState<'all' | 'today' | 'this_month' | 'this_year' | 'custom'>('all');
    const [domainPeriod, setDomainPeriod] = useState<'all' | 'today' | 'this_month' | 'this_year' | 'custom'>('all');
    const [serverStartDate, setServerStartDate] = useState('');
    const [serverEndDate, setServerEndDate] = useState('');
    const [domainStartDate, setDomainStartDate] = useState('');
    const [domainEndDate, setDomainEndDate] = useState('');
    const [serverTrigger, setServerTrigger] = useState(0);
    const [domainTrigger, setDomainTrigger] = useState(0);
    useEffect(() => {
        // Mock initial loading state to allow and observe transitions
        const timer = setTimeout(() => setLoading(false), 1200);
        return () => clearTimeout(timer);
    }, []);
    // Fetch Projects Overview when period changes
    useEffect(() => {
        const fetchOverview = async () => {
            try {
                const data = await getProjectsOverview(overviewPeriod);
                setProjectsOverview(data);
                console.log('Successfully fetched Projects Overview');
            } catch (error: any) {
                console.error('Failed to fetch Projects Overview:', error.response?.status || error.message);
            }
        };
        fetchOverview();
    }, [overviewPeriod]);

    // Fetch Cost Anatomy when period changes
    useEffect(() => {
        const fetchCostAnatomy = async () => {
            try {
                const data = await getCostAnatomy(costAnatomyPeriod);
                setCostAnatomy(data);
                console.log('Successfully fetched Cost Anatomy');
            } catch (error: any) {
                console.error('Failed to fetch Cost Anatomy:', error.response?.status || error.message);
            }
        };
        fetchCostAnatomy();
    }, [costAnatomyPeriod]);

    // Fetch Nature Breakdown when period changes
    useEffect(() => {
        const fetchNature = async () => {
            try {
                const data = await getProjectNatureBreakdown(naturePeriod);
                setNature(data);
                console.log('Successfully fetched Nature Breakdown');
            } catch (error: any) {
                console.error('Failed to fetch Nature Breakdown:', error.response?.status || error.message);
            }
        };
        fetchNature();
    }, [naturePeriod]);

    // Fetch Portfolio Status when period changes
    useEffect(() => {
        const fetchPortfolio = async () => {
            try {
                const data = await getProjectStatusChart(portfolioPeriod);
                // Map ProjectStatusCount to ProjectPortfolioStatus (though they might be the same interface)
                setPortfolio(data as ProjectPortfolioStatus[]);
                console.log('Successfully fetched Portfolio Status');
            } catch (error: any) {
                console.error('Failed to fetch Portfolio Status:', error.response?.status || error.message);
            }
        };
        fetchPortfolio();
    }, [portfolioPeriod]);

    // Fetch Executive Summary when period changes
    useEffect(() => {
        const fetchExecutive = async () => {
            try {
                const data = await getExecutiveSummary(executivePeriod);
                setSummary(data);
                console.log('Successfully fetched Executive Summary');
            } catch (error: any) {
                console.error('Failed to fetch Executive Summary:', error.response?.status || error.message);
            }
        };
        fetchExecutive();
    }, [executivePeriod]);

    // Fetch Geo Revenue when period changes
    useEffect(() => {
        const fetchGeo = async () => {
            try {
                const data = await getGeoRevenueMap(geoPeriod);
                setGeo(data);
                console.log('Successfully fetched Geo Revenue');
            } catch (error: any) {
                console.error('Failed to fetch Geo Revenue:', error.response?.status || error.message);
            }
        };
        fetchGeo();
    }, [geoPeriod]);

    // Fetch Delivery Health when period changes
    useEffect(() => {
        const fetchHealth = async () => {
            try {
                const data = await getProjectDeliveryHealth(healthPeriod);
                setHealth(data);
                console.log('Successfully fetched Delivery Health');
            } catch (error: any) {
                console.error('Failed to fetch Delivery Health:', error.response?.status || error.message);
            }
        };
        fetchHealth();
    }, [healthPeriod]);

    // Fetch Revenue by Creator when period changes
    useEffect(() => {
        const fetchCreators = async () => {
            try {
                const data = await getRevenueByCreator(creatorPeriod);
                setCreators(data);
                console.log('Successfully fetched Revenue by Creator');
            } catch (error: any) {
                console.error('Failed to fetch Revenue by Creator:', error.response?.status || error.message);
            }
        };
        fetchCreators();
    }, [creatorPeriod]);

    useEffect(() => {
        const fetchServerAnalytics = async () => {
            try {
                const data = await getServerAnalytics(serverPeriod, serverStartDate, serverEndDate);
                setServerAnalytics(data);
                console.log('Successfully fetched Server Analytics');
            } catch (error: any) {
                console.error('Failed to fetch Server Analytics:', error);
            }
        };
        fetchServerAnalytics();
    }, [serverPeriod, serverTrigger]); // Only trigger on period change or explicit trigger change

    // Fetch Domain Analytics
    useEffect(() => {
        const fetchDomainAnalytics = async () => {
            try {
                const data = await getDomainAnalytics(domainPeriod, domainStartDate, domainEndDate);
                setDomainAnalytics(data);
                console.log('Successfully fetched Domain Analytics');
            } catch (error: any) {
                console.error('Failed to fetch Domain Analytics:', error);
            }
        };
        fetchDomainAnalytics();
    }, [domainPeriod, domainTrigger]); // Only trigger on period change or explicit trigger change

    // Handle hash scrolling when URL hash changes
    useEffect(() => {
        if (!loading && location.hash) {
            const id = location.hash.replace('#', '');
            const element = document.getElementById(id);
            if (element) {
                // Wait a bit for charts to potentially render if it's initial load
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        }
    }, [location.hash, loading]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <div style={{ color: 'var(--color-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <Activity size={48} className="animate-pulse" />
                    <p style={{ fontWeight: 500, letterSpacing: '0.05em' }}>PREPARING EXECUTIVE BRIEFING...</p>
                </div>
            </div>
        );
    }

    // Chart Data Definitions with Premium Colors
    const portfolioChart = {
        labels: portfolio.map(p => p.status),
        datasets: [{
            data: portfolio.map(p => p.count),
            backgroundColor: [
                '#4f46e5', // Primary Blue
                '#10b981', // Success Green
                '#f59e0b', // Warning Amber
                '#0ea5e9', // Secondary Purple
                '#ef4444', // Danger Red
                '#8b5cf6'  // Accent Pink
            ],
            borderColor: 'var(--color-surface)',
            borderWidth: 3,
            hoverOffset: 20
        }]
    };

    const healthChart = {
        labels: health.map(h => h.status),
        datasets: [{
            data: health.map(h => h.count),
            backgroundColor: ['#10b981', '#4f46e5', '#ef4444'],
            borderColor: 'var(--color-surface)',
            borderWidth: 2,
        }]
    };

    const overviewChart = {
        labels: projectsOverview?.monthly_trends.map(t => t.month) || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [
            {
                type: 'line' as const,
                label: 'Revenue',
                data: projectsOverview?.monthly_trends.map(t => t.revenue) || [65, 85, 75, 108, 78, 82, 85],
                yAxisID: 'y',
                borderColor: 'var(--color-primary)',
                borderWidth: 2,
                borderDash: [5, 5],
                fill: true,
                backgroundColor: '#4f46e51a',
                pointBackgroundColor: '#4f46e5',
                pointBorderColor: 'var(--color-surface)',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
                tension: 0.4
            },
            {
                type: 'bar' as const,
                label: 'Number of Projects',
                data: projectsOverview?.monthly_trends.map(t => t.number_of_projects) || [40, 55, 45, 68, 42, 58, 62],
                yAxisID: 'y1',
                backgroundColor: '#0ea5e9',
                borderRadius: 4,
                barThickness: 28,
                categoryPercentage: 0.8,
                barPercentage: 0.8
            },
            {
                type: 'bar' as const,
                label: 'Active Projects',
                data: projectsOverview?.monthly_trends.map(t => t.active_projects) || [12, 18, 15, 17, 21, 24, 26],
                yAxisID: 'y1',
                backgroundColor: '#f59e0b',
                borderRadius: 4,
                barThickness: 28,
                categoryPercentage: 0.8,
                barPercentage: 0.8
            }
        ]
    };

    const costAnatomyChart = {
        labels: costAnatomy.map(c => c.category),
        datasets: [{
            data: costAnatomy.map(c => c.percentage),
            backgroundColor: ['#4f46e5', '#0ea5e9', '#8b5cf6'],
            borderWidth: 2,
            borderColor: 'var(--color-surface)'
        }]
    };

    const natureChart = {
        labels: nature.map(n => n.nature),
        datasets: [{
            label: 'Strategic Allocation',
            data: nature.map(n => n.count),
            backgroundColor: '#8b5cf6',
            borderRadius: 6,
            hoverBackgroundColor: '#8b5cf6'
        }]
    };

    const serverAccrualChart = {
        labels: serverAnalytics?.accrual_distribution.map(i => i.server_details__accrued_by || i.server_accrued_by || i.domain_details__accrued_by || i.domain_accrued_by || 'Unknown') || [],
        datasets: [{
            data: serverAnalytics?.accrual_distribution.map(i => i.count) || [],
            backgroundColor: ['#4f46e5', '#10b981'], // Blue, Green
            borderColor: 'var(--color-surface)',
            borderWidth: 2
        }]
    };

    const domainAccrualChart = {
        labels: domainAnalytics?.accrual_distribution.map(i => i.domain_details__accrued_by || i.domain_accrued_by || i.server_details__accrued_by || i.server_accrued_by || 'Unknown') || [],
        datasets: [{
            data: domainAnalytics?.accrual_distribution.map(i => i.count) || [],
            backgroundColor: ['#0ea5e9', '#f59e0b'], // Purple, Amber
            borderColor: 'var(--color-surface)',
            borderWidth: 2
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    color: '#94a3b8', // Slate 400 - visible in both themes
                    font: { family: 'Outfit', size: 12, weight: 600 },
                    usePointStyle: true,
                    padding: 30,
                    boxWidth: 8
                }
            },
            tooltip: {
                backgroundColor: 'var(--color-surface)',
                titleFont: { family: 'Outfit', size: 14, weight: 800 },
                bodyFont: { family: 'Outfit', size: 13, weight: 500 },
                padding: 16,
                cornerRadius: 12,
                borderColor: 'var(--color-border)',
                borderWidth: 1,
                usePointStyle: true,
                boxPadding: 8
            }
        }
    };

    const categoricalScales = {
        x: {
            grid: { display: false },
            ticks: { color: '#94a3b8', font: { family: 'Outfit' } }
        },
        y: {
            position: 'left' as const,
            grid: { color: 'rgba(148, 164, 184, 0.1)' },
            ticks: { color: '#94a3b8', font: { family: 'Outfit' } },
            beginAtZero: true
        }
    };

    return (
        <div id="overview" className="page-container" >
            <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 className="page-title">Executive Overview</h1>
                    <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem', fontSize: '1.1rem', fontWeight: 500 }}>
                        Real-time strategic intelligence for <span style={{ color: 'var(--color-primary)' }}>Extechnology</span> leadership
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>

                    <div className="glass-panel" style={{ padding: '0.75rem 1.25rem', textAlign: 'right', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div>
                            <p style={{ color: 'var(--color-primary)', fontWeight: 700, margin: 0, fontSize: '1rem' }}>
                                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                            <p style={{ color: 'var(--color-success)', fontSize: '0.75rem', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'flex-end' }}>
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', boxShadow: '0 0 8px currentColor' }} />
                                Live
                            </p>
                        </div>
                    </div>
                </div>
            </header>


            {/* Section 1: Strategic KPIs */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }} >
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <TrendingUp size={24} color="var(--color-primary)" />
                    Strategic Intelligence
                </h2>
                <div style={{ display: 'flex', background: 'var(--color-border-light)', padding: '0.25rem', borderRadius: '0.5rem' }}>
                    {(['ALL', 'WEEK', 'MONTH', 'YEAR'] as const).map(t => (
                        <button
                            key={t}
                            onClick={() => setExecutivePeriod(t)}
                            style={{
                                padding: '0.4rem 0.8rem',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                border: 'none',
                                background: t === executivePeriod ? 'var(--color-primary)' : 'transparent',
                                color: t === executivePeriod ? 'white' : 'var(--color-text-muted)',
                                borderRadius: '0.4rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >{t}</button>
                    ))}
                </div>
            </div >
            <div className="stagger-in" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '2.5rem',
                marginBottom: '2.5rem'
            }}>
                <StatCard title="Total Projected Value" value={summary?.total_budget || '0'} icon={DollarSign} color="var(--color-primary)" prefix="$" trend="+8.4%" />
                <StatCard title="Operational Burn" value={summary?.total_actual_cost || '0'} icon={Zap} color="var(--color-secondary)" prefix="$" trend="-2.1%" />
                <StatCard title="Net Ecosystem Yield" value={summary?.total_profit_loss || '0'} icon={TrendingUp} color="var(--color-success)" prefix="$" trend="+15.2%" />
            </div>

            <div className="stagger-in" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '2.5rem',
                marginBottom: '4rem'
            }}>
                <StatCard title="Active Talent Cloud" value={summary?.active_employees || 0} icon={Users} color="var(--color-accent)" trend="+12" />
                <div style={{ gridColumn: 'span 2' }}></div>
            </div>

            <div className="stagger-in" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '2rem',
                marginBottom: '4rem'
            }}>
                <StatCard title="Portfolio Intensity" value={summary?.total_projects || 0} icon={Briefcase} color="var(--color-warning)" />
                <StatCard title="Execution Velocity" value={summary?.active_projects || 0} icon={Activity} color="var(--color-success)" />
                <StatCard title="Milestone Attainment" value={summary?.completed_projects || 0} icon={CheckCircle} color="var(--color-primary)" />
                <StatCard title="Risk Sensitivity" value={summary?.delayed_projects || 0} icon={AlertCircle} color="var(--color-danger)" />
            </div>

            {/* Section 2: Portfolio Intelligence */}
            <div id="portfolio" className="stagger-in" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
                gap: '2.5rem',
                marginBottom: '4rem'
            }}>
                <ChartContainer
                    title="Projects Status"
                    icon={Target}
                    headerAction={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <button
                                className="btn"
                                onClick={() => navigate('/projects')}
                                style={{
                                    padding: '0.4rem 0.8rem',
                                    fontSize: '0.75rem',
                                    background: 'var(--color-primary-subtle)',
                                    border: '1px solid var(--color-primary-subtle)',
                                    color: 'var(--color-primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.4rem'
                                }}
                            >
                                <Activity size={14} />
                                Full Status
                            </button>
                            <div style={{ display: 'flex', background: 'var(--color-border-light)', padding: '0.25rem', borderRadius: '0.5rem' }}>
                                {(['ALL', 'WEEK', 'MONTH', 'YEAR'] as const).map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setPortfolioPeriod(t)}
                                        style={{
                                            padding: '0.4rem 0.8rem',
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            border: 'none',
                                            background: t === portfolioPeriod ? 'var(--color-primary)' : 'transparent',
                                            color: t === portfolioPeriod ? 'white' : 'var(--color-text-muted)',
                                            borderRadius: '0.4rem',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >{t}</button>
                                ))}
                            </div>
                        </div>
                    }
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div style={{ height: '240px', position: 'relative' }}>
                            <Doughnut
                                data={portfolioChart}
                                options={{
                                    ...chartOptions,
                                    cutout: '80%',
                                    plugins: { ...chartOptions.plugins, legend: { display: false } }
                                }}
                            />
                        </div>

                        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                                <span style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--color-text)' }}>
                                    {portfolio.reduce((sum, p) => sum + p.count, 0)}
                                </span>
                                <div style={{ textAlign: 'left' }}>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-dim)', fontWeight: 600, margin: 0 }}>Total Projects</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--color-success)', fontSize: '0.875rem', fontWeight: 700 }}>
                                        <TrendingUp size={14} />
                                        <span>+3 New</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {portfolio.map((item, idx) => (
                                <div key={idx} style={{
                                    padding: '1rem 0',
                                    borderBottom: idx === portfolio.length - 1 ? 'none' : '1px dashed var(--color-border-light)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: portfolioChart.datasets[0].backgroundColor[idx % portfolioChart.datasets[0].backgroundColor.length] }} />
                                        <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text)' }}>{item.status}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                        <span style={{ fontSize: '1rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>{item.count} Projects</span>
                                        <span style={{ fontSize: '1rem', color: 'var(--color-success)', fontWeight: 700 }}>{Math.floor(item.count * 150)}hrs</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </ChartContainer>

                <ChartContainer
                    title="Delivery Compliance Health"
                    icon={CheckCircle}
                    headerAction={
                        <div style={{ display: 'flex', background: 'var(--color-border-light)', padding: '0.25rem', borderRadius: '0.5rem' }}>
                            {(['ALL', 'WEEK', 'MONTH', 'YEAR'] as const).map(t => (
                                <button
                                    key={t}
                                    onClick={() => setHealthPeriod(t)}
                                    style={{
                                        padding: '0.4rem 0.8rem',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        border: 'none',
                                        background: t === healthPeriod ? 'var(--color-primary)' : 'transparent',
                                        color: t === healthPeriod ? 'white' : 'var(--color-text-muted)',
                                        borderRadius: '0.4rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                >{t}</button>
                            ))}
                        </div>
                    }
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div style={{ height: '240px', position: 'relative' }}>
                            <Pie
                                data={healthChart}
                                options={{
                                    ...chartOptions,
                                    plugins: { ...chartOptions.plugins, legend: { display: false } }
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {health.map((item, idx) => (
                                <div key={idx} style={{
                                    padding: '0.85rem 0',
                                    borderBottom: idx === health.length - 1 ? 'none' : '1px dashed var(--color-border-light)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: healthChart.datasets[0].backgroundColor[idx % healthChart.datasets[0].backgroundColor.length] }} />
                                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text)' }}>{item.status}</span>
                                    </div>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--color-text-dim)', fontWeight: 500 }}>{item.count} Projects</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </ChartContainer>

                <ChartContainer
                    title="Budget Utility Analysis"
                    icon={TrendingUp}
                    headerAction={
                        <div style={{ display: 'flex', background: 'var(--color-bg)', padding: '0.25rem', borderRadius: '0.5rem' }}>
                            {(['ALL', '1M', '6M', '1Y'] as const).map(t => (
                                <button
                                    key={t}
                                    onClick={() => setCostAnatomyPeriod(t)}
                                    style={{
                                        padding: '0.4rem 0.8rem',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        border: 'none',
                                        background: t === costAnatomyPeriod ? 'var(--color-primary)' : 'transparent',
                                        color: t === costAnatomyPeriod ? 'white' : 'var(--color-text-muted)',
                                        borderRadius: '0.4rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                >{t}</button>
                            ))}
                        </div>
                    }
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div style={{ height: '240px', position: 'relative' }}>
                            <Pie
                                data={costAnatomyChart}
                                options={{
                                    ...chartOptions,
                                    plugins: { ...chartOptions.plugins, legend: { display: false } }
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {costAnatomy.map((item, idx) => (
                                <div key={idx} style={{
                                    padding: '0.85rem 0',
                                    borderBottom: idx === costAnatomy.length - 1 ? 'none' : '1px dashed var(--color-border-light)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: costAnatomyChart.datasets[0].backgroundColor[idx % costAnatomyChart.datasets[0].backgroundColor.length] }} />
                                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text)' }}>{item.category}</span>
                                    </div>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--color-success)', fontWeight: 700 }}>{item.percentage}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </ChartContainer>
            </div>

            {/* Section: Asset Intelligence */}
            <div id="assets" className="stagger-in" style={{ marginBottom: '4rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 2rem 0', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Server size={24} color="var(--color-primary)" />
                    Asset Intelligence
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2.5rem' }}>
                    {/* Server Analytics */}
                    <ChartContainer
                        title="Server Infrastructure"
                        icon={Server}
                        headerAction={
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
                                    <div style={{ display: 'flex', background: 'var(--color-bg)', padding: '0.25rem', borderRadius: '0.5rem' }}>
                                        {(['all', 'today', 'this_month', 'this_year', 'custom'] as const).map(t => (
                                            <button
                                                key={t}
                                                onClick={() => setServerPeriod(t)}
                                                style={{
                                                    padding: '0.4rem 0.8rem',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 700,
                                                    border: 'none',
                                                    background: t === serverPeriod ? 'var(--color-primary)' : 'transparent',
                                                    color: t === serverPeriod ? 'white' : 'var(--color-text-muted)',
                                                    borderRadius: '0.4rem',
                                                    cursor: 'pointer',
                                                    textTransform: 'capitalize'
                                                }}
                                            >{t.replace('_', ' ')}</button>
                                        ))}
                                    </div>
                                    <button
                                        className="btn"
                                        onClick={() => navigate('/assets/servers')}
                                        style={{
                                            padding: '0.3rem 0.6rem',
                                            fontSize: '0.65rem',
                                            background: 'rgba(59, 130, 246, 0.1)',
                                            color: 'var(--color-primary)',
                                            border: '1px solid rgba(59, 130, 246, 0.2)'
                                        }}
                                    >
                                        View All Servers
                                    </button>
                                </div>
                                {serverPeriod === 'custom' && (
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input
                                            type="date"
                                            value={serverStartDate}
                                            onChange={(e) => setServerStartDate(e.target.value)}
                                            className="date-input"
                                            style={{
                                                background: 'var(--color-border-light)',
                                                border: '1px solid var(--color-border)',
                                                color: 'var(--color-text)',
                                                padding: '0.4rem 0.8rem',
                                                borderRadius: '0.4rem',
                                                fontSize: '0.75rem',
                                                outline: 'none'
                                            }}
                                        />
                                        <input
                                            type="date"
                                            value={serverEndDate}
                                            onChange={(e) => setServerEndDate(e.target.value)}
                                            className="date-input"
                                            style={{
                                                background: 'var(--color-border-light)',
                                                border: '1px solid var(--color-border)',
                                                color: 'var(--color-text)',
                                                padding: '0.4rem 0.8rem',
                                                borderRadius: '0.4rem',
                                                fontSize: '0.75rem',
                                                outline: 'none'
                                            }}
                                        />
                                        <button
                                            onClick={() => setServerTrigger(prev => prev + 1)}
                                            style={{
                                                background: 'var(--color-primary)',
                                                color: 'var(--color-text-on-primary)',
                                                border: 'none',
                                                padding: '0.4rem 1rem',
                                                borderRadius: '0.4rem',
                                                fontSize: '0.75rem',
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
                                            onMouseOut={(e) => e.currentTarget.style.filter = 'brightness(1)'}
                                        >
                                            Apply
                                        </button>
                                    </div>
                                )}
                            </div>
                        }
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', height: '100%' }}>
                            <div style={{ position: 'relative', minHeight: '240px' }}>
                                <Doughnut
                                    data={serverAccrualChart}
                                    options={{
                                        ...chartOptions,
                                        plugins: {
                                            ...chartOptions.plugins,
                                            legend: { ...chartOptions.plugins.legend, position: 'bottom', display: true }
                                        }
                                    }}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div className="glass-panel" style={{ padding: '1rem', background: 'var(--color-danger-subtle)', border: '1px solid var(--color-danger)' }}>
                                    <p style={{ color: 'var(--color-danger)', fontSize: '0.8rem', fontWeight: 700, margin: 0, textTransform: 'uppercase' }}>Expiring Assets</p>
                                    <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text)', margin: '0.5rem 0' }}>{serverAnalytics?.total_expiring_assets || 0}</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)', margin: 0 }}>Requires immediate attention</p>
                                </div>
                                <div>
                                    {serverAnalytics?.expiration_status.map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px dashed var(--color-border-light)' }}>
                                            <span style={{ color: 'var(--color-text-dim)', fontSize: '0.9rem' }}>{item.health_status}</span>
                                            <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>{item.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </ChartContainer>

                    {/* Domain Analytics */}
                    <ChartContainer
                        title="Domain Portfolio"
                        icon={Globe}
                        headerAction={
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', background: 'var(--color-bg)', padding: '0.25rem', borderRadius: '0.5rem' }}>
                                    {(['all', 'today', 'this_month', 'this_year', 'custom'] as const).map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setDomainPeriod(t)}
                                            style={{
                                                padding: '0.4rem 0.8rem',
                                                fontSize: '0.75rem',
                                                fontWeight: 700,
                                                border: 'none',
                                                background: t === domainPeriod ? 'var(--color-primary)' : 'transparent',
                                                color: t === domainPeriod ? 'white' : 'var(--color-text-muted)',
                                                borderRadius: '0.4rem',
                                                cursor: 'pointer',
                                                textTransform: 'capitalize'
                                            }}
                                        >{t.replace('_', ' ')}</button>
                                    ))}
                                </div>
                                <button
                                    className="btn"
                                    onClick={() => navigate('/assets/domains')}
                                    style={{
                                        padding: '0.3rem 0.6rem',
                                        fontSize: '0.65rem',
                                        background: 'rgba(59, 130, 246, 0.1)',
                                        color: 'var(--color-primary)',
                                        border: '1px solid rgba(59, 130, 246, 0.2)'
                                    }}
                                >
                                    View All Domains
                                </button>
                                {domainPeriod === 'custom' && (
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input
                                            type="date"
                                            value={domainStartDate}
                                            onChange={(e) => setDomainStartDate(e.target.value)}
                                            className="date-input"
                                            style={{
                                                background: 'var(--color-border-light)',
                                                border: '1px solid var(--color-border)',
                                                color: 'var(--color-text)',
                                                padding: '0.4rem 0.8rem',
                                                borderRadius: '0.4rem',
                                                fontSize: '0.75rem',
                                                outline: 'none'
                                            }}
                                        />
                                        <input
                                            type="date"
                                            value={domainEndDate}
                                            onChange={(e) => setDomainEndDate(e.target.value)}
                                            className="date-input"
                                            style={{
                                                background: 'var(--color-border-light)',
                                                border: '1px solid var(--color-border)',
                                                color: 'var(--color-text)',
                                                padding: '0.4rem 0.8rem',
                                                borderRadius: '0.4rem',
                                                fontSize: '0.75rem',
                                                outline: 'none'
                                            }}
                                        />
                                        <button
                                            onClick={() => setDomainTrigger(prev => prev + 1)}
                                            style={{
                                                background: 'var(--color-primary)',
                                                color: 'var(--color-text-on-primary)',
                                                border: 'none',
                                                padding: '0.4rem 1rem',
                                                borderRadius: '0.4rem',
                                                fontSize: '0.75rem',
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
                                            onMouseOut={(e) => e.currentTarget.style.filter = 'brightness(1)'}
                                        >
                                            Apply
                                        </button>
                                    </div>
                                )}
                            </div>
                        }
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', height: '100%' }}>
                            <div style={{ position: 'relative', minHeight: '240px' }}>
                                <Doughnut
                                    data={domainAccrualChart}
                                    options={{
                                        ...chartOptions,
                                        plugins: {
                                            ...chartOptions.plugins,
                                            legend: { ...chartOptions.plugins.legend, position: 'bottom', display: true }
                                        }
                                    }}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div className="glass-panel" style={{ padding: '1rem', background: 'var(--color-warning-subtle)', border: '1px solid var(--color-warning)' }}>
                                    <p style={{ color: 'var(--color-warning)', fontSize: '0.8rem', fontWeight: 700, margin: 0, textTransform: 'uppercase' }}>Expiring Domains</p>
                                    <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text)', margin: '0.5rem 0' }}>{domainAnalytics?.total_expiring_assets || 0}</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)', margin: 0 }}>Review renewal status</p>
                                </div>
                                <div>
                                    {domainAnalytics?.expiration_status.map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px dashed var(--color-border-light)' }}>
                                            <span style={{ color: 'var(--color-text-dim)', fontSize: '0.9rem' }}>{item.health_status}</span>
                                            <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>{item.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </ChartContainer>
                </div>
            </div>

            {/* Section 3: Strategic Projects Overview */}
            <div id="finance" className="stagger-in" style={{
                marginBottom: '4rem'
            }}>
                <ChartContainer
                    title="Projects Overview"
                    icon={BarChart3}
                    height="540px"
                    headerAction={
                        <div style={{ display: 'flex', background: 'var(--color-border-light)', padding: '0.25rem', borderRadius: '0.5rem' }}>
                            {(['ALL', '1M', '6M', '1Y'] as const).map(t => (
                                <button
                                    key={t}
                                    onClick={() => setOverviewPeriod(t)}
                                    style={{
                                        padding: '0.4rem 0.8rem',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        border: 'none',
                                        background: t === overviewPeriod ? 'var(--color-primary)' : 'transparent',
                                        color: t === overviewPeriod ? 'white' : 'var(--color-text-muted)',
                                        borderRadius: '0.4rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                >{t}</button>
                            ))}
                        </div>
                    }
                    summaryItems={[
                        { label: 'Number of Projects', value: projectsOverview?.number_of_projects || 0 },
                        { label: 'Active Projects', value: projectsOverview?.active_projects || 0 },
                        { label: 'Revenue', value: `$${projectsOverview?.revenue ? (parseFloat(projectsOverview.revenue) / 1000).toFixed(2) : '0.00'} k`, color: '#3b82f6' },
                        { label: 'Working Hours', value: `${projectsOverview?.working_hours?.toLocaleString() || '0'} h`, color: '#10b981' }
                    ]}
                >
                    <Chart type="bar" data={overviewChart} options={{
                        ...chartOptions,
                        scales: categoricalScales,
                        plugins: {
                            ...chartOptions.plugins,
                            legend: {
                                display: true,
                                position: 'bottom',
                                labels: {
                                    usePointStyle: true,
                                    padding: 20,
                                    color: 'var(--color-text-dim)',
                                    font: { weight: 600, size: 11 }
                                }
                            }
                        },
                    }} />
                </ChartContainer>
            </div>

            <div className="stagger-in" style={{ marginBottom: '4rem' }}>
                <ChartContainer
                    title="Market Alignment & Nature Distribution"
                    icon={Globe}
                    height="400px"
                    headerAction={
                        <div style={{ display: 'flex', background: 'var(--color-border-light)', padding: '0.25rem', borderRadius: '0.5rem' }}>
                            {(['ALL', 'WEEK', 'MONTH', 'YEAR'] as const).map(t => (
                                <button
                                    key={t}
                                    onClick={() => setNaturePeriod(t)}
                                    style={{
                                        padding: '0.4rem 0.8rem',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        border: 'none',
                                        background: t === naturePeriod ? 'var(--color-primary)' : 'transparent',
                                        color: t === naturePeriod ? 'white' : 'var(--color-text-muted)',
                                        borderRadius: '0.4rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                >{t}</button>
                            ))}
                        </div>
                    }
                >
                    <Bar data={natureChart} options={{
                        ...chartOptions,
                        scales: categoricalScales,
                        indexAxis: 'y' as const,
                    }} />
                </ChartContainer>
            </div>

            {/* Section 4: Market Dynamics & Strategic Leadership */}
            <div id="workforce" className="stagger-in" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
                gap: '2.5rem',
                marginBottom: '4rem'
            }}>

                <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ padding: '0.5rem', background: 'var(--color-bg)', borderRadius: '0.75rem' }}>
                                <Globe size={20} color="var(--color-primary)" />
                            </div>
                            Global Market Engagement
                        </h3>
                        <div style={{ display: 'flex', background: 'var(--color-border-light)', padding: '0.25rem', borderRadius: '0.5rem' }}>
                            {(['ALL', 'WEEK', 'MONTH', 'YEAR'] as const).map(t => (
                                <button
                                    key={t}
                                    onClick={() => setGeoPeriod(t)}
                                    style={{
                                        padding: '0.4rem 0.8rem',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        border: 'none',
                                        background: t === geoPeriod ? 'var(--color-primary)' : 'transparent',
                                        color: t === geoPeriod ? 'white' : 'var(--color-text-muted)',
                                        borderRadius: '0.4rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                >{t}</button>
                            ))}
                        </div>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingRight: '0.5rem' }}>
                        {geo.map((item, idx) => (
                            <div key={idx} style={{
                                padding: '1.25rem',
                                background: 'var(--color-border-light)',
                                border: '1px solid var(--color-border-light)',
                                borderRadius: '1rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                transition: 'var(--transition-premium)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                    <div style={{ fontSize: '1.75rem', filter: 'drop-shadow(0 0 8px var(--color-primary-subtle))' }}>
                                        {item.country === 'USA' ? '🇺🇸' : item.country === 'India' ? '🇮🇳' : '🌍'}
                                    </div>
                                    <div>
                                        <p style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem' }}>{item.country}</p>
                                        <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>{item.project_count} Strategic Units</p>
                                    </div>
                                </div>
                                <span style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '1.25rem' }}>${item.revenue}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ padding: '0.5rem', background: 'var(--color-bg)', borderRadius: '0.75rem' }}>
                                <Target size={20} color="var(--color-primary)" />
                            </div>
                            Strategic Performance Leaders
                        </h3>
                        <div style={{ display: 'flex', background: 'var(--color-border-light)', padding: '0.25rem', borderRadius: '0.5rem' }}>
                            {(['ALL', 'WEEK', 'MONTH', 'YEAR'] as const).map(t => (
                                <button
                                    key={t}
                                    onClick={() => setCreatorPeriod(t)}
                                    style={{
                                        padding: '0.4rem 0.8rem',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        border: 'none',
                                        background: t === creatorPeriod ? 'var(--color-primary)' : 'transparent',
                                        color: t === creatorPeriod ? 'white' : 'var(--color-text-muted)',
                                        borderRadius: '0.4rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                >{t}</button>
                            ))}
                        </div>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingRight: '0.5rem' }}>
                        {creators.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '12px',
                                    background: idx === 0 ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 800,
                                    fontSize: '0.875rem',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                                }}>
                                    {idx + 1}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <p style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem' }}>{item.creator}</p>
                                        <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>${item.total_revenue}</span>
                                    </div>
                                    <div style={{ height: '6px', background: 'var(--color-border-light)', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{
                                            height: '100%',
                                            background: idx === 0 ? 'var(--color-warning)' : 'var(--color-primary)',
                                            borderRadius: '3px',
                                            width: `${(parseFloat(item.total_revenue) / parseFloat(creators[0].total_revenue)) * 100}% `,
                                            boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)'
                                        }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div >
    );
};

export default Dashboard;

