import { Link } from 'react-router-dom';

export function TopHeader({ returnTo }: { returnTo: string }) {
  return (
    <div className="sticky top-0 z-10 flex items-center bg-background/90 backdrop-blur-md p-4 pb-2 justify-between border-b border-border">
      <Link className="text-text flex size-12 shrink-0 items-center cursor-pointer" to={returnTo}>
        <span className="material-symbols-outlined">arrow_back_ios</span>
      </Link>
      <h2 className="text-text text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
        Detalle del Alumno
      </h2>
      <div className="flex w-12 items-center justify-end">
        <span className="material-symbols-outlined">badge</span>
      </div>
    </div>
  );
}

export function ProfileAvatar({ fullName, gymName }: { fullName: string; gymName?: string | null }) {
  return (
    <div className="flex p-4 @container">
      <div className="flex w-full flex-col gap-4 items-center">
        <div className="flex gap-4 flex-col items-center">
          <div className="bg-primary text-white flex items-center justify-center rounded-full h-28 w-28 shadow-soft">
            <span className="material-symbols-outlined text-4xl">person</span>
          </div>
          <div className="flex flex-col items-center justify-center">
            <p className="text-text text-[24px] font-bold leading-tight tracking-[-0.015em] text-center">
              {fullName}
            </p>
            <p className="text-[#9a4c4c] dark:text-primary/80 text-sm font-medium mt-1 leading-normal text-center">
              {gymName ? `Gimnasio: ${gymName}` : 'Gimnasio sin definir'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 px-4 min-h-[72px] py-2 border-b border-border">
      <div className="text-text flex items-center justify-center rounded-lg bg-gray-100 dark:bg-border/50 shrink-0 size-12">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div className="flex flex-col justify-center">
        <p className="text-text text-base font-medium leading-normal line-clamp-1">{label}</p>
        <p className="text-[#9a4c4c] dark:text-primary/80 text-sm font-normal leading-normal line-clamp-2">{value}</p>
      </div>
    </div>
  );
}

export function EditProfileForm({
  editForm, updateEditForm, onSave, isSaving
}: {
  editForm: any; updateEditForm: (f: any, v: string) => void; gyms?: any[]; onSave: () => void; isSaving: boolean;
}) {
  return (
    <div className="space-y-3 rounded-xl border border-border bg-background p-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <label className="space-y-1">
          <span className="text-xs text-muted">Nombre</span>
          <input className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm" value={editForm.firstName} onChange={(e) => updateEditForm('firstName', e.target.value)} />
        </label>
        <label className="space-y-1">
          <span className="text-xs text-muted">Apellido</span>
          <input className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm" value={editForm.lastName} onChange={(e) => updateEditForm('lastName', e.target.value)} />
        </label>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <label className="space-y-1">
          <span className="text-xs text-muted">Correo (opcional)</span>
          <input type="email" className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm" value={editForm.email} onChange={(e) => updateEditForm('email', e.target.value)} />
        </label>
        <label className="space-y-1">
          <span className="text-xs text-muted">Telefono (opcional)</span>
          <input className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm" value={editForm.phone} onChange={(e) => updateEditForm('phone', e.target.value)} />
        </label>
      </div>
      <label className="space-y-1 block mb-2">
        <span className="text-xs text-muted">Direccion (opcional)</span>
        <input className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm" value={editForm.address} onChange={(e) => updateEditForm('address', e.target.value)} />
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div />
        <label className="space-y-1">
          <span className="text-xs text-muted">Tipo</span>
          <select className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm" value={editForm.category} onChange={(e) => updateEditForm('category', e.target.value)}>
            <option value="ADULT">Adulto</option>
            <option value="CHILD">Infantil</option>
          </select>
        </label>
      </div>
      <div className="flex justify-end">
        <button className="rounded-lg bg-primary text-white text-sm font-semibold px-4 py-2.5 disabled:opacity-70" type="button" onClick={onSave} disabled={isSaving}>
          {isSaving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  );
}
