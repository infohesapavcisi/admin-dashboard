import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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

export function useNewsDetail(id: string | null) {
  return useQuery({
    queryKey: ['news', 'detail', id],
    enabled: !!id,
    queryFn: async () => (await api.get(`/news/${id}`)).data,
  });
}

export interface NewsPatch {
  title?: string;
  summary?: string | null;
  content?: string | null;
  image_url?: string | null;
}

export function useUpdateNews() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: NewsPatch }) =>
      api.patch(`/news/${id}`, patch),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['news'] });
      qc.invalidateQueries({ queryKey: ['news', 'detail', vars.id] });
    },
  });
}
