// src/components/ui/checkbox.tsx

'use client';

import * as React from 'react';

import { CheckIcon } from 'lucide-react';
import { Checkbox as CheckboxPrimitive } from 'radix-ui';

import { cn } from '@/lib/utils';

function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        // ✅ سایز و شکل
        'peer relative flex size-5 shrink-0 items-center justify-center rounded-md border-2',

        // رنگ‌ها
        'border-muted-foreground/40 bg-white',

        // انیمیشن و ترنزیشن
        'transition-all duration-200 ease-out',

        // hover
        'hover:border-primary/60 hover:bg-primary/5',

        // focus
        'focus-visible:ring-primary/30 focus-visible:ring-4 focus-visible:outline-none',

        // حالت انتخاب‌شده
        'data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
        'data-[state=checked]:shadow-primary/25 data-[state=checked]:shadow-md',

        // حالت indeterminate (نیمه‌انتخاب)
        'data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground',

        // invalid
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
        'dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',

        // disabled
        'disabled:cursor-not-allowed disabled:opacity-50',

        // ناحیه کلیک بزرگ‌تر (invisible)
        'after:absolute after:-inset-x-2 after:-inset-y-2',

        // dark mode
        'dark:bg-input/30',

        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-transform duration-200 [&>svg]:size-3.5"
      >
        <CheckIcon strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
