import { useState } from 'react';
import type { StudentWithStatus, StudentForm, CreateStudentForm, ClassGroupOption } from '../hooks/useTeacherStudents';
import { emptyForm, emptyCreateForm } from '../hooks/useTeacherStudents';

type EditModalProps = {
  editing?: StudentWithStatus; setEditing: (v: null) => void;
  form: StudentForm; setForm: (f: any) => void;
  classGroups: ClassGroupOption[];
  handleSave: (e: React.FormEvent) => void; saving: boolean; editError: string;
};

export function EditTeacherStudentModal({
  setEditing, form, setForm,
  classGroups, handleSave, saving, editError
}: EditModalProps) {
  return (
    <div className="fixed inset-0 bg-black/40 z-30 flex items-end sm:items-center justify-center p-4">
      <div className="bg-surface w-full max-w-[430px] sm:max-w-[520px] md:max-w-[640px] rounded-t-2xl sm:rounded-2xl p-5 max-h-[85vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h2 className="text-lg font-bold">Editar alumno</h2>
          <button className="text-gray-400" type="button" onClick={() => { setEditing(null); setForm(emptyForm); }}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto pr-1 -mr-1">
          <form className="space-y-4" onSubmit={handleSave}>
            {editError && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{editError}</div>}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted">Nombre</label>
                <input className="w-full rounded-lg border border-border px-3 py-2 text-sm" placeholder="Ej: Juan" value={form.firstName} onChange={(e) => setForm((prev: any) => ({ ...prev, firstName: e.target.value }))} required />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted">Apellido</label>
                <input className="w-full rounded-lg border border-border px-3 py-2 text-sm" placeholder="Ej: Pérez" value={form.lastName} onChange={(e) => setForm((prev: any) => ({ ...prev, lastName: e.target.value }))} required />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted">Correo electrónico (opcional)</label>
              <input type="email" className="w-full rounded-lg border border-border px-3 py-2 text-sm" placeholder="Ej: alumno@mail.com" value={form.email} onChange={(e) => setForm((prev: any) => ({ ...prev, email: e.target.value }))} />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted">Teléfono (opcional)</label>
              <input className="w-full rounded-lg border border-border px-3 py-2 text-sm" placeholder="Ej: 11 2345-6789" value={form.phone} onChange={(e) => setForm((prev: any) => ({ ...prev, phone: e.target.value }))} />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted">Dirección (opcional)</label>
              <input className="w-full rounded-lg border border-border px-3 py-2 text-sm" placeholder="Ej: Calle 123" value={form.address} onChange={(e) => setForm((prev: any) => ({ ...prev, address: e.target.value }))} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted">Tipo</label>
                <select className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm" value={form.category} onChange={(e) => setForm((prev: any) => ({ ...prev, category: e.target.value }))} required>
                  <option value="ADULT">Adulto</option>
                  <option value="CHILD">Infantil</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted">Comisión</label>
                <select className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm" value={form.classGroupId} onChange={(e) => setForm((prev: any) => ({ ...prev, classGroupId: e.target.value }))} required>
                  <option value="">Selecciona una comisión</option>
                  {classGroups.filter((c) => c.isActive).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            <div className="space-y-1">
              <label className="text-xs text-muted">Cinturón actual</label>
              <select className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm" value={form.currentBelt} onChange={(e) => setForm((prev: any) => ({ ...prev, currentBelt: e.target.value }))} required>
                <option value="WHITE">Blanco</option>
                <option value="WHITE_YELLOW">Blanco Punta Amarilla</option>
                <option value="YELLOW">Amarillo</option>
                <option value="GREEN_STRIPE">Amarillo Punta Verde</option>
                <option value="GREEN">Verde</option>
                <option value="BLUE_STRIPE">Verde Punta Azul</option>
                <option value="BLUE">Azul</option>
                <option value="RED_STRIPE">Azul Punta Roja</option>
                <option value="RED">Rojo</option>
                <option value="BLACK_STRIPE">Rojo Punta Negra</option>
                <option value="DAN">Dan (Negro)</option>
              </select>
            </div>
            
            <button className="w-full rounded-lg bg-primary text-white text-sm font-semibold py-3 disabled:opacity-70" type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

type CreateModalProps = {
  createOpen: boolean; setCreateOpen: (v: boolean) => void;
  createForm: CreateStudentForm; setCreateForm: (f: any) => void;
  classGroups: ClassGroupOption[];
  handleCreate: (e: React.FormEvent) => void; creating: boolean; createError: string;
};

export function CreateTeacherStudentModal({
  createOpen, setCreateOpen, createForm, setCreateForm,
  classGroups, handleCreate, creating, createError
}: CreateModalProps) {
  const [showPassword, setShowPassword] = useState(false);

  if (!createOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-30 flex items-end sm:items-center justify-center p-4">
      <div className="bg-surface w-full max-w-[430px] sm:max-w-[520px] md:max-w-[640px] rounded-t-2xl sm:rounded-2xl p-5 max-h-[85vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h2 className="text-lg font-bold">Nuevo alumno</h2>
          <button className="text-gray-400" type="button" onClick={() => { setCreateOpen(false); setCreateForm(emptyCreateForm); }}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto pr-1 -mr-1">
          <form className="space-y-4" onSubmit={handleCreate}>
            {createError && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{createError}</div>}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted">Nombre</label>
                <input className="w-full rounded-lg border border-border px-3 py-2 text-sm" placeholder="Ej: Juan" value={createForm.firstName} onChange={(e) => setCreateForm((prev: any) => ({ ...prev, firstName: e.target.value }))} required />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted">Apellido</label>
                <input className="w-full rounded-lg border border-border px-3 py-2 text-sm" placeholder="Ej: Pérez" value={createForm.lastName} onChange={(e) => setCreateForm((prev: any) => ({ ...prev, lastName: e.target.value }))} required />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted">DNI (solo números)</label>
              <input className="w-full rounded-lg border border-border px-3 py-2 text-sm" placeholder="Ej: 40123456" inputMode="numeric" value={createForm.dni} onChange={(e) => setCreateForm((prev: any) => ({ ...prev, dni: e.target.value.replace(/\D/g, '') }))} required />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted">Correo electrónico (opcional)</label>
              <input type="email" className="w-full rounded-lg border border-border px-3 py-2 text-sm" placeholder="Ej: alumno@mail.com" value={createForm.email} onChange={(e) => setCreateForm((prev: any) => ({ ...prev, email: e.target.value }))} />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted">Teléfono (opcional)</label>
              <input className="w-full rounded-lg border border-border px-3 py-2 text-sm" placeholder="Ej: 11 2345-6789" value={createForm.phone} onChange={(e) => setCreateForm((prev: any) => ({ ...prev, phone: e.target.value }))} />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted">Dirección (opcional)</label>
              <input className="w-full rounded-lg border border-border px-3 py-2 text-sm" placeholder="Ej: Calle 123" value={createForm.address} onChange={(e) => setCreateForm((prev: any) => ({ ...prev, address: e.target.value }))} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted">Tipo</label>
                <select className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm" value={createForm.category} onChange={(e) => setCreateForm((prev: any) => ({ ...prev, category: e.target.value }))} required>
                  <option value="ADULT">Adulto</option>
                  <option value="CHILD">Infantil</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted">Comisión</label>
                <select className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm" value={createForm.classGroupId} onChange={(e) => setCreateForm((prev: any) => ({ ...prev, classGroupId: e.target.value }))} required>
                  <option value="">Selecciona una comisión</option>
                  {classGroups.filter((c) => c.isActive).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted">Cinturón inicial</label>
              <select className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm" value={createForm.currentBelt} onChange={(e) => setCreateForm((prev: any) => ({ ...prev, currentBelt: e.target.value }))} required>
                <option value="WHITE">Blanco</option>
                <option value="WHITE_YELLOW">Blanco Punta Amarilla</option>
                <option value="YELLOW">Amarillo</option>
                <option value="GREEN_STRIPE">Amarillo Punta Verde</option>
                <option value="GREEN">Verde</option>
                <option value="BLUE_STRIPE">Verde Punta Azul</option>
                <option value="BLUE">Azul</option>
                <option value="RED_STRIPE">Azul Punta Roja</option>
                <option value="RED">Rojo</option>
                <option value="BLACK_STRIPE">Rojo Punta Negra</option>
                <option value="DAN">Dan (Negro)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted">Contraseña</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} className="w-full rounded-lg border border-border px-3 py-2 text-sm pr-10" placeholder="Mínimo 6 caracteres" value={createForm.password} onChange={(e) => setCreateForm((prev: any) => ({ ...prev, password: e.target.value }))} required />
                <button className="absolute inset-y-0 right-3 flex items-center text-gray-400" type="button" onClick={() => setShowPassword(!showPassword)}>
                  <span className="material-symbols-outlined text-lg">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            <button className="w-full rounded-lg bg-primary text-white text-sm font-semibold py-3 disabled:opacity-70" type="submit" disabled={creating}>
              {creating ? 'Creando...' : 'Crear alumno'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

