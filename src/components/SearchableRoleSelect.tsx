import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Shield, Loader2, X } from 'lucide-react';
import { api } from '../api/api';

interface Role {
    id: number;
    name: string;
}

interface SearchableRoleSelectProps {
    value: number | null;
    onChange: (value: number | null) => void;
    disabled?: boolean;
    placeholder?: string;
    className?: string;
}

const SearchableRoleSelect: React.FC<SearchableRoleSelectProps> = ({
    value,
    onChange,
    disabled = false,
    placeholder = "Select Role...",
    className = ""
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedRoleDetails, setSelectedRoleDetails] = useState<Role | null>(null);
    
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchRoles = async () => {
        try {
            setLoading(true);
            const response = await api.get('/roles/');
            // Handle both {results: []} and directly []
            const data = response.data.results || response.data;
            setRoles(data);
            
            if (value) {
                const selected = data.find((r: Role) => r.id === value);
                if (selected) setSelectedRoleDetails(selected);
            }
        } catch (error) {
            console.error("Failed to fetch roles:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && roles.length === 0) {
            fetchRoles();
        }
    }, [isOpen]);

    useEffect(() => {
        if (value && roles.length > 0) {
            const selected = roles.find(r => r.id === value);
            if (selected) setSelectedRoleDetails(selected);
        } else if (!value) {
            setSelectedRoleDetails(null);
        }
    }, [value, roles]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredRoles = roles.filter(role => 
        role.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`flex items-center justify-between px-4 py-3 bg-background border border-border rounded-2xl cursor-pointer transition-all hover:border-primary/50 group ${isOpen ? 'ring-2 ring-primary/20 border-primary shadow-lg shadow-primary/5' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <div className="flex items-center gap-3 truncate">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${value ? 'bg-primary/10 text-primary' : 'bg-muted/10 text-muted'}`}>
                        <Shield size={16} />
                    </div>
                    <div className="flex flex-col truncate">
                        <span className={`text-sm font-bold truncate ${!value ? 'text-muted' : 'text-foreground'}`}>
                            {selectedRoleDetails ? selectedRoleDetails.name : placeholder}
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
                                placeholder="Search role name..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="max-h-60 overflow-y-auto p-2 custom-scrollbar">
                        {loading && (
                            <div className="py-6 flex flex-col items-center justify-center gap-2 text-primary">
                                <Loader2 className="animate-spin" size={20} />
                                <span className="text-[9px] font-black uppercase tracking-widest animate-pulse">Loading Roles...</span>
                            </div>
                        )}
                        {!loading && filteredRoles.length === 0 && (
                            <div className="py-12 text-center">
                                <p className="text-[11px] font-black text-muted uppercase tracking-widest italic">No roles found</p>
                            </div>
                        )}
                        <div className="space-y-1">
                            {filteredRoles.map(role => (
                                <div
                                    key={role.id}
                                    onClick={() => {
                                        onChange(role.id);
                                        setIsOpen(false);
                                        setSearch('');
                                    }}
                                    className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all border border-transparent hover:bg-primary/5 hover:border-primary/10 group ${value === role.id ? 'bg-primary/10 border-primary/20' : ''}`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${value === role.id ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/20' : 'bg-muted/10 text-muted group-hover:bg-primary/20 group-hover:text-primary'}`}>
                                        <Shield size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-bold truncate ${value === role.id ? 'text-primary' : 'text-foreground'}`}>
                                            {role.name}
                                        </p>
                                    </div>
                                    {value === role.id && (
                                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchableRoleSelect;
