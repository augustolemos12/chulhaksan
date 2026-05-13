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

import { BottomNavBar } from '../../components/ui/BottomNavBar';

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
    <div className="min-h-screen bg-background transition-colors duration-300">
      <DashboardHeader
        title={title}
        onLogout={handleLogout}
      />

      <main className="w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto p-4 pb-28 md:pb-8 space-y-6">
        <ProfileCard
          profile={profile}
          displayName={displayName}
        />

        {role === 'STUDENT' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

            <div className="md:col-span-8">
              <DashboardCard className="h-full bg-gradient-to-br from-primary to-[#a81c00] text-white border-none relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-surface/10 rounded-full -translate-y-1/2 translate-x-1/3 group-hover:scale-110 transition-transform duration-500"></div>
                <div className="relative z-10 flex flex-col justify-between h-full min-h-[200px]">
                  <div>
                    <span className="inline-block px-3 py-1 bg-surface/20 rounded-full text-xs font-bold mb-4 backdrop-blur-sm uppercase tracking-wider">
                      Tu Profesor
                    </span>
                    <h3 className="font-display text-2xl md:text-3xl font-bold mb-2">
                      {teacherSummary
                        ? `Prof. ${teacherSummary.firstName} ${teacherSummary.lastName}`
                        : 'Sin profesor asignado'}
                    </h3>
                    <p className="text-white/80 mb-6 flex items-center gap-2 font-medium">
                      <span className="material-symbols-outlined text-sm">info</span>
                      Contacta a tu instructor para tu próxima clase
                    </p>
                  </div>
                  <div>
                    <button className="bg-surface text-primary px-6 py-2.5 rounded-full font-bold hover:bg-surface transition-colors shadow-md active:scale-95">
                      Ver Detalles
                    </button>
                  </div>
                </div>
              </DashboardCard>
            </div>

            <div className="md:col-span-4">
              <DashboardCard className="h-full p-4 flex flex-col justify-center">
                <SectionTitle
                  title="Acceso Rápido"
                  subtitle="Herramientas principales"
                />
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <ActionCard
                    to="/pagos"
                    icon="payments"
                    title="Pagos"
                  />
                  <ActionCard
                    to="/asistencia"
                    icon="checklist"
                    title="Asist."
                  />
                  <ActionCard
                    to="/formas"
                    icon="link"
                    title="Formas"
                  />
                  <ActionCard
                    to="/perfil"
                    icon="person"
                    title="Perfil"
                  />
                </div>
              </DashboardCard>
            </div>

          </div>
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
                    ? 'bg-success'
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
                  <p className="text-xs text-muted mt-2">
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
      <BottomNavBar />
    </div>
  );
}