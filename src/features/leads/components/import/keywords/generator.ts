import { keywordAliases } from './aliases';

export interface KeywordGeneratorOptions {
  keyword: string;
  city?: string;
}

export function generateSearchKeywords({ keyword, city }: KeywordGeneratorOptions): string[] {
  const set = new Set<string>();

  // Clean keyword
  const clean = keyword.replace(/\u200C/g, ' ').trim();
  set.add(clean);

  // Try with original (might have half-space)
  const aliases = keywordAliases[keyword] ?? keywordAliases[clean] ?? [];

  for (const item of aliases) {
    set.add(item);
    if (city) set.add(`${item} ${city}`);
  }

  if (city) set.add(`${clean} ${city}`);

  return [...set];
}
