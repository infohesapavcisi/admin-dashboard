import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  RISK_FLAG_LABELS,
  useDeleteComment,
  useModerateComment,
  type CommentRow,
} from './useComments';

export type PendingAction = 'REJECT' | 'HIDE' | 'DELETE';

const TITLES: Record<PendingAction, string> = {
  REJECT: 'Yorumu reddet',
  HIDE: 'Yorumu gizle',
  DELETE: 'Yorumu kaldır',
};

const HINTS: Record<PendingAction, string> = {
  REJECT: 'Sebep kullanıcıya gösterilir ve denetim kaydına yazılır.',
  HIDE: 'Yorum yayından kalkar, kayıt durur. Sebep zorunlu.',
  DELETE: 'Yorum listelerden kaldırılır; kayıt denetim için saklanır.',
};

// Sık kullanılan sebepler — tek tıkla doldurmak için.
const PRESETS = [
  'Yatırım tavsiyesi / yönlendirme içeriyor',
  'Reklam veya iletişim bilgisi paylaşımı',
  'Hakaret / saldırgan dil',
  'Manipülatif iddia, kaynaksız bilgi',
  'Konu dışı / spam',
];

export function ModerationDialog({
  comment,
  action,
  onClose,
}: {
  comment: CommentRow | null;
  action: PendingAction | null;
  onClose: () => void;
}) {
  const moderate = useModerateComment();
  const remove = useDeleteComment();
  const [reason, setReason] = useState('');

  if (!comment || !action) return null;

  const pending = moderate.isPending || remove.isPending;
  const canSubmit = reason.trim().length > 0 && !pending;

  const submit = () => {
    if (!canSubmit) return;
    const onSuccess = () => {
      setReason('');
      onClose();
    };
    if (action === 'DELETE') {
      remove.mutate({ id: comment.id, reason: reason.trim() }, { onSuccess });
    } else {
      moderate.mutate(
        { id: comment.id, action, reason: reason.trim() },
        { onSuccess },
      );
    }
  };

  return (
    <Dialog
      open
      onOpenChange={(v) => {
        if (!v) {
          setReason('');
          onClose();
        }
      }}
    >
      <DialogContent>
        <DialogTitle>{TITLES[action]}</DialogTitle>
        <div className="space-y-3 text-sm">
          <div className="text-xs text-slate-500">{HINTS[action]}</div>

          <div className="bg-slate-50 border rounded p-3">
            <div className="text-xs text-slate-500 mb-1">
              {comment.author.display_name} · {comment.target_type}/
              {comment.target_key}
            </div>
            <div className="whitespace-pre-wrap">{comment.body}</div>
            {comment.risk_flags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {comment.risk_flags.map((flag) => (
                  <span
                    key={flag}
                    className="text-[11px] bg-amber-100 text-amber-800 rounded px-1.5 py-0.5"
                  >
                    {RISK_FLAG_LABELS[flag] ?? flag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <Label>Sebep</Label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Örn. Yatırım tavsiyesi içeriyor"
              onKeyDown={(e) => {
                if (e.key === 'Enter') submit();
              }}
            />
            <div className="flex flex-wrap gap-1 pt-1">
              {PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setReason(preset)}
                  className="text-[11px] border rounded px-2 py-0.5 hover:bg-slate-100"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button onClick={submit} disabled={!canSubmit}>
            {pending ? 'Gönderiliyor...' : TITLES[action]}
          </Button>
          <Button variant="outline" onClick={onClose} disabled={pending}>
            Vazgeç
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
