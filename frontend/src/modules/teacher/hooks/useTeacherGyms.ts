import { useEffect, useMemo, useState } from 'react';
import { httpClient } from '../../../core/api/httpClient';

export type GymItem = { id: string; name: string; studentsCount: number; };

export function useTeacherGyms() {
  const [gyms, setGyms] = useState<GymItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const res = await httpClient.request('/teachers/me/gyms', { cache: 'no-store' });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? 'No se pudo cargar el listado.');
      
      const data = await res.json() as GymItem[];
      setGyms(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el listado.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const totalStudents = useMemo(() => gyms.reduce((acc, gym) => acc + (gym.studentsCount ?? 0), 0), [gyms]);

  return { gyms, loading, error, totalStudents };
}
