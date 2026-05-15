import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, MapPin, Loader2, X } from 'lucide-react';
import { getAllBusinessAddresses, getBusinessAddress } from '../pages/projects/projectService';
import type { ProjectBusinessAddress } from '../pages/projects/projectService';

interface SearchableBusinessAddressSelectProps {
    value: number | string | null;
    onChange: (value: number | null) => void;
    disabled?: boolean;
    placeholder?: string;
    className?: string;
}

const SearchableBusinessAddressSelect: React.FC<SearchableBusinessAddressSelectProps> = ({
    value,
    onChange,
    disabled = false,
    placeholder = "Select Client / Business Address...",
    className = ""
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [addresses, setAddresses] = useState<ProjectBusinessAddress[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [selectedAddressDetails, setSelectedAddressDetails] = useState<ProjectBusinessAddress | null>(null);
    
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

    // Fetch initial address details if not in list
    useEffect(() => {
        const fetchSelectedAddress = async () => {
            if (value && (typeof value === 'number' || !isNaN(Number(value)))) {
                try {
                    const addr = await getBusinessAddress(Number(value));
                    setSelectedAddressDetails(addr);
                } catch (err) {
                    console.error("Failed to fetch selected address details:", err);
                }
            }
        };

        const existing = addresses.find(a => a.id === Number(value));
        if (existing) {
            setSelectedAddressDetails(existing);
        } else if (value) {
            fetchSelectedAddress();
        } else {
            setSelectedAddressDetails(null);
        }
    }, [value, addresses]);

    const loadAddresses = async (pageNum: number, searchStr: string, reset: boolean) => {
        if (loadingRef.current && !reset) return;
        
        loadingRef.current = true;
        setLoading(true);
        
        try {
            const data = await getAllBusinessAddresses(pageNum, searchStr);
            if (reset) {
                setAddresses(data.results);
                pageRef.current = 1;
            } else {
                setAddresses(prev => {
                    const existingIds = new Set(prev.map(a => a.id));
                    const newAddresses = data.results.filter(a => !existingIds.has(a.id));
                    return [...prev, ...newAddresses];
                });
                pageRef.current = pageNum;
            }
            setHasMore(!!data.next);
        } catch (error) {
            console.error("Failed to load addresses:", error);
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    };

    // Reset and load on open or search change
    useEffect(() => {
        if (isOpen) {
            loadAddresses(1, debouncedSearch, true);
        }
    }, [isOpen, debouncedSearch]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight + 50 && hasMore && !loadingRef.current) {
            loadAddresses(pageRef.current + 1, debouncedSearch, false);
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

    const displayName = selectedAddressDetails 
        ? (selectedAddressDetails.legal_name || selectedAddressDetails.attention_name)
        : (value ? `ID: ${value}` : placeholder);

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`flex items-center justify-between px-4 py-3 bg-background border border-border rounded-2xl cursor-pointer transition-all hover:border-primary/50 group ${isOpen ? 'ring-2 ring-primary/20 border-primary shadow-lg shadow-primary/5' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <div className="flex items-center gap-3 truncate">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${value ? 'bg-primary/10 text-primary' : 'bg-muted/10 text-muted'}`}>
                        {selectedAddressDetails?.logo ? (
                            <img src={selectedAddressDetails.logo} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <MapPin size={16} />
                        )}
                    </div>
                    <div className="flex flex-col truncate">
                        <span className={`text-sm font-bold truncate ${!value ? 'text-muted' : 'text-foreground'}`}>
                            {displayName}
                        </span>
                        {selectedAddressDetails?.city && (
                            <span className="text-[10px] text-muted font-medium truncate uppercase tracking-wider">{selectedAddressDetails.city}, {selectedAddressDetails.state}</span>
                        )}
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
                                placeholder="Search by legal name, attention, city..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div 
                        ref={scrollContainerRef}
                        className="max-h-72 overflow-y-auto p-2 custom-scrollbar"
                        onScroll={handleScroll}
                    >
                        {addresses.length === 0 && !loading && (
                            <div className="py-12 text-center">
                                <div className="w-12 h-12 bg-muted/10 rounded-2xl flex items-center justify-center mx-auto mb-3 text-muted">
                                    <Search size={24} />
                                </div>
                                <p className="text-[11px] font-black text-muted uppercase tracking-widest italic">No addresses found</p>
                            </div>
                        )}
                        <div className="space-y-1">
                            {addresses.map(addr => (
                                <div
                                    key={addr.id}
                                    onClick={() => {
                                        onChange(addr.id || null);
                                        setIsOpen(false);
                                        setSearch('');
                                    }}
                                    className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all border border-transparent hover:bg-primary/5 hover:border-primary/10 group ${value === addr.id ? 'bg-primary/10 border-primary/20' : ''}`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs transition-all ${value === addr.id ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/20' : 'bg-muted/10 text-muted group-hover:bg-primary/20 group-hover:text-primary'}`}>
                                        {addr.logo ? (
                                            <img src={addr.logo} alt="" className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            (addr.legal_name?.[0] || addr.attention_name?.[0] || 'A').toUpperCase()
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-bold truncate ${value === addr.id ? 'text-primary' : 'text-foreground'}`}>
                                            {addr.legal_name || addr.attention_name}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-[10px] text-muted truncate">{addr.city}, {addr.state}</p>
                                            {addr.gst_number && (
                                                <>
                                                    <span className="w-1 h-1 rounded-full bg-border" />
                                                    <p className="text-[9px] font-black text-primary/60 uppercase truncate">GST: {addr.gst_number}</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    {value === addr.id && (
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
                        {!hasMore && addresses.length > 0 && (
                            <div className="py-6 text-center">
                                <p className="text-[9px] font-black text-muted/40 uppercase tracking-[0.2em]">End of list</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchableBusinessAddressSelect;
