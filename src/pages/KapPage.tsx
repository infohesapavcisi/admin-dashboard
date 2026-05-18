import { useState } from 'react';
import { useKapList, useKapUnmatched } from '../features/kap/useKap';
import { ReviewQueueModal } from '../features/kap/ReviewQueueModal';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

export function KapPage() {
  const { data: all } = useKapList();
  const { data: unmatched } = useKapUnmatched();
  const [reviewing, setReviewing] = useState<any | null>(null);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">KAP</h1>
      <Tabs defaultValue="review">
        <TabsList>
          <TabsTrigger value="review">Review Queue ({(unmatched as any[] | undefined)?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="all">Tümü</TabsTrigger>
        </TabsList>
        <TabsContent value="review">
          <table className="w-full text-sm">
            <thead><tr className="text-left"><th>Tip</th><th>Stock</th><th>Tarih</th><th></th></tr></thead>
            <tbody>
              {((unmatched ?? []) as any[]).map((u) => (
                <tr key={u.id} className="border-t">
                  <td><Badge>{u.actionType}{u.subType ? `/${u.subType}` : ''}</Badge></td>
                  <td>{u.stockCode ?? u.kapHistory?.stockCode ?? '-'}</td>
                  <td>{u.exDate ? String(u.exDate).slice(0, 10) : '-'}</td>
                  <td><Button size="sm" onClick={() => setReviewing(u)}>İncele</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </TabsContent>
        <TabsContent value="all">
          <table className="w-full text-sm">
            <thead><tr className="text-left"><th>Tarih</th><th>Stock</th><th>Başlık</th></tr></thead>
            <tbody>
              {((all ?? []) as any[]).map((k) => (
                <tr key={k.id} className="border-t">
                  <td>{k.publishedAt ? String(k.publishedAt).slice(0, 10) : '-'}</td>
                  <td>{k.stockCode}</td>
                  <td>{k.title}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TabsContent>
      </Tabs>
      <ReviewQueueModal item={reviewing} onClose={() => setReviewing(null)} />
    </div>
  );
}
