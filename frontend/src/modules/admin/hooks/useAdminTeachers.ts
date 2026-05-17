import { useEffect, useState } from 'react';
import { httpClient } from '../../../core/api/httpClient';

export type AdminTeacher = {
  id: string; firstName: string; lastName: string;
  email?: string | null; phone?: string | null; birthDate?: string | null; address?: string | null; gyms?: string[] | null;
  user?: { id: string; dni?: string; status: string; };
};

export type TeacherForm = { firstName: string; lastName: string; email: string; phone: string; birthDate: string; address: string; gyms: string; };
export type CreateTeacherForm = TeacherForm & { dni: string; password: string; };

export const emptyForm: TeacherForm = { firstName: '', lastName: '', email: '', phone: '', birthDate: '', address: '', gyms: '' };
export const emptyCreateForm: CreateTeacherForm = { ...emptyForm, dni: '', password: '' };

export function useAdminTeachers() {
  const [teachers, setTeachers] = useState<AdminTeacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 5;

  const [editing, setEditing] = useState<AdminTeacher | null>(null);
  const [form, setForm] = useState<TeacherForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateTeacherForm>(emptyCreateForm);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const [resetInfo, setResetInfo] = useState('');
  const [resetting, setResetting] = useState(false);

  const loadTeachers = async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(pageSize) });
      if (query.trim()) params.set('search', query.trim());
      
      const response = await httpClient.request(`/admin/teachers?${params.toString()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error((await response.json().catch(() => ({}))).message ?? 'No se pudo cargar el listado.');
      
      const payload = await response.json();
      const list = Array.isArray(payload) ? payload : payload?.data ?? [];
      setTeachers(list);
      setTotal(Array.isArray(payload) ? list.length : (payload?.total ?? list.length));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el listado.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTeachers(); }, [page, query]);
  useEffect(() => { setPage(1); }, [query]);

  const openEdit = (teacher: AdminTeacher) => {
    setEditing(teacher);
    setResetInfo('');
    setForm({
      firstName: teacher.firstName ?? '', lastName: teacher.lastName ?? '', email: teacher.email ?? '',
      phone: teacher.phone ?? '', birthDate: teacher.birthDate ? teacher.birthDate.split('T')[0] : '',
      address: teacher.address ?? '', gyms: teacher.gyms && teacher.gyms.length > 0 ? teacher.gyms.join(', ') : '',
    });
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    setSaving(true); setError(''); setEditError('');
    try {
      const payload = {
        firstName: form.firstName.trim(), lastName: form.lastName.trim(), email: form.email.trim() || null,
        phone: form.phone.trim() || null, birthDate: form.birthDate.trim() || null, address: form.address.trim() || null,
        gyms: form.gyms.trim() ? form.gyms.split(',').map((item) => item.trim()).filter(Boolean) : null,
      };
      const res = await httpClient.request(`/admin/teachers/${editing.id}`, { method: 'PATCH', json: true, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? 'No se pudo guardar el profesor.');
      setEditing(null); setForm(emptyForm); setResetInfo('');
      await loadTeachers();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'No se pudo guardar el profesor.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setCreating(true); setError(''); setCreateError('');
    try {
      const gymsList = createForm.gyms.split(',').map((item) => item.trim()).filter(Boolean);
      const payload = {
        role: 'TEACHER', dni: createForm.dni.trim(), password: createForm.password.trim(),
        firstName: createForm.firstName.trim(), lastName: createForm.lastName.trim(),
        email: createForm.email.trim() || null, phone: createForm.phone.trim(),
        birthDate: createForm.birthDate.trim(), address: createForm.address.trim() || null,
        gyms: gymsList,
      };
      const res = await httpClient.request('/admin/users', { method: 'POST', json: true, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? 'No se pudo crear el profesor.');
      setCreateOpen(false); setCreateForm(emptyCreateForm);
      await loadTeachers();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'No se pudo crear el profesor.');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (teacher: AdminTeacher) => {
    if (!confirm(`Eliminar profesor ${teacher.firstName} ${teacher.lastName}?`)) return;
    setError('');
    try {
      const res = await httpClient.request(`/admin/teachers/${teacher.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? 'No se pudo eliminar el profesor.');
      await loadTeachers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el profesor.');
    }
  };

  const handleResetPassword = async () => {
    if (!editing?.user?.id) return setEditError('No se pudo identificar el usuario.');
    if (!confirm('¿Querés resetear la contraseña de este profesor?')) return;
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
    teachers, loading, error, query, setQuery, page, setPage, total, pageSize,
    editing, setEditing, form, setForm, saving, editError, handleSave, openEdit,
    createOpen, setCreateOpen, createForm, setCreateForm, creating, createError, handleCreate,
    handleDelete, handleResetPassword, resetInfo, setResetInfo, resetting
  };
}
