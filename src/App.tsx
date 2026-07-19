import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './components/Toast'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './layouts/AdminLayout'
import ApplicantLayout from './layouts/ApplicantLayout'
import { PublicLayout } from './layouts/PublicLayout'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import NotFoundPage from './pages/errors/NotFoundPage'
import ForbiddenPage from './pages/errors/ForbiddenPage'
import LandingPage from './pages/public/LandingPage'
import PublicRegisterPage from './pages/public/PublicRegisterPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import PeriodsPage from './pages/admin/PeriodsPage'
import LevelsPage from './pages/admin/LevelsPage'
import WaveConfigPage from './pages/admin/WaveConfigPage'
import AdminDocumentsPage from './pages/admin/AdminDocumentsPage'
import AdminPaymentsPage from './pages/admin/AdminPaymentsPage'
import AdminSelectionPage from './pages/admin/AdminSelectionPage'
import AdminPostPage from './pages/admin/AdminPostPage'
import AdminNotificationsPage from './pages/admin/AdminNotificationsPage'
import AdminReportsPage from './pages/admin/AdminReportsPage'
import AdminApplicantsPage from './pages/admin/AdminApplicantsPage'
import AdminAuditLogPage from './pages/admin/AdminAuditLogPage'
import ApplicantDashboard from './pages/applicant/ApplicantDashboard'
import ApplicantDocumentsPage from './pages/applicant/ApplicantDocumentsPage'
import ApplicantProfilePage from './pages/applicant/ApplicantProfilePage'
import ApplicantParentsPage from './pages/applicant/ApplicantParentsPage'
import ApplicantHistoryPage from './pages/applicant/ApplicantHistoryPage'
import ApplicantPaymentsPage from './pages/applicant/ApplicantPaymentsPage'
import ApplicantTestsPage from './pages/applicant/ApplicantTestsPage'
import ApplicantPostPage from './pages/applicant/ApplicantPostPage'
import ApplicantNotificationsPage from './pages/applicant/ApplicantNotificationsPage'
import * as api from './api/client'

const P = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center py-20"><h1 className="text-xl font-semibold">{title}</h1><p className="text-gray-500 mt-2">Segera hadir.</p></div>
)

const placeholderAdmin = ['users','roles']
  .map(p => <Route key={p} path={p} element={<P title={p} />} />)

const placeholderApplicant: ReturnType<typeof Route>[] = []

export default function App() {
  useEffect(() => {
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement
    fetch(`${api.API_BASE}/companyprofile/settings/favicon`)
      .then(res => res.json())
      .then(data => { if (data?.value && link) link.href = data.value; else if (link) link.href = '/download.png' })
      .catch(() => { if (link) link.href = '/download.png' })
  }, [])

  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/register" element={<RegisterPage />} />

            <Route path="/" element={<PublicLayout />}>
              <Route index element={<LandingPage />} />
              <Route path="info" element={<P title="Info" />} />
              <Route path="jadwal" element={<P title="Jadwal" />} />
              <Route path="kontak" element={<P title="Kontak" />} />
              <Route path="register" element={<PublicRegisterPage />} />
            </Route>

            <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout><Outlet /></AdminLayout></ProtectedRoute>}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="periods" element={<PeriodsPage />} />
              <Route path="levels" element={<LevelsPage />} />
              <Route path="wave-configs" element={<WaveConfigPage />} />
              <Route path="documents" element={<AdminDocumentsPage />} />
              <Route path="payments" element={<AdminPaymentsPage />} />
              <Route path="test-sessions" element={<AdminSelectionPage />} />
              <Route path="mou" element={<AdminPostPage />} />
              <Route path="notifications" element={<AdminNotificationsPage />} />
              <Route path="reports" element={<AdminReportsPage />} />
              <Route path="applicants" element={<AdminApplicantsPage />} />
              <Route path="audit-log" element={<AdminAuditLogPage />} />
              <Route path="test-scores" element={<AdminSelectionPage />} />
              <Route path="graduations" element={<AdminSelectionPage />} />
              <Route path="invoices" element={<AdminPaymentsPage />} />
              <Route path="discounts" element={<AdminPaymentsPage />} />
              <Route path="re-registrations" element={<AdminPostPage />} />
              <Route path="mpls" element={<AdminPostPage />} />
              <Route path="calendar" element={<AdminNotificationsPage />} />
              {placeholderAdmin}
            </Route>

            <Route path="/applicant" element={<ProtectedRoute role="applicant"><ApplicantLayout><Outlet /></ApplicantLayout></ProtectedRoute>}>
              <Route index element={<ApplicantDashboard />} />
              <Route path="documents" element={<ApplicantDocumentsPage />} />
              <Route path="profile" element={<ApplicantProfilePage />} />
              <Route path="parents" element={<ApplicantParentsPage />} />
              <Route path="history" element={<ApplicantHistoryPage />} />
              <Route path="payments" element={<ApplicantPaymentsPage />} />
              <Route path="tests" element={<ApplicantTestsPage />} />
              <Route path="mou" element={<ApplicantPostPage />} />
              <Route path="notifications" element={<ApplicantNotificationsPage />} />
              <Route path="re-registration" element={<ApplicantPostPage />} />
              <Route path="results" element={<ApplicantTestsPage />} />
              {placeholderApplicant}
            </Route>

            <Route path="/403" element={<ForbiddenPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
