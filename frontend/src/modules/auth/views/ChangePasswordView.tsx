import { useChangePasswordForm } from '../hooks/useAuthForms';
import { BaseInput } from '../../../shared/components/BaseInput';
import { BaseButton } from '../../../shared/components/BaseButton';

export function ChangePasswordView() {
  const {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    error,
    isSaving,
    showPassword,
    togglePassword,
    submitChangePassword,
  } = useChangePasswordForm();

  return (
    <div className="min-h-screen bg-background text-text flex flex-col items-center px-6">
      <div className="w-full max-w-sm sm:max-w-md mt-16">
        <h2 className="text-2xl font-bold tracking-tight text-center">
          Actualizá tu contraseña
        </h2>
        <p className="text-sm text-muted mt-2 text-center">
          Por seguridad, necesitás definir una nueva contraseña para continuar.
        </p>
      </div>

      <form className="w-full max-w-sm sm:max-w-md mt-8 space-y-4" onSubmit={submitChangePassword}>
        <div className="relative">
          <BaseInput
            labelText="Nueva contraseña"
            leftIcon="lock"
            placeholder="••••••••"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            className="absolute right-4 top-[38px] text-muted hover:text-text transition-colors"
            type="button"
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            onClick={togglePassword}
          >
            <span className="material-symbols-outlined text-xl">
              {showPassword ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        </div>

        <BaseInput
          labelText="Confirmar contraseña"
          placeholder="••••••••"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        {error && (
          <div className="rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger text-center font-medium">
            {error}
          </div>
        )}

        <BaseButton
          type="submit"
          fullWidth
          disabled={isSaving || !password || !confirmPassword}
          className="h-[52px] mt-2"
        >
          {isSaving ? 'Guardando...' : 'Actualizar contraseña'}
        </BaseButton>
      </form>
    </div>
  );
}
