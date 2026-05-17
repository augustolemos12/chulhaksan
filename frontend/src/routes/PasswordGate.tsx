import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../modules/auth/api/authService';
import React from 'react';

export function PasswordGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = authService.getCurrentProfile();
  const location = useLocation();

  if (
    profile?.mustChangePassword &&
    location.pathname !== '/cambiar-contrasena'
  ) {
    return <Navigate to="/cambiar-contrasena" replace />;
  }

  return children;
}