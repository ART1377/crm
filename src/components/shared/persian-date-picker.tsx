'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import 'react-day-picker/style.css';

import { DayPicker, faIR } from '@daypicker/persian';
import { Calendar } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { cn } from '@/lib/utils';

interface PersianDatePickerProps {
  value: string; // YYYY-MM-DD (Gregorian)
  onChange: (date: string) => void;
  placeholder?: string;
  className?: string;
}

export function PersianDatePicker({
  value,
  onChange,
  placeholder = 'انتخاب تاریخ',
  className,
}: PersianDatePickerProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selected = value
    ? (() => {
        const [y, m, d] = value.split('-').map(Number);
        return new Date(y, m - 1, d); // month is 0-indexed
      })()
    : undefined;

  const displayValue = value ? new Date(value).toLocaleDateString('fa-IR') : '';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleSelect = useCallback(
    (date: Date | undefined) => {
      if (date) {
        // Use local date components to avoid timezone issues
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        onChange(`${yyyy}-${mm}-${dd}`);
      } else {
        onChange('');
      }
      setOpen(false);
    },
    [onChange]
  );

  return (
    <div ref={wrapperRef} className={cn('relative', className)}>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'h-8 w-full justify-start px-3 text-right text-xs font-normal',
          !value && 'text-muted-foreground'
        )}
      >
        <Calendar className="ml-2 h-4 w-4 shrink-0" />
        {displayValue || placeholder}
      </Button>

      {open && (
        <div className="bg-popover absolute z-50 mt-2 rounded-xl border p-3 shadow-lg">
          <DayPicker
            locale={faIR}
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            dir="rtl"
            captionLayout="dropdown"
            startMonth={new Date(2020, 0)}
            endMonth={new Date(2030, 11)}
            modifiers={{ today: new Date() }}
            modifiersStyles={{
              today: {
                border: '2px solid hsl(var(--primary))',
                borderRadius: 'var(--rdp-day-radius)',
                fontWeight: 'bold',
                backgroundColor: '#ddd',
              },
            }}
            style={
              {
                '--rdp-accent-color': 'hsl(var(--primary))',
                '--rdp-accent-background-color': 'hsl(var(--primary) / 0.9)',
                '--rdp-day-radius': '8px',
              } as React.CSSProperties
            }
          />
        </div>
      )}
    </div>
  );
}
