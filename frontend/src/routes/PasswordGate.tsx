import { Navigate, useLocation } from 'react-router-dom';
import { getProfile } from '../pages/auth/auth';
import React from 'react';

export function PasswordGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = getProfile();
  const location = useLocation();

  if (
    profile?.mustChangePassword &&
    location.pathname !== '/cambiar-contrasena'
  ) {
    return <Navigate to="/cambiar-contrasena" replace />;
  }

  return children;
}