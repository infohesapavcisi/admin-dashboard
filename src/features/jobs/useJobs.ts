import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';

export interface JobScheduleRow {
  jobName: string;
  cronExpression: string;
  description: string;
  enabled: boolean;
  lastRun: { status: string; startedAt: string; endedAt: string | null; duration: number | null; error: string | null } | null;
  nextRun: string | null;
}

export function useJobsSchedule() {
  return useQuery({
    queryKey: ['jobs', 'schedule'],
    queryFn: async () => (await api.get<JobScheduleRow[]>('/admin/jobs/schedule')).data,
    refetchInterval: 60_000,
  });
}

export function useJobHistory(name: string | null) {
  return useQuery({
    queryKey: ['jobs', name, 'history'],
    enabled: !!name,
    queryFn: async () => (await api.get(`/admin/jobs/${name}/history?limit=50`)).data,
  });
}

export function useRunJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => api.post(`/admin/jobs/${name}/run`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['jobs'] }),
  });
}
