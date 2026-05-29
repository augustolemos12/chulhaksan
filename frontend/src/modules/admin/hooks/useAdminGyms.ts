import { useEffect, useMemo, useState } from 'react';
import { httpClient } from '../../../core/api/httpClient';

export type GymItem = { id: string; name: string; isArchived: boolean; studentsCount: number; };

export function useAdminGyms() {
  const [gyms, setGyms] = useState<GymItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [name, setName] = useState('');
  const [query, setQuery] = useState('');
  
  const [gymToDelete, setGymToDelete] = useState<GymItem | null>(null);
  const [targetGymId, setTargetGymId] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const res = await httpClient.request('/gyms', { cache: 'no-store' });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? 'No se pudo cargar el listado.');
      
      const payload = await res.json();
      const list = Array.isArray(payload) ? payload : payload?.items ?? payload?.data ?? [];
      setGyms(list.filter((g: any) => !g.isArchived));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el listado.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const totalStudents = useMemo(() => gyms.reduce((acc, gym) => acc + (gym.studentsCount ?? 0), 0), [gyms]);

  const filteredGyms = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return gyms;
    return gyms.filter((gym) => gym.name.toLowerCase().includes(search));
  }, [gyms, query]);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return false;
    setCreating(true); setError('');
    try {
      const res = await httpClient.request('/gyms', { method: 'POST', json: true, body: JSON.stringify({ name: trimmed }) });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? 'No se pudo crear el gimnasio.');
      setName(''); await load();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el gimnasio.');
      return false;
    } finally {
      setCreating(false);
    }
  };

  const handleRename = async (gym: GymItem) => {
    const next = window.prompt(`Renombrar "${gym.name}"`, gym.name)?.trim();
    if (!next || next === gym.name) return;
    setError('');
    try {
      const res = await httpClient.request(`/gyms/${gym.id}`, { method: 'PATCH', json: true, body: JSON.stringify({ name: next }) });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? 'No se pudo renombrar el gimnasio.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo renombrar el gimnasio.');
    }
  };

  const openDeleteModal = (gym: GymItem) => {
    if (gym.isArchived) return setError('Ese gimnasio ya está archivado.');
    setGymToDelete(gym); setTargetGymId(''); setError('');
  };

  const closeDeleteModal = () => {
    setGymToDelete(null); setTargetGymId('');
  };

  const handleDeleteGym = async () => {
    if (!gymToDelete || deleting) return;
    setDeleting(true); setError('');
    try {
      const res = await httpClient.request(`/gyms/${gymToDelete.id}`, {
        method: 'DELETE', json: true, body: JSON.stringify(targetGymId ? { targetGymId } : {})
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? 'No se pudo eliminar el gimnasio.');
      closeDeleteModal(); await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el gimnasio.');
    } finally {
      setDeleting(false);
    }
  };

  return {
    gyms, loading, error, query, setQuery, name, setName, creating, handleCreate, handleRename,
    totalStudents, filteredGyms, openDeleteModal, closeDeleteModal, handleDeleteGym, gymToDelete, targetGymId, setTargetGymId, deleting
  };
}
