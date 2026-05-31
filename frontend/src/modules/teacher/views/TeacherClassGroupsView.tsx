import { Link } from 'react-router-dom';
import { useTeacherClassGroups, type DayOfWeek } from '../hooks/useTeacherClassGroups';
import { CreateClassGroupModal, EditClassGroupModal } from '../components/TeacherClassGroupModals';

const DAYS_ES: Record<DayOfWeek, string> = {
  MONDAY: 'Lun', TUESDAY: 'Mar', WEDNESDAY: 'Mié', THURSDAY: 'Jue',
  FRIDAY: 'Vie', SATURDAY: 'Sáb', SUNDAY: 'Dom'
};

export function TeacherClassGroupsView() {
  const {
    classGroups, total, loading, error, gymFilter, setGymFilter, categoryFilter, setCategoryFilter,
    page, setPage, pageSize, gyms,
    createOpen, setCreateOpen, createForm, setCreateForm, creating, createError, handleCreate,
    editing, setEditing, form, setForm, saving, editError, handleSave, openEdit, handleDelete
  } = useTeacherClassGroups();

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageStart = Math.max(1, Math.min(page - 2, totalPages - 4));
  const pageEnd = Math.min(totalPages, pageStart + 4);

  return (
    <div className="min-h-screen bg-background text-text">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center p-4 justify-between w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto">
          <Link className="text-text flex size-10 shrink-0 items-center justify-center" to="/dashboard">
            <span className="material-symbols-outlined">arrow_back_ios</span>
          </Link>
          <h1 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10">
            Mis Comisiones
          </h1>
          <button className="flex items-center gap-2 rounded-lg bg-primary text-white text-sm font-semibold px-4 py-2 hover:bg-primary/90 transition-colors shadow-sm" type="button" onClick={() => setCreateOpen(true)}>
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            Nueva
          </button>
        </div>
      </header>

      <main className="w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto p-4 pb-24 space-y-4">
        <div className="bg-surface rounded-2xl border border-border shadow-soft p-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold">Total comisiones</p>
            <p className="text-2xl font-bold text-text">{total}</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">class</span>
          </div>
        </div>

        <div className="bg-surface rounded-2xl border border-border shadow-soft p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined">filter_list</span>
            </div>
            <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold">Gimnasio</p>
                <select className="mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm" value={gymFilter} onChange={(e) => setGymFilter(e.target.value)}>
                  <option value="">Todos los gimnasios</option>
                  {gyms.map((g) => <option key={g.id} value={g.id}>{g.name}{g.isArchived ? ' (Archivado)' : ''}</option>)}
                </select>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold">Categoría</p>
                <select className="mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as 'ADULT' | 'CHILD' | '')}>
                  <option value="">Todas</option>
                  <option value="ADULT">Adultos</option>
                  <option value="CHILD">Infantiles</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {loading && <div className="bg-surface p-4 rounded-xl text-sm text-muted border border-border">Cargando comisiones...</div>}
        {error && <div className="bg-red-50 p-4 rounded-xl text-sm text-red-600 border border-red-200">{error}</div>}
        {!loading && !error && classGroups.length === 0 && <div className="bg-surface p-4 rounded-xl text-sm text-muted border border-border">No tenés comisiones creadas.</div>}

        <div className="flex flex-col gap-3">
          {classGroups.map((cg) => (
            <div key={cg.id} className="flex flex-col sm:flex-row sm:items-center gap-4 bg-surface p-4 rounded-xl justify-between shadow-soft border border-border">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${cg.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {cg.isActive ? 'Activa' : 'Inactiva'}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-primary/10 text-primary">
                    {cg.category === 'CHILD' ? 'Infantil' : 'Adulto'}
                  </span>
                </div>
                <h3 className="text-text text-base font-semibold leading-tight truncate">
                  {cg.name || `Comisión ${cg.id}`}
                </h3>
                <p className="text-xs text-muted mt-1 truncate">
                  Gimnasio: <span className="font-medium text-text">{cg.gym?.name}</span>
                </p>
                <div className="flex items-center gap-2 mt-2 text-xs font-medium text-text">
                  <span className="material-symbols-outlined text-sm text-primary">schedule</span>
                  <span>{cg.daysOfWeek.map(d => DAYS_ES[d]).join(', ')} • {cg.startTime} a {cg.endTime}</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                <Link className="rounded-lg border border-primary text-primary text-xs font-semibold px-3 py-2 text-center" to={`/profesor/alumnos?classGroupId=${cg.id}`}>
                  Ver Alumnos
                </Link>
                <Link className="rounded-lg bg-primary text-white text-xs font-semibold px-3 py-2 text-center" to={`/profesor/comisiones/${cg.id}/asistencia`}>
                  Tomar Asistencia
                </Link>
                <button className="rounded-lg border border-border text-text text-xs font-semibold px-3 py-2 text-center" type="button" onClick={() => openEdit(cg)}>
                  <span className="material-symbols-outlined text-sm align-middle">edit</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <button className="h-9 px-3 rounded-full border border-border text-xs font-semibold text-text disabled:opacity-40" onClick={() => setPage(c => Math.max(1, c - 1))} disabled={page === 1}>Anterior</button>
            <div className="flex items-center gap-1">
              {Array.from({ length: pageEnd - pageStart + 1 }, (_, i) => pageStart + i).map((num) => (
                <button key={num} className={`h-9 w-9 rounded-full text-xs font-semibold ${page === num ? 'bg-primary text-white' : 'border border-border text-text'}`} onClick={() => setPage(num)}>{num}</button>
              ))}
            </div>
            <button className="h-9 px-3 rounded-full border border-border text-xs font-semibold text-text disabled:opacity-40" onClick={() => setPage(c => Math.min(totalPages, c + 1))} disabled={page === totalPages}>Siguiente</button>
          </div>
        )}
      </main>

      <CreateClassGroupModal
        createOpen={createOpen} setCreateOpen={setCreateOpen} createForm={createForm} setCreateForm={setCreateForm}
        gyms={gyms} handleCreate={handleCreate} creating={creating} createError={createError}
      />
      
      <EditClassGroupModal
        editing={editing} setEditing={setEditing} form={form} setForm={setForm}
        gyms={gyms} handleSave={handleSave} saving={saving} editError={editError}
      />
    </div>
  );
}
