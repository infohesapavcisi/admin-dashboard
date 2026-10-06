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

export interface ManualJobParam {
  name: 'since' | 'refill';
  type: 'date' | 'boolean';
  label: string;
  required?: boolean;
  default?: string;
}

export interface ManualJobRow {
  jobName: string;
  description: string;
  params: ManualJobParam[];
  lastRun: JobScheduleRow['lastRun'];
}

export type ManualJobParams = { since?: string; refill?: boolean };

export function useManualJobs() {
  return useQuery({
    queryKey: ['jobs', 'manual'],
    queryFn: async () => (await api.get<ManualJobRow[]>('/admin/jobs/manual')).data,
    refetchInterval: 30_000,
  });
}

export function useStartManualJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ name, params }: { name: string; params: ManualJobParams }) =>
      api.post(`/admin/jobs/manual/${name}/start`, params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['jobs'] }),
  });
}
