import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { httpClient } from '../../../core/api/httpClient';

export function TeacherPaymentView() {
  const navigate = useNavigate();
  
  // Loaded state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Profile data
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [walletUrl, setWalletUrl] = useState<string>('');

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
            <h1 className="text-lg font-bold leading-tight">Mis Datos de Pago</h1>
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

        {loading ? (
          <div className="bg-surface border border-border rounded-3xl p-8 shadow-soft flex flex-col items-center justify-center min-h-[300px] gap-3">
            <div className="h-10 w-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <span className="text-sm text-muted font-medium">Obteniendo tus datos de cobro...</span>
          </div>
        ) : (
          <div className="space-y-5">
            {!walletUrl && !qrCodeUrl && !error && (
              <div className="bg-surface border border-border rounded-3xl p-8 shadow-soft flex flex-col items-center text-center">
                <span className="material-symbols-outlined text-4xl text-muted mb-3">account_balance_wallet</span>
                <p className="text-base font-bold text-text">No tienes medios de pago configurados</p>
                <p className="text-sm text-muted mt-2">Comunícate con el administrador para registrar tu link de cobro o código QR.</p>
              </div>
            )}

            {/* Wallet URL Card */}
            {walletUrl && (
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

                <div className="bg-background rounded-2xl border border-border p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                  <div className="truncate flex-1">
                    <p className="text-xs text-muted font-semibold uppercase tracking-wider mb-1">Tu enlace actual</p>
                    <a 
                      href={walletUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-medium text-sm truncate block"
                    >
                      {walletUrl}
                    </a>
                  </div>
                  <a 
                    href={walletUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="shrink-0 flex items-center gap-2 rounded-xl bg-primary/10 text-primary px-4 py-2 font-bold text-sm hover:bg-primary hover:text-white transition-colors"
                  >
                    <span>Abrir enlace</span>
                    <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                  </a>
                </div>
              </section>
            )}

            {/* QR Code Card */}
            {qrCodeUrl && (
              <section className="bg-surface border border-border rounded-3xl p-6 shadow-soft space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined">qr_code_2</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold">Código QR de Pago</h3>
                    <p className="text-xs text-muted">Tus alumnos pueden escanear este QR para abonar</p>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center p-6 bg-background rounded-2xl border border-border">
                  <img
                    src={qrCodeUrl}
                    alt="QR Registrado"
                    className="h-56 w-56 object-contain bg-white p-3 rounded-2xl border border-border shadow-sm mb-4"
                  />
                  <p className="text-sm font-bold text-text">QR configurado correctamente</p>
                  <p className="text-xs text-muted mt-1 text-center max-w-[280px]">
                    Si necesitás modificar este código, solicitá el cambio a tu administrador.
                  </p>
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
