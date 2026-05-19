import { useState } from 'react';
import { useKapList, useKapUnmatched } from '../features/kap/useKap';
import { ReviewQueueModal } from '../features/kap/ReviewQueueModal';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { useSortable } from '../lib/useSortable';
import { SortHeader } from '../components/common/SortHeader';

type UnmatchedSortKey = 'actionType' | 'stockCode' | 'exDate';
type KapAllSortKey = 'publishDate' | 'stockCodes' | 'kapTitle' | 'subject';

export function KapPage() {
  const { data: all } = useKapList();
  const { data: unmatched } = useKapUnmatched();
  const [reviewing, setReviewing] = useState<any | null>(null);

  const { sorted: sortedUnmatched, sort: sortU, toggle: toggleU } = useSortable<any, UnmatchedSortKey>(
    (unmatched ?? []) as any[],
    { key: 'exDate', dir: 'desc' }
  );
  const { sorted: sortedAll, sort: sortA, toggle: toggleA } = useSortable<any, KapAllSortKey>(
    (all ?? []) as any[],
    { key: 'publishDate', dir: 'desc' }
  );

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
            <thead>
              <tr className="text-left">
                <SortHeader<UnmatchedSortKey> field="actionType" label="Tip" sort={sortU} onToggle={toggleU} />
                <SortHeader<UnmatchedSortKey> field="stockCode" label="Stock" sort={sortU} onToggle={toggleU} />
                <SortHeader<UnmatchedSortKey> field="exDate" label="Tarih" sort={sortU} onToggle={toggleU} />
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sortedUnmatched.map((u: any) => (
                <tr key={u.id} className="border-t">
                  <td><Badge>{u.actionType}{u.subType ? `/${u.subType}` : ''}</Badge></td>
                  <td>{u.stockCode ?? u.kapHistory?.stockCodes ?? '-'}</td>
                  <td>{u.exDate ? String(u.exDate).slice(0, 10) : '-'}</td>
                  <td><Button size="sm" onClick={() => setReviewing(u)}>İncele</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </TabsContent>
        <TabsContent value="all">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <SortHeader<KapAllSortKey> field="publishDate" label="Tarih" sort={sortA} onToggle={toggleA} />
                <SortHeader<KapAllSortKey> field="stockCodes" label="Stock" sort={sortA} onToggle={toggleA} />
                <SortHeader<KapAllSortKey> field="kapTitle" label="Başlık" sort={sortA} onToggle={toggleA} />
                <SortHeader<KapAllSortKey> field="subject" label="Konu" sort={sortA} onToggle={toggleA} />
              </tr>
            </thead>
            <tbody>
              {sortedAll.map((k: any) => (
                <tr key={k.id} className="border-t">
                  <td>{k.publishDate ? String(k.publishDate).slice(0, 10) : '-'}</td>
                  <td>{k.stockCodes ?? '-'}</td>
                  <td>{k.kapTitle}</td>
                  <td className="text-xs text-slate-500">{k.subject}</td>
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
