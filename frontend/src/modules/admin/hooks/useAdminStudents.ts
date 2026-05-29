import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { httpClient } from '../../../core/api/httpClient';

export type AdminStudent = {
  id: number; dni: string; gymId: string | null; firstName: string; lastName: string; category?: 'ADULT' | 'CHILD';
  email?: string | null; phone?: string | null; gym?: { id: number; name: string; } | null;
  address?: string | null; classGroup?: { id: number; name: string; } | null;
  assignments?: { teacher?: { id: string; firstName: string; lastName: string; } | null; }[];
  user?: { id: string; status: string; };
};

export type AdminTeacherOption = { id: string; firstName: string; lastName: string; user?: { status: string; }; };
export type StudentForm = { firstName: string; lastName: string; email: string; phone: string; classGroupId: string; category: 'ADULT' | 'CHILD'; address: string; };
export type CreateStudentForm = StudentForm & { dni: string; password: string; currentBelt: string; };

export const emptyForm: StudentForm = { firstName: '', lastName: '', email: '', phone: '', classGroupId: '', category: 'ADULT', address: '' };
export const emptyCreateForm: CreateStudentForm = { ...emptyForm, dni: '', password: '', currentBelt: 'WHITE' };

export function useAdminStudents() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [teachers, setTeachers] = useState<AdminTeacherOption[]>([]);
  const [gyms, setGyms] = useState<GymOption[]>([]);
  const [classGroups, setClassGroups] = useState<ClassGroupOption[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [gymFilter, setGymFilter] = useState(searchParams.get('gymId') ?? '');
  const [categoryFilter, setCategoryFilter] = useState((searchParams.get('category') as 'ADULT' | 'CHILD' | null) ?? '');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  const [editing, setEditing] = useState<AdminStudent | null>(null);
  const [form, setForm] = useState<StudentForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateStudentForm>(emptyCreateForm);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const [resetInfo, setResetInfo] = useState('');
  const [resetting, setResetting] = useState(false);

  const loadStudents = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(pageSize) });
      if (query.trim()) params.set('search', query.trim());
      if (gymFilter) params.set('gymId', gymFilter);
      if (categoryFilter) params.set('category', categoryFilter);

      const response = await httpClient.request(`/students?${params.toString()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error((await response.json().catch(() => ({}))).message ?? 'No se pudo cargar el listado.');
      
      const payload = await response.json();
      const list = Array.isArray(payload) ? payload : payload?.items ?? payload?.data ?? [];
      setStudents(list);
      setTotal(Array.isArray(payload) ? list.length : (payload?.meta?.total ?? payload?.total ?? list.length));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el listado.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initData = async () => {
      try {
        const [tRes, gRes, cRes] = await Promise.all([
          httpClient.request('/teachers?page=1&limit=100', { cache: 'no-store' }),
          httpClient.request('/gyms', { cache: 'no-store' }),
          httpClient.request('/class-groups', { cache: 'no-store' })
        ]);
        if (tRes.ok) {
          const tData = await tRes.json();
          setTeachers(Array.isArray(tData) ? tData : tData?.items ?? tData?.data ?? []);
        }
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
    initData();
  }, []);

  useEffect(() => { loadStudents(); }, [page, query, gymFilter, categoryFilter]);
  useEffect(() => { setPage(1); }, [query, gymFilter, categoryFilter]);

  useEffect(() => {
    const gymId = searchParams.get('gymId') ?? '';
    if (gymId !== gymFilter) setGymFilter(gymId);
    const category = (searchParams.get('category') as 'ADULT' | 'CHILD' | null) ?? '';
    if (category !== categoryFilter) setCategoryFilter(category);
  }, [searchParams]);

  const activeTeachers = useMemo(() => teachers.filter(t => !t.user?.status || t.user.status === 'ACTIVE'), [teachers]);

  const openEdit = (student: AdminStudent) => {
    setEditing(student);
    setForm({
      firstName: student.firstName ?? '', lastName: student.lastName ?? '', email: student.email ?? '',
      phone: student.phone ?? '', classGroupId: student.classGroup ? String(student.classGroup.id) : '',
      category: student.category ?? 'ADULT', address: student.address ?? '',
    });
    setResetInfo('');
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
      };
      const res = await httpClient.request(`/students/${editing.id}`, { method: 'PATCH', json: true, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? 'No se pudo guardar el alumno.');
      
      setEditing(null); setForm(emptyForm); setResetInfo('');
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
      const res = await httpClient.request('/students', {
        method: 'POST', json: true, body: JSON.stringify({
          dni: createForm.dni.trim(), password: createForm.password.trim(),
          firstName: createForm.firstName.trim() || null, lastName: createForm.lastName.trim() || null,
          category: createForm.category || null, email: createForm.email.trim() || null,
          phone: createForm.phone.trim() || null,
          classGroupId: createForm.classGroupId ? Number(createForm.classGroupId) : null,
          address: createForm.address.trim() || null,
          currentBelt: createForm.currentBelt || 'WHITE',
          gymId: 1, teacherId: 1 // Dummy values para satisfacer DTO (el backend los pisa)
        })
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? 'No se pudo crear el alumno.');
      
      setCreateOpen(false); setCreateForm(emptyCreateForm);
      await loadStudents();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'No se pudo crear el alumno.');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (student: AdminStudent) => {
    if (!confirm(`Eliminar alumno ${student.firstName} ${student.lastName}?`)) return;
    setError('');
    try {
      const res = await httpClient.request(`/students/${student.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? 'No se pudo eliminar el alumno.');
      await loadStudents();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el alumno.');
    }
  };

  const handleResetPassword = async () => {
    if (!editing?.user?.id) return setEditError('No se pudo identificar el usuario.');
    if (!confirm('¿Querés resetear la contraseña de este alumno?')) return;
    setResetting(true); setEditError('');
    try {
      const res = await httpClient.request(`/auth/admin/users/${editing.user.id}/reset-password`, { method: 'POST' });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? 'No se pudo resetear la contraseña.');
      const data = await res.json() as { temporaryPassword?: string };
      if (!data?.temporaryPassword) throw new Error('No se recibió la contraseña temporal.');
      setResetInfo(data.temporaryPassword);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'No se pudo resetear la contraseña.');
    } finally {
      setResetting(false);
    }
  };

  return {
    students, total, loading, error, query, setQuery, gymFilter, setGymFilter, categoryFilter, setCategoryFilter,
    page, setPage, pageSize, gyms, classGroups, activeTeachers, searchParams, setSearchParams,
    editing, setEditing, form, setForm, saving, editError, handleSave, openEdit,
    createOpen, setCreateOpen, createForm, setCreateForm, creating, createError, handleCreate,
    handleDelete, handleResetPassword, resetInfo, setResetInfo, resetting
  };
}
