import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

export function useUserStats() {
  return useQuery({
    queryKey: ['users', 'stats'],
    queryFn: async () => (await api.get('/admin/users/stats')).data,
  });
}
export function useRecentUsers() {
  return useQuery({
    queryKey: ['users', 'recent'],
    queryFn: async () => (await api.get('/admin/users/recent?limit=20')).data,
  });
}
