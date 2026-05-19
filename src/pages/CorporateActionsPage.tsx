import { useState } from 'react';
import { useAdjustments, useApplyAdjustment, useRevertAdjustment } from '../features/corporate-actions/useAdjustments';
import { AdjustmentForm } from '../features/corporate-actions/AdjustmentForm';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { useSortable } from '../lib/useSortable';
import { SortHeader } from '../components/common/SortHeader';

type AdjSortKey = 'stock_code' | 'ex_date' | 'bonus_ratio' | 'rights_ratio' | 'dividend_per_share' | 'status';

export function CorporateActionsPage() {
  const [status, setStatus] = useState<string>('');
  const [stockCode, setStockCode] = useState<string>('');
  const [open, setOpen] = useState(false);
  const { data } = useAdjustments({ status: status || undefined, stockCode: stockCode || undefined });
  const apply = useApplyAdjustment();
  const revert = useRevertAdjustment();

  const { sorted, sort, toggle } = useSortable<any, AdjSortKey>(
    (data ?? []) as any[],
    { key: 'ex_date', dir: 'desc' }
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Bedelli / Bedelsiz / Temettü</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Yeni Kayıt</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Yeni Adjustment</DialogTitle>
            <AdjustmentForm onDone={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex gap-2">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border rounded px-2 py-1 text-sm">
          <option value="">Tüm statüler</option>
          {['PENDING', 'PROCESSING', 'COMPLETED', 'REVERTED', 'FAILED'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <Input placeholder="Stock kodu" value={stockCode} onChange={(e) => setStockCode(e.target.value)} className="max-w-xs" />
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-slate-500">
            <SortHeader<AdjSortKey> field="stock_code" label="Stock" sort={sort} onToggle={toggle} />
            <SortHeader<AdjSortKey> field="ex_date" label="Ex date" sort={sort} onToggle={toggle} />
            <SortHeader<AdjSortKey> field="bonus_ratio" label="Bonus" sort={sort} onToggle={toggle} />
            <SortHeader<AdjSortKey> field="rights_ratio" label="Rights" sort={sort} onToggle={toggle} />
            <SortHeader<AdjSortKey> field="dividend_per_share" label="Temettü" sort={sort} onToggle={toggle} />
            <SortHeader<AdjSortKey> field="status" label="Status" sort={sort} onToggle={toggle} />
            <th></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((a: any) => (
            <tr key={a.id} className="border-t">
              <td>{a.stock_code}</td>
              <td>{a.ex_date ? String(a.ex_date).slice(0, 10) : '-'}</td>
              <td>{a.bonus_ratio ?? '-'}</td>
              <td>{a.rights_ratio ?? '-'}</td>
              <td>{a.dividend_per_share ?? '-'}</td>
              <td>
                <Badge variant={a.status === 'COMPLETED' ? 'default' : a.status === 'FAILED' ? 'destructive' : 'secondary'}>{a.status}</Badge>
              </td>
              <td className="space-x-1">
                {a.status === 'PENDING' && <Button size="sm" onClick={() => apply.mutate(a.id)}>Uygula</Button>}
                {a.status === 'COMPLETED' && <Button size="sm" variant="outline" onClick={() => revert.mutate(a.id)}>Geri Al</Button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
