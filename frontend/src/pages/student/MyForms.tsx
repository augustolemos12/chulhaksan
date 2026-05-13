import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../auth/auth';

type FormLinkItem = {
    id: string;
    title: string;
    url: string;
    order: number;
};

export function MyForms() {
    const navigate = useNavigate();

    const [forms, setForms] = useState<FormLinkItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError('');

            try {
                const res = await apiFetch('/forms/me', {
                    method: 'GET',
                    cache: 'no-store',
                });

                if (!res.ok) {
                    const body = await res.json().catch(() => ({}));
                    throw new Error(body.message ?? 'No se pudo cargar el listado.');
                }

                const list = (await res.json()) as FormLinkItem[];
                setForms(Array.isArray(list) ? list : []);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : 'No se pudo cargar el listado.',
                );
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    return (
        <div className="min-h-screen bg-background text-text">
            <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-md">
                <div className="flex items-center justify-between w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto p-4">
                    <button
                        className="flex size-10 items-center justify-center rounded-full hover:bg-surface transition-colors"
                        type="button"
                        onClick={() => navigate(-1)}
                        aria-label="Volver"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>

                    <div className="text-center">
                        <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold">
                            Biblioteca
                        </p>
                        <h1 className="text-lg font-bold leading-tight">
                            Mis formas
                        </h1>
                    </div>

                    <div className="w-10" />
                </div>
            </header>

            <main className="w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto p-4 pb-24 space-y-5">
                <section className="bg-surface border border-border rounded-3xl p-5 shadow-soft">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold">
                                Material desbloqueado
                            </p>

                            <h2 className="mt-2 text-xl font-bold">
                                Tus formas disponibles
                            </h2>

                            <p className="mt-1 text-sm text-muted">
                                Accedé rapidamente al contenido compartido por tu profesor.
                            </p>
                        </div>

                        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <span className="material-symbols-outlined text-3xl">
                                link
                            </span>
                        </div>
                    </div>

                    <div className="mt-5 flex items-center gap-2 flex-wrap">
                        <span className="rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold">
                            {forms.length} forma{forms.length === 1 ? '' : 's'}
                        </span>

                        {!loading && forms.length > 0 && (
                            <span className="rounded-full bg-green-50 text-green-700 border border-green-200 px-3 py-1 text-xs font-semibold">
                                Disponible
                            </span>
                        )}
                    </div>
                </section>

                {loading && (
                    <div className="bg-surface border border-border rounded-2xl p-5 shadow-soft">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                            <div>
                                <p className="text-sm font-semibold">
                                    Cargando formas...
                                </p>
                                <p className="text-xs text-muted">
                                    Esperá un momento.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                        {error}
                    </div>
                )}

                {!loading && !error && forms.length === 0 && (
                    <div className="bg-surface border border-border rounded-3xl p-8 shadow-soft text-center">
                        <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                            <span className="material-symbols-outlined text-3xl">
                                lock
                            </span>
                        </div>

                        <h3 className="mt-4 text-lg font-bold">
                            Todavía no tenés formas
                        </h3>

                        <p className="mt-2 text-sm text-muted">
                            Cuando tu profesor desbloquee contenido, aparecerá acá.
                        </p>
                    </div>
                )}

                {!loading && !error && forms.length > 0 && (
                    <section className="space-y-3">
                        {forms.map((form, index) => (
                            <a
                                key={form.id}
                                href={form.url}
                                target="_blank"
                                rel="noreferrer"
                                className="group flex items-center justify-between gap-4 rounded-3xl border border-border bg-surface p-4 shadow-soft hover:shadow-md hover:-translate-y-0.5 transition-all"
                            >
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined">
                                            school
                                        </span>
                                    </div>

                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                                                Forma #{index + 1}
                                            </span>
                                        </div>

                                        <h3 className="text-base font-bold leading-tight truncate">
                                            {form.title}
                                        </h3>

                                        <p className="mt-1 text-xs text-muted truncate">
                                            {form.url}
                                        </p>
                                    </div>
                                </div>

                                <div className="shrink-0 flex items-center gap-2">
                                    <span className="hidden sm:flex rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold">
                                        Abrir
                                    </span>

                                    <span className="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors">
                                        open_in_new
                                    </span>
                                </div>
                            </a>
                        ))}
                    </section>
                )}

                <div className="pt-2 text-center">
                    <Link
                        className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
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