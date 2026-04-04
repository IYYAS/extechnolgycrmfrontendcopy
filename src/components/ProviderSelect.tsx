import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface ProviderSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
  className?: string;
}

const ProviderSelect: React.FC<ProviderSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = "Select or type...",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const exactMatch = options.find(opt => opt.toLowerCase() === (value || '').toLowerCase());
  
  const filteredOptions = exactMatch || value === ''
    ? options
    : options.filter(opt => opt.toLowerCase().includes((value || '').toLowerCase()));

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={(e) => {
          setIsOpen(true);
          e.target.select();
        }}
        placeholder={placeholder}
        className={`${className} pr-10`}
      />
      <div 
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted cursor-pointer p-1 transition-colors hover:text-foreground"
        onClick={() => setIsOpen(!isOpen)}
      >
        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-card border border-border shadow-2xl rounded-2xl max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200 custom-scrollbar">
          <div className="p-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt}
                  className="px-4 py-2 bg-transparent hover:bg-primary/10 cursor-pointer text-sm text-foreground font-black tracking-tight rounded-xl transition-colors border border-transparent hover:border-primary/20"
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                >
                  {opt}
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-[11px] font-bold text-muted uppercase tracking-widest text-center">
                Press Enter to use custom value.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderSelect;
