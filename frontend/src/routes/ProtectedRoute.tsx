import { Navigate } from 'react-router-dom';
import { authService, type RoleType } from '../modules/auth/api/authService';
import React from 'react';

interface Props {
  children: React.ReactNode;
  allowedRoles?: RoleType[];
}

export function ProtectedRoute({ children, allowedRoles }: Props) {
  const profile = authService.getCurrentProfile();

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}