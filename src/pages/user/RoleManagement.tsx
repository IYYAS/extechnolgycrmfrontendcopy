import React, { useState, useEffect } from 'react';
import { api } from '../../api/api';
import { motion } from 'framer-motion';
import { 
    LayoutDashboard, Users, Briefcase, Server, FileText, 
    Clock, Building2, ClipboardList, Wallet, CalendarCheck, 
    DollarSign, Receipt, UserCheck, BarChart3, Globe, 
    UserCog, Layers, Settings, Shield, ChevronRight, 
    CheckCircle2, Plus, X, Search 
} from 'lucide-react';

const SIDEBAR_MODULE_MAP: Record<string, string> = {
    'analytics': 'Dashboard & Analytics',
    'projectstats': 'Project Statistics',
    'server_stats': 'Server Statistics',
    'domain_stats': 'Domain Statistics',
    'reports': 'Reports',
    'user': 'Users',
    'employee': 'Employees',
    'team': 'Teams',
    'project': 'Projects',
    'projectserver': 'Servers',
    'projectdomain': 'Domains',
    'invoice': 'Invoices',
    'clientadvance': 'Client Advances',
    'invoiceitem': 'Invoice Items',
    'payment': 'Payments',
    'otherincome': 'Other Incomes',
    'otherexpense': 'Other Expenses',
    'all_activities': 'Activities (All)',
    'own_activities': 'Activities (Own)',
    'activityexceedcomment': 'Activity Exceed Comments',
    'activitylog': 'Activity Logs',
    'attendance': 'Attendance',
    'employeeleave': 'Leaves',
    'salary': 'Salaries',
    'usersalary': 'User Salaries',
    'all_employee_performance': 'Employee Performance (All)',
    'own_employee_performance': 'Employee Performance (Own)',
    'teamperformance': 'Team Performance',
    'all_team_performance': 'Team Performance (All)',
    'own_team_performance': 'Team Performance (Own)',
    'companyprofile': 'Extech Profile',
    'role': 'Role Management',
    'projectbaseinformation': 'Project Base Info',
    'projectbusinessaddress': 'Project Business Address',
    'projectclient': 'Project Client',
    'projectdocument': 'Project Document',
    'projectexecution': 'Project Execution',
    'projectexcution': 'Project Execution',
    'domainorserverthirdpartyserviceprovider': 'Third Party Service Providers',
    'projectfinance': 'Project Finances',
    'projectnature': 'Project Nature',
    'projectservice': 'Project Services',
    'projectservicemember': 'Project Service Members',
    'projectserviceteam': 'Project Service Teams',
    'projectteam': 'Project Teams',
    'projectteammember': 'Project Team Members'
};

const ACTION_MAP: Record<string, string> = {
    'view': 'View (Read Only)',
    'add': 'Create (Add New)',
    'change': 'Edit (Modify)',
    'delete': 'Delete (Remove)'
};

const PARENT_CATEGORY_MAP: Record<string, string> = {
    'project': 'Projects',
    'projectserver': 'Servers',
    'projectdomain': 'Domains',
    'projectbaseinformation': 'Projects',
    'projectbusinessaddress': 'Projects',
    'projectclient': 'Projects',
    'projectdocument': 'Projects',
    'projectexecution': 'Projects',
    'projectexcution': 'Projects',
    'domainorserverthirdpartyserviceprovider': 'Projects',
    'projectfinance': 'Projects',
    'projectnature': 'Projects',
    'projectservice': 'Projects',
    'projectservicemember': 'Projects',
    'projectserviceteam': 'Projects',
    'projectteam': 'Projects',
    'projectteammember': 'Projects',
    
    'employee': 'Employees',
    'employeeleave': 'Leaves',
    'salary': 'Salaries',
    'usersalary': 'Set Salaries',
    'all_employee_performance': 'Employee Performance',
    'own_employee_performance': 'Employee Performance',
    
    'team': 'Teams',
    'teamperformance': 'Team Performance',
    'all_team_performance': 'Team Performance',
    'own_team_performance': 'Team Performance',
    
    'all_activities': 'Activities',
    'own_activities': 'Activities',
    'activityexceedcomment': 'Activities',
    'activitylog': 'Activities',
    
    'invoice': 'Invoices',
    'clientadvance': 'Invoices',
    'invoiceitem': 'Invoices',
    'payment': 'Invoices',
    'otherincome': 'Other Incomes',
    'otherexpense': 'Other Expenses',
    
    'analytics': 'Analytics',
    'projectstats': 'Analytics',
    'server_stats': 'Analytics',
    'domain_stats': 'Analytics',
    'reports': 'Reports',
    'user': 'Users',
    'attendance': 'Attendance',
    'companyprofile': 'Extech Profile',
    'role': 'Role Management'
};

