import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { httpClient } from '../../../core/api/httpClient';

export type StudentItem = {
  id: number; dni: string; firstName: string; lastName: string;
  category?: 'ADULT' | 'CHILD'; gymId?: string; gym?: { id: number; name: string } | null;
  classGroup?: { id: number; name: string } | null;
  email?: string | null; phone?: string | null; address?: string | null;
  currentBelt?: string;
};

export type StudentWithStatus = StudentItem & { status: 'OK' | 'DEBT' | 'UNKNOWN'; };

export type StudentForm = { firstName: string; lastName: string; email: string; phone: string; classGroupId: string; category: 'ADULT' | 'CHILD'; address: string; currentBelt: string; };
export type CreateStudentForm = StudentForm & { dni: string; password: string; };

export const emptyForm: StudentForm = { firstName: '', lastName: '', email: '', phone: '', classGroupId: '', category: 'ADULT', address: '', currentBelt: 'WHITE' };
export const emptyCreateForm: CreateStudentForm = { ...emptyForm, dni: '', password: '' };

export type GymOption = { id: string; name: string; isArchived?: boolean; };
export type ClassGroupOption = { id: number; name: string; isActive: boolean; gymId: string; };

export function useTeacherStudents() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [assigned, setAssigned] = useState<StudentWithStatus[]>([]);
  const [gyms, setGyms] = useState<GymOption[]>([]);
  const [classGroups, setClassGroups] = useState<ClassGroupOption[]>([]);
  
  const [query, setQuery] = useState(searchParams.get('search') ?? '');
  const [gymFilter, setGymFilter] = useState(searchParams.get('gymId') ?? '');
  const [categoryFilter, setCategoryFilter] = useState((searchParams.get('category') as 'ADULT' | 'CHILD' | null) ?? '');
  const [classGroupFilter, setClassGroupFilter] = useState(searchParams.get('classGroupId') ?? '');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [editing, setEditing] = useState<StudentWithStatus | null>(null);
  const [form, setForm] = useState<StudentForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateStudentForm>(emptyCreateForm);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  
  const [page, setPage] = useState(Math.max(1, Number(searchParams.get('page') ?? '1')));
  const pageSize = 10;
  const [total, setTotal] = useState(0);

  const loadInitialData = async () => {
    try {
      const [gRes, cRes] = await Promise.all([
        httpClient.request('/gyms/my?limit=100', { cache: 'no-store' }),
        httpClient.request('/class-groups/my-groups', { cache: 'no-store' })
      ]);
      if (gRes.ok) {
        const gData = await gRes.json();
        setGyms(Array.isArray(gData) ? gData : gData?.items ?? gData?.data ?? []);
      }
      if (cRes.ok) {
        const cData = await cRes.json();
        setClassGroups(Array.isArray(cData) ? cData : cData?.items ?? cData?.data ?? []);
      }
    } catch {}
  };

  const loadStudents = async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(pageSize) });
      if (query.trim()) params.set('search', query.trim());
      if (gymFilter) params.set('gymId', gymFilter);
      if (categoryFilter) params.set('category', categoryFilter);
      if (classGroupFilter) params.set('classGroupId', classGroupFilter);

      const res = await httpClient.request(`/teachers/me/students?${params.toString()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? 'No se pudo cargar el listado.');

      const payload = await res.json();
      const data = Array.isArray(payload) ? payload : payload?.items ?? payload?.data ?? [];
      const total = Array.isArray(payload) ? data.length : payload?.total ?? data.length;

      const baseAssigned = (data ?? []).map((s: any) => ({ ...s, status: 'UNKNOWN' as const }));
      setAssigned(baseAssigned);
      setTotal(total);

      const statusResults = await Promise.all(
        baseAssigned.map(async (student: any) => {
          const feeRes = await httpClient.request(`/fees/student/${student.id}`);
          if (!feeRes.ok) return { dni: student.dni, status: 'UNKNOWN' as const };
          const fees = await feeRes.json();
          const hasDebt = Array.isArray(fees) ? fees.some((fee) => fee.status === 'PENDING') : false;
          return { dni: student.dni, status: hasDebt ? 'DEBT' : 'OK' };
        })
      );

      setAssigned((current) => current.map((student) => {
        const match = statusResults.find((item) => item.dni === student.dni);
        return match ? { ...student, status: match.status as 'OK' | 'DEBT' | 'UNKNOWN' } : student;
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el listado.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStudents(); }, [page, query, gymFilter, categoryFilter, classGroupFilter]);
  useEffect(() => { loadInitialData(); }, []);
  useEffect(() => { setPage(1); }, [query, gymFilter, categoryFilter, classGroupFilter]);

  useEffect(() => {
    const search = searchParams.get('search') ?? '';
    if (search !== query) setQuery(search);
    const gymId = searchParams.get('gymId') ?? '';
    if (gymId !== gymFilter) setGymFilter(gymId);
    const category = (searchParams.get('category') as 'ADULT' | 'CHILD' | null) ?? '';
    if (category !== categoryFilter) setCategoryFilter(category);
    const cGroupId = searchParams.get('classGroupId') ?? '';
    if (cGroupId !== classGroupFilter) setClassGroupFilter(cGroupId);
    const pageParam = Math.max(1, Number(searchParams.get('page') ?? '1'));
    if (!Number.isNaN(pageParam) && pageParam !== page) setPage(pageParam);
  }, [searchParams]);

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams);
    if (query.trim()) nextParams.set('search', query.trim()); else nextParams.delete('search');
    if (gymFilter) nextParams.set('gymId', gymFilter); else nextParams.delete('gymId');
    if (categoryFilter) nextParams.set('category', categoryFilter); else nextParams.delete('category');
    if (classGroupFilter) nextParams.set('classGroupId', classGroupFilter); else nextParams.delete('classGroupId');
    if (page > 1) nextParams.set('page', String(page)); else nextParams.delete('page');

    if (nextParams.toString() !== searchParams.toString()) setSearchParams(nextParams, { replace: true });
  }, [query, gymFilter, categoryFilter, classGroupFilter, page]);

  const openEdit = (student: StudentWithStatus) => {
    setEditing(student);
    setForm({
      firstName: student.firstName ?? '', lastName: student.lastName ?? '', email: student.email ?? '',
      phone: student.phone ?? '', classGroupId: student.classGroup ? String(student.classGroup.id) : '',
      category: student.category ?? 'ADULT', address: student.address ?? '', currentBelt: student.currentBelt ?? 'WHITE',
    });
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    setSaving(true);
    setError(''); setEditError('');
    try {
      const payload = {
        firstName: form.firstName.trim() || null, lastName: form.lastName.trim() || null,
        email: form.email.trim() || null, phone: form.phone.trim() || null,
        classGroupId: form.classGroupId ? Number(form.classGroupId) : null,
        category: form.category, address: form.address.trim() || null,
        currentBelt: form.currentBelt || undefined,
      };
      const res = await httpClient.request(`/teacher/students/${editing.id}`, { method: 'PATCH', json: true, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? 'No se pudo guardar el alumno.');
      
      setEditing(null); setForm(emptyForm);
      await loadStudents();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'No se pudo guardar el alumno.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setCreating(true); setError(''); setCreateError('');
    try {
      const res = await httpClient.request('/teacher/students', {
        method: 'POST', json: true, body: JSON.stringify({
          dni: createForm.dni.replace(/\D/g, ''), password: createForm.password,
          firstName: createForm.firstName.trim() || null, lastName: createForm.lastName.trim() || null,
          email: createForm.email.trim() || null, phone: createForm.phone.trim() || null,
          classGroupId: createForm.classGroupId ? Number(createForm.classGroupId) : null,
          category: createForm.category || null, address: createForm.address.trim() || null,
          currentBelt: createForm.currentBelt || 'WHITE',
        })
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? 'No se pudo crear el alumno.');
      setCreateForm(emptyCreateForm); setCreateOpen(false); await loadStudents();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'No se pudo crear el alumno.');
    } finally {
      setCreating(false);
    }
  };

  return {
    students: assigned, gyms, classGroups, query, setQuery, gymFilter, setGymFilter, categoryFilter, setCategoryFilter, classGroupFilter, setClassGroupFilter,
    loading, error, createOpen, setCreateOpen, form, setForm, saving, createError,
    page, setPage, total, pageSize, handleCreate, handleSave, openEdit, editing, setEditing, editError, searchParams, setSearchParams, createForm, setCreateForm, creating
  };
}
