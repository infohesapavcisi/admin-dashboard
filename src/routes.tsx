import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AppShell } from './components/layout/AppShell';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { JobsPage } from './pages/JobsPage';
import { NewsPage } from './pages/NewsPage';
import { InflationPage } from './pages/InflationPage';
import { KapPage } from './pages/KapPage';
import { CorporateActionsPage } from './pages/CorporateActionsPage';
import { UsersPage } from './pages/UsersPage';
import { DataQualityPage } from './pages/DataQualityPage';
import { AuditLogPage } from './pages/AuditLogPage';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/', element: <DashboardPage /> },
          { path: '/jobs', element: <JobsPage /> },
          { path: '/news', element: <NewsPage /> },
          { path: '/inflation', element: <InflationPage /> },
          { path: '/kap', element: <KapPage /> },
          { path: '/corporate-actions', element: <CorporateActionsPage /> },
          { path: '/users', element: <UsersPage /> },
          { path: '/data-quality', element: <DataQualityPage /> },
          { path: '/audit-log', element: <AuditLogPage /> },
        ],
      },
    ],
  },
]);
