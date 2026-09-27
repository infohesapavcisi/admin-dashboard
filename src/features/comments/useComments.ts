import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';

export type CommentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN';
export type CommentTargetType = 'STOCK' | 'ASSET' | 'NEWS';
export type ModerationAction = 'APPROVE' | 'REJECT' | 'HIDE';

export interface CommentRow {
  id: string;
  target_type: CommentTargetType;
  target_key: string;
  parent_id: string | null;
  body: string;
  created_at: string;
  status: CommentStatus;
  risk_score: number;
  risk_flags: string[];
  report_count: number;
  like_count: number;
  dislike_count: number;
  moderation_reason: string | null;
  author: { id: string | null; display_name: string; avatar_url: string | null };
}

export interface CommentQueue {
  total: number;
  page: number;
  pageSize: number;
  items: CommentRow[];
}

export interface CommentStats {
  pending: number;
  approved: number;
  rejected: number;
  hidden: number;
  with_reports: number;
  premoderation: boolean;
}

interface QueueParams {
  status?: CommentStatus;
  targetType?: CommentTargetType;
  flagged?: boolean;
  page?: number;
  pageSize?: number;
}

export function useCommentStats() {
  return useQuery<CommentStats>({
    queryKey: ['comments', 'stats'],
    queryFn: async () => (await api.get('/admin/comments/stats')).data,
  });
}

export function useCommentQueue(params: QueueParams) {
  const { status, targetType, flagged, page = 1, pageSize = 50 } = params;
  return useQuery<CommentQueue>({
    queryKey: ['comments', 'queue', status, targetType, flagged, page, pageSize],
    queryFn: async () =>
      (
        await api.get('/admin/comments', {
          params: {
            status,
            target_type: targetType,
            flagged: flagged ? true : undefined,
            page,
            pageSize,
          },
        })
      ).data,
  });
}

export function useModerateComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      action,
      reason,
    }: {
      id: string;
      action: ModerationAction;
      reason?: string;
    }) => api.post(`/admin/comments/${id}/moderate`, { action, reason }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comments'] }),
  });
}

export function useDeleteComment() {
  const qc = useQueryClient();
  return useMutation({
    // Sebep query string ile gidiyor: bazı istemciler DELETE gövdesini düşürür.
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.delete(`/admin/comments/${id}`, { params: { reason } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comments'] }),
  });
}

/** Otomatik tarama etiketlerinin Türkçe karşılıkları. */
export const RISK_FLAG_LABELS: Record<string, string> = {
  ADVICE_ORDER: 'al/sat yönlendirmesi',
  PRICE_TARGET: 'fiyat hedefi',
  GUARANTEE: 'garanti getiri',
  MANIPULATION: 'manipülasyon',
  SOLICITATION: 'reklam / iletişim',
  LINK: 'bağlantı',
  PROFANITY: 'hakaret',
  SHOUTING: 'büyük harf',
};
