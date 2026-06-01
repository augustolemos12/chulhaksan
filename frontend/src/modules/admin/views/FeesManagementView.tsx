import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useFeesManagement } from '../hooks/useFeesManagement';
import { DirectPaymentModal, PayYearModal, ReviewPaymentModal, GenerateFeesModal, ViewReceiptsModal } from '../components/FeeManagementModals';
import type { FeeStatus } from '../../../services/fees';

export function FeesManagementView() {
  const {
    fees, loading, error,
    month, setMonth,
    year, setYear,
    statusFilter, setStatusFilter,
    searchQuery, setSearchQuery,
    processing,
    payYearStudent, setPayYearStudent, handlePayFullYear,
    directPaymentFee, setDirectPaymentFee, handleDirectPayment,
    reviewPaymentTx, setReviewPaymentTx, handleApproveTransaction, handleRejectTransaction,
    handleGenerateFees
  } = useFeesManagement();

  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [viewReceiptsFee, setViewReceiptsFee] = useState<any>(null);

  const months = [
    { value: 1, label: 'Enero' }, { value: 2, label: 'Febrero' }, { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' }, { value: 5, label: 'Mayo' }, { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' }, { value: 8, label: 'Agosto' }, { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' }, { value: 11, label: 'Noviembre' }, { value: 12, label: 'Diciembre' }
  ];

  const getStatusBadge = (status: FeeStatus) => {
    switch (status) {
      case 'PAID':
        return <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap">Al Día</span>;
      case 'PARTIALLY_PAID':
        return <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap">Pago Parcial</span>;
      case 'PENDING':
        return <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap">Pendiente</span>;
      default:
        return null;
    }
  };

  const totalFees = fees.length;
  const paidCount = fees.filter(f => f.status === 'PAID').length;
  const pendingCount = fees.filter(f => f.status === 'PENDING' || f.status === 'PARTIALLY_PAID').length;

  return (
    <div className="min-h-screen bg-background text-text">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center p-4 justify-between w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto">
          <Link className="text-text flex size-10 shrink-0 items-center justify-center" to="/dashboard">
            <span className="material-symbols-outlined">arrow_back_ios</span>
          </Link>
          <h1 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center">
            Administración de Cuotas
          </h1>
          <button 
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center gap-1 text-xs font-bold text-primary hover:bg-primary/10 px-3 py-2 rounded-xl transition-colors"
            title="Generar Cuotas del Mes"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            <span className="hidden sm:inline">Generar</span>
          </button>
        </div>
      </header>

      <main className="w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto p-4 pb-24 space-y-4">
        {/* Estadísticas Rápidas */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-surface rounded-2xl border border-border shadow-soft p-4 text-center">
            <p className="text-[10px] sm:text-xs uppercase tracking-wider text-muted font-bold">Total</p>
            <p className="text-xl sm:text-2xl font-bold text-text mt-1">{totalFees}</p>
          </div>
          <div className="bg-green-50 rounded-2xl border border-green-100 shadow-soft p-4 text-center">
            <p className="text-[10px] sm:text-xs uppercase tracking-wider text-green-700 font-bold">Al Día</p>
            <p className="text-xl sm:text-2xl font-bold text-green-800 mt-1">{paidCount}</p>
          </div>
          <div className="bg-red-50 rounded-2xl border border-red-100 shadow-soft p-4 text-center">
            <p className="text-[10px] sm:text-xs uppercase tracking-wider text-red-700 font-bold">Deudores</p>
            <p className="text-xl sm:text-2xl font-bold text-red-800 mt-1">{pendingCount}</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-surface rounded-2xl border border-border shadow-soft p-4 flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-xs uppercase tracking-wider text-primary font-bold mb-1">Buscador</label>
            <div className="flex items-stretch rounded-lg border border-border bg-background">
              <div className="flex items-center justify-center pl-3 text-muted">
                <span className="material-symbols-outlined text-sm">search</span>
              </div>
              <input
                className="w-full bg-transparent border-none focus:ring-0 text-sm py-2 px-2"
                placeholder="Nombre o DNI..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="w-full md:w-32">
            <label className="block text-xs uppercase tracking-wider text-primary font-bold mb-1">Mes</label>
            <select
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              value={month}
              onChange={e => setMonth(Number(e.target.value))}
            >
              {months.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          <div className="w-full md:w-28">
            <label className="block text-xs uppercase tracking-wider text-primary font-bold mb-1">Año</label>
            <input
              type="number"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              value={year}
              onChange={e => setYear(Number(e.target.value))}
            />
          </div>

          <div className="w-full md:w-36">
            <label className="block text-xs uppercase tracking-wider text-primary font-bold mb-1">Estado</label>
            <select
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as FeeStatus | '')}
            >
              <option value="">Todos</option>
              <option value="PAID">Al Día</option>
              <option value="PENDING">Pendientes</option>
              <option value="PARTIALLY_PAID">Pago Parcial</option>
            </select>
          </div>
        </div>

        {/* Lista de Cuotas */}
        {loading && <div className="bg-surface p-4 rounded-xl text-sm text-muted border border-border text-center">Cargando cuotas...</div>}
        {error && <div className="bg-red-50 p-4 rounded-xl text-sm text-red-600 border border-red-200">{error}</div>}
        {!loading && !error && fees.length === 0 && <div className="bg-surface p-4 rounded-xl text-sm text-muted border border-border text-center">No se encontraron cuotas para los filtros seleccionados.</div>}

        <div className="flex flex-col gap-3">
          {fees.map((fee) => {
            const pendingTx = fee.payments?.find(tx => tx.status === 'PENDING');

            return (
              <div key={fee.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-surface p-4 rounded-xl justify-between shadow-soft border border-border/50">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="bg-primary/10 text-primary flex shrink-0 items-center justify-center rounded-full h-12 w-12 relative">
                    <span className="material-symbols-outlined">person</span>
                    {pendingTx && (
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-surface"></span>
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col justify-center overflow-hidden">
                    <p className="text-text text-base font-semibold leading-tight truncate">
                      {fee.student?.firstName} {fee.student?.lastName}
                    </p>
                    <p className="text-muted text-xs font-medium mt-1">DNI: {fee.student?.dni}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-medium text-text">Total: ${fee.totalAmount}</span>
                      <span className="text-muted text-[10px]">|</span>
                      <span className="text-xs font-medium text-text">Pagado: ${fee.paidAmount}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 mt-2 sm:mt-0">
                  <div className="sm:mr-2">
                    {getStatusBadge(fee.status)}
                  </div>
                  <div className="flex items-center gap-2">
                    {pendingTx ? (
                      <button
                        className="rounded-lg bg-orange-500 text-white text-xs font-semibold px-3 py-2 flex items-center gap-1 hover:bg-orange-600 transition-colors shadow-soft"
                        onClick={() => setReviewPaymentTx(pendingTx)}
                        title="Revisar comprobante pendiente"
                      >
                        <span className="material-symbols-outlined text-[16px]">plagiarism</span>
                        <span className="hidden sm:inline">Revisar Pago</span>
                      </button>
                    ) : null}

                    {fee.payments?.some(tx => tx.proofImageUrl) && !pendingTx && (
                      <button
                        className="rounded-lg bg-indigo-500 text-white text-xs font-semibold px-3 py-2 flex items-center gap-1 hover:bg-indigo-600 transition-colors shadow-soft"
                        onClick={() => setViewReceiptsFee(fee)}
                        title="Ver comprobantes"
                      >
                        <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                        <span className="hidden sm:inline">Comprobantes</span>
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
                            <span className="hidden sm:inline">Pagar</span>
                          </button>
                        )}
                        <button
                          className="rounded-lg border border-border bg-surface text-text text-xs font-semibold px-3 py-2 flex items-center gap-1 hover:bg-background transition-colors shadow-soft"
                          onClick={() => setPayYearStudent({ id: fee.studentId, name: `${fee.student?.firstName} ${fee.student?.lastName}` })}
                          title="Marcar el año completo como pagado"
                        >
                          <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                          <span className="hidden sm:inline">Año</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <DirectPaymentModal
        fee={directPaymentFee}
        onClose={() => setDirectPaymentFee(null)}
        onConfirm={handleDirectPayment}
        processing={processing}
      />

      <PayYearModal
        student={payYearStudent}
        year={year}
        onClose={() => setPayYearStudent(null)}
        onConfirm={handlePayFullYear}
        processing={processing}
      />

      <ReviewPaymentModal
        transaction={reviewPaymentTx}
        onClose={() => setReviewPaymentTx(null)}
        onApprove={handleApproveTransaction}
        onReject={handleRejectTransaction}
        processing={processing}
      />

      {showGenerateModal && (
        <GenerateFeesModal
          onClose={() => setShowGenerateModal(false)}
          onConfirm={async (m, y, d) => {
            const success = await handleGenerateFees(m, y, d);
            if (success) setShowGenerateModal(false);
          }}
          processing={processing}
        />
      )}

      <ViewReceiptsModal
        fee={viewReceiptsFee}
        onClose={() => setViewReceiptsFee(null)}
      />
    </div>
  );
}
