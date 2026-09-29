import { useState } from 'react';
import { Card } from '../components/ui/card';
import {
  useBannedUsers,
  useCommentAnomaly,
  useUnbanUser,
  REPORT_REASON_LABELS,
  RISK_FLAG_LABELS,
  useBulkModerateComments,
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
import { BanUserDialog } from '../features/comments/BanUserDialog';

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
    comment: CommentRow | null;
    bulkIds?: string[];
    action: PendingAction;
  } | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [banTarget, setBanTarget] = useState<{ id: string; name: string } | null>(null);
  const [showBans, setShowBans] = useState(false);

  const stats = useCommentStats();
  const queue = useCommentQueue({ status, targetType, flagged, page });
  const moderate = useModerateComment();
  const bulkModerate = useBulkModerateComments();
  const anomaly = useCommentAnomaly();
  const bans = useBannedUsers();
  const unban = useUnbanUser();

  const items = queue.data?.items ?? [];
  const total = queue.data?.total ?? 0;
  const pageSize = queue.data?.pageSize ?? 50;
  const lastPage = Math.max(1, Math.ceil(total / pageSize));

  const changeStatus = (next: CommentStatus) => {
    setStatus(next);
    setPage(1);
    setSelected(new Set());
  };

  const toggleSelected = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allSelected = items.length > 0 && items.every((c) => selected.has(c.id));
  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(items.map((c) => c.id)));
  };

  const selectedIds = items.filter((c) => selected.has(c.id)).map((c) => c.id);

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

      {anomaly.data && anomaly.data.triggered.length > 0 && (
        <div className="border border-red-300 bg-red-50 rounded p-3 text-sm">
          <div className="font-medium text-red-800 mb-1">
            ⚠️ Yorum trafiğinde anormallik
          </div>
          <div className="text-xs text-red-900">
            Son {anomaly.data.window_minutes} dakikada{' '}
            <b>{anomaly.data.comments}</b> yorum (eşik {anomaly.data.comments_limit}),{' '}
            <b>{anomaly.data.new_users}</b> yeni kayıt (eşik {anomaly.data.new_users_limit}),{' '}
            {anomaly.data.rejected_by_screening} otomatik red, {anomaly.data.reports} şikayet.
          </div>
        </div>
      )}

      {anomaly.data && anomaly.data.triggered.length === 0 && (
        <div className="text-xs text-slate-500">
          Son {anomaly.data.window_minutes} dk: {anomaly.data.comments} yorum ·{' '}
          {anomaly.data.new_users} yeni kayıt · {anomaly.data.rejected_by_screening} otomatik red
          {bans.data && bans.data.total > 0 && (
            <>
              {' '}·{' '}
              <button
                onClick={() => setShowBans((v) => !v)}
                className="underline hover:text-slate-700"
              >
                {bans.data.total} yasaklı kullanıcı
              </button>
            </>
          )}
        </div>
      )}

      {showBans && bans.data && (
        <div className="border rounded divide-y text-sm">
          {bans.data.items.map((b) => (
            <div key={b.user_id} className="flex flex-wrap items-center gap-2 px-3 py-2">
              <span className="font-medium">{b.display_name}</span>
              <span className="text-xs text-slate-500">{b.email}</span>
              <span
                className={`text-[11px] rounded px-1.5 py-0.5 ${
                  b.shadow ? 'bg-slate-200 text-slate-700' : 'bg-red-100 text-red-800'
                }`}
              >
                {b.shadow
                  ? 'sessiz yasak'
                  : b.banned_until
                    ? `${new Date(b.banned_until).toLocaleDateString('tr-TR')} tarihine kadar`
                    : 'yasaklı'}
              </span>
              {b.reason && <span className="text-xs text-slate-600">{b.reason}</span>}
              <button
                onClick={() => unban.mutate(b.user_id)}
                disabled={unban.isPending}
                className="ml-auto text-xs border rounded px-2 py-0.5 hover:bg-slate-100 disabled:opacity-50"
              >
                yasağı kaldır
              </button>
            </div>
          ))}
        </div>
      )}

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

      {items.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 border rounded px-3 py-2 bg-slate-50">
          <label className="flex items-center gap-1.5 text-sm">
            <input type="checkbox" checked={allSelected} onChange={toggleAll} />
            Tümünü seç ({items.length})
          </label>

          {selectedIds.length > 0 && (
            <>
              <span className="text-xs text-slate-500">
                {selectedIds.length} seçili
              </span>
              <button
                onClick={() =>
                  bulkModerate.mutate(
                    { ids: selectedIds, action: 'APPROVE' },
                    { onSuccess: () => setSelected(new Set()) },
                  )
                }
                disabled={bulkModerate.isPending}
                className="border rounded px-3 py-1 text-sm bg-green-50 hover:bg-green-100 disabled:opacity-50"
              >
                Seçilenleri onayla
              </button>
              <button
                onClick={() =>
                  setDialog({ comment: null, bulkIds: selectedIds, action: 'REJECT' })
                }
                className="border rounded px-3 py-1 text-sm hover:bg-slate-100"
              >
                Seçilenleri reddet
              </button>
              <button
                onClick={() =>
                  setDialog({ comment: null, bulkIds: selectedIds, action: 'HIDE' })
                }
                className="border rounded px-3 py-1 text-sm hover:bg-slate-100"
              >
                Seçilenleri gizle
              </button>
              <button
                onClick={() => setSelected(new Set())}
                className="text-xs text-slate-500 hover:underline"
              >
                seçimi temizle
              </button>
            </>
          )}
        </div>
      )}

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
                <input
                  type="checkbox"
                  checked={selected.has(c.id)}
                  onChange={() => toggleSelected(c.id)}
                  className="mr-1"
                />
                <span className="font-medium text-slate-700">
                  {c.author.display_name}
                </span>
                <span>·</span>
                <span>
                  {TARGET_LABELS[c.target_type]}:{' '}
                  {c.target_url ? (
                    <a
                      href={c.target_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {c.target_label ?? c.target_key}
                    </a>
                  ) : (
                    <span title={c.target_key}>{c.target_label ?? c.target_key}</span>
                  )}
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

              {c.reports.length > 0 && (
                <div className="mt-2 border-l-2 border-red-200 pl-2 space-y-0.5">
                  {c.reports.map((r, i) => (
                    <div key={i} className="text-[11px] text-slate-600">
                      <span className="text-red-700">
                        {REPORT_REASON_LABELS[r.reason] ?? r.reason}
                      </span>{' '}
                      — {r.reporter}
                      {r.note ? `: ${r.note}` : ''}
                    </div>
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
                {c.author.id && (
                  <button
                    onClick={() =>
                      setBanTarget({ id: c.author.id as string, name: c.author.display_name })
                    }
                    className="border rounded px-3 py-1 text-sm text-red-700 hover:bg-red-50 ml-auto"
                  >
                    Kullanıcıyı yasakla
                  </button>
                )}
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

      <BanUserDialog user={banTarget} onClose={() => setBanTarget(null)} />

      <ModerationDialog
        comment={dialog?.comment ?? null}
        bulkIds={dialog?.bulkIds}
        action={dialog?.action ?? null}
        onClose={() => setDialog(null)}
        onDone={() => setSelected(new Set())}
      />
    </div>
  );
}
