import { useEffect, useMemo, useState } from 'react';
import { httpClient } from '../../../core/api/httpClient';
import { authService, type UserProfile, type RoleType } from '../../auth/api/authService';

export type StudentProfileData = {
  id: number; dni: string; firstName: string; lastName: string;
  birthDate?: string | null; phone?: string | null;
  guardianPhone?: string | null; email?: string | null;
  gym?: { id: number; name: string } | null; address?: string | null;
};

export type TeacherSummary = { firstName: string; lastName: string; assignedAt?: string; };

export type TeacherProfileData = {
  firstName: string; lastName: string; phone?: string | null;
  email?: string | null; birthDate?: string | null;
  address?: string | null; gyms?: string[] | null;
};

export function useStudentProfile() {
  const [authProfile, setAuthProfile] = useState<UserProfile | null>(authService.getCurrentProfile());
  const [role, setRole] = useState<RoleType | null>(authProfile?.role ?? null);
  
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [teacher, setTeacher] = useState<TeacherSummary | null>(null);
  
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfileData | null>(null);
  const [teacherStudentCount, setTeacherStudentCount] = useState<number | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        let currentProfile = authProfile;
        if (!currentProfile) {
          currentProfile = await authService.fetchUserProfile();
          setAuthProfile(currentProfile);
        }

        setRole(currentProfile.role);

        if (currentProfile.role === 'STUDENT') {
          const res = await httpClient.request('/students/me');
          if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? 'No se pudo cargar el perfil.');
          setProfile(await res.json() as StudentProfileData);

          const teacherRes = await httpClient.request('/students/me/teacher');
          if (teacherRes.ok) setTeacher(await teacherRes.json() as TeacherSummary);
          else setTeacher(null);

        } else if (currentProfile.role === 'TEACHER') {
          const [tRes, sRes] = await Promise.all([
            httpClient.request('/teachers/me'),
            httpClient.request('/teachers/me/students')
          ]);

          if (!tRes.ok) throw new Error((await tRes.json().catch(() => ({}))).message ?? 'No se pudo cargar el perfil.');
          setTeacherProfile(await tRes.json() as TeacherProfileData);

          if (sRes.ok) {
            const payload = await sRes.json() as any;
            if (Array.isArray(payload)) setTeacherStudentCount(payload.length);
            else setTeacherStudentCount(payload?.total ?? payload?.data?.length ?? 0);
          } else {
            setTeacherStudentCount(null);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar el perfil.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const fullName = useMemo(() => {
    if (role === 'TEACHER') return teacherProfile ? `${teacherProfile.firstName} ${teacherProfile.lastName}` : 'Profesor';
    if (role === 'ADMIN') return 'Administrador';
    return profile ? `${profile.firstName} ${profile.lastName}` : 'Alumno';
  }, [profile, role, teacherProfile]);

  const birthDateLabel = useMemo(() => {
    if (!profile?.birthDate) return '-';
    return new Date(profile.birthDate).toLocaleDateString('es-AR', { timeZone: 'UTC' });
  }, [profile]);

  const teacherBirthDateLabel = useMemo(() => {
    if (!teacherProfile?.birthDate) return '-';
    return new Date(teacherProfile.birthDate).toLocaleDateString('es-AR', { timeZone: 'UTC' });
  }, [teacherProfile]);

  return {
    role, loading, error, authProfile,
    profile, teacher, teacherProfile, teacherStudentCount,
    fullName, birthDateLabel, teacherBirthDateLabel,
    isTeacher: role === 'TEACHER', isAdmin: role === 'ADMIN', isStudent: role === 'STUDENT'
  };
}
