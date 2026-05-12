import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import type { AuthProfile, UserRole } from '../auth/auth';
import { apiFetch, fetchMe, getProfile, logout } from '../auth/auth';

import { DashboardHeader } from './DashboardHeader';
import { ProfileCard } from './ProfileCard';

import { DashboardCard } from './DashboardCard';
import { SectionTitle } from './SectionTitle';
import { StatCard } from './StatCard';
import { ActionCard } from './ActionCard';

const roleLabels: Record<UserRole, string> = {
  STUDENT: 'Alumno',
  TEACHER: 'Profesor',
  ADMIN: 'Administrador',
};

type TeacherSummary = {
  firstName: string;
  lastName: string;
  assignedAt?: string;
};

export function Dashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [profile, setProfile] = useState<AuthProfile | null>(getProfile());

  const [displayName, setDisplayName] = useState('');
  const [teacherSummary, setTeacherSummary] =
    useState<TeacherSummary | null>(null);

  const [mpMessage, setMpMessage] = useState('');
  const [mpConnected, setMpConnected] = useState(false);

  const [adminCounts, setAdminCounts] = useState({
    students: 0,
    teachers: 0,
  });

  const role = profile?.role ?? 'STUDENT';

  const title = useMemo(() => {
    if (role === 'TEACHER') return 'Panel del Profesor';
    if (role === 'ADMIN') return 'Panel de Administración';
    return 'Panel del Alumno';
  }, [role]);

  const handleLogout = async () => {
    const confirmed = window.confirm('¿Querés cerrar sesión?');

    if (!confirmed) return;

    await logout();

    setProfile(null);

    navigate('/login');
  };

  useEffect(() => {
    if (!profile) {
      fetchMe()
        .then((data) => setProfile(data))
        .catch(() => {
          setDisplayName('');
          setTeacherSummary(null);
          setMpConnected(false);
        });

      return;
    }

    const loadName = async () => {
      try {
        if (profile.role === 'STUDENT') {
          const response = await apiFetch('/students/me');

          if (response.ok) {
            const data = await response.json();

            setDisplayName(
              `${data.firstName ?? ''} ${data.lastName ?? ''}`.trim(),
            );

            const teacherResponse = await apiFetch(
              '/students/me/teacher',
            );

            if (teacherResponse.ok) {
              const teacherData =
                (await teacherResponse.json()) as TeacherSummary;

              setTeacherSummary(teacherData);
            }

            return;
          }
        }

        if (profile.role === 'TEACHER') {
          const response = await apiFetch('/teachers/me');

          if (response.ok) {
            const data = await response.json();

            setDisplayName(
              `${data.firstName ?? ''} ${data.lastName ?? ''}`.trim(),
            );

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

    loadName();
  }, [profile]);

  useEffect(() => {
    if (role !== 'ADMIN') return;

    const loadCounts = async () => {
      try {
        const [studentsResponse, teachersResponse] = await Promise.all([
          apiFetch('/admin/students?page=1&limit=1'),
          apiFetch('/admin/teachers?page=1&limit=1'),
        ]);

        if (studentsResponse.ok) {
          const data = await studentsResponse.json();

          setAdminCounts((current) => ({
            ...current,
            students: data?.total ?? 0,
          }));
        }

        if (teachersResponse.ok) {
          const data = await teachersResponse.json();

          setAdminCounts((current) => ({
            ...current,
            teachers: data?.total ?? 0,
          }));
        }
      } catch {
        setAdminCounts({
          students: 0,
          teachers: 0,
        });
      }
    };

    loadCounts();
  }, [role]);

  useEffect(() => {
    if (searchParams.get('mp') === 'connected') {
      setMpMessage('Mercado Pago conectado.');
    }
  }, [searchParams]);

  const handleConnectMp = async () => {
    setMpMessage('');

    try {
      const response = await apiFetch(
        '/teachers/me/mercadopago/connect',
      );

      if (!response.ok) {
        throw new Error('No se pudo iniciar la conexión.');
      }

      const data = await response.json();

      if (!data?.url) {
        throw new Error('No se recibió URL.');
      }

      window.location.href = data.url;
    } catch (err) {
      setMpMessage(
        err instanceof Error
          ? err.message
          : 'No se pudo conectar.',
      );
    }
  };

  const handleDisconnectMp = async () => {
    setMpMessage('');

    try {
      const response = await apiFetch(
        '/teachers/me/mercadopago/disconnect',
        {
          method: 'POST',
        },
      );

      if (!response.ok) {
        throw new Error('No se pudo desconectar.');
      }

      setMpConnected(false);

      setMpMessage('Mercado Pago desconectado.');
    } catch (err) {
      setMpMessage(
        err instanceof Error
          ? err.message
          : 'No se pudo desconectar.',
      );
    }
  };

  return (
    <div className="min-h-screen bg-background-light">
      <DashboardHeader
        title={title}
        onLogout={handleLogout}
      />

      <main className="w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto p-4 pb-24 space-y-5">
        <ProfileCard
          profile={profile}
          displayName={displayName}
        />

        {role === 'STUDENT' && (
          <>
            <DashboardCard>
              <SectionTitle
                eyebrow="Profesor"
                title={
                  teacherSummary
                    ? `Prof. ${teacherSummary.firstName} ${teacherSummary.lastName}`
                    : 'Sin profesor asignado'
                }
                subtitle="Profesor actual"
              />
            </DashboardCard>

            <DashboardCard>
              <SectionTitle
                title="Acceso rápido"
                subtitle="Herramientas principales"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ActionCard
                  to="/pagos"
                  icon="payments"
                  title="Pagos"
                  subtitle="Cuotas y estado"
                />

                <ActionCard
                  to="/asistencia"
                  icon="checklist"
                  title="Asistencia"
                  subtitle="Historial"
                />

                <ActionCard
                  to="/formas"
                  icon="link"
                  title="Formas"
                  subtitle="Material"
                />

                <ActionCard
                  to="/perfil"
                  icon="person"
                  title="Perfil"
                  subtitle="Datos personales"
                />
              </div>
            </DashboardCard>
          </>
        )}

        {role === 'TEACHER' && (
          <DashboardCard>
            <SectionTitle
              title="Acceso rápido"
              subtitle="Gestión del profesor"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ActionCard
                to="/profesor/alumnos"
                icon="group"
                title="Alumnos"
                subtitle="Listado y estado"
              />

              <ActionCard
                to="/profesor/gimnasios"
                icon="folder"
                title="Gimnasios"
                subtitle="Carpetas y conteos"
              />

              <ActionCard
                to="/perfil"
                icon="badge"
                title="Perfil"
                subtitle="Datos personales"
              />

              <ActionCard
                icon="payments"
                title="Mercado Pago"
                subtitle="Cobros en tu cuenta"
              >
                <button
                  className={`mt-4 w-full rounded-xl text-white text-sm font-semibold py-2 ${mpConnected
                    ? 'bg-green-600'
                    : 'bg-primary'
                    }`}
                  type="button"
                  onClick={
                    mpConnected
                      ? handleDisconnectMp
                      : handleConnectMp
                  }
                >
                  {mpConnected
                    ? 'Desconectar'
                    : 'Conectar'}
                </button>

                {mpMessage && (
                  <p className="text-xs text-gray-500 mt-2">
                    {mpMessage}
                  </p>
                )}
              </ActionCard>
            </div>
          </DashboardCard>
        )}

        {role === 'ADMIN' && (
          <>
            <DashboardCard>
              <SectionTitle
                eyebrow="Totales"
                title="Resumen general"
                subtitle="Información rápida"
              />

              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  label="Alumnos"
                  value={adminCounts.students}
                  icon="group"
                />

                <StatCard
                  label="Profesores"
                  value={adminCounts.teachers}
                  icon="badge"
                />
              </div>
            </DashboardCard>

            <DashboardCard>
              <SectionTitle
                title="Acceso rápido"
                subtitle="Herramientas administrativas"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ActionCard
                  to="/admin/alumnos"
                  icon="group"
                  title="Alumnos"
                  subtitle="Gestión total"
                />

                <ActionCard
                  to="/admin/profesores"
                  icon="badge"
                  title="Profesores"
                  subtitle="Gestión total"
                />

                <ActionCard
                  to="/admin/formas"
                  icon="link"
                  title="Formas"
                  subtitle="Links y desbloqueos"
                />

                <ActionCard
                  to="/admin/gimnasios"
                  icon="folder"
                  title="Gimnasios"
                  subtitle="Carpetas y conteos"
                />
              </div>
            </DashboardCard>
          </>
        )}
      </main>
    </div>
  );
}