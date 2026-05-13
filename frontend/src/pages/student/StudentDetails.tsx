import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { apiFetch, getProfile } from './auth';

type StudentDetailData = {
    dni: string;
    gymId?: string | null;
    firstName: string;
    lastName: string;
    category?: 'ADULT' | 'CHILD';
    phone?: string | null;
    guardianPhone?: string | null;
    email?: string | null;
    birthDate?: string | null;
    address?: string | null;
    gym?: string | null;
};

type GymOption = {
    id: string;
    name: string;
};

type FormAccessItem = {
    id: string;
    title: string;
    url: string;
    order: number;
    unlocked: boolean;
};

type FeeItem = {
    id: string;
    month: number;
    year: number;
    amount: number | string;
    status: 'PENDING' | 'PAID';
    dueDate: string;
    paidAt?: string | null;
    lateFeeApplied?: boolean;
};

const monthNames = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
];

function formatDateAsCalendar(value: string) {
    return new Date(value).toLocaleDateString('es-AR', {
        timeZone: 'UTC',
    });
}

export function StudentDetail() {
    const { dni } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const profile = getProfile();
    const isTeacher = profile?.role === 'TEACHER';
    const canManageForms = profile?.role === 'TEACHER' || profile?.role === 'ADMIN';
    const defaultReturnTo = profile?.role === 'ADMIN' ? '/admin/alumnos' : '/profesor/alumnos';
    const requestedReturnTo = searchParams.get('returnTo');
    const returnTo =
        requestedReturnTo && requestedReturnTo.startsWith('/')
            ? requestedReturnTo
            : defaultReturnTo;
    const [student, setStudent] = useState<StudentDetailData | null>(null);
    const [gyms, setGyms] = useState<GymOption[]>([]);
    const [editingProfile, setEditingProfile] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);
    const [editForm, setEditForm] = useState({
        firstName: '',
        lastName: '',
        category: 'ADULT' as 'ADULT' | 'CHILD',
        email: '',
        phone: '',
        guardianPhone: '',
        birthDate: '',
        address: '',
        gymId: '',
    });
    const [fees, setFees] = useState<FeeItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [marking, setMarking] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<'unassign' | 'delete' | null>(
        null,
    );
    const [resetInfo, setResetInfo] = useState('');
    const [resetting, setResetting] = useState(false);
    const [copiedReset, setCopiedReset] = useState(false);
    const [formsAccess, setFormsAccess] = useState<FormAccessItem[]>([]);
    const [formsLoading, setFormsLoading] = useState(false);
    const [formsUpdatingId, setFormsUpdatingId] = useState<string | null>(null);
    const [showFormsAccessMenu, setShowFormsAccessMenu] = useState(false);

    const categoryLabel = (value?: 'ADULT' | 'CHILD') => {
        if (value === 'CHILD') return 'Infantil';
        return 'Adulto';
    };

    useEffect(() => {
        if (!dni) {
            setError('Iniciá sesión para ver el alumno.');
            setLoading(false);
            return;
        }

        const load = async () => {
            try {
                const [studentResponse, feesResponse] = await Promise.all([
                    apiFetch(`/students/${dni}`, { method: 'GET' }),
                    apiFetch(`/fees/student/${dni}`, { method: 'GET' }),
                ]);

                if (!studentResponse.ok) {
                    const body = await studentResponse.json().catch(() => ({}));
                    throw new Error(body.message ?? 'No se pudo cargar el alumno.');
                }
                if (!feesResponse.ok) {
                    const body = await feesResponse.json().catch(() => ({}));
                    throw new Error(body.message ?? 'No se pudo cargar las cuotas.');
                }

                const studentData = (await studentResponse.json()) as StudentDetailData;
                const feesData = (await feesResponse.json()) as FeeItem[];
                setStudent(studentData);
                setEditForm({
                    firstName: studentData.firstName ?? '',
                    lastName: studentData.lastName ?? '',
                    category: studentData.category ?? 'ADULT',
                    email: studentData.email ?? '',
                    phone: studentData.phone ?? '',
                    guardianPhone: studentData.guardianPhone ?? '',
                    birthDate: studentData.birthDate ? studentData.birthDate.split('T')[0] : '',
                    address: studentData.address ?? '',
                    gymId: studentData.gymId ?? '',
                });
                setFees(feesData ?? []);

                if (canManageForms) {
                    setFormsLoading(true);
                    const formsResponse = await apiFetch(`/forms/student/${dni}`, {
                        method: 'GET',
                        cache: 'no-store',
                    });
                    if (formsResponse.ok) {
                        const list = (await formsResponse.json()) as FormAccessItem[];
                        setFormsAccess(Array.isArray(list) ? list : []);
                    } else {
                        setFormsAccess([]);
                    }
                    setFormsLoading(false);
                } else {
                    setFormsAccess([]);
                }
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : 'No se pudo cargar el alumno.';
                setError(message);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [dni, canManageForms]);

    useEffect(() => {
        if (!isTeacher) return;
        const loadGyms = async () => {
            try {
                const response = await apiFetch('/gyms', { method: 'GET', cache: 'no-store' });
                if (!response.ok) return;
                const data = (await response.json()) as GymOption[];
                setGyms(Array.isArray(data) ? data : []);
            } catch {
                setGyms([]);
            }
        };

        loadGyms();
    }, [isTeacher]);

    const fullName = useMemo(() => {
        if (!student) return 'Alumno';
        return `${student.firstName} ${student.lastName}`;
    }, [student]);

    const birthDateLabel = useMemo(() => {
        if (!student?.birthDate) return '-';
        return formatDateAsCalendar(student.birthDate);
    }, [student]);

    const handleMarkPaid = async (feeId: string) => {
        setMarking(feeId);
        setError('');
        try {
            const response = await apiFetch(`/fees/${feeId}/mark-paid`, {
                method: 'PATCH',
            });
            if (!response.ok) {
                const body = await response.json().catch(() => ({}));
                throw new Error(body.message ?? 'No se pudo marcar el pago.');
            }
            const updatedFees = fees.map((fee) =>
                fee.id === feeId
                    ? { ...fee, status: 'PAID' as const, paidAt: new Date().toISOString() }
                    : fee,
            );
            setFees(updatedFees);
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'No se pudo marcar el pago.';
            setError(message);
        } finally {
            setMarking(null);
        }
    };

    const handleUnassign = async () => {
        if (!dni) return;
        if (!confirm('Quieres desasignar este alumno?')) return;
        setActionLoading('unassign');
        setError('');
        try {
            const response = await apiFetch(
                `/teachers/me/students/${dni}/unassign`,
                {
                    method: 'POST',
                },
            );
            if (!response.ok) {
                const body = await response.json().catch(() => ({}));
                throw new Error(body.message ?? 'No se pudo desasignar el alumno.');
            }
            navigate(returnTo);
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'No se pudo desasignar el alumno.';
            setError(message);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async () => {
        if (!dni) return;
        if (!confirm('Quieres eliminar este alumno? Esta accion no se puede deshacer.')) {
            return;
        }
        setActionLoading('delete');
        setError('');
        try {
            const response = await apiFetch(`/teachers/me/students/${dni}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const body = await response.json().catch(() => ({}));
                throw new Error(body.message ?? 'No se pudo eliminar el alumno.');
            }
            navigate(returnTo);
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'No se pudo eliminar el alumno.';
            setError(message);
        } finally {
            setActionLoading(null);
        }
    };

    const handleResetPassword = async () => {
        if (!dni) return;
        if (!confirm('Quieres resetear la contraseña de este alumno?')) return;
        setResetting(true);
        setError('');
        try {
            const response = await apiFetch(
                `/teachers/me/students/${dni}/reset-password`,
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
                throw new Error('No se recibio la contraseña temporal.');
            }
            setResetInfo(data.temporaryPassword);
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'No se pudo resetear la contraseña.';
            setError(message);
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

    const handleSaveProfile = async () => {
        if (!dni) return;
        setSavingProfile(true);
        setError('');
        try {
            const response = await apiFetch(`/teachers/me/students/${dni}`, {
                method: 'PATCH',
                json: true,
                body: JSON.stringify({
                    firstName: editForm.firstName.trim() || null,
                    lastName: editForm.lastName.trim() || null,
                    category: editForm.category,
                    email: editForm.email.trim() || null,
                    phone: editForm.phone.trim() || null,
                    guardianPhone: editForm.guardianPhone.trim() || null,
                    birthDate: editForm.birthDate.trim() || null,
                    address: editForm.address.trim() || null,
                    gymId: editForm.gymId.trim() || null,
                }),
            });
            if (!response.ok) {
                const body = await response.json().catch(() => ({}));
                throw new Error(body.message ?? 'No se pudo actualizar el alumno.');
            }
            const updated = (await response.json()) as StudentDetailData;
            setStudent(updated);
            setEditForm({
                firstName: updated.firstName ?? '',
                lastName: updated.lastName ?? '',
                category: updated.category ?? 'ADULT',
                email: updated.email ?? '',
                phone: updated.phone ?? '',
                guardianPhone: updated.guardianPhone ?? '',
                birthDate: updated.birthDate ? updated.birthDate.split('T')[0] : '',
                address: updated.address ?? '',
                gymId: updated.gymId ?? '',
            });
            setEditingProfile(false);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'No se pudo actualizar el alumno.',
            );
        } finally {
            setSavingProfile(false);
        }
    };

    const handleToggleForm = async (form: FormAccessItem) => {
        if (!dni) return;
        setFormsUpdatingId(form.id);
        setError('');
        const nextUnlocked = !form.unlocked;

        setFormsAccess((current) =>
            current.map((item) =>
                item.id === form.id ? { ...item, unlocked: nextUnlocked } : item,
            ),
        );

        try {
            const res = await apiFetch(`/forms/student/${dni}/access`, {
                method: 'PATCH',
                json: true,
                body: JSON.stringify({ formId: form.id, unlocked: nextUnlocked }),
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.message ?? 'No se pudo actualizar el acceso.');
            }
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'No se pudo actualizar el acceso.';
            setError(message);
            setFormsAccess((current) =>
                current.map((item) =>
                    item.id === form.id ? { ...item, unlocked: form.unlocked } : item,
                ),
            );
        } finally {
            setFormsUpdatingId(null);
        }
    };

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col max-w-[480px] sm:max-w-[640px] md:max-w-[800px] mx-auto overflow-x-hidden border-x border-gray-200 bg-background-light text-[#1b0d0d]">
            <div className="sticky top-0 z-10 flex items-center bg-background-light/90 backdrop-blur-md p-4 pb-2 justify-between border-b border-gray-100">
                <Link
                    className="text-[#1b0d0d] flex size-12 shrink-0 items-center cursor-pointer"
                    to={returnTo}
                >
                    <span className="material-symbols-outlined">arrow_back_ios</span>
                </Link>
                <h2 className="text-[#1b0d0d] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
                    Detalle del Alumno
                </h2>
                <div className="flex w-12 items-center justify-end">
                    <span className="material-symbols-outlined">badge</span>
                </div>
            </div>

            <div className="flex p-4 @container">
                <div className="flex w-full flex-col gap-4 items-center">
                    <div className="flex gap-4 flex-col items-center">
                        <div className="bg-primary/10 text-primary flex items-center justify-center rounded-full h-28 w-28">
                            <span className="material-symbols-outlined text-4xl">person</span>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                            <p className="text-[#1b0d0d] text-[24px] font-bold leading-tight tracking-[-0.015em] text-center">
                                {fullName}
                            </p>
                            <p className="text-[#9a4c4c] text-sm font-medium mt-1 leading-normal text-center">
                                {student?.gym ? `Gimnasio: ${student.gym}` : 'Gimnasio sin definir'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {loading && (
                <div className="px-4 pb-4 text-sm text-gray-500">
                    Cargando alumno...
                </div>
            )}
            {error && (
                <div className="px-4 pb-4 text-sm text-red-600">{error}</div>
            )}

            <h3 className="text-[#1b0d0d] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-2">
                Información Personal
            </h3>

            <div className="flex items-center gap-4 px-4 min-h-[72px] py-2 border-b border-gray-100">
                <div className="text-[#1b0d0d] flex items-center justify-center rounded-lg bg-gray-100 shrink-0 size-12">
                    <span className="material-symbols-outlined">fingerprint</span>
                </div>
                <div className="flex flex-col justify-center">
                    <p className="text-[#1b0d0d] text-base font-medium leading-normal line-clamp-1">
                        DNI
                    </p>
                    <p className="text-[#9a4c4c] text-sm font-normal leading-normal line-clamp-2">
                        {student?.dni ?? '-'}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-4 px-4 min-h-[72px] py-2 border-b border-gray-100">
                <div className="text-[#1b0d0d] flex items-center justify-center rounded-lg bg-gray-100 shrink-0 size-12">
                    <span className="material-symbols-outlined">sell</span>
                </div>
                <div className="flex flex-col justify-center">
                    <p className="text-[#1b0d0d] text-base font-medium leading-normal line-clamp-1">
                        Tipo
                    </p>
                    <p className="text-[#9a4c4c] text-sm font-normal leading-normal line-clamp-2">
                        {categoryLabel(student?.category)}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-4 px-4 min-h-[72px] py-2 border-b border-gray-100">
                <div className="text-[#1b0d0d] flex items-center justify-center rounded-lg bg-gray-100 shrink-0 size-12">
                    <span className="material-symbols-outlined">phone</span>
                </div>
                <div className="flex flex-col justify-center">
                    <p className="text-[#1b0d0d] text-base font-medium leading-normal line-clamp-1">
                        Teléfono
                    </p>
                    <p className="text-[#9a4c4c] text-sm font-normal leading-normal line-clamp-2">
                        {student?.phone ?? '-'}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-4 px-4 min-h-[72px] py-2 border-b border-gray-100">
                <div className="text-[#1b0d0d] flex items-center justify-center rounded-lg bg-gray-100 shrink-0 size-12">
                    <span className="material-symbols-outlined">support_agent</span>
                </div>
                <div className="flex flex-col justify-center">
                    <p className="text-[#1b0d0d] text-base font-medium leading-normal line-clamp-1">
                        Tutor
                    </p>
                    <p className="text-[#9a4c4c] text-sm font-normal leading-normal line-clamp-2">
                        {student?.guardianPhone ?? '-'}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-4 px-4 min-h-[72px] py-2 border-b border-gray-100">
                <div className="text-[#1b0d0d] flex items-center justify-center rounded-lg bg-gray-100 shrink-0 size-12">
                    <span className="material-symbols-outlined">mail</span>
                </div>
                <div className="flex flex-col justify-center">
                    <p className="text-[#1b0d0d] text-base font-medium leading-normal line-clamp-1">
                        Correo electrónico
                    </p>
                    <p className="text-[#9a4c4c] text-sm font-normal leading-normal line-clamp-2">
                        {student?.email ?? '-'}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-4 px-4 min-h-[72px] py-2 border-b border-gray-100">
                <div className="text-[#1b0d0d] flex items-center justify-center rounded-lg bg-gray-100 shrink-0 size-12">
                    <span className="material-symbols-outlined">cake</span>
                </div>
                <div className="flex flex-col justify-center">
                    <p className="text-[#1b0d0d] text-base font-medium leading-normal line-clamp-1">
                        Fecha de Nacimiento
                    </p>
                    <p className="text-[#9a4c4c] text-sm font-normal leading-normal line-clamp-2">
                        {birthDateLabel}
                    </p>
                </div>
            </div>

            {isTeacher && (
                <div className="px-4 pt-4">
                    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm space-y-3">
                        <p className="text-sm font-semibold">Acciones del profesor</p>

                        {editingProfile && (
                            <div className="space-y-3 rounded-xl border border-gray-100 bg-background-light p-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <label className="space-y-1">
                                        <span className="text-xs text-gray-500">Nombre</span>
                                        <input
                                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                                            value={editForm.firstName}
                                            onChange={(event) =>
                                                setEditForm((current) => ({
                                                    ...current,
                                                    firstName: event.target.value,
                                                }))
                                            }
                                        />
                                    </label>
                                    <label className="space-y-1">
                                        <span className="text-xs text-gray-500">Apellido</span>
                                        <input
                                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                                            value={editForm.lastName}
                                            onChange={(event) =>
                                                setEditForm((current) => ({
                                                    ...current,
                                                    lastName: event.target.value,
                                                }))
                                            }
                                        />
                                    </label>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <label className="space-y-1">
                                        <span className="text-xs text-gray-500">Correo (opcional)</span>
                                        <input
                                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                                            type="email"
                                            value={editForm.email}
                                            onChange={(event) =>
                                                setEditForm((current) => ({
                                                    ...current,
                                                    email: event.target.value,
                                                }))
                                            }
                                        />
                                    </label>
                                    <label className="space-y-1">
                                        <span className="text-xs text-gray-500">Telefono (opcional)</span>
                                        <input
                                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                                            value={editForm.phone}
                                            onChange={(event) =>
                                                setEditForm((current) => ({
                                                    ...current,
                                                    phone: event.target.value,
                                                }))
                                            }
                                        />
                                    </label>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <label className="space-y-1">
                                        <span className="text-xs text-gray-500">Telefono tutor (opcional)</span>
                                        <input
                                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                                            value={editForm.guardianPhone}
                                            onChange={(event) =>
                                                setEditForm((current) => ({
                                                    ...current,
                                                    guardianPhone: event.target.value,
                                                }))
                                            }
                                        />
                                    </label>
                                    <label className="space-y-1">
                                        <span className="text-xs text-gray-500">Fecha nacimiento (opcional)</span>
                                        <input
                                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                                            type="date"
                                            value={editForm.birthDate}
                                            onChange={(event) =>
                                                setEditForm((current) => ({
                                                    ...current,
                                                    birthDate: event.target.value,
                                                }))
                                            }
                                        />
                                    </label>
                                </div>

                                <label className="space-y-1">
                                    <span className="text-xs text-gray-500">Direccion (opcional)</span>
                                    <input
                                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                                        value={editForm.address}
                                        onChange={(event) =>
                                            setEditForm((current) => ({
                                                ...current,
                                                address: event.target.value,
                                            }))
                                        }
                                    />
                                </label>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <label className="space-y-1">
                                        <span className="text-xs text-gray-500">Gimnasio</span>
                                        <select
                                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                                            value={editForm.gymId}
                                            onChange={(event) =>
                                                setEditForm((current) => ({
                                                    ...current,
                                                    gymId: event.target.value,
                                                }))
                                            }
                                        >
                                            <option value="">Sin asignacion</option>
                                            {gyms.map((gym) => (
                                                <option key={gym.id} value={gym.id}>
                                                    {gym.name}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                    <label className="space-y-1">
                                        <span className="text-xs text-gray-500">Tipo</span>
                                        <select
                                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                                            value={editForm.category}
                                            onChange={(event) =>
                                                setEditForm((current) => ({
                                                    ...current,
                                                    category: event.target.value as 'ADULT' | 'CHILD',
                                                }))
                                            }
                                        >
                                            <option value="ADULT">Adulto</option>
                                            <option value="CHILD">Infantil</option>
                                        </select>
                                    </label>
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        className="rounded-lg bg-primary text-white text-sm font-semibold px-4 py-2.5 disabled:opacity-70"
                                        type="button"
                                        onClick={handleSaveProfile}
                                        disabled={savingProfile}
                                    >
                                        {savingProfile ? 'Guardando...' : 'Guardar cambios'}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold disabled:opacity-70 ${editingProfile
                                        ? 'border-primary bg-primary/10 text-primary'
                                        : 'border-gray-200 bg-white text-[#1b0d0d]'
                                    }`}
                                type="button"
                                onClick={() => setEditingProfile((current) => !current)}
                                disabled={savingProfile}
                            >
                                <span className="material-symbols-outlined text-base">edit</span>
                                {editingProfile ? 'Cerrar edicion' : 'Editar datos'}
                            </button>
                            <button
                                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-[#1b0d0d] disabled:opacity-70"
                                type="button"
                                onClick={handleUnassign}
                                disabled={actionLoading !== null}
                            >
                                <span className="material-symbols-outlined text-base">link_off</span>
                                {actionLoading === 'unassign'
                                    ? 'Desasignando...'
                                    : 'Desasignar alumno'}
                            </button>
                            <button
                                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-[#1b0d0d] disabled:opacity-70"
                                type="button"
                                onClick={handleResetPassword}
                                disabled={resetting}
                            >
                                <span className="material-symbols-outlined text-base">key</span>
                                {resetting ? 'Reseteando...' : 'Resetear contraseña'}
                            </button>
                            <button
                                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-70"
                                type="button"
                                onClick={handleDelete}
                                disabled={actionLoading !== null}
                            >
                                <span className="material-symbols-outlined text-base">delete</span>
                                {actionLoading === 'delete' ? 'Eliminando...' : 'Eliminar alumno'}
                            </button>
                        </div>
                        {resetInfo && (
                            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 flex items-center justify-between gap-2">
                                <span>Temporal: {resetInfo}</span>
                                <button
                                    className={`text-xs font-semibold transition-all ${copiedReset
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
                </div>
            )}

            {canManageForms && (
                <div className="px-4 pt-4">
                    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm space-y-3">
                        <button
                            type="button"
                            className="flex w-full items-center justify-between gap-3"
                            onClick={() => setShowFormsAccessMenu((current) => !current)}
                        >
                            <div className="text-left">
                                <p className="text-sm font-semibold">Formas (desbloqueo manual)</p>
                                <p className="text-xs text-gray-500">
                                    {formsAccess.length} forma{formsAccess.length === 1 ? '' : 's'}
                                </p>
                            </div>
                            <span
                                className={`material-symbols-outlined text-gray-500 transition-transform ${showFormsAccessMenu ? 'rotate-180' : ''
                                    }`}
                            >
                                expand_more
                            </span>
                        </button>

                        {showFormsAccessMenu && (
                            <div className="space-y-3">
                                {formsLoading && (
                                    <span className="text-[11px] text-gray-500">Cargando...</span>
                                )}

                                {!formsLoading && formsAccess.length === 0 && (
                                    <p className="text-xs text-gray-500">
                                        No hay formas cargadas o todavía no se pudieron cargar.
                                    </p>
                                )}

                                <div className="flex flex-col gap-2">
                                    {formsAccess.map((form) => (
                                        <div
                                            key={form.id}
                                            className="flex items-center gap-3 rounded-lg border border-gray-100 bg-background-light px-3 py-2"
                                        >
                                            <a
                                                className="flex-1 min-w-0"
                                                href={form.url}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                <p className="text-sm font-semibold truncate">{form.title}</p>
                                                <p className="text-[11px] text-gray-500 mt-0.5">
                                                    Orden: {form.order} ·{' '}
                                                    {form.unlocked ? 'Desbloqueada' : 'Bloqueada'}
                                                </p>
                                            </a>
                                            <button
                                                className={`shrink-0 rounded-lg text-xs font-semibold px-3 py-2 disabled:opacity-70 ${form.unlocked
                                                        ? 'border border-gray-200 text-[#1b0d0d] bg-white'
                                                        : 'bg-primary text-white'
                                                    }`}
                                                type="button"
                                                onClick={() => handleToggleForm(form)}
                                                disabled={formsUpdatingId === form.id}
                                            >
                                                {formsUpdatingId === form.id
                                                    ? 'Guardando...'
                                                    : form.unlocked
                                                        ? 'Bloquear'
                                                        : 'Desbloquear'}
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <p className="text-[11px] text-gray-500">
                                    El alumno ve solo las formas desbloqueadas en su panel.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <h3 className="text-[#1b0d0d] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-6">
                Estado de Pagos
            </h3>

            <div className="px-4 pb-24 space-y-3">
                {fees.length === 0 && !loading && (
                    <div className="bg-white p-4 rounded-xl text-sm text-gray-500 border border-gray-100">
                        No hay cuotas registradas.
                    </div>
                )}
                {fees.map((fee) => {
                    const monthLabel = monthNames[fee.month - 1] ?? `Mes ${fee.month}`;
                    const isPaid = fee.status === 'PAID';
                    const amountLabel = Number(fee.amount).toLocaleString('es-AR');
                    return (
                        <div
                            key={fee.id}
                            className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm space-y-3"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold">
                                        {monthLabel} {fee.year}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Vence: {formatDateAsCalendar(fee.dueDate)}
                                    </p>
                                </div>
                                <span
                                    className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isPaid ? 'bg-green-100 text-green-700' : 'bg-primary/10 text-primary'
                                        }`}
                                >
                                    {isPaid ? 'Pagado' : 'Pendiente'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500">Monto</p>
                                    <p className="text-base font-bold">${amountLabel}</p>
                                    {fee.lateFeeApplied && !isPaid && (
                                        <p className="text-[11px] text-primary mt-1">
                                            Incluye recargo por mora.
                                        </p>
                                    )}
                                </div>
                                {!isPaid && (
                                    <button
                                        className="rounded-lg bg-primary text-white text-xs font-semibold px-3 py-2 disabled:opacity-70"
                                        type="button"
                                        onClick={() => handleMarkPaid(fee.id)}
                                        disabled={marking === fee.id}
                                    >
                                        {marking === fee.id ? 'Marcando...' : 'Marcar efectivo'}
                                    </button>
                                )}
                                {isPaid && fee.paidAt && (
                                    <span className="text-xs text-gray-500">
                                        {new Date(fee.paidAt).toLocaleDateString('es-AR')}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
