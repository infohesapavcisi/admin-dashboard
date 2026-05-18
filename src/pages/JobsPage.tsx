import { useState } from 'react';
import { JobsTable } from '../features/jobs/JobsTable';
import { JobHistoryChart } from '../features/jobs/JobHistoryChart';

export function JobsPage() {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Job Monitor</h1>
      <JobsTable onSelect={setSelected} />
      {selected && (
        <div className="border rounded p-4">
          <div className="font-medium mb-2">{selected} — geçmiş</div>
          <JobHistoryChart name={selected} />
        </div>
      )}
    </div>
  );
}
