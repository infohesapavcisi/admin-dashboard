import { useState } from 'react';
import { useInflation } from '../features/inflation/useInflation';
import type { InflationRate } from '../features/inflation/useInflation';
import { InflationForm } from '../features/inflation/InflationForm';
import { CsvImport } from '../features/inflation/CsvImport';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '../components/ui/dialog';

export function InflationPage() {
  const [country, setCountry] = useState<string | undefined>();
  const { data } = useInflation(country);
  const [editing, setEditing] = useState<InflationRate | undefined>();
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Enflasyon</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditing(undefined); setOpen(true); }}>Yeni</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>{editing ? 'Düzenle' : 'Yeni'}</DialogTitle>
            <InflationForm initial={editing} onDone={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      <select
        value={country ?? ''}
        onChange={(e) => setCountry(e.target.value || undefined)}
        className="border rounded px-2 py-1 text-sm"
      >
        <option value="">Tüm ülkeler</option>
        {['TR', 'US', 'IN', 'BR', 'AR'].map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
      <CsvImport />
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-slate-500">
            <th>Tarih</th><th>Ülke</th><th>Aylık</th><th>Yıllık</th><th></th>
          </tr>
        </thead>
        <tbody>
          {((data ?? []) as InflationRate[]).map((r) => (
            <tr key={`${r.date}-${r.country}`} className="border-t">
              <td>{r.date}</td>
              <td>{r.country}</td>
              <td>{r.monthly_rate}</td>
              <td>{r.annual_rate}</td>
              <td>
                <Button size="sm" variant="ghost" onClick={() => { setEditing(r); setOpen(true); }}>
                  Düzenle
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
