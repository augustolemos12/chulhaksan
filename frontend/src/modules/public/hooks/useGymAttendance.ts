import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { httpClient } from '../../../core/api/httpClient';
import { authService, type UserProfile } from '../../auth/api/authService';

export type AttendanceStudent = {
  dni: string;
  firstName: string;
  lastName: string;
  category?: 'ADULT' | 'CHILD';
  present: boolean;
  notes: string | null;
  marked: boolean;
};

export type AttendanceResponse = {
  gym: { id: string; name: string };
  date: string;
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

export function todayLocalISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function normalizeDateInput(raw: string) {
  const trimmed = (raw ?? '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const m = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) {
    const dd = m[1];
    const mm = m[2];
    const yyyy = m[3];
    return `${yyyy}-${mm}-${dd}`;
  }
  return trimmed;
}

export function useGymAttendance() {
  const { gymId } = useParams();
  const [profile] = useState<UserProfile | null>(authService.getCurrentProfile());

  const [date, setDate] = useState(todayLocalISO());
  const [data, setData] = useState<AttendanceResponse | null>(null);
  const [working, setWorking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [planClassesInput, setPlanClassesInput] = useState('8');
  const [savingPlan, setSavingPlan] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'ADULT' | 'CHILD'>('ALL');
  const [presentByDni, setPresentByDni] = useState<Record<string, boolean>>({});

  const load = async () => {
    if (!gymId) return;
    const apiDate = normalizeDateInput(date);
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await httpClient.request(`/attendance/gym/${gymId}?date=${encodeURIComponent(apiDate)}`, {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? 'No se pudo cargar la asistencia.');
      }
      const json = (await res.json()) as AttendanceResponse;
      setData(json);
      setPlanClassesInput(String(json.monthlyPlan?.classesPlanned ?? 8));

      if (apiDate !== date) setDate(apiDate);

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
    const next: Record<string, boolean> = {};
    for (const s of filteredStudents) next[s.dni] = true;
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

      const res = await httpClient.request(`/attendance/gym/${gymId}?date=${encodeURIComponent(apiDate)}`, {
        method: 'PUT',
        body: JSON.stringify({ items }),
      });
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
      const res = await httpClient.request(`/attendance/gym/${gymId}/plan?date=${encodeURIComponent(apiDate)}`, {
        method: 'PUT',
        body: JSON.stringify({ classesPlanned }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? 'No se pudo guardar el plan mensual.');
      }

      const json = await res.json() as any;

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

  return {
    profile, gymId, date, setDate,
    data, working, loading, error, success,
    planClassesInput, setPlanClassesInput, savingPlan,
    categoryFilter, setCategoryFilter,
    presentByDni, filteredStudents, summary,
    handleToggle, handleMarkAllPresent, handleSave, handleSaveMonthlyPlan
  };
}
