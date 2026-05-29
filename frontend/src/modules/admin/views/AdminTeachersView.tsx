import { Link } from 'react-router-dom';
import { useAdminTeachers } from '../hooks/useAdminTeachers';
import { EditTeacherModal, CreateTeacherModal } from '../components/AdminTeacherModals';

export function AdminTeachersView() {
  const {
    teachers, loading, error, query, setQuery, page, setPage, total, pageSize,
    editing, setEditing, form, setForm, saving, editError, handleSave, openEdit,
    createOpen, setCreateOpen, createForm, setCreateForm, creating, createError, handleCreate,
    handleDelete, handleResetPassword, resetInfo, setResetInfo, resetting
  } = useAdminTeachers();

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
            Gestión de profesores
          </h1>
          <button className="flex items-center gap-2 rounded-lg bg-primary text-white text-sm font-semibold px-4 py-2 hover:bg-primary/90 transition-colors shadow-sm" type="button" onClick={() => setCreateOpen(true)} aria-label="Crear profesor">
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Crear Profesor
          </button>
        </div>
      </header>

      <main className="w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto p-4 pb-24 space-y-4">
        <div className="bg-surface rounded-2xl border border-border shadow-soft p-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold">Total profesores</p>
            <p className="text-2xl font-bold text-text">{total}</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">badge</span>
          </div>
        </div>

        <label className="flex flex-col min-w-40 h-12 w-full">
          <div className="flex w-full flex-1 items-stretch rounded-xl h-full shadow-soft">
            <div className="text-[#9a4c4c] flex border-none bg-surface items-center justify-center pl-4 rounded-l-xl border-r-0">
              <span className="material-symbols-outlined">search</span>
            </div>
            <input className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-xl text-text focus:outline-0 focus:ring-0 border-none bg-surface focus:border-none h-full placeholder:text-[#9a4c4c] px-4 pl-2 text-base font-normal leading-normal" placeholder="Buscar por nombre o DNI" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </label>

        {loading && <div className="bg-surface p-4 rounded-xl text-sm text-muted border border-border">Cargando profesores...</div>}
        {error && <div className="bg-red-50 p-4 rounded-xl text-sm text-red-600 border border-red-200">{error}</div>}
        {!loading && !error && teachers.length === 0 && <div className="bg-surface p-4 rounded-xl text-sm text-muted border border-border">No hay profesores para mostrar.</div>}

        <div className="flex flex-col gap-3">
          {teachers.map((teacher) => (
            <div key={teacher.id} className="flex items-center gap-4 bg-surface p-3 rounded-xl justify-between shadow-soft">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary flex items-center justify-center rounded-full h-12 w-12">
                  <span className="material-symbols-outlined">badge</span>
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-text text-base font-semibold leading-tight">{teacher.firstName} {teacher.lastName}</p>
                  {teacher.user?.dni && <p className="text-[#9a4c4c] text-xs font-medium mt-1">DNI: {teacher.user.dni}</p>}
                  {teacher.email && <p className="text-[11px] text-muted mt-1">{teacher.email}</p>}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button className="rounded-lg bg-primary text-white text-xs font-semibold px-3 py-2" type="button" onClick={() => openEdit(teacher)}>Editar</button>
                <button className="rounded-lg border border-red-200 text-red-600 text-xs font-semibold px-3 py-2" type="button" onClick={() => handleDelete(teacher)}>Eliminar</button>
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
        <EditTeacherModal
          editing={editing} setEditing={setEditing} form={form} setForm={setForm}
          handleSave={handleSave} saving={saving} editError={editError}
          handleResetPassword={handleResetPassword} resetInfo={resetInfo} setResetInfo={setResetInfo} resetting={resetting}
        />
      )}

      <CreateTeacherModal
        createOpen={createOpen} setCreateOpen={setCreateOpen} createForm={createForm} setCreateForm={setCreateForm}
        handleCreate={handleCreate} creating={creating} createError={createError}
      />
    </div>
  );
}
