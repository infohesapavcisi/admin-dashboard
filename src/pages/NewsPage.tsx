import { useState } from 'react';
import { useNews, useNewsSources, useStaleNewsSources } from '../features/news/useNews';
import { NewsDetailModal } from '../features/news/NewsDetailModal';
import { useSortable } from '../lib/useSortable';
import { SortHeader } from '../components/common/SortHeader';

interface NewsRow {
  id: string;
  url: string;
  title: string;
  source?: { name: string };
  source_id?: number;
  published_at: string;
}
type NewsSortKey = 'title' | 'source.name' | 'published_at';

export function NewsPage() {
  const [page, setPage] = useState(1);
  const [sourceId, setSourceId] = useState<number | undefined>();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: news, isLoading } = useNews({ page, sourceId });
  const { data: sources } = useNewsSources();
  const { data: stale } = useStaleNewsSources();

  const list: NewsRow[] = Array.isArray(news) ? news : (news?.items ?? []);
  const { sorted, sort, toggle } = useSortable<NewsRow, NewsSortKey>(list, { key: 'published_at', dir: 'desc' });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Haberler</h1>

      {Array.isArray(stale) && stale.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
          <div className="font-medium mb-1">Sessiz Haber Kaynakları (son 24sa)</div>
          {stale.map((s: { id: number; name: string }) => <div key={s.id}>{s.name}</div>)}
        </div>
      )}

      <div>
        <select
          value={sourceId ?? ''}
          onChange={(e) => setSourceId(e.target.value ? Number(e.target.value) : undefined)}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="">Tüm kaynaklar</option>
          {(sources ?? []).map((s: { id: number; name: string }) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {isLoading ? <div>Yükleniyor...</div> : (
        <table className="w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr>
              <SortHeader<NewsSortKey> field="title" label="Başlık" sort={sort} onToggle={toggle} />
              <SortHeader<NewsSortKey> field="source.name" label="Kaynak" sort={sort} onToggle={toggle} />
              <SortHeader<NewsSortKey> field="published_at" label="Yayın" sort={sort} onToggle={toggle} />
            </tr>
          </thead>
          <tbody>
            {sorted.map((n) => (
              <tr key={n.id} className="border-t hover:bg-slate-50">
                <td className="py-2">
                  <button
                    onClick={() => setSelectedId(n.id)}
                    className="text-left text-blue-600 hover:underline"
                  >
                    {n.title}
                  </button>
                </td>
                <td>{n.source?.name ?? n.source_id}</td>
                <td>{new Date(n.published_at).toLocaleString('tr-TR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="flex gap-2">
        <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="border rounded px-3 py-1 text-sm disabled:opacity-50">Önceki</button>
        <button onClick={() => setPage((p) => p + 1)} className="border rounded px-3 py-1 text-sm">Sonraki</button>
      </div>

      <NewsDetailModal id={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  );
}
