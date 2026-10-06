import { useDashboard } from '../features/dashboard/useDashboard';
import { Card } from '../components/ui/card';
import { Link } from 'react-router-dom';
import { useManualJobs } from '../features/jobs/useJobs';

export function DashboardPage() {
  const { data, isLoading } = useDashboard();
  const manual = useManualJobs();
  if (isLoading || !data) return <div>Yükleniyor...</div>;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Genel Durum</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-xs text-slate-500">Job Sağlığı</div>
          <div className="text-2xl font-semibold">{data.jobsHealthy}/{data.jobsTotal}</div>
          {data.failedJobs.length > 0 && (
            <div className="text-xs text-red-600 mt-1">
              {data.failedJobs.length} başarısız: {data.failedJobs.map((j: any) => j.jobName).join(', ')}
            </div>
          )}
          <Link to="/jobs" className="text-xs text-blue-600 mt-2 inline-block">Detay →</Link>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-slate-500">Toplam Kullanıcı</div>
          <div className="text-2xl font-semibold">{data.users.total}</div>
          <div className="text-xs text-slate-500 mt-1">Aktif: {data.users.active}</div>
          <Link to="/users" className="text-xs text-blue-600 mt-2 inline-block">Detay →</Link>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-slate-500">Portföylü Kullanıcı</div>
          <div className="text-2xl font-semibold">{data.users.withPortfolio}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-slate-500">Bekleyen KAP Eşleşmesi</div>
          <div className="text-2xl font-semibold">{data.unmatchedCount}</div>
          <Link to="/kap" className="text-xs text-blue-600 mt-2 inline-block">Review Queue →</Link>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-slate-500">Elle Tetiklenenler</div>
          <div className="text-2xl font-semibold">{manual.data?.length ?? '-'}</div>
          {manual.data?.some((j) => j.lastRun?.status === 'RUNNING') && (
            <div className="text-xs text-amber-600 mt-1">
              Çalışıyor: {manual.data.filter((j) => j.lastRun?.status === 'RUNNING').map((j) => j.jobName).join(', ')}
            </div>
          )}
          <Link to="/jobs#manual" className="text-xs text-blue-600 mt-2 inline-block">Başlat →</Link>
        </Card>
      </div>
    </div>
  );
}
