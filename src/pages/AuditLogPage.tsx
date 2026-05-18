import { useState } from 'react';
import { useAuditLog } from '../features/audit-log/useAuditLog';
import { Button } from '../components/ui/button';

export function AuditLogPage() {
  const [offset, setOffset] = useState(0);
  const { data } = useAuditLog(100, offset);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Audit Log</h1>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-slate-500">
            <th>Zaman</th><th>Kullanıcı</th><th>Aksiyon</th><th>IP</th><th>Payload</th>
          </tr>
        </thead>
        <tbody>
          {((data ?? []) as any[]).map((r) => (
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
