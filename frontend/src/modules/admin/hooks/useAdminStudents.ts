import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { httpClient } from '../../../core/api/httpClient';

export type AdminStudent = {
  id: number; dni: string; gymId: number | null; teacherId: number | null; firstName: string; lastName: string; category?: 'ADULT' | 'CHILD';
  email?: string | null; phone?: string | null; gym?: { id: number; name: string; } | null;
  address?: string | null; classGroup?: { id: number; name: string; } | null;
  assignments?: { teacher?: { id: string; firstName: string; lastName: string; } | null; }[];
  user?: { id: string; status: string; };
};

export type AdminTeacherOption = { id: string; firstName: string; lastName: string; user?: { status: string; }; };
export type GymOption = { id: string; name: string; isArchived?: boolean; };
export type ClassGroupOption = { id: number; name: string; isActive: boolean; gymId: number; teacherId: number; };
export type StudentForm = { gymId: string; teacherId: string; firstName: string; lastName: string; email: string; phone: string; classGroupId: string; category: 'ADULT' | 'CHILD'; address: string; };
export type CreateStudentForm = StudentForm & { dni: string; password: string; currentBelt: string; };

export const emptyForm: StudentForm = { gymId: '', teacherId: '', firstName: '', lastName: '', email: '', phone: '', classGroupId: '', category: 'ADULT', address: '' };
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



  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateStudentForm>(emptyCreateForm);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

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
          httpClient.request('/gyms?limit=100', { cache: 'no-store' }),
          httpClient.request('/class-groups?limit=100', { cache: 'no-store' })
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

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setCreating(true); setError(''); setCreateError('');
    try {
      const res = await httpClient.request('/students', {
        method: 'POST', json: true, body: JSON.stringify({
          dni: createForm.dni.trim(), password: createForm.password.trim() || undefined,
          firstName: createForm.firstName.trim() || null, lastName: createForm.lastName.trim() || null,
          category: createForm.category || null, email: createForm.email.trim() || null,
          phone: createForm.phone.trim() || null,
          classGroupId: createForm.classGroupId ? Number(createForm.classGroupId) : null,
          address: createForm.address.trim() || null,
          currentBelt: createForm.currentBelt || 'WHITE',
          gymId: createForm.gymId ? Number(createForm.gymId) : 1,
          teacherId: createForm.teacherId ? Number(createForm.teacherId) : 1
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
  return {
    students, total, loading, error, query, setQuery, gymFilter, setGymFilter, categoryFilter, setCategoryFilter,
    page, setPage, pageSize, gyms, classGroups, activeTeachers, searchParams, setSearchParams,
    createOpen, setCreateOpen, createForm, setCreateForm, creating, createError, handleCreate
  };
}
