import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch, getProfile } from '../auth/auth';

type FormLinkItem = {
  id: string;
  title: string;
  url: string;
  order: number;
};

type FormEdit = {
  title: string;
  url: string;
};

const emptyEdit: FormEdit = { title: '', url: '' };

export function FormsManager() {
  const navigate = useNavigate();
  const profile = getProfile();
  const [forms, setForms] = useState<FormLinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [createEdit, setCreateEdit] = useState<FormEdit>(emptyEdit);
  const [editing, setEditing] = useState<FormLinkItem | null>(null);
  const [edit, setEdit] = useState<FormEdit>(emptyEdit);
  const [saving, setSaving] = useState(false);
  const [showFormsMenu, setShowFormsMenu] = useState(false);

  const title = useMemo(() => 'Formas', []);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch('/forms', { method: 'GET', cache: 'no-store' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? 'No se pudo cargar el listado.');
      }
      const list = (await res.json()) as FormLinkItem[];
      setForms(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el listado.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    const titleValue = createEdit.title.trim();
    const urlValue = createEdit.url.trim();

    if (!titleValue || !urlValue) return;

    setCreating(true);
    setError('');
    try {
      const res = await apiFetch('/forms', {
        method: 'POST',
        json: true,
        body: JSON.stringify({ title: titleValue, url: urlValue }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? 'No se pudo crear la forma.');
      }
      setCreateEdit(emptyEdit);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la forma.');
    } finally {
      setCreating(false);
    }
  };

  const openEdit = (form: FormLinkItem) => {
    setEditing(form);
    setEdit({
      title: form.title ?? '',
      url: form.url ?? '',
    });
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing) return;

    const titleValue = edit.title.trim();
    const urlValue = edit.url.trim();

    setSaving(true);
    setError('');
    try {
      const res = await apiFetch(`/forms/${editing.id}`, {
        method: 'PATCH',
        json: true,
        body: JSON.stringify({ title: titleValue, url: urlValue }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? 'No se pudo guardar la forma.');
      }
      setEditing(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la forma.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (form: FormLinkItem) => {
    if (!confirm(`¿Eliminar "${form.title}"?`)) return;
    setError('');
    try {
      const res = await apiFetch(`/forms/${form.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? 'No se pudo eliminar la forma.');
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar la forma.');
    }
  };

  const backTo =
    profile?.role === 'ADMIN'
      ? '/dashboard'
      : profile?.role === 'TEACHER'
        ? '/dashboard'
        : '/dashboard';

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
        <h1 className="text-lg font-bold">{title}</h1>
        <Link className="w-10" to={backTo} aria-label="Ir al panel" />
      </header>

      <main className="w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto p-4 pb-24 space-y-4">
        <form
          className="bg-surface rounded-2xl border border-border shadow-soft p-4 space-y-3"
          onSubmit={handleCreate}
        >
          <p className="text-sm font-bold">Nueva forma</p>
          <label className="block">
            <span className="block text-xs font-semibold text-gray-700 mb-1">
              Título
            </span>
            <input
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              placeholder="Ej: Forma 1 - Taegeuk Il Jang"
              value={createEdit.title}
              onChange={(e) =>
                setCreateEdit((p) => ({ ...p, title: e.target.value }))
              }
              disabled={creating}
              required
            />
          </label>
          <label className="block">
            <span className="block text-xs font-semibold text-gray-700 mb-1">
              URL
            </span>
            <input
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              placeholder="YouTube / Drive / etc"
              value={createEdit.url}
              onChange={(e) => setCreateEdit((p) => ({ ...p, url: e.target.value }))}
              disabled={creating}
              required
            />
          </label>
          <button
            className="w-full rounded-lg bg-primary text-white text-xs font-semibold px-4 py-2 disabled:opacity-70"
            type="submit"
            disabled={creating || !createEdit.title.trim() || !createEdit.url.trim()}
          >
            {creating ? 'Creando...' : 'Crear'}
          </button>
        </form>

        <div className="rounded-2xl border border-border bg-surface p-4 shadow-soft">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-3"
            onClick={() => setShowFormsMenu((current) => !current)}
          >
            <div className="text-left">
              <p className="text-sm font-bold">Listado de formas</p>
              <p className="text-xs text-muted">
                {forms.length} forma{forms.length === 1 ? '' : 's'}
              </p>
            </div>
            <span
              className={`material-symbols-outlined text-muted transition-transform ${
                showFormsMenu ? 'rotate-180' : ''
              }`}
            >
              expand_more
            </span>
          </button>

          {showFormsMenu && (
            <div className="mt-3 space-y-3">
              {loading && (
                <div className="bg-surface p-4 rounded-xl text-sm text-muted border border-border">
                  Cargando formas...
                </div>
              )}
              {error && (
                <div className="bg-red-50 p-4 rounded-xl text-sm text-red-600 border border-red-200">
                  {error}
                </div>
              )}
              {!loading && !error && forms.length === 0 && (
                <div className="bg-surface p-4 rounded-xl text-sm text-muted border border-border">
                  Todavia no hay formas cargadas.
                </div>
              )}

              <div className="flex flex-col gap-3">
                {forms.map((form) => (
                  <div
                    key={form.id}
                    className="flex items-center gap-3 bg-surface p-3 rounded-xl justify-between shadow-soft border border-border"
                  >
                    <a
                      className="flex items-center gap-3 flex-1 min-w-0"
                      href={form.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <div className="bg-primary/10 text-primary flex items-center justify-center rounded-full h-12 w-12">
                        <span className="material-symbols-outlined">link</span>
                      </div>
                      <div className="flex flex-col justify-center min-w-0">
                        <p className="text-text text-base font-semibold leading-tight truncate">
                          {form.title}
                        </p>
                        <p className="text-xs text-muted mt-1 truncate">{form.url}</p>
                      </div>
                    </a>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        className="rounded-lg bg-primary text-white text-xs font-semibold px-3 py-2"
                        type="button"
                        onClick={() => openEdit(form)}
                      >
                        Editar
                      </button>
                      <button
                        className="rounded-lg border border-red-200 text-red-600 text-xs font-semibold px-3 py-2"
                        type="button"
                        onClick={() => handleDelete(form)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {editing && (
        <div className="fixed inset-0 bg-black/40 z-30 flex items-end sm:items-center justify-center p-4">
          <div className="bg-surface w-full max-w-[430px] sm:max-w-[520px] md:max-w-[640px] rounded-t-2xl sm:rounded-2xl p-5 max-h-[85vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Editar forma</h2>
              <button
                className="text-gray-400"
                type="button"
                onClick={() => setEditing(null)}
                aria-label="Cerrar"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form
              className="space-y-3 flex-1 overflow-y-auto pr-1 -mr-1"
              onSubmit={handleSave}
            >
              <label className="block">
                <span className="block text-xs font-semibold text-gray-700 mb-1">
                  Título
                </span>
                <input
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                  placeholder="Ej: Forma 1 - Taegeuk Il Jang"
                  value={edit.title}
                  onChange={(e) =>
                    setEdit((p) => ({ ...p, title: e.target.value }))
                  }
                  disabled={saving}
                  required
                />
              </label>

              <label className="block">
                <span className="block text-xs font-semibold text-gray-700 mb-1">
                  URL
                </span>
                <input
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                  placeholder="YouTube / Drive / etc"
                  value={edit.url}
                  onChange={(e) => setEdit((p) => ({ ...p, url: e.target.value }))}
                  disabled={saving}
                  required
                />
              </label>
              <button
                className="w-full rounded-lg bg-primary text-white text-sm font-semibold py-3 disabled:opacity-70"
                type="submit"
                disabled={saving || !edit.title.trim() || !edit.url.trim()}
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
