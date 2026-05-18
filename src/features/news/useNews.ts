import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

export function useNews(params: { page?: number; sourceId?: number }) {
  return useQuery({
    queryKey: ['news', params],
    queryFn: async () => (await api.get('/news', { params })).data,
  });
}

export function useNewsSources() {
  return useQuery({
    queryKey: ['news', 'sources'],
    queryFn: async () => (await api.get('/news/sources')).data,
  });
}

export function useStaleNewsSources() {
  return useQuery({
    queryKey: ['data-quality', 'stale-news-sources'],
    queryFn: async () => (await api.get('/admin/data-quality/stale-news-sources?hours=24')).data,
  });
}
