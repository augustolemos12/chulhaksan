import { Link } from 'react-router-dom';
import { useAdminTeacherDetails } from '../hooks/useAdminTeacherDetails';
import { useState } from 'react';

export function AdminTeacherDetailsView() {
  const {
    teacher, loading, error, returnTo,
    isEditing, form, setForm, saving, editError, openEdit, closeEdit, handleSave,
    handleDelete, actionLoading, handleResetPassword, resetting, resetInfo,
    paymentSaving, paymentError, paymentSuccess, walletUrl, setWalletUrl, qrCodeUrl, previewUrl, selectedFile,
    lateFeeWalletUrl, setLateFeeWalletUrl, lateFeeQrCodeUrl, lateFeePreviewUrl, selectedLateFeeFile,
    handleFileChange, handleRemovePreview, handlePaymentSubmit,
  } = useAdminTeacherDetails();

  const [copiedReset, setCopiedReset] = useState(false);
  const copyResetPassword = () => {
    if (!resetInfo) return;
    navigator.clipboard.writeText(resetInfo);
    setCopiedReset(true);
    setTimeout(() => setCopiedReset(false), 2000);
  };

  const [isDraggingNormal, setIsDraggingNormal] = useState(false);
  const onDragOverNormal = (e: React.DragEvent) => { e.preventDefault(); setIsDraggingNormal(true); };
  const onDragLeaveNormal = () => setIsDraggingNormal(false);
  const onDropNormal = (e: React.DragEvent) => {
    e.preventDefault(); setIsDraggingNormal(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0], false);
    }
  };

  const [isDraggingLate, setIsDraggingLate] = useState(false);
  const onDragOverLate = (e: React.DragEvent) => { e.preventDefault(); setIsDraggingLate(true); };
  const onDragLeaveLate = () => setIsDraggingLate(false);
  const onDropLate = (e: React.DragEvent) => {
    e.preventDefault(); setIsDraggingLate(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0], true);
    }
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col max-w-[480px] sm:max-w-[640px] md:max-w-[800px] mx-auto overflow-x-hidden border-x border-gray-200 bg-background text-text">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md">
        <Link className="flex items-center gap-2 text-sm font-semibold text-text transition-opacity hover:opacity-70" to={returnTo}>
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Atrás
        </Link>
      </header>

      {loading && <div className="p-4 text-sm text-gray-500">Cargando profesor...</div>}
      {error && <div className="p-4 text-sm text-red-600">{error}</div>}

      {!loading && !error && teacher && (
        <>
          <div className="flex flex-col items-center pb-6 pt-8">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
              <span className="material-symbols-outlined text-4xl">badge</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">{teacher.firstName} {teacher.lastName}</h2>
          </div>

          <h3 className="text-text text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-2">
            Información Personal
          </h3>
          <div className="px-4 space-y-1">
            <div className="flex justify-between border-b border-gray-100 py-3">
              <div className="flex items-center gap-3"><span className="material-symbols-outlined text-gray-400">fingerprint</span><p className="text-sm font-medium">DNI</p></div>
              <p className="text-sm font-semibold">{teacher.dni ?? '-'}</p>
            </div>
            <div className="flex justify-between border-b border-gray-100 py-3">
              <div className="flex items-center gap-3"><span className="material-symbols-outlined text-gray-400">phone</span><p className="text-sm font-medium">Teléfono</p></div>
              <p className="text-sm font-semibold">{teacher.phone ?? '-'}</p>
            </div>
            <div className="flex justify-between border-b border-gray-100 py-3">
              <div className="flex items-center gap-3"><span className="material-symbols-outlined text-gray-400">mail</span><p className="text-sm font-medium">Correo electrónico</p></div>
              <p className="text-sm font-semibold">{teacher.email ?? '-'}</p>
            </div>
          </div>

          <div className="px-4 pt-4">
            <div className="bg-surface border border-border rounded-xl p-4 shadow-sm space-y-3">
              <p className="text-sm font-semibold">Acciones del administrador</p>
              
              {isEditing && (
                <form onSubmit={handleSave} className="space-y-3 border-b border-border pb-3 mb-3">
                  {editError && <div className="text-xs text-red-600 font-medium p-2 bg-red-50 rounded-lg">{editError}</div>}
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex flex-col"><span className="text-xs font-semibold mb-1">Nombre</span><input required className="rounded-lg border px-3 py-2 text-sm" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></label>
                    <label className="flex flex-col"><span className="text-xs font-semibold mb-1">Apellido</span><input required className="rounded-lg border px-3 py-2 text-sm" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></label>
                  </div>
                  <label className="flex flex-col"><span className="text-xs font-semibold mb-1">Teléfono</span><input className="rounded-lg border px-3 py-2 text-sm" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
                  <label className="flex flex-col"><span className="text-xs font-semibold mb-1">Correo electrónico</span><input type="email" className="rounded-lg border px-3 py-2 text-sm" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
                  <div className="flex gap-2">
                    <button type="submit" disabled={saving} className="flex-1 rounded-lg bg-primary text-white py-2 text-sm font-bold disabled:opacity-70">{saving ? 'Guardando...' : 'Guardar Cambios'}</button>
                    <button type="button" onClick={closeEdit} className="flex-1 rounded-lg border border-border bg-surface text-text py-2 text-sm font-bold">Cancelar</button>
                  </div>
                </form>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <button
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold disabled:opacity-70 ${isEditing ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-surface text-text'}`}
                  onClick={openEdit} disabled={saving}
                >
                  <span className="material-symbols-outlined text-base">edit</span>
                  Editar datos
                </button>
                <button className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-semibold text-text disabled:opacity-70" onClick={handleResetPassword} disabled={resetting}>
                  <span className="material-symbols-outlined text-base">key</span>
                  {resetting ? 'Reseteando...' : 'Resetear contraseña'}
                </button>
                <button className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-70" onClick={handleDelete} disabled={actionLoading !== null}>
                  <span className="material-symbols-outlined text-base">delete</span>
                  {actionLoading === 'delete' ? 'Eliminando...' : 'Eliminar profesor'}
                </button>
              </div>

              {resetInfo && (
                <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 flex items-center justify-between gap-2">
                  <span>Temporal: {resetInfo}</span>
                  <button className={`text-xs font-semibold transition-all ${copiedReset ? 'text-green-700 bg-green-100 px-2 py-1 rounded-md scale-[1.03]' : 'text-amber-700'}`} onClick={copyResetPassword}>
                    {copiedReset ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
              )}
            </div>
          </div>

          <h3 className="text-text text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-6">Configuración de Pagos</h3>
          <div className="px-4 pb-24">
            {paymentError && <div className="mb-4 bg-danger/10 border border-danger/20 text-danger rounded-2xl p-4 flex items-start gap-3"><span className="material-symbols-outlined shrink-0">error</span><p className="text-sm font-semibold">{paymentError}</p></div>}
            {paymentSuccess && <div className="mb-4 bg-success/10 border border-success/20 text-success rounded-2xl p-4 flex items-start gap-3"><span className="material-symbols-outlined shrink-0 text-success">check_circle</span><p className="text-sm font-semibold">{paymentSuccess}</p></div>}

            <form onSubmit={handlePaymentSubmit} className="space-y-5">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pago Normal */}
                <div className="space-y-5">
                  <h4 className="font-bold text-text mb-2 px-2 border-l-4 border-primary">Pago en Término (Normal)</h4>
                  <section className="bg-surface border border-border rounded-3xl p-6 shadow-soft space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0"><span className="material-symbols-outlined">link</span></div>
                      <div><h3 className="text-base font-bold">Enlace de Billetera</h3><p className="text-xs text-muted">URL directa de cobro normal</p></div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-muted text-[22px]">account_balance_wallet</span>
                        <input id="wallet-url" type="url" className="w-full pl-12 pr-4 py-3.5 bg-background border border-border rounded-2xl focus:border-primary focus:outline-none text-sm transition-all duration-300 font-medium" placeholder="https://link.mercadopago.com.ar/tu-alias" value={walletUrl} onChange={(e) => setWalletUrl(e.target.value)} />
                      </div>
                    </div>
                  </section>

                  <section className="bg-surface border border-border rounded-3xl p-6 shadow-soft space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0"><span className="material-symbols-outlined">qr_code_2</span></div>
                      <div><h3 className="text-base font-bold">Código QR Normal</h3><p className="text-xs text-muted">Imagen para escanear al abonar en término</p></div>
                    </div>

                    {qrCodeUrl && !previewUrl && (
                      <div className="flex flex-col items-center justify-center p-4 bg-background rounded-2xl border border-border">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-muted mb-2">QR Actual Registrado</span>
                        <img src={qrCodeUrl} alt="QR Registrado" className="h-44 w-44 object-contain bg-white p-2 rounded-xl border border-border shadow-sm" />
                      </div>
                    )}

                    <div
                      onDragOver={onDragOverNormal} onDragLeave={onDragLeaveNormal} onDrop={onDropNormal}
                      className={`border-2 border-dashed rounded-2xl p-6 transition-all duration-300 flex flex-col items-center justify-center text-center cursor-pointer min-h-[160px] ${isDraggingNormal ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                      onClick={() => document.getElementById('qr-upload-input')?.click()}
                    >
                      <input id="qr-upload-input" type="file" className="hidden" accept="image/*" onChange={(e) => { if (e.target.files && e.target.files.length > 0) handleFileChange(e.target.files[0], false); }} />
                      {!previewUrl ? (
                        <><span className="material-symbols-outlined text-4xl text-muted mb-2">cloud_upload</span><p className="text-sm font-bold text-text">Arrastrá un nuevo QR acá</p><p className="text-xs text-muted mt-1">o hacé clic para seleccionar un archivo</p></>
                      ) : (
                        <div className="w-full flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
                          <img src={previewUrl} alt="Vista previa del nuevo QR" className="h-36 w-36 object-contain bg-white p-2 rounded-xl border border-border mb-3 shadow-md" />
                          <div className="max-w-[240px] truncate text-xs font-bold text-text">{selectedFile?.name}</div>
                          <button type="button" onClick={() => handleRemovePreview(false)} className="mt-3 flex items-center gap-1 text-xs font-bold text-danger hover:text-red-700"><span className="material-symbols-outlined text-sm">delete</span>Cancelar reemplazo</button>
                        </div>
                      )}
                    </div>
                  </section>
                </div>

                {/* Pago Fuera de Término (Mora) */}
                <div className="space-y-5">
                  <h4 className="font-bold text-text mb-2 px-2 border-l-4 border-amber-500">Pago Fuera de Término (Mora)</h4>
                  <section className="bg-surface border border-border rounded-3xl p-6 shadow-soft space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0"><span className="material-symbols-outlined">link</span></div>
                      <div><h3 className="text-base font-bold">Enlace de Billetera (Mora)</h3><p className="text-xs text-muted">URL directa de cobro con mora incluida</p></div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-muted text-[22px]">account_balance_wallet</span>
                        <input id="late-wallet-url" type="url" className="w-full pl-12 pr-4 py-3.5 bg-background border border-border rounded-2xl focus:border-amber-500 focus:outline-none text-sm transition-all duration-300 font-medium" placeholder="https://link.mercadopago.com.ar/tu-alias-mora" value={lateFeeWalletUrl} onChange={(e) => setLateFeeWalletUrl(e.target.value)} />
                      </div>
                    </div>
                  </section>

                  <section className="bg-surface border border-border rounded-3xl p-6 shadow-soft space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0"><span className="material-symbols-outlined">qr_code_2</span></div>
                      <div><h3 className="text-base font-bold">Código QR de Mora</h3><p className="text-xs text-muted">Imagen para escanear al abonar con recargo</p></div>
                    </div>

                    {lateFeeQrCodeUrl && !lateFeePreviewUrl && (
                      <div className="flex flex-col items-center justify-center p-4 bg-background rounded-2xl border border-border">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-muted mb-2">QR de Mora Actual Registrado</span>
                        <img src={lateFeeQrCodeUrl} alt="QR Mora Registrado" className="h-44 w-44 object-contain bg-white p-2 rounded-xl border border-border shadow-sm" />
                      </div>
                    )}

                    <div
                      onDragOver={onDragOverLate} onDragLeave={onDragLeaveLate} onDrop={onDropLate}
                      className={`border-2 border-dashed rounded-2xl p-6 transition-all duration-300 flex flex-col items-center justify-center text-center cursor-pointer min-h-[160px] ${isDraggingLate ? 'border-amber-500 bg-amber-50' : 'border-border hover:border-amber-500/50'}`}
                      onClick={() => document.getElementById('late-qr-upload-input')?.click()}
                    >
                      <input id="late-qr-upload-input" type="file" className="hidden" accept="image/*" onChange={(e) => { if (e.target.files && e.target.files.length > 0) handleFileChange(e.target.files[0], true); }} />
                      {!lateFeePreviewUrl ? (
                        <><span className="material-symbols-outlined text-4xl text-muted mb-2">cloud_upload</span><p className="text-sm font-bold text-text">Arrastrá el QR con Mora acá</p><p className="text-xs text-muted mt-1">o hacé clic para seleccionar un archivo</p></>
                      ) : (
                        <div className="w-full flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
                          <img src={lateFeePreviewUrl} alt="Vista previa del nuevo QR Mora" className="h-36 w-36 object-contain bg-white p-2 rounded-xl border border-border mb-3 shadow-md" />
                          <div className="max-w-[240px] truncate text-xs font-bold text-text">{selectedLateFeeFile?.name}</div>
                          <button type="button" onClick={() => handleRemovePreview(true)} className="mt-3 flex items-center gap-1 text-xs font-bold text-danger hover:text-red-700"><span className="material-symbols-outlined text-sm">delete</span>Cancelar reemplazo</button>
                        </div>
                      )}
                    </div>
                  </section>
                </div>
              </div>

              <button type="submit" disabled={paymentSaving} className="w-full bg-gradient-to-r from-primary to-accent text-white font-bold py-3.5 px-6 rounded-xl shadow-md hover:shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none">
                {paymentSaving ? <><div className="h-5 w-5 rounded-full border-2 border-white/20 border-t-white animate-spin" /><span>Guardando...</span></> : <><span className="material-symbols-outlined text-lg">save</span><span>Guardar Datos de Pago</span></>}
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
