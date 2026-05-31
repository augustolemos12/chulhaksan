import { useEffect, useMemo, useState } from 'react';
import { httpClient } from '../../../core/api/httpClient';

export type AttendanceRow = {
  id: string; date: string; present: boolean;
  notes: string | null; classGroup?: { name: string } | null;
};

export function useMyAttendance() {
  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError('');
      try {
        const res = await httpClient.request('/attendance', { cache: 'no-store' });
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? 'No se pudo cargar tu asistencia.');
        
        const data = await res.json() as AttendanceRow[];
        setRows(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar tu asistencia.');
        setRows([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = useMemo(() => {
    const total = rows.length;
    const present = rows.filter((r) => r.present).length;
    const absent = total - present;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    return { total, present, absent, percentage };
  }, [rows]);

  return { rows, loading, error, stats };
}
