import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useJobHistory } from './useJobs';

export function JobHistoryChart({ name }: { name: string }) {
  const { data } = useJobHistory(name);
  const points = ((data ?? []) as any[]).slice().reverse().map((r) => ({
    t: new Date(r.startedAt).toLocaleString('tr-TR'),
    duration: r.duration ?? 0,
    status: r.status,
  }));

  return (
    <div className="space-y-4">
      <div className="h-40">
        <ResponsiveContainer>
          <LineChart data={points}>
            <XAxis dataKey="t" hide />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="duration" stroke="#3b82f6" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="text-xs max-h-72 overflow-auto">
        {((data ?? []) as any[]).filter((r) => r.status === 'FAILED').map((r) => (
          <div key={r.id} className="border-l-2 border-red-500 pl-2 mb-2">
            <div>{new Date(r.startedAt).toLocaleString('tr-TR')}</div>
            <div className="text-red-600">{r.error}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
