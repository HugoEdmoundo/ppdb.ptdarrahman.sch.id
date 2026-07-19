import { Navigate } from 'react-router-dom'
import { useAuth, usePermission } from '../contexts/AuthContext'

export default function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: 'admin' | 'applicant' }) {
  const { user, loading } = useAuth()
  const { isAdmin, hasApplicantAccess } = usePermission()

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

  const userIsAdmin = isAdmin()
  const userIsApplicant = hasApplicantAccess()

  if (role === 'admin' && !userIsAdmin) {
    if (userIsApplicant) return <Navigate to="/applicant" replace />
    return <Navigate to="/auth/login" replace />
  }

  if (role === 'applicant' && !userIsApplicant) {
    if (userIsAdmin) return <Navigate to="/admin" replace />
    return <Navigate to="/auth/login" replace />
  }

  return <>{children}</>
}
