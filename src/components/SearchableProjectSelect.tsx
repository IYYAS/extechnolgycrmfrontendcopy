import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Layout, Loader2, X } from 'lucide-react';
import { api } from '../api/api';

export interface Project {
    id: number;
    project_base_informations?: Array<{
        name: string;
    }>;
}

interface ProjectListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Project[];
}

interface SearchableProjectSelectProps {
    value: number | string | null;
    onChange: (value: number | null) => void;
    disabled?: boolean;
    placeholder?: string;
    className?: string;
    label?: string;
    icon?: React.ReactNode;
}

const SearchableProjectSelect: React.FC<SearchableProjectSelectProps> = ({
    value,
    onChange,
    disabled = false,
    placeholder = "Select Project...",
    className = "",
    label,
    icon
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [selectedDetails, setSelectedDetails] = useState<Project | null>(null);
    
    const pageRef = useRef(1);
    const loadingRef = useRef(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    // Fetch initial details if not in list
    useEffect(() => {
        const fetchSelected = async () => {
            if (value && (typeof value === 'number' || !isNaN(Number(value)))) {
                try {
                    const response = await api.get<Project>(`/projects/${value}/`);
                    setSelectedDetails(response.data);
                } catch (err) {
                    console.error("Failed to fetch selected project details:", err);
                }
            }
        };

        const existing = projects.find(p => p.id === Number(value));
        if (existing) {
            setSelectedDetails(existing);
        } else if (value) {
            fetchSelected();
        } else {
            setSelectedDetails(null);
        }
    }, [value, projects]);

    const loadProjects = async (pageNum: number, searchStr: string, reset: boolean) => {
        if (loadingRef.current && !reset) return;
        
        loadingRef.current = true;
        setLoading(true);
        
        try {
            const url = searchStr 
                ? `/projects/?page=${pageNum}&search=${encodeURIComponent(searchStr)}`
                : `/projects/?page=${pageNum}`;
            const response = await api.get<ProjectListResponse>(url);
            const data = response.data;
            
            if (reset) {
                setProjects(data.results);
                pageRef.current = 1;
            } else {
                setProjects(prev => {
                    const existingIds = new Set(prev.map(p => p.id));
                    const newProjs = data.results.filter(p => !existingIds.has(p.id));
                    return [...prev, ...newProjs];
                });
                pageRef.current = pageNum;
            }
            setHasMore(!!data.next);

            // AUTO-FILL CHECK: If the container isn't full yet, and we have more, load next page
            setTimeout(() => {
                if (scrollContainerRef.current) {
                    const { scrollHeight, clientHeight } = scrollContainerRef.current;
                    if (scrollHeight <= clientHeight + 10 && !!data.next && !loadingRef.current) {
                        loadProjects(pageNum + 1, searchStr, false);
                    }
                }
            }, 100);

        } catch (error) {
            console.error("Failed to load projects:", error);
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    };

    // Reset and load on open or search change
    useEffect(() => {
        if (isOpen) {
            loadProjects(1, debouncedSearch, true);
        }
    }, [isOpen, debouncedSearch]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight + 50 && hasMore && !loadingRef.current) {
            loadProjects(pageRef.current + 1, debouncedSearch, false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const displayName = selectedDetails?.project_base_informations?.[0]?.name || (value ? `Project #${value}` : placeholder);

    return (
        <div className={`relative w-full ${className}`} ref={dropdownRef}>
            {label && <label className="text-[11px] font-bold text-muted uppercase tracking-widest mb-1.5 block px-1">{label}</label>}
            
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`relative group cursor-pointer w-full pl-12 pr-10 py-4 bg-background border rounded-2xl transition-all font-bold flex items-center min-h-[58px] ${
                    isOpen ? 'ring-2 ring-primary/50 border-primary/50 shadow-lg shadow-primary/5' : 'border-border hover:border-primary/30'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {icon && <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isOpen ? 'text-primary' : 'text-muted group-hover:text-primary'}`}>{icon}</div>}
                
                <span className={`truncate text-base ${!selectedDetails ? 'text-muted font-medium italic' : 'text-foreground font-black'}`}>
                    {selectedDetails ? displayName : placeholder}
                </span>

                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {value && !disabled && (
                        <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onChange(null); }}
                            className="p-1 text-muted hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    )}
                    <ChevronDown size={16} className={`text-muted transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-[110] w-full mt-2 bg-card border border-border shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] rounded-[2rem] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="p-4 border-b border-border bg-muted/5">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={16} />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Search project name..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-background border border-border rounded-2xl text-base font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none shadow-inner"
                            />
                        </div>
                    </div>

                    <div 
                        ref={scrollContainerRef}
                        className="max-h-72 overflow-y-auto p-2 custom-scrollbar"
                        onScroll={handleScroll}
                    >
                        {projects.length === 0 && !loading && (
                            <div className="py-12 text-center">
                                <div className="w-12 h-12 bg-muted/10 rounded-2xl flex items-center justify-center mx-auto mb-3 text-muted">
                                    <Layout size={24} />
                                </div>
                                <p className="text-[11px] font-black text-muted uppercase tracking-widest italic">No projects found</p>
                            </div>
                        )}
                        <div className="space-y-1">
                            {projects.map(proj => (
                                <div
                                    key={proj.id}
                                    onClick={() => {
                                        onChange(proj.id);
                                        setIsOpen(false);
                                        setSearch('');
                                    }}
                                    className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all border border-transparent hover:bg-primary/5 hover:border-primary/10 group ${value === proj.id ? 'bg-primary/10 border-primary/20' : ''}`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs transition-all ${value === proj.id ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/20' : 'bg-muted/10 text-muted group-hover:bg-primary/20 group-hover:text-primary'}`}>
                                        {proj.project_base_informations?.[0]?.name?.[0]?.toUpperCase() || 'P'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-base font-black truncate transition-colors ${value === proj.id ? 'text-primary' : 'text-foreground'}`}>
                                            {proj.project_base_informations?.[0]?.name || `Project #${proj.id}`}
                                        </p>
                                        <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mt-0.5">ID: {proj.id}</p>
                                    </div>
                                    {value === proj.id && (
                                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                    )}
                                </div>
                            ))}
                        </div>
                        {loading && (
                            <div className="py-6 flex flex-col items-center justify-center gap-2 text-primary">
                                <Loader2 className="animate-spin" size={20} />
                                <span className="text-[9px] font-black uppercase tracking-widest animate-pulse">Loading More...</span>
                            </div>
                        )}
                        {hasMore && !loading && projects.length > 0 && (
                            <div className="py-4 flex flex-col items-center gap-1 opacity-40">
                                <p className="text-[9px] font-black uppercase tracking-widest italic">Scroll for more</p>
                                <ChevronDown size={12} className="animate-bounce" />
                            </div>
                        )}
                        {!hasMore && projects.length > 0 && (
                            <div className="py-6 text-center">
                                <p className="text-[9px] font-black text-muted/40 uppercase tracking-[0.2em]">End of results</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchableProjectSelect;
