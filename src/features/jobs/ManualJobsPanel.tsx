import { useState } from 'react';
import { isAxiosError } from 'axios';
import { useManualJobs, useStartManualJob, type ManualJobParams, type ManualJobRow } from './useJobs';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';

/** Cron'u olmayan, elle başlatılan job'lar (backfill'ler). Başlatma 202 döner; sonuç geçmişte görünür. */
export function ManualJobsPanel({ onSelect }: { onSelect: (name: string) => void }) {
  const { data, isLoading } = useManualJobs();
  if (isLoading) return <div>Yükleniyor...</div>;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {(data ?? []).map((job) => (
        <ManualJobCard key={job.jobName} job={job} onSelect={onSelect} />
      ))}
    </div>
  );
}

function initialParams(job: ManualJobRow): ManualJobParams {
  const p: ManualJobParams = {};
  for (const param of job.params) {
    if (param.type === 'date' && param.default) p.since = param.default;
  }
  return p;
}

function ManualJobCard({ job, onSelect }: { job: ManualJobRow; onSelect: (name: string) => void }) {
  const start = useStartManualJob();
  const [params, setParams] = useState<ManualJobParams>(() => initialParams(job));
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const missingRequired = job.params.some((p) => p.required && p.name === 'since' && !params.since);
  const running = job.lastRun?.status === 'RUNNING';

  const submit = () => {
    setConfirming(false);
    setMessage(null);
    start.mutate(
      { name: job.jobName, params },
      {
        onSuccess: () => setMessage({ ok: true, text: 'Başlatıldı. İlerleme job geçmişinde.' }),
        onError: (err) => {
          const apiMessage = isAxiosError(err) ? err.response?.data?.message : null;
          setMessage({ ok: false, text: String(apiMessage ?? (err as Error).message) });
        },
      },
    );
  };

  return (
    <div className="border rounded p-4 space-y-3">
      <div>
        <button className="font-medium text-blue-600 hover:underline" onClick={() => onSelect(job.jobName)}>
          {job.jobName}
        </button>
        <div className="text-xs text-slate-500 mt-1">{job.description}</div>
      </div>

      <div className="text-xs flex items-center gap-2">
        <span className="text-slate-500">Son çalışma:</span>
        {job.lastRun ? (
          <>
            <Badge
              variant={
                job.lastRun.status === 'SUCCESS' ? 'default' : job.lastRun.status === 'FAILED' ? 'destructive' : 'secondary'
              }
            >
              {job.lastRun.status}
            </Badge>
            <span>{new Date(job.lastRun.startedAt).toLocaleString('tr-TR')}</span>
          </>
        ) : (
          <span>hiç çalışmadı</span>
        )}
      </div>
      {job.lastRun?.error && <div className="text-xs text-red-600 break-words">{job.lastRun.error}</div>}

      {job.params.map((p) =>
        p.type === 'date' ? (
          <label key={p.name} className="block text-xs space-y-1">
            <span>
              {p.label}
              {p.required && ' *'}
            </span>
            <Input
              type="date"
              value={params.since ?? ''}
              onChange={(e) => setParams((cur) => ({ ...cur, since: e.target.value || undefined }))}
            />
          </label>
        ) : (
          <label key={p.name} className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={!!params.refill}
              onChange={(e) => setParams((cur) => ({ ...cur, refill: e.target.checked }))}
            />
            {p.label}
          </label>
        ),
      )}

      <div className="flex items-center gap-2">
        {confirming ? (
          <>
            <Button size="sm" onClick={submit} disabled={start.isPending}>
              Onayla
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
              İptal
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setConfirming(true)}
            disabled={missingRequired || running || start.isPending}
          >
            {running ? 'Çalışıyor…' : 'Başlat'}
          </Button>
        )}
      </div>
      {message && <div className={`text-xs ${message.ok ? 'text-green-700' : 'text-red-600'}`}>{message.text}</div>}
    </div>
  );
}
