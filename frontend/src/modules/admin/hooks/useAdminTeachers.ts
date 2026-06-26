import { useEffect, useState } from 'react';
import { httpClient } from '../../../core/api/httpClient';

export type AdminTeacher = {
  id: string; firstName: string; lastName: string;
  email?: string | null; phone?: string | null;
  userId?: string;
  dni?: string;
  status?: string;
  mustChangePassword?: boolean;
  studentCount?: number;
  students?: Array<{
    dni: string;
    firstName: string;
    lastName: string;
    classGroup?: { id: number; name: string } | null;
    gym?: { id: number; name: string } | null;
  }>;
};

export type TeacherForm = { firstName: string; lastName: string; email: string; phone: string; };
export type CreateTeacherForm = TeacherForm & { dni: string; password: string; };

export const emptyForm: TeacherForm = { firstName: '', lastName: '', email: '', phone: '' };
export const emptyCreateForm: CreateTeacherForm = { ...emptyForm, dni: '', password: '' };

export function useAdminTeachers() {
  const [teachers, setTeachers] = useState<AdminTeacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateTeacherForm>(emptyCreateForm);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const loadTeachers = async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(pageSize) });
      if (query.trim()) params.set('search', query.trim());
      
      const response = await httpClient.request(`/teachers?${params.toString()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error((await response.json().catch(() => ({}))).message ?? 'No se pudo cargar el listado.');
      
      const payload = await response.json();
      const list = Array.isArray(payload) ? payload : payload?.items ?? payload?.data ?? [];
      setTeachers(list);
      setTotal(Array.isArray(payload) ? list.length : (payload?.meta?.total ?? payload?.total ?? list.length));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el listado.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTeachers(); }, [page, query]);
  useEffect(() => { setPage(1); }, [query]);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setCreating(true); setError(''); setCreateError('');
    try {
      const payload = {
        role: 'TEACHER', dni: createForm.dni.trim(), password: createForm.password.trim() || undefined,
        firstName: createForm.firstName.trim(), lastName: createForm.lastName.trim(),
        email: createForm.email.trim() || null, phone: createForm.phone.trim() || null,
      };
      const res = await httpClient.request('/teachers', { method: 'POST', json: true, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? 'No se pudo crear el profesor.');
      setCreateOpen(false); setCreateForm(emptyCreateForm);
      await loadTeachers();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'No se pudo crear el profesor.');
    } finally {
      setCreating(false);
    }
  };

  return {
    teachers, loading, error, query, setQuery, page, setPage, total, pageSize,
    createOpen, setCreateOpen, createForm, setCreateForm, creating, createError, handleCreate
  };
}
