// src/features/leads/utils/filter-utils.ts

export interface CountableOption {
  value: string;
  label: string;
}

export interface OptionWithCount extends CountableOption {
  count: number;
}

export function withCount(
  options: CountableOption[],
  counts: Record<string, number>
): OptionWithCount[] {
  return options
    .map((opt) => {
      const count = counts[opt.value] ?? 0;
      return {
        ...opt,
        count,
        label: count > 0 ? `${opt.label} (${count})` : opt.label,
      };
    })
    .sort((a, b) => b.count - a.count);
}


export function mapListOptions(options: { value: string }[]): CountableOption[] {
  return options.map((opt) => ({ value: opt.value, label: opt.value }));
}
