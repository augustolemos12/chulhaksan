import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { httpClient } from '../../../core/api/httpClient';

export type AdminStudent = {
  dni: string; gymId: string | null; firstName: string; lastName: string; category?: 'ADULT' | 'CHILD';
  email?: string | null; phone?: string | null; guardianPhone?: string | null; gym?: string | null;
  birthDate?: string | null; address?: string | null;
  assignments?: { teacher?: { id: string; firstName: string; lastName: string; } | null; }[];
  user?: { id: string; status: string; };
};

export type AdminTeacherOption = { id: string; firstName: string; lastName: string; user?: { status: string; }; };
export type StudentForm = { firstName: string; lastName: string; email: string; phone: string; guardianPhone: string; gymId: string; category: 'ADULT' | 'CHILD'; birthDate: string; address: string; };
export type CreateStudentForm = StudentForm & { dni: string; password: string; };
export type GymOption = { id: string; name: string; isArchived?: boolean; };

export const emptyForm: StudentForm = { firstName: '', lastName: '', email: '', phone: '', guardianPhone: '', gymId: '', category: 'ADULT', birthDate: '', address: '' };
export const emptyCreateForm: CreateStudentForm = { ...emptyForm, dni: '', password: '' };

export function useAdminStudents() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [teachers, setTeachers] = useState<AdminTeacherOption[]>([]);
  const [gyms, setGyms] = useState<GymOption[]>([]);
  
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
  const [assignedTeacherId, setAssignedTeacherId] = useState('');
  const [initialTeacherId, setInitialTeacherId] = useState('');
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateStudentForm>(emptyCreateForm);
  const [createAssignedTeacherId, setCreateAssignedTeacherId] = useState('');
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

      const response = await httpClient.request(`/admin/students?${params.toString()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error((await response.json().catch(() => ({}))).message ?? 'No se pudo cargar el listado.');
      
      const payload = await response.json();
      const list = Array.isArray(payload) ? payload : payload?.data ?? [];
      setStudents(list);
      setTotal(Array.isArray(payload) ? list.length : (payload?.total ?? list.length));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el listado.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initData = async () => {
      try {
        const [tRes, gRes] = await Promise.all([
          httpClient.request('/admin/teachers?page=1&limit=100', { cache: 'no-store' }),
          httpClient.request('/gyms', { cache: 'no-store' })
        ]);
        if (tRes.ok) {
          const tData = await tRes.json();
          setTeachers(Array.isArray(tData) ? tData : tData?.data ?? []);
        }
        if (gRes.ok) {
          const gData = await gRes.json();
          setGyms(Array.isArray(gData) ? gData : []);
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
    const currentTeacherId = student.assignments?.[0]?.teacher?.id ?? '';
    setEditing(student);
    setForm({
      firstName: student.firstName ?? '', lastName: student.lastName ?? '', email: student.email ?? '',
      phone: student.phone ?? '', guardianPhone: student.guardianPhone ?? '', gymId: student.gymId ?? '',
      category: student.category ?? 'ADULT', birthDate: student.birthDate ? student.birthDate.split('T')[0] : '',
      address: student.address ?? '',
    });
    setAssignedTeacherId(currentTeacherId);
    setInitialTeacherId(currentTeacherId);
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
        guardianPhone: form.guardianPhone.trim() || null, gymId: form.gymId.trim() || null,
        category: form.category, birthDate: form.birthDate.trim() || null, address: form.address.trim() || null,
      };
      const res = await httpClient.request(`/admin/students/${editing.dni}`, { method: 'PATCH', json: true, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? 'No se pudo guardar el alumno.');
      
      if (assignedTeacherId !== initialTeacherId) {
        const endpoint = assignedTeacherId ? `/admin/students/${editing.dni}/assign` : `/admin/students/${editing.dni}/unassign`;
        const assignRes = await httpClient.request(endpoint, { method: 'POST', json: !!assignedTeacherId, body: assignedTeacherId ? JSON.stringify({ teacherId: assignedTeacherId }) : undefined });
        if (!assignRes.ok) throw new Error((await assignRes.json().catch(() => ({}))).message ?? 'No se pudo actualizar la asignación del profesor.');
      }
      setEditing(null); setForm(emptyForm); setAssignedTeacherId(''); setInitialTeacherId(''); setResetInfo(''); setCreateAssignedTeacherId('');
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
      const res = await httpClient.request('/admin/users', {
        method: 'POST', json: true, body: JSON.stringify({
          role: 'STUDENT', dni: createForm.dni.trim(), password: createForm.password.trim(),
          firstName: createForm.firstName.trim() || null, lastName: createForm.lastName.trim() || null,
          category: createForm.category || null, email: createForm.email.trim() || null,
          phone: createForm.phone.trim() || null, guardianPhone: createForm.guardianPhone.trim() || null,
          gymId: createForm.gymId.trim() || null, birthDate: createForm.birthDate.trim() || null,
          address: createForm.address.trim() || null,
        })
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? 'No se pudo crear el alumno.');
      
      if (createAssignedTeacherId) {
        const assignRes = await httpClient.request(`/admin/students/${createForm.dni.trim()}/assign`, {
          method: 'POST', json: true, body: JSON.stringify({ teacherId: createAssignedTeacherId })
        });
        if (!assignRes.ok) throw new Error((await assignRes.json().catch(() => ({}))).message ?? 'Alumno creado, pero no se pudo asignar el profesor.');
      }
      setCreateOpen(false); setCreateForm(emptyCreateForm); setCreateAssignedTeacherId('');
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
      const res = await httpClient.request(`/admin/students/${student.dni}`, { method: 'DELETE' });
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
      const res = await httpClient.request(`/admin/users/${editing.user.id}/reset-password`, { method: 'POST' });
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
    page, setPage, pageSize, gyms, activeTeachers, searchParams, setSearchParams,
    editing, setEditing, form, setForm, assignedTeacherId, setAssignedTeacherId, initialTeacherId, saving, editError, handleSave, openEdit,
    createOpen, setCreateOpen, createForm, setCreateForm, createAssignedTeacherId, setCreateAssignedTeacherId, creating, createError, handleCreate,
    handleDelete, handleResetPassword, resetInfo, setResetInfo, resetting
  };
}
