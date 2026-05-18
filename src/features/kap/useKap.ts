import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';

export function useKapList() {
  return useQuery({
    queryKey: ['kap', 'list'],
    queryFn: async () => (await api.get('/kap-disclosure')).data,
  });
}

export function useKapUnmatched(type?: 'DIVIDEND' | 'BONUS' | 'RIGHTS') {
  return useQuery({
    queryKey: ['kap', 'unmatched', type],
    queryFn: async () => (await api.get('/admin/kap/unmatched-corporate-actions', { params: { type } })).data,
  });
}

export function useCreateFromKap() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body?: any }) =>
      api.post(`/admin/corporate-actions/from-kap/${id}`, body ?? {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['kap'] });
      qc.invalidateQueries({ queryKey: ['adjustments'] });
    },
  });
}
