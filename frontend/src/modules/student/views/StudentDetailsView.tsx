import { useState } from 'react';
import { useStudentDetails } from '../hooks/useStudentDetails';
import { TopHeader, ProfileAvatar, InfoRow, EditProfileForm } from '../components/StudentUI';

export function StudentDetailsView() {
  const {
    student, studentName, fees,
    isLoading, errorMsg, isEditing, isSaving, editForm, updateEditForm, toggleEditMode, saveProfile,
    isResettingPass, resetPassTemp, copiedReset, resetPassword, copyResetPassword,
    actionLoading, unassignStudent, deleteStudent,
    markingFee, markFeeAsPaid,
    returnTo, isTeacher
  } = useStudentDetails();

  const categoryLabel = (val?: 'ADULT' | 'CHILD') => val === 'CHILD' ? 'Infantil' : 'Adulto';
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const formatDateAsCalendar = (d: string) => new Date(d).toLocaleDateString('es-AR', { timeZone: 'UTC' });

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col max-w-[480px] sm:max-w-[640px] md:max-w-[800px] mx-auto overflow-x-hidden border-x border-gray-200 bg-background-light text-[#1b0d0d]">
      <TopHeader returnTo={returnTo} />
      <ProfileAvatar fullName={studentName} gymName={student?.gym?.name} />

      {isLoading && <div className="px-4 pb-4 text-sm text-gray-500">Cargando alumno...</div>}
      {errorMsg && <div className="px-4 pb-4 text-sm text-red-600">{errorMsg}</div>}

      <h3 className="text-[#1b0d0d] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-2">
        Información Personal
      </h3>
      <InfoRow icon="fingerprint" label="DNI" value={student?.dni ?? '-'} />
      <InfoRow icon="sell" label="Tipo" value={categoryLabel(student?.category)} />
      <InfoRow icon="phone" label="Teléfono" value={student?.phone ?? '-'} />
      <InfoRow icon="mail" label="Correo electrónico" value={student?.email ?? '-'} />
      <InfoRow icon="home" label="Dirección" value={student?.address ?? '-'} />
      <InfoRow icon="military_tech" label="Cinturón actual" value={student?.currentBelt ?? '-'} />
      <InfoRow icon="class" label="Comisión" value={student?.classGroup?.name ?? '-'} />

      {isTeacher && (
        <div className="px-4 pt-4">
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm space-y-3">
            <p className="text-sm font-semibold">Acciones del profesor</p>
            {isEditing && (
              <EditProfileForm editForm={editForm} updateEditForm={updateEditForm} gyms={[]} onSave={saveProfile} isSaving={isSaving} />
            )}
            <div className="flex flex-wrap items-center gap-2">
              <button
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold disabled:opacity-70 ${isEditing ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 bg-white text-[#1b0d0d]'}`}
                onClick={toggleEditMode} disabled={isSaving}
              >
                <span className="material-symbols-outlined text-base">edit</span>
                {isEditing ? 'Cerrar edicion' : 'Editar datos'}
              </button>
              <button className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-[#1b0d0d] disabled:opacity-70" onClick={unassignStudent} disabled={actionLoading !== null}>
                <span className="material-symbols-outlined text-base">link_off</span>
                {actionLoading === 'unassign' ? 'Desasignando...' : 'Desasignar alumno'}
              </button>
              <button className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-[#1b0d0d] disabled:opacity-70" onClick={resetPassword} disabled={isResettingPass}>
                <span className="material-symbols-outlined text-base">key</span>
                {isResettingPass ? 'Reseteando...' : 'Resetear contraseña'}
              </button>
              <button className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-70" onClick={deleteStudent} disabled={actionLoading !== null}>
                <span className="material-symbols-outlined text-base">delete</span>
                {actionLoading === 'delete' ? 'Eliminando...' : 'Eliminar alumno'}
              </button>
            </div>
            {resetPassTemp && (
              <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 flex items-center justify-between gap-2">
                <span>Temporal: {resetPassTemp}</span>
                <button className={`text-xs font-semibold transition-all ${copiedReset ? 'text-green-700 bg-green-100 px-2 py-1 rounded-md scale-[1.03]' : 'text-amber-700'}`} onClick={copyResetPassword}>
                  {copiedReset ? 'Copiado' : 'Copiar'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}



      <h3 className="text-[#1b0d0d] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-6">Estado de Pagos</h3>
      <div className="px-4 pb-24 space-y-3">
        {fees.length === 0 && !isLoading && <div className="bg-white p-4 rounded-xl text-sm text-gray-500 border border-gray-100">No hay cuotas registradas.</div>}
        {fees.map((fee) => {
          const monthLabel = monthNames[fee.month - 1] ?? `Mes ${fee.month}`;
          const isPaid = fee.status === 'PAID';
          const amountLabel = Number(fee.amount).toLocaleString('es-AR');
          return (
            <div key={fee.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{monthLabel} {fee.year}</p>
                  <p className="text-xs text-gray-500">Vence: {formatDateAsCalendar(fee.dueDate)}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isPaid ? 'bg-green-100 text-green-700' : 'bg-primary/10 text-primary'}`}>
                  {isPaid ? 'Pagado' : 'Pendiente'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Monto</p>
                  <p className="text-base font-bold">${amountLabel}</p>
                  {fee.lateFeeApplied && !isPaid && <p className="text-[11px] text-primary mt-1">Incluye recargo por mora.</p>}
                </div>
                {!isPaid && (
                  <button className="rounded-lg bg-primary text-white text-xs font-semibold px-3 py-2 disabled:opacity-70" onClick={() => markFeeAsPaid(fee.id)} disabled={markingFee === fee.id}>
                    {markingFee === fee.id ? 'Marcando...' : 'Marcar efectivo'}
                  </button>
                )}
                {isPaid && fee.paidAt && <span className="text-xs text-gray-500">{new Date(fee.paidAt).toLocaleDateString('es-AR')}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
