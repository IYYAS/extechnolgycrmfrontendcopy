import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProject, createProject, updateProject, getTeams, getProjectNatures, createProjectNature, getAllBusinessAddresses } from './projectService';
import type { TeamDetail, ProjectNature, ProjectBusinessAddress } from './projectService';
import { getUsers } from '../user/userService';
import type { User } from '../user/userService';
import {
    ArrowLeft, Save, Plus, Trash2, Calendar, Briefcase, DollarSign,
    MapPin, Server, Users, Layers, Loader2, ChevronDown, X, ChevronRight, FileText, Search, Receipt, RefreshCcw
} from 'lucide-react';
import ProviderSelect from '../../components/ProviderSelect';
import QuickTeamModal from './QuickTeamModal';

// ─── Reusable Collapsible Form Section ──────────────────────────────────────
interface FormSectionProps {
    title: string;
    icon: React.ReactNode;
    iconColor?: string;
    bgColor?: string;
    defaultOpen?: boolean;
    fullWidth?: boolean;
    children: React.ReactNode;
    action?: React.ReactNode;
}

const FormSection: React.FC<FormSectionProps> = ({
    title, icon, iconColor = 'text-primary', bgColor = 'bg-primary/10',
    defaultOpen = true, children, action
}) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className={`bg-card border border-border rounded-[2.5rem] shadow-sm transition-all duration-300 ${isOpen ? 'ring-1 ring-primary/20' : ''}`}>
            <div
                className={`px-8 py-6 flex items-center justify-between cursor-pointer hover:bg-muted/5 transition-colors ${!isOpen ? 'rounded-[2.5rem]' : 'rounded-t-[2.5rem]'}`}
                onClick={() => setIsOpen(o => !o)}
            >
                <div className="flex items-center gap-4">
                    <div className={`p-2.5 ${bgColor} ${iconColor} rounded-2xl`}>{icon}</div>
                    <h3 className="text-lg font-black text-foreground tracking-tight">{title}</h3>
                </div>
                <div className="flex items-center gap-3">
                    {action && <div onClick={e => e.stopPropagation()}>{action}</div>}
                    <ChevronDown size={20} className={`text-muted transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
                </div>
            </div>
            {isOpen && (
                <div className="px-8 pb-8 border-t border-border animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="pt-6">{children}</div>
                </div>
            )}
        </div>
    );
};

const ServiceSubSection: React.FC<{
    title: string;
    icon: React.ReactNode;
    iconColor: string;
    bgColor: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}> = ({ title, icon, iconColor, bgColor, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className={`rounded-[2rem] overflow-hidden transition-all duration-300 ${isOpen ? 'bg-background shadow-md border border-border/50' : 'bg-muted/5 border border-transparent'}`}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-muted/10 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2 ${bgColor} ${iconColor} rounded-xl`}>{icon}</div>
                    <span className="text-[11px] font-bold uppercase tracking-widest">{title}</span>
                </div>
                <ChevronRight size={18} className={`text-muted transition-transform duration-300 ${isOpen ? 'rotate-90 text-primary' : ''}`} />
            </div>
            {isOpen && (
                <div className="px-5 pb-5 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="pt-4 border-t border-border/30">{children}</div>
                </div>
            )}
        </div>
    );
};

