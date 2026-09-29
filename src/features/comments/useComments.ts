import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';

export type CommentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN';
export type CommentTargetType = 'STOCK' | 'ASSET' | 'NEWS';
export type ModerationAction = 'APPROVE' | 'REJECT' | 'HIDE';

export interface CommentReport {
  reason: string;
  note: string | null;
  created_at: string;
  reporter: string;
}

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
  /** Hisse adı / haber başlığı / varlık adı — API tek sorguda çözüyor. */
  target_label: string | null;
  /** Haber yorumlarında kaynak bağlantısı. */
  target_url: string | null;
  reports: CommentReport[];
}

export interface CommentQueue {
  total: number;
  page: number;
  pageSize: number;
  items: CommentRow[];
}

export interface AnomalySnapshot {
  window_minutes: number;
  comments: number;
  comments_limit: number;
  new_users: number;
  new_users_limit: number;
  rejected_by_screening: number;
  reports: number;
  triggered: string[];
}

export interface BannedUser {
  user_id: string;
  email: string;
  display_name: string;
  shadow: boolean;
  banned_until: string | null;
  reason: string | null;
  banned_by: string | null;
  banned_at: string | null;
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

export function useCommentAnomaly() {
  return useQuery<AnomalySnapshot>({
    queryKey: ['comments', 'anomaly'],
    queryFn: async () => (await api.get('/admin/comments/anomaly')).data,
    // Saldırı anında panel açıkken fark edilsin diye kısa aralık.
    refetchInterval: 60_000,
  });
}

export function useBannedUsers() {
  return useQuery<{ total: number; items: BannedUser[] }>({
    queryKey: ['comments', 'bans'],
    queryFn: async () => (await api.get('/admin/comments/bans')).data,
  });
}

export function useBanUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      reason,
      days,
      shadow,
    }: {
      userId: string;
      reason: string;
      days?: number;
      shadow?: boolean;
    }) =>
      api.post(`/admin/comments/users/${userId}/ban`, { reason, days, shadow }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comments'] }),
  });
}

export function useUnbanUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      api.delete(`/admin/comments/users/${userId}/ban`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comments'] }),
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

export function useBulkModerateComments() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      ids,
      action,
      reason,
    }: {
      ids: string[];
      action: ModerationAction;
      reason?: string;
    }) => api.post('/admin/comments/bulk-moderate', { ids, action, reason }),
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
/** Şikayet sebeplerinin Türkçe karşılıkları. */
export const REPORT_REASON_LABELS: Record<string, string> = {
  SPAM: 'spam',
  ABUSE: 'hakaret',
  INVESTMENT_ADVICE: 'yatırım tavsiyesi',
  MISINFORMATION: 'yanlış bilgi',
  OTHER: 'diğer',
};

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
