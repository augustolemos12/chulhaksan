import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from './auth';

type GymItem = {
    id: string;
    name: string;
    studentsCount: number;
};

export function TeacherGyms() {
    const navigate = useNavigate();
    const [gyms, setGyms] = useState<GymItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await apiFetch('/teachers/me/gyms', { method: 'GET', cache: 'no-store' });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.message ?? 'No se pudo cargar el listado.');
            }
            const data = (await res.json()) as GymItem[];
            setGyms(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'No se pudo cargar el listado.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const totalStudents = useMemo(
        () => gyms.reduce((acc, gym) => acc + (gym.studentsCount ?? 0), 0),
        [gyms],
    );

    return (
        <div className="min-h-screen bg-background">
            <header className="w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto p-4 flex items-center justify-between">
                <button
                    className="flex size-10 items-center justify-center"
                    type="button"
                    onClick={() => navigate(-1)}
                    aria-label="Volver"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-lg font-bold">Gimnasios</h1>
                <div className="w-10" />
            </header>

            <main className="w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto p-4 pb-24 space-y-4">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold">
                            Mis alumnos
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                            {totalStudents} alumno{totalStudents === 1 ? '' : 's'} en {gyms.length}{' '}
                            gimnasio{gyms.length === 1 ? '' : 's'}
                        </p>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined">folder</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
                    <p className="text-sm font-bold">Carpetas</p>
                    <Link className="text-xs font-semibold text-primary" to="/profesor/alumnos">
                        Ver alumnos
                    </Link>
                </div>

                {loading && (
                    <div className="bg-white p-4 rounded-xl text-sm text-gray-500 border border-gray-100">
                        Cargando gimnasios...
                    </div>
                )}
                {error && (
                    <div className="bg-red-50 p-4 rounded-xl text-sm text-red-600 border border-red-200">
                        {error}
                    </div>
                )}
                {!loading && !error && gyms.length === 0 && (
                    <div className="bg-white p-4 rounded-xl text-sm text-gray-500 border border-gray-100">
                        Todavia no tenes alumnos asignados.
                    </div>
                )}

                <div className="flex flex-col gap-3">
                    {gyms.map((gym) => (
                        <div
                            key={gym.id}
                            className="flex items-center gap-3 bg-white p-3 rounded-xl justify-between shadow-sm border border-gray-100"
                        >
                            <Link
                                className="flex items-center gap-3 min-w-0 flex-1"
                                to={`/profesor/alumnos?gymId=${encodeURIComponent(gym.id)}&tab=assigned`}
                            >
                                <div className="bg-primary/10 text-primary flex items-center justify-center rounded-full h-12 w-12">
                                    <span className="material-symbols-outlined">folder</span>
                                </div>
                                <div className="flex flex-col justify-center min-w-0">
                                    <p className="text-[#1b0d0d] text-base font-semibold leading-tight truncate">
                                        {gym.name}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {gym.studentsCount} alumno{gym.studentsCount === 1 ? '' : 's'}
                                    </p>
                                </div>
                            </Link>
                            <div className="flex items-center gap-2 shrink-0">
                                <Link
                                    className="rounded-lg border border-gray-200 text-xs font-semibold px-3 py-2"
                                    to={`/profesor/gimnasios/${encodeURIComponent(gym.id)}/asistencia`}
                                >
                                    Asistencia
                                </Link>
                                <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
