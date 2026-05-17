import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { httpClient } from '../../../core/api/httpClient';

export type StudentItem = {
  dni: string; firstName: string; lastName: string;
  category?: 'ADULT' | 'CHILD'; gymId?: string; gym?: string | null;
};

export type StudentWithStatus = StudentItem & { status: 'OK' | 'DEBT' | 'UNKNOWN'; };

export type CreateStudentForm = {
  firstName: string; lastName: string; dni: string; email: string;
  phone: string; guardianPhone: string; gymId: string;
  category: 'ADULT' | 'CHILD'; birthDate: string; address: string; password: string;
};

export const emptyForm: CreateStudentForm = {
  firstName: '', lastName: '', dni: '', email: '', phone: '', guardianPhone: '',
  gymId: '', category: 'ADULT', birthDate: '', address: '', password: '',
};

export type GymOption = { id: string; name: string; };

export function useTeacherStudents() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [assigned, setAssigned] = useState<StudentWithStatus[]>([]);
  const [gyms, setGyms] = useState<GymOption[]>([]);
  
  const [query, setQuery] = useState(searchParams.get('search') ?? '');
  const [gymFilter, setGymFilter] = useState(searchParams.get('gymId') ?? '');
  const [categoryFilter, setCategoryFilter] = useState((searchParams.get('category') as 'ADULT' | 'CHILD' | null) ?? '');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<CreateStudentForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [createError, setCreateError] = useState('');
  
  const [pageAssigned, setPageAssigned] = useState(Math.max(1, Number(searchParams.get('page') ?? '1')));
  const pageSize = 10;
  const [totalAssigned, setTotalAssigned] = useState(0);

  const loadGyms = async () => {
    try {
      const res = await httpClient.request('/gyms', { cache: 'no-store' });
      if (res.ok) setGyms(Array.isArray(await res.json()) ? await res.json() : []);
    } catch {}
  };

  const loadStudents = async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams({ page: String(pageAssigned), limit: String(pageSize) });
      if (query.trim()) params.set('search', query.trim());
      if (gymFilter) params.set('gymId', gymFilter);
      if (categoryFilter) params.set('category', categoryFilter);

      const res = await httpClient.request(`/teachers/me/students?${params.toString()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? 'No se pudo cargar el listado.');

      const payload = await res.json();
      const data = Array.isArray(payload) ? payload : payload?.data ?? [];
      const total = Array.isArray(payload) ? data.length : payload?.total ?? data.length;

      const baseAssigned = (data ?? []).map((s: any) => ({ ...s, status: 'UNKNOWN' as const }));
      setAssigned(baseAssigned);
      setTotalAssigned(total);

      const statusResults = await Promise.all(
        baseAssigned.map(async (student: any) => {
          const feeRes = await httpClient.request(`/fees/student/${student.dni}`);
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

  useEffect(() => { loadStudents(); }, [pageAssigned, query, gymFilter, categoryFilter]);
  useEffect(() => { loadGyms(); }, []);
  useEffect(() => { setPageAssigned(1); }, [query, gymFilter, categoryFilter]);

  useEffect(() => {
    const search = searchParams.get('search') ?? '';
    if (search !== query) setQuery(search);
    const gymId = searchParams.get('gymId') ?? '';
    if (gymId !== gymFilter) setGymFilter(gymId);
    const category = (searchParams.get('category') as 'ADULT' | 'CHILD' | null) ?? '';
    if (category !== categoryFilter) setCategoryFilter(category);
    const page = Math.max(1, Number(searchParams.get('page') ?? '1'));
    if (!Number.isNaN(page) && page !== pageAssigned) setPageAssigned(page);
  }, [searchParams]);

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams);
    if (query.trim()) nextParams.set('search', query.trim()); else nextParams.delete('search');
    if (gymFilter) nextParams.set('gymId', gymFilter); else nextParams.delete('gymId');
    if (categoryFilter) nextParams.set('category', categoryFilter); else nextParams.delete('category');
    if (pageAssigned > 1) nextParams.set('page', String(pageAssigned)); else nextParams.delete('page');

    if (nextParams.toString() !== searchParams.toString()) setSearchParams(nextParams, { replace: true });
  }, [query, gymFilter, categoryFilter, pageAssigned]);

  const handleCreateStudent = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true); setError(''); setCreateError('');
    try {
      const res = await httpClient.request('/teachers/me/students', {
        method: 'POST', json: true, body: JSON.stringify({
          dni: form.dni.replace(/\D/g, ''), password: form.password,
          firstName: form.firstName.trim() || null, lastName: form.lastName.trim() || null,
          email: form.email.trim() || null, phone: form.phone.trim() || null,
          guardianPhone: form.guardianPhone.trim() || null, gymId: form.gymId.trim() || null,
          category: form.category || null, birthDate: form.birthDate.trim() || null, address: form.address.trim() || null,
        })
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? 'No se pudo crear el alumno.');
      setForm(emptyForm); setCreateOpen(false); await loadStudents();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'No se pudo crear el alumno.');
    } finally {
      setSaving(false);
    }
  };

  return {
    assigned, gyms, query, setQuery, gymFilter, setGymFilter, categoryFilter, setCategoryFilter,
    loading, error, createOpen, setCreateOpen, form, setForm, saving, createError,
    pageAssigned, setPageAssigned, totalAssigned, pageSize, handleCreateStudent, searchParams
  };
}
