import { useState } from 'react';
import type { CreateStudentForm, GymOption } from '../hooks/useTeacherStudents';
import { emptyForm } from '../hooks/useTeacherStudents';

type CreateModalProps = {
  createOpen: boolean; setCreateOpen: (v: boolean) => void;
  form: CreateStudentForm; setForm: (f: any) => void;
  gyms: GymOption[]; handleCreate: (e: React.FormEvent) => void;
  saving: boolean; createError: string;
};

export function CreateTeacherStudentModal({
  createOpen, setCreateOpen, form, setForm, gyms, handleCreate, saving, createError
}: CreateModalProps) {
  const [showPassword, setShowPassword] = useState(false);

  if (!createOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-30 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white w-full max-w-[430px] sm:max-w-[520px] md:max-w-[640px] rounded-t-2xl sm:rounded-2xl p-5 max-h-[85vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h2 className="text-lg font-bold">Nuevo alumno</h2>
          <button className="text-gray-400" type="button" onClick={() => { setCreateOpen(false); setForm(emptyForm); }}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto pr-1 -mr-1">
          <form className="space-y-4" onSubmit={handleCreate}>
            {createError && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{createError}</div>}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-gray-500">Nombre</label>
                <input className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" placeholder="Ej: Juan" value={form.firstName} onChange={(e) => setForm((prev: any) => ({ ...prev, firstName: e.target.value }))} required />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-500">Apellido</label>
                <input className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" placeholder="Ej: Pérez" value={form.lastName} onChange={(e) => setForm((prev: any) => ({ ...prev, lastName: e.target.value }))} required />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-500">DNI (solo números)</label>
              <input className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" placeholder="Ej: 40123456" inputMode="numeric" value={form.dni} onChange={(e) => setForm((prev: any) => ({ ...prev, dni: e.target.value.replace(/\D/g, '') }))} required />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-500">Correo electrónico (opcional)</label>
              <input type="email" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" placeholder="Ej: alumno@mail.com" value={form.email} onChange={(e) => setForm((prev: any) => ({ ...prev, email: e.target.value }))} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-gray-500">Gimnasio (opcional)</label>
                <select className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm" value={form.gymId} onChange={(e) => setForm((prev: any) => ({ ...prev, gymId: e.target.value }))}>
                  <option value="">Sin asignacion</option>
                  {gyms.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-500">Tipo (opcional)</label>
                <select className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm" value={form.category} onChange={(e) => setForm((prev: any) => ({ ...prev, category: e.target.value }))}>
                  <option value="ADULT">Adulto</option>
                  <option value="CHILD">Infantil</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-500">Fecha de nacimiento (opcional)</label>
              <input type="date" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" value={form.birthDate} onChange={(e) => setForm((prev: any) => ({ ...prev, birthDate: e.target.value }))} />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-500">Dirección (opcional)</label>
              <input className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" placeholder="Ej: Calle 123" value={form.address} onChange={(e) => setForm((prev: any) => ({ ...prev, address: e.target.value }))} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-gray-500">Telefono del alumno (opcional)</label>
                <input className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" placeholder="Ej: 11 2345-6789" value={form.phone} onChange={(e) => setForm((prev: any) => ({ ...prev, phone: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-500">Telefono tutor (opcional)</label>
                <input className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" placeholder="Ej: 11 2345-6789" value={form.guardianPhone} onChange={(e) => setForm((prev: any) => ({ ...prev, guardianPhone: e.target.value }))} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-500">Contraseña</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm pr-10" placeholder="Por defecto: DNI" value={form.password} onChange={(e) => setForm((prev: any) => ({ ...prev, password: e.target.value }))} required />
                <button className="absolute inset-y-0 right-3 flex items-center text-gray-400" type="button" onClick={() => setShowPassword(!showPassword)}>
                  <span className="material-symbols-outlined text-lg">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            <button className="w-full rounded-lg bg-primary text-white text-sm font-semibold py-3 disabled:opacity-70" type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Crear alumno'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
