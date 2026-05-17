import { Link, useNavigate } from 'react-router-dom';
import { useTeacherGyms } from '../hooks/useTeacherGyms';

export function TeacherGymsView() {
  const navigate = useNavigate();
  const { gyms, loading, error, totalStudents } = useTeacherGyms();

  return (
    <div className="min-h-screen bg-background text-text">
      <header className="w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto p-4 flex items-center justify-between">
        <button className="flex size-10 items-center justify-center" type="button" onClick={() => navigate(-1)} aria-label="Volver">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold">Gimnasios</h1>
        <div className="w-10" />
      </header>

      <main className="w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto p-4 pb-24 space-y-4">
        <div className="bg-surface rounded-2xl border border-border shadow-soft p-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold">Mis alumnos</p>
            <p className="text-sm text-muted mt-1">
              {totalStudents} alumno{totalStudents === 1 ? '' : 's'} en {gyms.length} gimnasio{gyms.length === 1 ? '' : 's'}
            </p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">folder</span>
          </div>
        </div>

        <div className="bg-surface rounded-2xl border border-border shadow-soft p-4 flex items-center justify-between">
          <p className="text-sm font-bold">Carpetas</p>
          <Link className="text-xs font-semibold text-primary" to="/profesor/alumnos">Ver alumnos</Link>
        </div>

        {loading && <div className="bg-surface p-4 rounded-xl text-sm text-muted border border-border">Cargando gimnasios...</div>}
        {error && <div className="bg-red-50 p-4 rounded-xl text-sm text-red-600 border border-red-200">{error}</div>}
        {!loading && !error && gyms.length === 0 && <div className="bg-surface p-4 rounded-xl text-sm text-muted border border-border">Todavia no tenes alumnos asignados.</div>}

        <div className="flex flex-col gap-3">
          {gyms.map((gym) => (
            <div key={gym.id} className="flex items-center gap-3 bg-surface p-3 rounded-xl justify-between shadow-soft border border-border">
              <Link className="flex items-center gap-3 min-w-0 flex-1" to={`/profesor/alumnos?gymId=${encodeURIComponent(gym.id)}&tab=assigned`}>
                <div className="bg-primary/10 text-primary flex items-center justify-center rounded-full h-12 w-12">
                  <span className="material-symbols-outlined">folder</span>
                </div>
                <div className="flex flex-col justify-center min-w-0">
                  <p className="text-text text-base font-semibold leading-tight truncate">{gym.name}</p>
                  <p className="text-xs text-muted mt-1">{gym.studentsCount} alumno{gym.studentsCount === 1 ? '' : 's'}</p>
                </div>
              </Link>
              <div className="flex items-center gap-2 shrink-0">
                <Link className="rounded-lg border border-border text-xs font-semibold px-3 py-2" to={`/profesor/gimnasios/${encodeURIComponent(gym.id)}/asistencia`}>Asistencia</Link>
                <span className="material-symbols-outlined text-gray-400">chevron_right</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
