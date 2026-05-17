import { useNavigate } from 'react-router-dom';
import { useGymAttendance, normalizeDateInput } from '../hooks/useGymAttendance';

export function GymAttendanceView() {
  const navigate = useNavigate();
  const {
    profile, date, setDate,
    data, working, loading, error, success,
    planClassesInput, setPlanClassesInput, savingPlan,
    categoryFilter, setCategoryFilter,
    presentByDni, filteredStudents, summary,
    handleToggle, handleMarkAllPresent, handleSave, handleSaveMonthlyPlan
  } = useGymAttendance();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 bg-background/90 backdrop-blur-md border-b border-border shadow-soft">
        <div className="w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto p-4 flex items-center justify-between">
          <button
            className="flex size-10 items-center justify-center text-muted hover:text-text transition-colors"
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Volver"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="flex-1 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-muted font-bold">
              Asistencia
            </p>
            <h1 className="text-lg font-bold leading-tight text-text">
              {data?.gym?.name ?? 'Gimnasio'}
            </h1>
          </div>
          <div className="w-10" />
        </div>
      </header>

      <main className="w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto p-4 pb-28 space-y-4">
        <div className="bg-surface rounded-2xl border border-border shadow-soft p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold">
                {profile?.role === 'ADMIN' ? 'Vista admin' : 'Vista profesor'}
              </p>
              <p className="text-sm text-muted mt-1">
                Elegi el dia y marca presentes/ausentes.
              </p>
            </div>
            <label className="flex flex-col items-end gap-1">
              <span className="text-xs text-muted font-semibold">Fecha</span>
              <input
                className="rounded-lg border border-border px-3 py-2 text-sm bg-surface text-text"
                type="date"
                value={date}
                onChange={(e) => setDate(normalizeDateInput(e.target.value))}
              />
            </label>
          </div>

          <div className="mt-4 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted">
                Total: {summary.total}
              </span>
              <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-1">
                Presentes: {summary.present}
              </span>
              <span className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-full px-2 py-1">
                Ausentes: {summary.absent}
              </span>
            </div>
            <button
              className="text-xs font-semibold text-primary hover:text-primary-light transition-colors"
              type="button"
              onClick={handleMarkAllPresent}
              disabled={loading || !data}
            >
              Marcar todos presentes
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-muted">Filtro:</span>
            <button
              type="button"
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${categoryFilter === 'ALL'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-surface text-muted hover:text-text'
                }`}
              onClick={() => setCategoryFilter('ALL')}
            >
              Todos
            </button>
            <button
              type="button"
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${categoryFilter === 'ADULT'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-surface text-muted hover:text-text'
                }`}
              onClick={() => setCategoryFilter('ADULT')}
            >
              Adultos
            </button>
            <button
              type="button"
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${categoryFilter === 'CHILD'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-surface text-muted hover:text-text'
                }`}
              onClick={() => setCategoryFilter('CHILD')}
            >
              Infantiles
            </button>
          </div>

          <div className="mt-4 rounded-xl border border-border bg-background p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold">
              Clases del mes
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold rounded-full border border-border bg-surface px-2 py-1 text-muted">
                Plan: {data?.monthlyPlan?.classesPlanned ?? 8}
              </span>
              <span className="text-xs font-semibold rounded-full border border-border bg-surface px-2 py-1 text-muted">
                Cargadas: {data?.monthlyPlan?.recordedClasses ?? 0}
              </span>
              <span className="text-xs font-semibold rounded-full border border-border bg-surface px-2 py-1 text-muted">
                Restantes: {data?.monthlyPlan?.remainingClasses ?? 0}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <input
                className="w-24 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text"
                type="number"
                min={1}
                max={31}
                value={planClassesInput}
                onChange={(event) => setPlanClassesInput(event.target.value)}
              />
              <button
                className="rounded-lg border border-border bg-surface px-3 py-2 text-xs font-semibold text-text hover:bg-black/5 disabled:opacity-70 transition-colors"
                type="button"
                onClick={handleSaveMonthlyPlan}
                disabled={savingPlan || loading}
              >
                {savingPlan ? 'Guardando...' : 'Guardar plan'}
              </button>
            </div>
          </div>
        </div>

        {loading && (
          <div className="bg-surface p-4 rounded-xl text-sm text-muted border border-border shadow-soft">
            Cargando asistencia...
          </div>
        )}

        {error && (
          <div className="bg-red-50 p-4 rounded-xl text-sm text-red-600 border border-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 p-4 rounded-xl text-sm text-green-700 border border-green-200">
            {success}
          </div>
        )}

        {!loading && !error && data && filteredStudents.length === 0 && (
          <div className="bg-surface p-4 rounded-xl text-sm text-muted border border-border shadow-soft">
            No hay alumnos para el filtro seleccionado.
          </div>
        )}

        <div className="flex flex-col gap-3">
          {filteredStudents.map((s) => {
            const isPresent = Boolean(presentByDni[s.dni]);
            return (
              <button
                key={s.dni}
                type="button"
                className="w-full text-left flex items-center gap-4 bg-surface p-3 rounded-xl justify-between shadow-soft border border-border transition-all hover:border-primary/30"
                onClick={() => handleToggle(s.dni)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`h-11 w-11 rounded-full flex items-center justify-center border transition-colors ${isPresent
                      ? 'bg-green-50 border-green-200 text-green-700'
                      : 'bg-red-50 border-red-200 text-red-700'
                      }`}
                  >
                    <span className="material-symbols-outlined">
                      {isPresent ? 'done' : 'close'}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-text text-base font-semibold leading-tight truncate">
                      {s.firstName} {s.lastName}
                    </p>
                    <p className="text-xs text-muted mt-1">DNI: {s.dni}</p>
                  </div>
                </div>
                <div className="shrink-0">
                  <span
                    className={`text-xs font-bold rounded-full px-2 py-1 border transition-colors ${isPresent
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                  >
                    {isPresent ? 'PRESENTE' : 'AUSENTE'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-surface/95 backdrop-blur-md border-t border-border z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <div className="w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto">
          <button
            className="w-full bg-primary hover:bg-primary-light text-white font-bold py-4 rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:bg-primary"
            type="button"
            onClick={handleSave}
            disabled={working || loading || !data}
          >
            <span className="material-symbols-outlined">save</span>
            {working ? 'Guardando...' : 'Guardar asistencia'}
          </button>
        </div>
      </div>
    </div>
  );
}
