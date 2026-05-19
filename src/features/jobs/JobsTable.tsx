import { useState } from 'react';
import { useJobsSchedule, useRunJob, type JobScheduleRow } from './useJobs';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useSortable } from '../../lib/useSortable';
import { SortHeader } from '../../components/common/SortHeader';

type JobSortKey =
  | 'jobName' | 'cronExpression' | 'lastRun.status' | 'lastRun.startedAt' | 'lastRun.duration' | 'nextRun';

export function JobsTable({ onSelect }: { onSelect: (name: string) => void }) {
  const { data, isLoading } = useJobsSchedule();
  const run = useRunJob();
  const [confirming, setConfirming] = useState<string | null>(null);
  const { sorted, sort, toggle } = useSortable<JobScheduleRow, JobSortKey>(data, { key: 'jobName', dir: 'asc' });

  if (isLoading) return <div>Yükleniyor...</div>;

  return (
    <table className="w-full text-sm">
      <thead className="text-left text-slate-500">
        <tr>
          <SortHeader<JobSortKey> field="jobName" label="Job" sort={sort} onToggle={toggle} className="py-2" />
          <SortHeader<JobSortKey> field="cronExpression" label="Cron" sort={sort} onToggle={toggle} />
          <SortHeader<JobSortKey> field="lastRun.startedAt" label="Son Çalışma" sort={sort} onToggle={toggle} />
          <SortHeader<JobSortKey> field="lastRun.duration" label="Süre" sort={sort} onToggle={toggle} />
          <SortHeader<JobSortKey> field="nextRun" label="Sonraki" sort={sort} onToggle={toggle} />
          <th></th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((j: JobScheduleRow) => (
          <tr key={j.jobName} className="border-t hover:bg-slate-50">
            <td className="py-2">
              <button className="font-medium text-blue-600 hover:underline" onClick={() => onSelect(j.jobName)}>
                {j.jobName}
              </button>
              {!j.enabled && <Badge variant="outline" className="ml-2">PAUSED</Badge>}
              <div className="text-xs text-slate-500">{j.description}</div>
            </td>
            <td className="font-mono text-xs">{j.cronExpression}</td>
            <td>
              {j.lastRun ? (
                <span className="flex items-center gap-2">
                  <Badge variant={j.lastRun.status === 'SUCCESS' ? 'default' : j.lastRun.status === 'FAILED' ? 'destructive' : 'secondary'}>
                    {j.lastRun.status}
                  </Badge>
                  <span className="text-xs">{new Date(j.lastRun.startedAt).toLocaleString('tr-TR')}</span>
                </span>
              ) : '-'}
            </td>
            <td>{j.lastRun?.duration ? `${j.lastRun.duration} ms` : '-'}</td>
            <td className="text-xs">{j.nextRun ? new Date(j.nextRun).toLocaleString('tr-TR') : '-'}</td>
            <td>
              {confirming === j.jobName ? (
                <>
                  <Button size="sm" onClick={() => { run.mutate(j.jobName); setConfirming(null); }}>Onayla</Button>
                  <Button size="sm" variant="ghost" onClick={() => setConfirming(null)}>İptal</Button>
                </>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setConfirming(j.jobName)}>Tetikle</Button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
