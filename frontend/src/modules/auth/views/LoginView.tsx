import { Link } from 'react-router-dom';
import { useLoginForm } from '../hooks/useAuthForms';
import { BaseInput } from '../../../shared/components/BaseInput';
import { BaseButton } from '../../../shared/components/BaseButton';

import logoColor from '../../../assets/logo-color.png';

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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 transition-colors duration-300">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 inline-flex items-center text-muted hover:text-text transition-colors">
          ← Volver
        </Link>

        <div className="rounded-3xl bg-surface p-10 shadow-soft border border-border">
          <div className="flex justify-center mb-8">
            <img src={logoColor} alt="Logo" className="h-28 object-contain" />
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold text-text">Bienvenida</h1>
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
  );
}
