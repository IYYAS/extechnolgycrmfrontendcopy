import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Briefcase, Layout, LogOut, User, Settings, DollarSign, ChevronDown, ChevronRight, Clock, Timer, Globe, Server, FileText, Eye, Sun, Moon } from 'lucide-react';


const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
        Operations: false,
        Finance: false,
        Assets: false,
        Management: false
    });

    // Get user info from localStorage
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const is_superuser = user?.is_superuser || false;
    const is_admin = user?.is_admin || false;
    const is_billing = user?.role === 'Billing';

    // ---- View Switching Logic ----
    type ViewMode = 'Super Admin' | 'Admin' | 'Billing' | 'Developer';

    // Determine available views based on role
    const getAvailableViews = (): ViewMode[] => {
        if (is_superuser) return ['Super Admin', 'Admin', 'Billing', 'Developer'];
        if (is_admin) return ['Admin', 'Billing', 'Developer'];
        if (is_billing) return ['Billing', 'Developer'];
        return ['Developer'];
    };

    const availableViews = getAvailableViews();

    // Initial view is the highest privilege available
    const [currentView, setCurrentView] = useState<ViewMode>(() => {
        const savedView = localStorage.getItem('currentViewMode');
        if (savedView && availableViews.includes(savedView as ViewMode)) {
            return savedView as ViewMode;
        }
        return availableViews[0];
    });

    const [isViewSwitcherOpen, setIsViewSwitcherOpen] = useState(false);

    const handleSwitchView = (view: ViewMode) => {
        setCurrentView(view);
        localStorage.setItem('currentViewMode', view);
        setIsViewSwitcherOpen(false);
        // Optional: Navigate to dashboard when switching views to avoid dead links?
        // navigate('/'); 
    };

    const isDashboardOpenState = useState(true);
    const [isDashboardOpen, setIsDashboardOpen] = isDashboardOpenState;
    const isDashboardActive = location.pathname === '/';

    // ---- Theme Switching Logic ----
    const [theme, setTheme] = useState<'dark' | 'light'>(() => {
        const savedTheme = localStorage.getItem('theme');
        return (savedTheme as 'dark' | 'light') || 'dark';
    });

    useEffect(() => {
        document.body.className = theme === 'light' ? 'light-theme' : '';
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

    const isAdminOrSuper = currentView === 'Admin' || currentView === 'Super Admin';

    // Define navigation groups with View Mode filtering
    const navGroups = [
        {
            id: 'Operations',
            label: 'Operations',
            icon: Briefcase,
            items: [
                { to: '/projects', icon: Layout, label: 'Projects', show: true },
                { to: '/projects/timeline', icon: Timer, label: 'Project Timeline', show: true },
                { to: '/daily-activities', icon: FileText, label: 'Daily Report', show: currentView !== 'Billing' },
            ],
            // Show in all views, but Developer view might hide specific advanced operations if needed.
            // Requirement: "Developer view: projects, daily reports" - Matches Operations.
            show: true
        },
        {
            id: 'Finance',
            label: 'Financials',
            icon: DollarSign,
            items: [
                { to: '/clients', icon: Briefcase, label: 'Clients', show: isAdminOrSuper }, // Only Admin sees List of All Clients? Or Billing too? Usually Billing needs clients.
                { to: '/billing', icon: DollarSign, label: 'Billing', show: true },
                { to: '/billing/recent-payments', icon: Clock, label: 'Recent Payments', show: true },
            ],
            // Show in Admin and Billing views
            show: isAdminOrSuper || currentView === 'Billing'
        },
        {
            id: 'Assets',
            label: 'Technical Assets',
            icon: Globe,
            items: [
                { to: '/assets/domains', icon: Globe, label: 'Domains', show: true },
                { to: '/assets/servers', icon: Server, label: 'Servers', show: true },
            ],
            // Show in Admin and Billing (maybe?) views. Assuming Admin only for now based on request "Admin only view admin...".
            // Actually request says: "Billing role only access to developer and billing not admin".
            // Assuming Assets is an Admin thing usually, or maybe Billing needs to know costs?
            // Let's stick to strict: Finance is for Billing/Admin. Assets for Admin? 
            // Previous code: show: is_superuser || is_admin || is_billing. So Billing can see Assets.
            show: isAdminOrSuper || currentView === 'Billing'
        },
        {
            id: 'Management',
            label: 'Administration',
            icon: Users,
            items: [
                { to: '/employees', icon: Users, label: 'Employees', show: true },
                { to: '/users', icon: Settings, label: 'Users', show: true },
            ],
            // STRICTLY Admin view only
            show: isAdminOrSuper
        }
    ];

    const toggleGroup = (groupId: string) => {
        const isOpening = !openGroups[groupId];

        setOpenGroups(prev => {
            const newState: Record<string, boolean> = {};
            // Close all groups
            Object.keys(prev).forEach(key => newState[key] = false);
            // Toggle the clicked one
            newState[groupId] = isOpening;
            return newState;
        });

        // Close dashboard if opening a group
        if (isOpening) {
            setIsDashboardOpen(false);

            // Navigate to the first visible item in this group
            const group = navGroups.find(g => g.id === groupId);
            if (group) {
                const visibleItems = group.items.filter(item => item.show !== false);
                // If we are NOT already on a sub-item of this group, navigate to the first one
                const isOnSubItem = visibleItems.some(item => location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to)));

                if (!isOnSubItem && visibleItems.length > 0) {
                    navigate(visibleItems[0].to);
                }
            }
        }
    };

    // Auto-expand group based on current route
    useEffect(() => {
        const activeGroup = navGroups.find(group =>
            group.items.some(item =>
                item.show !== false && (location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to)))
            )
        );
        if (activeGroup) {
            setOpenGroups(prev => ({
                ...prev,
                [activeGroup.id]: true
            }));
            setIsDashboardOpen(false);
        }
    }, [location.pathname]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('user');
        localStorage.removeItem('currentViewMode'); // Clear view mode on logout
        navigate('/login');
    };

    const dashboardSubItems = [
        { to: '/#overview', label: 'Briefing Overview', icon: LayoutDashboard },
        { to: '/#finance', label: 'Finance Insights', icon: DollarSign },
        { to: '/#portfolio', label: 'Project Analytics', icon: Layout },
        { to: '/#workforce', label: 'Workforce View', icon: Users },
    ];

    return (
        <aside style={{
            width: '280px',
            height: '100vh',
            backgroundColor: 'var(--color-surface)',
            borderRight: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            padding: '1.5rem',
            position: 'fixed',
            zIndex: 100
        }}>
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '0.5rem', marginBottom: '1.5rem' }}>
                    <div style={{
                        width: '32px', height: '32px',
                        background: 'var(--color-primary)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 12px var(--color-primary-subtle)'
                    }}>
                        <Briefcase size={18} color="var(--color-text-on-primary)" />
                    </div>
                    <h1 style={{
                        fontSize: '1.15rem',
                        fontWeight: 800,
                        margin: 0,
                        letterSpacing: '-0.025em',
                        color: 'var(--color-text)'
                    }}>Extechnology</h1>
                </div>

                {/* View Switcher - Only if more than 1 view available */}
                {availableViews.length > 1 && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <button
                                onClick={() => setIsViewSwitcherOpen(!isViewSwitcherOpen)}
                                style={{
                                    width: '100%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '0.625rem 0.875rem',
                                    backgroundColor: 'var(--color-bg)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-md)',
                                    color: 'var(--color-text)',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                    transition: 'var(--transition-fast)'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Eye size={14} style={{ color: 'var(--color-text-dim)' }} />
                                    <span style={{ color: 'var(--color-text-muted)' }}>View: <strong style={{ color: 'var(--color-text)' }}>{currentView}</strong></span>
                                </div>
                                <ChevronDown size={14} style={{ color: 'var(--color-text-dim)' }} />
                            </button>

                            {isViewSwitcherOpen && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%', left: 0, right: 0,
                                    marginTop: '4px',
                                    backgroundColor: 'var(--color-surface)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-md)',
                                    boxShadow: 'var(--shadow-xl)',
                                    zIndex: 10,
                                    overflow: 'hidden'
                                }}>
                                    {availableViews.map(view => (
                                        <button
                                            key={view}
                                            onClick={() => handleSwitchView(view)}
                                            style={{
                                                width: '100%',
                                                textAlign: 'left',
                                                padding: '0.625rem 0.875rem',
                                                background: currentView === view ? 'var(--color-primary-subtle)' : 'transparent',
                                                color: currentView === view ? 'var(--color-primary-light)' : 'var(--color-text)',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontSize: '0.8rem',
                                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                                transition: 'var(--transition-fast)'
                                            }}
                                        >
                                            <div style={{
                                                width: '6px', height: '6px', borderRadius: '50%',
                                                backgroundColor: currentView === view ? 'var(--color-primary)' : 'transparent'
                                            }} />
                                            {view} Mode
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Theme Toggle Button */}
                        <button
                            onClick={toggleTheme}
                            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            style={{
                                width: '40px',
                                height: '40px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                backgroundColor: 'var(--color-bg)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                color: 'var(--color-text)',
                                cursor: 'pointer',
                                transition: 'var(--transition-fast)'
                            }}
                        >
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                    </div>
                )}
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
                {/* Expandable Dashboard Item - Only show in Admin/Super Admin view */}
                {isAdminOrSuper && (
                    <div style={{ marginBottom: '0.5rem' }}>
                        <button
                            onClick={() => {
                                const isOpening = !isDashboardOpen;
                                setIsDashboardOpen(isOpening);
                                if (isOpening) {
                                    // Close all other groups
                                    setOpenGroups(prev => {
                                        const newState: Record<string, boolean> = {};
                                        Object.keys(prev).forEach(key => newState[key] = false);
                                        return newState;
                                    });
                                    // Navigate to dashboard overview
                                    navigate('/#overview');
                                }
                            }}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.75rem 1rem',
                                borderRadius: 'var(--radius-md)',
                                border: 'none',
                                background: 'transparent',
                                color: isDashboardActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                fontWeight: isDashboardActive ? 600 : 500,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                textAlign: 'left'
                            }}
                        >
                            <LayoutDashboard size={20} color={isDashboardActive ? 'var(--color-primary)' : 'inherit'} />
                            <span style={{ flex: 1 }}>Dashboard</span>
                            {isDashboardOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>

                        {isDashboardOpen && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.25rem', paddingLeft: '1.5rem' }}>
                                {dashboardSubItems.map((sub) => {
                                    const hash = sub.to.includes('#') ? '#' + sub.to.split('#')[1] : null;
                                    const isSubActive = hash ? (location.hash === hash && location.pathname === '/') : (location.pathname === sub.to);

                                    const handleSubClick = () => {
                                        if (isSubActive && hash) {
                                            const element = document.getElementById(hash.substring(1));
                                            if (element) {
                                                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                            }
                                        }
                                    };

                                    return (
                                        <NavLink
                                            key={sub.to}
                                            to={sub.to}
                                            onClick={handleSubClick}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.75rem',
                                                padding: '0.5rem 1rem',
                                                borderRadius: 'var(--radius-md)',
                                                textDecoration: 'none',
                                                color: isSubActive ? 'var(--color-primary-light)' : 'var(--color-text-dim)',
                                                fontSize: '0.8125rem',
                                                fontWeight: isSubActive ? 600 : 400,
                                                transition: 'all 0.2s ease',
                                                backgroundColor: isSubActive ? 'var(--color-primary-subtle)' : 'transparent',
                                                position: 'relative'
                                            }}
                                        >
                                            {isSubActive && <div style={{ position: 'absolute', left: 0, width: '2px', height: '14px', backgroundColor: 'var(--color-primary)', borderRadius: '0 2px 2px 0' }} />}
                                            <sub.icon size={14} opacity={isSubActive ? 1 : 0.6} />
                                            {sub.label}
                                        </NavLink>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Grouped Nav Items */}
                {navGroups.filter(g => g.show).map((group) => {
                    const isGroupActive = group.items.some(item =>
                        item.show !== false && (location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to)))
                    );
                    const isOpen = openGroups[group.id];

                    return (
                        <div key={group.id} style={{ marginBottom: '0.5rem' }}>
                            <button
                                onClick={() => toggleGroup(group.id)}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.75rem 1rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: 'none',
                                    background: 'transparent',
                                    color: (isGroupActive || isOpen) ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                    fontWeight: (isGroupActive || isOpen) ? 600 : 500,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    textAlign: 'left'
                                }}
                            >
                                <group.icon size={18} color={(isGroupActive || isOpen) ? 'var(--color-primary)' : 'inherit'} opacity={(isGroupActive || isOpen) ? 1 : 0.7} />
                                <span style={{ flex: 1, fontSize: '0.9rem' }}>{group.label}</span>
                                {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </button>

                            {isOpen && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.25rem', paddingLeft: '1rem' }}>
                                    {group.items.filter(item => item.show !== false).map((item) => (
                                        <NavLink
                                            key={item.to}
                                            to={item.to}
                                            style={({ isActive }) => ({
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.75rem',
                                                padding: '0.65rem 1rem',
                                                borderRadius: 'var(--radius-md)',
                                                textDecoration: 'none',
                                                color: isActive ? 'var(--color-text-on-primary)' : 'var(--color-text-muted)',
                                                backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
                                                fontSize: '0.875rem',
                                                fontWeight: isActive ? 600 : 400,
                                                transition: 'all 0.2s ease',
                                            })}
                                        >
                                            <item.icon size={16} />
                                            {item.label}
                                        </NavLink>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            <div style={{ padding: '1rem 0', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                    className="btn"
                    onClick={() => navigate('/profile')}
                    style={{
                        backgroundColor: 'var(--color-primary-subtle)',
                        color: 'var(--color-primary)',
                        justifyContent: 'flex-start',
                        padding: '0.75rem 1rem',
                        cursor: 'pointer',
                        width: '100%',
                        fontSize: '0.875rem'
                    }}>
                    <User size={18} />
                    My Profile
                </button>

                <button
                    className="btn"
                    onClick={handleLogout}
                    style={{
                        backgroundColor: 'var(--color-danger-subtle)',
                        color: 'var(--color-danger)',
                        justifyContent: 'flex-start',
                        padding: '0.75rem 1rem',
                        cursor: 'pointer',
                        width: '100%',
                        fontSize: '0.875rem'
                    }}>
                    <LogOut size={18} />
                    Logout
                </button>
            </div>
        </aside >
    );
};

export default Sidebar;
