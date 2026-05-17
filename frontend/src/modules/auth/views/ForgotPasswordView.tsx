import { Link } from 'react-router-dom';
import { BaseInput } from '../../../shared/components/BaseInput';
import { BaseButton } from '../../../shared/components/BaseButton';

export function ForgotPasswordView() {
  return (
    <div className="min-h-screen bg-background text-text">
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center p-4 justify-between w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto">
          <Link className="text-text flex size-10 shrink-0 items-center justify-center" to="/login">
            <span className="material-symbols-outlined">arrow_back_ios</span>
          </Link>
          <h2 className="text-text text-lg font-bold leading-tight tracking-tight flex-1 text-center">
            Recuperar contraseña
          </h2>
          <div className="flex w-10 items-center justify-end">
            <span className="material-symbols-outlined">lock_reset</span>
          </div>
        </div>
      </header>

      <main className="w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto p-6 space-y-6">
        <section className="bg-surface rounded-2xl p-5 border border-border shadow-soft">
          <p className="text-sm text-muted leading-relaxed">
            Ingresá tu DNI y te vamos a enviar un enlace para crear una nueva contraseña.
          </p>
        </section>

        <section className="bg-surface rounded-2xl p-5 border border-border shadow-soft">
          <div className="flex flex-col gap-4">
            <BaseInput
              labelText="DNI"
              leftIcon="badge"
              placeholder="Ej: 12345678"
              inputMode="numeric"
              type="text"
            />

            <Link to="/recuperar/enviado" className="w-full">
              <BaseButton fullWidth className="h-[58px] gap-3">
                Enviar enlace
                <span className="material-symbols-outlined text-xl">send</span>
              </BaseButton>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
