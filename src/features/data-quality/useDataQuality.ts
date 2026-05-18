import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

export const useStaleStocks = () => useQuery({
  queryKey: ['dq', 'stale-stocks'],
  queryFn: async () => (await api.get('/admin/data-quality/stale-stocks?days=3')).data,
});
export const useStaleNews = () => useQuery({
  queryKey: ['dq', 'stale-news'],
  queryFn: async () => (await api.get('/admin/data-quality/stale-news-sources?hours=24')).data,
});
export const useMissingInflation = (country?: string) => useQuery({
  queryKey: ['dq', 'missing-inflation', country],
  queryFn: async () => (await api.get('/admin/data-quality/missing-inflation-months', { params: { country } })).data,
});
