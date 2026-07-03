'use client';

import { useEffect, useRef, useState } from 'react';

import { Check } from 'lucide-react';

import { Input } from '@/components/ui/input';

import { cn } from '@/lib/utils';

interface ComboboxInputProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  className?: string;
  icon?: React.ReactNode;
  dir?: 'rtl' | 'ltr';
}

export function ComboboxInput({
  value,
  onChange,
  options,
  placeholder,
  className,
  icon,
  dir,
}: ComboboxInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = options.filter((opt) => opt.toLowerCase().includes(value.toLowerCase()));

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown') setIsOpen(true);
      return;
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          onChange(filtered[highlightedIndex]);
          setIsOpen(false);
          setHighlightedIndex(-1);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        {icon && (
          <div className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2">
            {icon}
          </div>
        )}
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(icon && 'pr-10', className)}
          dir={dir}
        />
      </div>
      {isOpen && (value || filtered.length > 0) && (
        <div className="bg-popover absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border shadow-lg">
          {value && !filtered.includes(value) && (
            <button
              type="button"
              className="hover:bg-muted text-muted-foreground flex w-full items-center gap-2 px-3 py-2 text-start text-sm transition-colors"
              onClick={() => {
                onChange(value);
                setIsOpen(false);
              }}
            >
              <span className="text-xs">افزودن</span>
              <span className="text-foreground font-medium">{value}</span>
            </button>
          )}
          {filtered.map((opt, i) => (
            <button
              key={opt}
              type="button"
              className={cn(
                'hover:bg-muted flex w-full items-center justify-between px-3 py-2 text-start text-sm transition-colors',
                i === highlightedIndex && 'bg-muted',
                value === opt && 'text-primary font-medium'
              )}
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
                setHighlightedIndex(-1);
              }}
              onMouseEnter={() => setHighlightedIndex(i)}
            >
              {opt}
              {value === opt && <Check className="h-3.5 w-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
