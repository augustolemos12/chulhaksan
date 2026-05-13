import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiFetch, getProfile } from './auth/auth';

type AttendanceStudent = {
  dni: string;
  firstName: string;
  lastName: string;
  category?: 'ADULT' | 'CHILD';
  present: boolean;
  notes: string | null;
  marked: boolean;
};

type AttendanceResponse = {
  gym: { id: string; name: string };
  date: string; // YYYY-MM-DD
  summary: { total: number; present: number; absent: number; unmarked: number };
  monthlyPlan?: {
    year: number;
    month: number;
    classesPlanned: number;
    recordedClasses: number;
    remainingClasses: number;
  };
  students: AttendanceStudent[];
};

function todayLocalISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function normalizeDateInput(raw: string) {
  const trimmed = (raw ?? '').trim();
  // Native <input type="date"> returns YYYY-MM-DD.
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  // Some browsers/devices can fall back to a localized string (DD/MM/YYYY).
  const m = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) {
    const dd = m[1];
    const mm = m[2];
    const yyyy = m[3];
    return `${yyyy}-${mm}-${dd}`;
  }

  return trimmed;
}

export function GymAttendance() {
  const navigate = useNavigate();
  const { gymId } = useParams();
  const profile = getProfile();

  const [date, setDate] = useState(todayLocalISO());
  const [data, setData] = useState<AttendanceResponse | null>(null);
  const [working, setWorking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [planClassesInput, setPlanClassesInput] = useState('8');
  const [savingPlan, setSavingPlan] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'ADULT' | 'CHILD'>(
    'ALL',
  );

  const [presentByDni, setPresentByDni] = useState<Record<string, boolean>>({});

  const load = async () => {
    if (!gymId) return;
    const apiDate = normalizeDateInput(date);
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await apiFetch(
        `/attendance/gym/${gymId}?date=${encodeURIComponent(apiDate)}`,
        {
          method: 'GET',
          cache: 'no-store',
        },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? 'No se pudo cargar la asistencia.');
      }
      const json = (await res.json()) as AttendanceResponse;
      setData(json);
      setPlanClassesInput(String(json.monthlyPlan?.classesPlanned ?? 8));

      // If the browser gave us a localized value, normalize our state so subsequent saves work.
      if (apiDate !== date) setDate(apiDate);

      // Default behavior: everything starts as "ausente" (present=false) unless the DB says otherwise.
      const next: Record<string, boolean> = {};
      for (const s of json.students ?? []) {
        next[s.dni] = Boolean(s.present);
      }
      setPresentByDni(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar la asistencia.');
      setData(null);
      setPresentByDni({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gymId, date]);

  const filteredStudents = useMemo(() => {
    const students = data?.students ?? [];
    if (categoryFilter === 'ALL') return students;
    return students.filter((student) => student.category === categoryFilter);
  }, [data, categoryFilter]);

  const summary = useMemo(() => {
    const students = filteredStudents;
    const total = students.length;
    const present = students.filter((s) => presentByDni[s.dni]).length;
    const absent = total - present;
    return { total, present, absent };
  }, [filteredStudents, presentByDni]);

  const handleToggle = (dni: string) => {
    setPresentByDni((current) => ({ ...current, [dni]: !current[dni] }));
  };

  const handleMarkAllPresent = () => {
    const students = filteredStudents;
    const next: Record<string, boolean> = {};
    for (const s of students) next[s.dni] = true;
    setPresentByDni((current) => ({ ...current, ...next }));
  };

  const handleSave = async () => {
    if (!gymId || !data) return;
    const apiDate = normalizeDateInput(date);
    setWorking(true);
    setError('');
    setSuccess('');
    try {
      const items = (data.students ?? []).map((s) => ({
        studentDni: s.dni,
        present: Boolean(presentByDni[s.dni]),
      }));

      const res = await apiFetch(
        `/attendance/gym/${gymId}?date=${encodeURIComponent(apiDate)}`,
        {
          method: 'PUT',
          json: true,
          body: JSON.stringify({ items }),
        },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? 'No se pudo guardar la asistencia.');
      }

      setSuccess('Asistencia guardada.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la asistencia.');
    } finally {
      setWorking(false);
    }
  };

  const handleSaveMonthlyPlan = async () => {
    if (!gymId) return;
    const classesPlanned = Number.parseInt(planClassesInput, 10);
    if (!Number.isInteger(classesPlanned) || classesPlanned < 1 || classesPlanned > 31) {
      setError('Ingresa una cantidad valida de clases (1 a 31).');
      return;
    }

    const apiDate = normalizeDateInput(date);
    setSavingPlan(true);
    setError('');
    setSuccess('');
    try {
      const res = await apiFetch(
        `/attendance/gym/${gymId}/plan?date=${encodeURIComponent(apiDate)}`,
        {
          method: 'PUT',
          json: true,
          body: JSON.stringify({ classesPlanned }),
        },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? 'No se pudo guardar el plan mensual.');
      }

      const json = (await res.json()) as {
        year: number;
        month: number;
        classesPlanned: number;
        recordedClasses: number;
        remainingClasses: number;
      };

      setData((current) =>
        current
          ? {
            ...current,
            monthlyPlan: {
              year: json.year,
              month: json.month,
              classesPlanned: json.classesPlanned,
              recordedClasses: json.recordedClasses,
              remainingClasses: json.remainingClasses,
            },
          }
          : current,
      );
      setSuccess('Plan mensual actualizado.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el plan mensual.');
    } finally {
      setSavingPlan(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 bg-background/90 backdrop-blur-md border-b border-gray-100">
        <div className="w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto p-4 flex items-center justify-between">
          <button
            className="flex size-10 items-center justify-center"
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Volver"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="flex-1 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500 font-bold">
              Asistencia
            </p>
            <h1 className="text-lg font-bold leading-tight">
              {data?.gym?.name ?? 'Gimnasio'}
            </h1>
          </div>
          <div className="w-10" />
        </div>
      </header>

      <main className="w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto p-4 pb-28 space-y-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold">
                {profile?.role === 'ADMIN' ? 'Vista admin' : 'Vista profesor'}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Elegi el dia y marca presentes/ausentes.
              </p>
            </div>
            <label className="flex flex-col items-end gap-1">
              <span className="text-xs text-gray-500 font-semibold">Fecha</span>
              <input
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white"
                type="date"
                value={date}
                onChange={(e) => setDate(normalizeDateInput(e.target.value))}
              />
            </label>
          </div>

          <div className="mt-4 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-600">
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
              className="text-xs font-semibold text-primary"
              type="button"
              onClick={handleMarkAllPresent}
              disabled={loading || !data}
            >
              Marcar todos presentes
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-gray-600">Filtro:</span>
            <button
              type="button"
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${categoryFilter === 'ALL'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-gray-200 bg-white text-gray-600'
                }`}
              onClick={() => setCategoryFilter('ALL')}
            >
              Todos
            </button>
            <button
              type="button"
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${categoryFilter === 'ADULT'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-gray-200 bg-white text-gray-600'
                }`}
              onClick={() => setCategoryFilter('ADULT')}
            >
              Adultos
            </button>
            <button
              type="button"
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${categoryFilter === 'CHILD'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-gray-200 bg-white text-gray-600'
                }`}
              onClick={() => setCategoryFilter('CHILD')}
            >
              Infantiles
            </button>
          </div>

          <div className="mt-4 rounded-xl border border-gray-100 bg-background-light p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold">
              Clases del mes
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold rounded-full border border-gray-200 bg-white px-2 py-1">
                Plan: {data?.monthlyPlan?.classesPlanned ?? 8}
              </span>
              <span className="text-xs font-semibold rounded-full border border-gray-200 bg-white px-2 py-1">
                Cargadas: {data?.monthlyPlan?.recordedClasses ?? 0}
              </span>
              <span className="text-xs font-semibold rounded-full border border-gray-200 bg-white px-2 py-1">
                Restantes: {data?.monthlyPlan?.remainingClasses ?? 0}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <input
                className="w-24 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                type="number"
                min={1}
                max={31}
                value={planClassesInput}
                onChange={(event) => setPlanClassesInput(event.target.value)}
              />
              <button
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-[#1b0d0d] disabled:opacity-70"
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
          <div className="bg-white p-4 rounded-xl text-sm text-gray-500 border border-gray-100">
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
          <div className="bg-white p-4 rounded-xl text-sm text-gray-500 border border-gray-100">
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
                className="w-full text-left flex items-center gap-4 bg-white p-3 rounded-xl justify-between shadow-sm border border-gray-100"
                onClick={() => handleToggle(s.dni)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`h-11 w-11 rounded-full flex items-center justify-center border ${isPresent
                      ? 'bg-green-50 border-green-200 text-green-700'
                      : 'bg-red-50 border-red-200 text-red-700'
                      }`}
                  >
                    <span className="material-symbols-outlined">
                      {isPresent ? 'done' : 'close'}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[#1b0d0d] text-base font-semibold leading-tight truncate">
                      {s.firstName} {s.lastName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">DNI: {s.dni}</p>
                  </div>
                </div>
                <div className="shrink-0">
                  <span
                    className={`text-xs font-bold rounded-full px-2 py-1 border ${isPresent
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

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-md border-t border-gray-100 z-30">
        <div className="w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto">
          <button
            className="w-full bg-primary hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
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
