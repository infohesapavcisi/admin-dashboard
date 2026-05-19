import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateAdjustment } from './useAdjustments';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

const schema = z.object({
  stock_code: z.string().min(1).transform((s) => s.toUpperCase()),
  ex_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD formatı gerekli'),
  bonus_ratio: z.coerce.number().optional(),
  rights_ratio: z.coerce.number().optional(),
  rights_price_tl: z.coerce.number().optional(),
  dividend_per_share: z.coerce.number().optional(),
  applyNow: z.boolean().optional(),
});
type FormVals = z.infer<typeof schema>;

function clean(vals: FormVals) {
  const out: Record<string, unknown> = { stock_code: vals.stock_code, ex_date: vals.ex_date };
  if (vals.applyNow) out.applyNow = true;
  for (const k of ['bonus_ratio', 'rights_ratio', 'rights_price_tl', 'dividend_per_share'] as const) {
    const v = vals[k];
    if (v !== undefined && !Number.isNaN(v)) out[k] = v;
  }
  return out;
}

export function AdjustmentForm({ onDone }: { onDone: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormVals>({
    resolver: zodResolver(schema) as never,
  });
  const create = useCreateAdjustment();

  return (
    <form
      onSubmit={handleSubmit((vals) => create.mutate(clean(vals) as never, { onSuccess: onDone }))}
      className="space-y-3"
    >
      <div>
        <Label>Hisse kodu</Label>
        <Input placeholder="THYAO" {...register('stock_code')} />
        {errors.stock_code && <p className="text-xs text-red-500">{errors.stock_code.message}</p>}
      </div>
      <div>
        <Label>Ex date (YYYY-MM-DD)</Label>
        <Input placeholder="2026-01-15" {...register('ex_date')} />
        {errors.ex_date && <p className="text-xs text-red-500">{errors.ex_date.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>Bedelsiz %</Label>
          <Input type="number" step="0.01" {...register('bonus_ratio')} />
        </div>
        <div>
          <Label>Bedelli %</Label>
          <Input type="number" step="0.01" {...register('rights_ratio')} />
        </div>
        <div>
          <Label>Rüçhan fiyatı (TL)</Label>
          <Input type="number" step="0.01" {...register('rights_price_tl')} />
        </div>
        <div>
          <Label>Temettü / pay (TL)</Label>
          <Input type="number" step="0.0001" {...register('dividend_per_share')} />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register('applyNow')} />
        Oluşturduktan sonra hemen uygula
      </label>
      {create.isError && (
        <p className="text-sm text-red-600">
          {(create.error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message ?? 'Hata'}
        </p>
      )}
      <Button type="submit" disabled={create.isPending}>
        {create.isPending ? 'Kaydediliyor...' : 'Kaydet'}
      </Button>
    </form>
  );
}
