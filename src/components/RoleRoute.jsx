import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

function RoleRoute({ children, allowedRoles }) {
  const { user, role } = useSelector((state) => state.auth)

  if (!user) return <Navigate to="/login" replace />
  if (!allowedRoles.includes(role)) return <Navigate to="/home" replace />

  return children
}

export default RoleRoute
