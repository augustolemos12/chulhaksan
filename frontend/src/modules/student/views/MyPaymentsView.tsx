import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { httpClient } from '../../../core/api/httpClient';
import { useStudentProfile } from '../hooks/useStudentProfile';

interface TeacherInfo {
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  walletUrl?: string;
  lateFeeWalletUrl?: string;
}

export function MyPaymentsView() {
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useStudentProfile();

  const [teacher, setTeacher] = useState<TeacherInfo | null>(null);
  const [loadingTeacher, setLoadingTeacher] = useState(true);

  const [latestConfig, setLatestConfig] = useState<any>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);

  const [currentFee, setCurrentFee] = useState<any>(null);
  const [loadingFee, setLoadingFee] = useState(true);

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'unpaid' | 'submitting' | 'pending_approval'>('unpaid');

  // Load info
  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const res = await httpClient.request('/students/me/teacher');
        if (res.ok) {
          const data = await res.json();
          setTeacher(data);
        }
      } catch (err) {
        console.error('Error fetching teacher info:', err);
      } finally {
        setLoadingTeacher(false);
      }
    };

    const fetchConfig = async () => {
      try {
        const res = await httpClient.request('/fee-config/latest');
        if (res.ok) {
          const data = await res.json();
          setLatestConfig(data);
        }
      } catch (err) {
        console.error('Error fetching fee config:', err);
      } finally {
        setLoadingConfig(false);
      }
    };

    fetchTeacher();
    fetchConfig();

    // Check if there's already a pending payment in sessionStorage for simulation
    const savedStatus = sessionStorage.getItem('chs-payment-simulation-status');
    if (savedStatus === 'pending_approval') {
      setPaymentStatus('pending_approval');
    }
  }, []);

  useEffect(() => {
    const fetchFee = async () => {
      if (profileLoading) return; // Wait until profile loading completes

      if (!profile?.id) {
        setLoadingFee(false);
        return;
      }

      try {
        const res = await httpClient.request(`/fees/student/${profile.id}`);
        if (res.ok) {
          const data = await res.json();
          const pending = data.find((f: any) => f.status === 'PENDING' || f.status === 'PARTIALLY_PAID');
          setCurrentFee(pending || null);
          if (pending && pending.payments && pending.payments.some((p: any) => p.status === 'PENDING')) {
            setPaymentStatus('pending_approval');
          }
        }
      } catch (err) {
        console.error('Error fetching fees:', err);
      } finally {
        setLoadingFee(false);
      }
    };

    fetchFee();
  }, [profile, profileLoading]);

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount);
  };

  const handleFileChange = (file: File) => {
    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleSubmitReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    // Si no hay cuota actual, usamos latestConfig para crear el monto
    const amount = currentFee?.totalAmount || latestConfig?.baseAmount || 12000;

    // Si currentFee es nulo, deberíamos crear la cuota o enviar el pago globalmente.
    // Como el endpoint /transactions/report requiere feeId, vamos a reportar que falta.
    if (!currentFee) {
      alert("Tu profesor o el administrador aún no ha generado la cuota de este mes. Por favor, solicitá que la generen para poder cargar el comprobante.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('feeId', String(currentFee.id));
      formData.append('amount', String(amount));
      formData.append('method', 'TRANSFER');

      const res = await httpClient.request('/transactions/report', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setPaymentStatus('pending_approval');
        sessionStorage.setItem('chs-payment-simulation-status', 'pending_approval');
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.message || 'Error al enviar el comprobante');
      }
    } catch (error) {
      console.error('Error enviando comprobante:', error);
      alert('Hubo un error de conexión al enviar el comprobante');
    } finally {
      setIsSubmitting(false);
    }
  };



  const teacherName = teacher ? `Prof. ${teacher.firstName} ${teacher.lastName}` : 'tu Instructor';
  const hasLateFee = !!currentFee?.lateFeeApplied;

  const [copiedAlias, setCopiedAlias] = useState(false);

  const copyAliasToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAlias(true);
    setTimeout(() => setCopiedAlias(false), 2000);
  };

  // Determine what to show
  const targetWallet = teacher?.walletUrl;

  return (
    <div className="min-h-screen bg-background text-text transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="flex items-center justify-between w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto p-4">
          <button
            className="flex size-10 items-center justify-center rounded-full hover:bg-surface transition-colors"
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Volver"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold">Cuota Mensual</p>
            <h1 className="text-lg font-bold leading-tight">Realizar Pago</h1>
          </div>
          <div className="w-10" />
        </div>
      </header>

      <main className="w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto p-4 pb-24 space-y-5">
        {/* Fee Status Card */}
        <section className="bg-surface border border-border rounded-3xl p-5 shadow-soft">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted">Período Actual</span>
              <h2 className="text-xl font-bold mt-0.5">Cuota de {new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}</h2>
            </div>
            <div className="text-right">
              <span className="text-xs text-muted block">Total a pagar</span>
              <span className="text-2xl font-black text-text">
                {loadingConfig || loadingFee ? (
                  <div className="h-6 w-24 bg-surface-hover animate-pulse rounded"></div>
                ) : currentFee ? (
                  formatMoney(currentFee.totalAmount)
                ) : latestConfig ? (
                  formatMoney(latestConfig.baseAmount)
                ) : (
                  'No fijado'
                )}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-muted">calendar_today</span>
              <span className="text-xs text-muted font-medium">Vence el 10 de este mes</span>
            </div>
            <div>
              {paymentStatus === 'pending_approval' ? (
                <span className="rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 text-xs font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  Pendiente de Aprobación
                </span>
              ) : (
                <span className="rounded-full bg-danger/10 text-danger px-3 py-1 text-xs font-bold uppercase tracking-wider">
                  Impago
                </span>
              )}
            </div>
          </div>
        </section>

        {paymentStatus === 'pending_approval' ? (
          /* Success / Pending Approval State */
          <section className="bg-surface border border-border rounded-3xl p-8 shadow-soft text-center space-y-4 animate-fadeIn">
            <div className="mx-auto h-20 w-20 rounded-full bg-green-50 text-green-600 flex items-center justify-center shadow-inner">
              <span className="material-symbols-outlined text-4xl">done_all</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-text">¡Comprobante enviado con éxito!</h3>
              <p className="mt-2 text-sm text-muted max-w-sm mx-auto leading-relaxed">
                Tu comprobante ha sido registrado. {teacherName} lo revisará en las próximas horas para confirmar tu pago.
              </p>
            </div>
            <div className="pt-4 flex flex-col gap-2">
              <Link
                to="/dashboard"
                className="w-full bg-primary hover:bg-accent text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition-all active:scale-[0.98] text-center"
              >
                Volver al Panel
              </Link>
            </div>
          </section>
        ) : (
          /* Unpaid State: Payment Alias + Upload Section */
          <>
            {/* Teacher Payment Alias Section */}
            <section className="bg-surface border border-border rounded-3xl p-6 shadow-soft space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined">badge</span>
                </div>
                <div>
                  <h3 className="text-base font-bold">Datos de Transferencia {hasLateFee && '(Mora)'}</h3>
                  <p className="text-xs text-muted">Transferí el monto a {teacherName}</p>
                  {hasLateFee && <p className="text-[10px] text-danger font-bold uppercase mt-1">Monto con recargo incluido</p>}
                </div>
              </div>

              {loadingTeacher ? (
                <div className="p-6 flex flex-col items-center justify-center gap-2">
                  <div className="h-8 w-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                  <span className="text-xs text-muted">Cargando datos de pago...</span>
                </div>
              ) : targetWallet ? (
                <div className="space-y-3">
                  <div className="bg-background rounded-2xl border border-border p-4 flex items-center justify-between gap-3">
                    <div className="truncate flex-1">
                      <p className="text-[10px] text-muted font-bold uppercase tracking-wider mb-0.5">Alias / CBU</p>
                      <p className="text-text font-black text-lg select-all truncate">{targetWallet}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyAliasToClipboard(targetWallet)}
                      className={`shrink-0 flex items-center gap-1.5 rounded-xl px-4 py-2.5 font-bold text-xs shadow-sm transition-all active:scale-95 ${copiedAlias ? 'bg-success text-white' : 'bg-primary text-white hover:bg-accent'}`}
                    >
                      <span className="material-symbols-outlined text-base">{copiedAlias ? 'check' : 'content_copy'}</span>
                      <span>{copiedAlias ? '¡Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-muted text-center">
                    Una vez realizada la transferencia, subí el comprobante debajo para que el profesor confirme tu pago.
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-background rounded-2xl border border-border text-center">
                  <p className="text-xs font-semibold text-text">Tu profesor aún no ha registrado su Alias o CBU.</p>
                  <p className="text-[11px] text-muted mt-1">Contactate directamente con {teacherName} para solicitar sus datos de pago.</p>
                </div>
              )}
            </section>

            {/* Upload Receipt Section */}
            <section className="bg-surface border border-border rounded-3xl p-6 shadow-soft space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined">receipt_long</span>
                </div>
                <div>
                  <h3 className="text-base font-bold">Subir Comprobante</h3>
                  <p className="text-xs text-muted">Notificá tu pago subiendo una captura de pantalla</p>
                </div>
              </div>

              <form onSubmit={handleSubmitReceipt} className="space-y-4">
                <div
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  className={`
                    border-2 border-dashed rounded-2xl p-6 transition-all duration-300 flex flex-col items-center justify-center text-center cursor-pointer min-h-[160px]
                    ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
                  `}
                  onClick={() => document.getElementById('file-upload-input')?.click()}
                >
                  <input
                    id="file-upload-input"
                    type="file"
                    className="hidden"
                    accept="image/*,application/pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleFileChange(e.target.files[0]);
                      }
                    }}
                  />

                  {!selectedFile ? (
                    <>
                      <span className="material-symbols-outlined text-4xl text-muted mb-2 group-hover:text-primary transition-colors">
                        cloud_upload
                      </span>
                      <p className="text-sm font-bold text-text">Arrastrá tu captura de pantalla acá</p>
                      <p className="text-xs text-muted mt-1">o hacé clic para seleccionar un archivo</p>
                      <p className="text-[10px] text-muted mt-2">Formatos aceptados: PNG, JPG (Max. 5MB)</p>
                    </>
                  ) : (
                    <div className="w-full flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="Vista previa del comprobante"
                          className="h-28 max-w-full object-contain rounded-lg border border-border mb-3 shadow-soft"
                        />
                      ) : (
                        <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                          <span className="material-symbols-outlined text-3xl">picture_as_pdf</span>
                        </div>
                      )}
                      <div className="max-w-[240px] truncate text-xs font-bold text-text">
                        {selectedFile.name}
                      </div>
                      <div className="text-[10px] text-muted mt-0.5">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="mt-3 flex items-center gap-1 text-xs font-bold text-danger hover:text-red-700 transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                        Quitar archivo
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!selectedFile || isSubmitting}
                  className="w-full bg-gradient-to-r from-primary to-accent text-white font-bold py-3.5 px-6 rounded-xl shadow-md hover:shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-5 w-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                      <span>Enviando comprobante...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg">send</span>
                      <span>Enviar Comprobante</span>
                    </>
                  )}
                </button>
              </form>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
