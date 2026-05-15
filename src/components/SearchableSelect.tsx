import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

interface Option {
    id: string | number;
    label: string;
    subLabel?: string;
}

interface SearchableSelectProps {
    value: string | number | null;
    onChange: (id: number | null) => void;
    options: Option[];
    placeholder?: string;
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
    value,
    onChange,
    options,
    placeholder = "Search...",
    label,
    error,
    icon
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.id === value);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredOptions = options.filter(opt => {
        const label = opt.label?.toString().toLowerCase() || '';
        const subLabel = opt.subLabel?.toString().toLowerCase() || '';
        const id = opt.id?.toString().toLowerCase() || '';
        const searchLower = search.toLowerCase();
        
        return label.includes(searchLower) || subLabel.includes(searchLower) || id.includes(searchLower);
    });

    return (
        <div className="relative w-full" ref={wrapperRef}>
            {label && <label className="text-[11px] font-bold text-muted uppercase tracking-widest mb-1.5 block px-1">{label}</label>}
            
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className={`relative group cursor-pointer w-full pl-12 pr-10 py-4 bg-background border rounded-2xl transition-all font-bold flex items-center min-h-[58px] ${
                    isOpen ? 'ring-2 ring-primary/50 border-primary/50' : 'border-border hover:border-primary/30'
                } ${error ? 'border-rose-500 ring-rose-500/30' : ''}`}
            >
                {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-hover:text-primary transition-colors">{icon}</div>}
                
                <span className={`truncate ${!selectedOption ? 'text-muted font-medium italic' : 'text-foreground'}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>

                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {value && (
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
                <div className="absolute z-[100] w-full mt-2 bg-card/95 backdrop-blur-xl border border-border shadow-2xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-2 border-b border-border bg-muted/5">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                            <input 
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                autoFocus
                                placeholder="Filter items..."
                                className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary/50"
                            />
                        </div>
                    </div>
                    
                    <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt) => (
                                <div
                                    key={opt.id}
                                    className={`px-4 py-3 cursor-pointer rounded-xl transition-all border border-transparent flex flex-col gap-0.5 ${
                                        value === opt.id 
                                        ? 'bg-primary/10 border-primary/20 text-primary' 
                                        : 'hover:bg-muted/50 text-foreground hover:border-border'
                                    }`}
                                    onClick={() => {
                                        onChange(opt.id as number);
                                        setIsOpen(false);
                                        setSearch('');
                                    }}
                                >
                                    <p className="text-sm font-black tracking-tight uppercase leading-none">{opt.label}</p>
                                    {opt.subLabel && <p className="text-[10px] font-bold text-muted uppercase tracking-widest">{opt.subLabel}</p>}
                                </div>
                            ))
                        ) : (
                            <div className="py-8 text-center">
                                <p className="text-[10px] font-black text-muted uppercase tracking-widest">No matches found</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {error && <p className="text-rose-500 text-[10px] font-bold mt-1.5 px-1 uppercase tracking-wider">{error}</p>}
        </div>
    );
};

export default SearchableSelect;
