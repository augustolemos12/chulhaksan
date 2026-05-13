import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiFetch } from '../auth/auth';

type AdminStudent = {
  dni: string;
  gymId: string | null;
  firstName: string;
  lastName: string;
  category?: 'ADULT' | 'CHILD';
  email?: string | null;
  phone?: string | null;
  guardianPhone?: string | null;
  gym?: string | null;
  birthDate?: string | null;
  address?: string | null;
  assignments?: {
    teacher?: {
      id: string;
      firstName: string;
      lastName: string;
    } | null;
  }[];
  user?: {
    id: string;
    status: string;
  };
};

type AdminTeacherOption = {
  id: string;
  firstName: string;
  lastName: string;
  user?: {
    status: string;
  };
};

type StudentForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  guardianPhone: string;
  gymId: string;
  category: 'ADULT' | 'CHILD';
  birthDate: string;
  address: string;
};

type CreateStudentForm = StudentForm & {
  dni: string;
  password: string;
};

type GymOption = {
  id: string;
  name: string;
  isArchived?: boolean;
};

const emptyForm: StudentForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  guardianPhone: '',
  gymId: '',
  category: 'ADULT',
  birthDate: '',
  address: '',
};

const emptyCreateForm: CreateStudentForm = {
  ...emptyForm,
  dni: '',
  password: '',
};

