'use client';

import React, { useState, useRef, useEffect } from 'react';
import { INDUSTRIES, IndustryOption } from '@/lib/constants/industries';

interface Props {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  error?: string;
  theme?: 'dark' | 'light';
  required?: boolean;
}

export default function SearchableSelect({
  value,
  onChange,
  placeholder = 'Sélectionnez un secteur d\'activité...',
  error,
  theme = 'light',
  required = false,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = INDUSTRIES.find(
    (opt) => opt.label === value || opt.labelFr === value || opt.id === value
  );

  const filteredOptions = INDUSTRIES.filter((opt) => {
    const term = searchTerm.toLowerCase().trim();
    return (
      opt.label.toLowerCase().includes(term) ||
      opt.labelFr.toLowerCase().includes(term)
    );
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (option: IndustryOption) => {
    onChange(option.label);
    setIsOpen(false);
    setSearchTerm('');
  };

  const isDark = theme === 'dark';

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Trigger Button */}
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[14px] font-medium cursor-pointer transition-all duration-200 select-none ${
          isDark
            ? `bg-white/[0.06] text-white border ${
                error ? 'border-red-400' : isOpen ? 'border-accent shadow-[0_0_0_3px_rgba(74,144,217,0.2)]' : 'border-white/10 hover:border-white/20'
              }`
            : `bg-slate-50 text-slate-800 border ${
                error ? 'border-red-400' : isOpen ? 'border-[#4a90d9] bg-white shadow-[0_0_0_3px_rgba(74,144,217,0.12)]' : 'border-slate-200 hover:border-slate-300'
              }`
        }`}
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          {selectedOption ? (
            <>
              <span className="text-base flex-shrink-0">{selectedOption.icon}</span>
              <span className="truncate font-medium">
                {selectedOption.labelFr} ({selectedOption.label})
              </span>
            </>
          ) : (
            <span className={isDark ? 'text-white/40' : 'text-slate-400'}>
              {placeholder}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
          {selectedOption && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className={`p-1 rounded-full transition-colors ${
                isDark ? 'hover:bg-white/10 text-white/40 hover:text-white' : 'hover:bg-slate-200 text-slate-400 hover:text-slate-700'
              }`}
            >
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${
              isDark ? 'text-white/40' : 'text-slate-400'
            }`}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl border ${
            isDark
              ? 'bg-[#0f172a]/95 border-white/15 shadow-black/60'
              : 'bg-white/95 border-slate-200 shadow-slate-900/10'
          }`}
          style={{ animation: 'slideUp 0.15s ease-out both' }}
        >
          {/* Search Box */}
          <div
            className={`p-2.5 border-b ${
              isDark ? 'border-white/10 bg-white/[0.02]' : 'border-slate-100 bg-slate-50/50'
            }`}
          >
            <div className="relative">
              <svg
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                  isDark ? 'text-white/40' : 'text-slate-400'
                }`}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher un secteur..."
                className={`w-full pl-9 pr-3 py-2 text-xs font-medium rounded-xl outline-none transition-all ${
                  isDark
                    ? 'bg-white/5 text-white placeholder-white/40 border border-white/10 focus:border-accent'
                    : 'bg-white text-slate-800 placeholder-slate-400 border border-slate-200 focus:border-[#4a90d9]'
                }`}
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto p-1.5 scrollbar-thin">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected =
                  value === opt.label || value === opt.labelFr || value === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => handleSelect(opt)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                      isSelected
                        ? isDark
                          ? 'bg-accent/20 text-accent font-semibold'
                          : 'bg-blue-50 text-[#2563eb] font-semibold'
                        : isDark
                        ? 'text-white/80 hover:bg-white/10 hover:text-white'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <span className="text-sm flex-shrink-0">{opt.icon}</span>
                      <span className="truncate">
                        {opt.labelFr}{' '}
                        <span className={isDark ? 'text-white/40 text-[10px]' : 'text-slate-400 text-[10px]'}>
                          ({opt.label})
                        </span>
                      </span>
                    </div>

                    {isSelected && (
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                );
              })
            ) : (
              <div className={`p-4 text-center text-xs ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                Aucun secteur trouvé pour "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
