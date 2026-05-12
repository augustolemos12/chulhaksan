import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../auth/auth';

type AdminTeacher = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  birthDate?: string | null;
  address?: string | null;
  gyms?: string[] | null;
  user?: {
    id: string;
    dni?: string;
    status: string;
  };
};

type TeacherForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  address: string;
  gyms: string;
};

type CreateTeacherForm = TeacherForm & {
  dni: string;
  password: string;
};


const emptyForm: TeacherForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  birthDate: '',
  address: '',
  gyms: '',
};

const emptyCreateForm: CreateTeacherForm = {
  ...emptyForm,
  dni: '',
  password: '',
};

export function AdminTeachers() {
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
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateTeacherForm>(emptyCreateForm);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [editError, setEditError] = useState('');
  const [resetInfo, setResetInfo] = useState('');
  const [resetting, setResetting] = useState(false);
  const [copiedReset, setCopiedReset] = useState(false);

  const loadTeachers = async () => {
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
      const response = await apiFetch(`/admin/teachers?${params.toString()}`, {
        method: 'GET',
        cache: 'no-store',
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message ?? 'No se pudo cargar el listado.');
      }
      const payload = (await response.json()) as
        | AdminTeacher[]
        | { data?: AdminTeacher[]; total?: number; page?: number; limit?: number };
      const list = Array.isArray(payload) ? payload : payload?.data ?? [];
      setTeachers(list);
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

  useEffect(() => {
    loadTeachers();
  }, [page, query]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageStart = Math.max(1, Math.min(page - 2, totalPages - 4));
  const pageEnd = Math.min(totalPages, pageStart + 4);

  useEffect(() => {
    setPage(1);
  }, [query]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const openEdit = (teacher: AdminTeacher) => {
    setEditing(teacher);
    setResetInfo('');
    setForm({
      firstName: teacher.firstName ?? '',
      lastName: teacher.lastName ?? '',
      email: teacher.email ?? '',
      phone: teacher.phone ?? '',
      birthDate: teacher.birthDate ? teacher.birthDate.split('T')[0] : '',
      address: teacher.address ?? '',
      gyms: teacher.gyms && teacher.gyms.length > 0 ? teacher.gyms.join(', ') : '',
    });
  };

  const buildPayload = () => ({
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    email: form.email.trim() || null,
    phone: form.phone.trim() || null,
    birthDate: form.birthDate.trim() || null,
    address: form.address.trim() || null,
    gyms: form.gyms.trim()
      ? form.gyms
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
      : null,
  });

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    setSaving(true);
    setError('');
    setEditError('');
    try {
      const response = await apiFetch(`/admin/teachers/${editing.id}`, {
        method: 'PATCH',
        json: true,
        body: JSON.stringify(buildPayload()),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message ?? 'No se pudo guardar el profesor.');
      }
      setEditing(null);
      setForm(emptyForm);
      setResetInfo('');
      await loadTeachers();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'No se pudo guardar el profesor.';
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
      const gyms = createForm.gyms
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
      const response = await apiFetch('/admin/users', {
        method: 'POST',
        json: true,
          body: JSON.stringify({
            role: 'TEACHER',
            dni: createForm.dni.trim(),
            password: createForm.password.trim(),
            firstName: createForm.firstName.trim(),
            lastName: createForm.lastName.trim(),
            email: createForm.email.trim() || null,
            phone: createForm.phone.trim(),
            birthDate: createForm.birthDate.trim(),
            address: createForm.address.trim() || null,
            gyms,
          }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message ?? 'No se pudo crear el profesor.');
      }
      setCreateOpen(false);
      setCreateForm(emptyCreateForm);
      await loadTeachers();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'No se pudo crear el profesor.';
      setCreateError(message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (teacher: AdminTeacher) => {
    if (!confirm(`Eliminar profesor ${teacher.firstName} ${teacher.lastName}?`)) {
      return;
    }
    setError('');
    try {
      const response = await apiFetch(`/admin/teachers/${teacher.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message ?? 'No se pudo eliminar el profesor.');
      }
      await loadTeachers();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'No se pudo eliminar el profesor.';
      setError(message);
    }
  };

  const handleResetPassword = async () => {
    if (!editing?.user?.id) {
      setEditError('No se pudo identificar el usuario.');
      return;
    }
    if (!confirm('¿Querés resetear la contraseña de este profesor?')) return;
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
    <div className="min-h-screen bg-background-light text-[#1b0d0d]">
      <header className="sticky top-0 z-10 bg-background-light/80 backdrop-blur-md border-b border-gray-200">
        <div className="flex items-center p-4 justify-between w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto">
          <Link
            className="text-[#1b0d0d] flex size-10 shrink-0 items-center justify-center"
            to="/dashboard"
          >
            <span className="material-symbols-outlined">arrow_back_ios</span>
          </Link>
          <h1 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10">
            Gestión de profesores
          </h1>
          <button
            className="flex size-10 items-center justify-center"
            type="button"
            onClick={() => setCreateOpen(true)}
            aria-label="Crear profesor"
          >
            <span className="material-symbols-outlined">person_add</span>
          </button>
        </div>
      </header>

      <main className="w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto p-4 pb-24 space-y-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold">
              Total profesores
            </p>
            <p className="text-2xl font-bold text-[#1b0d0d]">{total}</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">badge</span>
          </div>
        </div>
        <label className="flex flex-col min-w-40 h-12 w-full">
          <div className="flex w-full flex-1 items-stretch rounded-xl h-full shadow-sm">
            <div className="text-[#9a4c4c] flex border-none bg-white items-center justify-center pl-4 rounded-l-xl border-r-0">
              <span className="material-symbols-outlined">search</span>
            </div>
            <input
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-xl text-[#1b0d0d] focus:outline-0 focus:ring-0 border-none bg-white focus:border-none h-full placeholder:text-[#9a4c4c] px-4 pl-2 text-base font-normal leading-normal"
              placeholder="Buscar por nombre o DNI"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </label>

        {loading && (
          <div className="bg-white p-4 rounded-xl text-sm text-gray-500 border border-gray-100">
            Cargando profesores...
          </div>
        )}
        {error && (
          <div className="bg-red-50 p-4 rounded-xl text-sm text-red-600 border border-red-200">
            {error}
          </div>
        )}
        {!loading && !error && teachers.length === 0 && (
          <div className="bg-white p-4 rounded-xl text-sm text-gray-500 border border-gray-100">
            No hay profesores para mostrar.
          </div>
        )}

        <div className="flex flex-col gap-3">
          {teachers.map((teacher) => (
            <div
              key={teacher.id}
              className="flex items-center gap-4 bg-white p-3 rounded-xl justify-between shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary flex items-center justify-center rounded-full h-12 w-12">
                  <span className="material-symbols-outlined">badge</span>
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-[#1b0d0d] text-base font-semibold leading-tight">
                    {teacher.firstName} {teacher.lastName}
                  </p>
                  {teacher.user?.dni && (
                    <p className="text-[#9a4c4c] text-xs font-medium mt-1">
                      DNI: {teacher.user.dni}
                    </p>
                  )}
                  {teacher.email && (
                    <p className="text-[11px] text-gray-500 mt-1">
                      {teacher.email}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  className="rounded-lg bg-primary text-white text-xs font-semibold px-3 py-2"
                  type="button"
                  onClick={() => openEdit(teacher)}
                >
                  Editar
                </button>
                <button
                  className="rounded-lg border border-red-200 text-red-600 text-xs font-semibold px-3 py-2"
                  type="button"
                  onClick={() => handleDelete(teacher)}
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
              className="h-9 px-3 rounded-full border border-gray-200 text-xs font-semibold text-[#1b0d0d] disabled:opacity-40"
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
                      : 'border border-gray-200 text-[#1b0d0d]'
                  }`}
                  type="button"
                  onClick={() => setPage(number)}
                >
                  {number}
                </button>
              ))}
            </div>
            <button
              className="h-9 px-3 rounded-full border border-gray-200 text-xs font-semibold text-[#1b0d0d] disabled:opacity-40"
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
          <div className="bg-white w-full max-w-[430px] sm:max-w-[520px] md:max-w-[640px] rounded-t-2xl sm:rounded-2xl p-5 max-h-[85vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h2 className="text-lg font-bold">Editar profesor</h2>
              <button
                className="text-gray-400"
                type="button"
                onClick={() => {
                  setEditing(null);
                  setForm(emptyForm);
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
                    <label className="text-xs text-gray-500">Nombre</label>
                    <input
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                      placeholder="Ej: Laura"
                      value={form.firstName}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, firstName: event.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500">Apellido</label>
                    <input
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                      placeholder="Ej: Gómez"
                      value={form.lastName}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, lastName: event.target.value }))
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-500">
                    Correo electrónico (opcional)
                  </label>
                  <input
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    placeholder="Ej: profe@mail.com"
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, email: event.target.value }))
                    }
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-500">Teléfono</label>
                  <input
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    placeholder="Ej: 11 2345-6789"
                    value={form.phone}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, phone: event.target.value }))
                    }
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-500">Fecha de nacimiento</label>
                  <div className="relative">
                    <input
                      className="peer w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                      type="date"
                      value={form.birthDate}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, birthDate: event.target.value }))
                      }
                      required
                    />
                    <div className="pointer-events-none absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[10px] text-gray-500 opacity-0 shadow-sm transition-opacity peer-focus:opacity-100">
                      Seleccioná la fecha de nacimiento
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-500">Dirección (opcional)</label>
                  <input
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    placeholder="Ej: Calle 123"
                    value={form.address}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, address: event.target.value }))
                    }
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-500">Gimnasios</label>
                  <input
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    placeholder="Separados por coma (Ej: Club Obras, Colegio X)"
                    value={form.gyms}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, gyms: event.target.value }))
                    }
                    required
                  />
                </div>
              <div className="rounded-lg border border-gray-100 bg-background-light p-3 space-y-2">
                <p className="text-xs text-gray-500">Contraseña del profesor</p>
                <button
                  className="w-full rounded-lg border border-gray-200 text-sm font-semibold py-2 disabled:opacity-70"
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
          <div className="bg-white w-full max-w-[430px] sm:max-w-[520px] md:max-w-[640px] rounded-t-2xl sm:rounded-2xl p-5 max-h-[85vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h2 className="text-lg font-bold">Nuevo profesor</h2>
              <button
                className="text-gray-400"
                type="button"
                onClick={() => setCreateOpen(false)}
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
                    <label className="text-xs text-gray-500">Nombre</label>
                    <input
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                      placeholder="Ej: Laura"
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
                    <label className="text-xs text-gray-500">Apellido</label>
                    <input
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                      placeholder="Ej: Gómez"
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
                  <label className="text-xs text-gray-500">DNI (solo números)</label>
                  <input
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
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
                  <label className="text-xs text-gray-500">
                    Correo electrónico (opcional)
                  </label>
                  <input
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    placeholder="Ej: profe@mail.com"
                    type="email"
                    value={createForm.email}
                    onChange={(event) =>
                      setCreateForm((prev) => ({ ...prev, email: event.target.value }))
                    }
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-500">Teléfono</label>
                  <input
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    placeholder="Ej: 11 2345-6789"
                    value={createForm.phone}
                    onChange={(event) =>
                      setCreateForm((prev) => ({ ...prev, phone: event.target.value }))
                    }
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-500">Fecha de nacimiento</label>
                  <div className="relative">
                    <input
                      className="peer w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                      type="date"
                      value={createForm.birthDate}
                      onChange={(event) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          birthDate: event.target.value,
                        }))
                      }
                      required
                    />
                    <div className="pointer-events-none absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[10px] text-gray-500 opacity-0 shadow-sm transition-opacity peer-focus:opacity-100">
                      Seleccioná la fecha de nacimiento
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-500">Dirección (opcional)</label>
                  <input
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
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

                <div className="space-y-1">
                  <label className="text-xs text-gray-500">Gimnasios</label>
                  <input
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    placeholder="Separados por coma (Ej: Club Obras, Colegio X)"
                    value={createForm.gyms}
                    onChange={(event) =>
                      setCreateForm((prev) => ({ ...prev, gyms: event.target.value }))
                    }
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-500">Contraseña</label>
                  <div className="relative">
                    <input
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm pr-10"
                      placeholder="Defin? una Contraseña"
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

                <button
                  className="w-full rounded-lg bg-primary text-white text-sm font-semibold py-3 disabled:opacity-70"
                  type="submit"
                  disabled={creating}
                >
                  {creating ? 'Creando...' : 'Crear profesor'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
