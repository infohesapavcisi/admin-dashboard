import { useAuthStore } from '../../stores/auth.store';
import { Button } from '../ui/button';

export function Topbar() {
  const { user, clear } = useAuthStore();
  return (
    <header className="h-12 border-b flex items-center justify-end px-4 gap-3">
      <span className="text-sm text-slate-600">{user?.email}</span>
      <Button variant="outline" size="sm" onClick={() => { clear(); location.href = '/login'; }}>
        Çıkış
      </Button>
    </header>
  );
}
