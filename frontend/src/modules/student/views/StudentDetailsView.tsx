import { useStudentDetails } from '../hooks/useStudentDetails';
import { TopHeader, ProfileAvatar, InfoRow, EditProfileForm } from '../components/StudentUI';
import { DirectPaymentModal, PayYearModal, ReviewPaymentModal, ViewReceiptsModal } from '../../admin/components/FeeManagementModals';

export function StudentDetailsView() {
  const {
    student, studentName, fees,
    isLoading, errorMsg, isEditing, isSaving, editForm, updateEditForm, toggleEditMode, saveProfile,
    isResettingPass, resetPassTemp, copiedReset, resetPassword, copyResetPassword,
    actionLoading, unassignStudent, deleteStudent,
    processingFees, payYearStudent, setPayYearStudent, handlePayFullYear,
    directPaymentFee, setDirectPaymentFee, handleDirectPayment,
    reviewPaymentTx, setReviewPaymentTx, handleApproveTransaction, handleRejectTransaction,
    viewReceiptsFee, setViewReceiptsFee,
    returnTo, isTeacher, canManage, classGroups
  } = useStudentDetails();

  const categoryLabel = (val?: 'ADULT' | 'CHILD') => val === 'CHILD' ? 'Infantil' : 'Adulto';
  const beltLabel = (belt?: string) => {
    if (!belt) return '-';
    const mapping: Record<string, string> = {
      WHITE: 'Blanco',
      WHITE_YELLOW: 'Blanco Punta Amarilla',
      YELLOW: 'Amarillo',
      GREEN_STRIPE: 'Amarillo Punta Verde',
      GREEN: 'Verde',
      BLUE_STRIPE: 'Verde Punta Azul',
      BLUE: 'Azul',
      RED_STRIPE: 'Azul Punta Roja',
      RED: 'Rojo',
      BLACK_STRIPE: 'Rojo Punta Negra',
      DAN: 'Dan (Negro)',
    };
    return mapping[belt] || belt;
  };
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const formatDateAsCalendar = (d: string) => new Date(d).toLocaleDateString('es-AR', { timeZone: 'UTC' });

  const getStatusBadge = (status: 'PENDING' | 'PARTIALLY_PAID' | 'PAID') => {
    switch (status) {
      case 'PAID':
        return <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap uppercase">Pagado</span>;
      case 'PARTIALLY_PAID':
        return <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap uppercase">Pago Parcial</span>;
      case 'PENDING':
        return <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap uppercase">Pendiente</span>;
      default:
        return null;
    }
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col max-w-[480px] sm:max-w-[640px] md:max-w-[800px] mx-auto overflow-x-hidden border-x border-border bg-background text-text">
      <TopHeader returnTo={returnTo} />
      <ProfileAvatar fullName={studentName} gymName={student?.gym?.name} />

      {isLoading && <div className="px-4 pb-4 text-sm text-muted">Cargando alumno...</div>}
      {errorMsg && <div className="px-4 pb-4 text-sm text-red-600">{errorMsg}</div>}

      <h3 className="text-text text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-2">
        Información Personal
      </h3>
      <InfoRow icon="fingerprint" label="DNI" value={student?.dni ?? '-'} />
      <InfoRow icon="sell" label="Tipo" value={categoryLabel(student?.category)} />
      <InfoRow icon="phone" label="Teléfono" value={student?.phone ?? '-'} />
      <InfoRow icon="mail" label="Correo electrónico" value={student?.email ?? '-'} />
      <InfoRow icon="home" label="Dirección" value={student?.address ?? '-'} />
      <InfoRow icon="sports_martial_arts" label="Cinturón actual" value={beltLabel(student?.currentBelt)} />
      <InfoRow icon="class" label="Clase" value={student?.classGroup?.name ?? '-'} />

      {canManage && (
        <div className="px-4 pt-4">
          <div className="bg-surface border border-border rounded-xl p-4 shadow-soft space-y-3">
            <p className="text-sm font-semibold">Acciones de gestión</p>
            {isEditing && (
              <EditProfileForm editForm={editForm} updateEditForm={updateEditForm} classGroups={classGroups} onSave={saveProfile} isSaving={isSaving} />
            )}
            <div className="flex flex-wrap items-center gap-2">
              <button
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold disabled:opacity-70 ${isEditing ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-surface text-text'}`}
                onClick={toggleEditMode} disabled={isSaving}
              >
                <span className="material-symbols-outlined text-base">edit</span>
                {isEditing ? 'Cerrar edicion' : 'Editar datos'}
              </button>
              {isTeacher && (
                <button className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-semibold text-text disabled:opacity-70" onClick={unassignStudent} disabled={actionLoading !== null}>
                  <span className="material-symbols-outlined text-base">link_off</span>
                  {actionLoading === 'unassign' ? 'Desasignando...' : 'Desasignar alumno'}
                </button>
              )}
              <button className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-semibold text-text disabled:opacity-70" onClick={resetPassword} disabled={isResettingPass}>
                <span className="material-symbols-outlined text-base">key</span>
                {isResettingPass ? 'Reseteando...' : 'Resetear contraseña'}
              </button>
              <button className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-70" onClick={deleteStudent} disabled={actionLoading !== null}>
                <span className="material-symbols-outlined text-base">delete</span>
                {actionLoading === 'delete' ? 'Eliminando...' : 'Eliminar alumno'}
              </button>
            </div>
            {resetPassTemp && (
              <div className="rounded-md border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20 px-3 py-2 text-xs text-amber-700 dark:text-amber-400 flex items-center justify-between gap-2">
                <span>Temporal: {resetPassTemp}</span>
                <button className={`text-xs font-semibold transition-all ${copiedReset ? 'text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-950/30 px-2 py-1 rounded-md scale-[1.03]' : 'text-amber-700 dark:text-amber-400'}`} onClick={copyResetPassword}>
                  {copiedReset ? 'Copiado' : 'Copiar'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}



      <h3 className="text-text text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-6">Estado de Pagos</h3>
      <div className="px-4 pb-24 space-y-3">
        {fees.length === 0 && !isLoading && <div className="bg-surface p-4 rounded-xl text-sm text-muted border border-border">No hay cuotas registradas.</div>}
        {fees.map((fee) => {
          const monthLabel = monthNames[fee.month - 1] ?? `Mes ${fee.month}`;
          const amountLabel = Number(fee.totalAmount).toLocaleString('es-AR');
          const pendingTx = fee.payments?.find(tx => tx.status === 'PENDING');
          
          return (
            <div key={fee.id} className="bg-surface border border-border rounded-xl p-4 shadow-soft space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    {pendingTx && (
                      <span className="absolute -top-1 -right-1 flex h-3 w-3 z-10">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-surface"></span>
                      </span>
                    )}
                    <div>
                      <p className="text-sm font-semibold">{monthLabel} {fee.year}</p>
                      <p className="text-xs text-muted">Vence: {formatDateAsCalendar(fee.dueDate)}</p>
                    </div>
                  </div>
                </div>
                {getStatusBadge(fee.status)}
              </div>
              
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted">Total: <span className="font-bold text-text">${amountLabel}</span></p>
                    <p className="text-xs text-muted">Pagado: <span className="font-bold text-text">${fee.paidAmount}</span></p>
                    {fee.lateFeeApplied && <p className="text-[11px] text-primary mt-1">Incluye recargo por mora (${fee.surchargeAmount}).</p>}
                  </div>
                </div>
                
                {canManage && (
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {pendingTx ? (
                      <button
                        className="rounded-lg bg-orange-500 text-white text-xs font-semibold px-3 py-2 flex items-center gap-1 hover:bg-orange-600 transition-colors shadow-soft"
                        onClick={() => setReviewPaymentTx(pendingTx)}
                        title="Revisar comprobante pendiente"
                      >
                        <span className="material-symbols-outlined text-[16px]">plagiarism</span>
                        Revisar Pago
                      </button>
                    ) : null}

                    {fee.payments?.some(tx => tx.proofImageUrl) && !pendingTx && (
                      <button
                        className="rounded-lg bg-indigo-500 text-white text-xs font-semibold px-3 py-2 flex items-center gap-1 hover:bg-indigo-600 transition-colors shadow-soft"
                        onClick={() => setViewReceiptsFee(fee)}
                        title="Ver comprobantes"
                      >
                        <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                        Comprobantes
                      </button>
                    )}

                    {!pendingTx && (
                      <>
                        {fee.status !== 'PAID' && (
                          <button
                            className="rounded-lg bg-primary text-white text-xs font-semibold px-3 py-2 flex items-center gap-1 hover:bg-primary/90 transition-colors shadow-soft"
                            onClick={() => setDirectPaymentFee(fee)}
                            title="Registrar pago en efectivo"
                          >
                            <span className="material-symbols-outlined text-[16px]">payments</span>
                            Pagar
                          </button>
                        )}
                        <button
                          className="rounded-lg border border-border bg-surface text-text text-xs font-semibold px-3 py-2 flex items-center gap-1 hover:bg-background transition-colors shadow-soft"
                          onClick={() => setPayYearStudent({ id: fee.studentId, name: `${student?.firstName} ${student?.lastName}` })}
                          title="Marcar el año completo como pagado"
                        >
                          <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                          Año
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <DirectPaymentModal
        fee={directPaymentFee}
        onClose={() => setDirectPaymentFee(null)}
        onConfirm={handleDirectPayment}
        processing={processingFees}
      />

      <PayYearModal
        student={payYearStudent}
        year={new Date().getFullYear()}
        onClose={() => setPayYearStudent(null)}
        onConfirm={handlePayFullYear}
        processing={processingFees}
      />

      <ReviewPaymentModal
        transaction={reviewPaymentTx}
        onClose={() => setReviewPaymentTx(null)}
        onApprove={handleApproveTransaction}
        onReject={handleRejectTransaction}
        processing={processingFees}
      />

      <ViewReceiptsModal
        fee={viewReceiptsFee}
        onClose={() => setViewReceiptsFee(null)}
      />
    </div>
  );
}
