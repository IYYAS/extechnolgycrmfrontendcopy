import React from 'react';
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import {
    LayoutDashboard,
    Users,
    Briefcase,
    Server,
    FileText,
    UserCircle,
    LogOut,
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
    UserCheck,
    BarChart3,
    Globe,
    UserCog,
    Layers
} from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTheme, type AccentColor } from '../context/ThemeContext';
import { usePermission } from '../hooks/usePermission';

interface SidebarProps {
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
}

const SidebarComponent: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { mode, toggleMode, accentColor, setAccentColor } = useTheme();

    let user: any = {};
    try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) user = JSON.parse(storedUser);
    } catch (e) {
        console.error('Sidebar: Failed to parse user data', e);
    }

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        localStorage.removeItem('active_role');
        navigate('/login');
    };

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
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
                                E
                            </div>
                            <span className="text-foreground font-bold text-lg tracking-tight">Extechnology</span>
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
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-muted uppercase tracking-wider">Appearance</span>
                            <button
                                onClick={toggleMode}
                                className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all"
                            >
                                {mode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                            </button>
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
                        {canView('view_employee') && (
                            <MenuItem
                                icon={<UserCheck size={20} />}
                                component={<Link to="/employees" />}
                                active={isActive('/employees')}
                            >
                                Employees
                            </MenuItem>
                        )}
                        {canView('view_team') && (
                            <MenuItem
                                icon={<Layers size={20} />}
                                component={<Link to="/teams" />}
                                active={isActive('/teams')}
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
                        {canView('view_projectserver') && (
                            <MenuItem
                                icon={<Server size={20} />}
                                component={<Link to="/infrastructure/servers" />}
                                active={isActive('/infrastructure/servers')}
                            >
                                Servers
                            </MenuItem>
                        )}
                        {canView('view_projectdomain') && (
                            <MenuItem
                                icon={<Globe size={20} />}
                                component={<Link to="/infrastructure/domains" />}
                                active={isActive('/infrastructure/domains')}
                            >
                                Domains
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
                        {canView(['view_teamperformance', 'view_all_team_performance', 'view_own_team_performance']) && (
                            <MenuItem
                                icon={<BarChart3 size={20} />}
                                component={<Link to="/team-performance" />}
                                active={isActive('/team-performance')}
                            >
                                Team Performance
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

                {/* Footer */}
                <div className="p-4 border-t border-border bg-muted/5">
                    {!collapsed && (
                        <div className="mb-4 px-2">
                            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Signed in as</p>
                            <p className="text-foreground font-medium truncate">{user.username || 'User'}</p>
                        </div>
                    )}
                    <Menu menuItemStyles={menuItemStyles}>
                        <MenuItem
                            icon={<LogOut size={20} />}
                            onClick={handleLogout}
                        >
                            Logout
                        </MenuItem>
                    </Menu>
                </div>
            </div>
        </Sidebar>
    );
};

export default SidebarComponent;
