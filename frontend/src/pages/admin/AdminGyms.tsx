import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../auth/auth';

type GymItem = {
  id: string;
  name: string;
  isArchived: boolean;
  studentsCount: number;
};

export function AdminGyms() {
  const navigate = useNavigate();
  const [gyms, setGyms] = useState<GymItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [name, setName] = useState('');
  const [query, setQuery] = useState('');
  const [gymToDelete, setGymToDelete] = useState<GymItem | null>(null);
  const [targetGymId, setTargetGymId] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch('/admin/gyms', {
        method: 'GET',
        cache: 'no-store',
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? 'No se pudo cargar el listado.');
      }

      const data = (await res.json()) as GymItem[];

      setGyms(
        Array.isArray(data) ? data.filter((gym) => !gym.isArchived) : [],
      );
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

  useEffect(() => {
    load();
  }, []);

  const totalStudents = useMemo(
    () => gyms.reduce((acc, gym) => acc + (gym.studentsCount ?? 0), 0),
    [gyms],
  );

  const filteredGyms = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) return gyms;

    return gyms.filter((gym) =>
      gym.name.toLowerCase().includes(search),
    );
  }, [gyms, query]);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();

    const trimmed = name.trim();
    if (!trimmed) return;

    setCreating(true);
    setError('');

    try {
      const res = await apiFetch('/admin/gyms', {
        method: 'POST',
        json: true,
        body: JSON.stringify({ name: trimmed }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? 'No se pudo crear el gimnasio.');
      }

      setName('');
      await load();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo crear el gimnasio.',
      );
    } finally {
      setCreating(false);
    }
  };

  const handleRename = async (gym: GymItem) => {
    const next = window
      .prompt(`Renombrar "${gym.name}"`, gym.name)
      ?.trim();

    if (!next || next === gym.name) return;

    setError('');

    try {
      const res = await apiFetch(`/admin/gyms/${gym.id}`, {
        method: 'PATCH',
        json: true,
        body: JSON.stringify({ name: next }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? 'No se pudo renombrar el gimnasio.');
      }

      await load();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo renombrar el gimnasio.',
      );
    }
  };

  const openDeleteModal = (gym: GymItem) => {
    if (gym.isArchived) {
      setError('Ese gimnasio ya está archivado.');
      return;
    }

    setGymToDelete(gym);
    setTargetGymId('');
    setError('');
  };

  const closeDeleteModal = () => {
    setGymToDelete(null);
    setTargetGymId('');
  };

  const handleDeleteGym = async () => {
    if (!gymToDelete || deleting) return;

    setDeleting(true);
    setError('');

    try {
      const res = await apiFetch(`/admin/gyms/${gymToDelete.id}`, {
        method: 'DELETE',
        json: true,
        body: JSON.stringify(
          targetGymId ? { targetGymId } : {},
        ),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? 'No se pudo eliminar el gimnasio.');
      }

      closeDeleteModal();
      await load();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo eliminar el gimnasio.',
      );
    } finally {
      setDeleting(false);
    }
  };

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
              Totales
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {gyms.length} gimnasios activos - {totalStudents} alumnos
            </p>
          </div>

          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">folder</span>
          </div>
        </div>

        <form
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex gap-2"
          onSubmit={handleCreate}
        >
          <input
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            placeholder="Nuevo gimnasio (ej: Riodorado)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={creating}
          />

          <button
            className="rounded-lg bg-primary text-white text-xs font-semibold px-4 py-2 disabled:opacity-70"
            type="submit"
            disabled={creating || !name.trim()}
          >
            {creating ? 'Creando...' : 'Crear'}
          </button>
        </form>

        <label className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-gray-400">
            search
          </span>

          <input
            className="w-full bg-transparent text-sm outline-none"
            placeholder="Buscar gimnasio por nombre"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>

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
            No hay gimnasios para mostrar.
          </div>
        )}

        {!loading && !error && gyms.length > 0 && filteredGyms.length === 0 && (
          <div className="bg-white p-4 rounded-xl text-sm text-gray-500 border border-gray-100">
            No hay resultados para "{query.trim()}".
          </div>
        )}

        <div className="flex flex-col gap-3">
          {filteredGyms.map((gym) => (
            <div
              key={gym.id}
              className="flex items-center gap-3 bg-white p-3 rounded-xl justify-between shadow-sm border border-gray-100"
            >
              <Link
                className="flex items-center gap-3 flex-1 min-w-0"
                to={`/admin/alumnos?gymId=${encodeURIComponent(gym.id)}`}
              >
                <div className="bg-primary/10 text-primary flex items-center justify-center rounded-full h-12 w-12">
                  <span className="material-symbols-outlined">folder</span>
                </div>

                <div className="flex flex-col justify-center min-w-0">
                  <p className="text-[#1b0d0d] text-base font-semibold leading-tight truncate">
                    {gym.name}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    {gym.studentsCount} alumno
                    {gym.studentsCount === 1 ? '' : 's'}
                  </p>
                </div>
              </Link>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  className="rounded-lg border border-gray-200 text-xs font-semibold px-3 py-2"
                  to={`/admin/gimnasios/${encodeURIComponent(
                    gym.id,
                  )}/asistencia`}
                >
                  Asistencia
                </Link>

                <button
                  className="rounded-lg border border-gray-200 text-xs font-semibold px-3 py-2"
                  type="button"
                  onClick={() => handleRename(gym)}
                >
                  Renombrar
                </button>

                <button
                  className="rounded-lg border border-red-200 text-red-600 text-xs font-semibold px-3 py-2"
                  type="button"
                  onClick={() => openDeleteModal(gym)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {gymToDelete && (
        <div className="fixed inset-0 z-30 bg-black/40 flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white border border-gray-100 shadow-xl p-5">
            <h2 className="text-base font-bold text-[#1b0d0d]">
              Eliminar gimnasio
            </h2>

            <p className="text-sm text-gray-600 mt-2">
              Podés mover alumnos a otro gimnasio o dejarlos sin asignación.
            </p>

            <label className="block mt-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Mover alumnos a (opcional)
            </label>

            <select
              className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
              value={targetGymId}
              onChange={(event) => setTargetGymId(event.target.value)}
              disabled={deleting}
            >
              <option value="">Sin asignación</option>

              {gyms
                .filter(
                  (gym) =>
                    gym.id !== gymToDelete.id &&
                    !gym.isArchived,
                )
                .map((gym) => (
                  <option key={gym.id} value={gym.id}>
                    {gym.name}
                  </option>
                ))}
            </select>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                className="rounded-lg border border-gray-200 text-sm font-semibold px-3 py-2"
                type="button"
                onClick={closeDeleteModal}
                disabled={deleting}
              >
                Cancelar
              </button>

              <button
                className="rounded-lg bg-red-600 text-white text-sm font-semibold px-3 py-2 disabled:opacity-70"
                type="button"
                onClick={handleDeleteGym}
                disabled={deleting}
              >
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}