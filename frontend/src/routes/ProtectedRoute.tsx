import { Navigate } from 'react-router-dom';
import { getProfile } from '../pages/auth/auth';
import React from 'react';

type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';

interface Props {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export function ProtectedRoute({ children, allowedRoles }: Props) {
  const profile = getProfile();

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}