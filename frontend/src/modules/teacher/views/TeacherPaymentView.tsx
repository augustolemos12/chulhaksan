import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { httpClient } from '../../../core/api/httpClient';

export function TeacherPaymentView() {
  const navigate = useNavigate();
  
  // Loaded state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Profile data
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [walletUrl, setWalletUrl] = useState<string>('');

  // Form upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Fetch existing details
  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        const res = await httpClient.request('/teachers/me');
        if (res.ok) {
          const data = await res.json();
          setQrCodeUrl(data.qrCodeUrl || null);
          setWalletUrl(data.walletUrl || '');
        } else {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || 'No se pudieron obtener los datos de pago.');
        }
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Error al cargar los datos.');
      } finally {
        setLoading(false);
      }
    };
    fetchPaymentDetails();
  }, []);

  const handleFileChange = (file: File) => {
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecciona un archivo de imagen (PNG, JPG, WEBP).');
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
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

  const handleRemovePreview = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    // Simple URL validation if provided
    if (walletUrl.trim() && !/^https?:\/\/[^\s$.?#].[^\s]*$/i.test(walletUrl.trim())) {
      setError('El enlace de la billetera virtual debe ser una dirección URL válida.');
      setSaving(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('walletUrl', walletUrl.trim());
      if (selectedFile) {
        formData.append('qrCode', selectedFile);
      }

      const res = await httpClient.request('/teachers/me/payment-info', {
        method: 'PATCH',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Error al guardar los datos de pago.');
      }

      const data = await res.json();
      setQrCodeUrl(data.qrCodeUrl || null);
      setWalletUrl(data.walletUrl || '');
      setSelectedFile(null);
      setPreviewUrl(null);
      setSuccess('Tus datos de pago se actualizaron correctamente.');
      
      // Auto clear success message after 4s
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Error al guardar los datos.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="flex items-center justify-between w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto p-4">
          <button
            className="flex size-10 items-center justify-center rounded-full hover:bg-surface transition-colors"
            type="button"
            onClick={() => navigate('/dashboard')}
            aria-label="Volver"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold">Configuración de Cobro</p>
            <h1 className="text-lg font-bold leading-tight">Cargar Datos de Pago</h1>
          </div>
          <div className="w-10" />
        </div>
      </header>

      <main className="w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto p-4 pb-24 space-y-5">
        {error && (
          <div className="bg-danger/10 border border-danger/20 text-danger rounded-2xl p-4 flex items-start gap-3 animate-fadeIn">
            <span className="material-symbols-outlined shrink-0">error</span>
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-success/10 border border-success/20 text-success rounded-2xl p-4 flex items-start gap-3 animate-fadeIn">
            <span className="material-symbols-outlined shrink-0 text-success">check_circle</span>
            <p className="text-sm font-semibold">{success}</p>
          </div>
        )}

        {loading ? (
          <div className="bg-surface border border-border rounded-3xl p-8 shadow-soft flex flex-col items-center justify-center min-h-[300px] gap-3">
            <div className="h-10 w-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <span className="text-sm text-muted font-medium">Obteniendo tus datos de cobro...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Wallet URL Input Card */}
            <section className="bg-surface border border-border rounded-3xl p-6 shadow-soft space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined">link</span>
                </div>
                <div>
                  <h3 className="text-base font-bold">Enlace de Billetera Virtual</h3>
                  <p className="text-xs text-muted">Redireccioná a tus alumnos a tu link de pago directo</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="wallet-url" className="text-xs font-bold text-muted uppercase tracking-wider ml-1">
                  URL de cobro (Mercado Pago, etc.)
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-muted text-[22px]">
                    account_balance_wallet
                  </span>
                  <input
                    id="wallet-url"
                    type="url"
                    className="w-full pl-12 pr-4 py-3.5 bg-background border border-border rounded-2xl focus:border-primary focus:outline-none text-sm transition-all duration-300 font-medium"
                    placeholder="https://link.mercadopago.com.ar/tu-alias"
                    value={walletUrl}
                    onChange={(e) => setWalletUrl(e.target.value)}
                  />
                </div>
                <p className="text-[10px] text-muted ml-1 leading-relaxed">
                  Tip: Pega tu link de cobro personalizado de Mercado Pago, Cuenta DNI o la billetera de tu preferencia para recibir transferencias de inmediato.
                </p>
              </div>
            </section>

            {/* QR Upload Card */}
            <section className="bg-surface border border-border rounded-3xl p-6 shadow-soft space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined">qr_code_2</span>
                </div>
                <div>
                  <h3 className="text-base font-bold">Código QR de Pago</h3>
                  <p className="text-xs text-muted">Subí tu QR para que los alumnos escaneen al abonar</p>
                </div>
              </div>

              {/* Current QR display if exists and no preview */}
              {qrCodeUrl && !previewUrl && (
                <div className="flex flex-col items-center justify-center p-4 bg-background rounded-2xl border border-border">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted mb-2">QR Actual Registrado</span>
                  <img
                    src={qrCodeUrl}
                    alt="QR Registrado"
                    className="h-44 w-44 object-contain bg-white p-2 rounded-xl border border-border shadow-sm"
                  />
                  <p className="text-xs text-muted mt-2">Para reemplazarlo, arrastra o selecciona un nuevo archivo debajo.</p>
                </div>
              )}

              {/* Upload Dropzone */}
              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={`
                  border-2 border-dashed rounded-2xl p-6 transition-all duration-300 flex flex-col items-center justify-center text-center cursor-pointer min-h-[160px]
                  ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
                `}
                onClick={() => document.getElementById('qr-upload-input')?.click()}
              >
                <input
                  id="qr-upload-input"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFileChange(e.target.files[0]);
                    }
                  }}
                />

                {!previewUrl ? (
                  <>
                    <span className="material-symbols-outlined text-4xl text-muted mb-2 transition-colors">
                      cloud_upload
                    </span>
                    <p className="text-sm font-bold text-text">Arrastrá tu código QR acá</p>
                    <p className="text-xs text-muted mt-1">o hacé clic para seleccionar un archivo</p>
                    <p className="text-[10px] text-muted mt-2">Formatos aceptados: PNG, JPG, WEBP (Máx. 5MB)</p>
                  </>
                ) : (
                  <div className="w-full flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
                    <img
                      src={previewUrl}
                      alt="Vista previa del nuevo QR"
                      className="h-36 w-36 object-contain bg-white p-2 rounded-xl border border-border mb-3 shadow-md animate-fadeIn"
                    />
                    <div className="max-w-[240px] truncate text-xs font-bold text-text">
                      {selectedFile?.name}
                    </div>
                    <div className="text-[10px] text-muted mt-0.5">
                      {(selectedFile!.size / (1024 * 1024)).toFixed(2)} MB (Nuevo archivo por subir)
                    </div>
                    <button
                      type="button"
                      onClick={handleRemovePreview}
                      className="mt-3 flex items-center gap-1 text-xs font-bold text-danger hover:text-red-700 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                      Cancelar reemplazo
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* Save Button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-gradient-to-r from-primary to-accent text-white font-bold py-3.5 px-6 rounded-xl shadow-md hover:shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none"
            >
              {saving ? (
                <>
                  <div className="h-5 w-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  <span>Guardando Datos...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">save</span>
                  <span>Guardar Datos de Pago</span>
                </>
              )}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
