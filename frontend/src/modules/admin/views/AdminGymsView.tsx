import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminGyms } from '../hooks/useAdminGyms';

export function AdminGymsView() {
  const navigate = useNavigate();
  const {
    gyms, loading, error, query, setQuery, name, setName, creating, handleCreate, handleRename,
    totalStudents, filteredGyms, openDeleteModal, closeDeleteModal, handleDeleteGym, gymToDelete, targetGymId, setTargetGymId, deleting
  } = useAdminGyms();

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-text">
      <header className="w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto p-4 flex items-center justify-between">
        <button className="flex size-10 items-center justify-center" type="button" onClick={() => navigate(-1)} aria-label="Volver">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold">Gimnasios</h1>
        <button className="flex items-center gap-2 rounded-lg bg-primary text-white text-sm font-semibold px-4 py-2 hover:bg-primary/90 transition-colors shadow-sm" type="button" onClick={() => setIsCreateOpen(true)} aria-label="Agregar gimnasio">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Crear Gimnasio
        </button>
      </header>

      <main className="w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto p-4 pb-24 space-y-4">
        <div className="bg-surface rounded-2xl border border-border shadow-soft p-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold">Totales</p>
            <p className="text-sm text-muted mt-1">{gyms.length} gimnasios activos - {totalStudents} alumnos</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">folder</span>
          </div>
        </div>


        <label className="bg-surface rounded-2xl border border-border shadow-soft p-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-gray-400">search</span>
          <input className="w-full bg-transparent text-sm outline-none" placeholder="Buscar gimnasio por nombre" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>

        {loading && <div className="bg-surface p-4 rounded-xl text-sm text-muted border border-border">Cargando gimnasios...</div>}
        {error && <div className="bg-red-50 p-4 rounded-xl text-sm text-red-600 border border-red-200">{error}</div>}
        {!loading && !error && gyms.length === 0 && <div className="bg-surface p-4 rounded-xl text-sm text-muted border border-border">No hay gimnasios para mostrar.</div>}
        {!loading && !error && gyms.length > 0 && filteredGyms.length === 0 && <div className="bg-surface p-4 rounded-xl text-sm text-muted border border-border">No hay resultados para "{query.trim()}".</div>}

        <div className="flex flex-col gap-3">
          {filteredGyms.map((gym) => (
            <div key={gym.id} className="flex items-center gap-3 bg-surface p-3 rounded-xl justify-between shadow-soft border border-border">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="bg-primary/10 text-primary flex items-center justify-center rounded-full h-12 w-12 shrink-0">
                  <span className="material-symbols-outlined">folder</span>
                </div>
                <div className="flex flex-col justify-center min-w-0">
                  <p className="text-text text-base font-semibold leading-tight truncate">{gym.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link className="rounded-lg border border-border text-xs font-semibold px-3 py-2" to={`/admin/alumnos?gymId=${encodeURIComponent(gym.id)}`}>Ver alumnos</Link>
                <Link className="rounded-lg border border-border text-xs font-semibold px-3 py-2" to={`/admin/gimnasios/${encodeURIComponent(gym.id)}/asistencia`}>Asistencia</Link>
                <button className="rounded-lg border border-border text-xs font-semibold px-3 py-2" type="button" onClick={() => handleRename(gym)}>Renombrar</button>
                <button className="rounded-lg border border-red-200 text-red-600 text-xs font-semibold px-3 py-2" type="button" onClick={() => openDeleteModal(gym)}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {gymToDelete && (
        <div className="fixed inset-0 z-30 bg-black/40 flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-surface border border-border shadow-xl p-5">
            <h2 className="text-base font-bold text-text">Eliminar gimnasio</h2>
            <p className="text-sm text-muted mt-2">Podés mover alumnos a otro gimnasio o dejarlos sin asignación.</p>
            <label className="block mt-4 text-xs font-semibold text-muted uppercase tracking-wide">Mover alumnos a (opcional)</label>
            <select className="mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm" value={targetGymId} onChange={(e) => setTargetGymId(e.target.value)} disabled={deleting}>
              <option value="">Sin asignación</option>
              {gyms.filter((g) => g.id !== gymToDelete.id && !g.isArchived).map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button className="rounded-lg border border-border text-sm font-semibold px-3 py-2" type="button" onClick={closeDeleteModal} disabled={deleting}>Cancelar</button>
              <button className="rounded-lg bg-red-600 text-white text-sm font-semibold px-3 py-2 disabled:opacity-70" type="button" onClick={handleDeleteGym} disabled={deleting}>{deleting ? 'Eliminando...' : 'Eliminar'}</button>
            </div>
          </div>
        </div>
      )}

      {isCreateOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-surface border border-border shadow-xl p-5">
            <h2 className="text-base font-bold text-text">Agregar Gimnasio</h2>
            <form onSubmit={async (e) => {
              const success = await handleCreate(e);
              if (success) setIsCreateOpen(false);
            }} className="mt-4 space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-muted font-medium">Nombre del gimnasio</label>
                <input 
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:ring-1 focus:ring-primary outline-none" 
                  placeholder="Ej: Sede Central" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  disabled={creating} 
                  required
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button 
                  className="flex-1 rounded-lg border border-border text-sm font-semibold px-3 py-2.5" 
                  type="button" 
                  onClick={() => setIsCreateOpen(false)} 
                  disabled={creating}
                >
                  Cancelar
                </button>
                <button 
                  className="flex-1 rounded-lg bg-primary text-white text-sm font-semibold px-3 py-2.5 disabled:opacity-70" 
                  type="submit" 
                  disabled={creating || !name.trim()}
                >
                  {creating ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
