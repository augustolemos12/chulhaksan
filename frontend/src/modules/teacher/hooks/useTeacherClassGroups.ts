import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { httpClient } from '../../../core/api/httpClient';

export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export type ClassGroupItem = {
  id: number;
  name?: string;
  teacherId: number;
  gymId: number;
  category: 'ADULT' | 'CHILD';
  daysOfWeek: DayOfWeek[];
  startTime: string;
  endTime: string;
  isActive: boolean;
  teacher?: { id: number; firstName: string; lastName: string };
  gym?: { id: number; name: string };
};

export type ClassGroupForm = {
  name: string;
  gymId: string;
  category: 'ADULT' | 'CHILD';
  daysOfWeek: DayOfWeek[];
  startTime: string;
  endTime: string;
};

export const emptyForm: ClassGroupForm = {
  name: '',
  gymId: '',
  category: 'ADULT',
  daysOfWeek: [],
  startTime: '18:00',
  endTime: '19:00',
};

export function useTeacherClassGroups() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [classGroups, setClassGroups] = useState<ClassGroupItem[]>([]);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [gymFilter, setGymFilter] = useState(searchParams.get('gymId') ?? '');
  const [categoryFilter, setCategoryFilter] = useState((searchParams.get('category') as 'ADULT' | 'CHILD' | null) ?? '');
  
  const [page, setPage] = useState(Math.max(1, Number(searchParams.get('page') ?? '1')));
  const pageSize = 10;

  // Modals & Forms
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<ClassGroupForm>(emptyForm);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const [editing, setEditing] = useState<ClassGroupItem | null>(null);
  const [form, setForm] = useState<ClassGroupForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');

  // Dependencies
  const [gyms, setGyms] = useState<any[]>([]);

  const loadDependencies = async () => {
    try {
      const gymsRes = await httpClient.request('/gyms/my', { cache: 'no-store' });
      if (gymsRes.ok) {
        const payload = await gymsRes.json();
        setGyms(Array.isArray(payload) ? payload : payload?.items ?? payload?.data ?? []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadClassGroups = async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(pageSize) });
      if (gymFilter) params.set('gymId', gymFilter);
      if (categoryFilter) params.set('category', categoryFilter);

      const res = await httpClient.request(`/class-groups/my-groups?${params.toString()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Error al cargar comisiones');
      const payload = await res.json();
      const items = Array.isArray(payload) ? payload : (payload.items ?? payload.data ?? []);
      setClassGroups(items);
      setTotal(payload.meta?.total ?? items.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDependencies(); }, []);
  useEffect(() => { loadClassGroups(); }, [page, gymFilter, categoryFilter]);
  useEffect(() => { setPage(1); }, [gymFilter, categoryFilter]);

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams);
    if (gymFilter) nextParams.set('gymId', gymFilter); else nextParams.delete('gymId');
    if (categoryFilter) nextParams.set('category', categoryFilter); else nextParams.delete('category');
    if (page > 1) nextParams.set('page', String(page)); else nextParams.delete('page');

    if (nextParams.toString() !== searchParams.toString()) setSearchParams(nextParams, { replace: true });
  }, [gymFilter, categoryFilter, page]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true); setCreateError('');
    try {
      const res = await httpClient.request('/class-groups', {
        method: 'POST', json: true, body: JSON.stringify({
          name: createForm.name.trim() || null,
          gymId: Number(createForm.gymId),
          category: createForm.category,
          daysOfWeek: createForm.daysOfWeek,
          startTime: createForm.startTime,
          endTime: createForm.endTime,
        })
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? 'No se pudo crear');
      setCreateForm(emptyForm); setCreateOpen(false); await loadClassGroups();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Error al crear la comisión');
    } finally {
      setCreating(false);
    }
  };

  const openEdit = (cg: ClassGroupItem) => {
    setEditing(cg);
    setForm({
      name: cg.name ?? '',
      gymId: String(cg.gymId),
      category: cg.category,
      daysOfWeek: cg.daysOfWeek,
      startTime: cg.startTime,
      endTime: cg.endTime,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true); setEditError('');
    try {
      const payload = {
        name: form.name.trim() || null,
        gymId: Number(form.gymId),
        category: form.category,
        daysOfWeek: form.daysOfWeek,
        startTime: form.startTime,
        endTime: form.endTime,
      };
      const res = await httpClient.request(`/class-groups/${editing.id}`, { method: 'PATCH', json: true, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? 'Error al guardar');
      setEditing(null); setForm(emptyForm); await loadClassGroups();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cg: ClassGroupItem) => {
    if (!confirm('¿Seguro que deseas archivar/eliminar esta comisión?')) return;
    try {
      const res = await httpClient.request(`/class-groups/${cg.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? 'Error al eliminar');
      await loadClassGroups();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  return {
    classGroups, total, loading, error, gymFilter, setGymFilter, categoryFilter, setCategoryFilter,
    page, setPage, pageSize, gyms, searchParams, setSearchParams,
    createOpen, setCreateOpen, createForm, setCreateForm, creating, createError, handleCreate,
    editing, setEditing, form, setForm, saving, editError, handleSave, openEdit, handleDelete
  };
}
