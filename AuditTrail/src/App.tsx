import { Suspense, lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { SettingsProvider } from './context/SettingsContext'
import { ToastProvider } from './context/ToastContext'
import { AppLayout } from './layouts/AppLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Skeleton } from './components/ui/Skeleton'

const LoginPage = lazy(() => import('./pages/LoginPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const ShipmentsPage = lazy(() => import('./pages/ShipmentsPage'))
const ShipmentDetailPage = lazy(() => import('./pages/ShipmentDetailPage'))
const TimelinePage = lazy(() => import('./pages/TimelinePage'))
const AuditLogsPage = lazy(() => import('./pages/AuditLogsPage'))
const ReportsPage = lazy(() => import('./pages/ReportsPage'))
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

function RouteFallback() {
  return (
    <div className="space-y-4 p-6" role="status" aria-label="Loading page">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}

export default function App() {
  return (
    <SettingsProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route element={<ProtectedRoute />}>
                  <Route element={<AppLayout />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/shipments" element={<ShipmentsPage />} />
                    <Route path="/shipments/:id" element={<ShipmentDetailPage />} />
                    <Route path="/timeline" element={<TimelinePage />} />
                    <Route path="/audit-logs" element={<AuditLogsPage />} />
                    <Route path="/reports" element={<ReportsPage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Route>
                </Route>
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </SettingsProvider>
  )
}
