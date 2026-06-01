import { Link } from 'react-router-dom';
import { useStudentProfile } from '../hooks/useStudentProfile';

export function StudentProfileView() {
  const {
    loading, error, authProfile, profile, teacher, teacherProfile, teacherStudentCount,
    fullName, birthDateLabel, teacherBirthDateLabel, isTeacher, isAdmin, isStudent
  } = useStudentProfile();

  return (
    <div className="min-h-screen bg-background text-text transition-colors duration-300">
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border transition-colors duration-300">
        <div className="flex items-center p-4 justify-between w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto">
          <Link className="text-text flex size-10 shrink-0 items-center justify-center" to="/dashboard">
            <span className="material-symbols-outlined">arrow_back_ios</span>
          </Link>
          <h2 className="text-text text-lg font-bold leading-tight tracking-tight flex-1 text-center">
            {isTeacher ? 'Perfil del Profesor' : isAdmin ? 'Perfil del Administrador' : 'Perfil del Alumno'}
          </h2>
          <div className="flex w-10 items-center justify-end">
            <span className="material-symbols-outlined">person</span>
          </div>
        </div>
      </header>

      <main className="w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto pb-24">
        <section className="p-4">
          <div className="bg-surface rounded-2xl p-5 shadow-soft border border-border flex items-center gap-4 transition-colors duration-300">
            <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-20 w-20 border-2 border-primary" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAos5xQbdG0hopRVsTPpirAP0KbSkbwXsF01UGAMj1noMqHm6Vc45_Nq1nXZoQluBpRJRM_3x6J5l3qIiIjj4Kz3hzlnnggc9D3YIpjUGVE82iENCBnwKb_uutYZCpfaEnXcfE-HETPtNWEVy14tzaeDMlXVUtRSyIrkNZMZ6bQegcqEfUuRuhZ_WiJ4u3O6SFgkXkWoAPvIc9jlG0Gm0GkYpSVx-oIviQtjbdgYUF2JMkK9WdFcyjg7hr7ZKMnXz22eTiTHhatuixZ")' }} />
            <div className="flex flex-col">
              <p className="text-xl font-bold leading-tight">{fullName}</p>
              {!isStudent && <p className="text-muted text-sm font-medium">{isTeacher ? 'Profesor' : 'Administrador'}</p>}
              <p className="text-xs text-muted mt-1">{isTeacher ? 'Profesor activo' : isAdmin ? 'Acceso administrador' : 'Alumno activo'}</p>
            </div>
          </div>
        </section>

        {isStudent && (
          <section className="px-4">
            <div className="bg-surface rounded-2xl p-4 shadow-soft border border-border transition-colors duration-300">
              <h3 className="text-sm uppercase tracking-[0.2em] text-primary font-bold">Profesor Actual</h3>
              <div className="mt-3 flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white">
                  <span className="material-symbols-outlined">sports_martial_arts</span>
                </div>
                <div>
                  <p className="text-sm font-semibold">{teacher ? `Prof. ${teacher.firstName} ${teacher.lastName}` : 'Sin profesor asignado'}</p>
                  <p className="text-xs text-muted">Asignación actual</p>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="px-4 mt-6 space-y-3">
          <div className="bg-surface rounded-2xl border border-border shadow-soft transition-colors duration-300">
            <div className="px-4 py-3 border-b border-border">
              <h3 className="text-base font-bold">Datos Personales</h3>
              <p className="text-xs text-muted mt-1">Solo lectura. Contactá a administración si necesitas cambios.</p>
            </div>
            <div className="divide-y divide-border">
              {loading && <div className="px-4 py-3 text-sm text-muted">Cargando perfil...</div>}
              {error && <div className="px-4 py-3 text-sm text-red-600">{error}</div>}
              {isStudent && (
                <>
                  <div className="px-4 py-3 flex items-center justify-between"><span className="text-sm text-muted">DNI</span><span className="text-sm font-semibold">{profile?.dni ?? '-'}</span></div>
                  <div className="px-4 py-3 flex items-center justify-between"><span className="text-sm text-muted">Teléfono</span><span className="text-sm font-semibold">{profile?.phone ?? '-'}</span></div>
                  <div className="px-4 py-3 flex items-center justify-between"><span className="text-sm text-muted">Teléfono tutor</span><span className="text-sm font-semibold">{profile?.guardianPhone ?? '-'}</span></div>
                  <div className="px-4 py-3 flex items-center justify-between"><span className="text-sm text-muted">Gimnasio</span><span className="text-sm font-semibold">{profile?.gym?.name ?? '-'}</span></div>
                  <div className="px-4 py-3 flex items-center justify-between"><span className="text-sm text-muted">Correo electrónico</span><span className="text-sm font-semibold">{profile?.email ?? '-'}</span></div>
                  <div className="px-4 py-3 flex items-center justify-between"><span className="text-sm text-muted">Dirección</span><span className="text-sm font-semibold">{profile?.address ?? '-'}</span></div>
                  <div className="px-4 py-3 flex items-center justify-between"><span className="text-sm text-muted">Nacimiento</span><span className="text-sm font-semibold">{birthDateLabel}</span></div>
                </>
              )}
              {isTeacher && (
                <>
                  <div className="px-4 py-3 flex items-center justify-between"><span className="text-sm text-muted">DNI</span><span className="text-sm font-semibold">{authProfile?.dni ?? '-'}</span></div>
                  <div className="px-4 py-3 flex items-center justify-between"><span className="text-sm text-muted">Alumnos asignados</span><span className="text-sm font-semibold">{teacherStudentCount ?? '-'}</span></div>
                  <div className="px-4 py-3 flex items-center justify-between"><span className="text-sm text-muted">Teléfono</span><span className="text-sm font-semibold">{teacherProfile?.phone ?? '-'}</span></div>
                  <div className="px-4 py-3 flex items-center justify-between"><span className="text-sm text-muted">Correo electrónico</span><span className="text-sm font-semibold">{teacherProfile?.email ?? '-'}</span></div>
                  <div className="px-4 py-3 flex items-center justify-between"><span className="text-sm text-muted">Dirección</span><span className="text-sm font-semibold">{teacherProfile?.address ?? '-'}</span></div>
                  <div className="px-4 py-3 flex items-center justify-between"><span className="text-sm text-muted">Nacimiento</span><span className="text-sm font-semibold">{teacherBirthDateLabel}</span></div>
                  <div className="px-4 py-3 flex items-center justify-between"><span className="text-sm text-muted">Gimnasios</span><span className="text-sm font-semibold">{teacherProfile?.gyms && teacherProfile.gyms.length > 0 ? teacherProfile.gyms.join(', ') : '-'}</span></div>
                </>
              )}
              {isAdmin && (
                <div className="px-4 py-3 flex items-center justify-between"><span className="text-sm text-muted">DNI</span><span className="text-sm font-semibold">{authProfile?.dni ?? '-'}</span></div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
