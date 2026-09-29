import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useBanUser } from './useComments';

const PRESETS = [
  'Tekrarlayan yatırım yönlendirmesi',
  'Reklam / sinyal grubu paylaşımı',
  'Hakaret ve saldırgan dil',
  'Çok sayıda sahte şikayet',
  'Spam',
];

const DURATIONS = [
  { label: '1 gün', days: 1 },
  { label: '7 gün', days: 7 },
  { label: '30 gün', days: 30 },
  { label: 'Süresiz', days: undefined },
];

export function BanUserDialog({
  user,
  onClose,
}: {
  user: { id: string; name: string } | null;
  onClose: () => void;
}) {
  const ban = useBanUser();
  const [reason, setReason] = useState('');
  const [days, setDays] = useState<number | undefined>(7);
  const [shadow, setShadow] = useState(false);

  if (!user) return null;

  const submit = () => {
    if (!reason.trim() || ban.isPending) return;
    ban.mutate(
      { userId: user.id, reason: reason.trim(), days: shadow ? undefined : days, shadow },
      {
        onSuccess: () => {
          setReason('');
          onClose();
        },
      },
    );
  };

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogTitle>{user.name} — yorum yasağı</DialogTitle>
        <div className="space-y-3 text-sm">
          <div className="space-y-1">
            <Label>Sebep</Label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Kullanıcıya gösterilir"
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

          <div className="space-y-1">
            <Label>Süre</Label>
            <div className="flex flex-wrap gap-1">
              {DURATIONS.map((d) => (
                <button
                  key={d.label}
                  type="button"
                  disabled={shadow}
                  onClick={() => setDays(d.days)}
                  className={`text-xs border rounded px-2 py-1 disabled:opacity-40 ${
                    !shadow && days === d.days ? 'bg-slate-200 font-medium' : 'hover:bg-slate-100'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-start gap-2 bg-slate-50 border rounded p-2">
            <input
              type="checkbox"
              checked={shadow}
              onChange={(e) => setShadow(e.target.checked)}
              className="mt-0.5"
            />
            <span className="text-xs text-slate-600">
              <b>Sessiz yasak</b> — kullanıcı engellendiğini anlamaz. Yorumları
              kaydedilir, “incelemeye alındı” yanıtı alır ama hiçbir yerde
              görünmez ve moderasyon kuyruğuna düşmez. Israrcı spam hesapları için.
            </span>
          </label>
        </div>

        <div className="flex gap-2 mt-4">
          <Button onClick={submit} disabled={!reason.trim() || ban.isPending}>
            {ban.isPending ? 'Uygulanıyor...' : shadow ? 'Sessiz yasakla' : 'Yasakla'}
          </Button>
          <Button variant="outline" onClick={onClose} disabled={ban.isPending}>
            Vazgeç
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
