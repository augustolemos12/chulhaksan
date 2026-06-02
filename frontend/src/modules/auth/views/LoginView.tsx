import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLoginForm } from '../hooks/useAuthForms';
import { BaseInput } from '../../../shared/components/BaseInput';
import { BaseButton } from '../../../shared/components/BaseButton';
import { httpClient } from '../../../core/api/httpClient';

import logoColor from '../../../assets/logo-color.png';

interface MonthEvent {
  id: number;
  title: string;
  imageUrl: string;
}

export function LoginView() {
  const {
    dni,
    password,
    showPassword,
    error,
    isLoading,
    handleDniChange,
    setPassword,
    togglePassword,
    submitLogin,
  } = useLoginForm();

  const [event, setEvent] = useState<MonthEvent | null>(null);

  useEffect(() => {
    httpClient.get<MonthEvent>('/events')
      .then((data) => {
        if (data && data.imageUrl) {
          setEvent(data);
        }
      })
      .catch(() => {
        setEvent(null);
      });
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row transition-colors duration-300">
      {/* Columna Login */}
      <div className={`flex-1 flex flex-col items-center justify-center px-6 py-12 ${event ? 'w-full md:max-w-[50%]' : 'w-full max-w-md mx-auto'}`}>
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 inline-flex items-center text-muted hover:text-text transition-colors">
            ← Volver
          </Link>

          <div className="rounded-3xl bg-surface p-10 shadow-soft border border-border">
            <div className="flex justify-center mb-8">
              <img src={logoColor} alt="Logo" className="h-28 object-contain" />
            </div>

            <div className="text-center mb-8">
              <h1 className="text-3xl font-display font-bold text-text">Bienvenido</h1>
              <p className="text-muted mt-2">Iniciá sesión para acceder al sistema</p>
            </div>

            <form onSubmit={submitLogin} className="space-y-5">
              <BaseInput
                type="text"
                inputMode="numeric"
                placeholder="DNI"
                value={dni}
                onChange={(e) => handleDniChange(e.target.value)}
                required
              />

              <div className="relative">
                <BaseInput
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={togglePassword}
                  className="absolute right-4 top-4 text-muted hover:text-text transition-colors"
                  aria-label="Toggle password visibility"
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>

              {error && (
                <div className="rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger text-center font-medium">
                  {error}
                </div>
              )}

              <BaseButton
                type="submit"
                fullWidth
                disabled={isLoading || !dni || !password}
                className="mt-2 text-lg h-14"
              >
                {isLoading ? 'Ingresando...' : 'Ingresar'}
              </BaseButton>
            </form>
          </div>
        </div>
      </div>

      {/* Columna Evento (Desktop) */}
      {event && (
        <div className="flex-1 hidden md:flex items-center justify-center bg-surface/50 border-l border-border p-8 lg:p-12 xl:p-16">
          <div className="relative w-full max-w-lg max-h-[75vh] aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border border-border group">
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent z-10 pointer-events-none transition-opacity duration-300 group-hover:from-black"></div>
            <img 
              src={event.imageUrl} 
              alt={event.title} 
              className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
            />
            <div className="absolute bottom-0 left-0 p-8 lg:p-10 z-20 w-full">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-primary text-white rounded-full text-xs font-bold mb-3 uppercase tracking-wider shadow-glow">
                Evento del Mes
              </span>
              <h2 className="font-display text-3xl lg:text-4xl font-black text-white leading-tight drop-shadow-lg">
                {event.title}
              </h2>
            </div>
          </div>
        </div>
      )}

      {/* Tarjeta Evento (Mobile: abajo) */}
      {event && (
        <div className="md:hidden px-6 pb-12 w-full max-w-md mx-auto">
          <div className="overflow-hidden rounded-3xl relative group shadow-soft w-full border border-border">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 pointer-events-none"></div>
            <img 
              src={event.imageUrl} 
              alt={event.title} 
              className="w-full h-56 object-cover object-center"
            />
            <div className="absolute bottom-0 left-0 p-6 z-20 w-full">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary text-white rounded-full text-[10px] font-bold mb-2 uppercase tracking-wider shadow-soft">
                Evento del Mes
              </span>
              <h3 className="font-display text-2xl font-bold text-white leading-tight drop-shadow-md">
                {event.title}
              </h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
