import { useState } from 'react';
import { Card } from '../components/ui/card';
import {
  RISK_FLAG_LABELS,
  useCommentQueue,
  useCommentStats,
  useModerateComment,
  type CommentRow,
  type CommentStatus,
  type CommentTargetType,
} from '../features/comments/useComments';
import {
  ModerationDialog,
  type PendingAction,
} from '../features/comments/ModerationDialog';

const STATUS_TABS: { key: CommentStatus; label: string }[] = [
  { key: 'PENDING', label: 'Onay bekleyen' },
  { key: 'APPROVED', label: 'Yayında' },
  { key: 'HIDDEN', label: 'Gizlenen' },
  { key: 'REJECTED', label: 'Reddedilen' },
];

const TARGET_LABELS: Record<CommentTargetType, string> = {
  STOCK: 'Hisse',
  ASSET: 'Varlık',
  NEWS: 'Haber',
};

function riskClass(score: number): string {
  if (score >= 60) return 'bg-red-100 text-red-800';
  if (score >= 20) return 'bg-amber-100 text-amber-800';
  return 'bg-slate-100 text-slate-600';
}

export function CommentsPage() {
  const [status, setStatus] = useState<CommentStatus>('PENDING');
  const [targetType, setTargetType] = useState<CommentTargetType | undefined>();
  const [flagged, setFlagged] = useState(false);
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState<{
    comment: CommentRow;
    action: PendingAction;
  } | null>(null);

  const stats = useCommentStats();
  const queue = useCommentQueue({ status, targetType, flagged, page });
  const moderate = useModerateComment();

  const items = queue.data?.items ?? [];
  const total = queue.data?.total ?? 0;
  const pageSize = queue.data?.pageSize ?? 50;
  const lastPage = Math.max(1, Math.ceil(total / pageSize));

  const changeStatus = (next: CommentStatus) => {
    setStatus(next);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">Yorumlar</h1>
        {stats.data && (
          <div className="text-xs text-slate-500">
            Ön moderasyon:{' '}
            <span
              className={
                stats.data.premoderation ? 'text-green-700' : 'text-amber-700'
              }
            >
              {stats.data.premoderation ? 'açık' : 'kapalı'}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Onay bekleyen', value: stats.data?.pending },
          { label: 'Yayında', value: stats.data?.approved },
          { label: 'Reddedilen', value: stats.data?.rejected },
          { label: 'Gizlenen', value: stats.data?.hidden },
          { label: 'Şikayetli', value: stats.data?.with_reports },
        ].map((card) => (
          <Card key={card.label} className="p-3">
            <div className="text-xs text-slate-500">{card.label}</div>
            <div className="text-xl font-semibold">{card.value ?? '—'}</div>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => changeStatus(tab.key)}
            className={`px-3 py-1 rounded text-sm border ${
              status === tab.key
                ? 'bg-slate-200 font-medium'
                : 'hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}

        <select
          value={targetType ?? ''}
          onChange={(e) => {
            setTargetType((e.target.value || undefined) as CommentTargetType | undefined);
            setPage(1);
          }}
          className="border rounded px-2 py-1 text-sm ml-2"
        >
          <option value="">Tüm hedefler</option>
          <option value="STOCK">Hisse</option>
          <option value="ASSET">Varlık (altın/gümüş)</option>
          <option value="NEWS">Haber</option>
        </select>

        <label className="flex items-center gap-1.5 text-sm ml-2">
          <input
            type="checkbox"
            checked={flagged}
            onChange={(e) => {
              setFlagged(e.target.checked);
              setPage(1);
            }}
          />
          Yalnız riskli işaretliler
        </label>
      </div>

      {queue.isLoading ? (
        <div>Yükleniyor...</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-slate-500 border rounded p-6 text-center">
          Bu filtrede yorum yok.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((c) => (
            <Card key={c.id} className="p-4">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-2">
                <span className="font-medium text-slate-700">
                  {c.author.display_name}
                </span>
                <span>·</span>
                <span>
                  {TARGET_LABELS[c.target_type]}: {c.target_key}
                </span>
                <span>·</span>
                <span>{new Date(c.created_at).toLocaleString('tr-TR')}</span>
                {c.parent_id && (
                  <span className="bg-slate-100 rounded px-1.5 py-0.5">
                    yanıt
                  </span>
                )}
                <span className={`rounded px-1.5 py-0.5 ${riskClass(c.risk_score)}`}>
                  risk {c.risk_score}
                </span>
                {c.report_count > 0 && (
                  <span className="bg-red-100 text-red-800 rounded px-1.5 py-0.5">
                    {c.report_count} şikayet
                  </span>
                )}
                <span>
                  👍 {c.like_count} · 👎 {c.dislike_count}
                </span>
              </div>

              <div className="text-sm whitespace-pre-wrap">{c.body}</div>

              {c.risk_flags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {c.risk_flags.map((flag) => (
                    <span
                      key={flag}
                      className="text-[11px] bg-amber-100 text-amber-800 rounded px-1.5 py-0.5"
                    >
                      {RISK_FLAG_LABELS[flag] ?? flag}
                    </span>
                  ))}
                </div>
              )}

              {c.moderation_reason && (
                <div className="mt-2 text-xs text-slate-500">
                  Moderasyon notu: {c.moderation_reason}
                </div>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                {c.status !== 'APPROVED' && (
                  <button
                    onClick={() =>
                      moderate.mutate({ id: c.id, action: 'APPROVE' })
                    }
                    disabled={moderate.isPending}
                    className="border rounded px-3 py-1 text-sm bg-green-50 hover:bg-green-100 disabled:opacity-50"
                  >
                    Onayla
                  </button>
                )}
                {c.status !== 'REJECTED' && (
                  <button
                    onClick={() => setDialog({ comment: c, action: 'REJECT' })}
                    className="border rounded px-3 py-1 text-sm hover:bg-slate-100"
                  >
                    Reddet
                  </button>
                )}
                {c.status === 'APPROVED' && (
                  <button
                    onClick={() => setDialog({ comment: c, action: 'HIDE' })}
                    className="border rounded px-3 py-1 text-sm hover:bg-slate-100"
                  >
                    Gizle
                  </button>
                )}
                <button
                  onClick={() => setDialog({ comment: c, action: 'DELETE' })}
                  className="border rounded px-3 py-1 text-sm text-red-700 hover:bg-red-50"
                >
                  Kaldır
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="border rounded px-3 py-1 text-sm disabled:opacity-50"
        >
          Önceki
        </button>
        <span className="text-xs text-slate-500">
          {page} / {lastPage} · toplam {total}
        </span>
        <button
          disabled={page >= lastPage}
          onClick={() => setPage((p) => p + 1)}
          className="border rounded px-3 py-1 text-sm disabled:opacity-50"
        >
          Sonraki
        </button>
      </div>

      <ModerationDialog
        comment={dialog?.comment ?? null}
        action={dialog?.action ?? null}
        onClose={() => setDialog(null)}
      />
    </div>
  );
}
