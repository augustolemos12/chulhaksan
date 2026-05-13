import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchMe, login } from './auth';

import logoColor from '../../assets/logo-color.png';

export function Login() {
  const navigate = useNavigate();

  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const sanitizeDni = (value: string) => value.replace(/\D/g, '');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(dni.trim(), password);
      const profile = await fetchMe();

      navigate(
        result?.mustChangePassword || profile?.mustChangePassword
          ? '/cambiar-contrasena'
          : '/dashboard'
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo iniciar sesión.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 transition-colors duration-300">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-8 inline-flex items-center text-muted hover:text-text transition-colors"
        >
          ← Volver
        </Link>

        <div className="rounded-3xl bg-surface p-10 shadow-soft border border-border">
          <div className="flex justify-center mb-8">
            <img
              src={logoColor}
              alt="Logo"
              className="h-28 object-contain"
            />
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold text-text">
              Bienvenida
            </h1>
            <p className="text-muted mt-2">
              Iniciá sesión para acceder al sistema
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="text"
              inputMode="numeric"
              placeholder="DNI"
              value={dni}
              onChange={(e) => setDni(sanitizeDni(e.target.value))}
              className="w-full h-14 rounded-2xl border border-border bg-background text-text px-5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
              required
            />

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-14 rounded-2xl border border-border bg-background text-text px-5 pr-14 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4 text-muted hover:text-text transition-colors"
              >
                <span className="material-symbols-outlined">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>

            {error && (
              <div className="rounded-xl bg-danger/10 border border-danger/20 p-4 text-danger text-sm font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-bold hover:shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-60"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}