import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiFetch } from './auth';

type StudentItem = {
    dni: string;
    firstName: string;
    lastName: string;
    category?: 'ADULT' | 'CHILD';
    gymId?: string;
    gym?: string | null;
};

type StudentWithStatus = StudentItem & {
    status: 'OK' | 'DEBT' | 'UNKNOWN';
};

type CreateStudentForm = {
    firstName: string;
    lastName: string;
    dni: string;
    email: string;
    phone: string;
    guardianPhone: string;
    gymId: string;
    category: 'ADULT' | 'CHILD';
    birthDate: string;
    address: string;
    password: string;
};

const emptyForm: CreateStudentForm = {
    firstName: '',
    lastName: '',
    dni: '',
    email: '',
    phone: '',
    guardianPhone: '',
    gymId: '',
    category: 'ADULT',
    birthDate: '',
    address: '',
    password: '',
};

type GymOption = {
    id: string;
    name: string;
};

const categoryLabel = (value?: 'ADULT' | 'CHILD') =>
    value === 'CHILD' ? 'Infantil' : 'Adulto';

export function TeacherStudents() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [assigned, setAssigned] = useState<StudentWithStatus[]>([]);
    const [gyms, setGyms] = useState<GymOption[]>([]);
    const [query, setQuery] = useState(searchParams.get('search') ?? '');
    const [gymFilter, setGymFilter] = useState(searchParams.get('gymId') ?? '');
    const [categoryFilter, setCategoryFilter] = useState(
        (searchParams.get('category') as 'ADULT' | 'CHILD' | null) ?? '',
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [createOpen, setCreateOpen] = useState(false);
    const [form, setForm] = useState<CreateStudentForm>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [createError, setCreateError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [pageAssigned, setPageAssigned] = useState(
        Math.max(1, Number(searchParams.get('page') ?? '1')),
    );
    const pageSize = 10;
    const [totalAssigned, setTotalAssigned] = useState(0);
    const assignedCount = totalAssigned;

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

    const loadStudents = async () => {
        setLoading(true);
        setError('');
        try {
            const assignedParams = new URLSearchParams({
                page: String(pageAssigned),
                limit: String(pageSize),
            });
            if (query.trim()) {
                assignedParams.set('search', query.trim());
            }
            if (gymFilter) {
                assignedParams.set('gymId', gymFilter);
            }
            if (categoryFilter) {
                assignedParams.set('category', categoryFilter);
            }
            const assignedResponse = await apiFetch(
                `/teachers/me/students?${assignedParams.toString()}`,
                {
                    method: 'GET',
                    cache: 'no-store',
                },
            );

            if (!assignedResponse.ok) {
                const body = await assignedResponse.json().catch(() => ({}));
                throw new Error(body.message ?? 'No se pudo cargar el listado.');
            }

            const assignedPayload = (await assignedResponse.json()) as
                | StudentItem[]
                | { data?: StudentItem[]; total?: number; page?: number; limit?: number };
            const assignedData = Array.isArray(assignedPayload)
                ? assignedPayload
                : assignedPayload?.data ?? [];
            const assignedTotal = Array.isArray(assignedPayload)
                ? assignedData.length
                : assignedPayload?.total ?? assignedData.length;

            const baseAssigned = (assignedData ?? []).map((student) => ({
                ...student,
                status: 'UNKNOWN' as const,
            }));
            setAssigned(baseAssigned);
            setTotalAssigned(assignedTotal);

            const statusResults = await Promise.all(
                baseAssigned.map(async (student) => {
                    const feeResponse = await apiFetch(
                        `/fees/student/${student.dni}`,
                        { method: 'GET' },
                    );
                    if (!feeResponse.ok) {
                        return { dni: student.dni, status: 'UNKNOWN' as const };
                    }
                    const fees = await feeResponse.json();
                    const hasDebt = Array.isArray(fees)
                        ? fees.some((fee) => fee.status === 'PENDING')
                        : false;
                    return { dni: student.dni, status: hasDebt ? 'DEBT' : 'OK' };
                }),
            );

            setAssigned((current) =>
                current.map((student) => {
                    const match = statusResults.find((item) => item.dni === student.dni);
                    return match
                        ? { ...student, status: match.status as StudentWithStatus['status'] }
                        : student;
                }),
            );
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'No se pudo cargar el listado.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStudents();
    }, [pageAssigned, query, gymFilter, categoryFilter]);

    useEffect(() => {
        loadGyms();
    }, []);

    const sanitizeDni = (value: string) => value.replace(/\D/g, '');

    const handleCreateStudent = async (event: React.FormEvent) => {
        event.preventDefault();
        setSaving(true);
        setError('');
        setCreateError('');
        try {
            const response = await apiFetch('/teachers/me/students', {
                method: 'POST',
                json: true,
                body: JSON.stringify({
                    dni: sanitizeDni(form.dni),
                    password: form.password,
                    firstName: form.firstName.trim() || null,
                    lastName: form.lastName.trim() || null,
                    email: form.email.trim() || null,
                    phone: form.phone.trim() || null,
                    guardianPhone: form.guardianPhone.trim() || null,
                    gymId: form.gymId.trim() || null,
                    category: form.category || null,
                    birthDate: form.birthDate.trim() || null,
                    address: form.address.trim() || null,
                }),
            });
            if (!response.ok) {
                const body = await response.json().catch(() => ({}));
                throw new Error(body.message ?? 'No se pudo crear el alumno.');
            }
            setForm(emptyForm);
            setCreateOpen(false);
            await loadStudents();
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'No se pudo crear el alumno.';
            setCreateError(message);
        } finally {
            setSaving(false);
        }
    };

    const totalPagesAssigned = Math.max(1, Math.ceil(totalAssigned / pageSize));
    const pageStartAssigned = Math.max(
        1,
        Math.min(pageAssigned - 2, totalPagesAssigned - 4),
    );
    const pageEndAssigned = Math.min(totalPagesAssigned, pageStartAssigned + 4);

    useEffect(() => {
        setPageAssigned(1);
    }, [query, gymFilter, categoryFilter]);

    useEffect(() => {
        const search = searchParams.get('search') ?? '';
        if (search !== query) {
            setQuery(search);
        }
        const gymId = searchParams.get('gymId') ?? '';
        if (gymId !== gymFilter) {
            setGymFilter(gymId);
        }
        const category = (searchParams.get('category') as 'ADULT' | 'CHILD' | null) ?? '';
        if (category !== categoryFilter) {
            setCategoryFilter(category);
        }
        const page = Math.max(1, Number(searchParams.get('page') ?? '1'));
        if (!Number.isNaN(page) && page !== pageAssigned) {
            setPageAssigned(page);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    useEffect(() => {
        if (pageAssigned > totalPagesAssigned) {
            setPageAssigned(totalPagesAssigned);
        }
    }, [pageAssigned, totalPagesAssigned]);

    useEffect(() => {
        const nextParams = new URLSearchParams(searchParams);
        if (query.trim()) nextParams.set('search', query.trim());
        else nextParams.delete('search');
        if (gymFilter) nextParams.set('gymId', gymFilter);
        else nextParams.delete('gymId');
        if (categoryFilter) nextParams.set('category', categoryFilter);
        else nextParams.delete('category');
        if (pageAssigned > 1) nextParams.set('page', String(pageAssigned));
        else nextParams.delete('page');

        if (nextParams.toString() !== searchParams.toString()) {
            setSearchParams(nextParams, { replace: true });
        }
    }, [query, gymFilter, categoryFilter, pageAssigned, searchParams, setSearchParams]);

    const list = assigned;

    return (
        <div className="relative flex h-full min-h-screen w-full flex-col max-w-[430px] sm:max-w-[560px] md:max-w-[720px] mx-auto bg-background-light shadow-xl overflow-x-hidden">
            <header className="sticky top-0 z-10 flex items-center bg-background-light/80 backdrop-blur-md p-4 pb-2 justify-between">
                <div className="flex items-center gap-2">
                    <Link
                        className="text-[#1b0d0d] flex size-10 items-center justify-center cursor-pointer"
                        to="/dashboard"
                    >
                        <span className="material-symbols-outlined">arrow_back_ios</span>
                    </Link>
                    <h1 className="text-[#1b0d0d] text-xl font-bold leading-tight tracking-tight">
                        Alumnos
                    </h1>
                </div>
                <button
                    className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-transparent text-[#1b0d0d]"
                    type="button"
                    onClick={() => setCreateOpen(true)}
                    aria-label="Crear alumno"
                >
                    <span className="material-symbols-outlined">person_add</span>
                </button>
            </header>

            <div className="px-4 py-3">
                <label className="flex flex-col min-w-40 h-12 w-full">
                    <div className="flex w-full flex-1 items-stretch rounded-xl h-full shadow-sm">
                        <div className="text-[#9a4c4c] flex border-none bg-white items-center justify-center pl-4 rounded-l-xl border-r-0">
                            <span className="material-symbols-outlined">search</span>
                        </div>
                        <input
                            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-xl text-[#1b0d0d] focus:outline-0 focus:ring-0 border-none bg-white focus:border-none h-full placeholder:text-[#9a4c4c] px-4 pl-2 text-base font-normal leading-normal"
                            placeholder="Buscar por DNI o nombre"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                        />
                    </div>
                </label>
                <div className="mt-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined">folder</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold">
                                Gimnasio
                            </p>
                            <select
                                className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                                value={gymFilter}
                                onChange={(event) => {
                                    setGymFilter(event.target.value);
                                }}
                            >
                                <option value="">Todos los gimnasios</option>
                                {gyms.map((gym) => (
                                    <option key={gym.id} value={gym.id}>
                                        {gym.name}
                                    </option>
                                ))}
                            </select>

                            <p className="mt-4 text-xs uppercase tracking-[0.2em] text-primary font-bold">
                                Tipo
                            </p>
                            <select
                                className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                                value={categoryFilter}
                                onChange={(event) => {
                                    setCategoryFilter(event.target.value as 'ADULT' | 'CHILD' | '');
                                }}
                            >
                                <option value="">Todos</option>
                                <option value="ADULT">Adultos</option>
                                <option value="CHILD">Infantiles</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 px-4 py-2">
                <div className="sm:ml-auto flex h-9 shrink-0 items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 text-xs font-semibold text-gray-700 shadow-sm">
                    <span className="material-symbols-outlined text-base">groups</span>
                    {`Alumnos: ${assignedCount}`}
                </div>
            </div>

            <main className="flex-1 px-4 mt-2 pb-24">
                {loading && (
                    <div className="bg-white p-4 rounded-xl text-sm text-gray-500 border border-gray-100">
                        Cargando alumnos...
                    </div>
                )}
                {error && (
                    <div className="bg-red-50 p-4 rounded-xl text-sm text-red-600 border border-red-200">
                        {error}
                    </div>
                )}
                {!loading && !error && list.length === 0 && (
                    <div className="bg-white p-4 rounded-xl text-sm text-gray-500 border border-gray-100">
                        No hay alumnos para mostrar.
                    </div>
                )}

                <div className="flex flex-col gap-2">
                    {(list as StudentWithStatus[]).map((student) => (
                        <div
                            key={student.dni}
                            className="flex items-center gap-4 bg-white p-3 rounded-xl justify-between shadow-sm"
                        >
                            <Link
                                className="flex items-center gap-3 flex-1"
                                to={`/alumno/${student.dni}?returnTo=${encodeURIComponent(
                                    `/profesor/alumnos?${searchParams.toString()}`,
                                )}`}
                            >
                                <div className="bg-primary/10 text-primary flex items-center justify-center rounded-full h-14 w-14">
                                    <span className="material-symbols-outlined">person</span>
                                </div>
                                <div className="flex flex-col justify-center">
                                    <p className="text-[#1b0d0d] text-base font-semibold leading-tight">
                                        {student.firstName} {student.lastName}
                                    </p>
                                    <p className="text-[#9a4c4c] text-xs font-medium mt-1">
                                        DNI: {student.dni}
                                    </p>
                                    {student.gym && (
                                        <p className="text-[11px] text-gray-500 mt-1">
                                            Gimnasio: {student.gym}
                                        </p>
                                    )}
                                    <p className="text-[11px] text-gray-500 mt-1">
                                        Tipo: {categoryLabel(student.category)}
                                    </p>
                                </div>
                            </Link>
                            <div className="flex flex-col items-end gap-2">
                                <span
                                    className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${student.status === 'OK'
                                            ? 'bg-green-100 text-green-700'
                                            : student.status === 'DEBT'
                                                ? 'bg-primary/10 text-primary'
                                                : 'bg-gray-100 text-gray-500'
                                        }`}
                                >
                                    {student.status === 'OK'
                                        ? 'Al día'
                                        : student.status === 'DEBT'
                                            ? 'Deuda'
                                            : 'Sin estado'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {totalPagesAssigned > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-3">
                        <button
                            className="h-9 px-3 rounded-full border border-gray-200 text-xs font-semibold text-[#1b0d0d] disabled:opacity-40"
                            type="button"
                            onClick={() =>
                                setPageAssigned((current) => Math.max(1, current - 1))
                            }
                            disabled={pageAssigned === 1}
                        >
                            Anterior
                        </button>
                        <div className="flex items-center gap-1">
                            {Array.from(
                                { length: pageEndAssigned - pageStartAssigned + 1 },
                                (_, index) => pageStartAssigned + index,
                            ).map((number) => (
                                <button
                                    key={number}
                                    className={`h-9 w-9 rounded-full text-xs font-semibold ${pageAssigned === number
                                            ? 'bg-primary text-white'
                                            : 'border border-gray-200 text-[#1b0d0d]'
                                        }`}
                                    type="button"
                                    onClick={() => setPageAssigned(number)}
                                >
                                    {number}
                                </button>
                            ))}
                        </div>
                        <button
                            className="h-9 px-3 rounded-full border border-gray-200 text-xs font-semibold text-[#1b0d0d] disabled:opacity-40"
                            type="button"
                            onClick={() =>
                                setPageAssigned((current) =>
                                    Math.min(totalPagesAssigned, current + 1),
                                )
                            }
                            disabled={pageAssigned === totalPagesAssigned}
                        >
                            Siguiente
                        </button>
                    </div>
                )}
            </main>

            {createOpen && (
                <div className="fixed inset-0 bg-black/40 z-30 flex items-end sm:items-center justify-center p-4">
                    <div className="bg-white w-full max-w-[430px] sm:max-w-[520px] md:max-w-[640px] rounded-t-2xl sm:rounded-2xl p-5 max-h-[85vh] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between mb-4 shrink-0">
                            <h2 className="text-lg font-bold">Nuevo alumno</h2>
                            <button
                                className="text-gray-400"
                                type="button"
                                onClick={() => setCreateOpen(false)}
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-1 -mr-1">
                            <form className="space-y-4" onSubmit={handleCreateStudent}>
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
                                            placeholder="Ej: Juan"
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
                                    <label className="text-xs text-gray-500">DNI (solo números)</label>
                                    <input
                                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                                        placeholder="Ej: 40123456"
                                        inputMode="numeric"
                                        value={form.dni}
                                        onChange={(event) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                dni: sanitizeDni(event.target.value),
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
                                        <label className="text-xs text-gray-500">Gimnasio (opcional)</label>
                                        <select
                                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                                            value={form.gymId}
                                            onChange={(event) =>
                                                setForm((prev) => ({ ...prev, gymId: event.target.value }))
                                            }
                                        >
                                            <option value="">Sin asignacion</option>
                                            {gyms.map((gym) => (
                                                <option key={gym.id} value={gym.id}>
                                                    {gym.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-500">Tipo (opcional)</label>
                                        <select
                                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                                            value={form.category}
                                            onChange={(event) =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    category: event.target.value as 'ADULT' | 'CHILD',
                                                }))
                                            }
                                        >
                                            <option value="ADULT">Adulto</option>
                                            <option value="CHILD">Infantil</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500">Fecha de nacimiento (opcional)</label>
                                    <div className="relative">
                                        <input
                                            className="peer w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                                            type="date"
                                            value={form.birthDate}
                                            onChange={(event) =>
                                                setForm((prev) => ({ ...prev, birthDate: event.target.value }))
                                            }
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

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-500">Telefono del alumno (opcional)</label>
                                        <input
                                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                                            placeholder="Ej: 11 2345-6789"
                                            value={form.phone}
                                            onChange={(event) =>
                                                setForm((prev) => ({ ...prev, phone: event.target.value }))
                                            }
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-500">Telefono tutor (opcional)</label>
                                        <input
                                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                                            placeholder="Ej: 11 2345-6789"
                                            value={form.guardianPhone}
                                            onChange={(event) =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    guardianPhone: event.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500">Contraseña</label>
                                    <div className="relative">
                                        <input
                                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm pr-10"
                                            placeholder="Por defecto: DNI"
                                            type={showPassword ? 'text' : 'password'}
                                            value={form.password}
                                            onChange={(event) =>
                                                setForm((prev) => ({ ...prev, password: event.target.value }))
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
                                    disabled={saving}
                                >
                                    {saving ? 'Guardando...' : 'Crear alumno'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
