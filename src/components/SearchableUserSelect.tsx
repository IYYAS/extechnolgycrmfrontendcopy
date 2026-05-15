import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, User, Loader2, X } from 'lucide-react';
import { getUsers, getUser } from '../pages/user/userService';
import type { User as UserType } from '../pages/user/userService';

interface SearchableUserSelectProps {
    value: number | string | null;
    onChange: (value: number | null) => void;
    disabled?: boolean;
    placeholder?: string;
    className?: string;
}

const SearchableUserSelect: React.FC<SearchableUserSelectProps> = ({
    value,
    onChange,
    disabled = false,
    placeholder = "Select Employee...",
    className = ""
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [users, setUsers] = useState<UserType[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [selectedUserDetails, setSelectedUserDetails] = useState<UserType | null>(null);
    
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

    // Fetch initial user details if not in list
    useEffect(() => {
        const fetchSelectedUser = async () => {
            if (value && (typeof value === 'number' || !isNaN(Number(value)))) {
                try {
                    const user = await getUser(Number(value));
                    setSelectedUserDetails(user);
                } catch (err) {
                    console.error("Failed to fetch selected user details:", err);
                }
            }
        };

        const existing = users.find(u => u.id === Number(value));
        if (existing) {
            setSelectedUserDetails(existing);
        } else if (value) {
            fetchSelectedUser();
        } else {
            setSelectedUserDetails(null);
        }
    }, [value, users]);

    const loadUsers = async (pageNum: number, searchStr: string, reset: boolean) => {
        if (loadingRef.current && !reset) return;
        
        loadingRef.current = true;
        setLoading(true);
        
        try {
            const data = await getUsers(pageNum, searchStr);
            if (reset) {
                setUsers(data.results);
                pageRef.current = 1;
            } else {
                setUsers(prev => {
                    const existingIds = new Set(prev.map(u => u.id));
                    const newUsers = data.results.filter(u => !existingIds.has(u.id));
                    return [...prev, ...newUsers];
                });
                pageRef.current = pageNum;
            }
            setHasMore(!!data.next);
        } catch (error) {
            console.error("Failed to load users:", error);
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    };

    // Reset and load on open or search change
    useEffect(() => {
        if (isOpen) {
            loadUsers(1, debouncedSearch, true);
        }
    }, [isOpen, debouncedSearch]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        // Trigger earlier (50px from bottom) to ensure smooth loading
        if (scrollHeight - scrollTop <= clientHeight + 50 && hasMore && !loadingRef.current) {
            loadUsers(pageRef.current + 1, debouncedSearch, false);
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

    const displayName = selectedUserDetails 
        ? (selectedUserDetails.first_name || selectedUserDetails.last_name ? `${selectedUserDetails.first_name} ${selectedUserDetails.last_name}` : selectedUserDetails.username)
        : (value ? `ID: ${value}` : placeholder);

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`flex items-center justify-between px-4 py-3 bg-background border border-border rounded-2xl cursor-pointer transition-all hover:border-primary/50 group ${isOpen ? 'ring-2 ring-primary/20 border-primary shadow-lg shadow-primary/5' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <div className="flex items-center gap-3 truncate">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${value ? 'bg-primary/10 text-primary' : 'bg-muted/10 text-muted'}`}>
                        {selectedUserDetails?.profile_pic ? (
                            <img src={selectedUserDetails.profile_pic} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <User size={16} />
                        )}
                    </div>
                    <div className="flex flex-col truncate">
                        <span className={`text-sm font-bold truncate ${!value ? 'text-muted' : 'text-foreground'}`}>
                            {displayName}
                        </span>
                        {selectedUserDetails?.designation && (
                            <span className="text-[10px] text-muted font-medium truncate uppercase tracking-wider">{selectedUserDetails.designation}</span>
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
                                placeholder="Search name, email, or designation..."
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
                        {users.length === 0 && !loading && (
                            <div className="py-12 text-center">
                                <div className="w-12 h-12 bg-muted/10 rounded-2xl flex items-center justify-center mx-auto mb-3 text-muted">
                                    <Search size={24} />
                                </div>
                                <p className="text-[11px] font-black text-muted uppercase tracking-widest italic">No employees found</p>
                            </div>
                        )}
                        <div className="space-y-1">
                            {users.map(user => (
                                <div
                                    key={user.id}
                                    onClick={() => {
                                        onChange(user.id);
                                        setIsOpen(false);
                                        setSearch('');
                                    }}
                                    className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all border border-transparent hover:bg-primary/5 hover:border-primary/10 group ${value === user.id ? 'bg-primary/10 border-primary/20' : ''}`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs transition-all ${value === user.id ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/20' : 'bg-muted/10 text-muted group-hover:bg-primary/20 group-hover:text-primary'}`}>
                                        {user.profile_pic ? (
                                            <img src={user.profile_pic} alt="" className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            (user.first_name?.[0] || user.username?.[0] || 'U').toUpperCase()
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-bold truncate ${value === user.id ? 'text-primary' : 'text-foreground'}`}>
                                            {user.first_name || user.last_name ? `${user.first_name} ${user.last_name}` : user.username}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-[10px] text-muted truncate">{user.email}</p>
                                            {user.designation && (
                                                <>
                                                    <span className="w-1 h-1 rounded-full bg-border" />
                                                    <p className="text-[9px] font-black text-primary/60 uppercase truncate">{user.designation}</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    {value === user.id && (
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
                        {!hasMore && users.length > 0 && (
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

export default SearchableUserSelect;
