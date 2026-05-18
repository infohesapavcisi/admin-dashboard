import { NavLink } from 'react-router-dom';

const items = [
  { to: '/', label: 'Dashboard' },
  { to: '/jobs', label: 'Jobs' },
  { to: '/news', label: 'Haberler' },
  { to: '/inflation', label: 'Enflasyon' },
  { to: '/kap', label: 'KAP' },
  { to: '/corporate-actions', label: 'Bedelli/Temettü' },
  { to: '/users', label: 'Kullanıcılar' },
  { to: '/data-quality', label: 'Veri Kalitesi' },
  { to: '/audit-log', label: 'Audit Log' },
];

export function Sidebar() {
  return (
    <aside className="w-56 border-r h-screen p-3 space-y-1 bg-slate-50">
      <div className="font-semibold mb-4 px-2">Test API Admin</div>
      {items.map((i) => (
        <NavLink
          key={i.to}
          to={i.to}
          end={i.to === '/'}
          className={({ isActive }) =>
            `block px-3 py-2 rounded text-sm ${isActive ? 'bg-slate-200 font-medium' : 'hover:bg-slate-100'}`
          }
        >
          {i.label}
        </NavLink>
      ))}
    </aside>
  );
}
