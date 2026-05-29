import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  const [searchParams] = useSearchParams();

  const [profile, setProfile] = useState<UserProfile | null>(authService.getCurrentProfile());
  const [displayName, setDisplayName] = useState('');
  const [teacherSummary, setTeacherSummary] = useState<TeacherSummary | null>(null);
  const [monthEvent, setMonthEvent] = useState<MonthEvent | null>(null);
  const [mpMessage, setMpMessage] = useState('');
  const [mpConnected, setMpConnected] = useState(false);
  const [adminStats, setAdminStats] = useState({ students: 0, teachers: 0 });

  const role = profile?.role ?? 'STUDENT';
  const pageTitle = useMemo(() => {
    if (role === 'TEACHER') return 'Panel del Profesor';
    if (role === 'ADMIN') return 'Panel de Administración';
    return 'Panel del Alumno';
  }, [role]);

  const executeLogout = async () => {
    if (!window.confirm('¿Querés cerrar sesión?')) return;
    await authService.logout();
    setProfile(null);
    navigate('/login');
  };

  useEffect(() => {
    if (!profile) {
      authService.fetchUserProfile()
        .then((data) => setProfile(data))
        .catch(() => {
          setDisplayName('');
          setTeacherSummary(null);
          setMpConnected(false);
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
            setMpConnected(!!data.mpConnectedAt);
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

  useEffect(() => {
    if (searchParams.get('mp') === 'connected') {
      setMpMessage('Mercado Pago conectado.');
    }
  }, [searchParams]);

  const connectMercadoPago = async () => {
    setMpMessage('');
    try {
      const res = await httpClient.request('/teachers/me/mercadopago/connect');
      if (!res.ok) throw new Error('No se pudo iniciar la conexión.');
      const data = await res.json();
      if (!data?.url) throw new Error('No se recibió URL.');
      window.location.href = data.url;
    } catch (err) {
      setMpMessage(err instanceof Error ? err.message : 'No se pudo conectar.');
    }
  };

  const disconnectMercadoPago = async () => {
    setMpMessage('');
    try {
      const res = await httpClient.request('/teachers/me/mercadopago/disconnect', { method: 'POST' });
      if (!res.ok) throw new Error('No se pudo desconectar.');
      setMpConnected(false);
      setMpMessage('Mercado Pago desconectado.');
    } catch (err) {
      setMpMessage(err instanceof Error ? err.message : 'No se pudo desconectar.');
    }
  };

  return {
    profile,
    role,
    pageTitle,
    displayName,
    teacherSummary,
    adminStats,
    mpConnected,
    mpMessage,
    monthEvent,
    executeLogout,
    connectMercadoPago,
    disconnectMercadoPago,
  };
}
