import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchMe, login } from './auth';

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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-8 inline-flex items-center text-slate-600 hover:text-slate-900 transition"
        >
          ← Volver
        </Link>

        <div className="rounded-3xl bg-white p-10 shadow-xl border border-slate-100">
          <div className="flex justify-center mb-8">
            <img
              src="/assets/logo-color.png"
              alt="Logo"
              className="h-28 object-contain"
            />
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900">
              Bienvenida
            </h1>
            <p className="text-slate-500 mt-2">
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
              className="w-full h-14 rounded-2xl border border-slate-200 px-5"
              required
            />

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-14 rounded-2xl border border-slate-200 px-5 pr-14"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>

            {error && (
              <div className="rounded-2xl bg-red-50 p-4 text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-primary text-white font-semibold"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}