import { useState } from 'react';
import { JobsTable } from '../features/jobs/JobsTable';
import { JobHistoryChart } from '../features/jobs/JobHistoryChart';
import { ManualJobsPanel } from '../features/jobs/ManualJobsPanel';

export function JobsPage() {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Job Monitor</h1>
      <section id="manual" className="space-y-3">
        <h2 className="text-lg font-semibold">Elle Tetiklenenler</h2>
        <ManualJobsPanel onSelect={setSelected} />
      </section>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Zamanlanmış Job'lar</h2>
        <JobsTable onSelect={setSelected} />
      </section>
      {selected && (
        <div className="border rounded p-4">
          <div className="font-medium mb-2">{selected} — geçmiş</div>
          <JobHistoryChart name={selected} />
        </div>
      )}
    </div>
  );
}
