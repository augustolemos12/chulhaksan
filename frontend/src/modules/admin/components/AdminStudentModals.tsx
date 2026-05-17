import { useState } from 'react';
import type { AdminStudent, StudentForm, CreateStudentForm, GymOption, AdminTeacherOption } from '../hooks/useAdminStudents';
import { emptyForm, emptyCreateForm } from '../hooks/useAdminStudents';

type EditModalProps = {
  editing?: AdminStudent; setEditing: (v: null) => void;
  form: StudentForm; setForm: (f: any) => void;
  assignedTeacherId: string; setAssignedTeacherId: (id: string) => void;
  initialTeacherId?: string;
  gyms: GymOption[]; activeTeachers: AdminTeacherOption[];
  handleSave: (e: React.FormEvent) => void; saving: boolean; editError: string;
  handleResetPassword: () => void; resetInfo: string; setResetInfo: (i: string) => void; resetting: boolean;
};

export function EditStudentModal({
  setEditing, form, setForm, assignedTeacherId, setAssignedTeacherId,
  gyms, activeTeachers, handleSave, saving, editError, handleResetPassword, resetInfo, setResetInfo, resetting
}: EditModalProps) {
  const [copiedReset, setCopiedReset] = useState(false);
  const handleCopyReset = async () => {
    if (!resetInfo) return;
    try {
      await navigator.clipboard.writeText(resetInfo);
      setCopiedReset(true);
      setTimeout(() => setCopiedReset(false), 1500);
    } catch { setCopiedReset(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-30 flex items-end sm:items-center justify-center p-4">
      <div className="bg-surface w-full max-w-[430px] sm:max-w-[520px] md:max-w-[640px] rounded-t-2xl sm:rounded-2xl p-5 max-h-[85vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h2 className="text-lg font-bold">Editar alumno</h2>
          <button className="text-gray-400" type="button" onClick={() => { setEditing(null); setForm(emptyForm); setAssignedTeacherId(''); setResetInfo(''); }}>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted">Teléfono</label>
                <input className="w-full rounded-lg border border-border px-3 py-2 text-sm" placeholder="Ej: 11 2345-6789" value={form.phone} onChange={(e) => setForm((prev: any) => ({ ...prev, phone: e.target.value }))} required />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted">Teléfono tutor</label>
                <input className="w-full rounded-lg border border-border px-3 py-2 text-sm" placeholder="Ej: 11 2345-6789" value={form.guardianPhone} onChange={(e) => setForm((prev: any) => ({ ...prev, guardianPhone: e.target.value }))} required />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted">Fecha de nacimiento</label>
              <input type="date" className="w-full rounded-lg border border-border px-3 py-2 text-sm" value={form.birthDate} onChange={(e) => setForm((prev: any) => ({ ...prev, birthDate: e.target.value }))} required />
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
                <label className="text-xs text-muted">Gimnasio</label>
                <select className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm" value={form.gymId} onChange={(e) => setForm((prev: any) => ({ ...prev, gymId: e.target.value }))}>
                  <option value="">Sin asignacion</option>
                  {gyms.filter((g) => !g.isArchived).map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted">Profesor asignado (opcional)</label>
              <select className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm" value={assignedTeacherId} onChange={(e) => setAssignedTeacherId(e.target.value)}>
                <option value="">Sin profesor</option>
                {activeTeachers.map((t) => <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}
              </select>
            </div>

            <div className="rounded-lg border border-border bg-background p-3 space-y-2">
              <p className="text-xs text-muted">Contraseña del alumno</p>
              <button className="w-full rounded-lg border border-border text-sm font-semibold py-2 disabled:opacity-70" type="button" onClick={handleResetPassword} disabled={resetting}>
                {resetting ? 'Reseteando...' : 'Resetear contraseña'}
              </button>
              {resetInfo && (
                <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 flex items-center justify-between gap-2">
                  <span>Temporal: {resetInfo}</span>
                  <button className={`text-xs font-semibold transition-all ${copiedReset ? 'text-green-700 bg-green-100 px-2 py-1 rounded-md' : 'text-amber-700'}`} type="button" onClick={handleCopyReset}>
                    {copiedReset ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
              )}
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
  createAssignedTeacherId: string; setCreateAssignedTeacherId: (id: string) => void;
  gyms: GymOption[]; activeTeachers: AdminTeacherOption[];
  handleCreate: (e: React.FormEvent) => void; creating: boolean; createError: string;
};

export function CreateStudentModal({
  createOpen, setCreateOpen, createForm, setCreateForm, createAssignedTeacherId, setCreateAssignedTeacherId,
  gyms, activeTeachers, handleCreate, creating, createError
}: CreateModalProps) {
  const [showPassword, setShowPassword] = useState(false);

  if (!createOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-30 flex items-end sm:items-center justify-center p-4">
      <div className="bg-surface w-full max-w-[430px] sm:max-w-[520px] md:max-w-[640px] rounded-t-2xl sm:rounded-2xl p-5 max-h-[85vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h2 className="text-lg font-bold">Nuevo alumno</h2>
          <button className="text-gray-400" type="button" onClick={() => { setCreateOpen(false); setCreateForm(emptyCreateForm); setCreateAssignedTeacherId(''); }}>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted">Telefono (opcional)</label>
                <input className="w-full rounded-lg border border-border px-3 py-2 text-sm" placeholder="Ej: 11 2345-6789" value={createForm.phone} onChange={(e) => setCreateForm((prev: any) => ({ ...prev, phone: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted">Telefono tutor (opcional)</label>
                <input className="w-full rounded-lg border border-border px-3 py-2 text-sm" placeholder="Ej: 11 2345-6789" value={createForm.guardianPhone} onChange={(e) => setCreateForm((prev: any) => ({ ...prev, guardianPhone: e.target.value }))} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted">Fecha de nacimiento (opcional)</label>
              <input type="date" className="w-full rounded-lg border border-border px-3 py-2 text-sm" value={createForm.birthDate} onChange={(e) => setCreateForm((prev: any) => ({ ...prev, birthDate: e.target.value }))} />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted">Dirección (opcional)</label>
              <input className="w-full rounded-lg border border-border px-3 py-2 text-sm" placeholder="Ej: Calle 123" value={createForm.address} onChange={(e) => setCreateForm((prev: any) => ({ ...prev, address: e.target.value }))} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted">Tipo (opcional)</label>
                <select className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm" value={createForm.category} onChange={(e) => setCreateForm((prev: any) => ({ ...prev, category: e.target.value }))}>
                  <option value="ADULT">Adulto</option>
                  <option value="CHILD">Infantil</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted">Gimnasio (opcional)</label>
                <select className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm" value={createForm.gymId} onChange={(e) => setCreateForm((prev: any) => ({ ...prev, gymId: e.target.value }))}>
                  <option value="">Sin asignacion</option>
                  {gyms.filter((g) => !g.isArchived).map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
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

            <div className="space-y-1">
              <label className="text-xs text-muted">Profesor asignado (opcional)</label>
              <select className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm" value={createAssignedTeacherId} onChange={(e) => setCreateAssignedTeacherId(e.target.value)}>
                <option value="">Sin profesor</option>
                {activeTeachers.map((t) => <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}
              </select>
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
