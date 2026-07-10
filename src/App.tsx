import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './components/Toast'
import ProtectedRoute from './components/ProtectedRoute'
import { AdminLayout } from './layouts/AdminLayout'
import { ApplicantLayout } from './layouts/ApplicantLayout'
import { PublicLayout } from './layouts/PublicLayout'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import NotFoundPage from './pages/errors/NotFoundPage'
import ForbiddenPage from './pages/errors/ForbiddenPage'
import LandingPage from './pages/public/LandingPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import ApplicantDashboard from './pages/applicant/ApplicantDashboard'
import ApplicantDocumentsPage from './pages/applicant/ApplicantDocumentsPage'

const P = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center py-20"><h1 className="text-xl font-semibold">{title}</h1><p className="text-gray-500 mt-2">Segera hadir.</p></div>
)

const adminRoutes = [
  'periods','waves','levels','categories','flows','wave-configs','applicants','documents',
  'test-sessions','test-scores','graduations','payments','invoices','discounts','mou',
  're-registrations','mpls','reports','audit-log','calendar','users','roles','notifications',
].map(p => <Route key={p} path={p} element={<P title={p} />} />)

const applicantRoutes = [
  'profile','payments','tests','results','mou','re-registration','parents','history',
].map(p => <Route key={p} path={p} element={<P title={p} />} />)

export default function App() {
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
              <Route path="register" element={<P title="Register" />} />
            </Route>
            <Route path="/admin/*" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
              <Route index element={<AdminDashboardPage />} />
              {adminRoutes}
            </Route>
            <Route path="/applicant/*" element={<ProtectedRoute><ApplicantLayout /></ProtectedRoute>}>
              <Route index element={<ApplicantDashboard />} />
              <Route path="documents" element={<ApplicantDocumentsPage />} />
              {applicantRoutes}
            </Route>
            <Route path="/403" element={<ForbiddenPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
