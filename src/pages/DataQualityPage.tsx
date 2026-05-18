import { useStaleStocks, useStaleNews, useMissingInflation } from '../features/data-quality/useDataQuality';
import { Card } from '../components/ui/card';

export function DataQualityPage() {
  const stocks = useStaleStocks();
  const news = useStaleNews();
  const infl = useMissingInflation();

  const stocksList = (stocks.data ?? []) as any[];
  const newsList = (news.data ?? []) as any[];
  const inflList = (infl.data ?? []) as any[];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Veri Kalitesi</h1>
      <Card className="p-4">
        <div className="text-sm font-medium mb-2">3+ gündür fiyat gelmeyen stoklar ({stocksList.length})</div>
        <div className="text-xs max-h-64 overflow-auto">
          {stocksList.map((s: any) => <div key={s.code}>{s.code} — son: {s.last_date ?? 'hiç'}</div>)}
        </div>
      </Card>
      <Card className="p-4">
        <div className="text-sm font-medium mb-2">24sa+ haber gelmeyen kaynaklar ({newsList.length})</div>
        <div className="text-xs">
          {newsList.map((s: any) => <div key={s.id}>{s.name} — son: {s.last_news ?? 'hiç'}</div>)}
        </div>
      </Card>
      <Card className="p-4">
        <div className="text-sm font-medium mb-2">Eksik enflasyon ayları ({inflList.length})</div>
        <div className="text-xs max-h-64 overflow-auto">
          {inflList.map((m: any, i: number) => <div key={i}>{m.country} — {m.month}</div>)}
        </div>
      </Card>
    </div>
  );
}