const CATEGORY_ICON_MAP: Record<string, any> = {
    'Analytics': LayoutDashboard,
    'Reports': BarChart3,
    'Users': Users,
    'Employees': UserCheck,
    'Teams': Layers,
    'Projects': Briefcase,
    'Servers': Server,
    'Domains': Globe,
    'Invoices': FileText,
    'Other Incomes': DollarSign,
    'Other Expenses': Receipt,
    'Activities': Clock,
    'Attendance': CalendarCheck,
    'Leaves': ClipboardList,
    'Salaries': Wallet,
    'Set Salaries': UserCog,
    'Employee Performance': BarChart3,
    'Team Performance': BarChart3,
    'Extech Profile': Building2,
    'Role Management': UserCog,
    'Other Modules': Settings
};

const CATEGORY_ORDER = [
    'Analytics',
    'Reports',
    'Users',
    'Employees',
    'Teams',
    'Projects',
    'Servers',
    'Domains',
    'Invoices',
    'Other Incomes',
    'Other Expenses',
    'Activities',
    'Attendance',
    'Leaves',
    'Salaries',
    'Set Salaries',
    'Employee Performance',
    'Team Performance',
    'Extech Profile',
    'Role Management',
    'Other Modules'
];

const formatModuleName = (mod: string) => {
    return SIDEBAR_MODULE_MAP[mod.toLowerCase()] || mod.replace(/_/g, ' ');
};

interface Role {
    id: number;
    name: string;
    permissions: string[];
}

