import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    refetchInterval: 60_000,
    queryFn: async () => {
      const [jobs, stats, unmatched] = await Promise.all([
        api.get('/admin/jobs/schedule').then((r) => r.data),
        api.get('/admin/users/stats').then((r) => r.data),
        api.get('/admin/kap/unmatched-corporate-actions').then((r) => r.data),
      ]);
      const healthy = (jobs as any[]).filter((j) => j.lastRun?.status === 'SUCCESS').length;
      return {
        jobsHealthy: healthy,
        jobsTotal: jobs.length,
        failedJobs: (jobs as any[]).filter((j) => j.lastRun?.status === 'FAILED'),
        users: stats,
        unmatchedCount: unmatched.length,
      };
    },
  });
}
