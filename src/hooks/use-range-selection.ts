// src/hooks/use-range-selection.ts

'use client';

import { useCallback, useState } from 'react';

interface SelectableItem {
  id: string;
}

interface RangeSelectionOptions {
  /** اگر true، فقط یک آیتم قابل انتخاب است (مثل انتخاب تک‌گزینه‌ای) */
  single?: boolean;
}

export function useRangeSelection<T extends SelectableItem>(
  items: T[],
  options: RangeSelectionOptions = {}
) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [lastClickedId, setLastClickedId] = useState<string | null>(null);

  const toggleWithRange = useCallback(
    (id: string, event?: React.MouseEvent | React.ChangeEvent) => {
      const isShift = 'shiftKey' in (event ?? {}) && (event as React.MouseEvent).shiftKey;
      const isMeta =
        'metaKey' in (event ?? {}) &&
        ((event as React.MouseEvent).metaKey || (event as React.MouseEvent).ctrlKey);

      // انتخاب تک‌گزینه‌ای
      if (options.single) {
        setSelected(new Set([id]));
        setLastClickedId(id);
        return;
      }

      // Shift+Click: انتخاب بازه
      if (isShift && lastClickedId) {
        const startIdx = items.findIndex((i) => i.id === lastClickedId);
        const endIdx = items.findIndex((i) => i.id === id);
        if (startIdx !== -1 && endIdx !== -1) {
          const [from, to] = startIdx < endIdx ? [startIdx, endIdx] : [endIdx, startIdx];
          const rangeIds = items.slice(from, to + 1).map((i) => i.id);
          setSelected((prev) => {
            // اگر Cmd/Ctrl هم نگه داشته شده → افزودن به انتخاب قبلی
            // وگرنه → جایگزینی انتخاب قبلی
            return isMeta ? new Set([...prev, ...rangeIds]) : new Set(rangeIds);
          });
          setLastClickedId(id);
          return;
        }
      }

      // کلیک عادی → toggle
      setSelected((prev) => {
        const n = new Set(prev);
        n.has(id) ? n.delete(id) : n.add(id);
        return n;
      });
      setLastClickedId(id);
    },
    [items, lastClickedId, options.single]
  );

  const selectAll = useCallback(() => {
    setSelected((prev) =>
      prev.size === items.length ? new Set() : new Set(items.map((i) => i.id))
    );
  }, [items]);

  const clearSelection = useCallback(() => {
    setSelected(new Set());
    setLastClickedId(null);
  }, []);

  const selectOnly = useCallback((ids: string[]) => {
    setSelected(new Set(ids));
    setLastClickedId(ids[ids.length - 1] ?? null);
  }, []);

  return {
    selected,
    setSelected,
    toggleWithRange,
    selectAll,
    clearSelection,
    selectOnly,
  };
}
