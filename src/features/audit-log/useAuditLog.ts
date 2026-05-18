import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
export const useAuditLog = (limit = 100, offset = 0) => useQuery({
  queryKey: ['audit-log', limit, offset],
  queryFn: async () => (await api.get('/admin/audit-log', { params: { limit, offset } })).data,
});
