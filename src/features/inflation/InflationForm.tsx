import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUpsertInflation } from './useInflation';
import type { InflationRate } from './useInflation';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

const schema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  country: z.string().min(2),
  rate: z.coerce.number(),
});

interface FormVals {
  date: string;
  country: string;
  rate: number;
}

export function InflationForm({ initial, onDone }: { initial?: InflationRate; onDone: () => void }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit } = useForm<FormVals>({ resolver: zodResolver(schema) as any, defaultValues: initial as FormVals });
  const upsert = useUpsertInflation();

  return (
    <form
      onSubmit={handleSubmit((vals) => upsert.mutate({ ...(vals as InflationRate), _edit: !!initial }, { onSuccess: onDone }))}
      className="space-y-3"
    >
      <div><Label>Tarih (YYYY-MM-DD)</Label><Input {...register('date')} disabled={!!initial} /></div>
      <div><Label>Ülke</Label><Input {...register('country')} /></div>
      <div><Label>Oran %</Label><Input type="number" step="0.01" {...register('rate')} /></div>
      <Button type="submit">Kaydet</Button>
    </form>
  );
}
