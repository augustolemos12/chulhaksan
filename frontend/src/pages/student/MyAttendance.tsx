import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { apiFetch } from '../auth/auth';

type Row = {
    id: string;
    date: string;
    present: boolean;
    notes: string | null;
    gym?: { name: string } | null;
};

function formatDate(raw: string) {
    const d = new Date(raw);

    if (Number.isNaN(d.getTime())) return raw;

    return d.toLocaleDateString('es-AR', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
    });
}

export function MyAttendance() {
    const navigate = useNavigate();

    const [rows, setRows] = useState<Row[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = async () => {
        setLoading(true);
        setError('');

        try {
            const res = await apiFetch('/attendance/me', {
                method: 'GET',
                cache: 'no-store',
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));

                throw new Error(
                    body.message ?? 'No se pudo cargar tu asistencia.',
                );
            }

            const data = (await res.json()) as Row[];

            setRows(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'No se pudo cargar tu asistencia.',
            );

            setRows([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const stats = useMemo(() => {
        const total = rows.length;

        const present = rows.filter((r) => r.present).length;

        const absent = total - present;

        const percentage =
            total > 0
                ? Math.round((present / total) * 100)
                : 0;

        return {
            total,
            present,
            absent,
            percentage,
        };
    }, [rows]);

    return (
        <div className="min-h-screen bg-background-light">
            <header className="sticky top-0 z-20 bg-background-light/80 backdrop-blur-md border-b border-gray-100">
                <div className="w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto p-4 flex items-center justify-between">
                    <button
                        className="flex size-10 items-center justify-center rounded-xl hover:bg-white transition-colors"
                        type="button"
                        onClick={() => navigate(-1)}
                        aria-label="Volver"
                    >
                        <span className="material-symbols-outlined">
                            arrow_back
                        </span>
                    </button>

                    <div className="text-center">
                        <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold">
                            Alumno
                        </p>

                        <h1 className="text-lg font-bold text-[#1b0d0d]">
                            Mis asistencias
                        </h1>
                    </div>

                    <div className="w-10" />
                </div>
            </header>

            <main className="w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto p-4 pb-24 space-y-5">
                <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold">
                                Resumen
                            </p>

                            <h2 className="text-xl font-bold mt-1 text-[#1b0d0d]">
                                {stats.percentage}% de asistencia
                            </h2>

                            <p className="text-sm text-gray-500 mt-1">
                                Historial general de clases
                            </p>
                        </div>

                        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined">
                                checklist
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mt-5">
                        <div className="rounded-2xl bg-background p-4 border border-gray-100">
                            <p className="text-xs text-gray-500">
                                Total
                            </p>

                            <p className="text-2xl font-bold mt-1">
                                {stats.total}
                            </p>
                        </div>

                        <div className="rounded-2xl bg-green-50 border border-green-100 p-4">
                            <p className="text-xs text-green-700">
                                Presentes
                            </p>

                            <p className="text-2xl font-bold mt-1 text-green-700">
                                {stats.present}
                            </p>
                        </div>

                        <div className="rounded-2xl bg-red-50 border border-red-100 p-4">
                            <p className="text-xs text-red-700">
                                Ausentes
                            </p>

                            <p className="text-2xl font-bold mt-1 text-red-700">
                                {stats.absent}
                            </p>
                        </div>
                    </div>
                </section>

                {loading && (
                    <div className="bg-white p-5 rounded-2xl text-sm text-gray-500 border border-gray-100 shadow-sm">
                        Cargando asistencias...
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 p-5 rounded-2xl text-sm text-red-600 border border-red-200 shadow-sm">
                        {error}
                    </div>
                )}

                {!loading && !error && rows.length === 0 && (
                    <div className="bg-white p-5 rounded-2xl text-sm text-gray-500 border border-gray-100 shadow-sm">
                        Todavía no hay asistencias registradas.
                    </div>
                )}

                {!loading && !error && rows.length > 0 && (
                    <section className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <p className="text-xs uppercase tracking-[0.2em] text-gray-500 font-bold">
                                Historial
                            </p>

                            <span className="text-xs text-gray-400">
                                {rows.length} registros
                            </span>
                        </div>

                        {rows.map((r) => (
                            <div
                                key={r.id}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between gap-4 hover:shadow-md transition-all"
                            >
                                <div className="flex items-center gap-4 min-w-0">
                                    <div
                                        className={`h-12 w-12 rounded-2xl flex items-center justify-center border ${r.present
                                                ? 'bg-green-50 border-green-200 text-green-700'
                                                : 'bg-red-50 border-red-200 text-red-700'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined">
                                            {r.present ? 'done' : 'close'}
                                        </span>
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-[#1b0d0d]">
                                            {formatDate(r.date)}
                                        </p>

                                        <p className="text-xs text-gray-500 mt-1 truncate">
                                            {r.gym?.name
                                                ? r.gym.name
                                                : 'Sin gimnasio'}
                                        </p>

                                        {r.notes && (
                                            <p className="text-xs text-gray-400 mt-1 truncate">
                                                {r.notes}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <span
                                        className={`text-[11px] font-bold rounded-full px-3 py-1.5 border whitespace-nowrap ${r.present
                                                ? 'bg-green-50 text-green-700 border-green-200'
                                                : 'bg-red-50 text-red-700 border-red-200'
                                            }`}
                                    >
                                        {r.present
                                            ? 'PRESENTE'
                                            : 'AUSENTE'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </section>
                )}

                <div className="pt-2 text-center">
                    <Link
                        className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:opacity-80 transition-opacity"
                        to="/dashboard"
                    >
                        <span className="material-symbols-outlined text-base">
                            dashboard
                        </span>
                        Volver al panel
                    </Link>
                </div>
            </main>
        </div>
    );
}