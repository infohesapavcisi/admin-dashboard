import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';

export function useAdjustments(params: { status?: string; stockCode?: string } = {}) {
  return useQuery({
    queryKey: ['adjustments', params],
    queryFn: async () => (await api.get('/stock-price-adjustments', { params })).data,
  });
}

export function useApplyAdjustment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/stock-price-adjustments/${id}/apply`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adjustments'] }),
  });
}

export function useRevertAdjustment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/stock-price-adjustments/${id}/revert`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adjustments'] }),
  });
}
