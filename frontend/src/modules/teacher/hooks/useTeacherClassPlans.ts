import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { httpClient } from '../../../core/api/httpClient';

export type ClassPlanItem = {
  id: number;
  classGroupId: number;
  month: number;
  year: number;
  totalClasses: number;
  classGroup?: {
    id: number;
    name: string;
    category: string;
    teacher?: { id: number; firstName: string; lastName: string };
    gym?: { id: number; name: string };
  };
};

export type ClassPlanForm = {
  gymId: string;
  classGroupId: string;
  month: string;
  year: string;
  totalClasses: string;
};

const currentMonth = new Date().getMonth() + 1;
const currentYear = new Date().getFullYear();

export const emptyForm: ClassPlanForm = {
  gymId: '',
  classGroupId: '',
  month: String(currentMonth),
  year: String(currentYear),
  totalClasses: '8',
};

export function useTeacherClassPlans() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [classPlans, setClassPlans] = useState<ClassPlanItem[]>([]);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [gymFilter, setGymFilter] = useState(searchParams.get('gymId') ?? '');
  const [classGroupFilter, setClassGroupFilter] = useState(searchParams.get('classGroupId') ?? '');
  const [monthFilter, setMonthFilter] = useState(searchParams.get('month') ?? '');
  const [yearFilter, setYearFilter] = useState(searchParams.get('year') ?? String(currentYear));
  
  const [page, setPage] = useState(Math.max(1, Number(searchParams.get('page') ?? '1')));
  const pageSize = 10;

  // Modals & Forms
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<ClassPlanForm>(emptyForm);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const [editing, setEditing] = useState<ClassPlanItem | null>(null);
  const [form, setForm] = useState<ClassPlanForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');

  // Dependencies
  const [classGroups, setClassGroups] = useState<any[]>([]);
  const [gyms, setGyms] = useState<any[]>([]);

  const loadDependencies = async () => {
    try {
      const [cgRes, gymsRes] = await Promise.all([
        httpClient.request('/class-groups/my-groups?limit=100', { cache: 'no-store' }),
        httpClient.request('/gyms/my?limit=100', { cache: 'no-store' })
      ]);

      if (cgRes.ok) {
        const data = await cgRes.json();
        setClassGroups(Array.isArray(data) ? data : data?.items ?? data?.data ?? []);
      }
      if (gymsRes.ok) {
        const gData = await gymsRes.json();
        setGyms(Array.isArray(gData) ? gData : gData?.items ?? gData?.data ?? []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadClassPlans = async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(pageSize) });
      if (gymFilter) params.set('gymId', gymFilter);
      if (classGroupFilter) params.set('classGroupId', classGroupFilter);
      if (monthFilter) params.set('month', monthFilter);
      if (yearFilter) params.set('year', yearFilter);

      const res = await httpClient.request(`/class-plans?${params.toString()}`);
      if (!res.ok) throw new Error('Error al cargar planes de clases');
      const payload = await res.json();

      setClassPlans(payload.items ?? payload.data ?? []);
      setTotal(payload.meta?.total ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDependencies(); }, []);
  useEffect(() => { loadClassPlans(); }, [page, classGroupFilter, monthFilter, yearFilter, gymFilter]);

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams);
    if (gymFilter) nextParams.set('gymId', gymFilter); else nextParams.delete('gymId');
    if (classGroupFilter) nextParams.set('classGroupId', classGroupFilter); else nextParams.delete('classGroupId');
    if (monthFilter) nextParams.set('month', monthFilter); else nextParams.delete('month');
    if (yearFilter) nextParams.set('year', yearFilter); else nextParams.delete('year');
    if (page > 1) nextParams.set('page', String(page)); else nextParams.delete('page');

    if (nextParams.toString() !== searchParams.toString()) setSearchParams(nextParams, { replace: true });
  }, [classGroupFilter, monthFilter, yearFilter, page, gymFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true); setCreateError('');
    try {
      const res = await httpClient.request('/class-plans', {
        method: 'POST', json: true, body: JSON.stringify({
          classGroupId: Number(createForm.classGroupId),
          month: Number(createForm.month),
          year: Number(createForm.year),
          totalClasses: Number(createForm.totalClasses),
        })
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? 'No se pudo crear');
      setCreateForm(emptyForm); setCreateOpen(false); await loadClassPlans();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Error al crear el plan');
    } finally {
      setCreating(false);
    }
  };

  const openEdit = (cp: ClassPlanItem) => {
    setEditing(cp);
    setForm({
      gymId: cp.classGroup?.gym?.id ? String(cp.classGroup.gym.id) : '',
      classGroupId: String(cp.classGroupId),
      month: String(cp.month),
      year: String(cp.year),
      totalClasses: String(cp.totalClasses),
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true); setEditError('');
    try {
      const payload = {
        classGroupId: Number(form.classGroupId),
        month: Number(form.month),
        year: Number(form.year),
        totalClasses: Number(form.totalClasses),
      };
      const res = await httpClient.request(`/class-plans/${editing.id}`, { method: 'PATCH', json: true, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? 'Error al guardar');
      setEditing(null); setForm(emptyForm); await loadClassPlans();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cp: ClassPlanItem) => {
    if (!confirm('¿Seguro que deseas eliminar este plan de clases?')) return;
    try {
      const res = await httpClient.request(`/class-plans/${cp.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? 'Error al eliminar');
      await loadClassPlans();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  return {
    classPlans, total, loading, error, gymFilter, setGymFilter, classGroupFilter, setClassGroupFilter, monthFilter, setMonthFilter, yearFilter, setYearFilter,
    page, setPage, pageSize, classGroups, gyms, searchParams, setSearchParams,
    createOpen, setCreateOpen, createForm, setCreateForm, creating, createError, handleCreate,
    editing, setEditing, form, setForm, saving, editError, handleSave, openEdit, handleDelete
  };
}
