import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, type UserProfile } from '../../auth/api/authService';
import { httpClient } from '../../../core/api/httpClient';

export interface TeacherSummary {
  firstName: string;
  lastName: string;
  assignedAt?: string;
}

export interface MonthEvent {
  id: string;
  title: string;
  imageUrl: string;
}

export function useDashboardData() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(authService.getCurrentProfile());
  const [isLoadingProfile, setIsLoadingProfile] = useState(!profile);
  const [displayName, setDisplayName] = useState('');
  const [teacherSummary, setTeacherSummary] = useState<TeacherSummary | null>(null);
  const [monthEvent, setMonthEvent] = useState<MonthEvent | null>(null);
  const [adminStats, setAdminStats] = useState({ students: 0, teachers: 0 });

  const role = profile?.role;
  const pageTitle = useMemo(() => {
    if (role === 'TEACHER') return 'Panel del Profesor';
    if (role === 'ADMIN') return 'Panel de Administración';
    if (role === 'STUDENT') return 'Panel del Alumno';
    return 'Cargando...';
  }, [role]);

  const executeLogout = async () => {
    if (!window.confirm('¿Querés cerrar sesión?')) return;
    await authService.logout();
    setProfile(null);
    navigate('/login');
  };

  useEffect(() => {
    if (!profile) {
      setIsLoadingProfile(true);
      authService.fetchUserProfile()
        .then((data) => {
          setProfile(data);
          setIsLoadingProfile(false);
        })
        .catch(() => {
          navigate('/login', { replace: true });
        });
      return;
    }

    const loadUserData = async () => {
      try {
        if (profile.role === 'STUDENT') {
          httpClient.request('/events')
            .then(res => res.ok ? res.json() : null)
            .then(data => { if (data) setMonthEvent(data); })
            .catch(() => {});

          const res = await httpClient.request('/students/me');
          if (res.ok) {
            const data = await res.json();
            setDisplayName(`${data.firstName ?? ''} ${data.lastName ?? ''}`.trim());
            const teacherRes = await httpClient.request('/students/me/teacher');
            if (teacherRes.ok) {
              const teacherData = await teacherRes.json() as TeacherSummary;
              setTeacherSummary(teacherData);
            }
            return;
          }
        }

        if (profile.role === 'TEACHER') {
          const res = await httpClient.request('/teachers/me');
          if (res.ok) {
            const data = await res.json();
            setDisplayName(`${data.firstName ?? ''} ${data.lastName ?? ''}`.trim());
            return;
          }
        }

        if (profile.role === 'ADMIN') {
          setDisplayName('Administrador');
        }
      } catch {
        setDisplayName('');
      }
    };

    loadUserData();
  }, [profile]);

  useEffect(() => {
    if (role !== 'ADMIN') return;
    const fetchAdminStats = async () => {
      try {
        const [studentsRes, teachersRes] = await Promise.all([
          httpClient.request('/students?page=1&limit=1'),
          httpClient.request('/teachers?page=1&limit=1'),
        ]);

        if (studentsRes.ok) {
          const data = await studentsRes.json();
          setAdminStats((prev) => ({ ...prev, students: data?.total ?? 0 }));
        }

        if (teachersRes.ok) {
          const data = await teachersRes.json();
          setAdminStats((prev) => ({ ...prev, teachers: data?.total ?? 0 }));
        }
      } catch {
        setAdminStats({ students: 0, teachers: 0 });
      }
    };
    fetchAdminStats();
  }, [role]);



  return {
    profile,
    isLoadingProfile,
    role,
    pageTitle,
    displayName,
    teacherSummary,
    adminStats,
    monthEvent,
    executeLogout,
  };
}
