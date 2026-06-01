import { useState, useEffect } from 'react';
import type { Fee } from '../../../services/fees';

interface DirectPaymentModalProps {
  fee: Fee | null;
  onClose: () => void;
  onConfirm: (amount: number) => void;
  processing: boolean;
}

export function DirectPaymentModal({ fee, onClose, onConfirm, processing }: DirectPaymentModalProps) {
  const [amount, setAmount] = useState<number>(0);

  useEffect(() => {
    if (fee) {
      setAmount(fee.totalAmount - fee.paidAmount);
    }
  }, [fee]);

  if (!fee) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-surface rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <h2 className="text-xl font-bold text-text mb-2">Registrar Pago en Efectivo</h2>
          <p className="text-sm text-muted mb-6">
            Alumno: <span className="font-semibold text-text">{fee.student?.firstName} {fee.student?.lastName}</span>
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                Monto a Pagar ($)
              </label>
              <input
                type="number"
                className="w-full form-input bg-background border border-border rounded-xl px-4 py-3 text-text focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                min={1}
                max={fee.totalAmount - fee.paidAmount}
              />
            </div>
            <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted">Total cuota:</span>
                <span className="font-semibold text-text">${fee.totalAmount}</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted">Pagado hasta ahora:</span>
                <span className="font-semibold text-text">${fee.paidAmount}</span>
              </div>
              <div className="flex justify-between text-sm font-bold mt-2 pt-2 border-t border-primary/10">
                <span className="text-primary">Restante:</span>
                <span className="text-primary">${fee.totalAmount - fee.paidAmount}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-background/50 border-t border-border flex justify-end gap-3">
          <button
            className="px-4 py-2 text-sm font-semibold text-text hover:bg-surface border border-border rounded-xl transition-colors"
            onClick={onClose}
            disabled={processing}
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-xl transition-colors shadow-soft disabled:opacity-50"
            onClick={() => onConfirm(amount)}
            disabled={processing || amount <= 0 || amount > (fee.totalAmount - fee.paidAmount)}
          >
            {processing ? 'Procesando...' : 'Confirmar Pago'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface PayYearModalProps {
  student: { id: number; name: string } | null;
  year: number;
  onClose: () => void;
  onConfirm: (method: 'CASH' | 'TRANSFER', file?: File) => void;
  processing: boolean;
}

export function PayYearModal({ student, year, onClose, onConfirm, processing }: PayYearModalProps) {
  const [method, setMethod] = useState<'CASH' | 'TRANSFER'>('CASH');
  const [file, setFile] = useState<File | null>(null);

  if (!student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-surface rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mb-4">
            <span className="material-symbols-outlined text-3xl">workspace_premium</span>
          </div>
          <h2 className="text-xl font-bold text-text mb-2">Pago Año Completo</h2>
          <p className="text-sm text-muted mb-6">
            ¿Confirmas que deseas marcar el año <span className="font-semibold text-text">{year}</span> como pagado por completo para el alumno <span className="font-semibold text-text">{student.name}</span>?
          </p>

          <div className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                Método de Pago
              </label>
              <select
                className="w-full form-select bg-background border border-border rounded-xl px-4 py-3 text-text focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                value={method}
                onChange={(e) => setMethod(e.target.value as 'CASH' | 'TRANSFER')}
              >
                <option value="CASH">Efectivo</option>
                <option value="TRANSFER">Transferencia</option>
              </select>
            </div>
            
            {method === 'TRANSFER' && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                  Comprobante (Opcional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFile(e.target.files[0]);
                    }
                  }}
                  className="w-full text-sm text-text file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
              </div>
            )}
          </div>

          <p className="text-xs text-red-500 bg-red-50 p-3 rounded-lg border border-red-100 mt-6">
            Esta acción generará pagos aprobados para todos los meses restantes del año.
          </p>
        </div>

        <div className="p-4 bg-background/50 border-t border-border flex justify-end gap-3">
          <button
            className="px-4 py-2 text-sm font-semibold text-text hover:bg-surface border border-border rounded-xl transition-colors"
            onClick={onClose}
            disabled={processing}
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-xl transition-colors shadow-soft disabled:opacity-50"
            onClick={() => onConfirm(method, file || undefined)}
            disabled={processing}
          >
            {processing ? 'Procesando...' : 'Confirmar Pago Anual'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface ReviewPaymentModalProps {
  transaction: any;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  processing: boolean;
}

export function ReviewPaymentModal({ transaction, onClose, onApprove, onReject, processing }: ReviewPaymentModalProps) {
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  if (!transaction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-surface rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="p-6 pb-0 shrink-0">
          <h2 className="text-xl font-bold text-text mb-1">Revisar Pago</h2>
          <p className="text-sm text-muted mb-4">
            El alumno ha reportado un pago por <span className="font-bold text-text">${transaction.amount}</span> vía {transaction.method === 'TRANSFER' ? 'Transferencia' : 'Efectivo'}.
          </p>
        </div>
        
        <div className="px-6 py-4 overflow-y-auto">
          {transaction.proofImageUrl ? (
            <div className="rounded-xl overflow-hidden border border-border bg-background/50 flex flex-col justify-center items-center p-2">
              <button 
                type="button" 
                onClick={() => setFullscreenImage(transaction.proofImageUrl)} 
                className="flex justify-center w-full bg-background rounded-lg p-2 border border-border outline-none focus:ring-2 focus:ring-primary/50"
              >
                <img 
                  src={transaction.proofImageUrl} 
                  alt="Comprobante de pago" 
                  className="max-w-full h-auto max-h-[40vh] object-contain cursor-pointer hover:opacity-90 transition-opacity rounded-lg"
                />
              </button>
              <p className="text-xs text-center text-muted p-2 bg-background">
                Haz clic en la imagen para verla en tamaño completo
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 bg-background rounded-xl border border-dashed border-border text-muted">
              <span className="material-symbols-outlined text-4xl mb-2 opacity-50">image_not_supported</span>
              <p className="text-sm text-center">No se subió comprobante adjunto para este reporte.</p>
            </div>
          )}
        </div>

        <div className="p-4 bg-background/50 border-t border-border flex justify-end gap-3 shrink-0">
          <button
            className="px-4 py-2 text-sm font-semibold text-text hover:bg-surface border border-border rounded-xl transition-colors"
            onClick={onClose}
            disabled={processing}
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 border border-red-200 rounded-xl transition-colors disabled:opacity-50"
            onClick={onReject}
            disabled={processing}
          >
            Rechazar
          </button>
          <button
            className="px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-xl transition-colors shadow-soft disabled:opacity-50"
            onClick={onApprove}
            disabled={processing}
          >
            Aprobar
          </button>
        </div>
      </div>
      <FullScreenImageModal imageUrl={fullscreenImage} onClose={() => setFullscreenImage(null)} />
    </div>
  );
}

export interface ViewReceiptsModalProps {
  fee: any | null;
  onClose: () => void;
}

export function ViewReceiptsModal({ fee, onClose }: ViewReceiptsModalProps) {
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  if (!fee) return null;
  const receipts = fee.payments?.filter((tx: any) => tx.proofImageUrl) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-surface rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="p-6 pb-4 shrink-0 border-b border-border">
          <h2 className="text-xl font-bold text-text mb-1">Comprobantes de Pago</h2>
          <p className="text-sm text-muted">
            Alumno: <span className="font-bold text-text">{fee.student?.firstName} {fee.student?.lastName}</span>
          </p>
        </div>
        
        <div className="px-6 py-4 overflow-y-auto space-y-6">
          {receipts.length > 0 ? (
            receipts.map((tx: any, index: number) => (
              <div key={tx.id} className="rounded-xl overflow-hidden border border-border bg-background/50 flex flex-col justify-center items-center p-4">
                <div className="w-full flex justify-between items-center mb-3">
                  <span className="text-sm font-bold text-text">Comprobante #{index + 1}</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    tx.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                    tx.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {tx.status === 'APPROVED' ? 'Aprobado' : tx.status === 'REJECTED' ? 'Rechazado' : 'Pendiente'}
                  </span>
                </div>
                <div className="flex justify-between w-full text-xs text-muted mb-4 px-2">
                  <span>Monto: ${tx.amount}</span>
                  <span>Fecha: {new Date(tx.createdAt).toLocaleDateString()}</span>
                </div>
                <button 
                  type="button"
                  onClick={() => setFullscreenImage(tx.proofImageUrl)} 
                  className="flex justify-center w-full bg-background rounded-lg p-2 border border-border outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <img 
                    src={tx.proofImageUrl} 
                    alt={`Comprobante ${index + 1}`} 
                    className="max-w-full h-auto max-h-[40vh] object-contain cursor-pointer hover:opacity-90 transition-opacity rounded"
                  />
                </button>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center p-8 bg-background rounded-xl border border-dashed border-border text-muted">
              <span className="material-symbols-outlined text-4xl mb-2 opacity-50">image_not_supported</span>
              <p className="text-sm text-center">No hay comprobantes asociados a esta cuota.</p>
            </div>
          )}
        </div>

        <div className="p-4 bg-background/50 border-t border-border flex justify-end gap-3 shrink-0">
          <button
            className="px-4 py-2 text-sm font-semibold text-text hover:bg-surface border border-border rounded-xl transition-colors"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
      <FullScreenImageModal imageUrl={fullscreenImage} onClose={() => setFullscreenImage(null)} />
    </div>
  );
}

interface GenerateFeesModalProps {
  onClose: () => void;
  onConfirm: (month: number, year: number, dueDate: string) => void;
  processing: boolean;
}

export function GenerateFeesModal({ onClose, onConfirm, processing }: GenerateFeesModalProps) {
  const currentDate = new Date();
  const [month, setMonth] = useState<number>(currentDate.getMonth() + 1);
  const [year, setYear] = useState<number>(currentDate.getFullYear());
  
  // Default due date: 10th of the NEXT month
  const [dueDate, setDueDate] = useState<string>(() => {
    // getMonth() is 0-indexed. Adding 1 gets us the next month.
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 10);
    return d.toISOString().split('T')[0];
  });

  const months = [
    { value: 1, label: 'Enero' }, { value: 2, label: 'Febrero' }, { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' }, { value: 5, label: 'Mayo' }, { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' }, { value: 8, label: 'Agosto' }, { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' }, { value: 11, label: 'Noviembre' }, { value: 12, label: 'Diciembre' }
  ];

  const handleMonthYearChange = (m: number, y: number) => {
    setMonth(m);
    setYear(y);
    // m is 1-indexed. Using m directly as the 0-indexed month in Date gives us the next month.
    const newDueDate = new Date(y, m, 10);
    setDueDate(newDueDate.toISOString().split('T')[0]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-surface rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col">
        <div className="p-6 pb-4">
          <h2 className="text-xl font-bold text-text mb-2">Generar Cuotas Masivamente</h2>
          <p className="text-sm text-muted">
            Se generarán cuotas para el mes seleccionado para todos los alumnos activos. El monto de la cuota será determinado por la configuración global vigente en la fecha de vencimiento.
          </p>
        </div>
        
        <div className="px-6 py-4 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                Mes
              </label>
              <select
                className="w-full form-select bg-background border border-border rounded-xl px-4 py-3 text-text focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                value={month}
                onChange={(e) => handleMonthYearChange(Number(e.target.value), year)}
              >
                {months.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                Año
              </label>
              <input
                type="number"
                className="w-full form-input bg-background border border-border rounded-xl px-4 py-3 text-text focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                value={year}
                onChange={(e) => handleMonthYearChange(month, Number(e.target.value))}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
              Fecha de Vencimiento
            </label>
            <input
              type="date"
              className="w-full form-input bg-background border border-border rounded-xl px-4 py-3 text-text focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
            <p className="text-xs text-muted mt-1">Los recargos por mora se aplicarán después de esta fecha.</p>
          </div>
        </div>

        <div className="p-4 bg-background/50 border-t border-border flex justify-end gap-3 shrink-0">
          <button
            className="px-4 py-2 text-sm font-semibold text-text hover:bg-surface border border-border rounded-xl transition-colors"
            onClick={onClose}
            disabled={processing}
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-xl transition-colors shadow-soft disabled:opacity-50"
            onClick={() => onConfirm(month, year, new Date(dueDate).toISOString())}
            disabled={processing}
          >
            {processing ? 'Generando...' : 'Generar Cuotas'}
          </button>
        </div>
      </div>
    </div>
  );
}

function FullScreenImageModal({ imageUrl, onClose }: { imageUrl: string | null; onClose: () => void }) {
  if (!imageUrl) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" onClick={onClose}>
      <button className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors" onClick={onClose} title="Cerrar">
        <span className="material-symbols-outlined text-4xl">close</span>
      </button>
      <img src={imageUrl} alt="Comprobante completo" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in duration-200" onClick={(e) => e.stopPropagation()} />
    </div>
  );
}
