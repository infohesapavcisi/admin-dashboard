import type { SortState } from '../../lib/useSortable';

interface Props<K extends string> {
  field: K;
  label: string;
  sort: SortState<K>;
  onToggle: (key: K) => void;
  className?: string;
}

export function SortHeader<K extends string>({ field, label, sort, onToggle, className }: Props<K>) {
  const active = sort.key === field;
  const arrow = active ? (sort.dir === 'asc' ? '↑' : '↓') : '↕';
  return (
    <th className={className}>
      <button
        type="button"
        onClick={() => onToggle(field)}
        className={`inline-flex items-center gap-1 font-medium hover:text-slate-900 ${active ? 'text-slate-900' : 'text-slate-500'}`}
      >
        {label}
        <span className="text-xs opacity-60">{arrow}</span>
      </button>
    </th>
  );
}
