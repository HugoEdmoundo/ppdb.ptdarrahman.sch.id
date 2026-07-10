import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ADMIN_ROLES = ['superadmin', 'admin_ppdb', 'admin_keuangan', 'penguji']

export default function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: 'admin' | 'applicant' }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[var(--bg)]">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />
  }

  const isAdmin = ADMIN_ROLES.includes(user.user_type || '')

  if (role === 'admin' && !isAdmin) {
    return <Navigate to="/applicant" replace />
  }

  if (role === 'applicant' && isAdmin) {
    return <Navigate to="/admin" replace />
  }

  return <>{children}</>
}
