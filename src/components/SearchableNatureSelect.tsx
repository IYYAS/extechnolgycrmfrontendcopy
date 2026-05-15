import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Layers, Loader2, X } from 'lucide-react';
import { api } from '../api/api';

export interface ProjectNature {
    id: number;
    name: string;
}

interface NatureListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: ProjectNature[];
}

interface SearchableNatureSelectProps {
    value: number | string | null;
    onChange: (value: number | null) => void;
    disabled?: boolean;
    placeholder?: string;
    className?: string;
}

const SearchableNatureSelect: React.FC<SearchableNatureSelectProps> = ({
    value,
    onChange,
    disabled = false,
    placeholder = "Select Nature...",
    className = ""
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [natures, setNatures] = useState<ProjectNature[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [selectedDetails, setSelectedDetails] = useState<ProjectNature | null>(null);
    
    const pageRef = useRef(1);
    const loadingRef = useRef(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

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
                    const response = await api.get<ProjectNature>(`/project-natures/${value}/`);
                    setSelectedDetails(response.data);
                } catch (err) {
                    console.error("Failed to fetch selected nature details:", err);
                }
            }
        };

        const existing = natures.find(n => n.id === Number(value));
        if (existing) {
            setSelectedDetails(existing);
        } else if (value) {
            fetchSelected();
        } else {
            setSelectedDetails(null);
        }
    }, [value, natures]);

    const loadNatures = async (pageNum: number, searchStr: string, reset: boolean) => {
        if (loadingRef.current && !reset) return;
        
        loadingRef.current = true;
        setLoading(true);
        
        try {
            const url = searchStr 
                ? `/project-natures/?page=${pageNum}&search=${encodeURIComponent(searchStr)}`
                : `/project-natures/?page=${pageNum}`;
            const response = await api.get<NatureListResponse>(url);
            const data = response.data;
            
            if (reset) {
                setNatures(data.results);
                pageRef.current = 1;
            } else {
                setNatures(prev => {
                    const existingIds = new Set(prev.map(n => n.id));
                    const newNatures = data.results.filter(n => !existingIds.has(n.id));
                    return [...prev, ...newNatures];
                });
                pageRef.current = pageNum;
            }
            setHasMore(!!data.next);
        } catch (error) {
            console.error("Failed to load natures:", error);
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    };

    // Reset and load on open or search change
    useEffect(() => {
        if (isOpen) {
            loadNatures(1, debouncedSearch, true);
        }
    }, [isOpen, debouncedSearch]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight + 50 && hasMore && !loadingRef.current) {
            loadNatures(pageRef.current + 1, debouncedSearch, false);
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

    const displayName = selectedDetails?.name || (value ? `ID: ${value}` : placeholder);

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`flex items-center justify-between px-4 py-3 bg-background border border-border rounded-2xl cursor-pointer transition-all hover:border-primary/50 group ${isOpen ? 'ring-2 ring-primary/20 border-primary shadow-lg shadow-primary/5' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <div className="flex items-center gap-3 truncate">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${value ? 'bg-primary/10 text-primary' : 'bg-muted/10 text-muted'}`}>
                        <Layers size={16} />
                    </div>
                    <div className="flex flex-col truncate">
                        <span className={`text-sm font-bold truncate ${!value ? 'text-muted' : 'text-foreground'}`}>
                            {displayName}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {value && !disabled && (
                        <button 
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange(null);
                            }}
                            className="p-1 hover:bg-rose-500/10 text-muted hover:text-rose-500 rounded-lg transition-colors"
                        >
                            <X size={14} />
                        </button>
                    )}
                    <ChevronDown size={18} className={`text-muted transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-[110] mt-2 w-full bg-card border border-border rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="p-4 border-b border-border bg-muted/5">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={16} />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Search nature name..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div 
                        className="max-h-72 overflow-y-auto p-2 custom-scrollbar"
                        onScroll={handleScroll}
                    >
                        {natures.length === 0 && !loading && (
                            <div className="py-12 text-center">
                                <div className="w-12 h-12 bg-muted/10 rounded-2xl flex items-center justify-center mx-auto mb-3 text-muted">
                                    <Layers size={24} />
                                </div>
                                <p className="text-[11px] font-black text-muted uppercase tracking-widest italic">No natures found</p>
                            </div>
                        )}
                        <div className="space-y-1">
                            {natures.map(nature => (
                                <div
                                    key={nature.id}
                                    onClick={() => {
                                        onChange(nature.id);
                                        setIsOpen(false);
                                        setSearch('');
                                    }}
                                    className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all border border-transparent hover:bg-primary/5 hover:border-primary/10 group ${value === nature.id ? 'bg-primary/10 border-primary/20' : ''}`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs transition-all ${value === nature.id ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/20' : 'bg-muted/10 text-muted group-hover:bg-primary/20 group-hover:text-primary'}`}>
                                        {nature.name?.[0]?.toUpperCase() || 'N'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-bold truncate ${value === nature.id ? 'text-primary' : 'text-foreground'}`}>
                                            {nature.name}
                                        </p>
                                    </div>
                                    {value === nature.id && (
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
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchableNatureSelect;
