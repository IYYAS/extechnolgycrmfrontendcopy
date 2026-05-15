import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
    label: string;
    value: string;
}

interface CustomSelectProps {
    label?: string;
    value: string;
    options: Option[];
    onChange: (value: string) => void;
    placeholder?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ 
    label, 
    value, 
    options, 
    onChange, 
    placeholder = 'Select option' 
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="space-y-1.5" ref={containerRef}>
            {label && (
                <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">
                    {label}
                </label>
            )}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full flex items-center justify-between px-4 py-2 bg-background border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                        isOpen ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                    }`}
                >
                    <span className={`truncate ${!selectedOption ? 'text-muted' : 'text-foreground font-semibold'}`}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    <ChevronDown 
                        size={16} 
                        className={`text-muted transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
                    />
                </button>

                {isOpen && (
                    <div className="absolute z-50 w-full mt-2 py-2 bg-card border border-border rounded-2xl shadow-2xl shadow-primary/10 animate-in fade-in zoom-in-95 duration-200">
                        <div className="max-h-60 overflow-y-auto custom-scrollbar">
                            {options.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-primary/5 ${
                                        value === option.value 
                                            ? 'text-primary font-bold bg-primary/5' 
                                            : 'text-foreground'
                                    }`}
                                >
                                    <span>{option.label}</span>
                                    {value === option.value && (
                                        <Check size={14} className="text-primary" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomSelect;