export function AdminStudents() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [teachers, setTeachers] = useState<AdminTeacherOption[]>([]);
  const [gyms, setGyms] = useState<GymOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [gymFilter, setGymFilter] = useState(searchParams.get('gymId') ?? '');
  const [categoryFilter, setCategoryFilter] = useState(
    (searchParams.get('category') as 'ADULT' | 'CHILD' | null) ?? '',
  );
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;
  const [editing, setEditing] = useState<AdminStudent | null>(null);
  const [form, setForm] = useState<StudentForm>(emptyForm);
  const [assignedTeacherId, setAssignedTeacherId] = useState('');
  const [initialTeacherId, setInitialTeacherId] = useState('');
  const [saving, setSaving] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateStudentForm>(emptyCreateForm);
  const [createAssignedTeacherId, setCreateAssignedTeacherId] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [editError, setEditError] = useState('');
  const [resetInfo, setResetInfo] = useState('');
  const [resetting, setResetting] = useState(false);
  const [copiedReset, setCopiedReset] = useState(false);

  const categoryLabel = (value?: 'ADULT' | 'CHILD') => {
    if (value === 'CHILD') return 'Infantil';
    return 'Adulto';
  };

  const loadStudents = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(pageSize),
      });
      if (query.trim()) {
        params.set('search', query.trim());
      }
      if (gymFilter) {
        params.set('gymId', gymFilter);
      }
      if (categoryFilter) {
        params.set('category', categoryFilter);
      }
      const response = await apiFetch(`/admin/students?${params.toString()}`, {
        method: 'GET',
        cache: 'no-store',
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message ?? 'No se pudo cargar el listado.');
      }
      const payload = (await response.json()) as
        | AdminStudent[]
        | { data?: AdminStudent[]; total?: number; page?: number; limit?: number };
      const list = Array.isArray(payload) ? payload : payload?.data ?? [];
      setStudents(list);
      if (!Array.isArray(payload)) {
        setTotal(payload?.total ?? list.length);
      } else {
        setTotal(list.length);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'No se pudo cargar el listado.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const loadTeachers = async () => {
    try {
      const response = await apiFetch('/admin/teachers?page=1&limit=100', {
        method: 'GET',
        cache: 'no-store',
      });
      if (!response.ok) {
        return;
      }
      const data =
        (await response.json()) as AdminTeacherOption[] | { data?: AdminTeacherOption[] };
      const list = Array.isArray(data) ? data : data?.data ?? [];
      setTeachers(list);
    } catch {
      // ignore
    }
  };

  const loadGyms = async () => {
    try {
      const response = await apiFetch('/gyms', { method: 'GET', cache: 'no-store' });
      if (!response.ok) return;
      const list = (await response.json()) as GymOption[];
      setGyms(Array.isArray(list) ? list : []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadTeachers();
    loadGyms();
  }, []);

  useEffect(() => {
    loadStudents();
  }, [page, query, gymFilter, categoryFilter]);

  useEffect(() => {
    setPage(1);
  }, [query, gymFilter, categoryFilter]);

  useEffect(() => {
    const gymId = searchParams.get('gymId') ?? '';
    if (gymId !== gymFilter) {
      setGymFilter(gymId);
    }
    const category = (searchParams.get('category') as 'ADULT' | 'CHILD' | null) ?? '';
    if (category !== categoryFilter) {
      setCategoryFilter(category);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageStart = Math.max(1, Math.min(page - 2, totalPages - 4));
  const pageEnd = Math.min(totalPages, pageStart + 4);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const activeTeachers = useMemo(
    () =>
      teachers.filter((teacher) => {
        if (!teacher.user?.status) return true;
        return teacher.user.status === 'ACTIVE';
      }),
    [teachers],
  );

  const openEdit = (student: AdminStudent) => {
    const currentTeacherId = student.assignments?.[0]?.teacher?.id ?? '';
    setEditing(student);
    setForm({
      firstName: student.firstName ?? '',
      lastName: student.lastName ?? '',
      email: student.email ?? '',
      phone: student.phone ?? '',
      guardianPhone: student.guardianPhone ?? '',
      gymId: student.gymId ?? '',
      category: student.category ?? 'ADULT',
      birthDate: student.birthDate ? student.birthDate.split('T')[0] : '',
      address: student.address ?? '',
    });
    setAssignedTeacherId(currentTeacherId);
    setInitialTeacherId(currentTeacherId);
    setResetInfo('');
  };

  const buildPayload = () => ({
    firstName: form.firstName.trim() || null,
    lastName: form.lastName.trim() || null,
    email: form.email.trim() || null,
    phone: form.phone.trim() || null,
    guardianPhone: form.guardianPhone.trim() || null,
    gymId: form.gymId.trim() || null,
    category: form.category,
    birthDate: form.birthDate.trim() || null,
    address: form.address.trim() || null,
  });

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    setSaving(true);
    setError('');
    setEditError('');
    try {
      const response = await apiFetch(`/admin/students/${editing.dni}`, {
        method: 'PATCH',
        json: true,
        body: JSON.stringify(buildPayload()),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message ?? 'No se pudo guardar el alumno.');
      }
      if (assignedTeacherId !== initialTeacherId) {
        const endpoint = assignedTeacherId
          ? `/admin/students/${editing.dni}/assign`
          : `/admin/students/${editing.dni}/unassign`;
        const assignResponse = await apiFetch(endpoint, {
          method: 'POST',
          json: !!assignedTeacherId,
          body: assignedTeacherId
            ? JSON.stringify({ teacherId: assignedTeacherId })
            : undefined,
        });
        if (!assignResponse.ok) {
          const body = await assignResponse.json().catch(() => ({}));
          throw new Error(
            body.message ?? 'No se pudo actualizar la asignación del profesor.',
          );
        }
      }
      setEditing(null);
      setForm(emptyForm);
      setAssignedTeacherId('');
      setInitialTeacherId('');
      setResetInfo('');
      setCreateAssignedTeacherId('');
      await loadStudents();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'No se pudo guardar el alumno.';
      setEditError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setCreating(true);
    setError('');
    setCreateError('');
    try {
      const response = await apiFetch('/admin/users', {
        method: 'POST',
        json: true,
          body: JSON.stringify({
            role: 'STUDENT',
            dni: createForm.dni.trim(),
            password: createForm.password.trim(),
            firstName: createForm.firstName.trim() || null,
            lastName: createForm.lastName.trim() || null,
            category: createForm.category || null,
            email: createForm.email.trim() || null,
            phone: createForm.phone.trim() || null,
            guardianPhone: createForm.guardianPhone.trim() || null,
            gymId: createForm.gymId.trim() || null,
            birthDate: createForm.birthDate.trim() || null,
            address: createForm.address.trim() || null,
          }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message ?? 'No se pudo crear el alumno.');
      }
      if (createAssignedTeacherId) {
        const assignResponse = await apiFetch(
          `/admin/students/${createForm.dni.trim()}/assign`,
          {
            method: 'POST',
            json: true,
            body: JSON.stringify({ teacherId: createAssignedTeacherId }),
          },
        );
        if (!assignResponse.ok) {
          const body = await assignResponse.json().catch(() => ({}));
          throw new Error(
            body.message ??
              'Alumno creado, pero no se pudo asignar el profesor.',
          );
        }
      }
      setCreateOpen(false);
      setCreateForm(emptyCreateForm);
      setCreateAssignedTeacherId('');
      await loadStudents();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'No se pudo crear el alumno.';
      setCreateError(message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (student: AdminStudent) => {
    if (!confirm(`Eliminar alumno ${student.firstName} ${student.lastName}?`)) {
      return;
    }
    setError('');
    try {
      const response = await apiFetch(`/admin/students/${student.dni}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message ?? 'No se pudo eliminar el alumno.');
      }
      await loadStudents();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'No se pudo eliminar el alumno.';
      setError(message);
    }
  };

  const handleResetPassword = async () => {
    if (!editing?.user?.id) {
      setEditError('No se pudo identificar el usuario.');
      return;
    }
    if (!confirm('¿Querés resetear la contraseña de este alumno?')) return;
    setResetting(true);
    setEditError('');
    try {
      const response = await apiFetch(
        `/admin/users/${editing.user.id}/reset-password`,
        {
          method: 'POST',
        },
      );
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message ?? 'No se pudo resetear la contraseña.');
      }
      const data = (await response.json()) as { temporaryPassword?: string };
      if (!data?.temporaryPassword) {
        throw new Error('No se recibió la contraseña temporal.');
      }
      setResetInfo(data.temporaryPassword);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'No se pudo resetear la contraseña.';
      setEditError(message);
    } finally {
      setResetting(false);
    }
  };

  const handleCopyReset = async () => {
    if (!resetInfo) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(resetInfo);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = resetInfo;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedReset(true);
      setTimeout(() => setCopiedReset(false), 1500);
    } catch {
      setCopiedReset(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center p-4 justify-between w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto">
          <Link
            className="text-text flex size-10 shrink-0 items-center justify-center"
            to="/dashboard"
          >
            <span className="material-symbols-outlined">arrow_back_ios</span>
          </Link>
          <h1 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10">
            Gestión de alumnos
          </h1>
          <button
            className="flex size-10 items-center justify-center"
            type="button"
            onClick={() => setCreateOpen(true)}
            aria-label="Crear alumno"
          >
            <span className="material-symbols-outlined">person_add</span>
          </button>
        </div>
      </header>

      <main className="w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto p-4 pb-24 space-y-4">
        <div className="bg-surface rounded-2xl border border-border shadow-soft p-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold">
              Total alumnos
            </p>
            <p className="text-2xl font-bold text-text">{total}</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">group</span>
          </div>
        </div>
        <label className="flex flex-col min-w-40 h-12 w-full">
          <div className="flex w-full flex-1 items-stretch rounded-xl h-full shadow-soft">
            <div className="text-[#9a4c4c] flex border-none bg-surface items-center justify-center pl-4 rounded-l-xl border-r-0">
              <span className="material-symbols-outlined">search</span>
            </div>
            <input
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-xl text-text focus:outline-0 focus:ring-0 border-none bg-surface focus:border-none h-full placeholder:text-[#9a4c4c] px-4 pl-2 text-base font-normal leading-normal"
              placeholder="Buscar por DNI o nombre"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </label>
        <div className="bg-surface rounded-2xl border border-border shadow-soft p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">folder</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold">
                Gimnasio
              </p>
              <select
                className="mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                value={gymFilter}
                onChange={(event) => {
                  const next = event.target.value;
                  setGymFilter(next);
                  const nextParams = new URLSearchParams(searchParams);
                  if (next) nextParams.set('gymId', next);
                  else nextParams.delete('gymId');
                  setSearchParams(nextParams, { replace: true });
                }}
              >
                <option value="">Todos los gimnasios</option>
                {gyms.map((gym) => (
                  <option key={gym.id} value={gym.id}>
                    {gym.name}
                    {gym.isArchived ? ' (Archivado)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="bg-surface rounded-2xl border border-border shadow-soft p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">sell</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold">
                Tipo
              </p>
              <select
                className="mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                value={categoryFilter}
                onChange={(event) => {
                  const next = event.target.value as 'ADULT' | 'CHILD' | '';
                  setCategoryFilter(next);
                  const nextParams = new URLSearchParams(searchParams);
                  if (next) nextParams.set('category', next);
                  else nextParams.delete('category');
                  setSearchParams(nextParams, { replace: true });
                }}
              >
                <option value="">Todos</option>
                <option value="ADULT">Adultos</option>
                <option value="CHILD">Infantiles</option>
              </select>
            </div>
          </div>
        </div>

        {loading && (
          <div className="bg-surface p-4 rounded-xl text-sm text-muted border border-border">
            Cargando alumnos...
          </div>
        )}
        {error && (
          <div className="bg-red-50 p-4 rounded-xl text-sm text-red-600 border border-red-200">
            {error}
          </div>
        )}
        {!loading && !error && students.length === 0 && (
          <div className="bg-surface p-4 rounded-xl text-sm text-muted border border-border">
            No hay alumnos para mostrar.
          </div>
        )}

        <div className="flex flex-col gap-3">
          {students.map((student) => (
            <div
              key={student.dni}
              className="flex items-center gap-4 bg-surface p-3 rounded-xl justify-between shadow-soft"
            >
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary flex items-center justify-center rounded-full h-12 w-12">
                  <span className="material-symbols-outlined">person</span>
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-text text-base font-semibold leading-tight">
                    {student.firstName} {student.lastName}
                  </p>
                  <p className="text-[#9a4c4c] text-xs font-medium mt-1">
                    DNI: {student.dni}
                  </p>
                  {student.gym && (
                    <p className="text-[11px] text-muted mt-1">
                      Gimnasio: {student.gym}
                    </p>
                  )}
                  <p className="text-[11px] text-muted mt-1">
                    Tipo: {categoryLabel(student.category)}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  className="rounded-lg bg-primary text-white text-xs font-semibold px-3 py-2"
                  type="button"
                  onClick={() => openEdit(student)}
                >
                  Editar
                </button>
                <button
                  className="rounded-lg border border-red-200 text-red-600 text-xs font-semibold px-3 py-2"
                  type="button"
                  onClick={() => handleDelete(student)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              className="h-9 px-3 rounded-full border border-border text-xs font-semibold text-text disabled:opacity-40"
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
            >
              Anterior
            </button>
            <div className="flex items-center gap-1">
              {Array.from(
                { length: pageEnd - pageStart + 1 },
                (_, index) => pageStart + index,
              ).map((number) => (
                <button
                  key={number}
                  className={`h-9 w-9 rounded-full text-xs font-semibold ${
                    page === number
                      ? 'bg-primary text-white'
                      : 'border border-border text-text'
                  }`}
                  type="button"
                  onClick={() => setPage(number)}
                >
                  {number}
                </button>
              ))}
            </div>
            <button
              className="h-9 px-3 rounded-full border border-border text-xs font-semibold text-text disabled:opacity-40"
              type="button"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page === totalPages}
            >
              Siguiente
            </button>
          </div>
        )}
      </main>

      {editing && (
        <div className="fixed inset-0 bg-black/40 z-30 flex items-end sm:items-center justify-center p-4">
          <div className="bg-surface w-full max-w-[430px] sm:max-w-[520px] md:max-w-[640px] rounded-t-2xl sm:rounded-2xl p-5 max-h-[85vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h2 className="text-lg font-bold">Editar alumno</h2>
              <button
                className="text-gray-400"
                type="button"
                onClick={() => {
                  setEditing(null);
                  setForm(emptyForm);
                  setAssignedTeacherId('');
                  setInitialTeacherId('');
                  setResetInfo('');
                }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pr-1 -mr-1">
              <form className="space-y-4" onSubmit={handleSave}>
                {editError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                    {editError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-muted">Nombre</label>
                    <input
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                      placeholder="Ej: Juan"
                      value={form.firstName}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, firstName: event.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted">Apellido</label>
                    <input
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                      placeholder="Ej: Pérez"
                      value={form.lastName}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, lastName: event.target.value }))
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted">
                    Correo electrónico (opcional)
                  </label>
                  <input
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                    placeholder="Ej: alumno@mail.com"
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, email: event.target.value }))
                    }
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-muted">Teléfono</label>
                    <input
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                      placeholder="Ej: 11 2345-6789"
                      value={form.phone}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, phone: event.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted">Teléfono tutor</label>
                    <input
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                      placeholder="Ej: 11 2345-6789"
                      value={form.guardianPhone}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, guardianPhone: event.target.value }))
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted">Fecha de nacimiento</label>
                  <div className="relative">
                    <input
                      className="peer w-full rounded-lg border border-border px-3 py-2 text-sm"
                      type="date"
                      value={form.birthDate}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, birthDate: event.target.value }))
                      }
                      required
                    />
                    <div className="pointer-events-none absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-border bg-surface px-2 py-0.5 text-[10px] text-muted opacity-0 shadow-soft transition-opacity peer-focus:opacity-100">
                      Seleccioná la fecha de nacimiento
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted">Dirección (opcional)</label>
                  <input
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                    placeholder="Ej: Calle 123"
                    value={form.address}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, address: event.target.value }))
                    }
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-muted">Tipo</label>
                    <select
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                      value={form.category}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          category: event.target.value as 'ADULT' | 'CHILD',
                        }))
                      }
                      required
                    >
                      <option value="ADULT">Adulto</option>
                      <option value="CHILD">Infantil</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted">Gimnasio</label>
                    <select
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                      value={form.gymId}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, gymId: event.target.value }))
                      }
                    >
                      <option value="">Sin asignacion</option>
                      {gyms
                        .filter((gym) => !gym.isArchived)
                        .map((gym) => (
                          <option key={gym.id} value={gym.id}>
                            {gym.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted">Profesor asignado (opcional)</label>
                  <select
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                    value={assignedTeacherId}
                    onChange={(event) => setAssignedTeacherId(event.target.value)}
                  >
                    <option value="">Sin profesor</option>
                    {activeTeachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.firstName} {teacher.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              <div className="rounded-lg border border-border bg-background p-3 space-y-2">
                <p className="text-xs text-muted">Contraseña del alumno</p>
                <button
                  className="w-full rounded-lg border border-border text-sm font-semibold py-2 disabled:opacity-70"
                  type="button"
                  onClick={handleResetPassword}
                  disabled={resetting}
                >
                  {resetting ? 'Reseteando...' : 'Resetear contraseña'}
                </button>
                {resetInfo && (
                  <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 flex items-center justify-between gap-2">
                    <span>Temporal: {resetInfo}</span>
                    <button
                      className={`text-xs font-semibold transition-all ${
                        copiedReset
                          ? 'text-green-700 bg-green-100 px-2 py-1 rounded-md scale-[1.03]'
                          : 'text-amber-700'
                      }`}
                      type="button"
                      onClick={handleCopyReset}
                    >
                      {copiedReset ? 'Copiado' : 'Copiar'}
                    </button>
                  </div>
                )}
              </div>
              <button
                className="w-full rounded-lg bg-primary text-white text-sm font-semibold py-3 disabled:opacity-70"
                type="submit"
                disabled={saving}
              >
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {createOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 flex items-end sm:items-center justify-center p-4">
          <div className="bg-surface w-full max-w-[430px] sm:max-w-[520px] md:max-w-[640px] rounded-t-2xl sm:rounded-2xl p-5 max-h-[85vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h2 className="text-lg font-bold">Nuevo alumno</h2>
              <button
                className="text-gray-400"
                type="button"
                onClick={() => {
                  setCreateOpen(false);
                  setCreateForm(emptyCreateForm);
                  setCreateAssignedTeacherId('');
                }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pr-1 -mr-1">
              <form className="space-y-4" onSubmit={handleCreate}>
                {createError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                    {createError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-muted">Nombre</label>
                    <input
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                      placeholder="Ej: Juan"
                      value={createForm.firstName}
                      onChange={(event) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          firstName: event.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted">Apellido</label>
                    <input
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                      placeholder="Ej: Pérez"
                      value={createForm.lastName}
                      onChange={(event) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          lastName: event.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted">DNI (solo números)</label>
                  <input
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                    placeholder="Ej: 40123456"
                    inputMode="numeric"
                    value={createForm.dni}
                    onChange={(event) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        dni: event.target.value.replace(/\D/g, ''),
                      }))
                    }
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted">
                    Correo electrónico (opcional)
                  </label>
                  <input
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                    placeholder="Ej: alumno@mail.com"
                    type="email"
                    value={createForm.email}
                    onChange={(event) =>
                      setCreateForm((prev) => ({ ...prev, email: event.target.value }))
                    }
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-muted">Telefono (opcional)</label>
                    <input
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                      placeholder="Ej: 11 2345-6789"
                      value={createForm.phone}
                      onChange={(event) =>
                        setCreateForm((prev) => ({ ...prev, phone: event.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted">Telefono tutor (opcional)</label>
                    <input
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                      placeholder="Ej: 11 2345-6789"
                      value={createForm.guardianPhone}
                      onChange={(event) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          guardianPhone: event.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted">Fecha de nacimiento (opcional)</label>
                  <div className="relative">
                    <input
                      className="peer w-full rounded-lg border border-border px-3 py-2 text-sm"
                      type="date"
                      value={createForm.birthDate}
                      onChange={(event) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          birthDate: event.target.value,
                        }))
                      }
                    />
                    <div className="pointer-events-none absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-border bg-surface px-2 py-0.5 text-[10px] text-muted opacity-0 shadow-soft transition-opacity peer-focus:opacity-100">
                      Seleccioná la fecha de nacimiento
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted">Dirección (opcional)</label>
                  <input
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                    placeholder="Ej: Calle 123"
                    value={createForm.address}
                    onChange={(event) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        address: event.target.value,
                      }))
                    }
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-muted">Tipo (opcional)</label>
                    <select
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                      value={createForm.category}
                      onChange={(event) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          category: event.target.value as 'ADULT' | 'CHILD',
                        }))
                      }
                    >
                      <option value="ADULT">Adulto</option>
                      <option value="CHILD">Infantil</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted">Gimnasio (opcional)</label>
                    <select
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                      value={createForm.gymId}
                      onChange={(event) =>
                        setCreateForm((prev) => ({ ...prev, gymId: event.target.value }))
                      }
                    >
                      <option value="">Sin asignacion</option>
                      {gyms
                        .filter((gym) => !gym.isArchived)
                        .map((gym) => (
                        <option key={gym.id} value={gym.id}>
                          {gym.name}
                        </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted">Contraseña</label>
                  <div className="relative">
                    <input
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm pr-10"
                      placeholder="M?nimo 6 caracteres"
                      type={showPassword ? 'text' : 'password'}
                      value={createForm.password}
                      onChange={(event) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          password: event.target.value,
                        }))
                      }
                      required
                    />
                    <button
                      className="absolute inset-y-0 right-3 flex items-center text-gray-400"
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      aria-label={showPassword ? 'Ocultar Contraseña' : 'Ver Contraseña'}
                    >
                      <span className="material-symbols-outlined text-lg">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted">Profesor asignado (opcional)</label>
                  <select
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                    value={createAssignedTeacherId}
                    onChange={(event) => setCreateAssignedTeacherId(event.target.value)}
                  >
                    <option value="">Sin profesor</option>
                    {activeTeachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.firstName} {teacher.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  className="w-full rounded-lg bg-primary text-white text-sm font-semibold py-3 disabled:opacity-70"
                  type="submit"
                  disabled={creating}
                >
                  {creating ? 'Creando...' : 'Crear alumno'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
