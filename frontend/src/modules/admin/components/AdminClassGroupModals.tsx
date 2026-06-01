import React from 'react';
import type { ClassGroupItem, ClassGroupForm, DayOfWeek } from '../hooks/useAdminClassGroups';
import { emptyForm } from '../hooks/useAdminClassGroups';

const DAYS_OF_WEEK: { value: DayOfWeek; label: string }[] = [
  { value: 'MONDAY', label: 'Lunes' },
  { value: 'TUESDAY', label: 'Martes' },
  { value: 'WEDNESDAY', label: 'Miércoles' },
  { value: 'THURSDAY', label: 'Jueves' },
  { value: 'FRIDAY', label: 'Viernes' },
  { value: 'SATURDAY', label: 'Sábado' },
  { value: 'SUNDAY', label: 'Domingo' },
];

type CommonProps = {
  gyms: any[];
  teachers: any[];
};

type CreateModalProps = CommonProps & {
  createOpen: boolean;
  setCreateOpen: (v: boolean) => void;
  createForm: ClassGroupForm;
  setCreateForm: (f: any) => void;
  handleCreate: (e: React.FormEvent) => void;
  creating: boolean;
  createError: string;
};

export function CreateClassGroupModal({
  createOpen, setCreateOpen, createForm, setCreateForm,
  gyms, teachers, handleCreate, creating, createError
}: CreateModalProps) {
  if (!createOpen) return null;

  const toggleDay = (day: DayOfWeek) => {
    setCreateForm((prev: ClassGroupForm) => {
      const current = prev.daysOfWeek;
      if (current.includes(day)) {
        return { ...prev, daysOfWeek: current.filter((d) => d !== day) };
      }
      return { ...prev, daysOfWeek: [...current, day] };
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-30 flex items-end sm:items-center justify-center p-4">
      <div className="bg-surface w-full max-w-[430px] sm:max-w-[520px] md:max-w-[640px] rounded-t-2xl sm:rounded-2xl p-5 max-h-[85vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h2 className="text-lg font-bold">Nueva Clase</h2>
          <button className="text-gray-400" type="button" onClick={() => { setCreateOpen(false); setCreateForm(emptyForm); }}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto pr-1 -mr-1">
          <form className="space-y-4" onSubmit={handleCreate}>
            {createError && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{createError}</div>}
            
            <div className="space-y-1">
              <label className="text-xs text-muted">Nombre (Opcional)</label>
              <input className="w-full rounded-lg border border-border px-3 py-2 text-sm" placeholder="Ej: Turno Mañana" value={createForm.name} onChange={(e) => setCreateForm((prev: any) => ({ ...prev, name: e.target.value }))} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted">Gimnasio</label>
                <select className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm" value={createForm.gymId} onChange={(e) => setCreateForm((prev: any) => ({ ...prev, gymId: e.target.value }))} required>
                  <option value="">Seleccionar...</option>
                  {gyms.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted">Profesor</label>
                <select className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm" value={createForm.teacherId} onChange={(e) => setCreateForm((prev: any) => ({ ...prev, teacherId: e.target.value }))} required>
                  <option value="">Seleccionar...</option>
                  {teachers.map((t) => <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted">Categoría</label>
                <select className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm" value={createForm.category} onChange={(e) => setCreateForm((prev: any) => ({ ...prev, category: e.target.value }))} required>
                  <option value="ADULT">Adulto</option>
                  <option value="CHILD">Infantil</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted">Días de la semana</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {DAYS_OF_WEEK.map((day) => {
                  const isSelected = createForm.daysOfWeek.includes(day.value);
                  return (
                    <button
                      key={day.value} type="button"
                      onClick={() => toggleDay(day.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${isSelected ? 'bg-primary text-white' : 'bg-surface border border-border text-text'}`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
              {createForm.daysOfWeek.length === 0 && <p className="text-[10px] text-red-500 mt-1">Selecciona al menos un día</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted">Hora Inicio (HH:mm)</label>
                <input type="time" className="w-full rounded-lg border border-border px-3 py-2 text-sm" value={createForm.startTime} onChange={(e) => setCreateForm((prev: any) => ({ ...prev, startTime: e.target.value }))} required />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted">Hora Fin (HH:mm)</label>
                <input type="time" className="w-full rounded-lg border border-border px-3 py-2 text-sm" value={createForm.endTime} onChange={(e) => setCreateForm((prev: any) => ({ ...prev, endTime: e.target.value }))} required />
              </div>
            </div>

            <button className="w-full rounded-lg bg-primary text-white text-sm font-semibold py-3 disabled:opacity-70 mt-2" type="submit" disabled={creating || createForm.daysOfWeek.length === 0}>
              {creating ? 'Creando...' : 'Crear clase'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

type EditModalProps = CommonProps & {
  editing: ClassGroupItem | null;
  setEditing: (v: ClassGroupItem | null) => void;
  form: ClassGroupForm;
  setForm: (f: any) => void;
  handleSave: (e: React.FormEvent) => void;
  saving: boolean;
  editError: string;
};

export function EditClassGroupModal({
  editing, setEditing, form, setForm,
  gyms, teachers, handleSave, saving, editError
}: EditModalProps) {
  if (!editing) return null;

  const toggleDay = (day: DayOfWeek) => {
    setForm((prev: ClassGroupForm) => {
      const current = prev.daysOfWeek;
      if (current.includes(day)) {
        return { ...prev, daysOfWeek: current.filter((d) => d !== day) };
      }
      return { ...prev, daysOfWeek: [...current, day] };
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-30 flex items-end sm:items-center justify-center p-4">
      <div className="bg-surface w-full max-w-[430px] sm:max-w-[520px] md:max-w-[640px] rounded-t-2xl sm:rounded-2xl p-5 max-h-[85vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h2 className="text-lg font-bold">Editar Clase</h2>
          <button className="text-gray-400" type="button" onClick={() => { setEditing(null); setForm(emptyForm); }}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto pr-1 -mr-1">
          <form className="space-y-4" onSubmit={handleSave}>
            {editError && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{editError}</div>}
            
            <div className="space-y-1">
              <label className="text-xs text-muted">Nombre (Opcional)</label>
              <input className="w-full rounded-lg border border-border px-3 py-2 text-sm" placeholder="Ej: Turno Mañana" value={form.name} onChange={(e) => setForm((prev: any) => ({ ...prev, name: e.target.value }))} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted">Gimnasio</label>
                <select className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm" value={form.gymId} onChange={(e) => setForm((prev: any) => ({ ...prev, gymId: e.target.value }))} required>
                  <option value="">Seleccionar...</option>
                  {gyms.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted">Profesor</label>
                <select className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm" value={form.teacherId} onChange={(e) => setForm((prev: any) => ({ ...prev, teacherId: e.target.value }))} required>
                  <option value="">Seleccionar...</option>
                  {teachers.map((t) => <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted">Categoría</label>
                <select className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm" value={form.category} onChange={(e) => setForm((prev: any) => ({ ...prev, category: e.target.value }))} required>
                  <option value="ADULT">Adulto</option>
                  <option value="CHILD">Infantil</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted">Días de la semana</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {DAYS_OF_WEEK.map((day) => {
                  const isSelected = form.daysOfWeek.includes(day.value);
                  return (
                    <button
                      key={day.value} type="button"
                      onClick={() => toggleDay(day.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${isSelected ? 'bg-primary text-white' : 'bg-surface border border-border text-text'}`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
              {form.daysOfWeek.length === 0 && <p className="text-[10px] text-red-500 mt-1">Selecciona al menos un día</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted">Hora Inicio (HH:mm)</label>
                <input type="time" className="w-full rounded-lg border border-border px-3 py-2 text-sm" value={form.startTime} onChange={(e) => setForm((prev: any) => ({ ...prev, startTime: e.target.value }))} required />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted">Hora Fin (HH:mm)</label>
                <input type="time" className="w-full rounded-lg border border-border px-3 py-2 text-sm" value={form.endTime} onChange={(e) => setForm((prev: any) => ({ ...prev, endTime: e.target.value }))} required />
              </div>
            </div>

            <button className="w-full rounded-lg bg-primary text-white text-sm font-semibold py-3 disabled:opacity-70 mt-2" type="submit" disabled={saving || form.daysOfWeek.length === 0}>
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
