import { Link } from 'react-router-dom';
import { useAdminStudents } from '../hooks/useAdminStudents';
import { EditStudentModal, CreateStudentModal } from '../components/AdminStudentModals';

export function AdminStudentsView() {
  const {
    students, total, loading, error, query, setQuery, gymFilter, setGymFilter, categoryFilter, setCategoryFilter,
    page, setPage, pageSize, gyms, classGroups, activeTeachers, searchParams, setSearchParams,
    editing, setEditing, form, setForm, saving, editError, handleSave, openEdit,
    createOpen, setCreateOpen, createForm, setCreateForm, creating, createError, handleCreate,
    handleDelete, handleResetPassword, resetInfo, setResetInfo, resetting
  } = useAdminStudents();

  const categoryLabel = (val?: 'ADULT' | 'CHILD') => val === 'CHILD' ? 'Infantil' : 'Adulto';

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
            Gestión de alumnos
          </h1>
          <button className="flex items-center gap-2 rounded-lg bg-primary text-white text-sm font-semibold px-4 py-2 hover:bg-primary/90 transition-colors shadow-soft" type="button" onClick={() => setCreateOpen(true)} aria-label="Crear alumno">
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Crear Alumno
          </button>
        </div>
      </header>

      <main className="w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto p-4 pb-24 space-y-4">
        <div className="bg-surface rounded-2xl border border-border shadow-soft p-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold">Total alumnos</p>
            <p className="text-2xl font-bold text-text">{total}</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">group</span>
          </div>
        </div>

        <label className="flex flex-col min-w-40 h-12 w-full">
          <div className="flex w-full flex-1 items-stretch rounded-xl h-full shadow-soft">
            <div className="text-[#9a4c4c] flex border-none bg-surface items-center justify-center pl-4 rounded-l-xl border-r-0">
              <span className="material-symbols-outlined">search</span>
            </div>
            <input className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-xl text-text focus:outline-0 focus:ring-0 border-none bg-surface focus:border-none h-full placeholder:text-[#9a4c4c] px-4 pl-2 text-base font-normal leading-normal" placeholder="Buscar por DNI o nombre" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </label>

        <div className="bg-surface rounded-2xl border border-border shadow-soft p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">folder</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold">Gimnasio</p>
              <select className="mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm" value={gymFilter} onChange={(e) => {
                const next = e.target.value; setGymFilter(next);
                const nextParams = new URLSearchParams(searchParams);
                if (next) nextParams.set('gymId', next); else nextParams.delete('gymId');
                setSearchParams(nextParams, { replace: true });
              }}>
                <option value="">Todos los gimnasios</option>
                {gyms.map((g) => <option key={g.id} value={g.id}>{g.name}{g.isArchived ? ' (Archivado)' : ''}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-2xl border border-border shadow-soft p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">sell</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold">Tipo</p>
              <select className="mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm" value={categoryFilter} onChange={(e) => {
                const next = e.target.value as 'ADULT' | 'CHILD' | ''; setCategoryFilter(next);
                const nextParams = new URLSearchParams(searchParams);
                if (next) nextParams.set('category', next); else nextParams.delete('category');
                setSearchParams(nextParams, { replace: true });
              }}>
                <option value="">Todos</option>
                <option value="ADULT">Adultos</option>
                <option value="CHILD">Infantiles</option>
              </select>
            </div>
          </div>
        </div>

        {loading && <div className="bg-surface p-4 rounded-xl text-sm text-muted border border-border">Cargando alumnos...</div>}
        {error && <div className="bg-red-50 p-4 rounded-xl text-sm text-red-600 border border-red-200">{error}</div>}
        {!loading && !error && students.length === 0 && <div className="bg-surface p-4 rounded-xl text-sm text-muted border border-border">No hay alumnos para mostrar.</div>}

        <div className="flex flex-col gap-3">
          {students.map((student) => (
            <div key={student.dni} className="flex items-center gap-4 bg-surface p-3 rounded-xl justify-between shadow-soft">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary flex items-center justify-center rounded-full h-12 w-12">
                  <span className="material-symbols-outlined">person</span>
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-text text-base font-semibold leading-tight">{student.firstName} {student.lastName}</p>
                  <p className="text-[#9a4c4c] text-xs font-medium mt-1">DNI: {student.dni}</p>
                  {student.gym?.name && <p className="text-[11px] text-muted mt-1">Gimnasio: {student.gym.name}</p>}
                  <p className="text-[11px] text-muted mt-1">Tipo: {categoryLabel(student.category)}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button className="rounded-lg bg-primary text-white text-xs font-semibold px-3 py-2" type="button" onClick={() => openEdit(student)}>Editar</button>
                <button className="rounded-lg border border-red-200 text-red-600 text-xs font-semibold px-3 py-2" type="button" onClick={() => handleDelete(student)}>Eliminar</button>
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

      {editing && (
        <EditStudentModal
          editing={editing} setEditing={setEditing} form={form} setForm={setForm}
          classGroups={classGroups} gyms={gyms} teachers={activeTeachers} handleSave={handleSave} saving={saving} editError={editError}
          handleResetPassword={handleResetPassword} resetInfo={resetInfo} setResetInfo={setResetInfo} resetting={resetting}
        />
      )}

      <CreateStudentModal
        createOpen={createOpen} setCreateOpen={setCreateOpen} createForm={createForm} setCreateForm={setCreateForm}
        classGroups={classGroups} gyms={gyms} teachers={activeTeachers} handleCreate={handleCreate} creating={creating} createError={createError}
      />
    </div>
  );
}
