import { Link } from 'react-router-dom';
import { useTeacherClassPlans } from '../hooks/useTeacherClassPlans';
import { CreateClassPlanModal, EditClassPlanModal } from '../components/TeacherClassPlanModals';

const MONTHS_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export function TeacherClassPlansView() {
  const {
    classPlans, total, loading, error, gymFilter, setGymFilter, classGroupFilter, setClassGroupFilter, monthFilter, setMonthFilter, yearFilter, setYearFilter,
    page, setPage, pageSize, classGroups, gyms,
    createOpen, setCreateOpen, createForm, setCreateForm, creating, createError, handleCreate,
    editing, setEditing, form, setForm, saving, editError, handleSave, openEdit, handleDelete
  } = useTeacherClassPlans();

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageStart = Math.max(1, Math.min(page - 2, totalPages - 4));
  const pageEnd = Math.min(totalPages, pageStart + 4);

  const filteredCommissions = classGroups.filter(cg => {
    if (gymFilter && String(cg.gymId) !== gymFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background text-text">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center p-4 justify-between w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto">
          <Link className="text-text flex size-10 shrink-0 items-center justify-center" to="/dashboard">
            <span className="material-symbols-outlined">arrow_back_ios</span>
          </Link>
          <h1 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10">
            Mis Planes de Clases
          </h1>
          <button className="flex items-center gap-2 rounded-lg bg-primary text-white text-sm font-semibold px-4 py-2 hover:bg-primary/90 transition-colors shadow-sm" type="button" onClick={() => setCreateOpen(true)}>
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            Crear Plan
          </button>
        </div>
      </header>

      <main className="w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto p-4 pb-24 space-y-4">
        <div className="bg-surface rounded-2xl border border-border shadow-soft p-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold">Mis planes totales</p>
            <p className="text-2xl font-bold text-text">{total}</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">calendar_month</span>
          </div>
        </div>

        <div className="bg-surface rounded-2xl border border-border shadow-soft p-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined">filter_list</span>
            </div>
            <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-1">
                <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold">Gimnasio</p>
                <select className="mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm" value={gymFilter} onChange={(e) => {
                  setGymFilter(e.target.value);
                  setClassGroupFilter('');
                  setPage(1);
                }}>
                  <option value="">Todos</option>
                  {gyms.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
              <div className="sm:col-span-1">
                <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold">Mis Comisiones</p>
                <select className="mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm" value={classGroupFilter} onChange={(e) => { setClassGroupFilter(e.target.value); setPage(1); }}>
                  <option value="">Todas</option>
                  {filteredCommissions.map((cg) => <option key={cg.id} value={cg.id}>{cg.name || `Comisión ${cg.id}`}</option>)}
                </select>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold">Mes</p>
                <select className="mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm" value={monthFilter} onChange={(e) => { setMonthFilter(e.target.value); setPage(1); }}>
                  <option value="">Todos</option>
                  {MONTHS_ES.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                </select>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold">Año</p>
                <select className="mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm" value={yearFilter} onChange={(e) => { setYearFilter(e.target.value); setPage(1); }}>
                  <option value="">Todos</option>
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {loading && <div className="bg-surface p-4 rounded-xl text-sm text-muted border border-border">Cargando planes...</div>}
        {error && <div className="bg-red-50 p-4 rounded-xl text-sm text-red-600 border border-red-200">{error}</div>}
        {!loading && !error && classPlans.length === 0 && <div className="bg-surface p-4 rounded-xl text-sm text-muted border border-border">No tienes planes de clases registrados.</div>}

        <div className="flex flex-col gap-3">
          {classPlans.map((cp) => (
            <div key={cp.id} className="flex flex-col sm:flex-row sm:items-center gap-4 bg-surface p-4 rounded-xl justify-between shadow-soft">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="bg-primary/10 text-primary flex flex-col items-center justify-center rounded-xl h-14 w-14 shrink-0">
                  <span className="text-[10px] font-bold uppercase">{MONTHS_ES[cp.month - 1].substring(0, 3)}</span>
                  <span className="text-lg font-black leading-none mt-0.5">{cp.year}</span>
                </div>
                <div className="flex flex-col justify-center min-w-0">
                  <h3 className="text-text text-base font-semibold leading-tight truncate">
                    {cp.classGroup?.name || `Comisión ${cp.classGroupId}`}
                  </h3>
                  <p className="text-xs text-muted mt-1 truncate">
                    {cp.classGroup?.gym?.name}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center justify-center bg-gray-100 text-gray-800 text-[11px] font-bold px-2 py-1 rounded-md">
                      {cp.totalClasses} CLASES ESPERADAS
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex sm:flex-col gap-2 shrink-0">
                <button className="flex-1 rounded-lg bg-primary text-white text-xs font-semibold px-3 py-2" type="button" onClick={() => openEdit(cp)}>Editar</button>
                <button className="flex-1 rounded-lg border border-red-200 text-red-600 text-xs font-semibold px-3 py-2" type="button" onClick={() => handleDelete(cp)}>Eliminar</button>
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

      <CreateClassPlanModal
        createOpen={createOpen} setCreateOpen={setCreateOpen} createForm={createForm} setCreateForm={setCreateForm}
        classGroups={classGroups} gyms={gyms} handleCreate={handleCreate} creating={creating} createError={createError}
      />
      
      <EditClassPlanModal
        editing={editing} setEditing={setEditing} form={form} setForm={setForm}
        classGroups={classGroups} gyms={gyms} handleSave={handleSave} saving={saving} editError={editError}
      />
    </div>
  );
}
