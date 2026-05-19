import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';

export interface InflationRate {
  date: string;
  country: string;
  rate?: number;
}

export function useInflation(country?: string) {
  return useQuery({
    queryKey: ['inflation', country],
    queryFn: async () => {
      const params: Record<string, string | number> = {
        startDate: '2020-01-01',
        limit: 500,
      };
      if (country) params.country = country;
      return (await api.get('/inflation-rates', { params })).data;
    },
  });
}

export function useUpsertInflation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vals: InflationRate & { _edit?: boolean }) => {
      const { _edit, ...payload } = vals;
      if (_edit) return api.put(`/inflation-rates/${vals.date}`, payload);
      return api.post('/inflation-rates', payload);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inflation'] }),
  });
}