const RoleManagement: React.FC = () => {
    const [permissions, setPermissions] = useState<string[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [selectedRole, setSelectedRole] = useState<string>('');
    const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [selectedModule] = useState<string>('All');
    const [expandedModules, setExpandedModules] = useState<string[]>([]);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const toggleModule = (mod: string) => {
        setExpandedModules(prev => prev.includes(mod) ? prev.filter(m => m !== mod) : [...prev, mod]);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [permRes, roleRes] = await Promise.all([
                api.get('/permissions/'),
                api.get('/roles/')
            ]);
            setPermissions(permRes.data);
            // Assuming /roles/ returns detailed roles with nested permission names
            const rolesData = roleRes.data.results || roleRes.data;
            setRoles(rolesData);
        } catch (error) {
            console.error('Failed to fetch RBAC data', error);
        }
    };

    const handleTogglePermission = (perm: string) => {
        setSelectedPermissions(prev => 
            prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
        );
    };

    const handleDelete = async () => {
        if (!selectedRoleId || !window.confirm(`Are you sure you want to delete the role "${selectedRole}"?`)) return;

        setIsSubmitting(true);
        setMessage(null);
        try {
            await api.delete(`/roles/${selectedRoleId}/`);
            setMessage({ type: 'success', text: `Role ${selectedRole} deleted successfully!` });
            setSelectedRole('');
            setSelectedRoleId(null);
            setSelectedPermissions([]);
            setIsPanelOpen(false);
            fetchData();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to delete role' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRole) return;

        setIsSubmitting(true);
        setMessage(null);
        try {
            await api.post('/roles/create/', {
                name: selectedRole.toUpperCase(),
                permissions: selectedPermissions
            });
            setMessage({ type: 'success', text: `Role ${selectedRole} saved successfully!` });
            fetchData();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to save role' });
        } finally {
            setIsSubmitting(false);
        }
    };



    const filteredPermissions = React.useMemo(() => {
        return permissions
            .filter(p => p.toLowerCase().includes(searchQuery.toLowerCase()))
            .filter(p => {
                if (selectedModule === 'All') return true;
                const parts = p.split('_');
                const mod = parts.length > 1 ? parts.slice(1).join('_') : 'other';
                return mod === selectedModule;
            })
            .sort((a, b) => {
                const partsA = a.split('_');
                const partsB = b.split('_');
                const modA = partsA.length > 1 ? partsA.slice(1).join('_') : 'other';
                const modB = partsB.length > 1 ? partsB.slice(1).join('_') : 'other';
                
                if (modA !== modB) return modA.localeCompare(modB);
                // Within the same module, custom order: view, add, change, delete
                const actionOrder: Record<string, number> = { view: 1, add: 2, change: 3, delete: 4 };
                const actionA = partsA[0];
                const actionB = partsB[0];
                const orderA = actionOrder[actionA] || 99;
                const orderB = actionOrder[actionB] || 99;
                
                if (orderA !== orderB) return orderA - orderB;
                return a.localeCompare(b);
            });
    }, [permissions, searchQuery, selectedModule]);

    const groupedByCategory = React.useMemo(() => {
        const categories: Record<string, Record<string, string[]>> = {};
        filteredPermissions.forEach(p => {
            const parts = p.split('_');
            const mod = parts.length > 1 ? parts.slice(1).join('_') : 'other';
            const category = PARENT_CATEGORY_MAP[mod] || 'Other Modules';
            
            if (!categories[category]) categories[category] = {};
            if (!categories[category][mod]) categories[category][mod] = [];
            categories[category][mod].push(p);
        });
        return categories;
    }, [filteredPermissions]);

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-8">
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                        <Shield size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-foreground tracking-tight">Role Management</h1>
                        <p className="text-sm text-slate-500 font-medium">Configure dynamic access control for your team</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Role List */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
                        <div className="p-4 border-b border-border bg-muted/5 flex items-center justify-between">
                            <h2 className="text-xs font-black uppercase tracking-widest text-slate-500">Existing Roles</h2>
                            <span className="bg-indigo-500/10 text-indigo-500 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                {roles.length}
                            </span>
                        </div>
                        <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
                            {roles.map((r: any) => (
                                <button
                                    key={r.id}
                                    onClick={() => {
                                        setSelectedRoleId(r.id);
                                        setSelectedRole(r.name);
                                        setSelectedPermissions(r.permissions?.map((p: any) => p.codename || p) || []);
                                        setIsPanelOpen(true);
                                    }}
                                    className={`w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-all text-left ${selectedRoleId === r.id ? 'bg-indigo-500/5' : ''}`}
                                >
                                    <div>
                                        <p className={`text-sm font-black uppercase ${selectedRoleId === r.id ? 'text-indigo-500' : 'text-foreground'}`}>{r.name}</p>
                                        <p className="text-[10px] font-bold text-slate-500 mt-0.5">{r.permissions?.length || 0} permissions</p>
                                    </div>
                                    <ChevronRight size={16} className={selectedRoleId === r.id ? 'text-indigo-500' : 'text-slate-400'} />
                                </button>
                            ))}
                            <button 
                                onClick={() => { setSelectedRole(''); setSelectedRoleId(null); setSelectedPermissions([]); setIsPanelOpen(true); }}
                                className="w-full p-4 flex items-center gap-2 text-indigo-500 hover:bg-indigo-500/5 transition-all outline-none"
                            >
                                <Plus size={16} />
                                <span className="text-xs font-black uppercase">Create New Role</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Permission Editor */}
                <div className="lg:col-span-2 space-y-6">
                    {!isPanelOpen ? (
                        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl flex flex-col items-center justify-center text-center h-full min-h-[400px]">
                            <div className="w-16 h-16 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-4">
                                <Shield size={32} />
                            </div>
                            <h3 className="text-lg font-black text-foreground">Select a Role</h3>
                            <p className="text-sm text-slate-500 max-w-sm mt-2">Choose an existing role from the sidebar to edit its permissions, or create a new role to assign specific access levels.</p>
                        </div>
                    ) : (
                    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-3xl pointer-events-none" />
                        
                        <div className="space-y-6 relative">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Role Name</label>
                                <input 
                                    type="text"
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    placeholder="e.g. MANAGER, SUPPORT_LEAD"
                                    className="bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all uppercase"
                                    required
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex flex-wrap items-center gap-2 md:gap-4">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Assign Permissions</label>
                                        <div className="flex flex-wrap gap-2">
                                            {Object.keys(groupedByCategory).length > 0 && (
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                                    Object.values(groupedByCategory).filter(mods => Object.values(mods).flat().some(p => selectedPermissions.includes(p))).length === Object.keys(groupedByCategory).length 
                                                        ? 'bg-emerald-500/10 text-emerald-600' 
                                                        : Object.values(groupedByCategory).filter(mods => Object.values(mods).flat().some(p => selectedPermissions.includes(p))).length > 0 
                                                            ? 'bg-indigo-500/10 text-indigo-600' 
                                                            : 'bg-slate-500/10 text-slate-500'
                                                }`}>
                                                    {Object.values(groupedByCategory).filter(mods => Object.values(mods).flat().some(p => selectedPermissions.includes(p))).length} / {Object.keys(groupedByCategory).length} Sections Active
                                                </span>
                                            )}
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                                selectedPermissions.length === permissions.length 
                                                    ? 'bg-emerald-500/10 text-emerald-600' 
                                                    : selectedPermissions.length > 0 
                                                        ? 'bg-indigo-500/10 text-indigo-600' 
                                                        : 'bg-slate-500/10 text-slate-500'
                                            }`}>
                                                {selectedPermissions.length} / {permissions.length} Permissions Selected
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            type="button" 
                                            onClick={() => {
                                                const toAdd = filteredPermissions.filter(p => !selectedPermissions.includes(p));
                                                setSelectedPermissions([...selectedPermissions, ...toAdd]);
                                            }}
                                            className="text-[9px] font-black text-indigo-400 hover:underline uppercase"
                                        >
                                            Select All {selectedModule !== 'All' ? selectedModule.replace(/_/g, ' ') : ''}
                                        </button>
                                        <span className="text-slate-800">/</span>
                                        <button 
                                            type="button" 
                                            onClick={() => {
                                                const filteredSet = new Set(filteredPermissions);
                                                setSelectedPermissions(selectedPermissions.filter(p => !filteredSet.has(p)));
                                            }}
                                            className="text-[9px] font-black text-rose-400 hover:underline uppercase"
                                        >
                                            Clear All {selectedModule !== 'All' ? selectedModule.replace(/_/g, ' ') : ''}
                                        </button>
                                    </div>
                                </div>

                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                    <input
                                        type="text"
                                        placeholder="Search permissions..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 bg-muted/20 border border-border/50 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all font-medium"
                                    />
                                </div>

                                {/* Accordion List of Categories */}
                                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {Object.entries(groupedByCategory)
                                        .sort(([idxA], [idxB]) => {
                                            const orderA = CATEGORY_ORDER.indexOf(idxA);
                                            const orderB = CATEGORY_ORDER.indexOf(idxB);
                                            const a = orderA !== -1 ? orderA : 999;
                                            const b = orderB !== -1 ? orderB : 999;
                                            if (a !== b) return a - b;
                                            return idxA.localeCompare(idxB);
                                        })
                                        .map(([categoryName, modulesList]) => {
                                        const categoryPerms = Object.values(modulesList).flat();
                                        const isAllSelected = categoryPerms.every(p => selectedPermissions.includes(p));
                                        const hasSomeSelected = categoryPerms.some(p => selectedPermissions.includes(p));
                                        const selectedCount = categoryPerms.filter(p => selectedPermissions.includes(p)).length;
                                        const CategoryIcon = CATEGORY_ICON_MAP[categoryName] || Settings;

                                        return (
                                            <div key={categoryName} className="border border-border/50 rounded-2xl overflow-hidden bg-card shadow-sm">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleModule(categoryName)}
                                                    className="w-full p-4 flex items-center justify-between bg-muted/10 hover:bg-muted/30 transition-all outline-none"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-500">
                                                            <CategoryIcon size={16} />
                                                        </div>
                                                        <span className="text-xs font-black uppercase tracking-wider text-foreground">{categoryName}</span>
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                                            isAllSelected 
                                                                ? 'bg-emerald-500/10 text-emerald-600' 
                                                                : hasSomeSelected 
                                                                    ? 'bg-indigo-500/10 text-indigo-600' 
                                                                    : 'bg-slate-500/10 text-slate-500'
                                                        }`}>
                                                            {selectedCount} / {categoryPerms.length} Selected
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (isAllSelected) {
                                                                    setSelectedPermissions(selectedPermissions.filter(p => !categoryPerms.includes(p)));
                                                                } else {
                                                                    const toAdd = categoryPerms.filter(p => !selectedPermissions.includes(p));
                                                                    setSelectedPermissions([...selectedPermissions, ...toAdd]);
                                                                }
                                                            }}
                                                            className={`text-[9px] font-black uppercase hover:underline ${
                                                                isAllSelected ? 'text-rose-400' : 'text-indigo-400'
                                                            }`}
                                                        >
                                                            {isAllSelected ? 'Clear' : 'Select All'}
                                                        </button>
                                                        <ChevronRight size={16} className={`text-slate-400 transition-transform duration-300 ${expandedModules.includes(categoryName) ? 'rotate-90' : ''}`} />
                                                    </div>
                                                </button>
                                                
                                                {expandedModules.includes(categoryName) && (
                                                    <div className="p-4 bg-muted/5 border-t border-border/50 space-y-6">
                                                        {Object.entries(modulesList).map(([moduleName, perms]) => (
                                                            <div key={moduleName} className="space-y-3">
                                                                <div className="flex items-center justify-between border-b border-border/30 pb-2">
                                                                    <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-2">
                                                                        <div className="w-1 h-3 bg-indigo-500 rounded-full" />
                                                                        {formatModuleName(moduleName)}
                                                                    </h4>
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            const allModuleSelected = perms.every(p => selectedPermissions.includes(p));
                                                                            if (allModuleSelected) {
                                                                                setSelectedPermissions(selectedPermissions.filter(p => !perms.includes(p)));
                                                                            } else {
                                                                                const toAdd = perms.filter(p => !selectedPermissions.includes(p));
                                                                                setSelectedPermissions([...selectedPermissions, ...toAdd]);
                                                                            }
                                                                        }}
                                                                        className={`text-[9px] font-bold uppercase hover:underline ${
                                                                            perms.every(p => selectedPermissions.includes(p)) ? 'text-rose-400' : 'text-indigo-400'
                                                                        }`}
                                                                    >
                                                                        {perms.every(p => selectedPermissions.includes(p)) ? 'Clear All' : 'Select All'}
                                                                    </button>
                                                                </div>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                    {perms.map((perm) => (
                                                                        <motion.button
                                                                            whileTap={{ scale: 0.95 }}
                                                                            type="button"
                                                                            key={perm}
                                                                            onClick={() => handleTogglePermission(perm)}
                                                                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left group ${
                                                                                selectedPermissions.includes(perm)
                                                                                    ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-500'
                                                                                    : 'bg-card border-border/50 text-slate-500 hover:border-indigo-500/30'
                                                                            }`}
                                                                        >
                                                                            <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200 shrink-0 ${
                                                                                selectedPermissions.includes(perm) ? 'bg-indigo-500 text-white border-indigo-500 scale-110' : 'bg-transparent border-2 border-slate-300 group-hover:border-indigo-400/50 scale-100'
                                                                            }`}>
                                                                                {selectedPermissions.includes(perm) && (
                                                                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                                                                                        <CheckCircle2 size={12} />
                                                                                    </motion.div>
                                                                                )}
                                                                            </div>
                                                                            <div className="flex flex-col items-start text-left">
                                                                                <span className="text-[11px] font-bold text-foreground">
                                                                                    {ACTION_MAP[perm.split('_')[0]] || perm.split('_')[0].charAt(0).toUpperCase() + perm.split('_')[0].slice(1)}
                                                                                </span>
                                                                                <span className="text-[9px] font-medium text-slate-400 mt-0.5 break-all">Key: {perm}</span>
                                                                            </div>
                                                                        </motion.button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="pt-6 flex flex-wrap items-center justify-end border-t border-border gap-4">
                                <div className="flex items-center gap-3">
                                    {selectedRoleId && (
                                        <button
                                            type="button"
                                            onClick={handleDelete}
                                            disabled={isSubmitting}
                                            className="px-6 py-3 bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white disabled:opacity-50 text-xs font-black uppercase rounded-xl transition-all"
                                        >
                                            {isSubmitting ? 'Deleting...' : 'Delete Role'}
                                        </button>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !selectedRole}
                                        className="px-8 py-3 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-xs font-black uppercase rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
                                    >
                                        {isSubmitting ? 'Saving...' : 'Save Role Configuration'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {message && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`mt-6 p-4 rounded-xl flex items-center gap-3 ${
                                    message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                                }`}
                            >
                                {message.type === 'success' ? <CheckCircle2 size={18} /> : <X size={18} />}
                                <p className="text-xs font-bold">{message.text}</p>
                            </motion.div>
                        )}
                    </form>
                    )}
                </div>
            </div>
            
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default RoleManagement;
