import { useUserStats, useRecentUsers } from '../features/users/useUserStats';
import { Card } from '../components/ui/card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useSortable } from '../lib/useSortable';
import { SortHeader } from '../components/common/SortHeader';

type UserSortKey = 'email' | 'first_name' | 'is_active' | 'email_verified' | 'created_at';

export function UsersPage() {
  const { data: stats } = useUserStats();
  const { data: recent } = useRecentUsers();
  if (!stats) return <div>Yükleniyor...</div>;
  const pct = (n: number) => stats.total ? Math.round((n / stats.total) * 100) : 0;

  const { sorted, sort, toggle } = useSortable<any, UserSortKey>(
    (recent ?? []) as any[],
    { key: 'created_at', dir: 'desc' }
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Kullanıcılar</h1>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <Card className="p-3"><div className="text-xs text-slate-500">Toplam</div><div className="text-xl font-semibold">{stats.total}</div></Card>
        <Card className="p-3"><div className="text-xs text-slate-500">Aktif</div><div className="text-xl font-semibold">{stats.active} <span className="text-xs text-slate-400">({pct(stats.active)}%)</span></div></Card>
        <Card className="p-3"><div className="text-xs text-slate-500">Profil dolu</div><div className="text-xl font-semibold">{stats.withProfile} <span className="text-xs text-slate-400">({pct(stats.withProfile)}%)</span></div></Card>
        <Card className="p-3"><div className="text-xs text-slate-500">Portföylü</div><div className="text-xl font-semibold">{stats.withPortfolio} <span className="text-xs text-slate-400">({pct(stats.withPortfolio)}%)</span></div></Card>
        <Card className="p-3"><div className="text-xs text-slate-500">Email doğrulanmış</div><div className="text-xl font-semibold">{stats.emailVerified}</div></Card>
      </div>

      <Card className="p-4">
        <div className="text-sm font-medium mb-2">Son 30 gün kayıt</div>
        <div className="h-48">
          <ResponsiveContainer>
            <LineChart data={stats.last30dRegistrations}>
              <XAxis
                dataKey="day"
                tickFormatter={(d) => new Date(d).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' })}
              />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-4">
        <div className="text-sm font-medium mb-2">Son 20 kayıt</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500">
              <SortHeader<UserSortKey> field="email" label="Email" sort={sort} onToggle={toggle} />
              <SortHeader<UserSortKey> field="first_name" label="Ad" sort={sort} onToggle={toggle} />
              <SortHeader<UserSortKey> field="is_active" label="Aktif" sort={sort} onToggle={toggle} />
              <SortHeader<UserSortKey> field="email_verified" label="Doğr." sort={sort} onToggle={toggle} />
              <SortHeader<UserSortKey> field="created_at" label="Tarih" sort={sort} onToggle={toggle} />
            </tr>
          </thead>
          <tbody>
            {sorted.map((u: any) => (
              <tr key={u.id} className="border-t">
                <td>{u.email}</td>
                <td>{u.first_name ?? ''} {u.last_name ?? ''}</td>
                <td>{u.is_active ? '✓' : '✗'}</td>
                <td>{u.email_verified ? '✓' : '✗'}</td>
                <td>{new Date(u.created_at).toLocaleString('tr-TR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
