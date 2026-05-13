import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    apiFetch,
    fetchMe,
    getProfile,
    type AuthProfile,
    type UserRole,
} from './auth';

type StudentProfileData = {
    dni: string;
    firstName: string;
    lastName: string;
    birthDate?: string | null;
    phone?: string | null;
    guardianPhone?: string | null;
    email?: string | null;
    gym?: string | null;
    address?: string | null;
};

type TeacherSummary = {
    firstName: string;
    lastName: string;
    assignedAt?: string;
};

type TeacherProfileData = {
    firstName: string;
    lastName: string;
    phone?: string | null;
    email?: string | null;
    birthDate?: string | null;
    address?: string | null;
    gyms?: string[] | null;
};

function formatDateAsCalendar(value: string) {
    return new Date(value).toLocaleDateString('es-AR', {
        timeZone: 'UTC',
    });
}

export function StudentProfile() {
    const [authProfile, setAuthProfile] = useState<AuthProfile | null>(
        getProfile(),
    );
    const [role, setRole] = useState<UserRole | null>(
        getProfile()?.role ?? null,
    );
    const [profile, setProfile] = useState<StudentProfileData | null>(null);
    const [teacher, setTeacher] = useState<TeacherSummary | null>(null);
    const [teacherProfile, setTeacherProfile] =
        useState<TeacherProfileData | null>(null);
    const [teacherStudentCount, setTeacherStudentCount] = useState<number | null>(
        null,
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadProfile = async () => {
            try {
                let currentProfile = authProfile;
                if (!currentProfile) {
                    currentProfile = await fetchMe();
                    setAuthProfile(currentProfile);
                }

                setRole(currentProfile.role);

                if (currentProfile.role === 'STUDENT') {
                    const response = await apiFetch('/students/me', { method: 'GET' });
                    if (!response.ok) {
                        const body = await response.json().catch(() => ({}));
                        throw new Error(body.message ?? 'No se pudo cargar el perfil.');
                    }
                    const data = (await response.json()) as StudentProfileData;
                    setProfile(data);
                    const teacherResponse = await apiFetch('/students/me/teacher', {
                        method: 'GET',
                    });
                    if (teacherResponse.ok) {
                        const teacherData =
                            (await teacherResponse.json()) as TeacherSummary | null;
                        setTeacher(teacherData);
                    } else {
                        setTeacher(null);
                    }
                } else if (currentProfile.role === 'TEACHER') {
                    const [teacherResponse, studentsResponse] = await Promise.all([
                        apiFetch('/teachers/me', { method: 'GET' }),
                        apiFetch('/teachers/me/students', { method: 'GET' }),
                    ]);

                    if (!teacherResponse.ok) {
                        const body = await teacherResponse.json().catch(() => ({}));
                        throw new Error(body.message ?? 'No se pudo cargar el perfil.');
                    }
                    const data = (await teacherResponse.json()) as TeacherProfileData;
                    setTeacherProfile(data);

                    if (studentsResponse.ok) {
                        const payload = (await studentsResponse.json()) as
                            | unknown[]
                            | { data?: unknown[]; total?: number; page?: number; limit?: number };
                        if (Array.isArray(payload)) {
                            setTeacherStudentCount(payload.length);
                        } else {
                            setTeacherStudentCount(
                                payload?.total ?? payload?.data?.length ?? 0,
                            );
                        }
                    } else {
                        setTeacherStudentCount(null);
                    }
                }
            } catch (err) {
                const message =
                    err instanceof Error
                        ? err.message
                        : 'No se pudo cargar el perfil.';
                setError(message);
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, []);

    const fullName = useMemo(() => {
        if (role === 'TEACHER') {
            if (!teacherProfile) return 'Profesor';
            return `${teacherProfile.firstName} ${teacherProfile.lastName}`;
        }
        if (role === 'ADMIN') return 'Administrador';
        if (!profile) return 'Alumno';
        return `${profile.firstName} ${profile.lastName}`;
    }, [profile, role, teacherProfile]);

    const birthDateLabel = useMemo(() => {
        if (!profile?.birthDate) return '-';
        return formatDateAsCalendar(profile.birthDate);
    }, [profile]);

    const teacherBirthDateLabel = useMemo(() => {
        if (!teacherProfile?.birthDate) return '-';
        return formatDateAsCalendar(teacherProfile.birthDate);
    }, [teacherProfile]);

    const isTeacher = role === 'TEACHER';
    const isAdmin = role === 'ADMIN';
    const isStudent = role === 'STUDENT';

    return (
        <div className="min-h-screen bg-background-light text-[#1b0d0d]">
            <header className="sticky top-0 z-20 bg-background-light/80 backdrop-blur-md border-b border-gray-200">
                <div className="flex items-center p-4 justify-between w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto">
                    <Link
                        className="text-[#1b0d0d] flex size-10 shrink-0 items-center justify-center"
                        to="/dashboard"
                    >
                        <span className="material-symbols-outlined">arrow_back_ios</span>
                    </Link>
                    <h2 className="text-[#1b0d0d] text-lg font-bold leading-tight tracking-tight flex-1 text-center">
                        {isTeacher
                            ? 'Perfil del Profesor'
                            : isAdmin
                                ? 'Perfil del Administrador'
                                : 'Perfil del Alumno'}
                    </h2>
                    <div className="flex w-10 items-center justify-end">
                        <span className="material-symbols-outlined">person</span>
                    </div>
                </div>
            </header>

            <main className="w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto pb-24">
                <section className="p-4">
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
                        <div
                            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-20 w-20 border-2 border-primary"
                            style={{
                                backgroundImage:
                                    'url(\"https://lh3.googleusercontent.com/aida-public/AB6AXuAos5xQbdG0hopRVsTPpirAP0KbSkbwXsF01UGAMj1noMqHm6Vc45_Nq1nXZoQluBpRJRM_3x6J5l3qIiIjj4Kz3hzlnnggc9D3YIpjUGVE82iENCBnwKb_uutYZCpfaEnXcfE-HETPtNWEVy14tzaeDMlXVUtRSyIrkNZMZ6bQegcqEfUuRuhZ_WiJ4u3O6SFgkXkWoAPvIc9jlG0Gm0GkYpSVx-oIviQtjbdgYUF2JMkK9WdFcyjg7hr7ZKMnXz22eTiTHhatuixZ\")',
                            }}
                        />
                        <div className="flex flex-col">
                            <p className="text-xl font-bold leading-tight">{fullName}</p>
                            {!isStudent && (
                                <p className="text-gray-600 text-sm font-medium">
                                    {isTeacher ? 'Profesor' : 'Administrador'}
                                </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                                {isTeacher
                                    ? 'Profesor activo'
                                    : isAdmin
                                        ? 'Acceso administrador'
                                        : 'Alumno activo'}
                            </p>
                        </div>
                    </div>
                </section>

                {isStudent && (
                    <section className="px-4">
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                            <h3 className="text-sm uppercase tracking-[0.2em] text-primary font-bold">
                                Profesor Actual
                            </h3>
                            <div className="mt-3 flex items-center gap-3">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined">sports_martial_arts</span>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">
                                        {teacher
                                            ? `Prof. ${teacher.firstName} ${teacher.lastName}`
                                            : 'Sin profesor asignado'}
                                    </p>
                                    <p className="text-xs text-gray-500">Asignación actual</p>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                <section className="px-4 mt-6 space-y-3">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <div className="px-4 py-3 border-b border-gray-100">
                            <h3 className="text-base font-bold">Datos Personales</h3>
                            <p className="text-xs text-gray-500 mt-1">
                                Solo lectura. Contactá a administración si necesitas cambios.
                            </p>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {loading && (
                                <div className="px-4 py-3 text-sm text-gray-500">
                                    Cargando perfil...
                                </div>
                            )}
                            {error && (
                                <div className="px-4 py-3 text-sm text-red-600">{error}</div>
                            )}
                            {isStudent && (
                                <>
                                    <div className="px-4 py-3 flex items-center justify-between">
                                        <span className="text-sm text-gray-500">DNI</span>
                                        <span className="text-sm font-semibold">
                                            {profile?.dni ?? '-'}
                                        </span>
                                    </div>
                                    <div className="px-4 py-3 flex items-center justify-between">
                                        <span className="text-sm text-gray-500">Teléfono</span>
                                        <span className="text-sm font-semibold">
                                            {profile?.phone ?? '-'}
                                        </span>
                                    </div>
                                    <div className="px-4 py-3 flex items-center justify-between">
                                        <span className="text-sm text-gray-500">Teléfono tutor</span>
                                        <span className="text-sm font-semibold">
                                            {profile?.guardianPhone ?? '-'}
                                        </span>
                                    </div>
                                    <div className="px-4 py-3 flex items-center justify-between">
                                        <span className="text-sm text-gray-500">Gimnasio</span>
                                        <span className="text-sm font-semibold">
                                            {profile?.gym ?? '-'}
                                        </span>
                                    </div>
                                    <div className="px-4 py-3 flex items-center justify-between">
                                        <span className="text-sm text-gray-500">Correo electrónico</span>
                                        <span className="text-sm font-semibold">
                                            {profile?.email ?? '-'}
                                        </span>
                                    </div>
                                    <div className="px-4 py-3 flex items-center justify-between">
                                        <span className="text-sm text-gray-500">Dirección</span>
                                        <span className="text-sm font-semibold">
                                            {profile?.address ?? '-'}
                                        </span>
                                    </div>
                                    <div className="px-4 py-3 flex items-center justify-between">
                                        <span className="text-sm text-gray-500">Nacimiento</span>
                                        <span className="text-sm font-semibold">{birthDateLabel}</span>
                                    </div>
                                </>
                            )}
                            {isTeacher && (
                                <>
                                    <div className="px-4 py-3 flex items-center justify-between">
                                        <span className="text-sm text-gray-500">DNI</span>
                                        <span className="text-sm font-semibold">
                                            {authProfile?.dni ?? '-'}
                                        </span>
                                    </div>
                                    <div className="px-4 py-3 flex items-center justify-between">
                                        <span className="text-sm text-gray-500">Alumnos asignados</span>
                                        <span className="text-sm font-semibold">
                                            {teacherStudentCount ?? '-'}
                                        </span>
                                    </div>
                                    <div className="px-4 py-3 flex items-center justify-between">
                                        <span className="text-sm text-gray-500">Teléfono</span>
                                        <span className="text-sm font-semibold">
                                            {teacherProfile?.phone ?? '-'}
                                        </span>
                                    </div>
                                    <div className="px-4 py-3 flex items-center justify-between">
                                        <span className="text-sm text-gray-500">Correo electrónico</span>
                                        <span className="text-sm font-semibold">
                                            {teacherProfile?.email ?? '-'}
                                        </span>
                                    </div>
                                    <div className="px-4 py-3 flex items-center justify-between">
                                        <span className="text-sm text-gray-500">Dirección</span>
                                        <span className="text-sm font-semibold">
                                            {teacherProfile?.address ?? '-'}
                                        </span>
                                    </div>
                                    <div className="px-4 py-3 flex items-center justify-between">
                                        <span className="text-sm text-gray-500">Nacimiento</span>
                                        <span className="text-sm font-semibold">
                                            {teacherBirthDateLabel}
                                        </span>
                                    </div>
                                    <div className="px-4 py-3 flex items-center justify-between">
                                        <span className="text-sm text-gray-500">Gimnasios</span>
                                        <span className="text-sm font-semibold">
                                            {teacherProfile?.gyms && teacherProfile.gyms.length > 0
                                                ? teacherProfile.gyms.join(', ')
                                                : '-'}
                                        </span>
                                    </div>
                                </>
                            )}
                            {isAdmin && (
                                <div className="px-4 py-3 flex items-center justify-between">
                                    <span className="text-sm text-gray-500">DNI</span>
                                    <span className="text-sm font-semibold">
                                        {authProfile?.dni ?? '-'}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
