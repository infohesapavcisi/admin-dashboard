import { useState } from 'react';
import { useAuditLog } from '../features/audit-log/useAuditLog';
import { Button } from '../components/ui/button';
import { useSortable } from '../lib/useSortable';
import { SortHeader } from '../components/common/SortHeader';

type AuditSortKey = 'created_at' | 'actor_email' | 'action' | 'ip_address';

export function AuditLogPage() {
  const [offset, setOffset] = useState(0);
  const { data } = useAuditLog(100, offset);

  const { sorted, sort, toggle } = useSortable<any, AuditSortKey>(
    (data ?? []) as any[],
    { key: 'created_at', dir: 'desc' }
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Audit Log</h1>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-slate-500">
            <SortHeader<AuditSortKey> field="created_at" label="Zaman" sort={sort} onToggle={toggle} />
            <SortHeader<AuditSortKey> field="actor_email" label="Kullanıcı" sort={sort} onToggle={toggle} />
            <SortHeader<AuditSortKey> field="action" label="Aksiyon" sort={sort} onToggle={toggle} />
            <SortHeader<AuditSortKey> field="ip_address" label="IP" sort={sort} onToggle={toggle} />
            <th>Payload</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r: any) => (
            <tr key={r.id} className="border-t">
              <td>{new Date(r.created_at).toLocaleString('tr-TR')}</td>
              <td>{r.actor_email}</td>
              <td className="font-mono text-xs">{r.action}</td>
              <td>{r.ip_address}</td>
              <td>
                <details>
                  <summary>göster</summary>
                  <pre className="text-xs">{JSON.stringify(r.payload, null, 2)}</pre>
                </details>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex gap-2">
        <Button variant="outline" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - 100))}>Önceki</Button>
        <Button variant="outline" onClick={() => setOffset(offset + 100)}>Sonraki</Button>
      </div>
    </div>
  );
}
