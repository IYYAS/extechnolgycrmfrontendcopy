import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ArrowRight, Loader2, Briefcase } from 'lucide-react';
import { getAnalyticalProjects } from './dashboardService';
import type { AnalyticalProjectsResponse } from './dashboardService';

const ProjectStatisticsDetail: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    
    // Read from URL
    const statusParam = searchParams.get('status') || 'all';
    const filterParam = searchParams.get('filter') || 'this_year';
    const dateFieldParam = searchParams.get('date_field') || 'start_date';
    
    const [data, setData] = useState<AnalyticalProjectsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, [statusParam, filterParam, dateFieldParam]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Map 'filter' from URL to 'filter_type' for API
            // Map 'status' from URL to 'status' for API
            let backendStatus = statusParam;
            if (backendStatus === 'done') backendStatus = 'completed'; // mapping if needed
            
            const reqStatus = backendStatus === 'all' ? undefined : backendStatus;
            
            const res = await getAnalyticalProjects({
                status: reqStatus,
                filter_type: filterParam === 'all' ? undefined : filterParam,
                date_field: dateFieldParam
            } as any);
            setData(res);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch project statistics details.');
        } finally {
            setLoading(false);
        }
    };

    const updateParam = (key: string, value: string) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set(key, value);
        setSearchParams(newParams);
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
            case 'in_progress': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
            case 'pending': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
            default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
        }
    };

    const displayStatus = statusParam === 'completed' || statusParam === 'done' ? 'Completed' : 
                          statusParam === 'pending' ? 'Pending' : 
                          statusParam === 'active' ? 'Active' : 'All';

    const displayMutedStatus = displayStatus === 'Completed' ? 'text-emerald-500' : 'text-slate-400';

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-4">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="p-2 bg-muted hover:bg-muted/80 rounded-lg text-muted-foreground transition-colors border border-border"
                        title="Back to Dashboard"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground font-mono tracking-tight">
                            Project Status: <span className={displayMutedStatus}>{displayStatus}</span>
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">
                            {data?.total_project_count || data?.count || 0} Projects found for {filterParam.replace('_', ' ')}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Status Toggle */}
                    <div className="flex bg-card border border-border rounded-lg p-1">
                        <button
                            onClick={() => updateParam('status', 'completed')}
                            className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${
                                (statusParam === 'completed' || statusParam === 'done')
                                    ? 'bg-emerald-500 text-white shadow-sm' 
                                    : 'text-slate-500 hover:text-foreground'
                            }`}
                        >
                            Completed
                        </button>
                        <button
                            onClick={() => updateParam('status', 'pending')}
                            className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${
                                statusParam === 'pending'
                                    ? 'bg-indigo-500 text-white shadow-sm' 
                                    : 'text-slate-500 hover:text-foreground hover:bg-muted/50'
                            }`}
                        >
                            Pending
                        </button>
                    </div>

                    {/* Date Field Dropdown */}
                    <div className="bg-card border border-border rounded-lg relative">
                        <select 
                            value={dateFieldParam}
                            onChange={(e) => updateParam('date_field', e.target.value)}
                            className="bg-transparent text-sm text-foreground font-bold py-2 pl-3 pr-8 w-36 focus:outline-none appearance-none cursor-pointer"
                        >
                            <option value="start_date">Start Date</option>
                            <option value="created_at">Created Date</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                            <ChevronLeft size={14} className="-rotate-90" />
                        </div>
                    </div>

                    {/* Filter Toggle */}
                    <div className="flex bg-card border border-border rounded-lg p-1">
                        {['all', 'today', 'this_week', 'this_month', 'this_year', 'custom'].map((f) => (
                            <button
                                key={f}
                                onClick={() => updateParam('filter', f)}
                                className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-md transition-all ${
                                    filterParam === f 
                                        ? 'bg-indigo-500 text-white shadow-sm' 
                                        : 'text-slate-500 hover:text-foreground hover:bg-muted/50'
                                }`}
                            >
                                {f.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                </div>
            ) : error ? (
                <div className="bg-card border border-rose-500/20 rounded-xl p-8 text-center shadow-xl">
                    <p className="text-rose-500 font-bold mb-4">{error}</p>
                    <button onClick={fetchData} className="px-6 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-all font-bold">Try Again</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data?.results?.map((project: any) => (
                        <div key={project.project_id || project.project_name} className="bg-card border border-border rounded-2xl p-6 shadow-xl hover:border-indigo-500/30 transition-all group flex flex-col justify-between hover:-translate-y-1 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-2xl pointer-events-none" />
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="font-black text-foreground text-lg truncate pr-4 uppercase tracking-tight">{project.project_name}</h3>
                                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border shadow-sm ${getStatusColor(project.status || project.project_status)} whitespace-nowrap`}>
                                    {(project.status || project.project_status).replace('_', ' ')}
                                </div>
                            </div>
                            
                            <div className="mb-6 space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Team:</span>
                                    <span className="text-[11px] font-black text-indigo-400 uppercase">{project.project_team_name || 'No Team'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Paid:</span>
                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${project.paid_status === 'Paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                        {project.paid_status || 'UNPAID'}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="flex items-end justify-between mt-auto pt-5 border-t border-border">
                                <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                                    Started: <span className="text-foreground">{project.start_date ? new Date(project.start_date).toLocaleDateString() : 'N/A'}</span>
                                </div>
                                <button 
                                    onClick={() => navigate(`/projects/${project.project_id || project.project_name}`)}
                                    className="text-indigo-500 text-xs font-black uppercase hover:text-indigo-600 flex items-center gap-1 transition-colors"
                                >
                                    Details <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    ))}
                    
                    {(!data?.results || data.results.length === 0) && (
                        <div className="col-span-full py-20 text-center bg-card rounded-2xl border border-border shadow-xl">
                            <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4 opacity-40" />
                            <p className="text-slate-500 font-bold uppercase tracking-widest">No projects matching filters</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProjectStatisticsDetail;
