import { useState } from 'react';
import type { AdminTeacher, TeacherForm, CreateTeacherForm } from '../hooks/useAdminTeachers';
import { emptyForm, emptyCreateForm } from '../hooks/useAdminTeachers';

type EditModalProps = {
  editing?: AdminTeacher; setEditing: (v: null) => void;
  form: TeacherForm; setForm: (f: any) => void;
  handleSave: (e: React.FormEvent) => void; saving: boolean; editError: string;
  handleResetPassword: () => void; resetInfo: string; setResetInfo: (i: string) => void; resetting: boolean;
};

export function EditTeacherModal({
  setEditing, form, setForm,
  handleSave, saving, editError, handleResetPassword, resetInfo, setResetInfo, resetting
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
          <h2 className="text-lg font-bold">Editar profesor</h2>
          <button className="text-gray-400" type="button" onClick={() => { setEditing(null); setForm(emptyForm); setResetInfo(''); }}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto pr-1 -mr-1">
          <form className="space-y-4" onSubmit={handleSave}>
            {editError && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{editError}</div>}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted">Nombre</label>
                <input className="w-full rounded-lg border border-border px-3 py-2 text-sm" placeholder="Ej: Laura" value={form.firstName} onChange={(e) => setForm((prev: any) => ({ ...prev, firstName: e.target.value }))} required />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted">Apellido</label>
                <input className="w-full rounded-lg border border-border px-3 py-2 text-sm" placeholder="Ej: Gómez" value={form.lastName} onChange={(e) => setForm((prev: any) => ({ ...prev, lastName: e.target.value }))} required />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted">Correo electrónico (opcional)</label>
              <input type="email" className="w-full rounded-lg border border-border px-3 py-2 text-sm" placeholder="Ej: profe@mail.com" value={form.email} onChange={(e) => setForm((prev: any) => ({ ...prev, email: e.target.value }))} />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted">Teléfono</label>
              <input className="w-full rounded-lg border border-border px-3 py-2 text-sm" placeholder="Ej: 11 2345-6789" value={form.phone} onChange={(e) => setForm((prev: any) => ({ ...prev, phone: e.target.value }))} required />
            </div>


            <div className="rounded-lg border border-border bg-background p-3 space-y-2">
              <p className="text-xs text-muted">Contraseña del profesor</p>
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
  createForm: CreateTeacherForm; setCreateForm: (f: any) => void;
  handleCreate: (e: React.FormEvent) => void; creating: boolean; createError: string;
};

export function CreateTeacherModal({
  createOpen, setCreateOpen, createForm, setCreateForm,
  handleCreate, creating, createError
}: CreateModalProps) {
  const [showPassword, setShowPassword] = useState(false);

  if (!createOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-30 flex items-end sm:items-center justify-center p-4">
      <div className="bg-surface w-full max-w-[430px] sm:max-w-[520px] md:max-w-[640px] rounded-t-2xl sm:rounded-2xl p-5 max-h-[85vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h2 className="text-lg font-bold">Nuevo profesor</h2>
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
                <input className="w-full rounded-lg border border-border px-3 py-2 text-sm" placeholder="Ej: Laura" value={createForm.firstName} onChange={(e) => setCreateForm((prev: any) => ({ ...prev, firstName: e.target.value }))} required />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted">Apellido</label>
                <input className="w-full rounded-lg border border-border px-3 py-2 text-sm" placeholder="Ej: Gómez" value={createForm.lastName} onChange={(e) => setCreateForm((prev: any) => ({ ...prev, lastName: e.target.value }))} required />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted">DNI (solo números)</label>
              <input className="w-full rounded-lg border border-border px-3 py-2 text-sm" placeholder="Ej: 40123456" inputMode="numeric" value={createForm.dni} onChange={(e) => setCreateForm((prev: any) => ({ ...prev, dni: e.target.value.replace(/\D/g, '') }))} required />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted">Correo electrónico (opcional)</label>
              <input type="email" className="w-full rounded-lg border border-border px-3 py-2 text-sm" placeholder="Ej: profe@mail.com" value={createForm.email} onChange={(e) => setCreateForm((prev: any) => ({ ...prev, email: e.target.value }))} />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted">Teléfono</label>
              <input className="w-full rounded-lg border border-border px-3 py-2 text-sm" placeholder="Ej: 11 2345-6789" value={createForm.phone} onChange={(e) => setCreateForm((prev: any) => ({ ...prev, phone: e.target.value }))} required />
            </div>


            <div className="space-y-1">
              <label className="text-xs text-muted">Contraseña (opcional)</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} className="w-full rounded-lg border border-border px-3 py-2 text-sm pr-10" placeholder="Si se omite, se generará una temporal" value={createForm.password} onChange={(e) => setCreateForm((prev: any) => ({ ...prev, password: e.target.value }))} />
                <button className="absolute inset-y-0 right-3 flex items-center text-gray-400" type="button" onClick={() => setShowPassword(!showPassword)}>
                  <span className="material-symbols-outlined text-lg">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            <button className="w-full rounded-lg bg-primary text-white text-sm font-semibold py-3 disabled:opacity-70" type="submit" disabled={creating}>
              {creating ? 'Creando...' : 'Crear profesor'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
