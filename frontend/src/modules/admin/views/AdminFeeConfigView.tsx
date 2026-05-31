import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminFeeConfig } from '../hooks/useAdminFeeConfig';

export function AdminFeeConfigView() {
  const {
    history,
    latestConfig,
    loading,
    error,
    saving,
    actionError,
    createFeeConfig,
    deleteFeeConfig
  } = useAdminFeeConfig();

  const [baseAmount, setBaseAmount] = useState('');
  const [lateFee, setLateFee] = useState('');
  const [validFrom, setValidFrom] = useState(() => new Date().toISOString().split('T')[0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!baseAmount || !lateFee || !validFrom) {
      alert('Todos los campos son obligatorios.');
      return;
    }
    
    const baseAmountNum = Number(baseAmount);
    const lateFeeNum = Number(lateFee);
    
    if (isNaN(baseAmountNum) || baseAmountNum <= 0 || isNaN(lateFeeNum) || lateFeeNum < 0) {
      alert('La cuota base debe ser mayor a 0 y el recargo debe ser mayor o igual a 0.');
      return;
    }

    // Convert date string to full ISO format string as expected by class-validator (IsDateString)
    const validFromISO = new Date(`${validFrom}T00:00:00`).toISOString();

    const success = await createFeeConfig(baseAmountNum, lateFeeNum, validFromISO);
    if (success) {
      setBaseAmount('');
      setLateFee('');
      setValidFrom(new Date().toISOString().split('T')[0]);
      alert('Configuración guardada exitosamente.');
    }
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('es-AR', { dateStyle: 'long' }).format(new Date(dateString));
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta configuración de cuota?')) {
      const success = await deleteFeeConfig(id);
      if (success) {
        alert('Configuración eliminada exitosamente.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-text">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center p-4 justify-between w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto">
          <Link className="text-text flex size-10 shrink-0 items-center justify-center" to="/dashboard">
            <span className="material-symbols-outlined">arrow_back_ios</span>
          </Link>
          <h1 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10">
            Cuota Global
          </h1>
        </div>
      </header>

      <main className="w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto p-4 pb-24 space-y-6">
        
        {loading ? (
          <div className="bg-surface p-4 rounded-xl text-sm text-muted border border-border text-center">
            Cargando configuración actual...
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-xl text-sm text-red-600 border border-red-200">
            {error}
          </div>
        ) : (
          <>
            {/* CUOTA ACTUAL */}
            <section className="bg-surface rounded-2xl border border-border shadow-soft p-5 space-y-4">
              <h2 className="text-sm uppercase tracking-[0.2em] text-primary font-bold">
                Configuración Vigente
              </h2>
              
              {latestConfig ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-background rounded-xl p-4 border border-border flex flex-col justify-center items-center">
                    <p className="text-xs text-muted mb-1 font-semibold uppercase tracking-wider">Cuota Base</p>
                    <p className="text-2xl font-bold text-text">{formatMoney(latestConfig.baseAmount)}</p>
                  </div>
                  <div className="bg-background rounded-xl p-4 border border-border flex flex-col justify-center items-center">
                    <p className="text-xs text-muted mb-1 font-semibold uppercase tracking-wider">Recargo Mora</p>
                    <p className="text-2xl font-bold text-[#9a4c4c]">{formatMoney(latestConfig.lateFee)}</p>
                  </div>
                  <div className="col-span-2 text-center pt-2">
                    <p className="text-xs text-muted">
                      Vigente desde el <span className="font-semibold text-text">{formatDate(latestConfig.validFrom)}</span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-muted">
                  <span className="material-symbols-outlined text-4xl mb-2 opacity-50">payments</span>
                  <p className="text-sm font-medium">No hay ninguna cuota configurada aún.</p>
                </div>
              )}
            </section>

            {/* FORMULARIO DE NUEVA CUOTA */}
            <section className="bg-surface rounded-2xl border border-border shadow-soft p-5 space-y-4">
              <h2 className="text-sm uppercase tracking-[0.2em] text-primary font-bold">
                Fijar Nueva Cuota
              </h2>
              <p className="text-xs text-muted">
                Establece un nuevo aumento. Los alumnos y profesores verán reflejado este precio a partir de la fecha de vigencia.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                {actionError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                    {actionError}
                  </div>
                )}
                
                <div className="space-y-1">
                  <label className="text-xs text-muted font-medium">Monto Base de la Cuota ($)</label>
                  <input 
                    type="number" 
                    min="0"
                    step="1"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:ring-1 focus:ring-primary outline-none" 
                    placeholder="Ej: 15000" 
                    value={baseAmount} 
                    onChange={(e) => setBaseAmount(e.target.value)} 
                    required 
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted font-medium">Monto de Recargo por Mora ($)</label>
                  <input 
                    type="number" 
                    min="0"
                    step="1"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:ring-1 focus:ring-primary outline-none" 
                    placeholder="Ej: 2000" 
                    value={lateFee} 
                    onChange={(e) => setLateFee(e.target.value)} 
                    required 
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted font-medium">Fecha de Vigencia (A partir de cuándo aplica)</label>
                  <input 
                    type="date" 
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:ring-1 focus:ring-primary outline-none" 
                    value={validFrom} 
                    onChange={(e) => setValidFrom(e.target.value)} 
                    required 
                  />
                </div>

                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="w-full rounded-xl bg-primary text-white text-sm font-semibold py-3 disabled:opacity-50 flex justify-center items-center gap-2 shadow-soft hover:shadow-md transition-all active:scale-[0.98]"
                  >
                    {saving ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">save</span>
                        Guardar Configuración
                      </>
                    )}
                  </button>
                </div>
              </form>
            </section>

            {/* HISTORIAL */}
            {history.length > 0 && (
              <section className="bg-surface rounded-2xl border border-border shadow-soft p-5 space-y-4">
                <h2 className="text-sm uppercase tracking-[0.2em] text-primary font-bold">
                  Historial de Configuraciones
                </h2>
                
                <div className="space-y-3">
                  {history.map((config) => (
                    <div key={config.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl border border-border bg-background">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-text">{formatMoney(config.baseAmount)}</span>
                        <span className="text-[11px] text-[#9a4c4c] font-medium">+ {formatMoney(config.lateFee)} mora</span>
                      </div>
                      <div className="text-xs text-muted flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                          {formatDate(config.validFrom)}
                        </div>
                        <button
                          onClick={() => handleDelete(config.id)}
                          disabled={saving}
                          className="flex items-center gap-1 text-red-500 hover:text-red-700 transition-colors mt-1 active:scale-95 disabled:opacity-50"
                          title="Eliminar configuración"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                          <span className="text-[11px] font-medium uppercase tracking-wider">Eliminar</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
