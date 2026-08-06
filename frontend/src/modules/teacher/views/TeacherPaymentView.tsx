import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { httpClient } from '../../../core/api/httpClient';

export function TeacherPaymentView() {
  const navigate = useNavigate();
  
  // Loaded state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Profile data
  const [walletUrl, setWalletUrl] = useState<string>('');

  // Copy state
  const [copiedNormal, setCopiedNormal] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNormal(true);
    setTimeout(() => setCopiedNormal(false), 2000);
  };

  // Fetch existing details
  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        const res = await httpClient.request('/teachers/me');
        if (res.ok) {
          const data = await res.json();
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

      <main className="w-full max-w-md sm:max-w-lg md:max-w-4xl mx-auto p-4 pb-24 space-y-5">
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
            {!walletUrl && !error ? (
              <div className="bg-surface border border-border rounded-3xl p-8 shadow-soft flex flex-col items-center text-center">
                <span className="material-symbols-outlined text-4xl text-muted mb-3">account_balance_wallet</span>
                <p className="text-base font-bold text-text">No tienes medios de pago configurados</p>
                <p className="text-sm text-muted mt-2">Comunícate con el administrador para registrar tu Alias o CBU.</p>
              </div>
            ) : (
              <section className="bg-surface border border-border rounded-3xl p-6 shadow-soft space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined">badge</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold">Alias / CBU de Billetera Virtual</h3>
                    <p className="text-xs text-muted">Tus alumnos utilizarán estos datos para transferirte</p>
                  </div>
                </div>

                <div className="bg-background rounded-2xl border border-border p-4 flex items-center justify-between gap-3">
                  <div className="truncate flex-1">
                    <p className="text-[10px] text-muted font-bold uppercase tracking-wider mb-0.5">Alias / CBU</p>
                    <p className="text-text font-bold text-base select-all truncate">{walletUrl}</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => copyToClipboard(walletUrl)}
                    className={`shrink-0 flex items-center gap-1.5 rounded-xl px-3.5 py-2 font-bold text-xs transition-all active:scale-95 ${copiedNormal ? 'bg-success text-white' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}
                  >
                    <span className="material-symbols-outlined text-sm">{copiedNormal ? 'check' : 'content_copy'}</span>
                    <span>{copiedNormal ? '¡Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
