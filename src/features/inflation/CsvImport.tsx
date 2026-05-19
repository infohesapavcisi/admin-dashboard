import { useState } from 'react';
import { useUpsertInflation } from './useInflation';
import type { InflationRate } from './useInflation';

export function CsvImport() {
  const upsert = useUpsertInflation();
  const [log, setLog] = useState<string[]>([]);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    const text = await f.text();
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map((h) => h.trim());
    setLog([]);
    for (const line of lines.slice(1)) {
      const cols = line.split(',');
      const row: Record<string, string> = {};
      headers.forEach((h, i) => { row[h] = cols[i]; });
      try {
        await upsert.mutateAsync(row as unknown as InflationRate);
        setLog((l) => [...l, `OK ${row.date} ${row.country}`]);
      } catch (err: unknown) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setLog((l) => [...l, `ERR ${row.date} ${row.country}: ${axiosErr?.response?.data?.message}`]);
      }
    }
  }

  return (
    <div className="space-y-2 border rounded p-3">
      <div className="text-sm font-medium">CSV Import (date,country,rate)</div>
      <input type="file" accept=".csv" onChange={onFile} />
      <div className="text-xs max-h-32 overflow-auto">{log.map((l, i) => <div key={i}>{l}</div>)}</div>
    </div>
  );
}
