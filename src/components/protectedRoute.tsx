import React from 'react'
import { Navigate } from 'react-router-dom'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const authMessage = sessionStorage.getItem('authMessage')

  if (authMessage !== 'codigoValido') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
