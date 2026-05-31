import { useNavigate } from 'react-router-dom';
import { useTeacherAttendance } from '../hooks/useTeacherAttendance';

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export function TeacherAttendanceView() {
  const navigate = useNavigate();
  const {
    year, setYear, month, setMonth,
    classGroup, students, attendanceMap,
    classPlanId, totalClasses, setTotalClasses, handleSavePlan,
    classDaysInMonth,
    loading, working, error, success,
    handleToggle, handleToggleColumn, handleSaveAttendance
  } = useTeacherAttendance();

  return (
    <div className="min-h-screen bg-background flex flex-col text-text">
      <header className="sticky top-0 z-20 bg-background/90 backdrop-blur-md border-b border-border shadow-soft">
        <div className="flex items-center justify-between p-4 max-w-[95%] mx-auto w-full">
          <button className="flex size-10 items-center justify-center text-muted hover:text-text transition-colors" type="button" onClick={() => navigate(-1)}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold">Asistencia Mensual</p>
            <h1 className="font-bold text-lg">{classGroup?.name || 'Comisión'}</h1>
            {classGroup?.gym && <p className="text-xs text-muted">{classGroup.gym.name}</p>}
          </div>
          <div className="w-10" />
        </div>
      </header>

      <main className="flex-1 max-w-[95%] mx-auto w-full pb-32 space-y-5 p-4">
        {error && <div className="bg-red-50 p-4 rounded-xl text-sm text-red-600 border border-red-200">{error}</div>}
        {success && <div className="bg-green-50 p-4 rounded-xl text-sm text-green-700 border border-green-200">{success}</div>}

        <section className="bg-surface rounded-xl border border-border p-4 shadow-soft">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div>
                <p className="text-xs text-muted uppercase font-bold mb-1">Mes</p>
                <select className="rounded-lg border border-border bg-surface px-3 py-2 text-sm" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                  {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                </select>
              </div>
              <div>
                <p className="text-xs text-muted uppercase font-bold mb-1">Año</p>
                <input type="number" className="rounded-lg border border-border bg-surface px-3 py-2 text-sm w-24" value={year} onChange={(e) => setYear(Number(e.target.value))} />
              </div>
            </div>

            <div className="flex items-end gap-3 w-full sm:w-auto">
              <div className="flex-1 sm:w-32">
                <p className="text-xs text-muted uppercase font-bold mb-1">Clases del Mes</p>
                <input type="number" placeholder="Ej: 8" className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm" value={totalClasses} onChange={(e) => setTotalClasses(e.target.value)} />
              </div>
              <button 
                className="rounded-lg bg-primary text-white text-sm font-semibold px-4 py-2 hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-70 h-[38px]"
                onClick={handleSavePlan} disabled={working || !totalClasses}
              >
                {classPlanId ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="bg-surface p-4 rounded-xl text-sm text-muted border border-border text-center shadow-soft">
            Cargando alumnos y asistencia...
          </div>
        ) : (
          <section className="bg-surface rounded-xl border border-border shadow-soft overflow-hidden">
            {students.length === 0 ? (
              <div className="p-4 text-sm text-muted text-center">
                No hay estudiantes en esta comisión.
              </div>
            ) : classDaysInMonth.length === 0 ? (
              <div className="p-4 text-sm text-muted text-center">
                No hay días de clase configurados para este mes. Revisa los días de la semana de la comisión.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-background">
                      <th className="p-3 border-b border-border min-w-[200px] sticky left-0 z-10 bg-background font-semibold text-sm text-muted">
                        Alumno ({students.length})
                      </th>
                      {classDaysInMonth.map((day) => (
                        <th key={day} className="p-2 border-b border-l border-border text-center min-w-[80px]">
                          <div className="flex flex-col items-center gap-2">
                            <span className="text-xs font-bold text-muted">Día {day}</span>
                            <button 
                              className="text-[10px] uppercase font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded"
                              onClick={() => handleToggleColumn(day)}
                            >
                              Todos
                            </button>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.id} className="hover:bg-primary/5 transition-colors border-b border-border/50 last:border-0">
                        <td className="p-3 sticky left-0 z-10 bg-surface whitespace-nowrap border-r border-border font-medium text-sm">
                          {student.firstName} {student.lastName}
                        </td>
                        {classDaysInMonth.map((day) => {
                          const isPresent = attendanceMap[`${student.id}_${day}`];
                          return (
                            <td key={day} className="p-2 border-l border-border/50 text-center">
                              <button
                                className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto transition-colors ${isPresent ? 'bg-primary text-white shadow-md' : 'bg-background border border-border hover:bg-primary/10'}`}
                                onClick={() => handleToggle(student.id, day)}
                              >
                                {isPresent && <span className="material-symbols-outlined text-[18px]">check</span>}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                    {/* Botones de guardado por columna */}
                    <tr className="bg-background">
                      <td className="p-3 sticky left-0 z-10 bg-background text-right text-xs font-bold text-muted border-r border-border border-t">
                        Guardar día ➔
                      </td>
                      {classDaysInMonth.map((day) => (
                        <td key={day} className="p-2 border-l border-border border-t text-center">
                          <button 
                            className="bg-primary/10 hover:bg-primary/20 text-primary rounded p-1.5 transition-colors w-full flex justify-center"
                            title={`Guardar asistencia del día ${day}`}
                            onClick={() => handleSaveAttendance(day)}
                            disabled={working}
                          >
                            <span className="material-symbols-outlined text-[18px]">save</span>
                          </button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
