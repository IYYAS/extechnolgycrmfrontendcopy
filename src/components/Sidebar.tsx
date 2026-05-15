import React from 'react';
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import {
    LayoutDashboard,
    Users,
    Briefcase,
    Server,
    FileText,
    UserCircle,
    ChevronLeft,
    Menu as MenuIcon,
    Sun,
    Moon,
    Pipette,
    Building2,
    Clock,
    ClipboardList,
    Wallet,
    CalendarCheck,
    DollarSign,
    Receipt,
    BarChart3,
    Globe,
    UserCog,
    Layers,
    Bell,
    MessageSquare,
    Target
} from 'lucide-react';

import { useLocation, Link } from 'react-router-dom';
import { useTheme, type AccentColor } from '../context/ThemeContext';
import { usePermission } from '../hooks/usePermission';
import { getUnreadCount } from '../pages/notifications/notificationService';

interface SidebarProps {
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
}

const SidebarComponent: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
    const location = useLocation();
    const { mode, toggleMode, accentColor, setAccentColor } = useTheme();
    const [unreadCount, setUnreadCount] = React.useState(0);
    const [expiringServersCount, setExpiringServersCount] = React.useState(0);
    const [expiringDomainsCount, setExpiringDomainsCount] = React.useState(0);
    const [expiringExbotsCount, setExpiringExbotsCount] = React.useState(0);
    const [companyName, setCompanyName] = React.useState('Extechnology');
    const [companyLogo, setCompanyLogo] = React.useState<string | null>(null);

    const fetchCounts = async () => {
        try {
            const count = await getUnreadCount();
            setUnreadCount(count);
        } catch (error) {
            console.error('Failed to fetch unread count', error);
        }

        try {
            const { getCompanyProfiles } = await import('../pages/companyProfile/companyProfileService');
            const profiles = await getCompanyProfiles();
            if (profiles && profiles.length > 0) {
                setCompanyName(profiles[0].company_name);
                setCompanyLogo(profiles[0].logo);
            }
        } catch (error) {
            console.error('Failed to fetch company profile', error);
        }

        try {
            const { getServerAnalytics, getDomainAnalytics } = await import('../pages/dashboard/dashboardService');
            const [serverData, domainData] = await Promise.all([
                getServerAnalytics().catch(() => null),
                getDomainAnalytics().catch(() => null)
            ]);

            if (serverData?.servers_list) {
                const count = serverData.servers_list.filter(s => s.days_until_expiry !== undefined && s.days_until_expiry !== null && s.days_until_expiry > 0 && s.days_until_expiry <= 30).length;
                setExpiringServersCount(count);
            }

            if (domainData?.domains_list) {
                const count = domainData.domains_list.filter(d => d.days_until_expiry !== undefined && d.days_until_expiry !== null && d.days_until_expiry > 0 && d.days_until_expiry <= 30).length;
                setExpiringDomainsCount(count);
            }

            try {
                const { getExbots } = await import('../pages/exbot/exbotService');
                const exbotData = await getExbots(1, '');
                if (exbotData?.results) {
                    const { differenceInDays, parseISO } = await import('date-fns');
                    const now = new Date();
                    const count = exbotData.results.filter(b => {
                        const days = differenceInDays(parseISO(b.plan_deactive_date), now);
                        return days > 0 && days <= 30;
                    }).length;
                    setExpiringExbotsCount(count);
                }
            } catch (err) {
                console.error('Failed to fetch exbot counts for sidebar', err);
            }
        } catch (error) {
            console.error('Failed to fetch analytics for sidebar counts', error);
        }
    };

    React.useEffect(() => {
        fetchCounts();
    }, []);

    const isActive = (path: string) => location.pathname === path;

    const { hasPermission } = usePermission();
    const canView = (permission: string | string[]) => hasPermission(permission);

    const menuItemStyles = {
        button: ({ active }: { active: boolean }) => ({
            backgroundColor: active ? 'var(--primary-subtle)' : 'transparent',
            color: active ? 'var(--primary)' : 'var(--muted)',
            '&:hover': {
                backgroundColor: 'var(--primary-subtle)',
                color: 'var(--primary)',
            },
        }),
    };

    return (
        <Sidebar
            collapsed={collapsed}
            backgroundColor="var(--card)"
            rootStyles={{
                borderRight: '1px solid var(--border-color)',
                height: '100vh',
            }}
        >
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className="p-6 flex items-center justify-between border-b border-white/5">
                    {!collapsed && (
                        <div className="flex items-center space-x-3 overflow-hidden">
                            {companyLogo ? (
                                <div className="w-10 h-10 rounded-xl overflow-hidden border border-border shadow-sm flex-shrink-0 bg-white">
                                    <img src={companyLogo} alt="Logo" className="w-full h-full object-contain p-1" />
                                </div>
                            ) : (
                                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                                    {companyName.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <span className="text-foreground font-bold text-base tracking-tight truncate">{companyName}</span>
                        </div>
                    )}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-2 rounded-lg hover:bg-white/5 text-muted transition-colors"
                    >
                        {collapsed ? <MenuIcon size={20} /> : <ChevronLeft size={20} />}
                    </button>
                </div>

                {/* Theme Selector */}
                {!collapsed && (
                    <div className="px-6 py-4 border-b border-white/5 space-y-4">
                        <div className="flex items-center justify-between group relative">
                            <span className="text-xs font-semibold text-muted uppercase tracking-wider">Appearance</span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={toggleMode}
                                    className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all"
                                >
                                    {mode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2 text-muted">
                                <Pipette size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Accent Color</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {(['green', 'red', 'blue', 'purple'] as AccentColor[]).map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => setAccentColor(color)}
                                        className={`w-6 h-6 rounded-full border-2 transition-all ${accentColor === color
                                            ? 'border-white ring-2 ring-primary/50'
                                            : 'border-transparent shadow-sm'
                                            }`}
                                        style={{
                                            backgroundColor: color === 'green' ? '#10b981' :
                                                color === 'red' ? '#ef4444' :
                                                    color === 'blue' ? '#3b82f6' : '#a855f7'
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 py-4">
                    <Menu menuItemStyles={menuItemStyles}>
                        {canView('view_analytics') && (
                            <MenuItem
                                icon={<LayoutDashboard size={20} />}
                                component={<Link to="/dashboard" />}
                                active={isActive('/dashboard')}
                            >
                                Analytics
                            </MenuItem>
                        )}
                        <MenuItem
                            icon={<Bell size={20} />}
                            component={<Link to="/notifications" />}
                            active={isActive('/notifications')}
                            suffix={
                                unreadCount > 0 ? (
                                    <span className="bg-primary text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg shadow-primary/30 animate-pulse">
                                        {unreadCount}
                                    </span>
                                ) : undefined
                            }
                        >
                            Notifications
                        </MenuItem>
                        {canView('view_reports') && (
                            <MenuItem
                                icon={<BarChart3 size={20} />}
                                component={<Link to="/reports" />}
                                active={isActive('/reports')}
                            >
                                Reports
                            </MenuItem>
                        )}
                        {canView('view_user') && (
                            <MenuItem
                                icon={<Users size={20} />}
                                component={<Link to="/users" />}
                                active={isActive('/users')}
                            >
                                Users
                            </MenuItem>
                        )}

                        {(canView('view_team') || canView(['view_teamperformance', 'view_all_team_performance', 'view_own_team_performance'])) && (
                            <MenuItem
                                icon={<Layers size={20} />}
                                component={<Link to="/team-performance" />}
                                active={isActive('/team-performance')}
                            >
                                Teams
                            </MenuItem>
                        )}
                        {canView('view_project') && (
                            <MenuItem
                                icon={<Briefcase size={20} />}
                                component={<Link to="/projects" />}
                                active={isActive('/projects')}
                            >
                                Projects
                            </MenuItem>
                        )}
                        {canView('view_lead') && (
                            <MenuItem
                                icon={<Target size={20} />}
                                component={<Link to="/leads/dashboard" />}
                                active={location.pathname.startsWith('/leads')}
                            >
                                Leads
                            </MenuItem>
                        )}

                        {canView('view_projectserver') && (
                            <MenuItem
                                icon={<Server size={20} />}
                                component={<Link to="/infrastructure/servers" />}
                                active={isActive('/infrastructure/servers')}
                                suffix={
                                    expiringServersCount > 0 ? (
                                        <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg shadow-rose-500/30 animate-pulse">
                                            {expiringServersCount}
                                        </span>
                                    ) : undefined
                                }
                            >
                                Servers
                            </MenuItem>
                        )}
                        {canView('view_projectdomain') && (
                            <MenuItem
                                icon={<Globe size={20} />}
                                component={<Link to="/infrastructure/domains" />}
                                active={isActive('/infrastructure/domains')}
                                suffix={
                                    expiringDomainsCount > 0 ? (
                                        <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg shadow-rose-500/30 animate-pulse">
                                            {expiringDomainsCount}
                                        </span>
                                    ) : undefined
                                }
                            >
                                Domains
                            </MenuItem>
                        )}
                        {canView('view_projectexbot') && (
                            <MenuItem
                                icon={<MessageSquare size={20} />}
                                component={<Link to="/infrastructure/exbots" />}
                                active={isActive('/infrastructure/exbots')}
                                suffix={
                                    expiringExbotsCount > 0 ? (
                                        <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg shadow-rose-500/30 animate-pulse">
                                            {expiringExbotsCount}
                                        </span>
                                    ) : undefined
                                }
                            >
                                Exbots
                            </MenuItem>
                        )}

                        {canView('view_invoice') && (
                            <MenuItem
                                icon={<FileText size={20} />}
                                component={<Link to="/invoices/company-summary" />}
                                active={isActive('/invoices/company-summary')}
                            >
                                Invoices
                            </MenuItem>
                        )}
                        {canView('view_otherincome') && (
                            <MenuItem
                                icon={<DollarSign size={20} />}
                                component={<Link to="/other-incomes" />}
                                active={isActive('/other-incomes')}
                            >
                                Other Incomes
                            </MenuItem>
                        )}
                        {canView('view_otherexpense') && (
                            <MenuItem
                                icon={<Receipt size={20} />}
                                component={<Link to="/other-expenses" />}
                                active={isActive('/other-expenses')}
                            >
                                Other Expenses
                            </MenuItem>
                        )}
                        {canView(['view_all_activities', 'view_own_activities']) && (
                            <MenuItem
                                icon={<Clock size={20} />}
                                component={<Link to="/activities" />}
                                active={isActive('/activities')}
                            >
                                Activities
                            </MenuItem>
                        )}
                        {canView('view_attendance') && (
                            <MenuItem
                                icon={<CalendarCheck size={20} />}
                                component={<Link to="/attendance" />}
                                active={isActive('/attendance')}
                            >
                                Attendance
                            </MenuItem>
                        )}
                        {canView('view_employeeleave') && (
                            <MenuItem
                                icon={<ClipboardList size={20} />}
                                component={<Link to="/leaves" />}
                                active={isActive('/leaves')}
                            >
                                Leaves
                            </MenuItem>
                        )}
                        {canView('view_salary') && (
                            <MenuItem
                                icon={<Wallet size={20} />}
                                component={<Link to="/salaries" />}
                                active={isActive('/salaries')}
                            >
                                Salaries
                            </MenuItem>
                        )}
                        {canView('view_usersalary') && (
                            <MenuItem
                                icon={<UserCog size={20} />}
                                component={<Link to="/user-salaries" />}
                                active={isActive('/user-salaries')}
                            >
                                Set Salaries
                            </MenuItem>
                        )}
                        {canView(['view_all_employee_performance', 'view_own_employee_performance']) && (
                            <MenuItem
                                icon={<BarChart3 size={20} />}
                                component={<Link to="/employee-performance" />}
                                active={isActive('/employee-performance')}
                            >
                                Employee Performance
                            </MenuItem>
                        )}

                        <MenuItem
                            icon={<UserCircle size={20} />}
                            component={<Link to="/profile" />}
                            active={isActive('/profile')}
                        >
                            Profile
                        </MenuItem>
                        {canView('view_companyprofile') && (
                            <MenuItem
                                icon={<Building2 size={20} />}
                                component={<Link to="/company-profile" />}
                                active={isActive('/company-profile')}
                            >
                                Extech Profile
                            </MenuItem>
                        )}
                        {canView('view_role') && (
                            <MenuItem
                                icon={<UserCog size={20} />}
                                component={<Link to="/roles" />}
                                active={isActive('/roles')}
                            >
                                Role Management
                            </MenuItem>
                        )}
                    </Menu>
                </div>

            </div>
        </Sidebar>
    );
};

export default SidebarComponent;
