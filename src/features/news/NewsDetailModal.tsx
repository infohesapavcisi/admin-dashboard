import { useEffect, useState } from 'react';
import { useNewsDetail, useUpdateNews } from './useNews';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogTitle } from '../../components/ui/dialog';

export function NewsDetailModal({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { data, isLoading } = useNewsDetail(id);
  const update = useUpdateNews();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ title: '', summary: '', content: '', image_url: '' });

  useEffect(() => {
    if (data) {
      const d = data as { title?: string; summary?: string | null; content?: string | null; image_url?: string | null };
      setForm({
        title: d.title ?? '',
        summary: d.summary ?? '',
        content: d.content ?? '',
        image_url: d.image_url ?? '',
      });
      setEditing(false);
    }
  }, [data]);

  if (!id) return null;
  const d = data as Record<string, unknown> | undefined;

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-auto">
        <DialogTitle>{editing ? 'Haber Düzenle' : 'Haber Detayı'}</DialogTitle>
        {isLoading ? <div>Yükleniyor...</div> : !data ? <div>Bulunamadı</div> : (
          <div className="space-y-3 text-sm">
            <div className="text-xs text-slate-500">
              {d?.published_at ? new Date(d.published_at as string).toLocaleString('tr-TR') : ''}
              {' · '}
              <a href={d?.url as string} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Kaynak</a>
              {d?.source ? ` · ${(d.source as { name?: string }).name ?? ''}` : ''}
            </div>

            {!editing ? (
              <>
                <h2 className="text-lg font-semibold">{form.title}</h2>
                {form.image_url && <img src={form.image_url} alt="" className="max-h-64 rounded" />}
                {form.summary && <p className="text-slate-700">{form.summary}</p>}
                {form.content && (
                  <div className="prose prose-sm max-w-none whitespace-pre-wrap">{form.content}</div>
                )}
                <div className="flex gap-2 pt-3">
                  <Button onClick={() => setEditing(true)}>Düzenle</Button>
                  <Button variant="outline" onClick={onClose}>Kapat</Button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label>Başlık</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div>
                  <Label>Görsel URL</Label>
                  <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
                </div>
                <div>
                  <Label>Özet</Label>
                  <textarea
                    className="w-full border rounded p-2 text-sm"
                    rows={3}
                    value={form.summary}
                    onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  />
                </div>
                <div>
                  <Label>İçerik</Label>
                  <textarea
                    className="w-full border rounded p-2 text-sm font-mono"
                    rows={10}
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                  />
                </div>
                {update.isError && (
                  <p className="text-sm text-red-600">
                    {(update.error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message ?? 'Hata'}
                  </p>
                )}
                <div className="flex gap-2 pt-3">
                  <Button
                    disabled={update.isPending}
                    onClick={() => update.mutate({ id, patch: form }, { onSuccess: () => setEditing(false) })}
                  >
                    {update.isPending ? 'Kaydediliyor...' : 'Kaydet'}
                  </Button>
                  <Button variant="outline" onClick={() => setEditing(false)}>İptal</Button>
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
