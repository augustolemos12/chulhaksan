import { Link } from 'react-router-dom';
import { useTeacherStudents } from '../hooks/useTeacherStudents';
import { CreateTeacherStudentModal } from '../components/TeacherStudentModals';

export function TeacherStudentsView() {
  const {
    assigned, gyms, query, setQuery, gymFilter, setGymFilter, categoryFilter, setCategoryFilter,
    loading, error, createOpen, setCreateOpen, form, setForm, saving, createError,
    pageAssigned, setPageAssigned, totalAssigned, pageSize, handleCreateStudent, searchParams
  } = useTeacherStudents();

  const categoryLabel = (val?: 'ADULT' | 'CHILD') => val === 'CHILD' ? 'Infantil' : 'Adulto';

  const totalPagesAssigned = Math.max(1, Math.ceil(totalAssigned / pageSize));
  const pageStartAssigned = Math.max(1, Math.min(pageAssigned - 2, totalPagesAssigned - 4));
  const pageEndAssigned = Math.min(totalPagesAssigned, pageStartAssigned + 4);

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col max-w-[430px] sm:max-w-[560px] md:max-w-[720px] mx-auto bg-background-light shadow-xl overflow-x-hidden">
      <header className="sticky top-0 z-10 flex items-center bg-background-light/80 backdrop-blur-md p-4 pb-2 justify-between">
        <div className="flex items-center gap-2">
          <Link className="text-[#1b0d0d] flex size-10 items-center justify-center cursor-pointer" to="/dashboard">
            <span className="material-symbols-outlined">arrow_back_ios</span>
          </Link>
          <h1 className="text-[#1b0d0d] text-xl font-bold leading-tight tracking-tight">Alumnos</h1>
        </div>
        <button className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-transparent text-[#1b0d0d]" type="button" onClick={() => setCreateOpen(true)} aria-label="Crear alumno">
          <span className="material-symbols-outlined">person_add</span>
        </button>
      </header>

      <div className="px-4 py-3">
        <label className="flex flex-col min-w-40 h-12 w-full">
          <div className="flex w-full flex-1 items-stretch rounded-xl h-full shadow-sm">
            <div className="text-[#9a4c4c] flex border-none bg-white items-center justify-center pl-4 rounded-l-xl border-r-0">
              <span className="material-symbols-outlined">search</span>
            </div>
            <input className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-xl text-[#1b0d0d] focus:outline-0 focus:ring-0 border-none bg-white focus:border-none h-full placeholder:text-[#9a4c4c] px-4 pl-2 text-base font-normal leading-normal" placeholder="Buscar por DNI o nombre" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </label>
        <div className="mt-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">folder</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold">Gimnasio</p>
              <select className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm" value={gymFilter} onChange={(e) => setGymFilter(e.target.value)}>
                <option value="">Todos los gimnasios</option>
                {gyms.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>

              <p className="mt-4 text-xs uppercase tracking-[0.2em] text-primary font-bold">Tipo</p>
              <select className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as 'ADULT' | 'CHILD' | '')}>
                <option value="">Todos</option>
                <option value="ADULT">Adultos</option>
                <option value="CHILD">Infantiles</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 px-4 py-2">
        <div className="sm:ml-auto flex h-9 shrink-0 items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 text-xs font-semibold text-gray-700 shadow-sm">
          <span className="material-symbols-outlined text-base">groups</span>
          Alumnos: {totalAssigned}
        </div>
      </div>

      <main className="flex-1 px-4 mt-2 pb-24">
        {loading && <div className="bg-white p-4 rounded-xl text-sm text-gray-500 border border-gray-100">Cargando alumnos...</div>}
        {error && <div className="bg-red-50 p-4 rounded-xl text-sm text-red-600 border border-red-200">{error}</div>}
        {!loading && !error && assigned.length === 0 && <div className="bg-white p-4 rounded-xl text-sm text-gray-500 border border-gray-100">No hay alumnos para mostrar.</div>}

        <div className="flex flex-col gap-2">
          {assigned.map((student) => (
            <div key={student.dni} className="flex items-center gap-4 bg-white p-3 rounded-xl justify-between shadow-sm">
              <Link className="flex items-center gap-3 flex-1" to={`/alumno/${student.dni}?returnTo=${encodeURIComponent(`/profesor/alumnos?${searchParams.toString()}`)}`}>
                <div className="bg-primary/10 text-primary flex items-center justify-center rounded-full h-14 w-14">
                  <span className="material-symbols-outlined">person</span>
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-[#1b0d0d] text-base font-semibold leading-tight">{student.firstName} {student.lastName}</p>
                  <p className="text-[#9a4c4c] text-xs font-medium mt-1">DNI: {student.dni}</p>
                  {student.gym && <p className="text-[11px] text-gray-500 mt-1">Gimnasio: {student.gym}</p>}
                  <p className="text-[11px] text-gray-500 mt-1">Tipo: {categoryLabel(student.category)}</p>
                </div>
              </Link>
              <div className="flex flex-col items-end gap-2">
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${student.status === 'OK' ? 'bg-green-100 text-green-700' : student.status === 'DEBT' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'}`}>
                  {student.status === 'OK' ? 'Al día' : student.status === 'DEBT' ? 'Deuda' : 'Sin estado'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {totalPagesAssigned > 1 && (
          <div className="flex items-center justify-center gap-2 pt-3">
            <button className="h-9 px-3 rounded-full border border-gray-200 text-xs font-semibold text-[#1b0d0d] disabled:opacity-40" onClick={() => setPageAssigned(c => Math.max(1, c - 1))} disabled={pageAssigned === 1}>Anterior</button>
            <div className="flex items-center gap-1">
              {Array.from({ length: pageEndAssigned - pageStartAssigned + 1 }, (_, i) => pageStartAssigned + i).map((num) => (
                <button key={num} className={`h-9 w-9 rounded-full text-xs font-semibold ${pageAssigned === num ? 'bg-primary text-white' : 'border border-gray-200 text-[#1b0d0d]'}`} onClick={() => setPageAssigned(num)}>{num}</button>
              ))}
            </div>
            <button className="h-9 px-3 rounded-full border border-gray-200 text-xs font-semibold text-[#1b0d0d] disabled:opacity-40" onClick={() => setPageAssigned(c => Math.min(totalPagesAssigned, c + 1))} disabled={pageAssigned === totalPagesAssigned}>Siguiente</button>
          </div>
        )}
      </main>

      <CreateTeacherStudentModal createOpen={createOpen} setCreateOpen={setCreateOpen} form={form} setForm={setForm} gyms={gyms} handleCreate={handleCreateStudent} saving={saving} createError={createError} />
    </div>
  );
}
