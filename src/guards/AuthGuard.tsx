import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../provider/AuthProvider'

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

export const PublicOnlyGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  if (user) {
    // Redirect to the page they came from, or default to code-flow
    const from = (location.state as any)?.from?.pathname || '/landing'
    return <Navigate to={from} replace />
  }

  return <>{children}</>
}
