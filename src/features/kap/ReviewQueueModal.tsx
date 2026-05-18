import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useCreateFromKap } from './useKap';

export function ReviewQueueModal({ item, onClose }: { item: any | null; onClose: () => void }) {
  const create = useCreateFromKap();
  const [exDate, setExDate] = useState<string>(item?.exDate ? String(item.exDate).slice(0, 10) : '');
  if (!item) return null;
  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogTitle>KAP → StockPriceAdjustment</DialogTitle>
        <div className="space-y-3 text-sm">
          <div><b>Tip:</b> {item.actionType}{item.subType ? ` / ${item.subType}` : ''}</div>
          <div><b>Stock:</b> {item.stockCode ?? item.kapHistory?.stockCode ?? '-'}</div>
          <div><b>Başlık:</b> {item.kapHistory?.title ?? '-'}</div>
          <div className="space-y-1">
            <Label>Ex date</Label>
            <Input value={exDate} onChange={(e) => setExDate(e.target.value)} placeholder="YYYY-MM-DD" />
          </div>
          <pre className="text-xs bg-slate-50 p-2 rounded max-h-40 overflow-auto">{JSON.stringify(item, null, 2)}</pre>
        </div>
        <div className="flex gap-2 mt-4">
          <Button onClick={() => create.mutate({ id: item.id, body: { exDate } }, { onSuccess: onClose })}>
            Adjustment Oluştur
          </Button>
          <Button variant="outline" onClick={onClose}>Kapat</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
