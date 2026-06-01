import React from 'react';
import type { ClassPlanItem, ClassPlanForm } from '../hooks/useTeacherClassPlans';
import { emptyForm } from '../hooks/useTeacherClassPlans';

type CommonProps = {
  classGroups: any[];
  gyms: any[];
};

type CreateModalProps = CommonProps & {
  createOpen: boolean;
  setCreateOpen: (v: boolean) => void;
  createForm: ClassPlanForm;
  setCreateForm: (f: any) => void;
  handleCreate: (e: React.FormEvent) => void;
  creating: boolean;
  createError: string;
};

export function CreateClassPlanModal({
  createOpen, setCreateOpen, createForm, setCreateForm,
  classGroups, gyms, handleCreate, creating, createError
}: CreateModalProps) {
  if (!createOpen) return null;

  const filteredCommissions = classGroups.filter(cg => {
    if (createForm.gymId && String(cg.gymId) !== createForm.gymId) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 bg-black/40 z-30 flex items-end sm:items-center justify-center p-4">
      <div className="bg-surface w-full max-w-[400px] sm:max-w-[480px] rounded-t-2xl sm:rounded-2xl p-5 max-h-[85vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h2 className="text-lg font-bold">Nuevo Plan de Clases</h2>
          <button className="text-gray-400" type="button" onClick={() => { setCreateOpen(false); setCreateForm(emptyForm); }}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto pr-1 -mr-1">
          <form className="space-y-4" onSubmit={handleCreate}>
            {createError && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{createError}</div>}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted">Gimnasio</label>
                <select className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm" value={createForm.gymId} onChange={(e) => {
                  setCreateForm((prev: any) => ({ ...prev, gymId: e.target.value, classGroupId: '' }));
                }}>
                  <option value="">Todos</option>
                  {gyms.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted">Mis Clases</label>
                <select className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm" value={createForm.classGroupId} onChange={(e) => setCreateForm((prev: any) => ({ ...prev, classGroupId: e.target.value }))} required>
                  <option value="">Seleccionar...</option>
                  {filteredCommissions.map((cg) => <option key={cg.id} value={cg.id}>{cg.name || `Clase ${cg.id}`}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted">Mes (1-12)</label>
                <input type="number" min="1" max="12" className="w-full rounded-lg border border-border px-3 py-2 text-sm" value={createForm.month} onChange={(e) => setCreateForm((prev: any) => ({ ...prev, month: e.target.value }))} required />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted">Año</label>
                <input type="number" min="2020" className="w-full rounded-lg border border-border px-3 py-2 text-sm" value={createForm.year} onChange={(e) => setCreateForm((prev: any) => ({ ...prev, year: e.target.value }))} required />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted">Total de clases esperadas</label>
              <input type="number" min="1" className="w-full rounded-lg border border-border px-3 py-2 text-sm" placeholder="Ej: 8" value={createForm.totalClasses} onChange={(e) => setCreateForm((prev: any) => ({ ...prev, totalClasses: e.target.value }))} required />
            </div>

            <button className="w-full rounded-lg bg-primary text-white text-sm font-semibold py-3 disabled:opacity-70 mt-2" type="submit" disabled={creating}>
              {creating ? 'Creando...' : 'Crear plan'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

type EditModalProps = CommonProps & {
  editing: ClassPlanItem | null;
  setEditing: (v: ClassPlanItem | null) => void;
  form: ClassPlanForm;
  setForm: (f: any) => void;
  handleSave: (e: React.FormEvent) => void;
  saving: boolean;
  editError: string;
};

export function EditClassPlanModal({
  editing, setEditing, form, setForm,
  classGroups, gyms, handleSave, saving, editError
}: EditModalProps) {
  if (!editing) return null;

  const filteredCommissions = classGroups.filter(cg => {
    if (form.gymId && String(cg.gymId) !== form.gymId) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 bg-black/40 z-30 flex items-end sm:items-center justify-center p-4">
      <div className="bg-surface w-full max-w-[400px] sm:max-w-[480px] rounded-t-2xl sm:rounded-2xl p-5 max-h-[85vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h2 className="text-lg font-bold">Editar Plan de Clases</h2>
          <button className="text-gray-400" type="button" onClick={() => { setEditing(null); setForm(emptyForm); }}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto pr-1 -mr-1">
          <form className="space-y-4" onSubmit={handleSave}>
            {editError && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{editError}</div>}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted">Gimnasio</label>
                <select className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm" value={form.gymId} onChange={(e) => {
                  setForm((prev: any) => ({ ...prev, gymId: e.target.value, classGroupId: '' }));
                }}>
                  <option value="">Todos</option>
                  {gyms.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted">Mis Clases</label>
                <select className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm" value={form.classGroupId} onChange={(e) => setForm((prev: any) => ({ ...prev, classGroupId: e.target.value }))} required>
                  <option value="">Seleccionar...</option>
                  {filteredCommissions.map((cg) => <option key={cg.id} value={cg.id}>{cg.name || `Clase ${cg.id}`}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted">Mes (1-12)</label>
                <input type="number" min="1" max="12" className="w-full rounded-lg border border-border px-3 py-2 text-sm" value={form.month} onChange={(e) => setForm((prev: any) => ({ ...prev, month: e.target.value }))} required />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted">Año</label>
                <input type="number" min="2020" className="w-full rounded-lg border border-border px-3 py-2 text-sm" value={form.year} onChange={(e) => setForm((prev: any) => ({ ...prev, year: e.target.value }))} required />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted">Total de clases esperadas</label>
              <input type="number" min="1" className="w-full rounded-lg border border-border px-3 py-2 text-sm" value={form.totalClasses} onChange={(e) => setForm((prev: any) => ({ ...prev, totalClasses: e.target.value }))} required />
            </div>

            <button className="w-full rounded-lg bg-primary text-white text-sm font-semibold py-3 disabled:opacity-70 mt-2" type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