const ServiceFormCard: React.FC<{
    service: any;
    sIdx: number;
    addServiceTeamMember: (sIdx: number) => void;
    removeServiceTeamMember: (sIdx: number, mIdx: number) => void;
    setServiceTeamMember: (sIdx: number, mIdx: number, field: string, value: any) => void;
    setServiceField: (sIdx: number, field: string, value: any) => void;
    removeItem: (section: string, idx: number) => void;
    teams: TeamDetail[];
    users: User[];
    roles: string[];
    setFormData: React.Dispatch<React.SetStateAction<any>>;
    onBill?: (type: string, name: string, cost: string | number, purchaseDate?: string, expiryDate?: string, entityId?: number) => void;
    setIsQuickTeamModalOpen: (open: boolean) => void;
    setTeamAssignmentTarget: (target: { type: 'service' | 'project', idx: number } | null) => void;
    syncTeamMembers: (sIdx: number) => void;
}> = ({
    service, sIdx, addServiceTeamMember, removeServiceTeamMember,
    setServiceTeamMember, setServiceField, removeItem, teams, users,
    roles, setFormData, onBill, setIsQuickTeamModalOpen, setTeamAssignmentTarget,
    syncTeamMembers
}) => {
        const [isExpanded, setIsExpanded] = useState(false);

        return (
            <div className={`border border-border rounded-[2rem] transition-all overflow-hidden ${isExpanded ? 'bg-background shadow-lg' : 'bg-muted/5'}`}>
                <div
                    className="p-6 flex items-center gap-4 cursor-pointer hover:bg-muted/10 transition-colors"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="flex-1 space-y-4" onClick={e => e.stopPropagation()}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="space-y-1 lg:col-span-2">
                                <label className="text-[10px] text-muted font-bold block uppercase tracking-wider">Service Name</label>
                                <input type="text" placeholder="e.g. UX Design Phase"
                                    value={service.name || ''}
                                    onChange={e => setServiceField(sIdx, 'name', e.target.value)}
                                    className={`${inputCls} text-lg font-black tracking-tight`} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] text-muted font-bold block uppercase tracking-wider">Status</label>
                                <select value={service.status}
                                    onChange={e => setServiceField(sIdx, 'status', e.target.value)}
                                    className={`${smallInputCls} w-full h-[46px] font-bold`}>
                                    <option value="Pending">Pending</option>
                                    <option value="Progressing">Progressing</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] text-emerald-500 font-bold block uppercase tracking-wider">Payment Status</label>
                                <div className="flex items-center gap-2">
                                    <select value={service.payment_status || 'UNPAID'}
                                        onChange={e => setServiceField(sIdx, 'payment_status', e.target.value)}
                                        className={`${smallInputCls} flex-1 h-[46px] font-bold text-emerald-500`}>
                                        <option value="UNPAID">UNPAID</option>
                                        <option value="PARTIAL">PARTIAL</option>
                                        <option value="PAID">PAID</option>
                                    </select>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (!service.id) {
                                                alert('Please save the project first to generate a bill for this service.');
                                                return;
                                            }
                                            onBill?.('service', service.name || 'Service', service.cost || 0, '', '', service.id);
                                        }}
                                        className="h-[46px] px-3 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded-xl transition-all border border-emerald-500/20 flex items-center gap-2"
                                        title="Generate Invoice"
                                    >
                                        <DollarSign size={18} />
                                        <span className="text-[10px] font-black uppercase">Bill</span>
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] text-emerald-500 font-bold block uppercase tracking-wider">Cost (₹)</label>
                                <input type="number" step="0.01" placeholder="0.00"
                                    value={service.cost || ''}
                                    onChange={e => setServiceField(sIdx, 'cost', e.target.value)}
                                    className={`${smallInputCls} w-full h-[46px] text-emerald-500 font-bold`} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] text-rose-500 font-bold block uppercase tracking-wider">Deadline</label>
                                <input type="date"
                                    value={service.deadline || ''}
                                    onChange={e => setServiceField(sIdx, 'deadline', e.target.value)}
                                    className={`${smallInputCls} w-full h-[42px] text-rose-500 font-bold`} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] text-emerald-500 font-bold block uppercase tracking-wider">Actual End Date</label>
                                <input type="date"
                                    value={service.actual_end_date || ''}
                                    onChange={e => setServiceField(sIdx, 'actual_end_date', e.target.value)}
                                    className={`${smallInputCls} w-full h-[42px] text-emerald-500 font-bold`} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] text-indigo-500 font-bold block uppercase tracking-wider">Team Allocation Start</label>
                                <input type="date"
                                    value={service.teams?.[0]?.start_date || ''}
                                    onChange={e => {
                                        const val = e.target.value;
                                        setFormData((p: any) => {
                                            const services = [...p.services];
                                            const s = { ...services[sIdx] };
                                            const pt = [...(s.teams || [])];
                                            if (pt.length > 0) {
                                                pt[0] = { ...pt[0], start_date: val };
                                                s.teams = pt;
                                            } else {
                                                s.teams = [{ team: '', start_date: val, end_date: s.deadline || '', status: 'Pending' }];
                                            }
                                            services[sIdx] = s;
                                            return { ...p, services: services };
                                        });
                                    }}
                                    className={`${smallInputCls} w-full h-[42px] text-indigo-500 font-bold`} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] text-indigo-500 font-bold block uppercase tracking-wider">Team Allocation End</label>
                                <input type="date"
                                    value={service.teams?.[0]?.end_date || ''}
                                    onChange={e => {
                                        const val = e.target.value;
                                        setFormData((p: any) => {
                                            const services = [...p.services];
                                            const s = { ...services[sIdx] };
                                            const pt = [...(s.teams || [])];
                                            if (pt.length > 0) {
                                                pt[0] = { ...pt[0], end_date: val };
                                                s.teams = pt;
                                            } else {
                                                s.teams = [{ team: '', end_date: val, start_date: s.start_date || '', status: 'Pending' }];
                                            }
                                            services[sIdx] = s;
                                            return { ...p, services: services };
                                        });
                                    }}
                                    className={`${smallInputCls} w-full h-[42px] text-indigo-500 font-bold`} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] text-muted font-bold block uppercase tracking-wider">Service Description</label>
                            <textarea placeholder="Briefly describe this service..."
                                value={service.description || ''}
                                onChange={e => setServiceField(sIdx, 'description', e.target.value)}
                                className={`${inputCls} min-h-[60px] py-3 text-sm`} />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button type="button" onClick={(e) => { e.stopPropagation(); removeItem('services', sIdx); }} className="text-rose-500 hover:bg-rose-500/10 p-2.5 rounded-2xl">
                            <Trash2 size={20} />
                        </button>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isExpanded ? 'bg-primary/10 text-primary rotate-180' : 'bg-muted/10 text-muted'}`}>
                            <ChevronDown size={22} />
                        </div>
                    </div>
                </div>

                {isExpanded && (
                    <div className="p-6 space-y-4 border-t border-border/50 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex flex-col gap-4">
                            <ServiceSubSection
                                title="Service Team"
                                icon={<Users size={16} />}
                                iconColor="text-primary"
                                bgColor="bg-primary/10"
                            >
                                <div className="space-y-4">
                                    {/* Row 1: Team & Status */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Team Group</label>
                                            <div className="flex items-center gap-2">
                                                <select
                                                    value={service.teams?.[0]?.team || ''}
                                                    onChange={e => {
                                                        const val = parseInt(e.target.value);
                                                        const selectedTeam = teams.find(t => t.id === val);

                                                        setFormData((p: any) => {
                                                            const services = [...p.services];
                                                            const s = { ...services[sIdx] };
                                                            const pt = [...(s.teams || [])];

                                                            if (pt.length === 0) {
                                                                s.teams = [{ team: val, allocated_days: 0, actual_days: 0, status: 'Pending' }];
                                                            } else {
                                                                pt[0] = { ...pt[0], team: val, status: pt[0].status || 'Pending' };
                                                                s.teams = pt;
                                                            }

                                                            // Auto-populate members from the selected team
                                                            if (selectedTeam && selectedTeam.members) {
                                                                const currentMembers = s.members || [];
                                                                const existingEmployeeIds = new Set(currentMembers.map((m: any) => m.employee));

                                                                const membersToAdd = selectedTeam.members
                                                                    .filter((id: number) => !existingEmployeeIds.has(id))
                                                                    .map((id: number) => users.find(u => u.id === id))
                                                                    .filter(Boolean);

                                                                const newMembers = membersToAdd.map((user: any) => ({
                                                                    role: user.designation || '',
                                                                    cost: '0.00',
                                                                    allocated_days: 0,
                                                                    actual_days: 0,
                                                                    employee: user.id,
                                                                    start_date: s.start_date || '',
                                                                    end_date: s.deadline || '',
                                                                    status: 'Pending',
                                                                    notes: `Added from ${selectedTeam.name}`
                                                                }));
                                                                s.members = [...currentMembers, ...newMembers];
                                                            }

                                                            services[sIdx] = s;
                                                            return { ...p, services: services };
                                                        });
                                                    }}
                                                    className={`${smallInputCls} flex-1`}
                                                >
                                                    <option value="">Select a team...</option>
                                                    {teams.map(t => (
                                                        <option key={t.id} value={t.id}>{t.name}</option>
                                                    ))}
                                                </select>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setTeamAssignmentTarget({ type: 'service', idx: sIdx });
                                                        setIsQuickTeamModalOpen(true);
                                                    }}
                                                    className="p-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-all border border-primary/20"
                                                    title="Create New Team"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => syncTeamMembers(sIdx)}
                                                    className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500/20 transition-all border border-emerald-500/20"
                                                    title="Sync/Reload Team Members"
                                                >
                                                    <RefreshCcw size={16} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Status</label>
                                            <select
                                                value={service.teams?.[0]?.status || 'Pending'}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    setFormData((p: any) => {
                                                        const services = [...p.services];
                                                        const s = { ...services[sIdx] };
                                                        const pt = [...(s.teams || [])];
                                                        if (pt.length > 0) {
                                                            pt[0] = { ...pt[0], status: val };
                                                            s.teams = pt;
                                                            s.status = val;
                                                        }
                                                        services[sIdx] = s;
                                                        return { ...p, services: services };
                                                    });
                                                }}
                                                className={`${smallInputCls} font-bold`}
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Progressing">Progressing</option>
                                                <option value="Completed">Completed</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-muted font-bold block uppercase tracking-wider">Team Allocation Start</label>
                                            <input type="date"
                                                value={service.teams?.[0]?.start_date || ''}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    setFormData((p: any) => {
                                                        const services = [...p.services];
                                                        const s = { ...services[sIdx] };
                                                        const pt = [...(s.teams || [])];
                                                        if (pt.length > 0) {
                                                            pt[0] = { ...pt[0], start_date: val };
                                                            s.teams = pt;
                                                        } else {
                                                            s.teams = [{ team: '', start_date: val, end_date: s.deadline || '', status: 'Pending', deadline: '', actual_end_date: '' }];
                                                        }
                                                        services[sIdx] = s;
                                                        return { ...p, services: services };
                                                    });
                                                }}
                                                className={smallInputCls} />
                                        </div>
                                    </div>
                                    {/* Row 2: Dates */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-muted font-bold block uppercase tracking-wider">Team Allocation End</label>
                                            <input type="date"
                                                value={service.teams?.[0]?.end_date || ''}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    setFormData((p: any) => {
                                                        const services = [...p.services];
                                                        const s = { ...services[sIdx] };
                                                        const pt = [...(s.teams || [])];
                                                        if (pt.length > 0) {
                                                            pt[0] = { ...pt[0], end_date: val };
                                                            s.teams = pt;
                                                        } else {
                                                            s.teams = [{ team: '', end_date: val, start_date: s.start_date || '', status: 'Pending', deadline: '', actual_end_date: '' }];
                                                        }
                                                        services[sIdx] = s;
                                                        return { ...p, services: services };
                                                    });
                                                }}
                                                className={smallInputCls} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-rose-500 font-bold block uppercase tracking-wider">Deadline</label>
                                            <input type="date"
                                                value={service.teams?.[0]?.deadline || ''}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    setFormData((p: any) => {
                                                        const services = [...p.services];
                                                        const s = { ...services[sIdx] };
                                                        const pt = [...(s.teams || [])];
                                                        if (pt.length > 0) {
                                                            pt[0] = { ...pt[0], deadline: val };
                                                            s.teams = pt;
                                                        }
                                                        services[sIdx] = s;
                                                        return { ...p, services: services };
                                                    });
                                                }}
                                                className={`${smallInputCls} text-rose-500 font-bold`} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-emerald-500 font-bold block uppercase tracking-wider">Actual End Date</label>
                                            <input type="date"
                                                value={service.teams?.[0]?.actual_end_date || ''}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    setFormData((p: any) => {
                                                        const services = [...p.services];
                                                        const s = { ...services[sIdx] };
                                                        const pt = [...(s.teams || [])];
                                                        if (pt.length > 0) {
                                                            pt[0] = { ...pt[0], actual_end_date: val };
                                                            s.teams = pt;
                                                        }
                                                        services[sIdx] = s;
                                                        return { ...p, services: services };
                                                    });
                                                }}
                                                className={`${smallInputCls} text-emerald-500`} />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button type="button" onClick={() => addServiceTeamMember(sIdx)}
                                            className="text-[10px] font-bold text-primary uppercase flex items-center gap-1 hover:bg-primary/10 px-2 py-1.5 rounded-lg transition-all">
                                            <Plus size={12} /> Add Member
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {service.members?.map((m: any, mIdx: number) => (
                                            <div key={mIdx} className="bg-background/50 p-4 rounded-xl border border-border space-y-4">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] text-muted font-bold uppercase">Role</label>
                                                        <select
                                                            value={m.role}
                                                            onChange={e => setServiceTeamMember(sIdx, mIdx, 'role', e.target.value)}
                                                            className={smallInputCls}
                                                        >
                                                            <option value="">Select Role...</option>
                                                            {roles.map(r => <option key={r} value={r}>{r}</option>)}
                                                            {!roles.includes(m.role) && m.role && <option value={m.role}>{m.role}</option>}
                                                        </select>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] text-muted font-bold uppercase">Cost (₹)</label>
                                                        <input type="number" step="0.01"
                                                            value={m.cost}
                                                            onChange={e => setServiceTeamMember(sIdx, mIdx, 'cost', e.target.value)}
                                                            className={`${smallInputCls} text-emerald-500 font-bold`} />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] text-muted font-bold uppercase">Employee</label>
                                                        <select
                                                            value={m.employee || ''}
                                                            onChange={e => setServiceTeamMember(sIdx, mIdx, 'employee', parseInt(e.target.value))}
                                                            className={smallInputCls}
                                                        >
                                                            <option value="">Select Employee...</option>
                                                            {users.map(u => (
                                                                <option key={u.id} value={u.id}>
                                                                    {(u.first_name || u.last_name) ? `${u.first_name} ${u.last_name} (${u.username})` : u.username}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] text-muted font-bold uppercase">Allocated Days</label>
                                                        <input type="number" placeholder="0" value={m.allocated_days || 0}
                                                            onChange={e => setServiceTeamMember(sIdx, mIdx, 'allocated_days', parseInt(e.target.value) || 0)}
                                                            className={smallInputCls} />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] text-muted font-bold uppercase">Start</label>
                                                        <input type="date"
                                                            value={m.start_date || ''}
                                                            onChange={e => setServiceTeamMember(sIdx, mIdx, 'start_date', e.target.value)}
                                                            className={smallInputCls} />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] text-muted font-bold uppercase">End</label>
                                                        <input type="date"
                                                            value={m.end_date || ''}
                                                            onChange={e => setServiceTeamMember(sIdx, mIdx, 'end_date', e.target.value)}
                                                            className={smallInputCls} />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] text-muted font-bold uppercase">Status</label>
                                                        <select value={m.status || 'Pending'} onChange={e => setServiceTeamMember(sIdx, mIdx, 'status', e.target.value)} className={smallInputCls}>
                                                            <option value="Pending">Pending</option>
                                                            <option value="Progressing">Progressing</option>
                                                            <option value="Completed">Completed</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between gap-3">
                                                    <input type="text" placeholder="Notes..."
                                                        value={m.notes || ''}
                                                        onChange={e => setServiceTeamMember(sIdx, mIdx, 'notes', e.target.value)}
                                                        className={`${smallInputCls} flex-1`} />
                                                    <button type="button" onClick={() => removeServiceTeamMember(sIdx, mIdx)}
                                                        className="text-rose-500 hover:bg-rose-500/10 p-1.5 rounded-lg">
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {(!service.members || service.members.length === 0) && (
                                            <p className="text-[10px] text-muted text-center italic py-2">No members assigned.</p>
                                        )}
                                    </div>
                                </div>
                            </ServiceSubSection>
                        </div>
                    </div>
                )}
            </div>
        );
    };

const AddressPicker: React.FC<{ onSelect: (addr: ProjectBusinessAddress) => void, selectedId?: number }> = ({ onSelect, selectedId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [results, setResults] = useState<ProjectBusinessAddress[]>([]);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const fetchMore = async (reset = false) => {
        if (isLoading || (!hasMore && !reset)) return;
        setIsLoading(true);
        try {
            const nextPage = reset ? 1 : page;
            const data = await getAllBusinessAddresses(nextPage, search);
            setResults(prev => reset ? data.results : [...prev, ...data.results]);
            setPage(nextPage + 1);
            setHasMore(!!data.next);
        } catch (err) {
            console.error('Failed to fetch addresses:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!isOpen) return;
        const timer = setTimeout(() => fetchMore(true), 300);
        return () => clearTimeout(timer);
    }, [search, isOpen]);

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`${smallInputCls} !py-1 !h-8 !text-[10px] w-48 font-bold border-rose-500/20 flex items-center justify-between px-3 hover:bg-rose-500/5 transition-all`}
            >
                <span>{selectedId ? `Existing ID: ${selectedId}` : 'Quick Select...'}</span>
                <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-50 pointer-events-auto" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-10 left-0 w-80 bg-card border border-border rounded-2xl shadow-2xl z-[60] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-3 border-b border-border bg-muted/5">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Search client, city, state..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    onClick={e => e.stopPropagation()}
                                />
                            </div>
                        </div>
                        <div className="max-h-64 overflow-y-auto p-1 custom-scrollbar">
                            {results.map((addr) => (
                                <div
                                    key={addr.id}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSelect(addr);
                                        setIsOpen(false);
                                    }}
                                    className="p-3 hover:bg-primary/10 rounded-xl cursor-pointer transition-all border border-transparent hover:border-primary/20 group/item"
                                >
                                    <p className="text-xs font-black text-foreground group-hover/item:text-primary transition-colors">
                                        {addr.legal_name || addr.attention_name || 'Unnamed'}
                                    </p>
                                    <p className="text-[10px] text-muted mt-0.5">
                                        {addr.city}, {addr.state} {addr.pin_code && `— ${addr.pin_code}`}
                                    </p>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="p-4 flex flex-col items-center justify-center gap-2">
                                    <Loader2 className="animate-spin text-primary" size={16} />
                                    <span className="text-[10px] text-muted font-medium">Searching...</span>
                                </div>
                            )}
                            {!isLoading && hasMore && results.length > 0 && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        fetchMore();
                                    }}
                                    className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 transition-colors"
                                >
                                    Load More Results
                                </button>
                            )}
                            {!isLoading && results.length === 0 && (
                                <div className="p-8 text-center space-y-2">
                                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest">No addresses found</p>
                                    <p className="text-[10px] text-muted/60 px-4">Try searching with different terms.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

// ─── Input Helpers ───────────────────────────────────────────────────────────
const COMMON_ROLES = [
    "Frontend Developer",
    "Backend Developer",
    "Fullstack Developer",
    "UI/UX Designer",
    "Mobile Developer",
    "DevOps Engineer",
    "QA Engineer",
    "Project Manager",
    "Business Analyst",
    "Solution Architect"
];

const inputCls = "w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all";
const smallInputCls = "w-full px-3 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all";
const labelCls = "text-[11px] font-bold text-muted uppercase tracking-widest mb-1.5 block";


// ─── Main Component ──────────────────────────────────────────────────────────
const ProjectForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [teams, setTeams] = useState<TeamDetail[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [natures, setNatures] = useState<ProjectNature[]>([]);
    const [isAddingNature, setIsAddingNature] = useState(false);
    const [newNatureName, setNewNatureName] = useState('');
    const [isQuickTeamModalOpen, setIsQuickTeamModalOpen] = useState(false);
    const [teamAssignmentTarget, setTeamAssignmentTarget] = useState<{ type: 'service' | 'project', idx: number } | null>(null);

    const blankBase = () => ({
        project_approach_date: new Date().toISOString().split('T')[0],
        name: '', description: '', creator_name: '', creator_designation: ''
    });
    const blankExecution = () => ({
        work_assigned_date: new Date().toISOString().split('T')[0],
        assigned_delivery_date: '', start_date: '', confirmed_end_date: '', end_date: null
    });
    const blankFinance = () => ({
        project_cost: '0.00', manpower_cost: '0.00', total_invoiced: '0.00',
        total_paid: '0.00', total_balance_due: '0.00'
    });
    const blankClient = () => ({
        company_name: '', contact_person: '', email: '', phone: ''
    });
    const blankDocument = () => ({
        name: '', document: '', description: ''
    });

    const [formData, setFormData] = useState<any>({
        description: '', status: 'Pending', project_nature: 1,
        project_base_informations: [blankBase()],
        project_excutions: [blankExecution()],
        project_finances: [blankFinance()],
        project_clients: [blankClient()],
        project_business_addresses: [],
        project_domains: [], project_servers: [],
        project_documents: [],
        project_teams: [], project_team_members: [],
        services: [],
        payment_status: 'UNPAID'
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                const teamsData = await getTeams();
                setTeams(teamsData);

                const usersData = await getUsers();
                setUsers(usersData.results);

                const natureData = await getProjectNatures();
                setNatures(natureData);

                if (isEdit && id) {
                    const projectData = await getProject(parseInt(id));

                    const cleanStatus = (s: string) => {
                        if (s === 'In Progress' || s === 'Active') return 'Progressing';
                        if (!s) return 'Pending';
                        return s;
                    };

                    const cleanedData = {
                        ...projectData,
                        status: cleanStatus(projectData.status),
                        services: projectData.services?.map((s: any) => ({
                            ...s,
                            status: cleanStatus(s.status),
                            members: s.members?.map((m: any) => ({
                                ...m,
                                status: cleanStatus(m.status)
                            }))
                        })),
                        project_team_members: projectData.project_team_members?.map((m: any) => ({
                            ...m,
                            status: cleanStatus(m.status)
                        }))
                    };
                    setFormData(cleanedData);
                } else if (natureData.length > 0) {
                    setFormData((p: any) => ({ ...p, project_nature: natureData[0].id }));
                }
            } catch (err) {
                setError('Failed to load required data.');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [isEdit, id]);

    // ── Generic Handlers ──────────────────────────────────────────────────
    const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setFormData((p: any) => ({ ...p, [e.target.name]: e.target.value }));

    const setNested = (section: string, idx: number, field: string, value: any) =>
        setFormData((p: any) => {
            const arr = [...(p[section] || [])];
            arr[idx] = { ...arr[idx], [field]: value };
            return { ...p, [section]: arr };
        });

    const addItem = (section: string, template: any) =>
        setFormData((p: any) => {
            if (section.includes('.')) {
                const [top, idxStr, sub] = section.split('.');
                const topArr = [...(p[top] || [])];
                const item = { ...topArr[parseInt(idxStr)] };
                item[sub] = [...(item[sub] || []), template];
                topArr[parseInt(idxStr)] = item;
                return { ...p, [top]: topArr };
            }
            return { ...p, [section]: [...(p[section] || []), template] };
        });

    const removeItem = (section: string, idx: number) =>
        setFormData((p: any) => {
            if (section.includes('.')) {
                const [top, sIdxStr, sub] = section.split('.');
                const topArr = [...(p[top] || [])];
                const item = { ...topArr[parseInt(sIdxStr)] };
                item[sub] = (item[sub] || []).filter((_: any, i: number) => i !== idx);
                topArr[parseInt(sIdxStr)] = item;
                return { ...p, [top]: topArr };
            }
            return { ...p, [section]: (p[section] || []).filter((_: any, i: number) => i !== idx) };
        });

    const syncServiceTeamMembers = (sIdx: number) => {
        setFormData((p: any) => {
            const services = [...p.services];
            const s = { ...services[sIdx] };
            const teamId = s.teams?.[0]?.team;
            if (!teamId) return p;

            const selectedTeam = teams.find(t => t.id === teamId);
            if (selectedTeam && selectedTeam.members) {
                const currentMembers = s.members || [];
                const existingEmployeeIds = new Set(currentMembers.map((m: any) => m.employee));

                const membersToAdd = selectedTeam.members
                    .filter((id: number) => !existingEmployeeIds.has(id))
                    .map((id: number) => users.find(u => u.id === id))
                    .filter(Boolean);

                const newMembers = membersToAdd.map((user: any) => ({
                    role: user.designation || '',
                    cost: '0.00',
                    allocated_days: 0,
                    actual_days: 0,
                    employee: user.id,
                    start_date: s.start_date || '',
                    end_date: s.deadline || '',
                    status: 'Pending',
                    notes: `Synced from ${selectedTeam.name}`
                }));

                if (newMembers.length > 0) {
                    s.members = [...currentMembers, ...newMembers];
                    services[sIdx] = s;
                    return { ...p, services };
                }
            }
            return p;
        });
    };

    const syncProjectTeamMembers = (tIdx: number) => {
        setFormData((p: any) => {
            const pTeams = [...p.project_teams];
            const pt = { ...pTeams[tIdx] };
            const teamId = pt.team;
            if (!teamId) return p;

            const selectedTeam = teams.find(t => t.id === teamId);
            if (selectedTeam && selectedTeam.members) {
                const currentMembers = pt.members || [];
                const existingEmployeeIds = new Set(currentMembers.map((m: any) => m.employee));

                const membersToAdd = selectedTeam.members
                    .filter((id: number) => !existingEmployeeIds.has(id))
                    .map((id: number) => users.find(u => u.id === id))
                    .filter(Boolean);

                const newMembers = membersToAdd.map((user: any) => ({
                    role: user.designation || '',
                    cost: '0.00',
                    allocated_days: 0,
                    actual_days_spent: 0,
                    employee: user.id,
                    start_date: '',
                    end_date: '',
                    status: 'Pending',
                    notes: `Synced from ${selectedTeam.name}`
                }));

                if (newMembers.length > 0) {
                    pt.members = [...currentMembers, ...newMembers];
                    pTeams[tIdx] = pt;
                    return { ...p, project_teams: pTeams };
                }
            }
            return p;
        });
    };

    // Service helpers (new structure: services[])
    const setServiceField = (sIdx: number, field: string, value: any) =>
        setFormData((p: any) => {
            const svcs = [...p.services];
            const updatedService = { ...svcs[sIdx], [field]: value };
            
            // Sync with Team status if field is 'status'
            if (field === 'status' && updatedService.teams && updatedService.teams.length > 0) {
                updatedService.teams = updatedService.teams.map((t: any) => ({ ...t, status: value }));
            }

            // Sync Team End Date when Service Deadline changes
            if (field === 'deadline' && updatedService.teams && updatedService.teams.length > 0) {
                updatedService.teams = updatedService.teams.map((t: any) => ({ 
                    ...t, 
                    end_date: t.end_date ? t.end_date : value 
                }));
            }

            // Sync Team Start Date when Service Start Date changes
            if (field === 'start_date' && updatedService.teams && updatedService.teams.length > 0) {
                updatedService.teams = updatedService.teams.map((t: any) => ({ 
                    ...t, 
                    start_date: t.start_date ? t.start_date : value 
                }));
            }
            
            svcs[sIdx] = updatedService;
            return { ...p, services: svcs };
        });


    const addServiceTeamMember = (sIdx: number) =>
        setFormData((p: any) => {
            const svcs = [...p.services];
            const s = { ...svcs[sIdx] };
            const members = [...(s.members || [])];
            members.push({ role: '', cost: '0.00', allocated_days: 0, actual_days: 0, employee: 1, start_date: '', end_date: '', status: 'Pending', notes: '' });
            s.members = members;
            svcs[sIdx] = s;
            return { ...p, services: svcs };
        });

    const removeServiceTeamMember = (sIdx: number, mIdx: number) =>
        setFormData((p: any) => {
            const svcs = [...p.services];
            const s = { ...svcs[sIdx] };
            s.members = (s.members || []).filter((_: any, i: number) => i !== mIdx);
            svcs[sIdx] = s;
            return { ...p, services: svcs };
        });

    const setServiceTeamMember = (sIdx: number, mIdx: number, field: string, value: any) =>
        setFormData((p: any) => {
            const svcs = [...p.services];
            const s = { ...svcs[sIdx] };
            const members = [...(s.members || [])];
            members[mIdx] = { ...members[mIdx], [field]: value };
            s.members = members;
            svcs[sIdx] = s;
            return { ...p, services: svcs };
        });

    const addTeamMember = (tIdx: number) =>
        setFormData((p: any) => {
            const teams = [...p.project_teams];
            teams[tIdx] = { ...teams[tIdx], members: [...(teams[tIdx].members || []), { role: '', cost: '0.00', allocated_days: 0, actual_days_spent: 0, start_date: '', end_date: '', status: 'Pending', notes: '', employee: '' }] };
            return { ...p, project_teams: teams };
        });

    const removeTeamMember = (tIdx: number, mIdx: number) =>
        setFormData((p: any) => {
            const teams = [...p.project_teams];
            teams[tIdx] = { ...teams[tIdx], members: teams[tIdx].members.filter((_: any, i: number) => i !== mIdx) };
            return { ...p, project_teams: teams };
        });

    const setTeamMember = (tIdx: number, mIdx: number, field: string, value: any) =>
        setFormData((p: any) => {
            const teams = [...p.project_teams];
            teams[tIdx].members[mIdx] = { ...teams[tIdx].members[mIdx], [field]: value };
            return { ...p, project_teams: teams };
        });

    const handleAddNature = async () => {
        if (!newNatureName.trim()) {
            setIsAddingNature(false);
            return;
        }
        try {
            const nature = await createProjectNature(newNatureName);
            setNatures(p => [...p, nature]);
            setFormData((p: any) => ({ ...p, project_nature: nature.id }));
            setNewNatureName('');
            setIsAddingNature(false);
        } catch (err) {
            alert('Failed to create project nature.');
        }
    };

    const handleBillItem = (type: string, name: string, cost: string | number, purchaseDate: string = '', expiryDate: string = '', entityId?: number) => {
        const busAddr = formData.project_business_addresses?.[0]?.id || '';
        const params = new URLSearchParams({
            type,
            name,
            rate: cost.toString(),
            purchase_date: purchaseDate,
            expiry_date: expiryDate,
            business_address: busAddr.toString()
        });
        if (entityId) {
            if (type === 'server') params.append('server_id', entityId.toString());
            else if (type === 'domain') params.append('domain_id', entityId.toString());
            else if (type === 'service') params.append('service_id', entityId.toString());
            else if (type === 'team') params.append('team_id', entityId.toString());
        } else {
            console.warn(`Attempted to bill ${type} without an entity ID.`);
        }
        const url = busAddr
            ? `/invoices/client/${busAddr}/new?${params.toString()}`
            : `/invoices/new?${params.toString()}`;
        window.open(url, '_blank');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            const bizAddrId = formData.project_business_addresses?.[0]?.id;
            const projectId = isEdit && id ? parseInt(id) : undefined;
            const projectName = formData.project_base_informations?.[0]?.name || formData.name;
            const payload = {
                ...formData,
                name: projectName,
                project_domains: formData.project_domains.map((d: any) => ({ ...d, client_address: bizAddrId, project: projectId })),
                project_servers: formData.project_servers.map((s: any) => ({ ...s, client_address: bizAddrId, project: projectId })),
                project_teams: formData.project_teams?.map((pt: any) => ({
                    ...pt,
                    project: projectId,
                    members: pt.members?.map((m: any) => ({ ...m, project: projectId }))
                })),
                services: formData.services?.map((sv: any) => ({
                    ...sv,
                    project: projectId,
                    members: sv.members?.map((m: any) => ({ ...m, project: projectId }))
                })),
                project_team_members: formData.project_team_members?.map((m: any) => ({ ...m, project: projectId }))
            };
            if (isEdit && id) await updateProject(parseInt(id), payload);
            else await createProject(payload);

            // Legacy auto-invoice logic removed as individual bill buttons are now used

            navigate('/projects');
        } catch (err: any) {
            setError(err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Failed to save project.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <Loader2 className="animate-spin text-primary" size={48} />
            <p className="text-muted font-medium">Preparing project data...</p>
        </div>
    );

    const newServiceTemplate = () => ({
        name: '', description: '', status: 'Pending', payment_status: 'UNPAID',
        start_date: '', deadline: '',
        project_base_informations: [blankBase()],
        project_excutions: [blankExecution()],
        project_finances: [blankFinance()],
        project_teams: []
    });

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500 mb-24">
            {/* ── Header ── */}
            <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2.5 hover:bg-muted/10 rounded-2xl text-muted border border-transparent hover:border-border transition-all">
                        <ArrowLeft size={22} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-foreground">{isEdit ? 'Edit Project' : 'New Project'}</h1>
                        <p className="text-muted text-sm font-medium mt-0.5">{isEdit ? 'Update all project parameters' : 'Complete project initialization'}</p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 font-bold text-sm">
                    ⚠️ {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* ── 1. Project Foundation ── */}
                <FormSection title="Project Foundation" icon={<Briefcase size={22} />} iconColor="text-primary" bgColor="bg-primary/10" defaultOpen
                    action={
                        <button type="button" onClick={() => addItem('project_base_informations', blankBase())}
                            className="text-xs flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-all font-bold">
                            <Plus size={14} /> Add Base Info
                        </button>
                    }>
                    <div className="space-y-8">
                        {formData.project_base_informations?.map((base: any, idx: number) => (
                            <div key={idx} className={`space-y-6 ${idx > 0 ? 'pt-8 border-t border-border' : ''}`}>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-black text-primary uppercase tracking-widest">Foundation Section #{idx + 1}</span>
                                    {idx > 0 && (
                                        <button type="button" onClick={() => removeItem('project_base_informations', idx)} className="text-rose-500 hover:bg-rose-500/10 p-2 rounded-xl">
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2 space-y-2">
                                        <label className={labelCls}>Project Name</label>
                                        <input
                                            type="text" required placeholder="Enter project name..."
                                            value={base.name || ''}
                                            onChange={e => setNested('project_base_informations', idx, 'name', e.target.value)}
                                            className={inputCls}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelCls}>Project Manager</label>
                                        <input
                                            type="text" placeholder="Manager Name"
                                            value={base.creator_name || ''}
                                            onChange={e => setNested('project_base_informations', idx, 'creator_name', e.target.value)}
                                            className={inputCls}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelCls}>Designation</label>
                                        <input
                                            type="text" placeholder="e.g. Project Manager"
                                            value={base.creator_designation || ''}
                                            onChange={e => setNested('project_base_informations', idx, 'creator_designation', e.target.value)}
                                            className={inputCls}
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className={labelCls}>Project Description</label>
                                        <textarea
                                            rows={3} required placeholder="What is this component about?"
                                            value={base.description || ''}
                                            onChange={e => setNested('project_base_informations', idx, 'description', e.target.value)}
                                            className={inputCls}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border/50">
                            <div className="space-y-2">
                                <label className={labelCls}>Global Status</label>
                                <select name="status" value={formData.status} onChange={handleInput} className={inputCls}>
                                    <option value="Progressing">Progressing</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Pending">Pending</option>
                                </select>
                            </div>
                            <div className="space-y-2 relative">
                                <label className={labelCls}>Nature</label>
                                <div className="flex gap-2">
                                    {isAddingNature ? (
                                        <div className="flex-1 flex gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
                                            <input
                                                autoFocus
                                                type="text"
                                                placeholder="New Nature Name"
                                                value={newNatureName}
                                                onChange={e => setNewNatureName(e.target.value)}
                                                className={inputCls}
                                                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddNature())}
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAddNature}
                                                className="px-4 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors"
                                            >
                                                Add
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => { setIsAddingNature(false); setNewNatureName(''); }}
                                                className="px-4 bg-muted/10 text-muted rounded-xl font-bold hover:bg-muted/20 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <select
                                                name="project_nature"
                                                value={formData.project_nature}
                                                onChange={handleInput}
                                                className={`${inputCls} flex-1`}
                                            >
                                                {natures.map(n => (
                                                    <option key={n.id} value={n.id}>{n.name}</option>
                                                ))}
                                            </select>
                                            <button
                                                type="button"
                                                onClick={() => setIsAddingNature(true)}
                                                className="p-3 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-all border border-primary/20"
                                                title="Add New Nature"
                                            >
                                                <Plus size={20} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className={labelCls}>Global Description</label>
                                <textarea
                                    rows={3} required placeholder="this project now what happening"
                                    name="description" value={formData.description} onChange={handleInput}
                                    className={inputCls}
                                />
                            </div>
                        </div>
                    </div>
                </FormSection>

                {/* ── 2. Timeline ── */}
                <FormSection title="Timeline" icon={<Calendar size={22} />} iconColor="text-amber-500" bgColor="bg-amber-500/10" defaultOpen
                    action={
                        <button type="button" onClick={() => addItem('project_excutions', blankExecution())}
                            className="text-xs flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-500 rounded-xl hover:bg-amber-500/20 transition-all font-bold">
                            <Plus size={14} /> Add Phase
                        </button>
                    }>
                    <div className="space-y-8">
                        {formData.project_excutions?.map((exec: any, idx: number) => (
                            <div key={idx} className={`space-y-4 ${idx > 0 ? 'pt-8 border-t border-border' : ''}`}>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-black text-amber-500 uppercase tracking-widest">Execution Phase #{idx + 1}</span>
                                    {idx > 0 && (
                                        <button type="button" onClick={() => removeItem('project_excutions', idx)} className="text-rose-500 hover:bg-rose-500/10 p-2 rounded-xl">
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="space-y-2">
                                        <label className={labelCls}>Approach Date</label>
                                        <input type="date"
                                            value={exec.project_approach_date || ''}
                                            onChange={e => setNested('project_excutions', idx, 'project_approach_date', e.target.value)}
                                            className={inputCls} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelCls}>Work Assigned</label>
                                        <input type="date"
                                            value={exec.work_assigned_date || ''}
                                            onChange={e => setNested('project_excutions', idx, 'work_assigned_date', e.target.value)}
                                            className={inputCls} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelCls}>Start Date</label>
                                        <input type="date"
                                            value={exec.start_date || ''}
                                            onChange={e => setNested('project_excutions', idx, 'start_date', e.target.value)}
                                            className={inputCls} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelCls}>Delivery Deadline</label>
                                        <input type="date"
                                            value={exec.assigned_delivery_date || ''}
                                            onChange={e => setNested('project_excutions', idx, 'assigned_delivery_date', e.target.value)}
                                            className={inputCls} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelCls}>Confirmed End</label>
                                        <input type="date"
                                            value={exec.confirmed_end_date || ''}
                                            onChange={e => setNested('project_excutions', idx, 'confirmed_end_date', e.target.value)}
                                            className={inputCls} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelCls}>Actual End</label>
                                        <input type="date"
                                            value={exec.end_date || ''}
                                            onChange={e => setNested('project_excutions', idx, 'end_date', e.target.value || null)}
                                            className={inputCls} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </FormSection>

                {/* ── 3. Financials ── */}
                <FormSection title="Financial Overview" icon={<DollarSign size={22} />} iconColor="text-emerald-500" bgColor="bg-emerald-500/10" defaultOpen
                    action={
                        <button type="button" onClick={() => addItem('project_finances', blankFinance())}
                            className="text-xs flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500/20 transition-all font-bold">
                            <Plus size={14} /> Add Finance Phase
                        </button>
                    }>
                    <div className="space-y-8">
                        {formData.project_finances?.map((fin: any, idx: number) => (
                            <div key={idx} className={`space-y-4 ${idx > 0 ? 'pt-8 border-t border-border' : ''}`}>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">Financial Entry #{idx + 1}</span>
                                    {idx > 0 && (
                                        <button type="button" onClick={() => removeItem('project_finances', idx)} className="text-rose-500 hover:bg-rose-500/10 p-2 rounded-xl">
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[
                                        { key: 'project_cost', label: 'Total Budget' },
                                        { key: 'manpower_cost', label: 'Manpower Cost' },
                                        { key: 'total_invoiced', label: 'Total Invoiced' },
                                        { key: 'total_paid', label: 'Total Paid' },
                                        { key: 'total_balance_due', label: 'Balance Due' },
                                    ].map(({ key, label }) => (
                                        <div key={key} className="space-y-2">
                                            <label className={labelCls}>{label}</label>
                                            <input
                                                type="number" step="0.01"
                                                value={fin[key] || '0.00'}
                                                onChange={e => setNested('project_finances', idx, key, e.target.value)}
                                                className={`${inputCls} font-bold`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </FormSection>

                {/* ── 4. Client & Address ── */}
                <FormSection title="Client & Address" icon={<MapPin size={22} />} iconColor="text-rose-500" bgColor="bg-rose-500/10"
                    action={
                        <button type="button" onClick={() => addItem('project_clients', blankClient())}
                            className="text-xs flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500/20 transition-all font-bold">
                            <Plus size={14} /> Add Client
                        </button>
                    }>
                    <div className="space-y-8">
                        {formData.project_clients?.map((client: any, idx: number) => (
                            <div key={idx} className={`space-y-6 ${idx > 0 ? 'pt-8 border-t border-border' : ''}`}>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-black text-rose-500 uppercase tracking-widest">Client Entry #{idx + 1}</span>
                                    {idx > 0 && (
                                        <button type="button" onClick={() => removeItem('project_clients', idx)} className="text-rose-500 hover:bg-rose-500/10 p-2 rounded-xl">
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[
                                        { key: 'company_name', label: 'Company Name', placeholder: 'Acme Corp' },
                                        { key: 'contact_person', label: 'Contact Person', placeholder: 'John Smith' },
                                        { key: 'email', label: 'Email', placeholder: 'contact@company.com' },
                                        { key: 'phone', label: 'Phone', placeholder: '+91 98765 43210' },
                                    ].map(({ key, label, placeholder }) => (
                                        <div key={key} className="space-y-2">
                                            <label className={labelCls}>{label}</label>
                                            <input
                                                type="text" placeholder={placeholder}
                                                value={client[key] || ''}
                                                onChange={e => setNested('project_clients', idx, key, e.target.value)}
                                                className={inputCls}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Business Addresses */}
                    <div className="mt-8 space-y-4">
                        <div className="flex items-center justify-between">
                            <label className={labelCls}>Business Addresses</label>
                            <button type="button"
                                onClick={() => addItem('project_business_addresses', { attention_name: '', legal_name: '', email: '', phone: '', gst_number: '', pan_number: '', logo: '', unit_or_floor: '', building_name: '', plot_number: '', street_name: '', landmark: '', locality: '', city: '', district: '', state: '', pin_code: '', country: 'India' })}
                                className="text-xs flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500/20 transition-all font-bold">
                                <Plus size={14} /> Add Address
                            </button>
                        </div>
                        {formData.project_business_addresses?.map((addr: any, idx: number) => (
                            <div key={idx} className="p-6 bg-muted/5 border border-border rounded-[2rem] space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <span className="text-[11px] font-black text-rose-500 uppercase tracking-widest">📍 Address #{idx + 1}</span>
                                        <AddressPicker
                                            selectedId={addr.id}
                                            onSelect={(selected) => {
                                                setFormData((p: any) => {
                                                    const arr = [...(p.project_business_addresses || [])];
                                                    arr[idx] = { ...arr[idx], ...selected };
                                                    return { ...p, project_business_addresses: arr };
                                                });
                                            }} />
                                    </div>
                                    <button type="button" onClick={() => removeItem('project_business_addresses', idx)}
                                        className="text-rose-500 hover:bg-rose-500/10 p-2 rounded-xl">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {[
                                        { key: 'attention_name', label: 'Attention Name' },
                                        { key: 'legal_name', label: 'Legal Name' },
                                        { key: 'email', label: 'Billing Email' },
                                        { key: 'phone', label: 'Billing Phone' },
                                        { key: 'gst_number', label: 'GST Number' },
                                        { key: 'pan_number', label: 'PAN Number' },
                                        { key: 'logo', label: 'Logo URL' },
                                        { key: 'unit_or_floor', label: 'Unit / Floor' },
                                        { key: 'building_name', label: 'Building Name' },
                                        { key: 'plot_number', label: 'Plot Number' },
                                        { key: 'street_name', label: 'Street Name' },
                                        { key: 'landmark', label: 'Landmark' },
                                        { key: 'locality', label: 'Locality' },
                                        { key: 'city', label: 'City' },
                                        { key: 'district', label: 'District' },
                                        { key: 'state', label: 'State' },
                                        { key: 'pin_code', label: 'PIN Code' },
                                        { key: 'country', label: 'Country' },
                                    ].map(({ key, label }) => {
                                        if (key === 'logo') {
                                            return (
                                                <div key={key} className="space-y-1">
                                                    <label className={labelCls}>{label}</label>
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex-1 relative">
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={(e) => {
                                                                    const file = e.target.files?.[0];
                                                                    if (file) {
                                                                        setNested('project_business_addresses', idx, 'logo', file);
                                                                    }
                                                                }}
                                                                className="hidden"
                                                                id={`logo-upload-${idx}`}
                                                            />
                                                            <label
                                                                htmlFor={`logo-upload-${idx}`}
                                                                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-background border border-dashed border-border rounded-xl text-muted text-xs font-bold cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all w-full"
                                                            >
                                                                {addr.logo ? 'Change Logo' : 'Upload Logo'}
                                                            </label>
                                                        </div>
                                                        {addr.logo && (
                                                            <div className="relative group">
                                                                <img src={typeof addr.logo === 'string' ? addr.logo : URL.createObjectURL(addr.logo as any)} alt="Preview" className="w-10 h-10 object-contain rounded-lg border border-border bg-white" />
                                                                <a
                                                                    href={typeof addr.logo === 'string' ? addr.logo : URL.createObjectURL(addr.logo as any)}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="absolute -bottom-2 -right-2 bg-primary text-white rounded-full p-1 shadow-lg hover:scale-110 transition-transform"
                                                                >
                                                                    <ChevronRight size={10} />
                                                                </a>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setNested('project_business_addresses', idx, 'logo', '')}
                                                                    className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                >
                                                                    <X size={10} />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return (
                                            <div key={key} className="space-y-1">
                                                <label className={labelCls}>{label}</label>
                                                <input type="text" placeholder={label}
                                                    value={addr[key] || ''} onChange={e => setNested('project_business_addresses', idx, key, e.target.value)}
                                                    required={key === 'legal_name'}
                                                    className={inputCls} />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </FormSection>

                <FormSection
                    title="Project Documents"
                    icon={<FileText size={22} />}
                    iconColor="text-orange-500"
                    action={
                        <button type="button"
                            onClick={() => addItem('project_documents', blankDocument())}
                            className="text-xs flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 text-orange-500 rounded-xl hover:bg-orange-500/20 transition-all font-bold">
                            <Plus size={14} /> Add Document
                        </button>
                    }
                >
                    <div className="space-y-4">
                        {formData.project_documents.map((doc: any, idx: number) => (
                            <div key={idx} className="p-6 bg-muted/5 rounded-3xl border border-border relative group animate-in slide-in-from-top-4 duration-300">
                                <button type="button" onClick={() => removeItem('project_documents', idx)}
                                    className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all shadow-lg">
                                    <X size={14} />
                                </button>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className={labelCls}>Document Name</label>
                                        <input type="text" placeholder="e.g. Project Charter"
                                            value={doc.name} onChange={e => setNested('project_documents', idx, 'name', e.target.value)}
                                            className={inputCls} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelCls}>Description</label>
                                        <input type="text" placeholder="Short description..."
                                            value={doc.description} onChange={e => setNested('project_documents', idx, 'description', e.target.value)}
                                            className={inputCls} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelCls}>Upload Document</label>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1 relative">
                                                <input
                                                    type="file"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            setNested('project_documents', idx, 'document', file);
                                                        }
                                                    }}
                                                    className="hidden"
                                                    id={`doc-upload-${idx}`}
                                                />
                                                <label
                                                    htmlFor={`doc-upload-${idx}`}
                                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-background border border-dashed border-border rounded-2xl text-muted text-sm font-bold cursor-pointer hover:border-orange-500/50 hover:bg-orange-500/5 transition-all w-full"
                                                >
                                                    {doc.document ? 'Change File' : 'Choose File'}
                                                </label>
                                            </div>
                                            {doc.document && (
                                                <a
                                                    href={typeof doc.document === 'string' ? doc.document : URL.createObjectURL(doc.document as any)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="bg-emerald-500/10 text-emerald-500 p-2.5 rounded-2xl border border-emerald-500/20 hover:bg-emerald-500/20 transition-all flex items-center gap-2 group/view"
                                                >
                                                    <FileText size={20} />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest hidden group-hover/view:inline">View</span>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </FormSection>

                {/* ── 5. Infrastructure ── */}
                <FormSection
                    title="Infrastructure"
                    icon={<Server size={22} />}
                    iconColor="text-blue-500"
                    bgColor="bg-blue-500/10"
                    action={
                        <div className="flex gap-2">
                            <button type="button"
                                onClick={() => addItem('project_domains', { name: '', accrued_by: 'Extechnology', purchased_from: '', purchase_date: '', expiration_date: '', status: 'Active', cost: '0.00' })}
                                className="text-xs flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-500 rounded-xl hover:bg-blue-500/20 transition-all font-bold">
                                <Plus size={14} /> Domain
                            </button>
                            <button type="button"
                                onClick={() => addItem('project_servers', { name: '', server_type: 'VPS', accrued_by: 'Extechnology', purchased_from: '', purchase_date: '', expiration_date: '', status: 'Active', cost: '0.00' })}
                                className="text-xs flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 text-indigo-500 rounded-xl hover:bg-indigo-500/20 transition-all font-bold">
                                <Plus size={14} /> Server
                            </button>
                        </div>
                    }>
                    <div className="space-y-6">
                        {formData.project_domains.length === 0 && formData.project_servers.length === 0 && (
                            <p className="text-center text-muted text-sm py-6">No domains or servers added yet.</p>
                        )}
                        {formData.project_domains?.map((domain: any, idx: number) => (
                            <div key={idx} className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-[2rem] space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-black text-blue-500 uppercase tracking-widest">🌐 Domain #{idx + 1}</span>
                                    <button type="button" onClick={() => removeItem('project_domains', idx)} className="text-rose-500 hover:bg-rose-500/10 p-2 rounded-xl"><Trash2 size={18} /></button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <label className={labelCls}>Domain Name</label>
                                        <input type="text" placeholder="e.g. mycompany.com"
                                            value={domain.name || ''} onChange={e => setNested('project_domains', idx, 'name', e.target.value)}
                                            className={inputCls} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className={labelCls}>Accrued By</label>
                                        <select
                                            value={domain.accrued_by || 'Extechnology'}
                                            onChange={e => setNested('project_domains', idx, 'accrued_by', e.target.value)}
                                            className={inputCls}
                                        >
                                            <option value="Extechnology">Extechnology</option>
                                            <option value="Client">Client</option>
                                            <option value="Third Party">Third Party</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className={labelCls}>Purchased From</label>
                                        <ProviderSelect
                                            value={domain.purchased_from || ''}
                                            onChange={(val) => setNested('project_domains', idx, 'purchased_from', val)}
                                            options={['GoDaddy', 'Namecheap', 'Hostinger', 'Cloudflare', 'Google Domains', 'Porkbun', 'Bluehost', 'Domain.com', 'Network Solutions', 'BigRock']}
                                            placeholder="e.g. GoDaddy"
                                            className={inputCls}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className={labelCls}>Purchase Date</label>
                                        <input type="date"
                                            value={domain.purchase_date || ''} onChange={e => setNested('project_domains', idx, 'purchase_date', e.target.value)}
                                            className={inputCls} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className={labelCls}>Expiration Date</label>
                                        <input type="date"
                                            value={domain.expiration_date || ''} onChange={e => setNested('project_domains', idx, 'expiration_date', e.target.value)}
                                            className={inputCls} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className={labelCls}>Cost (₹)</label>
                                        <input type="number" step="0.01" placeholder="0.00"
                                            value={domain.cost || ''} onChange={e => setNested('project_domains', idx, 'cost', e.target.value)}
                                            className={`${inputCls} font-bold`} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className={labelCls}>Status</label>
                                        <select value={domain.status || 'Active'} onChange={e => setNested('project_domains', idx, 'status', e.target.value)} className={inputCls}>
                                            <option value="Active">Active</option>
                                            <option value="Expired">Expired</option>
                                            <option value="Pending">Pending</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className={`${labelCls} text-emerald-500`}>Payment Status</label>
                                        <div className="flex items-center gap-2">
                                            <select value={domain.payment_status || 'UNPAID'} onChange={e => setNested('project_domains', idx, 'payment_status', e.target.value)} className={`${inputCls} flex-1 font-bold text-emerald-500`}>
                                                <option value="UNPAID">UNPAID</option>
                                                <option value="PARTIAL">PARTIAL</option>
                                                <option value="PAID">PAID</option>
                                            </select>
                                            <button
                                                type="button"
                                                onClick={() => handleBillItem('domain', domain.name || 'Domain', domain.cost || 0, domain.purchase_date, domain.expiration_date, domain.id)}
                                                className="h-[46px] px-3 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded-xl transition-all border border-emerald-500/20 flex items-center gap-2"
                                                title="Generate Invoice"
                                            >
                                                <Receipt size={18} />
                                                <span className="text-[10px] font-black uppercase">Bill</span>
                                            </button>
                                        </div>
                                    </div>
                                    {domain.accrued_by === 'Third Party' && (
                                        <div className="lg:col-span-3 pt-4 border-t border-border/30">
                                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                🏢 Provider Details
                                            </p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                                <div className="space-y-1">
                                                    <label className={labelCls}>Company Name</label>
                                                    <input type="text" placeholder="e.g. GoDaddy Inc."
                                                        value={domain.provider_detail?.company_name || ''}
                                                        onChange={e => setNested('project_domains', idx, 'provider_detail', { ...(domain.provider_detail || {}), company_name: e.target.value })}
                                                        className={inputCls} />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className={labelCls}>Contact Person</label>
                                                    <input type="text" placeholder="Manager Name"
                                                        value={domain.provider_detail?.contact_person || ''}
                                                        onChange={e => setNested('project_domains', idx, 'provider_detail', { ...(domain.provider_detail || {}), contact_person: e.target.value })}
                                                        className={inputCls} />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className={labelCls}>Email</label>
                                                    <input type="email" placeholder="provider@email.com"
                                                        value={domain.provider_detail?.email || ''}
                                                        onChange={e => setNested('project_domains', idx, 'provider_detail', { ...(domain.provider_detail || {}), email: e.target.value })}
                                                        className={inputCls} />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className={labelCls}>Phone</label>
                                                    <input type="text" placeholder="+1..."
                                                        value={domain.provider_detail?.phone || ''}
                                                        onChange={e => setNested('project_domains', idx, 'provider_detail', { ...(domain.provider_detail || {}), phone: e.target.value })}
                                                        className={inputCls} />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {formData.project_servers?.map((server: any, idx: number) => (
                            <div key={idx} className="p-6 bg-indigo-500/5 border border-indigo-500/20 rounded-[2rem] space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-black text-indigo-500 uppercase tracking-widest">🖥️ Server #{idx + 1}</span>
                                    <button type="button" onClick={() => removeItem('project_servers', idx)} className="text-rose-500 hover:bg-rose-500/10 p-2 rounded-xl"><Trash2 size={18} /></button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <label className={labelCls}>Server Name</label>
                                        <input type="text" placeholder="e.g. AWS Lightsail"
                                            value={server.name || ''} onChange={e => setNested('project_servers', idx, 'name', e.target.value)}
                                            className={inputCls} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className={labelCls}>Server Type</label>
                                        <ProviderSelect
                                            value={server.server_type ?? 'VPS'}
                                            onChange={(val) => setNested('project_servers', idx, 'server_type', val)}
                                            options={['VPS', 'Shared', 'Dedicated', 'Cloud']}
                                            placeholder="Server Type..."
                                            className={inputCls}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className={labelCls}>Accrued By</label>
                                        <select
                                            value={server.accrued_by || 'Extechnology'}
                                            onChange={e => setNested('project_servers', idx, 'accrued_by', e.target.value)}
                                            className={inputCls}
                                        >
                                            <option value="Extechnology">Extechnology</option>
                                            <option value="Client">Client</option>
                                            <option value="Third Party">Third Party</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className={labelCls}>Purchased From</label>
                                        <ProviderSelect
                                            value={server.purchased_from || ''}
                                            onChange={(val) => setNested('project_servers', idx, 'purchased_from', val)}
                                            options={['AWS', 'DigitalOcean', 'Google Cloud', 'Microsoft Azure', 'Linode', 'Vultr', 'Hostinger', 'Hetzner', 'OVHCloud', 'Contabo']}
                                            placeholder="e.g. Amazon"
                                            className={inputCls}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className={labelCls}>Purchase Date</label>
                                        <input type="date"
                                            value={server.purchase_date || ''} onChange={e => setNested('project_servers', idx, 'purchase_date', e.target.value)}
                                            className={inputCls} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className={labelCls}>Expiration Date</label>
                                        <input type="date"
                                            value={server.expiration_date || ''} onChange={e => setNested('project_servers', idx, 'expiration_date', e.target.value)}
                                            className={inputCls} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className={labelCls}>Cost (₹)</label>
                                        <input type="number" step="0.01" placeholder="0.00"
                                            value={server.cost || ''} onChange={e => setNested('project_servers', idx, 'cost', e.target.value)}
                                            className={`${inputCls} font-bold`} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className={labelCls}>Status</label>
                                        <select value={server.status || 'Active'} onChange={e => setNested('project_servers', idx, 'status', e.target.value)} className={inputCls}>
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                            <option value="Pending">Pending</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className={`${labelCls} text-emerald-500`}>Payment Status</label>
                                        <div className="flex items-center gap-2">
                                            <select value={server.payment_status || 'UNPAID'} onChange={e => setNested('project_servers', idx, 'payment_status', e.target.value)} className={`${inputCls} flex-1 font-bold text-emerald-500`}>
                                                <option value="UNPAID">UNPAID</option>
                                                <option value="PARTIAL">PARTIAL</option>
                                                <option value="PAID">PAID</option>
                                            </select>
                                            <button
                                                type="button"
                                                onClick={() => handleBillItem('server', server.name || 'Server', server.cost || 0, server.purchase_date, server.expiration_date, server.id)}
                                                className="h-[46px] px-3 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded-xl transition-all border border-emerald-500/20 flex items-center gap-2"
                                                title="Generate Invoice"
                                            >
                                                <Receipt size={18} />
                                                <span className="text-[10px] font-black uppercase">Bill</span>
                                            </button>
                                        </div>
                                    </div>
                                    {server.accrued_by === 'Third Party' && (
                                        <div className="lg:col-span-3 pt-4 border-t border-border/30">
                                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                🏢 Provider Details
                                            </p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                                <div className="space-y-1">
                                                    <label className={labelCls}>Company Name</label>
                                                    <input type="text" placeholder="e.g. DigitalOcean"
                                                        value={server.provider_detail?.company_name || ''}
                                                        onChange={e => setNested('project_servers', idx, 'provider_detail', { ...(server.provider_detail || {}), company_name: e.target.value })}
                                                        className={inputCls} />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className={labelCls}>Contact Person</label>
                                                    <input type="text" placeholder="Manager Name"
                                                        value={server.provider_detail?.contact_person || ''}
                                                        onChange={e => setNested('project_servers', idx, 'provider_detail', { ...(server.provider_detail || {}), contact_person: e.target.value })}
                                                        className={inputCls} />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className={labelCls}>Email</label>
                                                    <input type="email" placeholder="support@do.com"
                                                        value={server.provider_detail?.email || ''}
                                                        onChange={e => setNested('project_servers', idx, 'provider_detail', { ...(server.provider_detail || {}), email: e.target.value })}
                                                        className={inputCls} />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className={labelCls}>Phone</label>
                                                    <input type="text" placeholder="+1..."
                                                        value={server.provider_detail?.phone || ''}
                                                        onChange={e => setNested('project_servers', idx, 'provider_detail', { ...(server.provider_detail || {}), phone: e.target.value })}
                                                        className={inputCls} />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </FormSection>



                {/* ── 7. Project Team ── */}
                <FormSection
                    title="Project Team"
                    icon={<Users size={22} />}
                    iconColor="text-violet-500"
                    bgColor="bg-violet-500/10"
                    action={
                        <button type="button"
                            onClick={() => addItem('project_teams', { team: '', status: 'Pending', payment_status: 'UNPAID', deadline: '', actual_end_date: '', description: '', members: [] })}
                            className="text-xs flex items-center gap-1.5 px-4 py-2 bg-violet-500/10 text-violet-500 rounded-xl hover:bg-violet-500/20 transition-all font-bold">
                            <Plus size={14} /> Add Team Group
                        </button>
                    }>
                    <div className="space-y-6">
                        {formData.project_teams?.length === 0 && (
                            <p className="text-center text-muted text-sm py-6">No team groups added yet.</p>
                        )}
                        {formData.project_teams?.map((team: any, tIdx: number) => (
                            <div key={tIdx} className="border border-border rounded-[2rem] overflow-hidden bg-muted/5">
                                <div className="p-5 flex flex-wrap items-center gap-4 border-b border-border/50">
                                    <div className="space-y-1">
                                        <label className={labelCls}>Select Team</label>
                                        <div className="flex items-center gap-2">
                                            <select
                                                value={team.team}
                                                onChange={e => {
                                                    const val = parseInt(e.target.value);
                                                    const selectedTeam = teams.find(t => t.id === val);
                                                    setFormData((p: any) => {
                                                        const pTeams = [...p.project_teams];
                                                        const pt = { ...pTeams[tIdx], team: val };

                                                        if (selectedTeam && selectedTeam.members) {
                                                            const currentMembers = pt.members || [];
                                                            const existingEmployeeIds = new Set(currentMembers.map((m: any) => m.employee));

                                                            const membersToAdd = selectedTeam.members
                                                                .filter((id: number) => !existingEmployeeIds.has(id))
                                                                .map((id: number) => users.find(u => u.id === id))
                                                                .filter(Boolean);

                                                            const newMembers = membersToAdd.map((user: any) => ({
                                                                role: user.designation || '',
                                                                cost: '0.00',
                                                                allocated_days: 0,
                                                                actual_days_spent: 0,
                                                                employee: user.id,
                                                                start_date: '',
                                                                end_date: '',
                                                                status: 'Pending',
                                                                notes: `Added from ${selectedTeam.name}`
                                                            }));
                                                            pt.members = [...currentMembers, ...newMembers];
                                                        }

                                                        pTeams[tIdx] = pt;
                                                        return { ...p, project_teams: pTeams };
                                                    });
                                                }}
                                                className={`${smallInputCls} w-48`}
                                            >
                                                <option value="">Choose a team...</option>
                                                {teams.map(t => (
                                                    <option key={t.id} value={t.id}>{t.name}</option>
                                                ))}
                                            </select>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setTeamAssignmentTarget({ type: 'project', idx: tIdx });
                                                    setIsQuickTeamModalOpen(true);
                                                }}
                                                className="p-2 bg-violet-500/10 text-violet-500 rounded-xl hover:bg-violet-500/20 transition-all border border-violet-500/20"
                                                title="Create New Team"
                                            >
                                                <Plus size={16} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => syncProjectTeamMembers(tIdx)}
                                                className="p-2 bg-violet-500/10 text-violet-500 rounded-xl hover:bg-violet-500/20 transition-all border border-violet-500/20"
                                                title="Sync/Reload Team Members"
                                            >
                                                <RefreshCcw size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className={labelCls}>Status</label>
                                        <select value={team.status || 'Pending'}
                                            onChange={e => setNested('project_teams', tIdx, 'status', e.target.value)}
                                            className={`${smallInputCls} w-32`}>
                                            <option value="Pending">Pending</option>
                                            <option value="Progressing">Progressing</option>
                                            <option value="Completed">Completed</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className={`${labelCls} text-emerald-500`}>Payment Status</label>
                                        <div className="flex items-center gap-2">
                                            <select value={team.payment_status || 'UNPAID'}
                                                onChange={e => setNested('project_teams', tIdx, 'payment_status', e.target.value)}
                                                className={`${smallInputCls} flex-1 h-[46px] font-bold text-emerald-500`}>
                                                <option value="UNPAID">UNPAID</option>
                                                <option value="PAID">PAID</option>
                                            </select>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (!team.id) {
                                                        alert('Please save the project first to generate a bill for this team.');
                                                        return;
                                                    }
                                                    handleBillItem('team', team.team_detail?.name || 'Project Team',  team.cost || 0, '', '', team.id);
                                                }}
                                                className="h-[46px] px-3 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded-xl transition-all border border-emerald-500/20 flex items-center gap-2"
                                                title="Generate Invoice"
                                            >
                                                <DollarSign size={18} />
                                                <span className="text-[10px] font-black uppercase">Bill</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className={`${labelCls} text-emerald-500`}>Cost (₹)</label>
                                        <input type="number" step="0.01" placeholder="0.00" value={team.cost || ''}
                                            onChange={e => setNested('project_teams', tIdx, 'cost', e.target.value)}
                                            className={`${smallInputCls} w-32 font-bold text-emerald-500`} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className={labelCls}>Team Allocation Start</label>
                                        <input type="date" value={team.start_date || ''}
                                            onChange={e => setNested('project_teams', tIdx, 'start_date', e.target.value)}
                                            className={`${smallInputCls} w-40`} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className={labelCls}>Team Allocation End</label>
                                        <input type="date" value={team.end_date || ''}
                                            onChange={e => setNested('project_teams', tIdx, 'end_date', e.target.value)}
                                            className={`${smallInputCls} w-40`} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className={`${labelCls} text-rose-500`}>Deadline</label>
                                        <input type="date" value={team.deadline || ''}
                                            onChange={e => setNested('project_teams', tIdx, 'deadline', e.target.value)}
                                            className={`${smallInputCls} w-40 text-rose-500 font-bold`} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className={`${labelCls} text-emerald-500`}>Actual End Date</label>
                                        <input type="date" value={team.actual_end_date || ''}
                                            onChange={e => setNested('project_teams', tIdx, 'actual_end_date', e.target.value)}
                                            className={`${smallInputCls} w-40 text-emerald-500`} />
                                    </div>
                                    <button type="button" onClick={() => removeItem('project_teams', tIdx)} className="text-rose-500 hover:bg-rose-500/10 p-2.5 rounded-2xl ml-auto">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                <div className="px-6 pb-5">
                                    <div className="space-y-1">
                                        <label className={labelCls}>Team Description / Requirements</label>
                                        <textarea
                                            placeholder="Specify team-specific requirements or notes..."
                                            value={team.description || ''}
                                            onChange={e => setNested('project_teams', tIdx, 'description', e.target.value)}
                                            className={`${inputCls} min-h-[80px] py-3 text-sm`}
                                        />
                                    </div>
                                </div>
                                <div className="p-5 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <p className={labelCls}>Members</p>
                                        <button type="button" onClick={() => addTeamMember(tIdx)}
                                            className="text-[11px] font-bold text-primary uppercase flex items-center gap-1 hover:bg-primary/10 px-3 py-1.5 rounded-xl transition-all">
                                            <Plus size={13} /> Add Member
                                        </button>
                                    </div>
                                    {team.members?.map((m: any, mIdx: number) => (
                                        <div key={mIdx} className="bg-card p-5 rounded-2xl border border-border space-y-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <div className="space-y-1">
                                                    <label className={labelCls}>Role</label>
                                                    <select
                                                        value={m.role}
                                                        onChange={e => setTeamMember(tIdx, mIdx, 'role', e.target.value)}
                                                        className={inputCls}
                                                    >
                                                        <option value="">Select Role...</option>
                                                        {COMMON_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                                        {!COMMON_ROLES.includes(m.role) && m.role && <option value={m.role}>{m.role}</option>}
                                                    </select>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className={labelCls}>Cost (₹)</label>
                                                    <input type="number" step="0.01" placeholder="0.00" value={m.cost}
                                                        onChange={e => setTeamMember(tIdx, mIdx, 'cost', e.target.value)}
                                                        className={`${inputCls} text-emerald-500 font-bold`} />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className={labelCls}>Employee</label>
                                                    <select
                                                        value={m.employee || ''}
                                                        onChange={e => setTeamMember(tIdx, mIdx, 'employee', parseInt(e.target.value))}
                                                        className={inputCls}
                                                    >
                                                        <option value="">Select Employee...</option>
                                                        {users.map(u => (
                                                            <option key={u.id} value={u.id}>
                                                                {(u.first_name || u.last_name) ? `${u.first_name} ${u.last_name} (${u.username})` : u.username}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className={labelCls}>Allocated Days</label>
                                                    <input type="number" placeholder="0" value={m.allocated_days || 0}
                                                        onChange={e => setTeamMember(tIdx, mIdx, 'allocated_days', parseInt(e.target.value))}
                                                        className={inputCls} />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className={labelCls}>Actual Days Spent</label>
                                                    <input type="number" placeholder="0" value={m.actual_days_spent || 0}
                                                        onChange={e => setTeamMember(tIdx, mIdx, 'actual_days_spent', parseInt(e.target.value))}
                                                        className={inputCls} />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className={labelCls}>Status</label>
                                                    <select value={m.status || 'Pending'} onChange={e => setTeamMember(tIdx, mIdx, 'status', e.target.value)} className={inputCls}>
                                                        <option value="Pending">Pending</option>
                                                        <option value="Progressing">Progressing</option>
                                                        <option value="Completed">Completed</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className={labelCls}>Start Date</label>
                                                    <input type="date" value={m.start_date || ''}
                                                        onChange={e => setTeamMember(tIdx, mIdx, 'start_date', e.target.value)}
                                                        className={inputCls} />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className={labelCls}>End Date</label>
                                                    <input type="date" value={m.end_date || ''}
                                                        onChange={e => setTeamMember(tIdx, mIdx, 'end_date', e.target.value)}
                                                        className={inputCls} />
                                                </div>
                                                <div className="space-y-1 sm:col-span-2 lg:col-span-1">
                                                    <label className={labelCls}>Notes</label>
                                                    <input type="text" placeholder="e.g. Handling UI components" value={m.notes || ''}
                                                        onChange={e => setTeamMember(tIdx, mIdx, 'notes', e.target.value)}
                                                        className={inputCls} />
                                                </div>
                                            </div>
                                            <div className="flex justify-end">
                                                <button type="button" onClick={() => removeTeamMember(tIdx, mIdx)}
                                                    className="text-rose-500 hover:bg-rose-500/10 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all">
                                                    <Trash2 size={14} /> Remove Member
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </FormSection>

                {/* ── 7. Associated Services ── */}
                <FormSection
                    title="Associated Services"
                    icon={<Layers size={22} />}
                    iconColor="text-purple-500"
                    bgColor="bg-purple-500/10"
                    defaultOpen={false}
                    action={
                        <button type="button"
                            onClick={() => addItem('services', newServiceTemplate())}
                            className="text-xs flex items-center gap-1.5 px-4 py-2 bg-purple-500/10 text-purple-500 rounded-xl hover:bg-purple-500/20 transition-all font-bold">
                            <Plus size={14} /> Service
                        </button>
                    }>
                    <div className="space-y-6">
                        {formData.services.length === 0 && (
                            <p className="text-center text-muted text-sm py-6">No associated services yet. Click "+ Service" to add one.</p>
                        )}
                        {formData.services.map((service: any, sIdx: number) => (
                            <ServiceFormCard
                                key={sIdx}
                                service={service}
                                sIdx={sIdx}
                                addServiceTeamMember={addServiceTeamMember}
                                removeServiceTeamMember={removeServiceTeamMember}
                                setServiceTeamMember={setServiceTeamMember}
                                setServiceField={setServiceField}
                                removeItem={removeItem}
                                teams={teams}
                                users={users}
                                roles={COMMON_ROLES}
                                setFormData={setFormData}
                                onBill={handleBillItem}
                                setIsQuickTeamModalOpen={setIsQuickTeamModalOpen}
                                setTeamAssignmentTarget={setTeamAssignmentTarget}
                                syncTeamMembers={syncServiceTeamMembers}
                            />
                        ))}
                    </div>
                </FormSection>

                {/* ── Submit ── */}
                <div className="flex flex-col sm:flex-row items-center justify-end gap-6 py-6 border-t border-border sticky bottom-0 bg-background/80 backdrop-blur-sm px-6">
                    <div className="flex items-center gap-4">
                        <button type="button" onClick={() => navigate(-1)}
                            className="px-8 py-3.5 bg-muted/10 text-muted font-bold rounded-2xl border border-transparent hover:border-border hover:bg-muted/20 transition-all">
                            Cancel
                        </button>
                        <button type="submit" disabled={saving}
                            className="px-10 py-3.5 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 flex items-center gap-3 disabled:opacity-50 hover:shadow-primary/50 transition-all active:scale-95">
                            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            {isEdit ? 'Update Project' : 'Create Project'}
                        </button>
                    </div>
                </div>
            </form>

            <QuickTeamModal
                isOpen={isQuickTeamModalOpen}
                onClose={() => {
                    setIsQuickTeamModalOpen(false);
                    setTeamAssignmentTarget(null);
                }}
                onSuccess={(newTeam) => {
                    setTeams(prev => [...prev, newTeam as any]);

                    if (teamAssignmentTarget) {
                        const { type, idx } = teamAssignmentTarget;
                        const val = newTeam.id;
                        const selectedTeam = newTeam; // members_details should be present in the response if serializer permits, but if not we might need a refetch.
                        // Actually let's assume it has members_details for now.

                        setFormData((p: any) => {
                            if (type === 'service') {
                                const services = [...p.services];
                                const s = { ...services[idx] };
                                const pt = [...(s.teams || [])];

                                if (pt.length === 0) {
                                    s.teams = [{ team: val, allocated_days: 0, actual_days: 0 }];
                                } else {
                                    pt[0] = { ...pt[0], team: val };
                                    s.teams = pt;
                                }

                                if (selectedTeam.members) {
                                    const currentMembers = s.members || [];
                                    const existingEmployeeIds = new Set(currentMembers.map((m: any) => m.employee));

                                    const membersToAdd = selectedTeam.members
                                        .filter((id: number) => !existingEmployeeIds.has(id))
                                        .map((id: number) => users.find(u => u.id === id))
                                        .filter(Boolean);

                                    const newMembers = membersToAdd.map((user: any) => ({
                                        role: user.designation || '',
                                        cost: '0.00',
                                        allocated_days: 0,
                                        actual_days: 0,
                                        employee: user.id,
                                        start_date: s.start_date || '',
                                        end_date: s.deadline || '',
                                        status: 'Pending',
                                        notes: `Added from ${selectedTeam.name}`
                                    }));
                                    s.members = [...currentMembers, ...newMembers];
                                }

                                services[idx] = s;
                                return { ...p, services: services };
                            } else {
                                const pTeams = [...p.project_teams];
                                const pt = { ...pTeams[idx], team: val };

                                if (selectedTeam.members) {
                                    const currentMembers = pt.members || [];
                                    const existingEmployeeIds = new Set(currentMembers.map((m: any) => m.employee));

                                    const membersToAdd = selectedTeam.members
                                        .filter((id: number) => !existingEmployeeIds.has(id))
                                        .map((id: number) => users.find(u => u.id === id))
                                        .filter(Boolean);

                                    const newMembers = membersToAdd.map((user: any) => ({
                                        role: user.designation || '',
                                        cost: '0.00',
                                        allocated_days: 0,
                                        actual_days_spent: 0,
                                        employee: user.id,
                                        start_date: '',
                                        end_date: '',
                                        status: 'Pending',
                                        notes: `Added from ${selectedTeam.name}`
                                    }));
                                    pt.members = [...currentMembers, ...newMembers];
                                }

                                pTeams[idx] = pt;
                                return { ...p, project_teams: pTeams };
                            }
                        });
                    }

                    setIsQuickTeamModalOpen(false);
                    setTeamAssignmentTarget(null);
                }}
            />
        </div>
    );
};

export default ProjectForm;
