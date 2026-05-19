import { useMemo, useState } from 'react';

export type SortDir = 'asc' | 'desc';

export interface SortState<K extends string> {
  key: K | null;
  dir: SortDir;
}

function getPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, p) => {
    if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[p];
    return undefined;
  }, obj);
}

function compare(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  // ISO date strings + plain strings compare lexicographically (works for dates)
  return String(a).localeCompare(String(b), 'tr', { numeric: true });
}

export function useSortable<T, K extends string>(
  data: T[] | undefined,
  initial: SortState<K> = { key: null, dir: 'desc' },
) {
  const [sort, setSort] = useState<SortState<K>>(initial);

  const sorted = useMemo(() => {
    const arr = data ?? [];
    if (!sort.key) return arr;
    const copy = [...arr];
    copy.sort((a, b) => {
      const av = getPath(a, sort.key as string);
      const bv = getPath(b, sort.key as string);
      const cmp = compare(av, bv);
      return sort.dir === 'asc' ? cmp : -cmp;
    });
    return copy;
  }, [data, sort]);

  function toggle(key: K) {
    setSort((s) => {
      if (s.key !== key) return { key, dir: 'asc' };
      if (s.dir === 'asc') return { key, dir: 'desc' };
      return { key: null, dir: 'desc' };
    });
  }

  return { sorted, sort, toggle };
}
